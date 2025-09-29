#!/usr/bin/env node
/**
 * Transforms legacy HTML lessons into structured legacySection blocks ready for LessonRenderer.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { getManifestEntries, readManifest } from './utils/manifest.mjs';

const rootDir = process.cwd();
const targetCoursesDir = path.join(rootDir, 'src', 'content', 'courses');
const legacyCoursesDir = path.join(rootDir, 'public', 'courses');

const courses = ['lpoo', 'ddm', 'tdjd', 'tgs'];

const iconMap = new Map([
  ['fa-puzzle-piece', '🧩'],
  ['fa-clock', '⏱️'],
  ['fa-shapes', '🧱'],
  ['fa-bullseye', '🎯'],
  ['fa-book-open', '📖'],
  ['fa-gears', '⚙️'],
  ['fa-graduation-cap', '🎓'],
  ['fa-list-check', '✅'],
  ['fa-check', '✔️'],
  ['fa-book-bookmark', '📘'],
  ['fa-github', '🐱'],
  ['fa-play-circle', '▶️'],
  ['fa-lightbulb', '💡'],
]);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function sanitizeSection(section) {
  section
    .querySelectorAll('script, style, link, iframe, noscript, meta')
    .forEach((node) => node.remove());
  section.querySelectorAll('i').forEach((node) => {
    const classes = Array.from(node.classList || []);
    const matched = classes.find((cls) => iconMap.has(cls));
    if (matched) {
      const icon = section.ownerDocument.createElement('span');
      icon.className = 'legacy-section__icon';
      icon.setAttribute('aria-hidden', node.getAttribute('aria-hidden') || 'true');
      icon.setAttribute('data-legacy-icon', matched.replace('fa-', ''));
      icon.textContent = iconMap.get(matched) ?? '';
      node.replaceWith(icon);
    } else {
      node.remove();
    }
  });
  return section;
}

function normalizeText(text) {
  return text ? text.replace(/\s+/g, ' ').trim() : '';
}

function stripClassAttributes(html) {
  return html.replace(/\sclass=\"([^\"]*)\"/g, (_, value) => {
    if (value.includes('legacy-section__icon')) {
      return ' class=\"legacy-section__icon\"';
    }
    return '';
  });
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

function extractSectionBlock(section) {
  const sanitized = sanitizeSection(section.cloneNode(true));
  markLegacyCards(sanitized);

  const heading = sanitized.querySelector('h1, h2, h3, h4, h5, h6');
  const title = normalizeText(heading?.textContent ?? '');

  if (heading) {
    heading.remove();
  }

  const sectionId = sanitized.getAttribute('id') || undefined;
  const bodyHtml = stripClassAttributes(sanitized.innerHTML)
    .replace(/\s{2,}/g, ' ')
    .trim();

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
  const sections = [...container.querySelectorAll('section')];

  if (!sections.length) {
    const bodyHtml = stripClassAttributes(container.innerHTML.trim());
    if (bodyHtml) {
      return [
        {
          type: 'legacySection',
          title: '',
          html: bodyHtml,
        },
      ];
    }
    return [];
  }

  return sections.map((section) => extractSectionBlock(section)).filter((block) => block.html);
}

async function loadLegacyHtml(courseId, lessonId) {
  const legacyJsonPath = path.join(legacyCoursesDir, courseId, 'lessons', `${lessonId}.json`);
  if (await exists(legacyJsonPath)) {
    const raw = await fs.readFile(legacyJsonPath, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data.content)) {
      const htmlBlock = data.content.find(
        (block) => block.type === 'html' && typeof block.html === 'string'
      );
      if (htmlBlock?.html) {
        return htmlBlock.html;
      }
    }
  }

  const legacyHtmlPath = path.join(legacyCoursesDir, courseId, 'lessons', `${lessonId}.html`);
  if (await exists(legacyHtmlPath)) {
    return await fs.readFile(legacyHtmlPath, 'utf8');
  }

  return null;
}

async function convertLesson(courseId, lessonId) {
  const jsonPath = path.join(targetCoursesDir, courseId, 'lessons', `${lessonId}.json`);
  if (!(await exists(jsonPath))) return;

  const legacyHtml = await loadLegacyHtml(courseId, lessonId);
  if (!legacyHtml) return;

  const raw = await fs.readFile(jsonPath, 'utf8');
  const data = JSON.parse(raw);

  const sections = convertHtmlToSections(legacyHtml);
  if (!sections.length) return;

  data.content = sections;
  await fs.writeFile(jsonPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`[${courseId}] structured lesson ${lessonId}`);
}

async function convertLessons(courseId) {
  const lessonsIndexPath = path.join(targetCoursesDir, courseId, 'lessons.json');
  if (!(await exists(lessonsIndexPath))) return;

  const manifest = await readManifest(lessonsIndexPath);
  const lessonsIndex = getManifestEntries(manifest);

  for (const lesson of lessonsIndex) {
    await convertLesson(courseId, lesson.id);
  }
}

async function run() {
  for (const courseId of courses) {
    await convertLessons(courseId);
  }
}

run().catch((error) => {
  console.error('Failed to build structured legacy sections:', error);
  process.exitCode = 1;
});
