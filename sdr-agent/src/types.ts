// ── SDR Agent — Types ────────────────────────────────────────────────────────

export type StatusLead = 'qualificando' | 'qualificado' | 'desqualificado';

/** Campos coletados ao longo da conversa */
export interface DadosLead {
  nome?: string;
  cargo?: string;
  empresa?: string;
  segmento?: string;
  tamanho_time?: string;
  dor_principal?: string;
  faturamento?: string;
  urgencia?: string;
}

/** Mensagem individual no histórico da conversa */
export interface Mensagem {
  role: 'user' | 'assistant';
  content: string;
}

/** Configuração da identidade do SDR — personalizável por cliente */
export interface SDRConfig {
  /** Nome do SDR (ex: "Marina", "João") */
  nome_sdr: string;
  /** Nome da empresa que o SDR representa */
  empresa: string;
  /** Descrição do produto/serviço */
  produto: string;
  /** Próximo passo proposto quando o lead é qualificado */
  proximo_passo: string;
  /** Critérios de qualificação em texto natural */
  criterios_qualificacao: string;
  /** Tom de voz e estilo de comunicação */
  tom_de_voz: string;
}

/** Body da requisição POST /api/sdr */
export interface SDRRequest {
  /** Nova mensagem do lead */
  mensagem: string;
  /** Histórico completo da conversa (texto puro, sem estrutura de tools) */
  historico: Mensagem[];
  /** Dados já coletados em turnos anteriores */
  dados_lead: DadosLead;
  /** Sobrescreve configurações padrão do SDR (opcional) */
  config?: Partial<SDRConfig>;
}

/** Resposta do endpoint POST /api/sdr */
export interface SDRResponse {
  /** Resposta natural do SDR para enviar ao lead */
  resposta: string;
  /** Histórico atualizado incluindo este turno (para passar no próximo request) */
  historico_atualizado: Mensagem[];
  /** Status atual da qualificação */
  status: StatusLead;
  /** Todos os dados coletados até agora (acumulativo) */
  dados_coletados: DadosLead;
  /** Próximo passo proposto (presente quando status = "qualificado") */
  proximo_passo?: string;
}

/** Estrutura do tool_use retornado pelo Claude (input do tool resposta_sdr) */
export interface RespostaToolInput {
  mensagem: string;
  status: StatusLead;
  dados_coletados: DadosLead;
  proximo_passo?: string;
}
