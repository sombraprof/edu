#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const rootDir = process.cwd();
const targets = [path.join(rootDir, 'src', 'content'), path.join(rootDir, 'src', 'data')];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.name.endsWith('.json') || entry.name.endsWith('.vue')) {
      await stripBom(fullPath);
    }
  }
}

async function stripBom(filePath) {
  const buffer = await fs.readFile(filePath);
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    const content = buffer.slice(3).toString('utf8');
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`Removed BOM from ${path.relative(rootDir, filePath)}`);
  }
}

async function run() {
  for (const target of targets) {
    if (await exists(target)) {
      await walk(target);
    }
  }
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

run().catch((error) => {
  console.error('Failed to remove BOM:', error);
  process.exitCode = 1;
});
