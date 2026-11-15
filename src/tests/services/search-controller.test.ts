/** @file Tests for the search controller. */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { HttpError } from '../../core/http-error.js';
import type { Country } from '../../domain/country.js';
import { createSearchController } from '../../services/search-controller.js';
import type { SearchFn } from '../../services/search-controller.js';

const DEBOUNCE_MS = 50;

const SPAIN: Country = {
  code: 'ESP',
  name: 'Spain',
  nativeName: 'España',
  flag: { emoji: '🇪🇸', url: 'https://flagcdn.com/w320/es.png' },
  capital: 'Madrid',
  geography: {
    region: 'Europe',
    subregion: 'Southern Europe',
    areaKm2: 505992,
    borderCodes: [],
  },
  population: 47351567,
  languages: ['Spanish'],
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
  demonym: 'Spanish',
};

interface Deferred<T> {
  readonly promise: Promise<T>;
  resolve(value: T): void;
  reject(reason: unknown): void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('createSearchController', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts in the idle state', () => {
    const controller = createSearchController({ search: jest.fn<SearchFn>() });

    expect(controller.getState()).toEqual({ status: 'idle', query: '' });
  });

  it('does not request anything for an empty query', async () => {
    const search = jest.fn<SearchFn>();
    const controller = createSearchController({ search, debounceMs: DEBOUNCE_MS });

    controller.setQuery('   ');
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(search).not.toHaveBeenCalled();
    expect(controller.getState()).toEqual({ status: 'idle', query: '' });
  });

  it('debounces the request and keeps the last query', async () => {
    const search = jest.fn<SearchFn>().mockResolvedValue([]);
    const controller = createSearchController({ search, debounceMs: DEBOUNCE_MS });

    controller.setQuery('s');
    controller.setQuery('sp');
    controller.setQuery('spain');

    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS - 1);
    expect(search).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(1);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('spain', expect.any(AbortSignal));
  });

  it('aborts the active request as soon as the input changes', async () => {
    const signals: AbortSignal[] = [];
    const first = createDeferred<readonly Country[]>();
    const search = jest.fn<SearchFn>((_query, signal) => {
      if (signal !== undefined) {
        signals.push(signal);
      }

      return first.promise;
    });
    const controller = createSearchController({ search, debounceMs: DEBOUNCE_MS });

    controller.setQuery('sp');
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS);

    controller.setQuery('spain');

    expect(signals[0]?.aborted).toBe(true);
  });

  it('does not show the own cancellation as an error', async () => {
    const first = createDeferred<readonly Country[]>();
    const search = jest.fn<SearchFn>().mockReturnValue(first.promise);
    const controller = createSearchController({ search, debounceMs: DEBOUNCE_MS });

    controller.setQuery('spain');
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(controller.getState()).toEqual({ status: 'loading', query: 'spain' });

    controller.setQuery('fran');
    first.reject(new DOMException('aborted', 'AbortError'));
    await jest.advanceTimersByTimeAsync(0);

    expect(controller.getState()).toEqual({ status: 'loading', query: 'fran' });
  });

  it('ignores a response of a request that was cancelled after it started', async () => {
    const first = createDeferred<readonly Country[]>();
    const search = jest.fn<SearchFn>().mockReturnValueOnce(first.promise).mockResolvedValueOnce([]);
    const controller = createSearchController({ search, debounceMs: DEBOUNCE_MS });

    controller.setQuery('sp');
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS);

    controller.setQuery('spain');
    first.resolve([SPAIN]);
    await jest.advanceTimersByTimeAsync(0);

    expect(controller.getState()).toEqual({ status: 'loading', query: 'spain' });
  });

  it('publishes matching countries', async () => {
    const search = jest.fn<SearchFn>().mockResolvedValue([SPAIN]);
    const controller = createSearchController({ search, debounceMs: DEBOUNCE_MS });

    controller.setQuery('spain');
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(controller.getState()).toEqual({
      status: 'results',
      query: 'spain',
      countries: [SPAIN],
    });
  });

  it('publishes not-found for an empty result', async () => {
    const search = jest.fn<SearchFn>().mockResolvedValue([]);
    const controller = createSearchController({ search, debounceMs: DEBOUNCE_MS });

    controller.setQuery('zzzzzz');
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(controller.getState()).toEqual({ status: 'not-found', query: 'zzzzzz' });
  });

  it('publishes the kind of a real failure', async () => {
    const search = jest.fn<SearchFn>().mockRejectedValue(new HttpError(500));
    const controller = createSearchController({ search, debounceMs: DEBOUNCE_MS });

    controller.setQuery('spain');
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(controller.getState()).toEqual({ status: 'error', query: 'spain', kind: 'http' });
  });

  it('retries the last query immediately, without the debounce delay', async () => {
    const search = jest
      .fn<SearchFn>()
      .mockRejectedValueOnce(new HttpError(500))
      .mockResolvedValueOnce([SPAIN]);
    const controller = createSearchController({ search, debounceMs: DEBOUNCE_MS });

    controller.setQuery('spain');
    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(controller.getState()).toEqual({ status: 'error', query: 'spain', kind: 'http' });

    controller.retry();
    await jest.advanceTimersByTimeAsync(0);

    expect(search).toHaveBeenCalledTimes(2);
    expect(search).toHaveBeenLastCalledWith('spain', expect.any(AbortSignal));
    expect(controller.getState()).toEqual({
      status: 'results',
      query: 'spain',
      countries: [SPAIN],
    });
  });

  it('notifies subscribers and stops after unsubscribe', async () => {
    const search = jest.fn<SearchFn>().mockResolvedValue([]);
    const controller = createSearchController({ search, debounceMs: DEBOUNCE_MS });
    const listener = jest.fn();
    const unsubscribe = controller.subscribe(listener);

    controller.setQuery('spain');

    expect(listener).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    controller.setQuery('');

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
