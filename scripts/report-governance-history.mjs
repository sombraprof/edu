#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const reportsRoot = path.join(repoRoot, 'reports');

const defaultHistoryPath = path.join(reportsRoot, 'governance-history.json');
const defaultSummaryPath = path.join(reportsRoot, 'governance-history-summary.json');
const defaultMarkdownPath = path.join(reportsRoot, 'governance-history.md');

function parseArgs(argv) {
  const options = {
    historyPath: defaultHistoryPath,
    summaryPath: defaultSummaryPath,
    markdownPath: defaultMarkdownPath,
    weeks: 8,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if ((arg === '--history' || arg === '--input') && argv[i + 1]) {
      options.historyPath = path.resolve(repoRoot, argv[i + 1]);
      i += 1;
    } else if ((arg === '--summary' || arg === '--output') && argv[i + 1]) {
      options.summaryPath = path.resolve(repoRoot, argv[i + 1]);
      i += 1;
    } else if ((arg === '--markdown' || arg === '--table') && argv[i + 1]) {
      options.markdownPath = path.resolve(repoRoot, argv[i + 1]);
      i += 1;
    } else if (arg === '--weeks' && argv[i + 1]) {
      const value = Number.parseInt(argv[i + 1], 10);
      if (!Number.isNaN(value) && value > 0) {
        options.weeks = value;
      }
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }
  }

  return options;
}

function printUsage() {
  console.log(
    `Uso: node scripts/report-governance-history.mjs [opções]\n\n` +
      'Opções:\n' +
      '  --history <arquivo>    Caminho para o JSON histórico (padrão: reports/governance-history.json)\n' +
      '  --summary <arquivo>    Caminho do JSON agregado gerado (padrão: reports/governance-history-summary.json)\n' +
      '  --markdown <arquivo>   Caminho do Markdown gerado (padrão: reports/governance-history.md)\n' +
      '  --weeks <número>       Limitar a tabela às últimas N semanas (padrão: 8)\n'
  );
}

async function readHistory(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((entry) => normalizeEntry(entry))
      .filter((entry) => entry !== null)
      .sort((a, b) => a.generatedAt.getTime() - b.generatedAt.getTime());
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object' || !entry.generatedAt) {
    return null;
  }

  const generatedAt = new Date(entry.generatedAt);
  if (Number.isNaN(generatedAt.getTime())) {
    return null;
  }

  const validation = {
    problems: Number(entry.validation?.problems ?? 0),
    warnings: Number(entry.validation?.warnings ?? 0),
  };

  const observability = {
    legacyBlocks: Number(entry.observability?.legacyBlocks ?? 0),
    legacyLessons: Number(entry.observability?.legacyLessons ?? 0),
    exercisesWithoutMetadata: Number(entry.observability?.exercisesWithoutMetadata ?? 0),
    supplementsWithoutMetadata: Number(entry.observability?.supplementsWithoutMetadata ?? 0),
  };

  return { generatedAt, validation, observability };
}

function getIsoWeek(date) {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = utcDate.getUTCDay() || 7; // 1..7, Monday=1
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
  return { year: utcDate.getUTCFullYear(), week: weekNumber };
}

function getWeekRange(date) {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  const monday = new Date(utcDate);
  monday.setUTCDate(utcDate.getUTCDate() + 1 - dayNumber);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
}

function groupByWeek(entries) {
  const groups = new Map();

  for (const entry of entries) {
    const { year, week } = getIsoWeek(entry.generatedAt);
    const key = `${year}-W${String(week).padStart(2, '0')}`;
    const existing = groups.get(key);

    if (!existing) {
      const range = getWeekRange(entry.generatedAt);
      groups.set(key, {
        key,
        year,
        week,
        range,
        entries: [entry],
      });
    } else {
      existing.entries.push(entry);
    }
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    return a.week - b.week;
  });
}

