#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { writeManifest } from './utils/manifest.mjs';

const rootDir = process.cwd();
// Allows running the migration against an alternate legacy directory (e.g. git archive extracts).
const legacyCoursesDir = process.env.LEGACY_COURSES_DIR
  ? path.resolve(rootDir, process.env.LEGACY_COURSES_DIR)
  : path.join(rootDir, 'public', 'courses');
const targetCoursesDir = path.join(rootDir, 'src', 'content', 'courses');

const cli = parseArgs(process.argv.slice(2));

function parseArgs(argv) {
  const options = { courses: new Set(), force: false };
  for (const token of argv) {
    if (token === '--force') {
      options.force = true;
    } else if (token.startsWith('--course=')) {
      options.courses.add(token.split('=')[1]);
    } else if (token === '--help' || token === '-h') {
      printHelp();
      process.exit(0);
    } else if (token.trim()) {
      options.courses.add(token);
    }
  }
  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/migrate-content.mjs [options]`);
  console.log(
    `\nOptions:\n  --course=<id>   Limit migration to a specific course (can be provided multiple times)\n  --force         Overwrite existing vue/json files\n  -h, --help      Show this help message\n`
  );
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw.replace(/^\uFEFF/, ''));
}

function toMetaString(meta) {
  const clean = Object.fromEntries(
    Object.entries(meta).filter(([, value]) => value !== undefined && value !== '')
  );
  return JSON.stringify(clean, null, 2);
}

function escapeBackticks(content) {
  return content.replace(/`/g, '\\`');
}

async function resolveLesson(courseDir, entry) {
  const candidatePath = path.join(courseDir, 'lessons', entry.file);
  if (await exists(candidatePath)) {
    const ext = path.extname(candidatePath).toLowerCase();
    if (ext === '.json') {
      const data = await readJson(candidatePath);
      return { data, sourceJson: candidatePath };
    }
    if (ext === '.html' || ext === '.htm') {
      const html = await fs.readFile(candidatePath, 'utf8');
      return {
        data: {
          id: entry.id,
          title: entry.title,
          objective: entry.description ?? '',
          content: [
            {
              type: 'legacySection',
              id: entry.id,
              title: entry.title,
              html,
            },
          ],
        },
        sourceJson: null,
      };
    }
  }

  const fallbackJson = path.join(courseDir, 'lessons', `${entry.id}.json`);
  if (await exists(fallbackJson)) {
    const data = await readJson(fallbackJson);
    return { data, sourceJson: fallbackJson };
  }

  return null;
}

function buildLessonWrapper(entry, lessonData) {
  const meta = toMetaString({
    id: entry.id,
    title: entry.title ?? lessonData?.title ?? '',
    objective: entry.description ?? lessonData?.objective ?? undefined,
    available: entry.available,
  });

  return `<script lang="ts">
export const meta = ${meta};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './${entry.id}.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>
`;
}

function buildExerciseWrapper(entry, body) {
  const meta = toMetaString({
    id: entry.id,
    title: entry.title,
    summary: entry.description ?? entry.summary ?? undefined,
    available: entry.available,
  });

  const escapedBody = escapeBackticks(body.trim());
  const templateContent = escapedBody
    ? `<LegacyHtml :html="content" />`
    : `<p class="text-body-medium text-[var(--md-sys-color-on-surface-variant)]">
    Conteúdo indisponível para este exercício.
  </p>`;

  return (
    `<script lang="ts">
export const meta = ${meta};
export default {};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import LegacyHtml from '@/components/lesson/LegacyHtml.vue';

const content = computed(() => ` +
    '`' +
    `${escapedBody}` +
    '`' +
    `);
</script>

<template>
  ${templateContent}
</template>
`
  );
}

