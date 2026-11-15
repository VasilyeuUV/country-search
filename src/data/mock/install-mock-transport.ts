/** @file Installs the fake transport for the offline mode. No-op for the API mode. */

import { DATA_SOURCE, resolveDataSource } from '../../config/data-source.js';
import type { DataSource } from '../../config/data-source.js';
import { COUNTRIES_RAW_FIXTURE } from '../fixtures/countries-raw.fixture.js';
import { createMockFetch } from './mock-fetch.js';
import type { MockFetchOptions } from './mock-fetch.js';

const FAIL_STATUS_PARAM = 'fail';
const LATENCY_PARAM = 'delay';

/**
 * Reads mock tuning from the URL.
 *
 * `?source=mock&fail=500` makes every request fail;
 * `?source=mock&delay=2000` slows answers down, which makes the race visible.
 *
 * @param search - `window.location.search`-like string.
 * @returns Latency and forced status, when present and valid.
 */
export function resolveMockOptions(search: string): MockFetchOptions {
  const params = new URLSearchParams(search);

  return {
    latencyMs: readNumber(params.get(LATENCY_PARAM)),
    forceStatus: readNumber(params.get(FAIL_STATUS_PARAM)),
  };
}

/**
 * Replaces `globalThis.fetch` with the fake transport when `?source=mock`.
 *
 * Called once from the entry point. The switch lives here so that no
 * production module knows about the mock.
 *
 * @param search - `window.location.search`-like string.
 * @returns Data source that is active after the call.
 */
export function installMockTransportIfRequested(search: string): DataSource {
  if (resolveDataSource(search) !== DATA_SOURCE.mock) {
    return DATA_SOURCE.api;
  }

  globalThis.fetch = createMockFetch(COUNTRIES_RAW_FIXTURE, resolveMockOptions(search));

  return DATA_SOURCE.mock;
}

function readNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}
