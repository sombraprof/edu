<template>
  <section class="page flow">
    <header class="card p-6 md:p-8">
      <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div class="flex flex-col gap-3">
          <span class="chip chip--outlined self-start text-primary">Iteração 5</span>
          <h1 class="md-typescale-headline-small font-semibold text-on-surface">
            Preparar publicação e pacote de Git
          </h1>
          <p class="supporting-text text-on-surface-variant">
            Planeje a rodada de commits antes de abrir um PR. Informe branch, resumo e arquivos
            alterados para gerar os comandos recomendados e o checklist de validações.
          </p>
        </div>
        <div class="rounded-3xl bg-[var(--md-sys-color-surface-container-high)] p-4">
          <p class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">Objetivo</p>
          <p class="md-typescale-title-large font-semibold text-on-surface">
            Integrar fluxo de Git ao módulo
          </p>
          <p class="mt-2 text-sm text-on-surface-variant">
            Esta iteração documenta o pacote de publicação manual enquanto o backend de automação de
            PRs está em desenvolvimento.
          </p>
        </div>
      </div>
    </header>

    <TeacherModeGate>
      <section class="card flex flex-col gap-6 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Configurar branch e resumo da rodada
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Use estes campos para registrar as decisões da rodada e gerar comandos consistentes.
          </p>
        </header>

        <div class="grid gap-6 lg:grid-cols-2">
          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Branch de trabalho</span>
            <input
              v-model="branchName"
              type="text"
              class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="feat/professor-publicacao"
            />
            <span class="text-xs text-on-surface-variant">
              Sempre inicie a partir da <code>main</code> atualizada com
              <code>git checkout main && git pull --rebase</code>.
            </span>
          </label>

          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Título do commit</span>
            <input
              v-model="commitTitle"
              type="text"
              class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="feat: adiciona aula sobre integrais"
            />
            <span class="text-xs text-on-surface-variant">
              Resuma a alteração principal no formato convencional de mensagens de commit.
            </span>
          </label>
        </div>

        <label class="flex flex-col gap-2">
          <span class="md-typescale-label-large text-on-surface">Descrição do PR</span>
          <textarea
            v-model="prDescription"
            rows="4"
            class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            placeholder="Liste aulas, exercícios e componentes ajustados nesta rodada."
          ></textarea>
          <span class="text-xs text-on-surface-variant">
            Este texto será usado no corpo sugerido do PR para facilitar a revisão cruzada.
          </span>
        </label>

        <fieldset
          class="rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-high)] p-5"
        >
          <legend class="md-typescale-label-large px-2 text-on-surface">
            Validações obrigatórias
          </legend>
          <p class="md-typescale-body-small text-on-surface-variant">
            Marque quais scripts precisam ser executados antes do commit. Eles aparecerão no pacote
            de comandos.
          </p>
          <div class="mt-4 grid gap-3 md:grid-cols-2">
            <label
              v-for="step in validationSteps"
              :key="step.key"
              class="flex cursor-pointer items-start gap-3 rounded-2xl border border-transparent bg-surface p-4 shadow-sm transition hover:border-primary"
            >
              <input v-model="step.enabled" type="checkbox" class="mt-1" />
              <div class="flex flex-col">
                <span class="md-typescale-title-small font-semibold text-on-surface">{{
                  step.label
                }}</span>
                <span class="md-typescale-body-small text-on-surface-variant">{{
                  step.description
                }}</span>
                <code
                  class="mt-2 inline-flex w-fit rounded-xl bg-[var(--md-sys-color-surface-container-highest)] px-2 py-1 text-xs text-on-surface-variant"
                >
                  {{ step.command }}
                </code>
              </div>
            </label>
          </div>
        </fieldset>
      </section>

      <section class="card flex flex-col gap-6 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Conteúdos incluídos nesta rodada
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Relacione aulas, exercícios ou componentes que farão parte do commit. Estes dados são
            usados para gerar o resumo sugerido.
          </p>
        </header>

        <div class="flex flex-col gap-4">
          <article
            v-for="artifact in artifacts"
            :key="artifact.id"
            class="rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-highest)] p-5"
          >
            <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div class="grid flex-1 gap-4 md:grid-cols-2">
                <label class="flex flex-col gap-2">
                  <span class="md-typescale-label-large text-on-surface">Tipo de conteúdo</span>
                  <select
                    v-model="artifact.type"
                    class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <option
                      v-for="type in artifactTypeOptions"
                      :key="type.value"
                      :value="type.value"
                    >
                      {{ type.label }}
                    </option>
                  </select>
                </label>
                <label class="flex flex-col gap-2">
                  <span class="md-typescale-label-large text-on-surface"
                    >Caminho ou identificação</span
                  >
                  <input
                    v-model="artifact.path"
                    type="text"
                    class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    placeholder="src/content/courses/calculo-1/lessons/limites.json"
                  />
                </label>
              </div>
              <Md3Button
                type="button"
                variant="text"
                class="self-start text-error"
                @click="removeArtifact(artifact.id)"
              >
                <template #leading>
                  <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
                </template>
                Remover
              </Md3Button>
            </div>

            <label class="mt-4 flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Resumo do ajuste</span>
              <textarea
                v-model="artifact.summary"
                rows="3"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Ex.: Revisão de exemplos práticos e atualização de objetivos de aprendizagem."
              ></textarea>
            </label>
          </article>
        </div>

        <Md3Button type="button" variant="tonal" class="self-start" @click="addArtifact">
          <template #leading>
            <Plus class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          Adicionar conteúdo
        </Md3Button>
      </section>

      <section class="card flex flex-col gap-6 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Pacote de comandos e resumo sugerido
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Copie os comandos gerados para garantir consistência com os guardrails do repositório e
            reutilize o resumo no PR.
          </p>
        </header>

        <div class="grid gap-6 xl:grid-cols-2">
          <article
            class="flex flex-col gap-4 rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-highest)] p-5"
          >
            <header class="flex items-center justify-between">
              <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                Comandos sugeridos
              </h3>
              <Md3Button type="button" variant="text" @click="copyCommands">
                <template #leading>
                  <Copy class="md-icon md-icon--sm" aria-hidden="true" />
                </template>
                {{ copyLabel }}
              </Md3Button>
            </header>
            <pre
              class="rounded-2xl bg-surface p-4 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
            >
