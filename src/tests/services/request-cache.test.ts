/** @file Tests for the request cache and in-flight de-duplication. */

import { describe, expect, it, jest } from '@jest/globals';

import { HttpError } from '../../core/http-error.js';
import type { Country } from '../../domain/country.js';
import { createCachedSearch } from '../../services/request-cache.js';
import type { SearchFn } from '../../services/search-controller.js';
import { SPAIN_COUNTRY } from '../fixtures/country.fixture.js';

interface Deferred<T> {
  readonly promise: Promise<T>;
  resolve(value: T): void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

describe('createCachedSearch', () => {
  it('serves a repeated query from the cache', async () => {
    const search = jest.fn<SearchFn>().mockResolvedValue([SPAIN_COUNTRY]);
    const cachedSearch = createCachedSearch(search);

    await expect(cachedSearch('spain')).resolves.toEqual([SPAIN_COUNTRY]);
    await expect(cachedSearch('spain')).resolves.toEqual([SPAIN_COUNTRY]);

    expect(search).toHaveBeenCalledTimes(1);
  });

  it('normalises the query key', async () => {
    const search = jest.fn<SearchFn>().mockResolvedValue([SPAIN_COUNTRY]);
    const cachedSearch = createCachedSearch(search);

    await cachedSearch('Spain');
    await cachedSearch('  spain ');

    expect(search).toHaveBeenCalledTimes(1);
  });

  it('caches an empty result', async () => {
    const search = jest.fn<SearchFn>().mockResolvedValue([]);
    const cachedSearch = createCachedSearch(search);

    await expect(cachedSearch('zzzzzz')).resolves.toEqual([]);
    await expect(cachedSearch('zzzzzz')).resolves.toEqual([]);

    expect(search).toHaveBeenCalledTimes(1);
  });

  it('does not cache a failure', async () => {
    const search = jest
      .fn<SearchFn>()
      .mockRejectedValueOnce(new HttpError(500))
      .mockResolvedValueOnce([SPAIN_COUNTRY]);
    const cachedSearch = createCachedSearch(search);

    await expect(cachedSearch('spain')).rejects.toBeInstanceOf(HttpError);
    await expect(cachedSearch('spain')).resolves.toEqual([SPAIN_COUNTRY]);

    expect(search).toHaveBeenCalledTimes(2);
  });

  it('de-duplicates concurrent identical requests', async () => {
    const deferred = createDeferred<readonly Country[]>();
    const search = jest.fn<SearchFn>().mockReturnValue(deferred.promise);
    const cachedSearch = createCachedSearch(search);

    const first = cachedSearch('spain');
    const second = cachedSearch('spain');

    deferred.resolve([SPAIN_COUNTRY]);

    await expect(Promise.all([first, second])).resolves.toEqual([[SPAIN_COUNTRY], [SPAIN_COUNTRY]]);
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('keeps the shared request alive when one caller cancels', async () => {
    const deferred = createDeferred<readonly Country[]>();
    const search = jest.fn<SearchFn>().mockReturnValue(deferred.promise);
    const cachedSearch = createCachedSearch(search);
    const controller = new AbortController();

    const cancelled = cachedSearch('spain', controller.signal);
    const waiting = cachedSearch('spain');

    controller.abort();
    await expect(cancelled).rejects.toMatchObject({ name: 'AbortError' });

    deferred.resolve([SPAIN_COUNTRY]);
    await expect(waiting).resolves.toEqual([SPAIN_COUNTRY]);
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('aborts the shared request when every caller cancels', async () => {
    const signals: AbortSignal[] = [];
    const search = jest.fn<SearchFn>((_query, signal) => {
      if (signal !== undefined) {
        signals.push(signal);
      }

      return new Promise<never>(() => {
        // never settles: only the cancellation itself is under test
      });
    });
    const cachedSearch = createCachedSearch(search);
    const first = new AbortController();
    const second = new AbortController();

    const cancelledFirst = cachedSearch('spain', first.signal);
    const cancelledSecond = cachedSearch('spain', second.signal);

    first.abort();
    second.abort();

    await expect(cancelledFirst).rejects.toMatchObject({ name: 'AbortError' });
    await expect(cancelledSecond).rejects.toMatchObject({ name: 'AbortError' });
    expect(signals[0]?.aborted).toBe(true);
  });

  it('does not cache a cancelled request', async () => {
    const search = jest
      .fn<SearchFn>()
      .mockReturnValueOnce(
        new Promise<never>(() => {
          // hung request that is going to be cancelled
        }),
      )
      .mockResolvedValueOnce([SPAIN_COUNTRY]);
    const cachedSearch = createCachedSearch(search);
    const controller = new AbortController();

    const cancelled = cachedSearch('spain', controller.signal);
    controller.abort();
    await expect(cancelled).rejects.toMatchObject({ name: 'AbortError' });

    await expect(cachedSearch('spain')).resolves.toEqual([SPAIN_COUNTRY]);
    expect(search).toHaveBeenCalledTimes(2);
  });

  it('evicts the oldest entry when the limit is reached', async () => {
    const search = jest.fn<SearchFn>().mockResolvedValue([SPAIN_COUNTRY]);
    const cachedSearch = createCachedSearch(search, { maxEntries: 1 });

    await cachedSearch('a');
    await cachedSearch('b');
    await cachedSearch('a');

    expect(search).toHaveBeenCalledTimes(3);
  });

  it('rejects immediately when the caller signal is already aborted', async () => {
    const search = jest.fn<SearchFn>();
    const cachedSearch = createCachedSearch(search);
    const controller = new AbortController();

    controller.abort();

    await expect(cachedSearch('spain', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(search).not.toHaveBeenCalled();
  });
});
