# Content Authoring Guide for EDU

This document explains how to produce new lessons and exercises that integrate seamlessly with the EDU application.

## 1. High-Level Architecture

- All renderable content lives under `src/content/courses/<courseId>/`.
- Every lesson or exercise is defined by a pair of files:
  - `<id>.json`: structured data consumed by `LessonRenderer.vue`.
  - `<id>.vue`: a thin wrapper that imports the JSON, exposes the `meta` object and mounts `<LessonRenderer :data="..." />`.
- `lessons.json` and `exercises.json` act as indexes (`{ id, title, description/summary, file?, link?, available, metadata }`).
- Each exercise entry must include `metadata` with `generatedBy`, `model` (ex.: `manual`, `gpt-4o-mini`) e `timestamp` ISO para auditoria.
- In `exercises.json`, keep the `link` prefix as `courses/<courseId>/exercises/...` (ou URL absoluta) e reutilize o mesmo slug para o `id`, `.vue` wrapper e `.json` payload.
- `supplements.json` (opcional) lista materiais extras (`{ id, title, type, description?, file?/link?, available?, metadata }`). Use `type` ∈ `reading | lab | project | slide | video | reference`.
- Vue pages (`LessonView.vue`, `ExerciseView.vue`, `CourseHome.vue`) dynamically import these indexes and render the JSON blocks.

### Metadados do curso (`meta.json`)

- Mantenha `id` igual ao diretório do curso (`algi`, `tdjd`, etc.). Qualquer divergência interrompe a validação.
- `title` deve descrever o curso em pelo menos 8 caracteres úteis (após `trim`).
- `institution` aceita apenas nomes canônicos (`Unichristus`, `Unifametro`) e não pode conter espaços extras no início/fim.
- `description` precisa ter ao menos 60 caracteres para comunicar claramente o foco do curso na home.
- `npm run validate:content` acusa mensagens em português apontando qualquer campo fora do padrão.

## 2. Supported Block Types

`LessonRenderer.vue` understands the following `type` values inside the `content` array:

| Type                | Description                                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- |
| `lessonPlan`        | High level plan with hero cards (object must match the existing AlgI schema). Icons must use the canonical tokens (`bullseye`, `target`, `graduation-cap`, `calendar-days`, `users`, etc.). |
| `contentBlock`      | Rich paragraphs, optional sub-blocks and callouts.                                                                                                                                          |
| `callout`           | Highlight box with `variant` (`info`, `good-practice`, `academic`, `warning`, `task`, `error`). Use sempre valores em minúsculas e com hífen quando necessário.                             |
| `flightPlan`        | Ordered list of key items (timeline of the class).                                                                                                                                          |
| `timeline`          | Step-by-step timeline.                                                                                                                                                                      |
| `accordion`         | Expandable sections (`title`, `content` HTML).                                                                                                                                              |
| `videos`            | Embedded YouTube resources.                                                                                                                                                                 |
| `checklist`         | List of completion items.                                                                                                                                                                   |
| `bibliography`      | References in HTML/Markdown.                                                                                                                                                                |
| `truthTable`        | Matrix data for logic tables.                                                                                                                                                               |
| `representations`   | Used in AlgI to compare narrative/flowchart/pseudocode.                                                                                                                                     | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode.                               | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |                   | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces). |

> Prefer declarative blocks (`lessonPlan`, `contentBlock`, `callout`, etc.) over `legacySection`. Use `legacySection` only as a temporary bridge when automatic conversion is not feasible.

### Card grids sem surpresas

- Prefira o array `cards` para novos conteúdos (cada item aceita `title`, `subtitle`, `body` ou `content`, além de `actions`).
- Garanta que exista algum campo renderizável (`body`, `content`, `description`, `footer` ou `items`). Blocos sem texto são rejeitados pelo validador.
- O campo `columns` deve estar entre 1 e 4. Valores fracionários ou fora desse intervalo são considerados inválidos.
- Quando precisar mapear estados visuais, utilize `tone` (`primary`, `success`, `neutral`, etc.) ou variantes canônicas (`info`, `good-practice`, `academic`, `warning`, `task`, `error`).
- Ações (`actions`) precisam conter pares `{ "label": "...", "href": "..." }` e, se `external` for usado, mantenha-o booleano.

