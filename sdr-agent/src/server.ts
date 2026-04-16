// ── SDR Agent — REST API Server ──────────────────────────────────────────────
//
// POST /api/sdr
//   Body:     SDRRequest  { mensagem, historico, dados_lead, config? }
//   Response: SDRResponse { resposta, historico_atualizado, status, dados_coletados }
//
// GET /health → { ok: true }

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { processarMensagem } from './agent';
import { SDRRequest } from './types';

const app = express();
app.use(express.json());

// ── Rota principal ───────────────────────────────────────────────────────────

app.post('/api/sdr', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as SDRRequest;

    // Validação mínima de entrada
    if (!body?.mensagem || typeof body.mensagem !== 'string') {
      res.status(400).json({
        erro: 'Campo obrigatório ausente: "mensagem" (string)',
      });
      return;
    }

    const payload: SDRRequest = {
      mensagem: body.mensagem.trim(),
      historico: Array.isArray(body.historico) ? body.historico : [],
      dados_lead: body.dados_lead && typeof body.dados_lead === 'object'
        ? body.dados_lead
        : {},
      config: body.config,
    };

    const resposta = await processarMensagem(payload);
    res.json(resposta);
  } catch (err) {
    next(err);
  }
});

// ── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ── Tratamento de erros ──────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SDR Agent] Erro:', err.message);
  res.status(500).json({ erro: 'Erro interno do servidor', detalhe: err.message });
});

// ── Bootstrap ────────────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`✅  SDR Agent API rodando em http://localhost:${PORT}`);
  console.log(`    POST /api/sdr  — processa mensagem do lead`);
  console.log(`    GET  /health   — health check`);
});

export default app;
