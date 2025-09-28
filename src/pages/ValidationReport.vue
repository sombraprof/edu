<template>
  <section class="page flow">
    <TeacherModeGate>
      <header class="card p-6 md:p-8">
        <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div class="flex flex-col gap-3">
            <span class="chip" :class="statusMeta.chipClass">{{ statusMeta.label }}</span>
            <h1 class="md-typescale-headline-small font-semibold text-on-surface">
              Relatório consolidado de validação de conteúdo
            </h1>
            <p class="supporting-text text-on-surface-variant">
              Este painel resume a última execução do validador, destacando cursos com avisos ou
              problemas e as lições que precisam de atenção antes de uma nova publicação.
            </p>
            <p class="md-typescale-body-small text-on-surface-variant">
              Gerado em {{ generatedAt }}.
            </p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="md-surface-container md-elevation-1 md-shape-large p-4">
              <p class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">
                Disciplinas avaliadas
              </p>
              <p class="md-typescale-display-small font-semibold text-on-surface">
                {{ report.totals.courses }}
              </p>
            </div>
            <div
              class="md-surface-container-high md-elevation-1 md-shape-large border border-transparent p-4"
            >
              <p class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">
                Lições com apontamentos
              </p>
              <p class="md-typescale-display-small font-semibold text-on-surface">
                {{ report.totals.lessonsWithIssues }}
              </p>
            </div>
          </div>
        </div>
        <dl class="mt-6 grid gap-4 sm:grid-cols-3">
          <div class="md-surface-container md-elevation-1 md-shape-large p-4">
            <dt class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">
              Lições avaliadas
            </dt>
            <dd class="md-typescale-headline-small font-semibold text-on-surface">
              {{ report.totals.lessons }}
            </dd>
          </div>
          <div class="md-surface-container md-elevation-1 md-shape-large p-4">
            <dt class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">
              Problemas
            </dt>
            <dd class="md-typescale-headline-small font-semibold text-on-surface">
              {{ report.totals.problems }}
            </dd>
          </div>
          <div class="md-surface-container md-elevation-1 md-shape-large p-4">
            <dt class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">
              Avisos
            </dt>
            <dd class="md-typescale-headline-small font-semibold text-on-surface">
              {{ report.totals.warnings }}
            </dd>
          </div>
        </dl>
      </header>

      <section class="card p-6 md:p-8">
        <div class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Status por disciplina
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Os números abaixo somam problemas (bloqueiam publicação) e avisos (recomendações que não
            impedem o deploy), ordenados pela severidade dos apontamentos.
          </p>
        </div>
        <div class="mt-6 overflow-x-auto">
          <table class="w-full min-w-[640px] table-fixed border-separate border-spacing-y-2">
            <thead class="md-typescale-label-medium text-on-surface-variant">
              <tr>
                <th class="text-left">Disciplina</th>
                <th class="text-left">Lições com apontamentos</th>
                <th class="text-left">Problemas</th>
                <th class="text-left">Avisos</th>
                <th class="text-left">Situação</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="course in sortedCourses"
                :key="course.id"
                class="md-shape-extra-large bg-[var(--md-sys-color-surface-container-high)] md-typescale-body-medium text-on-surface"
              >
                <td class="rounded-l-3xl px-4 py-3 font-semibold uppercase tracking-[0.12em]">
                  {{ course.id }}
                </td>
                <td class="px-4 py-3">{{ course.lessonsWithIssues }}</td>
                <td class="px-4 py-3">{{ course.problems }}</td>
                <td class="px-4 py-3">{{ course.warnings }}</td>
                <td class="rounded-r-3xl px-4 py-3">
                  <span class="chip" :class="courseStatus(course).chipClass">{{
                    courseStatus(course).label
                  }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card p-6 md:p-8">
        <div class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Proveniência dos materiais gerados
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Acompanhe quem produziu exercícios e suplementos, os modelos utilizados e eventuais
            lacunas de metadados antes de liberar novas publicações.
          </p>
        </div>
        <div v-if="hasGenerationData" class="mt-6 space-y-8">
          <section v-for="category in generationCategories" :key="category.key" class="space-y-4">
            <header class="flex flex-col gap-1">
              <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                {{ category.title }}
              </h3>
              <p class="md-typescale-body-small text-on-surface-variant">
                {{ category.summary }}
              </p>
            </header>
            <div v-if="category.rows.length" class="overflow-x-auto">
              <table class="w-full min-w-[720px] table-fixed border-separate border-spacing-y-2">
                <thead class="md-typescale-label-medium text-on-surface-variant">
                  <tr>
                    <th class="text-left">Curso</th>
                    <th class="text-left">Itens registrados</th>
                    <th class="text-left">Com metadados</th>
                    <th class="text-left">Sem metadados</th>
                    <th class="text-left">Principais autores</th>
                    <th class="text-left">Modelos</th>
                    <th class="text-left">Período</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="summary in category.rows"
                    :key="summary.course"
                    class="md-shape-extra-large bg-[var(--md-sys-color-surface-container-high)] md-typescale-body-medium text-on-surface"
                  >
                    <td class="rounded-l-3xl px-4 py-3 font-semibold uppercase tracking-[0.12em]">
                      {{ summary.course }}
                    </td>
                    <td class="px-4 py-3">{{ summary.total }}</td>
                    <td class="px-4 py-3">{{ formatAvailability(summary) }}</td>
                    <td class="px-4 py-3">{{ summary.missingMetadata }}</td>
                    <td class="px-4 py-3">{{ formatDictionary(summary.byGenerator) }}</td>
                    <td class="px-4 py-3">{{ formatDictionary(summary.byModel) }}</td>
                    <td class="rounded-r-3xl px-4 py-3">
                      {{ formatDateRange(summary.earliestTimestamp, summary.latestTimestamp) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="supporting-text text-on-surface-variant">
              Nenhum item cadastrado nesta categoria até o momento.
            </p>
          </section>
        </div>
        <div
          v-else
          class="mt-6 md-shape-extra-large bg-[var(--md-sys-color-surface-container-high)] p-6 text-center"
        >
          <p class="md-typescale-title-medium font-semibold text-on-surface">
            Nenhum material registrado
          </p>
          <p class="mt-2 supporting-text text-on-surface-variant">
            Assim que exercícios ou suplementos forem catalogados com metadados de proveniência eles
            aparecerão aqui.
          </p>
        </div>
      </section>

      <section class="card p-6 md:p-8">
        <div class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Lições que exigem revisão
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Priorize os blocos abaixo para remover avisos ou corrigir eventuais erros antes de
            publicar novas versões das disciplinas.
          </p>
        </div>
        <div v-if="coursesWithIssues.length" class="mt-6 grid gap-4">
          <article
            v-for="course in coursesWithIssues"
            :key="course.id"
            class="md-surface-container md-elevation-1 md-shape-extra-large p-5"
          >
            <header class="flex flex-wrap items-center gap-3">
              <span class="chip font-semibold uppercase tracking-[0.12em]">{{ course.id }}</span>
              <span class="chip" :class="courseStatus(course).chipClass">{{
                courseStatus(course).label
              }}</span>
              <span class="md-typescale-label-medium text-on-surface-variant">
                {{ course.lessonsWithIssues }} lições com apontamentos
              </span>
            </header>
            <ul class="mt-4 space-y-4">
              <li
                v-for="lesson in course.lessons"
                :key="lesson.file"
                class="rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] p-4 md-typescale-body-medium text-on-surface"
              >
                <p class="md-typescale-label-medium text-on-surface-variant">
                  {{ lesson.file }}
                </p>
                <div v-if="lesson.problems.length" class="mt-3 space-y-2">
                  <p
                    class="md-typescale-body-medium font-semibold"
                    style="color: var(--md-sys-color-error)"
                  >
                    Problemas
                  </p>
                  <ul class="list-disc space-y-1 pl-5 md-typescale-body-medium text-on-surface">
                    <li v-for="problem in lesson.problems" :key="problem.message">
                      <span class="font-medium">{{ problem.type }}:</span>
                      <span>{{ problem.message }}</span>
                    </li>
                  </ul>
                </div>
                <div v-if="lesson.warnings.length" class="mt-3 space-y-2">
                  <p
                    class="md-typescale-body-medium font-semibold"
                    style="color: var(--md-sys-color-secondary)"
                  >
                    Avisos
                  </p>
                  <ul class="list-disc space-y-1 pl-5 md-typescale-body-medium text-on-surface">
                    <li v-for="warning in lesson.warnings" :key="warning.message">
                      <span class="font-medium">{{ warning.type }}:</span>
                      <span>{{ warning.message }}</span>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </article>
        </div>
        <div
          v-else
          class="mt-6 md-shape-extra-large bg-[var(--md-sys-color-surface-container-high)] p-6 text-center"
        >
          <p class="md-typescale-title-medium font-semibold text-on-surface">
            Nenhuma pendência encontrada
          </p>
          <p class="mt-2 supporting-text text-on-surface-variant">
            A última execução do validador passou sem avisos ou problemas. Continue publicando novas
            lições com confiança!
          </p>
        </div>
      </section>
    </TeacherModeGate>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TeacherModeGate from '../components/TeacherModeGate.vue';
import rawReport from '../../reports/content-validation-report.json';
import type {
  ValidationReport,
  ValidationReportCourseEntry,
  ValidationReportGeneration,
  ValidationReportGenerationSummary,
} from '../types/validation-report';

const report = rawReport as ValidationReport;

const generationData = computed<ValidationReportGeneration>(
  () => report.generation ?? { exercises: [], supplements: [] }
);

const statusDictionary: Record<ValidationReport['status'], { label: string; chipClass: string }> = {
  passed: { label: 'Sem problemas', chipClass: 'chip--success' },
  'passed-with-warnings': { label: 'Com avisos', chipClass: 'chip--warning' },
  failed: { label: 'Com problemas', chipClass: 'chip--error' },
};

const statusMeta = computed(() => statusDictionary[report.status]);

const generatedAt = computed(() =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(report.generatedAt))
);

const sortedCourses = computed(() =>
  [...report.courses].sort((a, b) => {
    if (b.problems !== a.problems) {
      return b.problems - a.problems;
    }
    if (b.warnings !== a.warnings) {
      return b.warnings - a.warnings;
    }
    return a.id.localeCompare(b.id);
  })
);

const coursesWithIssues = computed(() =>
  sortedCourses.value.filter((course) => course.lessonsWithIssues > 0)
);

function courseStatus(course: ValidationReportCourseEntry) {
  if (course.problems > 0) {
    return { label: 'Com problemas', chipClass: 'chip--error' };
  }
  if (course.warnings > 0) {
    return { label: 'Com avisos', chipClass: 'chip--warning' };
  }
  return { label: 'Sem apontamentos', chipClass: 'chip--success' };
}

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
});

