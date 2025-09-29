#!/usr/bin/env node
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';
import { readFile, writeFile, stat } from 'node:fs/promises';

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

function parseBooleanEnv(value, fallback) {
  if (value === undefined) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }
  if (['1', 'true', 'yes', 'y', 'enable', 'enabled'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'n', 'disable', 'disabled'].includes(normalized)) {
    return false;
  }
  return fallback;
}

const prTokenEnv = (process.env.TEACHER_SERVICE_PR_TOKEN ?? '').trim();
const prTokenFile = (process.env.TEACHER_SERVICE_PR_TOKEN_FILE ?? '').trim();
const prDefaultBaseBranch =
  (process.env.TEACHER_SERVICE_PR_DEFAULT_BASE ?? 'main').trim() || 'main';
const prActorAllowlist = new Set(
  (process.env.TEACHER_SERVICE_PR_ALLOWLIST ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
);
const prMaintainerEditDefault = parseBooleanEnv(
  process.env.TEACHER_SERVICE_PR_ALLOW_MAINTAINER_EDIT,
  true
);

const scriptQueue = [];
let scriptQueueRunning = false;

function getPendingScriptsCount() {
  return scriptQueue.length + (scriptQueueRunning ? 1 : 0);
}

function enqueueScriptExecution(executor) {
  return new Promise((resolveExec, rejectExec) => {
    scriptQueue.push({ executor, resolve: resolveExec, reject: rejectExec });
    processScriptQueue();
  });
}

async function processScriptQueue() {
  if (scriptQueueRunning) {
    return;
  }
  const next = scriptQueue.shift();
  if (!next) {
    return;
  }
  scriptQueueRunning = true;
  try {
    const result = await next.executor();
    next.resolve(result);
  } catch (error) {
    next.reject(error);
  } finally {
    scriptQueueRunning = false;
    processScriptQueue();
  }
}

const teacherServiceUserAgent = 'teacher-service/0.2.0';

function jsonResponse(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Teacher-Token, X-Teacher-Actor',
  });
  res.end(body);
}

