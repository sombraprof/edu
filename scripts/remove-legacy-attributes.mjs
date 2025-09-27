#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const COURSES = ['algi', 'tgs', 'tdjd', 'ddm', 'lpoo'];
const ROOT = path.join('src', 'content', 'courses');

const TARGET_DIRS = COURSES.flatMap((course) => [
  path.join(ROOT, course, 'lessons'),
  path.join(ROOT, course, 'exercises'),
]).concat(path.join(ROOT, 'ddm', 'lessons')); // ensure lessons handled even if duplicate

const seen = new Set();
const dirsToProcess = TARGET_DIRS.filter((dir) => {
  if (seen.has(dir)) return false;
  seen.add(dir);
  return true;
});

const filesChanged = [];

async function main() {
  for (const dir of dirsToProcess) {
    await traverse(dir);
  }

  if (filesChanged.length) {
    console.log('Updated files:', filesChanged.length);
    for (const file of filesChanged) {
      console.log(' -', file);
    }
  } else {
    console.log('No legacy attributes found.');
  }
}

async function traverse(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

function cleanString(value) {
  let result = value;
  let changed = false;

  const replacements = [
    [/\sclass="[^"]*"/gi, ''],
    [/\sclass='[^']*'/gi, ''],
    [/\sstyle="[^"]*"/gi, ''],
    [/\sstyle='[^']*'/gi, ''],
    [/\sid="[^"]*"/gi, ''],
    [/\sid='[^']*'/gi, ''],
    [/\sdata-[a-z0-9-]+="[^"]*"/gi, ''],
    [/\sdata-[a-z0-9-]+='[^']*'/gi, ''],
    [/\saria-[a-z0-9-]+="[^"]*"/gi, ''],
    [/\saria-[a-z0-9-]+='[^']*'/gi, ''],
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(result)) {
      changed = true;
      result = result.replace(pattern, replacement);
    }
  }

  const iconPattern = /<i[^>]*>\s*<\/i>/gi;
  if (iconPattern.test(result)) {
    changed = true;
    result = result.replace(iconPattern, '');
  }

  const loneOpeningIconPattern = /<i[^>]*>/gi;
  if (loneOpeningIconPattern.test(result)) {
    changed = true;
    result = result.replace(loneOpeningIconPattern, '');
  }

  if (/<\/i>/i.test(result)) {
    changed = true;
    result = result.replace(/<\/i>/gi, '');
  }

  const redundantSpacePattern = /<([a-z0-9-]+)\s+>/gi;
  if (redundantSpacePattern.test(result)) {
    changed = true;
    result = result.replace(redundantSpacePattern, '<$1>');
  }

  return { value: result, changed };
}

function deepClean(node) {
  if (typeof node === 'string') {
    const { value, changed } = cleanString(node);
    return { node: value, changed };
  }

  if (Array.isArray(node)) {
    let mutated = false;
    const result = node.map((item) => {
      const { node: cleaned, changed } = deepClean(item);
      if (changed) mutated = true;
      return cleaned;
    });
    return { node: result, changed: mutated };
  }

  if (node && typeof node === 'object') {
    let mutated = false;
    const result = {};
    for (const [key, value] of Object.entries(node)) {
      const { node: cleaned, changed } = deepClean(value);
      if (changed) mutated = true;
      result[key] = cleaned;
    }
    return { node: result, changed: mutated };
  }

  return { node, changed: false };
}

async function processFile(filePath) {
  const original = await fs.readFile(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(original);
  } catch (error) {
    console.error('Failed to parse JSON:', filePath);
    throw error;
  }

  const { node: cleanedData, changed } = deepClean(data);
  if (!changed) {
    return;
  }

  const output = JSON.stringify(cleanedData, null, 2) + '\n';
  if (output !== original) {
    await fs.writeFile(filePath, output, 'utf8');
    filesChanged.push(filePath);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
