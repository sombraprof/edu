# Testing Guide

This project relies on [Vitest](https://vitest.dev/) with the jsdom environment to run fast unit and component tests. The goal of the current suite is to cover the core data flow (Pinia stores) and the most important UI states for the Material 3 components.

## Test Inventory

| File | Scope | What it covers |
| --- | --- | --- |
| `src/tests/components/LessonCard.test.js` | Component | Renders `LessonCard` in available/unavailable states, validates accessibility attributes and the router link target. |
| `src/tests/unit/dataStore.test.js` | Store | Exercises the data store end-to-end: fetch mocks, lesson/exercise transformation, filtering and error recovery. |
| `src/tests/unit/filtersStore.test.js` | Store | Confirms the filter store toggles view/filter state consistently. |
| `src/tests/unit/themeStore.test.js` | Store | Checks light/dark theme toggling, DOM side effects, highlight.js theme sync and meta color updates. |

> If you add new stores or components, mirror this structure by placing component tests under `src/tests/components` and store/composable tests under `src/tests/unit`.

## Running The Tests

All commands must be issued from the repository root.

| Command | Description |
| --- | --- |
| `npm run test` | Runs the full Vitest suite once. |
| `npm run test -- --watch` | Re-runs affected tests on every file change. Useful while developing. |
| `npm run test -- --runInBand` | Forces serial execution when debugging flaky tests. |
| `npm run test:coverage` | Generates coverage reports (HTML and summary in the terminal). |

Coverage is currently limited to the areas where we actively invest in tests. The `config/vitest.config.js` file keeps the coverage `include` list focused on stores and plain JS helpers while excluding generated assets and `.vue` SFCs. Update those globs once you begin mounting components so the report reflects the new surface area.

## Writing New Tests

- Prefer [Vue Test Utils](https://test-utils.vuejs.org/) for component rendering. Stub router/link dependencies with `RouterLinkStub` as shown in the `LessonCard` test.
- For Pinia stores, call `setActivePinia(createPinia())` inside each test to isolate state.
- Use `vi.mock` to stub browser-only helpers (e.g., highlight theme toggler) so the suite stays fast and deterministic.
- The shared test setup (`src/tests/setup.js`) already mocks `matchMedia`, `localStorage` and `sessionStorage`. Extend it if future features rely on additional browser APIs.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `ReferenceError: window is not defined` | Ensure the test runs under jsdom (see `config/vitest.config.js`) and mock browser helpers before importing the module under test. |
| `ERR_INVALID_URL` when mocking fetch | Always return a resolved object with `ok`, `json` (and optionally `status`/`statusText`) from your fetch mocks. |
| Watcher-related race conditions | Use `await nextTick()` or `await flushPromises()` after triggering async store/component logic to await DOM updates. |

Keeping this document up to date with every new test makes onboarding teammates much easier. Feel free to add sections for E2E testing or manual QA flows when they become available.
