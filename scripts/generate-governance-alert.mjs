#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const reportsRoot = path.join(repoRoot, 'reports');

const defaultValidationPath = path.join(reportsRoot, 'content-validation-report.json');
const defaultObservabilityPath = path.join(reportsRoot, 'content-observability.json');
const defaultMarkdownPath = path.join(reportsRoot, 'governance-alert.md');
const defaultMetaPath = path.join(reportsRoot, 'governance-alert.json');

function parseArgs(argv) {
  const options = {
    validationPath: defaultValidationPath,
    observabilityPath: defaultObservabilityPath,
    markdownPath: defaultMarkdownPath,
    metaPath: defaultMetaPath,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--validation' && argv[i + 1]) {
      options.validationPath = path.resolve(repoRoot, argv[i + 1]);
      i += 1;
    } else if (arg === '--observability' && argv[i + 1]) {
      options.observabilityPath = path.resolve(repoRoot, argv[i + 1]);
      i += 1;
    } else if ((arg === '--output' || arg === '--markdown') && argv[i + 1]) {
      options.markdownPath = path.resolve(repoRoot, argv[i + 1]);
      i += 1;
    } else if (arg === '--meta' && argv[i + 1]) {
      options.metaPath = path.resolve(repoRoot, argv[i + 1]);
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
    `Uso: node scripts/generate-governance-alert.mjs [opções]\n\n` +
      'Opções:\n' +
      '  --validation <arquivo>      Caminho para o JSON de validação (padrão: reports/content-validation-report.json)\n' +
      '  --observability <arquivo>   Caminho para o JSON de observabilidade (padrão: reports/content-observability.json)\n' +
      '  --output <arquivo>          Caminho do Markdown gerado (padrão: reports/governance-alert.md)\n' +
      '  --meta <arquivo>            Caminho do JSON de metadados gerado (padrão: reports/governance-alert.json)\n'
  );
}

