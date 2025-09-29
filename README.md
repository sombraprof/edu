# EDU · Courses Hub

Vue 3 + Vite application that centralises the course material of Prof. Tiago Sombra. The interface follows Material Design 3, uses a shared utility library for typography/surfaces/elevations and renders structured JSON content through reusable Vue components.

## Getting Started

```bash
npm ci
npm run dev
```

To validate a production build:

```bash
npm run build
npm run preview
```

## Formatting & Git Hooks

- `npm run format` – applies Prettier to the entire project.
- `npm run format:check` – verifies formatting without writing changes.
- A pre-commit hook (configured via `simple-git-hooks`) runs Prettier against staged files. Install the hooks once with `npm install` or `npm run prepare`.
- Whenever staged changes touch `src/content/`, the same hook also executes `npm run validate:content` to guarantee that lesson indexes, wrappers and JSON schemas stay consistent before the commit lands.

## Content Architecture

All course assets live under `src/content/courses/<courseId>/`:

```
src/content/courses/<courseId>/
├── meta.json                # Course metadata (id, title, institution, description)
├── lessons.json             # Lessons index ({ id, title, description?, available, file })
├── lessons/
│   ├── lessonX.json         # Structured blocks consumed by LessonRenderer
│   └── lessonX.vue          # Wrapper that imports the JSON, exposes meta and renders <LessonRenderer>
├── exercises.json           # Exercises index ({ id, title, summary?, available, file?, link?, metadata })
├── supplements.json         # Optional supplements index ({ id, title, type, file?/link?, metadata })
└── exercises/
    ├── exerciseY.json        # Structured blocks identical to lessons
    └── exerciseY.vue         # Wrapper that imports the JSON and renders <LessonRenderer>
```

Structured blocks should prefer declarative component types (`lessonPlan`, `contentBlock`, `callout`, etc.). `legacySection` is available as a temporary escape hatch for sanitised HTML; the renderer will still apply MD3 surfaces and typography tokens to those sections.

`meta.json` deve manter o slug (`id`) alinhado ao diretório do curso, usar instituições canônicas (`Unichristus`, `Unifametro`) e trazer descrições com ao menos 60 caracteres úteis. O comando `npm run validate:content` bloqueia o build se esses campos não seguirem o padrão.

For detailed authoring guidance – including naming conventions, block schemas, design tokens and accessibility recommendations – see [`docs/CONTENT_AUTHORING_GUIDE.md`](docs/CONTENT_AUTHORING_GUIDE.md).

## Design Tokens & Utilities

`src/assets/styles.css` centralises the Material Design 3 primitives used across the app. Reuse the helpers below instead of bespoke classes:

- **Typography:** `.md-typescale-*` classes (display/headline/title/body/label) mirror the MD3 scale with the correct `line-height`, `font-weight` and `letter-spacing` settings. Apply them to headings and supporting copy in Vue components or legacy HTML snippets.
- **Surfaces:** `.md-surface`, `.md-surface-container`, `.md-surface-container-high`, `.md-surface-primary`, `.md-surface-primary-container` expose the core tonal palettes. Combine them with `.md-elevation-1/2/3` to achieve the expected depth.
- **Stateful text helpers:** `.text-on-surface`, `.text-on-surface-variant`, `.text-on-primary`, `.text-on-primary-container`, `.text-on-secondary-container` keep foreground contrast aligned with MD3 tokens.
- **Icon sizing:** `.md-icon`, `.md-icon--sm`, `.md-icon--md`, `.md-icon--lg` normalise Lucide icons to the MD3 dimension system without bespoke inline styles.

Cards, chips, badges and buttons already consume these tokens internally. When building new components, prefer the existing utility classes instead of hard-coding font sizes, colours or box-shadows.

## Helper Scripts

