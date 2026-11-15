/** @file Dev-only fake transport imitating the countries.dev API from local data. */

import type { CountryRaw } from '../api/countries-raw.js';

/** Behaviour of the fake transport. */
export interface MockFetchOptions {
  /** Simulated network latency in milliseconds. */
  readonly latencyMs?: number;
  /** Forces an unsuccessful status, to demo the retry flow. */
  readonly forceStatus?: number;
}

const NAME_PATH = '/name/';
const DEFAULT_LATENCY_MS = 250;
const NOT_FOUND_BODY = 'Country not found';

/**
 * Creates a `fetch` replacement that answers from local data.
 *
 * @param dataset - Records to answer from, in the wire format.
 * @param options - Latency and forced failure status.
 * @returns Function with the `fetch` signature.
 */
export function createMockFetch(
  dataset: readonly CountryRaw[],
  options: MockFetchOptions = {},
): typeof fetch {
  const latencyMs = options.latencyMs ?? DEFAULT_LATENCY_MS;

  return async (input, init) => {
    const url = String(input);
    const pathIndex = url.indexOf(NAME_PATH);

    if (pathIndex === -1) {
      throw new TypeError(`Mock transport serves only ${NAME_PATH} requests, got ${url}`);
    }

    const query = decodeURIComponent(url.slice(pathIndex + NAME_PATH.length))
      .trim()
      .toLowerCase();

    await pause(latencyMs, init?.signal ?? undefined);

    if (options.forceStatus !== undefined) {
      return new Response('Forced failure', { status: options.forceStatus });
    }

    const matches =
      query.length === 0
        ? []
        : dataset.filter((country) => country.name.toLowerCase().includes(query));

    if (matches.length === 0) {
      return new Response(NOT_FOUND_BODY, { status: 404 });
    }

    return new Response(JSON.stringify(matches), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

async function pause(ms: number, signal: AbortSignal | undefined): Promise<void> {
  if (signal === undefined) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });

    return;
  }

  const abortSignal = signal;

  await new Promise<void>((resolve, reject) => {
    if (abortSignal.aborted) {
      reject(abortSignal.reason);
      return;
    }

    const timerId = setTimeout(() => {
      resolve();
    }, ms);

    abortSignal.addEventListener(
      'abort',
      () => {
        clearTimeout(timerId);
        reject(abortSignal.reason);
      },
      { once: true },
    );
  });
}
