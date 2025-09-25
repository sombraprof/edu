# EDU · Courses Hub

Vue 3 + Vite application that centralises the course material of Prof. Tiago Sombra. The interface follows Material Design 3 and renders structured JSON content through reusable Vue components.

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

## Content Architecture

All course assets live under `src/content/courses/<courseId>/`:

```
src/content/courses/<courseId>/
├── meta.json                # Course metadata (id, title, institution, description)
├── lessons.json             # Lessons index ({ id, title, description?, available, file })
├── lessons/
│   ├── lessonX.json         # Structured blocks consumed by LessonRenderer
│   └── lessonX.md           # Wrapper that imports the JSON and renders <LessonRenderer>
├── exercises.json          # Exercises index ({ id, title, summary?, available, file })
└── exercises/
    ├── exerciseY.json       # Structured blocks identical to lessons
    └── exerciseY.md         # Wrapper that imports the JSON and renders <LessonRenderer>
```

Structured blocks should prefer declarative component types (`lessonPlan`, `contentBlock`, `callout`, etc.). `legacySection` is available as a temporary escape hatch for sanitised HTML; the renderer will still apply MD3 surfaces to those sections.

For detailed authoring guidance – including naming conventions, block schemas, design tokens and accessibility recommendations – see [`docs/CONTENT_AUTHORING_GUIDE.md`](docs/CONTENT_AUTHORING_GUIDE.md).

## Helper Scripts

- `node scripts/structure-legacy-sections.mjs` – converts legacy HTML lessons (when available) into `legacySection` blocks.
- `node scripts/apply-lesson-template.mjs` – regenerates the Markdown wrappers so they only mount `LessonRenderer` with the latest JSON.
- `node scripts/convert-exercises-to-json.mjs` – mirrors the same process for exercises.

These scripts are optional; new content should be authored directly in the structured JSON format.

## Key Components

- `LessonRenderer.vue` orchestrates all block types and applies Material 3 spacing and typography.
- `LegacySection.vue` and `LegacyHtml.vue` provide MD3 surfaces for sanitised HTML while the content is being migrated.
- `ExerciseView.vue` shares exactly the same rendering pipeline used by lessons, ensuring visual parity between theory and practice.

## Deployment / PWA

- The project uses `vite-plugin-pwa` with SPA fallback for GitHub Pages.
- The deployment workflow lives in `.github/workflows/deploy.yml`.

## Quality Checklist

Before opening a pull request:

- [ ] Run `npm run format` and `npm run build` locally.
- [ ] Ensure component names, variables and comments are written in English.
- [ ] Confirm that lessons/exercises reference the correct JSON wrapper and appear in `lessons.json` / `exercises.json` indexes.
- [ ] Update documentation when the architecture or authoring workflow changes.
