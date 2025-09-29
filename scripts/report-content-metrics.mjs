#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MANIFEST_VERSION, getManifestEntries, readManifest } from './utils/manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const coursesRoot = path.join(repoRoot, 'src', 'content', 'courses');
const reportsRoot = path.join(repoRoot, 'reports');
const defaultOutputPath = path.join(reportsRoot, 'content-observability.json');
const defaultHistoryPath = path.join(reportsRoot, 'content-observability-history.json');
const defaultTrendsPath = path.join(reportsRoot, 'content-observability-trends.json');

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
  await fs.mkdir(path.dirname(options.outputPath), { recursive: true });
  await fs.mkdir(path.dirname(options.historyPath), { recursive: true });
  await fs.mkdir(path.dirname(options.trendsPath), { recursive: true });

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

  await fs.writeFile(options.outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const history = await loadHistory(options.historyPath);
  const previousSnapshot = history.length > 0 ? history[history.length - 1] : null;
  const snapshot = buildSnapshot(payload, timestamp);
  const updatedHistory = [...history, snapshot];
  await fs.writeFile(options.historyPath, `${JSON.stringify(updatedHistory, null, 2)}\n`, 'utf8');

  const analytics = buildAnalytics({ snapshot, previousSnapshot, history: updatedHistory });
  await fs.writeFile(options.trendsPath, `${JSON.stringify(analytics.export, null, 2)}\n`, 'utf8');

  logSummary(payload, options.outputPath, analytics.summary);

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
  const lessonsManifest = await readManifest(path.join(courseDir, 'lessons.json'));
  const exercisesManifest = await readManifest(path.join(courseDir, 'exercises.json'));
  const supplementsManifest = await readManifest(path.join(courseDir, 'supplements.json'));

  validateManifestVersion(courseId, 'lessons', lessonsManifest.version);
  validateManifestVersion(courseId, 'exercises', exercisesManifest.version);
  validateManifestVersion(courseId, 'supplements', supplementsManifest.version);

  const lessonMetrics = await analyseLessons(courseDir, getManifestEntries(lessonsManifest));
  const exerciseMetrics = await analyseExercises(courseDir, getManifestEntries(exercisesManifest));
  const supplementMetrics = analyseSupplements(getManifestEntries(supplementsManifest));

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

function logSummary(payload, outputPath, summary) {
  const { totals } = payload;
  console.log(`Relatório de observabilidade salvo em ${outputPath}`);
  console.log(
    `Lições: ${totals.lessons.total} (publicadas: ${totals.lessons.available}, pendentes: ${totals.lessons.unavailable})`
  );
  console.log(
    `Cobertura MD3: ${summary.lessons.md3Coverage.current.toFixed(1)}% (${formatDelta(summary.lessons.md3Coverage.delta, 'p.p.')}) ${summary.lessons.md3Coverage.sparkline}`
  );
  console.log(
    `Blocos legados: ${formatNumber(summary.lessons.legacyBlocks.current)} (${formatDelta(summary.lessons.legacyBlocks.delta)} | ${formatPercent(summary.lessons.legacyBlocks.percentChange)}) ${summary.lessons.legacyBlocks.sparkline}`
  );
  console.log(
    `Exercícios sem metadados: ${formatNumber(summary.exercises.withoutMetadata.current)} (${formatDelta(summary.exercises.withoutMetadata.delta)} | ${formatPercent(summary.exercises.withoutMetadata.percentChange)}) ${summary.exercises.completeness.sparkline}`
  );
  console.log(
    `Suplementos sem metadados: ${formatNumber(summary.supplements.withoutMetadata.current)} (${formatDelta(summary.supplements.withoutMetadata.delta)} | ${formatPercent(summary.supplements.withoutMetadata.percentChange)}) ${summary.supplements.completeness.sparkline}`
  );
}

function parseArgs(args) {
  const options = {
    outputPath: defaultOutputPath,
    historyPath: defaultHistoryPath,
    trendsPath: defaultTrendsPath,
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
    } else if (arg === '--history') {
      const next = args[index + 1];
      if (!next) {
        throw new Error('É necessário informar um caminho após --history.');
      }
      options.historyPath = path.resolve(next);
      index += 1;
    } else if (arg === '--trends') {
      const next = args[index + 1];
      if (!next) {
        throw new Error('É necessário informar um caminho após --trends.');
      }
      options.trendsPath = path.resolve(next);
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

function validateManifestVersion(courseId, manifestName, version) {
  if (!version || version === 'legacy' || version !== MANIFEST_VERSION) {
    console.warn(
      `⚠️  Manifesto ${manifestName}.json do curso ${courseId} está com versão inválida (${version ?? 'indefinida'}). Utilize ${MANIFEST_VERSION}.`
    );
  }
}

async function loadHistory(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

function buildSnapshot(payload, generatedAt) {
  const { totals } = payload;
  const md3Coverage = totals.lessons.totalBlocks
    ? totals.lessons.md3Blocks / totals.lessons.totalBlocks
    : 0;
  const legacyCoverage = totals.lessons.totalBlocks
    ? totals.lessons.legacyBlocks / totals.lessons.totalBlocks
    : 0;
  const exercisesWithoutMetadata = Math.max(
    0,
    totals.exercises.total - totals.exercises.withMetadata
  );
  const supplementsWithoutMetadata = Math.max(
    0,
    totals.supplements.total - totals.supplements.withMetadata
  );

  return {
    generatedAt,
    lessons: {
      total: totals.lessons.total,
      available: totals.lessons.available,
      unavailable: totals.lessons.unavailable,
      md3Blocks: totals.lessons.md3Blocks,
      legacyBlocks: totals.lessons.legacyBlocks,
      legacyLessons: totals.lessons.legacyLessons,
      totalBlocks: totals.lessons.totalBlocks,
      md3Coverage,
      legacyCoverage,
    },
    exercises: {
      total: totals.exercises.total,
      withMetadata: totals.exercises.withMetadata,
      withoutMetadata: exercisesWithoutMetadata,
      completeness: totals.exercises.total
        ? totals.exercises.withMetadata / totals.exercises.total
        : 0,
    },
    supplements: {
      total: totals.supplements.total,
      withMetadata: totals.supplements.withMetadata,
      withoutMetadata: supplementsWithoutMetadata,
      completeness: totals.supplements.total
        ? totals.supplements.withMetadata / totals.supplements.total
        : 0,
    },
  };
}

function buildAnalytics({ snapshot, previousSnapshot, history }) {
  const trend = computeTrend(snapshot, previousSnapshot);
  const sparklines = buildSparklines(history);
  const exportPayload = buildExportPayload({ snapshot, history, trend, sparklines });
  const summary = buildSummaryAnalytics({ snapshot, trend, sparklines });
  return { export: exportPayload, summary };
}

function computeTrend(current, previous) {
  if (!previous) {
    return null;
  }

  return {
    lessons: {
      md3Blocks: buildTrendEntry(current.lessons.md3Blocks, previous.lessons.md3Blocks),
      legacyBlocks: buildTrendEntry(current.lessons.legacyBlocks, previous.lessons.legacyBlocks),
      legacyLessons: buildTrendEntry(current.lessons.legacyLessons, previous.lessons.legacyLessons),
      md3Coverage: buildTrendEntry(current.lessons.md3Coverage, previous.lessons.md3Coverage, {
        multiplier: 100,
        format: 'points',
      }),
      legacyCoverage: buildTrendEntry(
        current.lessons.legacyCoverage,
        previous.lessons.legacyCoverage,
        { multiplier: 100, format: 'points' }
      ),
    },
    exercises: {
      withoutMetadata: buildTrendEntry(
        current.exercises.withoutMetadata,
        previous.exercises.withoutMetadata
      ),
      completeness: buildTrendEntry(
        current.exercises.completeness,
        previous.exercises.completeness,
        { multiplier: 100, format: 'points' }
      ),
    },
    supplements: {
      withoutMetadata: buildTrendEntry(
        current.supplements.withoutMetadata,
        previous.supplements.withoutMetadata
      ),
      completeness: buildTrendEntry(
        current.supplements.completeness,
        previous.supplements.completeness,
        { multiplier: 100, format: 'points' }
      ),
    },
  };
}

function buildTrendEntry(current, previous, { multiplier = 1, format = 'absolute' } = {}) {
  const currentValue = Number((current ?? 0) * multiplier);
  const previousValue = Number((previous ?? 0) * multiplier);
  const delta = currentValue - previousValue;

  let percentChange = null;
  if (previousValue === 0) {
    percentChange = currentValue === 0 ? 0 : null;
  } else {
    percentChange = (delta / Math.abs(previousValue)) * 100;
  }

  return {
    current: currentValue,
    previous: previousValue,
    delta,
    percentChange,
    format,
  };
}

function buildSparklines(history) {
  const windowSize = 12;
  return {
    md3Coverage: sparkline(history, (entry) => entry.lessons.md3Coverage * 100, windowSize),
    legacyBlocks: sparkline(history, (entry) => entry.lessons.legacyBlocks, windowSize),
    exercisesCompleteness: sparkline(
      history,
      (entry) => entry.exercises.completeness * 100,
      windowSize
    ),
    supplementsCompleteness: sparkline(
      history,
      (entry) => entry.supplements.completeness * 100,
      windowSize
    ),
  };
}

function buildExportPayload({ snapshot, history, trend, sparklines }) {
  const series = {
    md3Coverage: history.map((entry) => ({
      generatedAt: entry.generatedAt,
      value: Number((entry.lessons.md3Coverage * 100).toFixed(2)),
    })),
    legacyBlocks: history.map((entry) => ({
      generatedAt: entry.generatedAt,
      value: entry.lessons.legacyBlocks,
    })),
    exercisesCompleteness: history.map((entry) => ({
      generatedAt: entry.generatedAt,
      value: Number((entry.exercises.completeness * 100).toFixed(2)),
    })),
    supplementsCompleteness: history.map((entry) => ({
      generatedAt: entry.generatedAt,
      value: Number((entry.supplements.completeness * 100).toFixed(2)),
    })),
  };

  return {
    generatedAt: snapshot.generatedAt,
    snapshot,
    previous: history.length > 1 ? history[history.length - 2] : null,
    trend,
    sparklines,
    series,
  };
}

function buildSummaryAnalytics({ snapshot, trend, sparklines }) {
  const lessonsCoverage =
    trend?.lessons.md3Coverage ??
    buildTrendEntry(snapshot.lessons.md3Coverage, snapshot.lessons.md3Coverage, {
      multiplier: 100,
      format: 'points',
    });
  const legacyBlocks =
    trend?.lessons.legacyBlocks ??
    buildTrendEntry(snapshot.lessons.legacyBlocks, snapshot.lessons.legacyBlocks);
  const exercisesWithoutMetadata =
    trend?.exercises.withoutMetadata ??
    buildTrendEntry(snapshot.exercises.withoutMetadata, snapshot.exercises.withoutMetadata);
  const supplementsWithoutMetadata =
    trend?.supplements.withoutMetadata ??
    buildTrendEntry(snapshot.supplements.withoutMetadata, snapshot.supplements.withoutMetadata);

  const exercisesCompleteness =
    trend?.exercises.completeness ??
    buildTrendEntry(snapshot.exercises.completeness, snapshot.exercises.completeness, {
      multiplier: 100,
      format: 'points',
    });
  const supplementsCompleteness =
    trend?.supplements.completeness ??
    buildTrendEntry(snapshot.supplements.completeness, snapshot.supplements.completeness, {
      multiplier: 100,
      format: 'points',
    });

  return {
    lessons: {
      md3Coverage: {
        ...lessonsCoverage,
        sparkline: sparklines.md3Coverage,
      },
      legacyBlocks: {
        ...legacyBlocks,
        sparkline: sparklines.legacyBlocks,
      },
    },
    exercises: {
      withoutMetadata: {
        ...exercisesWithoutMetadata,
        sparkline: sparklines.exercisesCompleteness,
      },
      completeness: {
        ...exercisesCompleteness,
        sparkline: sparklines.exercisesCompleteness,
      },
    },
    supplements: {
      withoutMetadata: {
        ...supplementsWithoutMetadata,
        sparkline: sparklines.supplementsCompleteness,
      },
      completeness: {
        ...supplementsCompleteness,
        sparkline: sparklines.supplementsCompleteness,
      },
    },
  };
}

function sparkline(history, accessor, windowSize) {
  const bars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const slice = history.slice(-windowSize);
  if (slice.length === 0) {
    return '—';
  }
  const values = slice.map((entry) => accessor(entry));
  const filtered = values.filter((value) => Number.isFinite(value));
  if (filtered.length === 0) {
    return '—';
  }
  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  if (max === min) {
    const middle = bars[Math.floor(bars.length / 2)];
    return middle.repeat(values.length);
  }
  return values
    .map((value) => {
      if (!Number.isFinite(value)) {
        return ' ';
      }
      const ratio = (value - min) / (max - min);
      const index = Math.max(0, Math.min(bars.length - 1, Math.round(ratio * (bars.length - 1))));
      return bars[index];
    })
    .join('');
}

function formatDelta(value, suffix = '') {
  const isPoints = suffix.includes('p.p.');
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: isPoints ? 1 : 0,
    maximumFractionDigits: isPoints ? 1 : 0,
  });
  const formatted = formatter.format(Math.abs(value));
  if (value > 0) {
    return `▲ +${formatted}${suffix ? ` ${suffix}` : ''}`;
  }
  if (value < 0) {
    return `▼ -${formatted}${suffix ? ` ${suffix}` : ''}`;
  }
  return suffix ? `— (${suffix})` : '—';
}

function formatPercent(value) {
  if (value === null || Number.isNaN(value)) {
    return '—%';
  }
  const rounded = Number(value.toFixed(1));
  const absolute = Math.abs(rounded);
  if (rounded > 0) {
    return `▲ +${absolute}%`;
  }
  if (rounded < 0) {
    return `▼ -${absolute}%`;
  }
  return '—%';
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(Math.round(value));
}

main().catch((error) => {
  console.error('Falha ao gerar relatório de observabilidade:', error);
  process.exitCode = 1;
});
