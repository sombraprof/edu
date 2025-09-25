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

function extractMetaBlock(source) {
  const marker = 'export const meta =';
  const start = source.indexOf(marker);
  if (start === -1) return null;
  let index = source.indexOf('{', start);
  if (index === -1) return null;
  let depth = 0;
  let end = -1;
  for (let i = index; i < source.length; i += 1) {
    const char = source[i];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;
  const objectText = source.slice(index, end + 1);
  return { objectText, start, end: end + 1 };
}

async function normalizeLesson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const setupStart = raw.indexOf('<script setup lang="ts">');
  if (setupStart === -1) return;
  const scriptClose = raw.indexOf('</script>', setupStart);
  if (scriptClose === -1) return;
  const setupContent = raw.slice(setupStart + '<script setup lang="ts">'.length, scriptClose);
  const metaBlock = extractMetaBlock(setupContent);
  if (!metaBlock) return;

  const imports = setupContent.slice(0, metaBlock.start).trim();
  const templateStart = raw.indexOf('<template', scriptClose);
  if (templateStart === -1) return;
  const templateContent = raw.slice(templateStart).trim();

  const metaLines = metaBlock.objectText.trim();
  const importsSection = imports.length ? `${imports}\n` : '';

  const output = `<script lang="ts">
export const meta = ${metaLines};
</script>

<script setup lang="ts">
${importsSection}</script>

${templateContent}
`;

  await fs.writeFile(filePath, output, 'utf8');
}

async function normalizeExercise(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  let scriptTag = '<script setup lang="ts">';
  let scriptStart = raw.indexOf(scriptTag);
  let setupMode = true;
  if (scriptStart === -1) {
    scriptTag = '<script lang="ts">';
    scriptStart = raw.indexOf(scriptTag);
    setupMode = false;
  }
  if (scriptStart === -1) return;

  const scriptClose = raw.indexOf('</script>', scriptStart);
  if (scriptClose === -1) return;
  const scriptContent = raw.slice(scriptStart + scriptTag.length, scriptClose);
  const metaBlock = extractMetaBlock(scriptContent);
  if (!metaBlock) return;

  const templateStart = raw.indexOf('<template', scriptClose);
  if (templateStart === -1) return;
  const templateContent = raw.slice(templateStart).trim();

  const metaLines = metaBlock.objectText.trim();
  const output = `<script lang="ts">
export const meta = ${metaLines};
export default {};
</script>

${templateContent}
`;

  await fs.writeFile(filePath, output, 'utf8');
}

async function processCourse(courseId) {
  const courseDir = path.join(coursesDir, courseId);
  const lessonsDir = path.join(courseDir, 'lessons');
  if (await exists(lessonsDir)) {
    const lessonFiles = await fs.readdir(lessonsDir);
    for (const file of lessonFiles.filter((name) => name.endsWith('.vue'))) {
      await normalizeLesson(path.join(lessonsDir, file));
    }
  }

  const exercisesDir = path.join(courseDir, 'exercises');
  if (await exists(exercisesDir)) {
    const exerciseFiles = await fs.readdir(exercisesDir);
    for (const file of exerciseFiles.filter((name) => name.endsWith('.vue'))) {
      await normalizeExercise(path.join(exercisesDir, file));
    }
  }
}

async function run() {
  const entries = await fs.readdir(coursesDir);
  for (const courseId of entries) {
    await processCourse(courseId);
  }
  console.log('Normalized Vue wrappers with dedicated meta exports.');
}

run().catch((error) => {
  console.error('Failed to normalize Vue wrappers:', error);
  process.exitCode = 1;
});
