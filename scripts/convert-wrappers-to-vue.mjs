#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const rootDir = process.cwd();
const coursesDir = path.join(rootDir, 'src', 'content', 'courses');

const INDENT = '  ';

function parseFrontmatter(source) {
  const match = /^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*[\r\n]*([\s\S]*)$/m.exec(source.trimStart());
  if (!match) {
    return { metaLines: [], body: source.trim() };
  }
  const [, metaBlock, rest] = match;
  const metaLines = metaBlock
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return { metaLines, body: rest.trim() };
}

function buildMetaObject(metaLines) {
  if (!metaLines.length) return '{}';
  const formatted = metaLines
    .map((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        return INDENT + line;
      }
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      return `${INDENT}${key}: ${value}`;
    })
    .join(',\n');
  return `\n${formatted}\n`;
}

async function convertLesson(courseDir, fileName) {
  const lessonsDir = path.join(courseDir, 'lessons');
  const sourcePath = path.join(lessonsDir, fileName);
  const baseName = path.parse(fileName).name;
  const jsonPath = path.join(lessonsDir, `${baseName}.json`);

  if (!(await fileExists(jsonPath))) {
    console.warn(`[convert] JSON not found for lesson wrapper: ${sourcePath}`);
    return;
  }

  const raw = await fs.readFile(sourcePath, 'utf8');
  const { metaLines } = parseFrontmatter(raw);
  const metaObject = buildMetaObject(metaLines);

  const vueContent = `<script lang="ts">
export const meta = {${metaObject}};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './${baseName}.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>
`;

  const targetPath = path.join(lessonsDir, `${baseName}.vue`);
  await fs.writeFile(targetPath, vueContent, 'utf8');
  await fs.unlink(sourcePath);
}

function indentBody(body) {
  const lines = body.split(/\r?\n/);
  return lines
    .map((line) => (line.length ? `${INDENT}${line}` : ''))
    .join('\n')
    .trimEnd();
}

async function convertExercise(courseDir, fileName) {
  const exercisesDir = path.join(courseDir, 'exercises');
  const sourcePath = path.join(exercisesDir, fileName);
  const baseName = path.parse(fileName).name;

  const raw = await fs.readFile(sourcePath, 'utf8');
  const { metaLines, body } = parseFrontmatter(raw);
  const metaObject = buildMetaObject(metaLines);
  const templateBody = body ? `\n${indentBody(body)}\n` : '\n';

  const vueContent = `<script lang="ts">
export const meta = {${metaObject}};
</script>

<template>${templateBody}</template>
`;

  const targetPath = path.join(exercisesDir, `${baseName}.vue`);
  await fs.writeFile(targetPath, vueContent, 'utf8');
  await fs.unlink(sourcePath);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function updateIndex(indexPath) {
  if (!(await fileExists(indexPath))) return;
  const raw = await fs.readFile(indexPath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) return;
  const updated = data.map((entry) => {
    if (entry?.file && typeof entry.file === 'string' && entry.file.endsWith('.md')) {
      return { ...entry, file: entry.file.replace(/\.md$/, '.vue') };
    }
    return entry;
  });
  await fs.writeFile(indexPath, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
}

async function processCourse(courseId) {
  const courseDir = path.join(coursesDir, courseId);
  const stats = await fs.stat(courseDir);
  if (!stats.isDirectory()) return;

  const lessonsDir = path.join(courseDir, 'lessons');
  if (await fileExists(lessonsDir)) {
    const lessonFiles = await fs.readdir(lessonsDir);
    for (const file of lessonFiles.filter((name) => name.endsWith('.md'))) {
      await convertLesson(courseDir, file);
    }
    await updateIndex(path.join(courseDir, 'lessons.json'));
  }

  const exercisesDir = path.join(courseDir, 'exercises');
  if (await fileExists(exercisesDir)) {
    const exerciseFiles = await fs.readdir(exercisesDir);
    for (const file of exerciseFiles.filter((name) => name.endsWith('.md'))) {
      await convertExercise(courseDir, file);
    }
    await updateIndex(path.join(courseDir, 'exercises.json'));
  }
}

async function run() {
  const entries = await fs.readdir(coursesDir);
  for (const courseId of entries) {
    await processCourse(courseId);
  }
  console.log('Converted markdown wrappers to Vue single-file components.');
}

run().catch((error) => {
  console.error('Failed to convert wrappers:', error);
  process.exitCode = 1;
});
