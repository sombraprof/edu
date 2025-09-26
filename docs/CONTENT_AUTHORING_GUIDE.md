# Content Authoring Guide for EDU

This document explains how to produce new lessons and exercises that integrate seamlessly with the EDU application.

## 1. High-Level Architecture

- All renderable content lives under `src/content/courses/<courseId>/`.
- Every lesson or exercise is defined by a pair of files:
  - `<id>.json`: structured data consumed by `LessonRenderer.vue`.
  - `<id>.md`: a thin wrapper that imports the JSON and mounts `<LessonRenderer :data="..." />`.
- `lessons.json` and `exercises.json` act as indexes (`{ id, title, description/summary, file, available }`).
- Vue pages (`LessonView.vue`, `ExerciseView.vue`, `CourseHome.vue`) dynamically import these indexes and render the JSON blocks.

## 2. Supported Block Types

`LessonRenderer.vue` understands the following `type` values inside the `content` array:

| Type              | Description                                                                           |
| ----------------- | ------------------------------------------------------------------------------------- |
| `lessonPlan`      | High level plan with hero cards (object must match the existing AlgI schema).         |
| `contentBlock`    | Rich paragraphs, optional sub-blocks and callouts.                                    |
| `callout`         | Highlight box with `variant` (`info`, `good-practice`, `academic`, etc.).             |
| `flightPlan`      | Ordered list of key items (timeline of the class).                                    |
| `timeline`        | Step-by-step timeline.                                                                |
| `accordion`       | Expandable sections (`title`, `content` HTML).                                        |
| `videos`          | Embedded YouTube resources.                                                           |
| `checklist`       | List of completion items.                                                             |
| `bibliography`    | References in HTML/Markdown.                                                          |
| `truthTable`      | Matrix data for logic tables.                                                         |
| `representations` | Used in AlgI to compare narrative/flowchart/pseudocode.                               |
| `legacySection`   | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces). |

> Prefer declarative blocks (`lessonPlan`, `contentBlock`, `callout`, etc.) over `legacySection`. Use `legacySection` only as a temporary bridge when automatic conversion is not feasible.

## 3. Design & Material 3 Tokens

The global styles are defined in `src/assets/styles.css`. When handcrafting HTML inside `legacySection.html`, use the helper classes provided by the app instead of ad-hoc styling:

- `.md-bg-*`, `.md-border-*`, `.md-text-*` for colour tokens.
- `.card`, `.surface-tonal`, `.chip`, `.btn`, `.divider` for layout primitives.
- Respect the spacing scale (`var(--md-sys-spacing-*)`) and typography tokens (`text-title-large`, `text-body-large`, etc.).

Inside legacy sections the renderer automatically wraps blocks with MD3 cards (`data-legacy-card`) and grids (`data-legacy-grid`). You only need to produce semantic HTML (`<h3>`, `<ul>`, `<p>`, `<code>`).

## 4. Naming & Language Conventions

- Variable, file and function names must be in English (e.g. `lessonSummary`, not `resumoAula`).
- User-facing copy can remain in Portuguese (pt-BR) because it is content-specific.
- Comments inside the codebase must be written in English and explain _why_ rather than _what_.

## 5. Workflow for New Content

1. Create or update entries inside `lessons.json` / `exercises.json` for the course.
2. Author the structured JSON describing the new lesson content. Reuse existing block schemas whenever possible.
3. Generate the matching markdown wrapper (`<id>.md`) that imports the JSON and renders `<LessonRenderer>`.
4. Run `npm run format` to apply Prettier formatting.
5. Run `npm run build` to ensure the Vue compiler accepts the new content.

### Automating HTML-first lessons

When an AI or collaborator delivers the lesson as `<section>`-structured HTML, skip manual JSON editing by piping the markup
through `create-lesson-from-html.mjs`:

```bash
node scripts/create-lesson-from-html.mjs \
  --course algi \
  --id lesson42 \
  --title "Aula 42: Algoritmos Avançados" \
  --objective "Explorar técnicas de backtracking." \
  --input aula42.html
```

Or feed the HTML directly from the terminal/AI:

```bash
pbpaste | node scripts/create-lesson-from-html.mjs \
  --course algi \
  --id lesson42 \
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

- [ ] JSON validates and mirrors the schema used in AlgI.
- [ ] Markdown wrapper renders `<LessonRenderer :data="..." />` and nothing else.
- [ ] Icons correspond to the Lucide palette (`GraduationCap`, `Target`, `BookOpen`, etc.) and will be mapped automatically when using `legacySection` ids.
- [ ] Spacing, casing and tokens follow Material Design 3 conventions.
- [ ] `npm run format` and `npm run build` succeed locally.

Following this guide keeps the authoring experience consistent and ensures that any AI-assisted content generation aligns with the platform’s architecture, design language, and accessibility expectations.