## 3. Design & Material 3 Tokens

The global styles are defined in `src/assets/styles.css`. When handcrafting HTML inside `legacySection.html`, rely on the shared MD3 utilities instead of ad-hoc styling:

- **Typography:** `.md-typescale-display-*`, `.md-typescale-headline-*`, `.md-typescale-title-*`, `.md-typescale-body-*`, `.md-typescale-label-*` provide the correct `line-height`, weight and letter spacing for each level of the Material 3 scale.
- **Colour & contrast:** `.text-on-surface`, `.text-on-surface-variant`, `.text-on-primary`, `.text-on-primary-container`, `.text-on-secondary-container` guarantee readable foreground combinations.
- **Surfaces & depth:** `.md-surface`, `.md-surface-container`, `.md-surface-container-high`, `.md-surface-primary`, `.md-surface-primary-container` combined with `.md-elevation-1/2/3` replace bespoke backgrounds and shadows.
- **Icon sizing:** `.md-icon` with modifiers (`--sm`, `--md`, `--lg`) aligns Lucide icons to the MD3 dimension system.
- **Spacing:** prefer the spacing tokens (`var(--md-sys-spacing-*)`) already declared at the root when adding gaps or paddings.

Inside legacy sections the renderer automatically wraps blocks with MD3 cards (`data-legacy-card`) and grids (`data-legacy-grid`). You only need to produce semantic HTML (`<h3>`, `<ul>`, `<p>`, `<code>`).

## 4. Naming & Language Conventions

- Variable, file and function names must be in English (e.g. `lessonSummary`, not `resumoAula`).
- User-facing copy can remain in Portuguese (pt-BR) because it is content-specific.
- Comments inside the codebase must be written in English and explain _why_ rather than _what_.

## 5. Workflow for New Content

1. Execute `npm run scaffold:lesson -- --course <slug> --number <NN> --title "Aula X"` (or pass `--id lesson-NN`) to scaffold the trio (`lessons.json`, `<id>.json`, `<id>.vue`). Lesson ids must follow the zero-padded pattern `lesson-01`, `lesson-02`, etc.
2. Author the structured JSON describing the new lesson content. Reuse existing block schemas whenever possible.
3. Adjust the generated Vue wrapper if necessary (meta/objective or availability flags).
4. Run `npm run validate:content` (or `npm run validate:report` to persist the aggregated JSON com o resumo de metadados) to ensure the schema and file references remain consistent e auditáveis.
5. Run `npm run format` followed by `npm run build` to ensure the Vue compiler accepts the new content.

### Metadados de geração e manifestos complementares

