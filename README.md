# EDU - Courses Hub (Vue + Vite + Tailwind + PWA)

Unified site hosting multiple university courses by Prof. Tiago Sombra. Built with Vue 3, Vite, Tailwind CSS, Vue Router and configured for GitHub Pages.

## Install & Run

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build && npm run preview
```

## Add a new course

1. Create `public/courses/<id>/` with:
   - `meta.json` - `{ id, title, institution, description }`
   - `lessons.json` - `[{ id, title, file }]`
   - `lessons/<file>.html` - HTML lesson pages
2. Register the course in `src/data/courses.ts`.

## Routing

- `/` - Home with cards (all courses)
- `/course/:courseId` - Course landing (loads `meta.json`)
- `/course/:courseId/lesson/:lessonId` - Lesson page (loads HTML via `lessons.json`)

## PWA

- Configured via `vite-plugin-pwa` with SPA fallback.
- `public/offline.html` will show when offline and content is missing.

## Deploy

- GitHub Actions workflow in `.github/workflows/deploy.yml` uploads `dist/` to GitHub Pages.