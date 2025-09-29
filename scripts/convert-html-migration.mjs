#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { writeManifest } from './utils/manifest.mjs';
import TurndownService from 'turndown';

const courses = ['lpoo', 'ddm', 'tdjd', 'tgs'];
const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
turndown.keep(['table', 'thead', 'tbody', 'tr', 'th', 'td']);

async function readJsonClean(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw.replace(/^\uFEFF/, ''));
}

function sanitizeHtml(html) {
  return html
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '')
    .replace(/<main[^>]*>/gi, '')
    .replace(/<\/main>/gi, '');
}

function htmlToMarkdown(html) {
  const md = turndown.turndown(sanitizeHtml(html));
  return md.replace(/\n{3,}/g, '\n\n').trim();
}

async function convertLessons(course) {
  const legacyDir = path.join('public', 'courses', course);
  const targetDir = path.join('src', 'content', 'courses', course);
  const legacyIndexPath = path.join(legacyDir, 'lessons.json');
  if (!(await exists(legacyIndexPath))) return;

  const lessonsIndex = await readJsonClean(legacyIndexPath);
  const targetLessonsDir = path.join(targetDir, 'lessons');
  await fs.mkdir(targetLessonsDir, { recursive: true });

  const newIndex = [];

  for (const entry of lessonsIndex) {
    const sourcePath = path.join(legacyDir, 'lessons', entry.file);
    if (!(await exists(sourcePath))) {
      console.warn(`[${course}] lesson source missing: ${entry.file}`);
      continue;
    }

    let markdownBody = '';
    let objective = '';

    if (sourcePath.endsWith('.json')) {
      const data = await readJsonClean(sourcePath);
      objective = data.objective || '';
      if (Array.isArray(data.content)) {
        const htmlSegments = data.content
          .filter((block) => typeof block.html === 'string')
          .map((block) => block.html);
        if (htmlSegments.length) {
          markdownBody = htmlSegments.map(htmlToMarkdown).join('\n\n');
        }
      }
    } else if (sourcePath.endsWith('.html')) {
      markdownBody = htmlToMarkdown(await fs.readFile(sourcePath, 'utf8'));
    }

    const frontmatter = [
      '---',
      `id: ${JSON.stringify(entry.id)}`,
      `title: ${JSON.stringify(entry.title)}`,
      `objective: ${JSON.stringify(objective || '')}`,
      `available: ${entry.available ?? true}`,
      '---',
      '',
    ].join('\n');

    const mdPath = path.join(targetLessonsDir, `${entry.id}.md`);
    await fs.writeFile(mdPath, `${frontmatter}${markdownBody}\n`, 'utf8');

    newIndex.push({
      id: entry.id,
      title: entry.title,
      file: `${entry.id}.md`,
      available: entry.available ?? true,
      description: objective || undefined,
    });
  }

  const targetIndexPath = path.join(targetDir, 'lessons.json');
  await writeManifest(targetIndexPath, { entries: newIndex });
}

async function convertExercises(course) {
  const legacyDir = path.join('public', 'courses', course);
  const targetDir = path.join('src', 'content', 'courses', course);
  const legacyIndexPath = path.join(legacyDir, 'exercises.json');
  if (!(await exists(legacyIndexPath))) return;

  const exercisesIndex = await readJsonClean(legacyIndexPath);
  const targetExercisesDir = path.join(targetDir, 'exercises');
  await fs.mkdir(targetExercisesDir, { recursive: true });

  const newIndex = [];

  for (const entry of exercisesIndex) {
    let markdownBody = '';
    let title = entry.title;
    let summary = entry.summary || entry.description || '';

    if (entry.link && entry.link.endsWith('.html')) {
      const sourcePath = path.join('public', entry.link);
      if (await exists(sourcePath)) {
        markdownBody = htmlToMarkdown(await fs.readFile(sourcePath, 'utf8'));
      } else {
        console.warn(`[${course}] exercise source missing: ${entry.link}`);
      }
    } else if (entry.file && entry.file.endsWith('.json')) {
      const sourcePath = path.join(legacyDir, 'exercises', entry.file);
      if (await exists(sourcePath)) {
        const data = await readJsonClean(sourcePath);
        if (data.title) title = data.title;
        if (data.summary) summary = data.summary;
        if (typeof data.content === 'string') {
          markdownBody = htmlToMarkdown(data.content);
        }
      }
    }

    const frontmatter = [
      '---',
      `id: ${JSON.stringify(entry.id)}`,
      `title: ${JSON.stringify(title)}`,
      `summary: ${JSON.stringify(summary)}`,
      `available: ${entry.available ?? false}`,
      '---',
      '',
    ].join('\n');

    const mdPath = path.join(targetExercisesDir, `${entry.id}.md`);
    await fs.writeFile(mdPath, `${frontmatter}${markdownBody}\n`, 'utf8');

    newIndex.push({
      id: entry.id,
      title,
      summary,
      available: entry.available ?? false,
      file: `${entry.id}.md`,
    });
  }

  const targetIndexPath = path.join(targetDir, 'exercises.json');
  await writeManifest(targetIndexPath, { entries: newIndex });
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

for (const course of courses) {
  await convertLessons(course);
  await convertExercises(course);
}

console.log('HTML-to-Markdown conversion completed for courses:', courses.join(', '));