async function migrateLessons(courseId, options) {
  const legacyCourseDir = path.join(legacyCoursesDir, courseId);
  const legacyLessonsIndex = path.join(legacyCourseDir, 'lessons.json');
  if (!(await exists(legacyLessonsIndex))) return;

  const targetCourseDir = path.join(targetCoursesDir, courseId);
  const targetLessonsDir = path.join(targetCourseDir, 'lessons');
  await ensureDir(targetLessonsDir);

  const index = await readJson(legacyLessonsIndex);
  const newIndex = [];

  for (const entry of index) {
    const resolved = await resolveLesson(legacyCourseDir, entry);
    const indexEntry = { ...entry };
    if (!resolved) {
      console.warn(`[${courseId}] Fonte da lição ${entry.id} não encontrada (${entry.file}).`);
      newIndex.push(indexEntry);
      continue;
    }

    const lessonData = resolved.data;
    const targetJsonPath = path.join(targetLessonsDir, `${entry.id}.json`);
    const targetVuePath = path.join(targetLessonsDir, `${entry.id}.vue`);

    await fs.writeFile(targetJsonPath, `${JSON.stringify(lessonData, null, 2)}\n`, 'utf8');
    const vueContent = buildLessonWrapper(entry, lessonData);
    await fs.writeFile(targetVuePath, vueContent, 'utf8');

    indexEntry.file = `${entry.id}.vue`;
    indexEntry.title = entry.title || lessonData.title;
    if (lessonData.objective) {
      indexEntry.description = lessonData.objective;
    }
    newIndex.push(indexEntry);
  }

  const targetIndexPath = path.join(targetCourseDir, 'lessons.json');
  if (options.force || !(await exists(targetIndexPath))) {
    await writeManifest(targetIndexPath, { entries: newIndex });
  }
}

async function migrateExercises(courseId, options) {
  const legacyCourseDir = path.join(legacyCoursesDir, courseId);
  const legacyExercisesIndex = path.join(legacyCourseDir, 'exercises.json');
  if (!(await exists(legacyExercisesIndex))) return;

  const targetCourseDir = path.join(targetCoursesDir, courseId);
  const targetExercisesDir = path.join(targetCourseDir, 'exercises');
  await ensureDir(targetExercisesDir);

  const index = await readJson(legacyExercisesIndex);
  const newIndex = [];

  for (const entry of index) {
    const targetVuePath = path.join(targetExercisesDir, `${entry.id}.vue`);
    const indexEntry = { ...entry };

    if (!options.force && (await exists(targetVuePath))) {
      indexEntry.file = `${entry.id}.vue`;
      newIndex.push(indexEntry);
      continue;
    }

    let body = '';
    if (entry.link && entry.link.startsWith('courses/')) {
      const legacyPath = path.join(legacyCoursesDir, entry.link.replace('courses/', ''));
      if (await exists(legacyPath)) {
        body = await fs.readFile(legacyPath, 'utf8');
      }
    }

    const vueContent = buildExerciseWrapper(entry, body);
    await fs.writeFile(targetVuePath, vueContent, 'utf8');

    indexEntry.file = `${entry.id}.vue`;
    newIndex.push(indexEntry);
  }

  const targetIndexPath = path.join(targetCourseDir, 'exercises.json');
  if (options.force || !(await exists(targetIndexPath))) {
    await writeManifest(targetIndexPath, { entries: newIndex });
  }
}

async function migrateMeta(courseId, options) {
  const legacyCourseDir = path.join(legacyCoursesDir, courseId);
  const targetCourseDir = path.join(targetCoursesDir, courseId);
  await ensureDir(targetCourseDir);

  const legacyMeta = path.join(legacyCourseDir, 'meta.json');
  if (!(await exists(legacyMeta))) return;

  const targetMeta = path.join(targetCourseDir, 'meta.json');
  if (!options.force && (await exists(targetMeta))) return;

  const rawMeta = await fs.readFile(legacyMeta, 'utf8');
  await fs.writeFile(targetMeta, rawMeta, 'utf8');
}

async function run() {
  const availableCourses = await fs.readdir(legacyCoursesDir);
  const courseList = cli.courses.size ? [...cli.courses] : availableCourses;

  for (const courseId of courseList) {
    const legacyPath = path.join(legacyCoursesDir, courseId);
    if (!(await exists(legacyPath))) {
      console.warn(`Curso não encontrado em public/courses: ${courseId}`);
      continue;
    }
    const stats = await fs.stat(legacyPath);
    if (!stats.isDirectory()) continue;

    await migrateMeta(courseId, cli);
    await migrateLessons(courseId, cli);
    await migrateExercises(courseId, cli);
  }

  console.log('Migração concluída.');
}

run().catch((error) => {
  console.error('Erro na migração:', error);
  process.exitCode = 1;
});