$ {{ gitCommands.join('\n$ ') }}
            </pre>
          </article>

          <article
            class="flex flex-col gap-4 rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-highest)] p-5"
          >
            <header>
              <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                Resumo para o PR
              </h3>
            </header>
            <pre
              class="rounded-2xl bg-surface p-4 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
              >{{ prTemplate }}
            </pre>
          </article>
        </div>

        <section
          class="rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-high)] p-5"
        >
          <h3 class="md-typescale-title-medium font-semibold text-on-surface">Checklist final</h3>
          <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-on-surface">
            <li v-for="item in checklistItems" :key="item">{{ item }}</li>
          </ul>
        </section>
      </section>
    </TeacherModeGate>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Copy, Plus, Trash2 } from 'lucide-vue-next';
import TeacherModeGate from '../../components/TeacherModeGate.vue';
import Md3Button from '@/components/Md3Button.vue';

type ArtifactType = 'lesson' | 'exercise' | 'supplement' | 'component' | 'assessment' | 'other';

type Artifact = {
  id: number;
  type: ArtifactType;
  path: string;
  summary: string;
};

type ValidationStep = {
  key: string;
  label: string;
  command: string;
  description: string;
  enabled: boolean;
};

const branchName = ref('');
const commitTitle = ref('');
const prDescription = ref('');
const copyLabel = ref('Copiar comandos');

const artifactTypeOptions: Array<{ value: ArtifactType; label: string }> = [
  { value: 'lesson', label: 'Aula (lesson)' },
  { value: 'exercise', label: 'Exercício (exercise)' },
  { value: 'supplement', label: 'Suplemento' },
  { value: 'component', label: 'Componente compartilhado' },
  { value: 'assessment', label: 'Avaliação/diagnóstico' },
  { value: 'other', label: 'Outro artefato' },
];

const artifacts = reactive<Artifact[]>([
  {
    id: 1,
    type: 'lesson',
    path: '',
    summary: '',
  },
]);
let artifactIdCounter = 2;

const validationSteps = reactive<ValidationStep[]>([
  {
    key: 'content',
    label: 'Validar conteúdo',
    command: 'npm run validate:content',
    description: 'Garante que os JSONs e manifestos respeitam os schemas oficiais.',
    enabled: true,
  },
  {
    key: 'reports',
    label: 'Gerar relatórios',
    command: 'npm run validate:reports',
    description: 'Atualiza relatórios de validação, observabilidade e governança.',
    enabled: true,
  },
  {
    key: 'build',
    label: 'Checar build',
    command: 'npm run build',
    description: 'Valida se a SPA compila após as alterações.',
    enabled: false,
  },
  {
    key: 'test',
    label: 'Executar testes',
    command: 'npm run test',
    description: 'Roda a suíte de testes unitários quando houver mudanças em componentes.',
    enabled: false,
  },
]);

