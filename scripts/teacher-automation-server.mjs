#!/usr/bin/env node
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const scriptConfigs = {
  content: {
    key: 'content',
    command: process.execPath,
    args: [resolve(__dirname, 'validate-content.mjs')],
    displayCommand: 'npm run validate:content',
    description: 'Valida JSON de aulas, exercícios e suplementos.',
    reportKey: null,
  },
  report: {
    key: 'report',
    command: process.execPath,
    args: [resolve(__dirname, 'validate-content.mjs'), '--report'],
    displayCommand: 'npm run validate:report',
    description: 'Gera reports/content-validation-report.json.',
    reportKey: 'validation',
  },
  observability: {
    key: 'observability',
    command: process.execPath,
    args: [resolve(__dirname, 'report-content-metrics.mjs'), '--check'],
    displayCommand: 'npm run report:observability:check',
    description: 'Atualiza métricas de observabilidade do conteúdo.',
    reportKey: 'observability',
  },
  governance: {
    key: 'governance',
    command: process.execPath,
    args: [resolve(__dirname, 'generate-governance-alert.mjs')],
    displayCommand: 'npm run report:governance',
    description: 'Produz alertas de governança consolidados.',
    reportKey: 'governance',
  },
};

const reportFiles = {
  validation: resolve(projectRoot, 'reports/content-validation-report.json'),
  observability: resolve(projectRoot, 'reports/content-observability.json'),
  governance: resolve(projectRoot, 'reports/governance-alert.json'),
};

const historyFile = resolve(projectRoot, 'reports/teacher-script-history.json');
const parsedHistoryLimit = Number(process.env.TEACHER_SERVICE_HISTORY_LIMIT ?? 50);
const historyLimit =
  Number.isFinite(parsedHistoryLimit) && parsedHistoryLimit > 0 ? parsedHistoryLimit : 50;

const port = Number(process.env.TEACHER_SERVICE_PORT ?? 4178);
const host = process.env.TEACHER_SERVICE_HOST ?? '127.0.0.1';

function jsonResponse(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function handleOptions(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end();
}

function parseRequestBody(req) {
  return new Promise((resolveBody, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      if (!raw) {
        resolveBody({});
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        resolveBody(parsed);
      } catch (error) {
        reject(new Error('Corpo da requisição inválido. Envie JSON válido.'));
      }
    });
    req.on('error', reject);
  });
}

async function executeScript(config) {
  const startedAt = new Date();
  return new Promise((resolveExec, rejectExec) => {
    const child = spawn(config.command, config.args, {
      cwd: projectRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      rejectExec(error);
    });

    child.on('close', (code) => {
      const finishedAt = new Date();
      resolveExec({
        key: config.key,
        command: config.displayCommand,
        exitCode: code ?? 0,
        output: `${stdout}${stderr}`,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        reportKey: config.reportKey,
      });
    });
  });
}

async function readHistory() {
  try {
    const content = await readFile(historyFile, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.is(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function appendHistory(entry) {
  const history = await readHistory();
  const payload = {
    ...entry,
    recordedAt: new Date().toISOString(),
    success: entry.exitCode === 0,
  };
  const nextHistory = [payload, ...history].slice(0, Math.max(historyLimit, 1));
  await writeFile(historyFile, JSON.stringify(nextHistory, null, 2), 'utf-8');
  return payload;
}

async function serveHistory(res, key) {
  try {
    const history = await readHistory();
    const filtered = key ? history.filter((entry) => entry.key === key) : history;
    jsonResponse(res, 200, filtered);
  } catch (error) {
    jsonResponse(res, 500, {
      error: 'Não foi possível carregar o histórico de execuções.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

async function serveScriptRun(req, res) {
  try {
    const body = await parseRequestBody(req);
    const { key } = body;
    if (!key || typeof key !== 'string' || !(key in scriptConfigs)) {
      jsonResponse(res, 400, { error: 'Script desconhecido. Informe uma chave válida.' });
      return;
    }

    const config = scriptConfigs[key];
    const result = await executeScript(config);
    const historyEntry = await appendHistory(result);
    jsonResponse(res, 200, historyEntry);
  } catch (error) {
    jsonResponse(res, 500, {
      error: 'Falha ao executar o script solicitado.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

async function serveReport(req, res, reportKey) {
  try {
    const file = reportFiles[reportKey];
    if (!file) {
      jsonResponse(res, 404, { error: 'Relatório não encontrado.' });
      return;
    }
    const content = await readFile(file, 'utf-8');
    jsonResponse(res, 200, JSON.parse(content));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      jsonResponse(res, 404, { error: 'Relatório ainda não foi gerado.' });
      return;
    }
    jsonResponse(res, 500, {
      error: 'Não foi possível ler o relatório solicitado.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

function listScripts(res) {
  const payload = Object.values(scriptConfigs).map((config) => ({
    key: config.key,
    command: config.displayCommand,
    description: config.description,
    reportKey: config.reportKey,
  }));
  jsonResponse(res, 200, payload);
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    jsonResponse(res, 404, { error: 'Rota não encontrada.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    handleOptions(res);
    return;
  }

  const url = new URL(req.url, `http://${host}:${port}`);

  if (url.pathname === '/health') {
    jsonResponse(res, 200, { status: 'ok' });
    return;
  }

  if (url.pathname === '/api/teacher/scripts' && req.method === 'GET') {
    listScripts(res);
    return;
  }

  if (url.pathname === '/api/teacher/scripts/run' && req.method === 'POST') {
    await serveScriptRun(req, res);
    return;
  }

  if (url.pathname === '/api/teacher/scripts/history' && req.method === 'GET') {
    const key = url.searchParams.get('key');
    await serveHistory(res, typeof key === 'string' && key.length > 0 ? key : null);
    return;
  }

  if (url.pathname.startsWith('/api/teacher/reports/') && req.method === 'GET') {
    const key = url.pathname.split('/').pop();
    if (key && key in reportFiles) {
      await serveReport(req, res, key);
      return;
    }
    jsonResponse(res, 404, { error: 'Relatório não encontrado.' });
    return;
  }

  jsonResponse(res, 404, { error: 'Rota não encontrada.' });
});

server.listen(port, host, () => {
  console.log(`Professor automation service listening on http://${host}:${port}`);
});
