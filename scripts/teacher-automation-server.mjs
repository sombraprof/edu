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
const requiredToken = (process.env.TEACHER_SERVICE_TOKEN ?? '').trim();
const authenticationEnabled = requiredToken.length > 0;

function jsonResponse(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Teacher-Token',
  });
  res.end(body);
}

function handleOptions(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Teacher-Token',
  });
  res.end();
}

function extractToken(headerValue) {
  if (Array.isArray(headerValue)) {
    return headerValue.find((value) => typeof value === 'string') ?? '';
  }
  if (typeof headerValue === 'string') {
    return headerValue;
  }
  return '';
}

function ensureAuthenticated(req, res) {
  if (!authenticationEnabled) {
    return true;
  }

  const provided = extractToken(req.headers['x-teacher-token']).trim();
  if (provided && provided === requiredToken) {
    return true;
  }

  jsonResponse(res, 401, {
    error:
      'Autenticação obrigatória. Inclua o header X-Teacher-Token com o token configurado no serviço.',
  });
  return false;
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

async function runCommand(command, args) {
  return new Promise((resolveExec, rejectExec) => {
    const child = spawn(command, args, {
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
      resolveExec({
        exitCode: code ?? 0,
        stdout,
        stderr,
      });
    });
  });
}

async function executeScript(config) {
  const startedAt = new Date();
  const { exitCode, stdout, stderr } = await runCommand(config.command, config.args);
  const finishedAt = new Date();
  return {
    key: config.key,
    command: config.displayCommand,
    exitCode,
    output: `${stdout}${stderr}`,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    reportKey: config.reportKey,
  };
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

function parseGitStatusSummary(summaryLine) {
  const summary = summaryLine.replace(/^##\s*/, '').trim();
  const payload = {
    branch: null,
    upstream: null,
    ahead: 0,
    behind: 0,
    detached: false,
  };

  if (!summary) {
    return payload;
  }

  const bracketMatch = summary.match(/\[(.+)]$/);
  let remainder = summary;
  if (bracketMatch) {
    const indicators = bracketMatch[1].split(',');
    indicators.forEach((indicator) => {
      const normalized = indicator.trim();
      if (normalized.startsWith('ahead ')) {
        const value = Number.parseInt(normalized.slice(6).trim(), 10);
        payload.ahead = Number.isFinite(value) ? value : 0;
      } else if (normalized.startsWith('behind ')) {
        const value = Number.parseInt(normalized.slice(7).trim(), 10);
        payload.behind = Number.isFinite(value) ? value : 0;
      }
    });
    remainder = remainder.slice(0, bracketMatch.index).trim();
  }

  if (remainder.includes('...')) {
    const [branch, upstream] = remainder.split('...');
    payload.branch = branch?.trim() ?? null;
    payload.upstream = upstream?.trim() ?? null;
  } else if (remainder.includes('no branch')) {
    payload.detached = true;
    payload.branch = remainder.trim();
  } else {
    payload.branch = remainder.trim();
  }

  return payload;
}

function parseGitChange(line) {
  const status = line.slice(0, 2);
  const remainder = line.slice(3).trim();
  if (status.startsWith('R')) {
    const [from, to] = remainder.split(' -> ').map((part) => part.trim());
    return {
      status: status.trim(),
      path: to ?? remainder,
      renamedFrom: from ?? null,
      renamedTo: to ?? null,
    };
  }

  return {
    status: status.trim(),
    path: remainder,
    renamedFrom: null,
    renamedTo: null,
  };
}

function parseGitStatusOutput(stdout) {
  const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
  const summaryLine = lines.shift();
  const summary = summaryLine ? parseGitStatusSummary(summaryLine) : {};
  const changes = lines.map((line) => parseGitChange(line));

  return {
    ...summary,
    changes,
    clean: changes.length === 0,
    raw: stdout,
  };
}

async function captureGitStatus() {
  const { exitCode, stdout, stderr } = await runCommand('git', ['status', '--short', '--branch']);

  if (exitCode !== 0) {
    const error = new Error('Falha ao executar git status.');
    error.details = stderr || stdout;
    error.exitCode = exitCode;
    throw error;
  }

  return parseGitStatusOutput(stdout);
}

function isSafeGitToken(value) {
  return /^[A-Za-z0-9._/-]+$/.test(value);
}

async function serveGitStatus(res) {
  try {
    const status = await captureGitStatus();
    jsonResponse(res, 200, status);
  } catch (error) {
    const details =
      error && typeof error === 'object' && 'details' in error && typeof error.details === 'string'
        ? error.details
        : error instanceof Error
          ? error.message
          : String(error);
    jsonResponse(res, 500, {
      error: 'Falha ao consultar o Git no workspace atual.',
      details,
    });
  }
}

async function serveGitFetch(req, res) {
  try {
    const body = await parseRequestBody(req);
    const remoteInput = typeof body.remote === 'string' ? body.remote.trim() : '';
    const branchInput =
      body.branch === null || body.branch === undefined
        ? body.branch
        : typeof body.branch === 'string'
          ? body.branch.trim()
          : '';

    const remote = remoteInput || 'origin';
    const branch = branchInput === null ? null : branchInput || 'main';

    if (!isSafeGitToken(remote)) {
      jsonResponse(res, 400, {
        error: 'Nome de remote inválido. Use apenas letras, números, ., -, _ e /.',
      });
      return;
    }

    if (branch !== null && !isSafeGitToken(branch)) {
      jsonResponse(res, 400, {
        error: 'Nome de branch inválido. Use apenas letras, números, ., -, _ e /.',
      });
      return;
    }

    const args = branch === null ? ['fetch', remote] : ['fetch', remote, branch];
    const { exitCode, stdout, stderr } = await runCommand('git', args);
    const success = exitCode === 0;

    let status = null;
    if (success) {
      try {
        status = await captureGitStatus();
      } catch (statusError) {
        status = null;
      }
    }

    jsonResponse(res, 200, {
      success,
      exitCode,
      stdout,
      stderr,
      remote,
      branch,
      command: `git ${args.join(' ')}`,
      status,
    });
  } catch (error) {
    const details =
      error && typeof error === 'object' && 'details' in error && typeof error.details === 'string'
        ? error.details
        : error instanceof Error
          ? error.message
          : String(error);
    jsonResponse(res, 500, {
      error: 'Falha ao buscar atualizações do repositório remoto.',
      details,
    });
  }
}

async function serveGitCheckout(req, res) {
  try {
    const body = await parseRequestBody(req);

    const branchInput = typeof body.branch === 'string' ? body.branch.trim() : '';
    if (!branchInput) {
      jsonResponse(res, 400, { error: 'Informe o nome da branch desejada.' });
      return;
    }

    if (!isSafeGitToken(branchInput)) {
      jsonResponse(res, 400, {
        error: 'Nome de branch inválido. Use apenas letras, números, ., -, _ e /.',
      });
      return;
    }

    const create = Boolean(body.create);

    let startPoint = '';
    if (Object.prototype.hasOwnProperty.call(body, 'startPoint')) {
      if (body.startPoint === null || body.startPoint === undefined) {
        startPoint = '';
      } else if (typeof body.startPoint === 'string') {
        startPoint = body.startPoint.trim();
      } else {
        jsonResponse(res, 400, {
          error: 'Ponto de partida inválido. Informe uma string, null ou deixe ausente.',
        });
        return;
      }
    } else if (create) {
      startPoint = 'main';
    }

    if (startPoint && !isSafeGitToken(startPoint)) {
      jsonResponse(res, 400, {
        error: 'Ponto de partida inválido. Use apenas letras, números, ., -, _ e /.',
      });
      return;
    }

    const args = ['checkout'];
    if (create) {
      args.push('-b');
    }
    args.push(branchInput);
    if (startPoint) {
      args.push(startPoint);
    }

    const { exitCode, stdout, stderr } = await runCommand('git', args);
    const success = exitCode === 0;

    let status = null;
    if (success) {
      try {
        status = await captureGitStatus();
      } catch (statusError) {
        status = null;
      }
    }

    jsonResponse(res, 200, {
      success,
      exitCode,
      stdout,
      stderr,
      branch: branchInput,
      create,
      startPoint: startPoint || null,
      command: `git ${args.join(' ')}`,
      status,
    });
  } catch (error) {
    const details =
      error && typeof error === 'object' && 'details' in error && typeof error.details === 'string'
        ? error.details
        : error instanceof Error
          ? error.message
          : String(error);
    jsonResponse(res, 500, {
      error: 'Falha ao preparar a branch solicitada.',
      details,
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

  if (url.pathname.startsWith('/api/teacher/')) {
    if (!ensureAuthenticated(req, res)) {
      return;
    }
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

  if (url.pathname === '/api/teacher/git/fetch' && req.method === 'POST') {
    await serveGitFetch(req, res);
    return;
  }

  if (url.pathname === '/api/teacher/git/checkout' && req.method === 'POST') {
    await serveGitCheckout(req, res);
    return;
  }

  if (url.pathname === '/api/teacher/git/status' && req.method === 'GET') {
    await serveGitStatus(res);
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
  if (authenticationEnabled) {
    console.log('Authentication via X-Teacher-Token is enabled.');
  } else {
    console.log('Authentication is disabled. Set TEACHER_SERVICE_TOKEN to require a token.');
  }
});
