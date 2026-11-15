/** @file Race test: an older answer must never replace a newer one. */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { SPAIN_RAW, GERMANY_RAW } from '../../data/fixtures/countries-raw.fixture.js';
import { createSearchController } from '../../services/search-controller.js';

const DEBOUNCE_MS = 10;

interface PendingRequest {
  readonly signal: AbortSignal | null | undefined;
  respond(body: string): void;
}

/** Builds a fetch mock that answers only when the test says so, and honours aborts. */
function mockControlledFetch(pending: Map<string, PendingRequest>): void {
  jest.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
    const query = decodeURIComponent(String(input).split('/name/')[1] ?? '');
    const signal = init?.signal;

    return new Promise<Response>((resolve, reject) => {
      signal?.addEventListener('abort', () => {
        reject(signal.reason);
      });

      pending.set(query, {
        signal,
        respond: (body) => {
          resolve(
            new Response(body, {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        },
      });
    });
  });
}

describe('search race', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the last query even when the older answer arrives later', async () => {
    const pending = new Map<string, PendingRequest>();
    mockControlledFetch(pending);

    const controller = createSearchController({ debounceMs: DEBOUNCE_MS });

    controller.setQuery('sp');
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS);

    controller.setQuery('spain');
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(controller.getState()).toEqual({ status: 'loading', query: 'spain' });

    pending.get('spain')?.respond(JSON.stringify([SPAIN_RAW]));
    await jest.advanceTimersByTimeAsync(0);

    pending.get('sp')?.respond(JSON.stringify([SPAIN_RAW, GERMANY_RAW]));
    await jest.advanceTimersByTimeAsync(0);

    const state = controller.getState();

    expect(state.status).toBe('results');
    expect(state).toEqual({
      status: 'results',
      query: 'spain',
      countries: [expect.objectContaining({ name: 'Spain' })],
    });
    expect(pending.get('sp')?.signal?.aborted).toBe(true);
  });
});
