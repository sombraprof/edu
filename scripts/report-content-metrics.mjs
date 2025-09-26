#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const coursesRoot = path.join(repoRoot, 'src', 'content', 'courses');
const reportsRoot = path.join(repoRoot, 'reports');
const defaultOutputPath = path.join(reportsRoot, 'content-observability.json');

const LEGACY_BLOCK_TYPES = new Set(['html', 'dragAndDrop', 'fileTree', 'quiz']);
const MD3_BLOCK_TYPES = new Set([
  'accordion',
  'audio',
  'audioBlock',
  'bibliography',
  'bibliographyBlock',
  'callout',
  'cardGrid',
  'checklist',
  'code',
  'component',
  'contentBlock',
  'flightPlan',
  'lessonPlan',
  'md3Table',
  'representations',
  'timeline',
  'truthTable',
  'videos',
  'videosBlock',
]);

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const timestamp = new Date().toISOString();
  await fs.mkdir(reportsRoot, { recursive: true });
  if (path.dirname(options.outputPath) !== reportsRoot) {
    await fs.mkdir(path.dirname(options.outputPath), { recursive: true });
  }

  const courseDirs = (await fs.readdir(coursesRoot)).filter((entry) => !entry.startsWith('.'));
  courseDirs.sort();

  const courses = [];
  const totals = {
    courses: courseDirs.length,
    lessons: {
      total: 0,
      available: 0,
      unavailable: 0,
      legacyLessons: 0,
      md3Blocks: 0,
      legacyBlocks: 0,
      totalBlocks: 0,
    },
    exercises: { total: 0, available: 0, withMetadata: 0 },
    supplements: { total: 0, available: 0, withMetadata: 0 },
  };

  for (const courseId of courseDirs) {
    const courseMetrics = await analyseCourse(courseId);
    courses.push(courseMetrics);

    totals.lessons.total += courseMetrics.lessons.total;
    totals.lessons.available += courseMetrics.lessons.available;
    totals.lessons.unavailable += courseMetrics.lessons.unavailable;
    totals.lessons.legacyLessons += courseMetrics.lessons.legacyLessons;
    totals.lessons.md3Blocks += courseMetrics.lessons.md3Blocks;
    totals.lessons.legacyBlocks += courseMetrics.lessons.legacyBlocks;
    totals.lessons.totalBlocks += courseMetrics.lessons.totalBlocks;

    totals.exercises.total += courseMetrics.exercises.total;
    totals.exercises.available += courseMetrics.exercises.available;
    totals.exercises.withMetadata += courseMetrics.exercises.withMetadata;

    totals.supplements.total += courseMetrics.supplements.total;
    totals.supplements.available += courseMetrics.supplements.available;
    totals.supplements.withMetadata += courseMetrics.supplements.withMetadata;
  }

  const payload = {
    generatedAt: timestamp,
    totals,
    courses,
  };

  await fs.writeFile(options.outputPath, JSON.stringify(payload, null, 2));
  logSummary(payload, options.outputPath);

  if (options.failOnMetadataGaps) {
    const issues = collectMetadataGaps(payload);
    if (issues.length > 0) {
      console.error('\nErros de metadados detectados:');
      for (const issue of issues) {
        console.error(`- ${issue}`);
      }
      process.exitCode = 1;
    }
  }
}

async function analyseCourse(courseId) {
  const courseDir = path.join(coursesRoot, courseId);
  const meta = await readJson(path.join(courseDir, 'meta.json')).catch(() => ({}));
  const lessonsIndex = await readJson(path.join(courseDir, 'lessons.json')).catch(() => []);
  const exercisesManifest = await readJson(path.join(courseDir, 'exercises.json')).catch(() => []);
  const supplementsManifest = await readJson(path.join(courseDir, 'supplements.json')).catch(
    () => []
  );

  const lessonMetrics = await analyseLessons(courseDir, lessonsIndex);
  const exerciseMetrics = await analyseExercises(courseDir, exercisesManifest);
  const supplementMetrics = analyseSupplements(supplementsManifest);

  return {
    id: courseId,
    title: meta.title ?? null,
    institution: meta.institution ?? null,
    lessons: lessonMetrics,
    exercises: exerciseMetrics,
    supplements: supplementMetrics,
  };
}

async function analyseLessons(courseDir, lessonsIndex) {
  let available = 0;
  let unavailable = 0;
  let totalBlocks = 0;
  let md3Blocks = 0;
  let legacyBlocks = 0;
  const legacyLessons = new Set();
  const blocksByType = new Map();
  const legacyByType = new Map();

  for (const entry of lessonsIndex) {
    if (!entry || typeof entry !== 'object') continue;
    const lessonId = typeof entry.id === 'string' ? entry.id : null;
    const file = typeof entry.file === 'string' ? entry.file : null;
    const isAvailable = entry.available !== false;
    if (isAvailable) {
      available += 1;
    } else {
      unavailable += 1;
    }

    if (!lessonId || !file) continue;
    const lessonPath = path.join(courseDir, 'lessons', `${lessonId}.json`);
    const lessonData = await readJson(lessonPath).catch(() => null);
    if (!lessonData || !Array.isArray(lessonData.content)) continue;

    let hasLegacy = false;
    for (const block of lessonData.content) {
      if (!block || typeof block !== 'object') continue;
      const type = typeof block.type === 'string' ? block.type : 'desconhecido';
      increment(blocksByType, type);
      totalBlocks += 1;

      if (LEGACY_BLOCK_TYPES.has(type)) {
        hasLegacy = true;
        legacyBlocks += 1;
        increment(legacyByType, type);
      } else if (MD3_BLOCK_TYPES.has(type)) {
        md3Blocks += 1;
      }
    }

    if (hasLegacy) {
      legacyLessons.add(lessonId);
    }
  }

  return {
    total: lessonsIndex.length,
    available,
    unavailable,
    totalBlocks,
    md3Blocks,
    legacyBlocks,
    legacyLessons: legacyLessons.size,
    legacyLessonIds: Array.from(legacyLessons).sort(),
    blocksByType: mapToObject(blocksByType),
    legacyBlocksByType: mapToObject(legacyByType),
  };
}

