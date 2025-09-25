#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';

const rootDir = process.cwd();
const coursesDir = path.join(rootDir, 'src', 'content', 'courses');
const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function stripFrontmatter(content) {
  if (!content.startsWith('---')) return content;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return content;
  return content.slice(end + 4).trimStart();
}

function buildExerciseFrontmatter(entry) {
  const lines = [`id: ${JSON.stringify(entry.id)}`];
  if (entry.title) lines.push(`title: ${JSON.stringify(entry.title)}`);
  if (entry.summary) lines.push(`summary: ${JSON.stringify(entry.summary)}`);
  if (typeof entry.available !== 'undefined') lines.push(`available: ${entry.available}`);
  return `---\n${lines.join('\n')}\n---`;
}

async function processExercise(courseId, entry) {
  if (!entry.file || !entry.file.endsWith('.md')) return;
  const courseDir = path.join(coursesDir, courseId);
  const exercisesDir = path.join(courseDir, 'exercises');
  const mdPath = path.join(exercisesDir, entry.file);
  if (!(await exists(mdPath))) return;
  const rawMd = await fs.readFile(mdPath, 'utf8');
  const body = stripFrontmatter(rawMd);
  const html = md.render(body).trim();

  const jsonData = {
    id: entry.id,
    title: entry.title,
    objective: entry.summary ?? '',
    content: [
      {
        type: 'legacySection',
        id: entry.id,
        title: entry.title,
        html
      }
    ]
  };

  const jsonPath = path.join(exercisesDir, `${entry.id}.json`);
  await fs.writeFile(jsonPath, `${JSON.stringify(jsonData, null, 2)}\n`, 'utf8');

  const frontmatter = buildExerciseFrontmatter(entry);
  const mdTemplate = `${frontmatter}\n\n<script setup lang=\"ts\">\nimport LessonRenderer from '@/components/lesson/LessonRenderer.vue';\nimport exerciseData from './${entry.id}.json';\n</script>\n\n<LessonRenderer :data=\"exerciseData\" />\n`;
  await fs.writeFile(mdPath, mdTemplate, 'utf8');
}

async function processCourse(courseId) {
  const exercisesIndexPath = path.join(coursesDir, courseId, 'exercises.json');
  if (!(await exists(exercisesIndexPath))) return;
  const rawIndex = await fs.readFile(exercisesIndexPath, 'utf8');
  const index = JSON.parse(rawIndex);
  if (!Array.isArray(index)) return;
  for (const entry of index) {
    await processExercise(courseId, entry);
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
  console.log('Exercise markdown converted to LessonRenderer wrappers.');
}

run().catch((error) => {
  console.error('Failed to convert exercises:', error);
  process.exitCode = 1;
});