function handleOptions(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Teacher-Token, X-Teacher-Actor',
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

function extractActor(req) {
  return extractToken(req.headers['x-teacher-actor']).trim();
}

async function resolveTokenFromFile(path) {
  const resolved = path.startsWith('/') ? path : resolve(projectRoot, path);
  let stats;
  try {
    stats = await stat(resolved);
  } catch (error) {
    const reason = error && typeof error === 'object' && 'code' in error ? `(${error.code})` : '';
    throw new Error(`Arquivo de token não pode ser lido ${reason}.`);
  }

  if (!stats.isFile()) {
    throw new Error(
      'O caminho configurado para TEACHER_SERVICE_PR_TOKEN_FILE deve apontar para um arquivo.'
    );
  }

  const permissions = stats.mode & 0o777;
  if ((permissions & 0o077) !== 0) {
    throw new Error(
      'As permissões do arquivo de token devem restringir acesso a outros usuários (ex.: chmod 600).'
    );
  }

  const content = await readFile(resolved, 'utf-8');
  const token = content.trim();
  if (!token) {
    throw new Error('Arquivo de token configurado, porém vazio.');
  }
  return token;
}

async function loadPullRequestToken() {
  if (prTokenEnv) {
    return prTokenEnv;
  }

  if (!prTokenFile) {
    return '';
  }

  return resolveTokenFromFile(prTokenFile);
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
    const queuedAt = new Date();
    const queuePosition = getPendingScriptsCount();
    const result = await enqueueScriptExecution(() => executeScript(config));
    const startedAtMs = Date.parse(result.startedAt);
    const queueDurationMs = Number.isFinite(startedAtMs)
      ? Math.max(0, startedAtMs - queuedAt.getTime())
      : null;
    const payload = {
      ...result,
      queuedAt: queuedAt.toISOString(),
      queueDurationMs,
      queuePosition,
    };
    const historyEntry = await appendHistory(payload);
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

function normalizePathToProjectRoot(input) {
  if (typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed || trimmed.startsWith('-') || /[\r\n]/.test(trimmed) || trimmed.includes('\0')) {
    return null;
  }

  const resolved = resolve(projectRoot, trimmed);
  const projectRelative = relative(projectRoot, resolved);

  if (projectRelative.startsWith('..') || projectRelative.includes('\0')) {
    return null;
  }

  if (!projectRelative) {
    return '.';
  }

  return projectRelative.replace(/\\/g, '/');
}

function sanitizeGitPaths(rawPaths) {
  if (!Array.isArray(rawPaths)) {
    return [];
  }

  const sanitized = rawPaths
    .map((value) => normalizePathToProjectRoot(value))
    .filter((value) => typeof value === 'string' && value.length > 0);

  const unique = [...new Set(sanitized)];
  return unique;
}

function normalizeCommitMessageParts(rawMessage) {
  if (typeof rawMessage !== 'string') {
    return [];
  }

  const normalized = rawMessage.replace(/\r\n?/g, '\n').replace(/\0/g, '').trim();
  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function buildGitAddCommandString({ paths, all }) {
  if (all) {
    return 'git add --all';
  }

  if (!paths.length) {
    return 'git add --';
  }

  const listed = paths.map((item) => (item.includes(' ') ? `'${item}'` : item)).join(' ');
  return `git add -- ${listed}`;
}

async function runGitAdd({ paths, all }) {
  const args = ['add'];
  if (all) {
    args.push('--all');
  } else {
    args.push('--');
    args.push(...paths);
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

  return {
    success,
    exitCode,
    stdout,
    stderr,
    paths,
    all,
    command: buildGitAddCommandString({ paths, all }),
    status,
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

function parseGitHubRemote(remoteUrl) {
  if (typeof remoteUrl !== 'string') {
    return null;
  }
  const trimmed = remoteUrl.trim();
  if (!trimmed) {
    return null;
  }

  const normalize = (host, path) => {
    if (!/^github\.com$/i.test(host)) {
      return null;
    }
    const cleaned = path.replace(/\.git$/i, '').replace(/^\/+/, '');
    const [owner, repo] = cleaned.split('/');
    if (!owner || !repo) {
      return null;
    }
    return { host: 'github.com', owner, repo };
  };

  if (trimmed.startsWith('git@')) {
    const match = trimmed.match(/^git@([^:]+):(.+)$/);
    if (!match) {
      return null;
    }
    return normalize(match[1], match[2]);
  }

  try {
    const url = new URL(trimmed);
    return normalize(url.hostname, url.pathname);
  } catch (error) {
    // Support ssh://git@github.com/owner/repo.git
    if (trimmed.startsWith('ssh://')) {
      try {
        const sshUrl = new URL(trimmed);
        return normalize(sshUrl.hostname, sshUrl.pathname);
      } catch (sshError) {
        return null;
      }
    }
  }

  return null;
}

async function resolveRemoteRepository(remote) {
  const { exitCode, stdout, stderr } = await runCommand('git', [
    'config',
    '--get',
    `remote.${remote}.url`,
  ]);

  if (exitCode !== 0) {
    const error = new Error(
      `Remote ${remote} não encontrado. Configure o repositório antes de criar PRs automaticamente.`
    );
    error.details = stderr || stdout;
    throw error;
  }

  const remoteUrl = stdout.trim();
  const parsed = parseGitHubRemote(remoteUrl);
  if (!parsed) {
    const error = new Error(
      'Apenas repositórios hospedados no GitHub são suportados para criação automática de PRs.'
    );
    error.details = remoteUrl;
    throw error;
  }

  return { ...parsed, remoteUrl };
}

function buildPullRequestCommandPreview({ title, head, base, draft }) {
  const normalizedTitle = title.replace(/\s+/g, ' ').trim().replace(/"/g, '\\"');
  const safeTitle = normalizedTitle || 'Atualizar conteúdos no módulo do professor';
  const parts = ['gh pr create', `--title "${safeTitle}"`, `--base ${base}`, `--head ${head}`];
  if (draft) {
    parts.push('--draft');
  }
  parts.push('--web');
  return parts.join(' ');
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

async function serveGitStage(req, res) {
  try {
    const body = await parseRequestBody(req);
    const all = Boolean(body.all);
    const sanitizedPaths = sanitizeGitPaths(body.paths ?? []);

    if (!all && sanitizedPaths.length === 0) {
      jsonResponse(res, 400, {
        error:
          'Informe ao menos um caminho válido ou habilite o modo all para executar git add automaticamente.',
      });
      return;
    }

    const result = await runGitAdd({ paths: sanitizedPaths, all });
    jsonResponse(res, 200, result);
  } catch (error) {
    const details =
      error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
    jsonResponse(res, 500, {
      error: 'Falha ao executar git add no workspace atual.',
      details,
    });
  }
}

async function serveGitCommit(req, res) {
  try {
    const body = await parseRequestBody(req);
    const messageParts = normalizeCommitMessageParts(body.message ?? '');

    if (messageParts.length === 0) {
      jsonResponse(res, 400, { error: 'Informe uma mensagem de commit válida.' });
      return;
    }

    const allowEmpty = Boolean(body.allowEmpty);
    const stagePaths = sanitizeGitPaths(body.stagePaths ?? []);

    let stageResult = null;
    if (stagePaths.length > 0) {
      stageResult = await runGitAdd({ paths: stagePaths, all: false });
      if (!stageResult.success) {
        jsonResponse(res, 200, {
          success: false,
          skipped: true,
          exitCode: null,
          stdout: '',
          stderr: 'Commit não executado porque git add falhou.',
          message: messageParts.join('\n\n'),
          messageParts,
          allowEmpty,
          stage: stageResult,
          status: stageResult.status ?? null,
          command: buildGitCommitCommandString({ messageParts, allowEmpty }),
        });
        return;
      }
    }

    const args = ['commit'];
    messageParts.forEach((part) => {
      args.push('-m');
      args.push(part);
    });

    if (allowEmpty) {
      args.push('--allow-empty');
    }

    const { exitCode, stdout, stderr } = await runCommand('git', args);
    const success = exitCode === 0;

    let status = null;
    try {
      status = await captureGitStatus();
    } catch (statusError) {
      status = null;
    }

    jsonResponse(res, 200, {
      success,
      skipped: false,
      exitCode,
      stdout,
      stderr,
      message: messageParts.join('\n\n'),
      messageParts,
      allowEmpty,
      stage: stageResult,
      status,
      command: buildGitCommitCommandString({ messageParts, allowEmpty }),
    });
  } catch (error) {
    const details =
      error && typeof error === 'object' && 'details' in error && typeof error.details === 'string'
        ? error.details
        : error instanceof Error
          ? error.message
          : String(error);
    jsonResponse(res, 500, {
      error: 'Falha ao executar git commit.',
      details,
    });
  }
}

function buildGitPushCommandString({ remote, branch, setUpstream }) {
  const chunks = ['git push'];
  if (setUpstream) {
    chunks.push('-u');
  }
  chunks.push(remote);
  chunks.push(branch);
  return chunks.join(' ');
}

async function serveGitPush(req, res) {
  try {
    const body = await parseRequestBody(req);

    const remoteInput = typeof body.remote === 'string' ? body.remote.trim() : '';
    const branchInput = typeof body.branch === 'string' ? body.branch.trim() : '';

    const remote = remoteInput || 'origin';
    if (!isSafeGitToken(remote)) {
      jsonResponse(res, 400, {
        error: 'Nome de remote inválido. Use apenas letras, números, ., -, _ e /.',
      });
      return;
    }

    if (!branchInput) {
      jsonResponse(res, 400, {
        error: 'Informe o nome da branch que deve ser enviada ao repositório remoto.',
      });
      return;
    }

    if (!isSafeGitToken(branchInput)) {
      jsonResponse(res, 400, {
        error: 'Nome de branch inválido. Use apenas letras, números, ., -, _ e /.',
      });
      return;
    }

    const setUpstream = Object.prototype.hasOwnProperty.call(body, 'setUpstream')
      ? Boolean(body.setUpstream)
      : true;

    const args = ['push'];
    if (setUpstream) {
      args.push('-u');
    }
    args.push(remote);
    args.push(branchInput);

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
      branch: branchInput,
      setUpstream,
      command: buildGitPushCommandString({ remote, branch: branchInput, setUpstream }),
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
      error: 'Falha ao enviar commits para o repositório remoto.',
      details,
    });
  }
}

async function serveGitPullRequest(req, res) {
  try {
    const body = await parseRequestBody(req);

    const rawTitle = typeof body.title === 'string' ? body.title : '';
    const normalizedTitle = rawTitle.replace(/\r\n?/g, '\n').split('\n')[0]?.trim() ?? '';
    const title = normalizedTitle || 'Atualizar conteúdos no módulo do professor';

    const headInput = typeof body.head === 'string' ? body.head.trim() : '';
    if (!headInput || !isSafeGitToken(headInput)) {
      jsonResponse(res, 400, {
        error: 'Informe a branch (head) que será usada como origem do PR.',
      });
      return;
    }

    const baseInputRaw = typeof body.base === 'string' ? body.base.trim() : '';
    const baseInput = baseInputRaw || prDefaultBaseBranch;
    if (!isSafeGitToken(baseInput)) {
      jsonResponse(res, 400, {
        error: 'Nome de branch base inválido. Use apenas letras, números, ., -, _ e /.',
      });
      return;
    }

    const remoteInputRaw = typeof body.remote === 'string' ? body.remote.trim() : '';
    const remote = remoteInputRaw || 'origin';
    if (!isSafeGitToken(remote)) {
      jsonResponse(res, 400, {
        error: 'Nome de remote inválido. Use apenas letras, números, ., -, _ e /.',
      });
      return;
    }

    const actor = extractActor(req);
    if (prActorAllowlist.size > 0) {
      if (!actor) {
        jsonResponse(res, 403, {
          error: 'Informe o header X-Teacher-Actor para criar PRs automaticamente.',
        });
        return;
      }
      if (!prActorAllowlist.has(actor)) {
        jsonResponse(res, 403, {
          error: 'Perfil não autorizado a criar PRs automaticamente.',
        });
        return;
      }
    }

    let token;
    try {
      token = await loadPullRequestToken();
    } catch (error) {
      jsonResponse(res, 500, {
        success: false,
        error: 'Não foi possível carregar o token do GitHub configurado para o serviço.',
        details: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    if (!token) {
      jsonResponse(res, 503, {
        success: false,
        error:
          'Token do GitHub não configurado. Defina TEACHER_SERVICE_PR_TOKEN ou TEACHER_SERVICE_PR_TOKEN_FILE para habilitar a criação automática de PRs.',
      });
      return;
    }

    let repository;
    try {
      repository = await resolveRemoteRepository(remote);
    } catch (error) {
      jsonResponse(res, 400, {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível identificar o repositório remoto configurado.',
        details:
          error && typeof error === 'object' && 'details' in error ? error.details : undefined,
      });
      return;
    }

    const draft = Boolean(body.draft);
    const allowMaintainerEdit = Object.prototype.hasOwnProperty.call(body, 'allowMaintainerEdit')
      ? Boolean(body.allowMaintainerEdit)
      : prMaintainerEditDefault;

    const description = typeof body.body === 'string' ? body.body : '';
    const commandPreview = buildPullRequestCommandPreview({
      title,
      head: headInput,
      base: baseInput,
      draft,
    });

    const githubPayload = {
      title,
      head: headInput,
      base: baseInput,
      body: description,
      draft,
      maintainer_can_modify: allowMaintainerEdit,
    };

    const response = await fetch(
      `https://api.github.com/repos/${repository.owner}/${repository.repo}/pulls`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': teacherServiceUserAgent,
        },
        body: JSON.stringify(githubPayload),
      }
    );

    const rawPayload = await response.text();
    let parsedPayload = {};
    try {
      parsedPayload = rawPayload ? JSON.parse(rawPayload) : {};
    } catch (parseError) {
      parsedPayload = {};
    }

    if (!response.ok) {
      const details =
        parsedPayload && typeof parsedPayload === 'object' && 'message' in parsedPayload
          ? parsedPayload.message
          : rawPayload || 'Resposta inesperada do GitHub.';
      jsonResponse(res, 502, {
        success: false,
        error: 'Falha ao criar o pull request via API do GitHub.',
        details,
        command: commandPreview,
      });
      return;
    }

    const payload = parsedPayload && typeof parsedPayload === 'object' ? parsedPayload : {};

    jsonResponse(res, 200, {
      success: true,
      number: typeof payload.number === 'number' ? payload.number : null,
      url: typeof payload.url === 'string' ? payload.url : null,
      htmlUrl: typeof payload.html_url === 'string' ? payload.html_url : null,
      head: payload.head && typeof payload.head.ref === 'string' ? payload.head.ref : headInput,
      base: payload.base && typeof payload.base.ref === 'string' ? payload.base.ref : baseInput,
      draft: typeof payload.draft === 'boolean' ? payload.draft : draft,
      actor: actor || null,
      repository: `${repository.owner}/${repository.repo}`,
      remote,
      createdAt:
        typeof payload.created_at === 'string' ? payload.created_at : new Date().toISOString(),
      command: commandPreview,
    });
  } catch (error) {
    jsonResponse(res, 500, {
      success: false,
      error: 'Falha inesperada ao criar o pull request automaticamente.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

function buildGitCommitCommandString({ messageParts, allowEmpty }) {
  const chunks = ['git commit'];
  messageParts.forEach((part) => {
    const quoted = part.includes(' ') ? `"${part.replace(/"/g, '\\"')}"` : part;
    chunks.push('-m');
    chunks.push(quoted);
  });

  if (allowEmpty) {
    chunks.push('--allow-empty');
  }

  return chunks.join(' ');
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

  if (url.pathname === '/api/teacher/git/stage' && req.method === 'POST') {
    await serveGitStage(req, res);
    return;
  }

  if (url.pathname === '/api/teacher/git/commit' && req.method === 'POST') {
    await serveGitCommit(req, res);
    return;
  }

  if (url.pathname === '/api/teacher/git/push' && req.method === 'POST') {
    await serveGitPush(req, res);
    return;
  }

  if (url.pathname === '/api/teacher/git/pull-request' && req.method === 'POST') {
    await serveGitPullRequest(req, res);
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
