# Design decisions

## 1. Cancelling stale requests

Every request lives under its own `AbortController`, created in
`src/services/search-controller.ts` (`run()`). `setQuery()` calls `abort()` **before**
the debounce timer is scheduled, that is on the keystroke itself, not when the new
request is about to be sent. This is the whole point: 400 ms pass between the input
and the request start, and during that window the answer for the previous input can
arrive and be rendered under the already new text.

Inside `searchCountries` (`src/data/api/search-countries.ts`) the caller signal is
merged with the request timeout:

    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const requestSignal = signal === undefined
      ? timeoutSignal
      : AbortSignal.any([signal, timeoutSignal]);

The two reasons are told apart by the error name in `catch`:

- `AbortError` - we cancelled it ourselves (new input, cleared field). Nothing is
  shown to the user, the state is not touched.
- `TimeoutError` - the server did not answer in time. This is a real failure: a
  message plus the "Retry" button.

After `await` there is a second check, `controller.signal.aborted`. It closes the only
remaining window: the promise has already resolved, but its continuation runs after a
new input. This is not time based filtering of responses: cancellation stays the main
mechanism, and the check is just a post-condition "is this still my request".

Why not an "is this the latest response" flag: the request keeps running - network,
traffic, API limits - the response is still received and parsed, only to be dropped
afterwards. The race is narrowed but not removed, and in DevTools such requests are
not marked as `canceled` (a separate item of the task checklist).

## 2. Debounce delay

`DEBOUNCE_MS = 400` from `src/config/constants.ts`.

- With no delay (0 ms) the word "spain" becomes five requests, constant cancellations
  and unnecessary load on the API.
- 250-300 ms feels twitchy: pauses between keystrokes during fast typing are around
  100-150 ms, so some words still produce several requests.
- 400 ms separates "finished typing" from "still typing" and does not feel slow yet.
- 1000 ms and more: the interface looks broken - the word is typed, the search is not
  running.

Debounce and cancellation do not replace each other: debounce reduces the number of
requests, `AbortController` guarantees the correct order of results. The loader is
shown only for slow requests (`LOADER_DELAY_MS = 600` in
`src/ui/views/status-panel.ts`), so a cached answer never makes it flicker.

## 3. Complexity

- `mapCountryResponse` (`src/data/api/map-country-response.ts`) - O(n·m), where n is
  the number of countries in the response (at most ~250) and m is the number of
  languages plus currencies of one country (a few). Practically O(n) in time and
  O(n·m) in memory: one domain object and fresh language and currency arrays per
  country.
- Cache (`src/services/request-cache.ts`) - O(1) reads and writes (Map), O(1) per
  evicted entry, the size is capped at 20 entries, so memory does not grow with the
  number of requests.
- In-flight de-duplication - O(1) per call, plus a subscriber counter, O(k) for k
  concurrent callers of the same query.
- History (`src/services/search-history.ts`) - O(h) read and write, h <= 8.

## 4. Clean code: where it is applied

| Principle                                                           | Where                                                                                                                                                                                           |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layers and dependency direction: `domain <- data <- services <- ui` | `src/domain`, `src/data`, `src/services`, `src/ui`; the only composition points are `src/main.ts` and `src/ui/app.ts`                                                                           |
| Single responsibility                                               | `search-countries.ts` - transport and HTTP semantics only; `map-country-response.ts` - pure transformation; `search-controller.ts` - debounce, cancellation, state; `src/ui/views/*` - DOM only |
| Pure functions, testable without network or browser                 | `map-country-response.ts`, `format.ts`, `search-errors.ts`, `debounce.ts`                                                                                                                       |
| Dependency injection only where a second implementation exists      | `SearchFn` in the controller, `StorageLike` in the history, `createMockFetch` for the offline mode                                                                                              |
| The `innerHTML` ban is enforced by a linter, not by agreement       | `no-restricted-syntax` in `eslint.config.mjs`; every node is created in `src/ui/dom.ts`                                                                                                         |
| No magic values or magic strings                                    | `src/config/constants.ts` and `as const` registries: `SEARCH_STATUS`, `SEARCH_ERROR_KIND`, `DETAILS_TAB`, `DATA_SOURCE`                                                                         |
| Errors are distinguished by type, not by message text               | `HttpError`, `InvalidResponseError`, `classifySearchError`                                                                                                                                      |
| Documentation as a rule, not a wish                                 | `jsdoc/require-file-overview` and `jsdoc/require-jsdoc` in `eslint.config.mjs`                                                                                                                  |
