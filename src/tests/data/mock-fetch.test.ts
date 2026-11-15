/** @file Tests for the dev-only fake transport. */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { COUNTRIES_RAW_FIXTURE } from '../../data/fixtures/countries-raw.fixture.js';
import { resolveMockOptions } from '../../data/mock/install-mock-transport.js';
import { createMockFetch } from '../../data/mock/mock-fetch.js';

const API_URL = 'https://countries.dev/name/';

describe('createMockFetch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('answers a matching substring with a json list', async () => {
    const fetchMock = createMockFetch(COUNTRIES_RAW_FIXTURE, { latencyMs: 10 });

    const pending = fetchMock(`${API_URL}spain`);
    await jest.advanceTimersByTimeAsync(10);
    const response = await pending;

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('matches the country name case-insensitively', async () => {
    const fetchMock = createMockFetch(COUNTRIES_RAW_FIXTURE, { latencyMs: 0 });

    const pending = fetchMock(`${API_URL}SPAIN`);
    await jest.advanceTimersByTimeAsync(0);
    const payload = (await (await pending).json()) as { name: string }[];

    expect(payload).toHaveLength(1);
    expect(payload[0]?.name).toBe('Spain');
  });

  it('answers 404 with the real body when nothing matches', async () => {
    const fetchMock = createMockFetch(COUNTRIES_RAW_FIXTURE, { latencyMs: 0 });

    const pending = fetchMock(`${API_URL}zzzzzz`);
    await jest.advanceTimersByTimeAsync(0);
    const response = await pending;

    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toBe('Country not found');
  });

  it('forces an unsuccessful status to demo the retry flow', async () => {
    const fetchMock = createMockFetch(COUNTRIES_RAW_FIXTURE, { latencyMs: 0, forceStatus: 500 });

    const pending = fetchMock(`${API_URL}spain`);
    await jest.advanceTimersByTimeAsync(0);

    expect((await pending).status).toBe(500);
  });

  it('rejects with AbortError when the caller cancels before the answer', async () => {
    const fetchMock = createMockFetch(COUNTRIES_RAW_FIXTURE, { latencyMs: 500 });
    const controller = new AbortController();

    const request = fetchMock(`${API_URL}spain`, { signal: controller.signal });
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('resolveMockOptions', () => {
  it('reads the tuning from the query string', () => {
    expect(resolveMockOptions('?source=mock&fail=500&delay=1200')).toEqual({
      latencyMs: 1200,
      forceStatus: 500,
    });
  });

  it('ignores missing or invalid tuning values', () => {
    expect(resolveMockOptions('?source=mock&delay=fast')).toEqual({
      latencyMs: undefined,
      forceStatus: undefined,
    });
  });
});
