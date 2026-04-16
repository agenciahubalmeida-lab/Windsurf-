// ── SDR Agent — Lógica principal ─────────────────────────────────────────────
//
// Usa tool_use forçado (tool_choice = tool) para que o Claude sempre retorne
// a resposta do SDR em formato estruturado via o tool "resposta_sdr", enquanto
// o texto da mensagem permanece completamente humano e consultivo.
//
// Fluxo por turno:
//   1. Monta array de messages (histórico texto + nova mensagem do lead)
//   2. Chama Claude com tool_choice forçado para "resposta_sdr"
//   3. Extrai o input do tool_use → { mensagem, status, dados_coletados }
//   4. Persiste histórico como texto puro (não como blocks de tool use)
//   5. Mescla dados_lead acumulados e retorna SDRResponse

import Anthropic from '@anthropic-ai/sdk';
import {
  SDRRequest,
  SDRResponse,
  RespostaToolInput,
  DadosLead,
  Mensagem,
} from './types';
import { defaultConfig, buildSystemPrompt } from './config';

// ── Definição do tool ────────────────────────────────────────────────────────

const RESPOSTA_SDR_TOOL: Anthropic.Tool = {
  name: 'resposta_sdr',
  description:
    'Registra a resposta consultiva do SDR ao lead. ' +
    'O campo "mensagem" é o que será enviado ao lead — deve soar 100% humano. ' +
    'Os demais campos são metadados de qualificação para uso interno.',
  input_schema: {
    type: 'object',
    properties: {
      mensagem: {
        type: 'string',
        description:
          'Texto da resposta do SDR para o lead. ' +
          'Tom natural, consultivo, sem robótica. Máximo 4 frases.',
      },
      status: {
        type: 'string',
        enum: ['qualificando', 'qualificado', 'desqualificado'],
        description:
          '"qualificando" enquanto coleta informações, ' +
          '"qualificado" quando todos os critérios foram atendidos, ' +
          '"desqualificado" quando o lead claramente não é fit.',
      },
      dados_coletados: {
        type: 'object',
        description:
          'Snapshot dos dados do lead conhecidos até este momento. ' +
          'Inclua APENAS campos que já foram explicitamente mencionados na conversa. ' +
          'Omita (não inclua) campos ainda desconhecidos — nunca use placeholders como "desconhecido" ou "N/A".',
        properties: {
          nome: {
            type: 'string',
            description: 'Primeiro nome ou nome completo do lead',
          },
          cargo: {
            type: 'string',
            description: 'Cargo / título (ex: "Gerente de Operações")',
          },
          empresa: {
            type: 'string',
            description: 'Nome da empresa do lead',
          },
          segmento: {
            type: 'string',
            description: 'Setor de atuação (ex: "Logística", "Varejo")',
          },
          tamanho_time: {
            type: 'string',
            description: 'Número de funcionários ou tamanho da equipe',
          },
          dor_principal: {
            type: 'string',
            description: 'Problema central identificado na conversa',
          },
          faturamento: {
            type: 'string',
            description: 'Faturamento anual aproximado',
          },
          urgencia: {
            type: 'string',
            description: 'Urgência para resolver o problema (ex: "imediata", "3-6 meses")',
          },
        },
        additionalProperties: false,
      },
      proximo_passo: {
        type: 'string',
        description:
          'Próximo passo proposto ao lead. ' +
          'Preencher SOMENTE quando status = "qualificado".',
      },
    },
    required: ['mensagem', 'status', 'dados_coletados'],
    additionalProperties: false,
  },
};

// ── Instância do cliente Anthropic ──────────────────────────────────────────
//
// Suporta dois modos de autenticação:
//   1. ANTHROPIC_API_KEY   → chave API padrão (sk-ant-api...)
//   2. ANTHROPIC_AUTH_TOKEN → OAuth / session token (sk-ant-si...)
//      Útil em ambientes Claude Code onde o token é provido via OAuth

function createClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN;

  if (authToken || (apiKey && apiKey.startsWith('sk-ant-si'))) {
    // OAuth / session token — usa o header Authorization: Bearer
    return new Anthropic({ authToken: authToken ?? apiKey, apiKey: null as unknown as string });
  }
  // API key padrão — o SDK lê ANTHROPIC_API_KEY automaticamente
  return new Anthropic();
}

const client = createClient();

// ── Função principal ─────────────────────────────────────────────────────────

export async function processarMensagem(req: SDRRequest): Promise<SDRResponse> {
  const config = { ...defaultConfig, ...req.config };

  // ── 1. Monta mensagens para a API ─────────────────────────────────────────
  //
  // O histórico é armazenado como texto puro (sem estruturas de tool_use),
  // o que simplifica o protocolo da API e mantém o cliente desacoplado.

  const messages: Anthropic.MessageParam[] = [
    // Histórico dos turnos anteriores
    ...req.historico.map(
      (msg: Mensagem): Anthropic.MessageParam => ({
        role: msg.role,
        content: msg.content,
      })
    ),
    // Nova mensagem do lead
    { role: 'user', content: req.mensagem },
  ];

  // ── 2. Contexto interno dos dados já coletados ────────────────────────────
  //
  // Injeta um bloco de contexto ao final do system prompt (não no histórico)
  // para que o Claude saiba o que já foi coletado sem expor ao lead.

  const dadosContexto =
    Object.values(req.dados_lead).some((v) => v !== undefined && v !== '')
      ? `\n\n[CONTEXTO INTERNO — dados do lead coletados até agora]\n${JSON.stringify(
          req.dados_lead,
          null,
          2
        )}\n[FIM DO CONTEXTO INTERNO]`
      : '';

  const systemPrompt = buildSystemPrompt(config) + dadosContexto;

  // ── 3. Chama a API com tool_choice forçado ────────────────────────────────
  //
  // tool_choice: {type: "tool", name: "resposta_sdr"} garante que o Claude
  // sempre retorna a resposta através do tool, independente do contexto.
  // Isso nos dá estrutura confiável em 100% das respostas.

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    tools: [RESPOSTA_SDR_TOOL],
    tool_choice: { type: 'tool', name: 'resposta_sdr' },
    messages,
  });

  // ── 4. Extrai o resultado do tool_use ─────────────────────────────────────

  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  );

  if (!toolUseBlock) {
    throw new Error(
      'Resposta inesperada do modelo: nenhum bloco tool_use encontrado. ' +
        `stop_reason=${response.stop_reason}`
    );
  }

  const resultado = toolUseBlock.input as RespostaToolInput;

  // ── 5. Atualiza histórico (texto puro) ────────────────────────────────────

  const historicoAtualizado: Mensagem[] = [
    ...req.historico,
    { role: 'user', content: req.mensagem },
    { role: 'assistant', content: resultado.mensagem },
  ];

  // ── 6. Mescla dados do lead (acumulativo) ────────────────────────────────
  //
  // Mantém valores existentes e adiciona/substitui apenas campos com valor real.
  // Descarta placeholders que o modelo possa gerar (<UNKNOWN>, N/A, etc.).

  const PLACEHOLDERS = new Set([
    '<unknown>', 'unknown', 'n/a', 'não informado', 'nao informado',
    'não disponível', 'nao disponivel', '-', '—',
  ]);

  const isValorReal = (v: string | undefined): boolean =>
    v !== undefined && v !== '' && !PLACEHOLDERS.has(v.toLowerCase().replace(/[<>]/g, ''));

  const novosDados: DadosLead = { ...resultado.dados_coletados };
  const dadosMesclados: DadosLead = {
    ...req.dados_lead,
    ...Object.fromEntries(
      Object.entries(novosDados).filter(([, v]) => isValorReal(v))
    ),
  };

  return {
    resposta: resultado.mensagem,
    historico_atualizado: historicoAtualizado,
    status: resultado.status,
    dados_coletados: dadosMesclados,
    proximo_passo: resultado.proximo_passo,
  };
}
