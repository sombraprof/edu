#!/usr/bin/env node
/**
 * Creates or updates a lesson JSON + Vue wrapper starting from an HTML file composed of <section> blocks.
 *
 * Usage:
 *   node scripts/create-lesson-from-html.mjs \
 *     --course algi \
 *     --id lesson42 \
 *     --title "Aula 42" \
 *     --objective "Objetivo da aula" \
 *     --input caminho/para/aula.html
 *
 * If --input is omitted the script reads from STDIN, allowing direct piping from another command or AI output.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) continue;
    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function requireArg(args, name) {
  const value = args[name];
  if (!value || typeof value !== 'string') {
    console.error(`Missing required argument --${name}`);
    process.exit(1);
  }
  return value;
}

async function readInput(args) {
  if (typeof args.input === 'string') {
    const targetPath = path.resolve(args.input);
    return await fs.readFile(targetPath, 'utf8');
  }

  if (!process.stdin.isTTY) {
    let data = '';
    for await (const chunk of process.stdin) {
      data += chunk;
    }
    if (data.trim()) return data;
  }

  console.error('No HTML provided. Pass --input <file> or pipe HTML through STDIN.');
  process.exit(1);
}

function stripClassAttributes(html) {
  return html.replace(/\sclass=\"([^\"]*)\"/g, (_, value) => {
    if (value.includes('legacy-section__icon')) {
      return ' class=\"legacy-section__icon\"';
    }
    return '';
  });
}

function sanitizeSection(section) {
  section
    .querySelectorAll('script, style, link, iframe, noscript, meta')
    .forEach((node) => node.remove());
  return section;
}

function markLegacyCards(root) {
  const directChildren = Array.from(root.children);
  directChildren
    .filter((child) => child.tagName === 'DIV')
    .forEach((child) => {
      const nestedDivs = Array.from(child.children).filter((node) => node.tagName === 'DIV');
      if (nestedDivs.length > 1) {
        child.setAttribute('data-legacy-grid', '');
        nestedDivs.forEach((node) => node.setAttribute('data-legacy-card', ''));
      } else {
        child.setAttribute('data-legacy-card', '');
      }
    });
}

function normalizeText(text) {
  return text ? text.replace(/\s+/g, ' ').trim() : '';
}

function extractSectionBlock(section) {
  const sanitized = sanitizeSection(section.cloneNode(true));
  markLegacyCards(sanitized);

  const heading = sanitized.querySelector('h1, h2, h3, h4, h5, h6');
  const title = normalizeText(heading?.textContent ?? '');

  if (heading) heading.remove();

  const sectionId = sanitized.getAttribute('id') || undefined;
  const bodyHtml = stripClassAttributes(sanitized.innerHTML)
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!bodyHtml) return null;

  return {
    type: 'legacySection',
    id: sectionId,
    title,
    html: bodyHtml,
  };
}

function convertHtmlToSections(html) {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  document.querySelectorAll('nav, header, footer').forEach((node) => node.remove());

  const container = document.querySelector('main') || document.body;
  const sections = Array.from(container.querySelectorAll('section'));

  if (!sections.length) {
    const bodyHtml = stripClassAttributes(container.innerHTML.trim());
    if (!bodyHtml) return [];
    return [
      {
        type: 'legacySection',
        title: '',
        html: bodyHtml,
      },
    ];
  }

  return sections.map((section) => extractSectionBlock(section)).filter((block) => Boolean(block));
}

function ensureTrailingNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

function createVueWrapper({ id, title, objective, available }) {
  const metaLines = [
    'export const meta = {',
    `  id: ${JSON.stringify(id)},`,
    `  title: ${JSON.stringify(title)},`,
  ];
  if (objective) {
    metaLines.push(`  objective: ${JSON.stringify(objective)},`);
  }
  metaLines.push(`  available: ${available},`);
  metaLines.push('};');

  return ensureTrailingNewline(
    `
<script lang="ts">
${metaLines.join('\n')}
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './${id}.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>
`.trimStart()
  );
}

async function loadJson(pathname) {
  try {
    const raw = await fs.readFile(pathname, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function upsertLessonIndex(index, entry) {
  const existingIndex = index.findIndex((item) => item.id === entry.id);
  if (existingIndex >= 0) {
    index[existingIndex] = { ...index[existingIndex], ...entry };
  } else {
    index.push(entry);
  }
  index.sort((a, b) => a.id.localeCompare(b.id));
  return index;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));

  const courseId = requireArg(args, 'course');
  const lessonId = requireArg(args, 'id');
  const title = requireArg(args, 'title');
  const objective = typeof args.objective === 'string' ? args.objective : '';
  const available = args.available === 'false' ? false : true;

  const html = await readInput(args);
  const content = convertHtmlToSections(html);

  if (!content.length) {
    console.error('No usable <section> blocks were found in the provided HTML.');
    process.exit(1);
  }

  const targetCourseDir = path.join(projectRoot, 'src', 'content', 'courses', courseId);
  const lessonsDir = path.join(targetCourseDir, 'lessons');
  await fs.mkdir(lessonsDir, { recursive: true });

  const jsonPath = path.join(lessonsDir, `${lessonId}.json`);
  const vuePath = path.join(lessonsDir, `${lessonId}.vue`);
  const indexPath = path.join(targetCourseDir, 'lessons.json');

  const lessonData = {
    id: lessonId,
    title,
    ...(objective ? { objective } : {}),
    content,
  };

  await fs.writeFile(jsonPath, ensureTrailingNewline(JSON.stringify(lessonData, null, 2)), 'utf8');
  await fs.writeFile(
    vuePath,
    createVueWrapper({ id: lessonId, title, objective, available }),
    'utf8'
  );

  const lessonsIndex = (await loadJson(indexPath)) ?? [];
  upsertLessonIndex(lessonsIndex, {
    id: lessonId,
    title,
    file: `${lessonId}.vue`,
    available,
    ...(objective ? { description: objective } : {}),
  });
  await fs.writeFile(
    indexPath,
    ensureTrailingNewline(JSON.stringify(lessonsIndex, null, 2)),
    'utf8'
  );

  console.log(`Lesson ${lessonId} for course ${courseId} updated.`);
  console.log(`- JSON: ${path.relative(projectRoot, jsonPath)}`);
  console.log(`- Vue: ${path.relative(projectRoot, vuePath)}`);
  console.log(`- Index: ${path.relative(projectRoot, indexPath)}`);
}

run().catch((error) => {
  console.error('Failed to create lesson from HTML:', error);
  process.exitCode = 1;
});
