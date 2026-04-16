// ── SDR Agent — Teste de conversa simulada (5 turnos) ────────────────────────
//
// Executa uma conversa completa entre um SDR e um lead (Carlos, gerente de
// operações de uma distribuidora de alimentos) sem precisar subir o servidor.
// Chama processarMensagem() diretamente e imprime o resultado de cada turno.
//
// Uso: npx ts-node src/test.ts

import 'dotenv/config';
import { processarMensagem } from './agent';
import { SDRRequest, SDRResponse, Mensagem, DadosLead } from './types';

// ── Cenário de teste ─────────────────────────────────────────────────────────
//
// Persona do lead: Carlos Souza
// Cargo: Gerente de Operações
// Empresa: Distribuidora regional de alimentos, ~90 funcionários
// Dor: controle de pedidos e rotas no Excel — caos operacional
// Faturamento: R$ 12M/ano
// Urgência: expansão para novas regiões travada pelo problema

const TURNOS_DO_LEAD: string[] = [
  // Turno 1 — Apresentação / descoberta inicial
  'Oi, me passaram seu contato e queria saber mais sobre o que a TechFlow faz',

  // Turno 2 — Lead se apresenta e fala do negócio
  'Sou o Carlos, gerente de operações de uma distribuidora de alimentos aqui do interior de SP. ' +
    'Temos uns 90 funcionários e crescemos bastante nos últimos anos',

  // Turno 3 — Lead expõe a dor principal
  'Nosso maior problema é o controle de pedidos. ' +
    'A gente ainda usa muito Excel pra rastrear entregas e rotas, e tá virando um caos. ' +
    'Perco horas todo dia resolvendo confusão',

  // Turno 4 — Lead revela faturamento e urgência
  'A gente fatura uns R$ 12 milhões por ano e tô tentando abrir mais 3 filiais, ' +
    'mas com esse processo atual vai ser impossível escalar',

  // Turno 5 — Lead aceita próximo passo
  'Com certeza quero resolver isso logo. Podemos marcar uma conversa com o especialista de vocês?',
];

// ── Helpers de exibição ──────────────────────────────────────────────────────

const LINHA = '═'.repeat(70);
const SEPARADOR = '─'.repeat(70);

function statusEmoji(status: SDRResponse['status']): string {
  return { qualificando: '🔍', qualificado: '✅', desqualificado: '❌' }[status];
}

function printTurno(turno: number, lead: string, resposta: SDRResponse): void {
  console.log(`\n${LINHA}`);
  console.log(`  TURNO ${turno}/5`);
  console.log(LINHA);

  console.log(`\n👤  LEAD:\n    ${lead}\n`);
  console.log(`🤖  SDR (Marina):\n    ${resposta.resposta.replace(/\n/g, '\n    ')}\n`);
  console.log(SEPARADOR);
  console.log(
    `    Status: ${statusEmoji(resposta.status)} ${resposta.status.toUpperCase()}`
  );

  const dados = resposta.dados_coletados;
  const camposColetados = Object.entries(dados)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `      • ${k.padEnd(16)} ${v}`)
    .join('\n');

  if (camposColetados) {
    console.log(`    Dados coletados:\n${camposColetados}`);
  } else {
    console.log(`    Dados coletados: (nenhum ainda)`);
  }

  if (resposta.proximo_passo) {
    console.log(`\n    🎯 Próximo passo: ${resposta.proximo_passo}`);
  }
}

// ── Loop principal da conversa ────────────────────────────────────────────────

async function runTest(): Promise<void> {
  console.log(`\n${'▓'.repeat(70)}`);
  console.log('  SDR AGENT — SIMULAÇÃO DE CONVERSA COMPLETA (5 TURNOS)');
  console.log('  Produto: TechFlow  |  SDR: Marina  |  Lead: Carlos / Distribuidora');
  console.log(`${'▓'.repeat(70)}`);

  let historico: Mensagem[] = [];
  let dadosLead: DadosLead = {};

  for (let i = 0; i < TURNOS_DO_LEAD.length; i++) {
    const mensagem = TURNOS_DO_LEAD[i];

    const req: SDRRequest = {
      mensagem,
      historico,
      dados_lead: dadosLead,
    };

    try {
      const resposta = await processarMensagem(req);
      printTurno(i + 1, mensagem, resposta);

      // Propaga estado para o próximo turno
      historico = resposta.historico_atualizado;
      dadosLead = resposta.dados_coletados;

      // Pausa breve para não sobrecarregar a API em testes
      if (i < TURNOS_DO_LEAD.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(`\n❌  Erro no turno ${i + 1}: ${error.message}`);
      process.exit(1);
    }
  }

  // ── Resumo final ─────────────────────────────────────────────────────────

  console.log(`\n${'═'.repeat(70)}`);
  console.log('  RESUMO FINAL DA CONVERSA');
  console.log(`${'═'.repeat(70)}`);
  console.log(`\n  Total de turnos:   ${TURNOS_DO_LEAD.length}`);
  console.log(`  Mensagens no hist: ${historico.length}`);

  const statusFinal = historico.length > 0
    ? '(ver último turno acima)'
    : 'N/A';
  console.log(`  Dados coletados:`);
  Object.entries(dadosLead)
    .filter(([, v]) => v !== undefined && v !== '')
    .forEach(([k, v]) => console.log(`    • ${k.padEnd(18)} ${v}`));

  console.log(`\n  📋 Histórico resumido:`);
  historico.forEach((msg, idx) => {
    const prefixo = msg.role === 'user' ? '👤 Lead  ' : '🤖 Marina';
    const texto = msg.content.length > 80
      ? msg.content.slice(0, 80) + '…'
      : msg.content;
    console.log(`    [${String(idx + 1).padStart(2)}] ${prefixo}: ${texto}`);
  });

  console.log(`\n${'▓'.repeat(70)}\n`);
}

runTest().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
