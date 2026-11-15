# Country Search

Live country search built with TypeScript and plain DOM — no framework, no bundler.
Type a name, and the app queries the [countries.dev](https://countries.dev) API as you
go, cancelling every request that is no longer relevant.

**[Live demo](https://vasilyeuuv.github.io/country-search/)** ·
[Task description](https://github.com/rolling-scopes-school/tasks/blob/master/fullstack-engineering/tasks/country-search/README.md) ·
[Design decisions](./DESIGN.md)

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)
![Jest](https://img.shields.io/badge/tests-Jest-c21325)
![No dependencies](https://img.shields.io/badge/runtime%20deps-none-4dff7a)

## What it does

- **Live search** — results appear while you type, after a short debounce.
- **Real cancellation** — every keystroke aborts the previous request with
  `AbortController`, so a slow answer for an old query can never overwrite a newer one.
- **Honest states** — loading, "nothing found" (HTTP 404 is not an error), and a real
  failure with a **Retry** button that repeats the last query.
- **Details modal** — click a card to see area, borders, languages and currencies in a
  PIP-BOY style screen.
- **Offline mode** — the whole flow can run against local data, without internet.
- **Request cache** — a repeated query is served from memory, identical concurrent
  queries share a single request.
- **Search history** — the last eight successful queries are kept in `localStorage`.
- **Fallout-style UI** — neon terminal, CRT scanlines, animated radar and mascot.

## Tech stack

| Area          | Choice                                                                  |
| ------------- | ----------------------------------------------------------------------- |
| Language      | TypeScript 5.9, strict mode, ES modules                                 |
| Build         | `tsc` only — the browser loads `dist/main.js` as a native module        |
| Tests         | Jest 30 + ts-jest                                                       |
| Lint & format | ESLint 10 (flat config) + Prettier 3                                    |
| Git hooks     | husky 9 + lint-staged                                                   |
| Data          | [countries.dev](https://countries.dev) — free, no API key, CORS enabled |

## Requirements

- Node.js **22.22.1** or newer (`node -v`)
- npm 10 or newer (`npm -v`)

## Quick start

```bash
git clone https://github.com/VasilyeuUV/country-search.git
cd country-search
npm install
npm run dev
```

Open <http://localhost:5173> — that's it. The dev command starts the TypeScript watcher
and a static server together.

## Scripts

| Command                                   | What it does                                                     |
| ----------------------------------------- | ---------------------------------------------------------------- |
| `npm run dev`                             | Development mode: `tsc --watch` + static server on port 5173     |
| `npm run build`                           | Production build to `dist/` (no source maps, comments stripped)  |
| `npm run preview`                         | Serve the production build on port 4173                          |
| `npm test`                                | Run the Jest suite once                                          |
| `npm run test:watch`                      | Run Jest in watch mode                                           |
| `npm run test:coverage`                   | Run tests with a coverage report                                 |
| `npm run typecheck`                       | Type-check everything, including tests                           |
| `npm run lint` / `npm run lint:fix`       | ESLint, with and without autofix                                 |
| `npm run format` / `npm run format:check` | Prettier write / verify                                          |
| `npm run check`                           | Lint + format check + type check + tests — run it before pushing |

## Three modes

| Mode            | How to start                             | Data source                |
| --------------- | ---------------------------------------- | -------------------------- |
| Development     | `npm run dev`                            | real `countries.dev` API   |
| Local / offline | `npm run dev`, then open `/?source=mock` | local fixtures, no network |
| Production      | `npm run build` && `npm run preview`     | real API                   |

The offline mode accepts two extra query parameters, handy for demos and for going
through the task checklist without DevTools throttling:

| URL                       | Effect                                                    |
| ------------------------- | --------------------------------------------------------- |
| `?source=mock`            | answers from local fixtures, 250 ms simulated latency     |
| `?source=mock&delay=3000` | slow answers — you can see the loader and the race        |
| `?source=mock&fail=500`   | every request fails — check the error state and **Retry** |

The mock replaces `fetch` itself, so the whole pipeline runs for real: URL building,
`response.ok` handling, the 404 branch, JSON parsing, validation and mapping.

## Project structure

```
src/
├─ config/     constants and the data source switch
├─ core/       debounce, HttpError, error classification
├─ data/       API transport, raw types, mapper, fixtures, fake transport
├─ domain/     country model and search state
├─ services/   search controller, request cache, search history
├─ ui/         DOM views and the composition root
└─ tests/      Jest suites, mirroring the source tree
```

The dependency direction is `domain ← data ← services ← ui`: the UI knows nothing about
`fetch`, the transport knows nothing about the DOM. Details are in [DESIGN.md](./DESIGN.md).

## Tests

The suite runs on Node with no browser and no network:

- `debounce` — timer reset, argument passing, `cancel()`
- HTTP layer — `response.ok`, `404 → []`, `HttpError`, malformed payloads
- cancellation — `AbortError` vs `TimeoutError`, stale response race with an
  abort-aware `fetch` mock
- mapping — real API payloads including countries with missing fields
- controller — states, retry of the last query, own cancellation not shown as an error
- cache — hits, in-flight de-duplication, per-caller cancellation
- history — persistence, deduplication, corruption tolerance

## Git hooks

| Hook         | Runs                                              | Why                                            |
| ------------ | ------------------------------------------------- | ---------------------------------------------- |
| `pre-commit` | `lint-staged` (ESLint + Prettier on staged files) | keeps the commit clean, without touching tests |
| `pre-push`   | `npm test`                                        | a red suite cannot reach the remote            |

Hooks are installed by `npm install` via the `prepare` script. If they seem inactive,
run `npx husky` and check `git config core.hooksPath` (should print `.husky/_`).

## Deployment

The site is published to GitHub Pages by the workflow in
`.github/workflows/deploy.yml`: it installs dependencies, builds `dist/`, copies
`index.html`, `styles.css`, `favicon.svg` and `assets/` into the artifact and deploys it.
In the repository settings, **Pages → Source** must be set to **GitHub Actions**.

## Troubleshooting

| Symptom                                           | Fix                                                                                                                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EADDRINUSE :5173`                                | the previous dev server is still running: `Get-NetTCPConnection -LocalPort 5173 -State Listen \| ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }` |
| Blank page, `Cannot find module './dist/main.js'` | run `npm run build` (or keep `npm run dev` running)                                                                                                           |
| Hooks do not fire                                 | `npx husky`, then check `git config core.hooksPath`                                                                                                           |
| Flags are not visible in offline mode             | expected: `flagcdn.com` is unreachable, so cards fall back to emoji flags                                                                                     |

## Notes

- This is a study project for the [RS School](https://rs.school) Fullstack course.
- Country data comes from [countries.dev](https://countries.dev); flag images from
  [flagcdn.com](https://flagcdn.com).
- The mascot and the radar are original SVG artwork drawn in the Fallout-inspired style.
