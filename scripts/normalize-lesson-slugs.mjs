#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const contentRoot = path.join(repoRoot, 'src', 'content', 'courses');

function padLesson(number) {
  return String(number).padStart(2, '0');
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

function replaceAll(content, replacements) {
  return replacements.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    content
  );
}

async function updateVueMeta(filePath, oldId, newId) {
  const source = await fs.readFile(filePath, 'utf-8');
  const replacements = [
    [new RegExp(`id:\\s*'${oldId}'`, 'g'), `id: '${newId}'`],
    [new RegExp(`id:\\s*\"${oldId}\"`, 'g'), `id: '${newId}'`],
    [new RegExp(`from \'\\./${oldId}\\.json\'`, 'g'), `from './${newId}.json'`],
    [new RegExp(`from \"\\./${oldId}\\.json\"`, 'g'), `from './${newId}.json'`],
  ];
  const updated = replaceAll(source, replacements);
  await fs.writeFile(filePath, updated, 'utf-8');
}

async function updateJsonId(filePath, newId) {
  const raw = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(raw);
  data.id = newId;
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

async function normalizeCourse(course) {
  const courseDir = path.join(contentRoot, course);
  const lessonsDir = path.join(courseDir, 'lessons');
  const lessonsIndexPath = path.join(courseDir, 'lessons.json');

  const rawIndex = await fs.readFile(lessonsIndexPath, 'utf-8');
  const lessonsIndex = JSON.parse(rawIndex);

  const updatedEntries = [];

  for (let i = 0; i < lessonsIndex.length; i += 1) {
    const entry = lessonsIndex[i];
    const newId = `lesson-${padLesson(i + 1)}`;
    const ext = path.extname(entry.file) || '.vue';
    const newFile = `${newId}${ext}`;
    const oldBase = path.parse(entry.file).name;
    const newBase = path.parse(newFile).name;

    if (oldBase !== newBase) {
      const oldPath = path.join(lessonsDir, entry.file);
      const newPath = path.join(lessonsDir, newFile);
      const exists = await pathExists(oldPath);
      if (exists) {
        await fs.rename(oldPath, newPath);
      }
    }

    const oldJsonPath = path.join(lessonsDir, `${oldBase}.json`);
    const newJsonPath = path.join(lessonsDir, `${newBase}.json`);

    if (oldJsonPath !== newJsonPath && (await pathExists(oldJsonPath))) {
      await fs.rename(oldJsonPath, newJsonPath);
    }

    if (await pathExists(newJsonPath)) {
      await updateJsonId(newJsonPath, newId);
    }

    if (ext === '.vue') {
      const vuePath = path.join(lessonsDir, `${newBase}.vue`);
      if (await pathExists(vuePath)) {
        await updateVueMeta(vuePath, entry.id, newId);
      }
    }

    updatedEntries.push({ ...entry, id: newId, file: newFile });
  }

  await fs.writeFile(lessonsIndexPath, `${JSON.stringify(updatedEntries, null, 2)}\n`, 'utf-8');
}

async function main() {
  const courses = await fs.readdir(contentRoot);
  for (const course of courses) {
    await normalizeCourse(course);
    console.log(`Normalized lessons for course: ${course}`);
  }
}

main().catch((error) => {
  console.error('Failed to normalize lesson slugs:', error);
  process.exitCode = 1;
});
