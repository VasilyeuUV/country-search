/** @file Tests for the countries API transport. */

import { describe, expect, it, jest } from '@jest/globals';
import { HttpError } from '../../core/http-error.js';
import { InvalidResponseError } from '../../core/invalid-response-error.js';
import { searchCountries } from '../../data/api/search-countries.js';
import { SPAIN_RAW } from '../../data/fixtures/countries-raw.fixture.js';

/** Timeout used in tests instead of the production 8 seconds. */
const TEST_TIMEOUT_MS = 20;

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function textResponse(body: string, status: number): Response {
  return new Response(body, { status });
}

/** Fetch stub that never answers on its own and rejects with the abort reason. */
function mockPendingFetch(): void {
  jest.spyOn(globalThis, 'fetch').mockImplementation(
    (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(init.signal?.reason);
        });
      }),
  );
}

describe('searchCountries', () => {
  it('requests the name endpoint with an encoded query', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([SPAIN_RAW]));

    await searchCountries('united arab');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://countries.dev/name/united%20arab',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('maps a successful payload to domain countries', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([SPAIN_RAW]));

    const countries = await searchCountries('spain');

    expect(countries).toHaveLength(1);
    expect(countries[0]?.name).toBe('Spain');
    expect(countries[0]?.capital).toBe('Madrid');
  });

  it('returns an empty list for an empty payload', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([]));

    await expect(searchCountries('spain')).resolves.toEqual([]);
  });

  it('treats 404 as no matches, not as an error', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(textResponse('Country not found', 404));

    await expect(searchCountries('zzzzzz')).resolves.toEqual([]);
  });

  it('throws HttpError with the status for a server failure', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(textResponse('Server error', 500));

    await expect(searchCountries('spain')).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
    });
  });

  it('throws HttpError for a non-404 client error', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(textResponse('Bad request', 400));

    await expect(searchCountries('spain')).rejects.toBeInstanceOf(HttpError);
  });

  it('propagates the caller cancellation as AbortError', async () => {
    mockPendingFetch();
    const controller = new AbortController();

    const request = searchCountries('spain', controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('reports a slow response as TimeoutError', async () => {
    mockPendingFetch();

    await expect(searchCountries('spain', undefined, TEST_TIMEOUT_MS)).rejects.toMatchObject({
      name: 'TimeoutError',
    });
  });

  it('rejects a payload that is not a country list', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'ok' }));

    await expect(searchCountries('spain')).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('rejects a payload with records of the wrong shape', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([{ name: 'Spain' }]));

    await expect(searchCountries('spain')).rejects.toBeInstanceOf(InvalidResponseError);
  });
});