async function readJson(filePath) {
  const contents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(contents);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function collectValidationSummary(validationReport) {
  if (!validationReport || typeof validationReport !== 'object') {
    return {
      status: 'missing',
      totals: { problems: 0, warnings: 0, lessonsWithIssues: 0 },
      courses: [],
      warningTypes: new Map(),
      problemTypes: new Map(),
    };
  }

  const warningTypes = new Map();
  const problemTypes = new Map();
  const courses = [];

  for (const course of Array.isArray(validationReport.courses) ? validationReport.courses : []) {
    const courseWarnings = [];
    const courseProblems = [];
    for (const lesson of Array.isArray(course.lessons) ? course.lessons : []) {
      for (const problem of Array.isArray(lesson.problems) ? lesson.problems : []) {
        problemTypes.set(problem.type, (problemTypes.get(problem.type) ?? 0) + 1);
        courseProblems.push({
          lessonId: lesson.lessonId,
          message: problem.message,
          type: problem.type,
        });
      }
      for (const warning of Array.isArray(lesson.warnings) ? lesson.warnings : []) {
        warningTypes.set(warning.type, (warningTypes.get(warning.type) ?? 0) + 1);
        courseWarnings.push({
          lessonId: lesson.lessonId,
          message: warning.message,
          type: warning.type,
        });
      }
    }

    courses.push({
      id: course.id,
      problems: course.problems ?? courseProblems.length,
      warnings: course.warnings ?? courseWarnings.length,
      lessonsWithIssues: course.lessonsWithIssues ?? 0,
      problemsDetail: courseProblems,
      warningsDetail: courseWarnings,
    });
  }

  return {
    status: validationReport.status ?? 'unknown',
    totals: {
      problems: validationReport.totals?.problems ?? 0,
      warnings: validationReport.totals?.warnings ?? 0,
      lessonsWithIssues: validationReport.totals?.lessonsWithIssues ?? 0,
    },
    courses,
    warningTypes,
    problemTypes,
  };
}

function collectObservabilitySummary(observabilityReport) {
  if (!observabilityReport || typeof observabilityReport !== 'object') {
    return {
      totals: {
        legacyBlocks: 0,
        legacyLessons: 0,
        md3Blocks: 0,
        lessonsTotal: 0,
        courses: 0,
      },
      courses: new Map(),
      metadataIssues: [],
    };
  }

  const coursesMap = new Map();
  const metadataIssues = [];
  for (const course of Array.isArray(observabilityReport.courses)
    ? observabilityReport.courses
    : []) {
    const lessons = course.lessons ?? {};
    const exercises = course.exercises ?? {};
    const supplements = course.supplements ?? {};

    if (exercises.total > (exercises.withMetadata ?? 0)) {
      metadataIssues.push(
        `Curso ${course.id}: ${exercises.total - exercises.withMetadata} exercício(s) sem metadados obrigatórios.`
      );
    }
    if (supplements.total > (supplements.withMetadata ?? 0)) {
      metadataIssues.push(
        `Curso ${course.id}: ${supplements.total - supplements.withMetadata} suplemento(s) sem metadados obrigatórios.`
      );
    }

    coursesMap.set(course.id, {
      legacyBlocks: lessons.legacyBlocks ?? 0,
      legacyLessons: lessons.legacyLessons ?? 0,
      legacyLessonIds: Array.isArray(lessons.legacyLessonIds) ? lessons.legacyLessonIds : [],
      md3Blocks: lessons.md3Blocks ?? 0,
      totalBlocks: lessons.totalBlocks ?? 0,
      exercisesWithoutMetadata: Math.max(0, (exercises.total ?? 0) - (exercises.withMetadata ?? 0)),
      supplementsWithoutMetadata: Math.max(
        0,
        (supplements.total ?? 0) - (supplements.withMetadata ?? 0)
      ),
    });
  }

  const totals = {
    legacyBlocks: observabilityReport.totals?.lessons?.legacyBlocks ?? 0,
    legacyLessons: observabilityReport.totals?.lessons?.legacyLessons ?? 0,
    md3Blocks: observabilityReport.totals?.lessons?.md3Blocks ?? 0,
    lessonsTotal: observabilityReport.totals?.lessons?.total ?? 0,
    courses: observabilityReport.totals?.courses ?? coursesMap.size,
    exercisesWithoutMetadata: Math.max(
      0,
      (observabilityReport.totals?.exercises?.total ?? 0) -
        (observabilityReport.totals?.exercises?.withMetadata ?? 0)
    ),
    supplementsWithoutMetadata: Math.max(
      0,
      (observabilityReport.totals?.supplements?.total ?? 0) -
        (observabilityReport.totals?.supplements?.withMetadata ?? 0)
    ),
  };

  return { totals, courses: coursesMap, metadataIssues };
}

function buildMarkdown(summary) {
  const lines = [];
  lines.push('# Alerta de governança de conteúdo');
  lines.push('');
  lines.push(`_Gerado em ${summary.generatedAt.replace('T', ' ').replace('Z', ' UTC')}_`);
  lines.push('');

  if (!summary.hasValidationReport && !summary.hasObservabilityReport) {
    lines.push(
      'Nenhum relatório de validação ou observabilidade foi encontrado. Execute os scripts antes de gerar este alerta.'
    );
    return lines.join('\n');
  }

  lines.push('## Diagnóstico rápido');
  lines.push('');
  if (summary.hasValidationReport) {
    lines.push(
      `- **Status da validação**: ${formatStatus(summary.validation.status)} com ${formatNumber(
        summary.validation.totals.problems
      )} problema(s) e ${formatNumber(summary.validation.totals.warnings)} aviso(s).`
    );
  } else {
    lines.push('- Relatório de validação indisponível.');
  }
  if (summary.hasObservabilityReport) {
    lines.push(
      `- **Blocos legados**: ${formatNumber(summary.observability.totals.legacyBlocks)} em ${formatNumber(
        summary.observability.totals.legacyLessons
      )} lição(ões) (total de ${formatNumber(summary.observability.totals.lessonsTotal)} lições mapeadas).`
    );
    lines.push(
      `- **Metadados obrigatórios**: ${formatNumber(
        summary.observability.totals.exercisesWithoutMetadata
      )} exercícios e ${formatNumber(summary.observability.totals.supplementsWithoutMetadata)} suplementos pendentes.`
    );
  } else {
    lines.push('- Relatório de observabilidade indisponível.');
  }
  lines.push('');

  if (summary.courses.length === 0) {
    lines.push('Nenhum curso com apontamentos registrado nos relatórios mais recentes.');
    return lines.join('\n');
  }

  lines.push('## Cursos com apontamentos');
  lines.push('');
  lines.push(
    '| Curso | Problemas | Avisos | Blocos legados | Lições afetadas | Exercícios s/ metadados | Suplementos s/ metadados |'
  );
  lines.push(
    '| ----- | --------- | ------ | -------------- | ---------------- | ------------------------ | ------------------------- |'
  );
  for (const course of summary.courses) {
    lines.push(
      `| ${course.id} | ${formatNumber(course.problems)} | ${formatNumber(course.warnings)} | ${formatNumber(
        course.legacyBlocks
      )} | ${course.legacyLessonIds.length > 0 ? course.legacyLessonIds.join(', ') : '—'} | ${formatNumber(
        course.exercisesWithoutMetadata
      )} | ${formatNumber(course.supplementsWithoutMetadata)} |`
    );
  }
  lines.push('');

  if (
    summary.validation.warningBreakdown.length > 0 ||
    summary.validation.problemBreakdown.length > 0
  ) {
    lines.push('### Tipos mais frequentes');
    lines.push('');
    if (summary.validation.problemBreakdown.length > 0) {
      lines.push('**Problemas**');
      for (const item of summary.validation.problemBreakdown) {
        lines.push(`- ${item.type}: ${formatNumber(item.count)}`);
      }
      lines.push('');
    }
    if (summary.validation.warningBreakdown.length > 0) {
      lines.push('**Avisos**');
      for (const item of summary.validation.warningBreakdown) {
        lines.push(`- ${item.type}: ${formatNumber(item.count)}`);
      }
      lines.push('');
    }
  }

  if (summary.metadataIssues.length > 0) {
    lines.push('### Metadados pendentes');
    lines.push('');
    for (const issue of summary.metadataIssues) {
      lines.push(`- ${issue}`);
    }
    lines.push('');
  }

  lines.push('### Próximas ações sugeridas');
  lines.push('');
  lines.push(
    '- Priorizar a migração dos blocos legados listados acima para componentes MD3 equivalentes.'
  );
  lines.push('- Corrigir apontamentos de validação para liberar a publicação sem retrabalho.');
  lines.push('- Completar metadados de exercícios e suplementos para garantir rastreabilidade.');

  return lines.join('\n');
}

function formatStatus(status) {
  switch (status) {
    case 'passed':
      return '✅ aprovado';
    case 'passed-with-warnings':
      return '⚠️ aprovado com avisos';
    case 'failed':
      return '❌ reprovado';
    case 'failed-with-warnings':
      return '❌ reprovado com avisos';
    default:
      return status;
  }
}

function buildMeta({
  validation,
  observability,
  metadataIssues,
  courses,
  generatedAt,
  hasValidationReport,
  hasObservabilityReport,
}) {
  const hasProblems = validation.totals.problems > 0;
  const hasWarnings =
    validation.totals.warnings > 0 || courses.some((course) => course.warnings > 0);
  const totalLegacyBlocks = observability.totals.legacyBlocks;
  const shouldOpenIssue = hasProblems || metadataIssues.length > 0 || totalLegacyBlocks > 0;

  return {
    generatedAt,
    hasValidationReport,
    hasObservabilityReport,
    validationStatus: validation.status,
    validationTotals: validation.totals,
    observabilityTotals: observability.totals,
    metadataIssues,
    courses,
    flags: {
      hasProblems,
      hasWarnings,
      totalLegacyBlocks,
      shouldOpenIssue,
    },
  };
}

function breakdownFromMap(map) {
  return Array.from(map.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await fs.mkdir(path.dirname(options.markdownPath), { recursive: true });
  await fs.mkdir(path.dirname(options.metaPath), { recursive: true });

  const hasValidation = await fileExists(options.validationPath);
  const hasObservability = await fileExists(options.observabilityPath);

  const validationReport = hasValidation ? await readJson(options.validationPath) : null;
  const observabilityReport = hasObservability ? await readJson(options.observabilityPath) : null;

  const validation = collectValidationSummary(validationReport);
  const observability = collectObservabilitySummary(observabilityReport);

  const generatedAt = new Date().toISOString();

  const courses = mergeCourseSummaries(validation.courses, observability.courses);
  const summary = {
    generatedAt,
    hasValidationReport: hasValidation,
    hasObservabilityReport: hasObservability,
    validation: {
      status: validation.status,
      totals: validation.totals,
      warningBreakdown: breakdownFromMap(validation.warningTypes),
      problemBreakdown: breakdownFromMap(validation.problemTypes),
    },
    observability,
    metadataIssues: observability.metadataIssues,
    courses,
  };

  const markdown = buildMarkdown(summary);
  const meta = buildMeta(summary);

  await fs.writeFile(options.markdownPath, `${markdown}\n`, 'utf8');
  await fs.writeFile(options.metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

  console.log(`Resumo de governança salvo em ${path.relative(repoRoot, options.markdownPath)}`);
  console.log(`Metadados do alerta salvos em ${path.relative(repoRoot, options.metaPath)}`);
}

function mergeCourseSummaries(validationCourses, observabilityCoursesMap) {
  const courses = [];
  const seen = new Set();

  for (const course of validationCourses) {
    const observability = observabilityCoursesMap.get(course.id) ?? {
      legacyBlocks: 0,
      legacyLessons: 0,
      legacyLessonIds: [],
      exercisesWithoutMetadata: 0,
      supplementsWithoutMetadata: 0,
    };

    courses.push({
      id: course.id,
      problems: course.problems,
      warnings: course.warnings,
      lessonsWithIssues: course.lessonsWithIssues,
      legacyBlocks: observability.legacyBlocks,
      legacyLessons: observability.legacyLessons,
      legacyLessonIds: observability.legacyLessonIds,
      exercisesWithoutMetadata: observability.exercisesWithoutMetadata,
      supplementsWithoutMetadata: observability.supplementsWithoutMetadata,
    });
    seen.add(course.id);
  }

  for (const [courseId, observability] of observabilityCoursesMap.entries()) {
    if (seen.has(courseId)) continue;
    courses.push({
      id: courseId,
      problems: 0,
      warnings: 0,
      lessonsWithIssues: 0,
      legacyBlocks: observability.legacyBlocks,
      legacyLessons: observability.legacyLessons,
      legacyLessonIds: observability.legacyLessonIds,
      exercisesWithoutMetadata: observability.exercisesWithoutMetadata,
      supplementsWithoutMetadata: observability.supplementsWithoutMetadata,
    });
  }

  courses.sort((a, b) => {
    if (b.problems !== a.problems) {
      return b.problems - a.problems;
    }
    if (b.warnings !== a.warnings) {
      return b.warnings - a.warnings;
    }
    return b.legacyBlocks - a.legacyBlocks;
  });

  return courses;
}

main().catch((error) => {
  console.error('Falha ao gerar alerta de governança:', error);
  process.exitCode = 1;
});
