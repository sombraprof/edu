#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

function createSpawnOptions(extraEnv = {}) {
  return {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  };
}

function spawnProcess(command, args, options) {
  const child = spawn(command, args, options);
  return child;
}

const viteArgs = process.argv.slice(2);
const children = new Set();
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }
  process.exit(code);
}

const teacherProcess = spawnProcess(
  process.execPath,
  [resolve(__dirname, 'teacher-automation-server.mjs')],
  createSpawnOptions()
);
children.add(teacherProcess);

const viteBinary = resolve(projectRoot, 'node_modules/vite/bin/vite.js');
const viteProcess = spawnProcess(
  process.execPath,
  [viteBinary, ...viteArgs],
  createSpawnOptions({ VITE_TEACHER_API_URL: process.env.VITE_TEACHER_API_URL || '/teacher-api' })
);
children.add(viteProcess);

function handleChildExit(child, code, signal) {
  children.delete(child);
  if (shuttingDown) {
    return;
  }
  if (code !== null && code !== 0) {
    console.error(`Processo ${child.pid} finalizou com código ${code}.`);
    shutdown(code);
    return;
  }
  if (signal) {
    console.warn(`Processo ${child.pid} interrompido com sinal ${signal}.`);
  }
  if (child === teacherProcess) {
    shutdown(code ?? 0);
  }
}

teacherProcess.on('exit', (code, signal) => handleChildExit(teacherProcess, code, signal));
viteProcess.on('exit', (code, signal) => handleChildExit(viteProcess, code, signal));

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
