#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const contentRoot = path.join(repoRoot, 'src', 'content', 'courses');

const HELP_MESSAGE = `Usage: npm run scaffold:lesson -- --course <slug> (--id <id> | --number <n>) --title <title> [options]

Options:
  --course        Course slug (e.g. algi, lpoo)
  --id            Lesson identifier (e.g. lesson-05)
  --number        Lesson sequential number (e.g. 5) used to derive the id (lesson-05)
  --title         Lesson title
  --objective     Short objective used in meta and JSON (optional)
  --description   Description summary to append to lessons.json (optional)
  --available     Mark lesson as available in lessons.json and meta (default: false)
  --force         Overwrite existing files if they already exist
  --help          Show this message
`;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith('--')) continue;
    const key = current.slice(2);
    if (key === 'help') {
      args.help = true;
      continue;
    }

    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = value;
    i += 1;
  }
  return args;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson(filePath, defaultValue) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT' && defaultValue !== undefined) {
      return defaultValue;
    }
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function createLessonMeta({ id, title, objective, available }) {
  const sanitizedObjective = objective || 'Atualize este objetivo antes da publicação.';
  return `
<script lang="ts">
export const meta = {
  id: '${id}',
  title: '${title.replace(/'/g, "\\'")}',
  objective: '${sanitizedObjective.replace(/'/g, "\\'")}',
  available: ${available},
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './${id}.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>
`.trimStart();
}

function createLessonJson({ id, title, objective }) {
  return {
    id,
    title,
    objective: objective || 'Defina o objetivo pedagógico da aula.',
    content: [],
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  if (args.help) {
    console.log(HELP_MESSAGE);
    return;
  }

  const { course } = args;
  let { id } = args;
  const { title } = args;
  assert(course, 'Missing required argument: --course');
  assert(title, 'Missing required argument: --title');

  let numberArg;
  if (args.number !== undefined) {
    numberArg = Number.parseInt(args.number, 10);
    if (Number.isNaN(numberArg)) {
      throw new Error('The value passed to --number must be an integer.');
    }
  }

  if (numberArg !== undefined) {
    assert(numberArg > 0, '--number must be greater than 0.');
    const generatedId = `lesson-${String(numberArg).padStart(2, '0')}`;
    if (id && id !== generatedId) {
      throw new Error(
        `Provided id (${id}) does not match the generated id from --number (${generatedId}).`
      );
    }
    id = generatedId;
  }

  assert(id, 'Missing required argument: provide --id or --number.');

  if (!/^lesson-[0-9]{2,}$/.test(id)) {
    throw new Error('Lesson ids must follow the pattern "lesson-XX" (two or more digits).');
  }

  const courseDir = path.join(contentRoot, course);
  try {
    const stat = await fs.stat(courseDir);
    assert(stat.isDirectory(), `Course directory is not valid: ${courseDir}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Course "${course}" was not found in src/content/courses.`);
    }
    throw error;
  }

  const lessonsDir = path.join(courseDir, 'lessons');
  const vuePath = path.join(lessonsDir, `${id}.vue`);
  const jsonPath = path.join(lessonsDir, `${id}.json`);
  const lessonsIndexPath = path.join(courseDir, 'lessons.json');

  const [lessonsIndex] = await Promise.all([readJson(lessonsIndexPath, []), ensureDir(lessonsDir)]);

  const duplicate = lessonsIndex.find((entry) => entry.id === id);
  assert(!duplicate, `Lesson id "${id}" already exists in ${lessonsIndexPath}.`);

  const description = args.description || '';
  const available = Boolean(args.available);
  const objective = args.objective || '';

  const newEntry = {
    id,
    title,
    file: `${id}.vue`,
    available,
  };

  if (description) {
    newEntry.description = description;
  }

  lessonsIndex.push(newEntry);
  lessonsIndex.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  const lessonJson = createLessonJson({ id, title, objective });
  const lessonMeta = createLessonMeta({ id, title, objective, available });

  const filesToWrite = [
    writeJson(lessonsIndexPath, lessonsIndex),
    fs.writeFile(jsonPath, `${JSON.stringify(lessonJson, null, 2)}\n`, {
      flag: args.force ? 'w' : 'wx',
    }),
    fs.writeFile(vuePath, `${lessonMeta}\n`, { flag: args.force ? 'w' : 'wx' }),
  ];

  try {
    await Promise.all(filesToWrite);
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error(`Lesson files already exist. Use --force to overwrite.`);
    }
    throw error;
  }

  console.log(`✔️  Lesson ${id} scaffolded for course ${course}.`);
  console.log(`  - ${path.relative(repoRoot, lessonsIndexPath)}`);
  console.log(`  - ${path.relative(repoRoot, jsonPath)}`);
  console.log(`  - ${path.relative(repoRoot, vuePath)}`);
}

main().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exitCode = 1;
});
