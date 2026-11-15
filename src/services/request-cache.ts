/** @file Result cache with in-flight de-duplication for search queries. */

import { CACHE_MAX_ENTRIES } from '../config/constants.js';
import type { Country } from '../domain/country.js';
import type { SearchFn } from './search-controller.js';

/** Options of the cache. */
export interface RequestCacheOptions {
  readonly maxEntries?: number;
}

/** A query that is being fetched right now. */
interface InFlightRequest {
  readonly controller: AbortController;
  readonly promise: Promise<readonly Country[]>;
  subscribers: number;
}

/**
 * Wraps a search function with a result cache and in-flight de-duplication.
 *
 * @param search - Transport to wrap, usually `searchCountries`.
 * @param options - Cache size limit.
 * @returns Search function with the same contract.
 */
export function createCachedSearch(search: SearchFn, options: RequestCacheOptions = {}): SearchFn {
  const maxEntries = options.maxEntries ?? CACHE_MAX_ENTRIES;
  const cache = new Map<string, readonly Country[]>();
  const inFlight = new Map<string, InFlightRequest>();

  const store = (key: string, countries: readonly Country[]): void => {
    cache.delete(key);
    cache.set(key, countries);

    while (cache.size > maxEntries) {
      const oldest = cache.keys().next();

      if (oldest.done === true) {
        break;
      }

      cache.delete(oldest.value);
    }
  };

  const start = (key: string, query: string): InFlightRequest => {
    const controller = new AbortController();
    const request: InFlightRequest = {
      controller,
      promise: search(query, controller.signal),
      subscribers: 0,
    };

    inFlight.set(key, request);

    request.promise
      .then(
        (countries) => {
          store(key, countries);
        },
        () => {},
      )
      .finally(() => {
        if (inFlight.get(key) === request) {
          inFlight.delete(key);
        }
      });

    return request;
  };

  const wait = (
    request: InFlightRequest,
    key: string,
    signal: AbortSignal | undefined,
  ): Promise<readonly Country[]> => {
    request.subscribers += 1;

    let settled = false;

    const release = (): boolean => {
      if (settled) {
        return false;
      }

      settled = true;
      request.subscribers -= 1;

      if (request.subscribers === 0) {
        request.controller.abort();

        if (inFlight.get(key) === request) {
          inFlight.delete(key);
        }
      }

      return true;
    };

    return new Promise<readonly Country[]>((resolve, reject) => {
      const onAbort = (): void => {
        if (release()) {
          reject(signal?.reason);
        }
      };

      request.promise.then(
        (countries) => {
          if (release()) {
            signal?.removeEventListener('abort', onAbort);
            resolve(countries);
          }
        },
        (error: unknown) => {
          if (release()) {
            signal?.removeEventListener('abort', onAbort);
            reject(error);
          }
        },
      );

      if (signal === undefined) {
        return;
      }

      if (signal.aborted) {
        onAbort();
        return;
      }

      signal.addEventListener('abort', onAbort, { once: true });
    });
  };

  return async (query, signal) => {
    if (signal?.aborted === true) {
      throw signal.reason;
    }

    const key = query.trim().toLowerCase();
    const cached = cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    return wait(inFlight.get(key) ?? start(key, query), key, signal);
  };
}