- Sempre preencha o objeto `metadata` (`generatedBy`, `model`, `timestamp`) ao criar ou atualizar entradas em `exercises.json` e `supplements.json`. Use `generatedBy: "Equipe EDU"` para trabalho manual ou o identificador da IA responsável.
- Prefira timestamps em UTC (`2024-06-14T00:00:00.000Z`). Esses campos ajudam a rastrear conteúdo produzido por LLMs e priorizar revisões humanas.
- `supplements.json` pode listar PDFs, slides, planilhas ou outros assets. Defina `type` para orientar o consumo (`reading`, `slide`, `lab`, etc.) e mantenha `available: false` até que o arquivo/link esteja pronto.
- Após rodar `npm run validate:report`, consulte `reports/content-validation-report.json` para ver o consolidado por curso (totais por autor/modelo, intervalo temporal e entradas individuais) antes de enviar mudanças.
- Use `npm run report:observability` para acompanhar quantas lições continuam com blocos legados, qual a cobertura de blocos MD3 em cada curso e se exercícios/suplementos mantêm metadados completos.
- Rode `npm run report:observability:check` quando quiser reproduzir o mesmo guardrail do CI/CD; o workflow de deploy falha automaticamente se encontrar exercícios ou suplementos sem `metadata` obrigatório.
- Execute `npm run report:governance` para gerar `reports/governance-alert.md`/`.json`, atualizar `reports/governance-history.json` com a série temporal e obter um resumo dos cursos que ainda têm problemas/avisos, blocos legados e lacunas de metadados (combinação direta dos dois relatórios anteriores).
- Em seguida rode `npm run report:governance:history` para sintetizar os dados em `reports/governance-history-summary.json` e gerar a tabela semanal `reports/governance-history.md`, usada pela issue automática para registrar a evolução.
- O GitHub Actions atualiza automaticamente uma issue com label `governanca-automatica` a cada execução da pipeline, usando esse resumo para indicar prioridades e acompanhar a redução de blocos legados ao longo do tempo.
- A página `/relatorios/validacao-conteudo` exibe os mesmos dados com cobertura por curso, autores recorrentes e modelos utilizados, facilitando a conferência visual dos metadados antes do deploy.

### Automating HTML-first lessons

When an AI or collaborator delivers the lesson as `<section>`-structured HTML, skip manual JSON editing by piping the markup
through `create-lesson-from-html.mjs`:

```bash
node scripts/create-lesson-from-html.mjs \
  --course algi \
  --id lesson-42 \
  --title "Aula 42: Algoritmos Avançados" \
  --objective "Explorar técnicas de backtracking." \
  --input aula42.html
```

Or feed the HTML directly from the terminal/AI:

```bash
pbpaste | node scripts/create-lesson-from-html.mjs \
  --course algi \
  --id lesson-42 \
  --title "Aula 42: Algoritmos Avançados" \
  --objective "Explorar técnicas de backtracking."
```

The script will:

- Transform each `<section>` into a `legacySection` block (preserving IDs and headings as titles).
- Generate/overwrite `src/content/courses/<course>/lessons/<id>.json`.
- Scaffold the matching Vue wrapper (`<id>.vue`).
- Insert or update the lesson entry inside `lessons.json` (keeping alphabetical order).

You can still refine the generated JSON afterwards, migrating chunks from `legacySection` to richer block types when time
allows.

The helper scripts in `scripts/` (`structure-legacy-sections.mjs`, `apply-lesson-template.mjs`, `convert-exercises-to-json.mjs`) can speed up migrations when scraping legacy HTML, but hand-crafted lessons should follow the structured format from the start.

## 6. Accessibility & Media

- Always provide descriptive text for media (e.g. `title` for videos, descriptive captions in callouts).
- Use semantic HTML tags (`<strong>`, `<em>`, `<code>`, `<ol>`, `<ul>`, `<table>`) so screen readers can navigate the content.
- When embedding code samples, set the `language` field in `code` blocks (e.g. `"language": "typescript"`).

## 7. Checklist Before Submitting Content

- [ ] JSON validates and mirrors the schema used in AlgI (`npm run validate:content` ou `npm run validate:report`).
- [ ] Vue wrapper renders `<LessonRenderer :data="..." />` and nothing else.
- [ ] Icons correspond to the Lucide palette (`GraduationCap`, `Target`, `BookOpen`, etc.) and will be mapped automatically when using `legacySection` ids.
- [ ] Blocos `cardGrid` trazem título + conteúdo e usam variantes/tónus canônicos (`info`, `good-practice`, `primary`, `neutral`, etc.).
- [ ] Spacing, casing and tokens follow Material Design 3 conventions.
- [ ] `npm run format` and `npm run build` succeed locally.

Following this guide keeps the authoring experience consistent and ensures that any AI-assisted content generation aligns with the platform’s architecture, design language, and accessibility expectations.