function summarizeWeek(group, previousWeekLatest) {
  const sorted = group.entries.sort((a, b) => a.generatedAt.getTime() - b.generatedAt.getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const deltaWithinWeek = computeDelta(first, last);
  const deltaSincePreviousWeek = previousWeekLatest ? computeDelta(previousWeekLatest, last) : null;

  return {
    week: group.key,
    period: group.range,
    runs: sorted.length,
    first: serializeEntry(first),
    latest: serializeEntry(last),
    deltaWithinWeek,
    deltaSincePreviousWeek,
  };
}

function computeDelta(fromEntry, toEntry) {
  return {
    validation: {
      problems: toEntry.validation.problems - fromEntry.validation.problems,
      warnings: toEntry.validation.warnings - fromEntry.validation.warnings,
    },
    observability: {
      legacyBlocks: toEntry.observability.legacyBlocks - fromEntry.observability.legacyBlocks,
      legacyLessons: toEntry.observability.legacyLessons - fromEntry.observability.legacyLessons,
      exercisesWithoutMetadata:
        toEntry.observability.exercisesWithoutMetadata -
        fromEntry.observability.exercisesWithoutMetadata,
      supplementsWithoutMetadata:
        toEntry.observability.supplementsWithoutMetadata -
        fromEntry.observability.supplementsWithoutMetadata,
    },
  };
}

function serializeEntry(entry) {
  return {
    generatedAt: entry.generatedAt.toISOString(),
    validation: entry.validation,
    observability: entry.observability,
  };
}

function buildSummary(entries) {
  if (entries.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      runs: 0,
      weeks: [],
      latest: null,
      previous: null,
      overallDelta: null,
    };
  }

  const weeks = groupByWeek(entries);
  const weekSummaries = [];
  let previousWeekLatest = null;

  for (const group of weeks) {
    const summary = summarizeWeek(group, previousWeekLatest);
    weekSummaries.push(summary);
    previousWeekLatest = group.entries[group.entries.length - 1];
  }

  const latestEntry = entries[entries.length - 1];
  const previousEntry = entries.length > 1 ? entries[entries.length - 2] : null;

  return {
    generatedAt: new Date().toISOString(),
    runs: entries.length,
    weeks: weekSummaries,
    latest: serializeEntry(latestEntry),
    previous: previousEntry ? serializeEntry(previousEntry) : null,
    overallDelta: previousEntry ? computeDelta(previousEntry, latestEntry) : null,
  };
}

function formatDelta(value) {
  if (value > 0) {
    return `+${value}`;
  }
  if (value < 0) {
    return `${value}`;
  }
  return '0';
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function buildMarkdown(summary, options) {
  const { weeks } = summary;
  const slice = options.weeks > 0 ? weeks.slice(-options.weeks) : weeks;

  const lines = [];
  lines.push('# Histórico recente de governança');
  lines.push('');
  lines.push(
    summary.runs > 0
      ? `Atualizado em ${new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'UTC',
        }).format(new Date(summary.generatedAt))} (UTC)`
      : 'Ainda não há execuções registradas.'
  );
  lines.push('');

  if (slice.length === 0) {
    lines.push('Nenhum dado histórico disponível no momento.');
    return lines.join('\n');
  }

  lines.push(
    '| Semana | Período | Execuções | Problemas | Avisos | Blocos legados | Lições legadas | Exercícios s/ metadados | Suplementos s/ metadados | Δ vs. semana anterior (problemas) | Δ vs. semana anterior (avisos) | Δ vs. semana anterior (blocos) | Δ vs. semana anterior (lições) |'
  );
  lines.push(
    '| ------ | ------- | --------- | --------- | ------ | -------------- | --------------- | ------------------------ | ------------------------- | --------------------------------- | ------------------------------ | ------------------------------ | ------------------------------ |'
  );

  for (const week of slice) {
    const delta = week.deltaSincePreviousWeek;
    lines.push(
      `| ${week.week} | ${week.period.start} → ${week.period.end} | ${week.runs} | ${formatNumber(
        week.latest.validation.problems
      )} | ${formatNumber(week.latest.validation.warnings)} | ${formatNumber(
        week.latest.observability.legacyBlocks
      )} | ${formatNumber(week.latest.observability.legacyLessons)} | ${formatNumber(
        week.latest.observability.exercisesWithoutMetadata
      )} | ${formatNumber(week.latest.observability.supplementsWithoutMetadata)} | ${
        delta ? formatDelta(delta.validation.problems) : '—'
      } | ${delta ? formatDelta(delta.validation.warnings) : '—'} | ${
        delta ? formatDelta(delta.observability.legacyBlocks) : '—'
      } | ${delta ? formatDelta(delta.observability.legacyLessons) : '—'} |`
    );
  }

  lines.push('');

  if (summary.overallDelta) {
    const { validation, observability } = summary.overallDelta;
    lines.push('### Evolução desde a última execução');
    lines.push('');
    lines.push(
      `- Problemas: ${formatDelta(validation.problems)} | Avisos: ${formatDelta(validation.warnings)} | Blocos legados: ${formatDelta(
        observability.legacyBlocks
      )} | Lições legadas: ${formatDelta(
        observability.legacyLessons
      )} | Exercícios sem metadados: ${formatDelta(
        observability.exercisesWithoutMetadata
      )} | Suplementos sem metadados: ${formatDelta(observability.supplementsWithoutMetadata)}`
    );
  }

  return lines.join('\n');
}

async function writeOutputs(summary, markdownPath, summaryPath, options) {
  await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  const markdown = buildMarkdown(summary, options);
  await fs.writeFile(markdownPath, `${markdown}\n`, 'utf8');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const entries = await readHistory(options.historyPath);
  const summary = buildSummary(entries);
  await writeOutputs(summary, options.markdownPath, options.summaryPath, options);
}

main().catch((error) => {
  console.error('Erro ao gerar histórico agregado de governança:', error);
  process.exit(1);
});
