# Runtime utilities coverage

This document tracks the status of the utility helpers under `src/utils/` so it
is clear which ones are wired into the application and how they are validated.

| Utility              | Runtime usage                                                                                                                                 | Validation                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `contentManifest.ts` | Not imported by the Vue runtime yet. Mirrors the Node implementation in `scripts/utils/manifest.mjs` for future client-side manifest loading. | Dedicated unit tests in `src/utils/__tests__/contentManifest.test.ts` cover array/object exports and invalid payloads.           |
| `sanitizeHtml.ts`    | Used extensively across lesson/exercise components to clean HTML snippets rendered at runtime.                                                | Direct unit tests in `src/utils/__tests__/sanitizeHtml.test.ts` exercise DOMPurify integration, SSR fallback and error handling. |

Re-run `npm run test:coverage` whenever a helper is added or modified to
ensure all code paths keep their coverage guarantees.