async function analyseExercises(courseDir, manifest) {
  let available = 0;
  let withMetadata = 0;
  let legacySections = 0;
  const idsWithLegacy = new Set();
  const total = Array.isArray(manifest) ? manifest.length : 0;

  for (const entry of Array.isArray(manifest) ? manifest : []) {
    if (!entry || typeof entry !== 'object') continue;
    if (entry.available !== false) {
      available += 1;
    }
    if (entry.metadata && typeof entry.metadata === 'object') {
      const { generatedBy, model, timestamp } = entry.metadata;
      if (generatedBy && model && timestamp) {
        withMetadata += 1;
      }
    }
    const exerciseId = typeof entry.id === 'string' ? entry.id : null;
    if (!exerciseId) continue;
    const exercisePath = path.join(courseDir, 'exercises', `${exerciseId}.json`);
    const exerciseData = await readJson(exercisePath).catch(() => null);
    if (!exerciseData || !Array.isArray(exerciseData.content)) continue;
    if (
      exerciseData.content.some(
        (block) => block && typeof block === 'object' && block.type === 'legacySection'
      )
    ) {
      idsWithLegacy.add(exerciseId);
      legacySections += 1;
    }
  }

  return {
    total,
    available,
    withMetadata,
    legacyEntries: legacySections,
    legacyIds: Array.from(idsWithLegacy).sort(),
  };
}

function analyseSupplements(manifest) {
  let available = 0;
  let withMetadata = 0;

  for (const entry of Array.isArray(manifest) ? manifest : []) {
    if (!entry || typeof entry !== 'object') continue;
    if (entry.available !== false) {
      available += 1;
    }
    if (entry.metadata && typeof entry.metadata === 'object') {
      const { generatedBy, model, timestamp } = entry.metadata;
      if (generatedBy && model && timestamp) {
        withMetadata += 1;
      }
    }
  }

  return {
    total: Array.isArray(manifest) ? manifest.length : 0,
    available,
    withMetadata,
  };
}

function increment(map, key) {
  const current = map.get(key) ?? 0;
  map.set(key, current + 1);
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function mapToObject(map) {
  return Object.fromEntries([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function logSummary(payload, outputPath) {
  const { totals } = payload;
  const md3Coverage = totals.lessons.totalBlocks
    ? ((totals.lessons.md3Blocks / totals.lessons.totalBlocks) * 100).toFixed(1)
    : '0.0';
  const legacyCoverage = totals.lessons.totalBlocks
    ? ((totals.lessons.legacyBlocks / totals.lessons.totalBlocks) * 100).toFixed(1)
    : '0.0';
  console.log(`Relatório de observabilidade salvo em ${outputPath}`);
  console.log(
    `Lições: ${totals.lessons.total} (publicadas: ${totals.lessons.available}, pendentes: ${totals.lessons.unavailable})`
  );
  console.log(
    `Blocos MD3: ${totals.lessons.md3Blocks} (${md3Coverage}%); blocos legados: ${totals.lessons.legacyBlocks} (${legacyCoverage}%)`
  );
  console.log(
    `Exercícios com metadados completos: ${totals.exercises.withMetadata}/${totals.exercises.total}; suplementos: ${totals.supplements.withMetadata}/${totals.supplements.total}`
  );
}

function parseArgs(args) {
  const options = {
    outputPath: defaultOutputPath,
    failOnMetadataGaps: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--output' || arg === '--report') {
      const next = args[index + 1];
      if (!next) {
        throw new Error('É necessário informar um caminho após --output.');
      }
      options.outputPath = path.resolve(next);
      index += 1;
    } else if (arg === '--fail-on-metadata-gaps' || arg === '--check') {
      options.failOnMetadataGaps = true;
    }
  }

  return options;
}

function collectMetadataGaps(payload) {
  const issues = [];
  for (const course of payload.courses) {
    const { id } = course;
    if (course.exercises.total > course.exercises.withMetadata) {
      const missing = course.exercises.total - course.exercises.withMetadata;
      issues.push(
        `Curso ${id}: ${missing} exercício(s) sem metadados obrigatórios (generatedBy/model/timestamp).`
      );
    }
    if (course.supplements.total > course.supplements.withMetadata) {
      const missing = course.supplements.total - course.supplements.withMetadata;
      issues.push(
        `Curso ${id}: ${missing} suplemento(s) sem metadados obrigatórios (generatedBy/model/timestamp).`
      );
    }
  }
  return issues;
}

main().catch((error) => {
  console.error('Falha ao gerar relatório de observabilidade:', error);
  process.exitCode = 1;
});