const generationCategories = computed(() => {
  const base = [
    {
      key: 'exercises',
      title: 'Exercícios',
      data: generationData.value.exercises,
    },
    {
      key: 'supplements',
      title: 'Materiais complementares',
      data: generationData.value.supplements,
    },
  ] as {
    key: keyof ValidationReportGeneration;
    title: string;
    data: ValidationReportGenerationSummary[];
  }[];

  return base.map((category) => {
    const totals = category.data.reduce(
      (acc, summary) => {
        acc.total += summary.total;
        acc.withMetadata += summary.withMetadata;
        acc.missing += summary.missingMetadata;
        return acc;
      },
      { total: 0, withMetadata: 0, missing: 0 }
    );

    const summaryText = (() => {
      if (totals.total === 0) {
        return 'Nenhum item registrado até o momento.';
      }

      const coverage = percentFormatter.format(totals.withMetadata / Math.max(totals.total, 1));

      if (totals.missing === 0) {
        return `Cobertura de metadados em ${coverage} (${totals.withMetadata} de ${totals.total}).`;
      }

      return `Cobertura de metadados em ${coverage} (${totals.withMetadata} de ${totals.total}). ${totals.missing} item(ns) ainda precisam de metadados.`;
    })();

    const rows = [...category.data].sort((a, b) => {
      if (b.missingMetadata !== a.missingMetadata) {
        return b.missingMetadata - a.missingMetadata;
      }
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      return a.course.localeCompare(b.course);
    });

    return {
      key: category.key,
      title: category.title,
      rows,
      totals,
      summary: summaryText,
    };
  });
});

const hasGenerationData = computed(() =>
  generationCategories.value.some((category) => category.totals.total > 0)
);

function formatDictionary(counts: Record<string, number>) {
  const entries = Object.entries(counts ?? {});
  if (!entries.length) {
    return '—';
  }

  return entries
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      return a[0].localeCompare(b[0]);
    })
    .map(([label, total]) => `${label} (${total})`)
    .join(', ');
}

function formatDateRange(earliest?: string, latest?: string) {
  if (!earliest) {
    return '—';
  }

  const formatter = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
  });

  const earliestDate = formatter.format(new Date(earliest));

  if (!latest || earliest === latest) {
    return earliestDate;
  }

  const latestDate = formatter.format(new Date(latest));
  return `De ${earliestDate} a ${latestDate}`;
}

function formatAvailability(summary: ValidationReportGenerationSummary) {
  if (summary.total === 0) {
    return '0 de 0';
  }
  return `${summary.withMetadata} de ${summary.total}`;
}
</script>