- `node scripts/structure-legacy-sections.mjs` – converts legacy HTML lessons (when available) into `legacySection` blocks.
- `npm run scaffold:lesson -- --course <id> --number <NN> --title "..." [--objective "..."]` – scaffolds JSON + Vue wrapper and updates `lessons.json` in a single pass (use `--id lesson-NN` if you prefer to pass the slug directly).
- `node scripts/create-lesson-from-html.mjs --course <id> --id lesson-NN --title "..." --objective "..." --input <file>` –
  scaffolds a new lesson by transforming `<section>`-based HTML into the JSON + Vue wrapper expected by the app. Accepts HTML
  piped from STDIN so you can drop AI generated markup straight into the project.
- `node scripts/apply-lesson-template.mjs` – regenerates the Vue wrappers so they only mount `LessonRenderer` with the latest JSON.
- `node scripts/convert-exercises-to-json.mjs` – mirrors the same process for exercises (já preenche `metadata`).
- `npm run validate:report` – executa a validação, grava um relatório agregado em `reports/content-validation-report.json` e resume os metadados de geração (quem produziu, modelo e timestamps) para exercícios e suplementos por curso.
- `npm run report:observability` – consolida métricas de conteúdo em `reports/content-observability.json`, incluindo cobertura de blocos MD3 vs. legados, lições disponíveis por curso e status dos metadados de exercícios/suplementos.
- `npm run report:observability -- --output <arquivo>` – grava o relatório em outro caminho; combine com `--check` para falhar quando houver exercícios ou suplementos sem metadados obrigatórios (`generatedBy`, `model`, `timestamp`).
- `npm run report:observability:check` – atalho para rodar o relatório com a verificação de metadados (usado no CI/CD).
- `npm run report:governance` – gera `reports/governance-alert.{md,json}` cruzando validação e observabilidade, registra a evolução em `reports/governance-history.json` e destaca cursos com problemas/avisos, blocos legados e lacunas de metadados.
- `npm run report:governance:history` – sintetiza as execuções em `reports/governance-history-summary.json` e publica uma tabela em `reports/governance-history.md` com a evolução semanal.
- `npm run report:governance -- --history <arquivo>` – opcionalmente escreve o histórico consolidado em outro caminho para acompanhar a tendência em automações externas.
- O relatório consolidado pode ser consultado diretamente na interface em `/relatorios/validacao-conteudo`, acessível pelo atalho "Relatório de validação" no cabeçalho.

These scripts are optional; new content should be authored directly in the structured JSON format.

## Key Components

- `LessonRenderer.vue` orchestrates all block types and applies Material 3 spacing and typography.
- `LegacySection.vue` and `LegacyHtml.vue` provide MD3 surfaces for sanitised HTML while the content is being migrated.
- `ExerciseView.vue` shares exactly the same rendering pipeline used by lessons, ensuring visual parity between theory and practice.

## Deployment / PWA

- The build generates a custom service worker that precaches the Vite output and provides an SPA fallback for GitHub Pages deployments.
- O workflow em `.github/workflows/deploy.yml` valida o conteúdo com `npm run validate:report`, gera o relatório de observabilidade com `npm run report:observability:check` e publica ambos os artefatos. Caso algum curso tenha exercícios ou suplementos sem metadados obrigatórios, a pipeline falha antes do build/deploy.
- Independentemente do resultado, o workflow produz `reports/governance-alert.md`/`.json`, atualiza `reports/governance-history.json` com a fotografia mais recente, deriva `reports/governance-history-summary.json` + `reports/governance-history.md` e mantém uma issue automática (`governanca-automatica`) com o resumo das pendências e a tabela histórica mais recente.

## Quality Checklist

Before opening a pull request:

- [ ] Run `npm run validate:content`, `npm run format` and `npm run build` locally.
- [ ] Ensure component names, variables and comments are written in English.
- [ ] Use canonical tokens for `callout.variant` (`info`, `good-practice`, `academic`, `warning`, `task`, `error`) and lesson plan icons (`target`, `bullseye`, `graduation-cap`, `calendar-days`, `users`, etc.).
- [ ] Confirm that lessons/exercises reference the correct JSON wrapper and appear in `lessons.json` / `exercises.json` indexes.
- [ ] Update documentation when the architecture or authoring workflow changes.
