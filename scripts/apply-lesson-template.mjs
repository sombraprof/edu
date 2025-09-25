#!/usr/bin/env node
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

function buildFrontmatter(entry, lessonData) {
  const lines = [`id: ${JSON.stringify(entry.id)}`];
  if (entry.title) lines.push(`title: ${JSON.stringify(entry.title)}`);
  const objective = entry.description ?? lessonData?.objective ?? '';
  if (objective) lines.push(`objective: ${JSON.stringify(objective)}`);
  if (typeof entry.available !== 'undefined') {
    lines.push(`available: ${entry.available}`);
  } else {
    lines.push('available: true');
  }
  return `---\n${lines.join('\n')}\n---`;
}

async function rewriteLessonMd(courseId, entry) {
  const lessonsDir = path.join(coursesDir, courseId, 'lessons');
  const jsonPath = path.join(lessonsDir, `${entry.id}.json`);
  const mdPath = path.join(lessonsDir, `${entry.id}.md`);

  if (!(await exists(jsonPath))) return;
  const rawJson = await fs.readFile(jsonPath, 'utf8');
  const lessonData = JSON.parse(rawJson);

  const frontmatter = buildFrontmatter(entry, lessonData);
  const mdContent = `${frontmatter}\n\n<script setup lang="ts">\nimport LessonRenderer from '@/components/lesson/LessonRenderer.vue';\nimport lessonData from './${entry.id}.json';\n</script>\n\n<LessonRenderer :data="lessonData" />\n`;

  await fs.writeFile(mdPath, mdContent, 'utf8');
}

async function processCourse(courseId) {
  if (courseId === 'algi') return; // already curated
  const lessonsIndexPath = path.join(coursesDir, courseId, 'lessons.json');
  if (!(await exists(lessonsIndexPath))) return;

  const rawIndex = await fs.readFile(lessonsIndexPath, 'utf8');
  const lessonsIndex = JSON.parse(rawIndex);
  if (!Array.isArray(lessonsIndex)) return;

  for (const entry of lessonsIndex) {
    if (!entry || typeof entry !== 'object') continue;
    await rewriteLessonMd(courseId, entry);
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
  console.log('Lesson markdown templates applied.');
}

run().catch((error) => {
  console.error('Failed to apply lesson templates:', error);
  process.exitCode = 1;
});
