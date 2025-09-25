#!/usr/bin/env node
/**
 * Regenerates lesson Vue wrappers so they consistently expose metadata and mount LessonRenderer.
 */
import { promises as fs } from 'fs';
import path from 'path';

const rootDir = process.cwd();
const coursesDir = path.join(rootDir, 'src', 'content', 'courses');

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function buildMeta(entry, lessonData) {
  const meta = {
    id: entry.id,
    title: entry.title ?? lessonData?.title ?? '',
    objective: entry.description ?? lessonData?.objective ?? undefined,
    available: typeof entry.available !== 'undefined' ? entry.available : true,
  };

  const lines = Object.entries(meta)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `  ${key}: ${JSON.stringify(value)}`;
      }
      return `  ${key}: ${value}`;
    });

  return lines.length ? `\n${lines.join(',\n')}\n` : '';
}

async function rewriteLessonVue(courseId, entry) {
  const lessonsDir = path.join(coursesDir, courseId, 'lessons');
  const jsonPath = path.join(lessonsDir, `${entry.id}.json`);
  const vuePath = path.join(lessonsDir, `${entry.id}.vue`);

  if (!(await exists(jsonPath))) return;
  const rawJson = await fs.readFile(jsonPath, 'utf8');
  const lessonData = JSON.parse(rawJson);

  const metaBlock = buildMeta(entry, lessonData);
  const vueContent = `<script lang="ts">
export const meta = {${metaBlock}};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './${entry.id}.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>
`;

  await fs.writeFile(vuePath, vueContent, 'utf8');
}

async function processCourse(courseId) {
  const lessonsIndexPath = path.join(coursesDir, courseId, 'lessons.json');
  if (!(await exists(lessonsIndexPath))) return;

  const rawIndex = await fs.readFile(lessonsIndexPath, 'utf8');
  const lessonsIndex = JSON.parse(rawIndex);
  if (!Array.isArray(lessonsIndex)) return;

  for (const entry of lessonsIndex) {
    if (!entry || typeof entry !== 'object') continue;
    await rewriteLessonVue(courseId, entry);
  }
}

async function run() {
  const entries = await fs.readdir(coursesDir);
  for (const courseId of entries) {
    const coursePath = path.join(coursesDir, courseId);
    const stats = await fs.stat(coursePath);
    if (!stats.isDirectory()) continue;
    await processCourse(courseId);
  }
  console.log('Lesson Vue wrappers applied.');
}

run().catch((error) => {
  console.error('Failed to apply lesson templates:', error);
  process.exitCode = 1;
});