function addArtifact() {
  artifacts.push({
    id: artifactIdCounter++,
    type: 'lesson',
    path: '',
    summary: '',
  });
}

function removeArtifact(id: number) {
  if (artifacts.length === 1) {
    artifacts[0].path = '';
    artifacts[0].summary = '';
    artifacts[0].type = 'lesson';
    return;
  }

  const index = artifacts.findIndex((item) => item.id === id);
  if (index !== -1) {
    artifacts.splice(index, 1);
  }
}

const sanitizedBranch = computed(() => branchName.value.trim() || 'feat/professor-publicacao');
const sanitizedCommitTitle = computed(
  () => commitTitle.value.trim() || 'chore: preparar pacote de publicação'
);

const enabledValidations = computed(() => validationSteps.filter((step) => step.enabled));

const artifactSummaries = computed(() =>
  artifacts
    .filter((item) => item.path.trim() || item.summary.trim())
    .map((item) => {
      const label =
        artifactTypeOptions.find((option) => option.value === item.type)?.label ?? 'Conteúdo';
      const details = [] as string[];
      if (item.path.trim()) {
        details.push(item.path.trim());
      }
      if (item.summary.trim()) {
        details.push(item.summary.trim());
      }
      return `- ${label}: ${details.join(' — ')}`;
    })
);

const gitCommands = computed(() => {
  const commands: string[] = [];
  commands.push('git checkout main');
  commands.push('git pull --rebase');
  commands.push(`git checkout -b ${sanitizedBranch.value}`);

  enabledValidations.value.forEach((step) => {
    commands.push(step.command);
  });

  const filesToAdd = artifacts.map((item) => item.path.trim()).filter((path) => Boolean(path));

  if (filesToAdd.length > 0) {
    commands.push('git status');
    filesToAdd.forEach((path) => {
      commands.push(`git add ${path}`);
    });
  } else {
    commands.push('# Adicione aqui os caminhos alterados com git add');
  }

  commands.push(`git commit -m "${sanitizedCommitTitle.value}"`);
  commands.push(`git push -u origin ${sanitizedBranch.value}`);
  commands.push('gh pr create --web');

  return commands;
});

const prTitle = computed(
  () => commitTitle.value.trim() || 'feat: atualizar conteúdos no módulo do professor'
);

const prTemplate = computed(() => {
  const header = `## Título sugerido\n${prTitle.value}`;
  const summary = `\n## Resumo\n${prDescription.value.trim() || 'Descreva as alterações principais realizadas nesta rodada.'}`;
  const contentList = artifactSummaries.value.length
    ? ['\n', '### Conteúdos incluídos', ...artifactSummaries.value]
    : [];
  const checklist = [
    '\n',
    '### Checklist',
    ...enabledValidations.value.map((step) => `- [ ] ${step.label} (${step.command})`),
  ];

  return [header, summary, ...contentList, ...checklist].join('\n');
});

const checklistItems = computed(() => {
  const base = [
    'Confirmar que a branch foi criada a partir da main atualizada.',
    'Revisar o diff gerado antes do commit final.',
    'Adicionar metadados de proveniência nos JSONs alterados.',
    'Anexar relatórios ao PR ou indicar a pasta correspondente.',
  ];

  if (artifactSummaries.value.length > 0) {
    base.push('Garantir revisão cruzada para todos os conteúdos listados no resumo.');
  }

  if (enabledValidations.value.some((step) => step.key === 'reports')) {
    base.push('Enviar os arquivos atualizados de relatórios para a área de validação.');
  }

  return base;
});

async function copyCommands() {
  const payload = gitCommands.value.join('\n');

  try {
    await navigator.clipboard.writeText(payload);
    copyLabel.value = 'Copiado!';
  } catch (error) {
    copyLabel.value = 'Não foi possível copiar';
  }

  setTimeout(() => {
    copyLabel.value = 'Copiar comandos';
  }, 2000);
}
</script>

<style scoped>
.page {
  --page-max-width: 1120px;
}
</style>
