#!/usr/bin/env node
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';
import { readFile, writeFile, stat } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const contentRoot = resolve(projectRoot, 'src/content');

const port = Number(process.env.TEACHER_SERVICE_PORT ?? 4178);
const host = process.env.TEACHER_SERVICE_HOST ?? '127.0.0.1';
const requiredToken = (process.env.TEACHER_SERVICE_TOKEN ?? '').trim();
const authenticationEnabled = requiredToken.length > 0;

function jsonResponse(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Teacher-Token',
  });
  res.end(body);
}

function handleOptions(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Teacher-Token',
  });
  res.end();
}

function ensureContentPath(requestedPath) {
  if (typeof requestedPath !== 'string' || !requestedPath.trim()) {
    throw new Error('Informe o caminho do arquivo JSON através do parâmetro "path".');
  }

  const normalized = requestedPath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized) {
    throw new Error('O caminho informado é inválido.');
  }

  if (!normalized.endsWith('.json')) {
    throw new Error('Apenas arquivos JSON podem ser lidos ou escritos.');
  }

  if (normalized.includes('\0')) {
    throw new Error('O caminho informado contém caracteres inválidos.');
  }

  const absolute = resolve(contentRoot, normalized);
  const relativePath = relative(contentRoot, absolute);
  if (!relativePath || relativePath.startsWith('..')) {
    throw new Error('Acesso negado. Utilize apenas caminhos dentro de src/content.');
  }

  const segments = relativePath.split(/[/\\]+/);
  if (segments.some((segment) => segment === '..')) {
    throw new Error('Acesso negado. Utilize apenas caminhos dentro de src/content.');
  }

  return { absolute, relative: relativePath.replace(/\\/g, '/') };
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

function cloneJson(value) {
  try {
    return structuredClone(value);
  } catch (_error) {
    return JSON.parse(JSON.stringify(value));
  }
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

async function serveContentRead(res, url) {
  const requestedPath = url.searchParams.get('path');
  let resolved;
  try {
    resolved = ensureContentPath(requestedPath);
  } catch (error) {
    jsonResponse(res, 400, { error: error.message });
    return;
  }

  let raw;
  try {
    raw = await readFile(resolved.absolute, 'utf-8');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      jsonResponse(res, 404, { error: 'Arquivo não encontrado dentro de src/content.' });
      return;
    }
    jsonResponse(res, 500, { error: 'Não foi possível ler o arquivo solicitado.' });
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_error) {
    jsonResponse(res, 500, {
      error: 'O arquivo existe, mas contém JSON inválido. Corrija antes de continuar.',
    });
    return;
  }

  jsonResponse(res, 200, {
    path: resolved.relative,
    content: parsed,
  });
}

async function serveContentWrite(req, res) {
  let body;
  try {
    body = await parseRequestBody(req);
  } catch (error) {
    jsonResponse(res, 400, { error: error.message });
    return;
  }

  const requestedPath = body && typeof body === 'object' ? body.path : undefined;
  let resolved;
  try {
    resolved = ensureContentPath(requestedPath);
  } catch (error) {
    jsonResponse(res, 400, { error: error.message });
    return;
  }

  let stats;
  try {
    stats = await stat(resolved.absolute);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      jsonResponse(res, 404, {
        error: 'Arquivo não encontrado. Apenas arquivos existentes podem ser atualizados.',
      });
      return;
    }
    jsonResponse(res, 500, { error: 'Não foi possível acessar o arquivo solicitado.' });
    return;
  }

  if (!stats.isFile()) {
    jsonResponse(res, 400, { error: 'O caminho informado não aponta para um arquivo.' });
    return;
  }

  const content = body && typeof body === 'object' ? body.content : undefined;
  if (content === undefined) {
    jsonResponse(res, 400, {
      error: 'Envie a propriedade "content" com os dados JSON atualizados.',
    });
    return;
  }

  const serialized = JSON.stringify(content, null, 2);
  try {
    await writeFile(resolved.absolute, `${serialized}\n`, 'utf-8');
  } catch (_error) {
    jsonResponse(res, 500, { error: 'Falha ao escrever o arquivo solicitado.' });
    return;
  }

  jsonResponse(res, 200, {
    path: resolved.relative,
    content: cloneJson(content),
    savedAt: new Date().toISOString(),
  });
}

function notFound(res) {
  jsonResponse(res, 404, { error: 'Endpoint não encontrado.' });
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    notFound(res);
    return;
  }

  if (req.method === 'OPTIONS') {
    handleOptions(res);
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? `${host}:${port}`}`);

  if (url.pathname === '/health') {
    jsonResponse(res, 200, { status: 'ok' });
    return;
  }

  if (url.pathname === '/api/teacher/content') {
    if (!ensureAuthenticated(req, res)) {
      return;
    }

    if (req.method === 'GET') {
      await serveContentRead(res, url);
      return;
    }

    if (req.method === 'PUT') {
      await serveContentWrite(req, res);
      return;
    }

    jsonResponse(res, 405, { error: 'Método não suportado.' });
    return;
  }

  notFound(res);
});

server.listen(port, host, () => {
  console.log(`teacher-automation-server rodando em http://${host}:${port}`);
});
