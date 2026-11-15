/** @file Search orchestration: debounce, cancellation and state. No DOM. */

import { DEBOUNCE_MS } from '../config/constants.js';
import { debounce } from '../core/debounce.js';
import { SEARCH_ERROR_KIND, classifySearchError } from '../core/search-errors.js';
import { searchCountries } from '../data/api/search-countries.js';
import type { Country } from '../domain/country.js';
import { SEARCH_STATUS } from '../domain/search-state.js';
import type { SearchState } from '../domain/search-state.js';

/** Search transport signature, injectable for tests. */
export type SearchFn = (query: string, signal?: AbortSignal) => Promise<readonly Country[]>;

/** Options of the controller. */
export interface SearchControllerOptions {
  /** Transport to use; defaults to the real API. */
  readonly search?: SearchFn;
  /** Debounce delay, defaults to `DEBOUNCE_MS`. */
  readonly debounceMs?: number;
}

/** Public API of the search controller. */
export interface SearchController {
  /** Applies user input: cancels the active request and schedules a new one. */
  setQuery(query: string): void;
  /** Repeats the last failed query immediately. */
  retry(): void;
  /** Current state. */
  getState(): SearchState;
  /** Subscribes to state changes; returns an unsubscribe function. */
  subscribe(listener: (state: SearchState) => void): () => void;
  /** Runs the query immediately, without the debounce delay. */
  submit(query: string): void;
}

/**
 * Creates the search controller.
 *
 * @param options - Transport and debounce delay, both overridable for tests.
 * @returns Controller instance.
 */
export function createSearchController(options: SearchControllerOptions = {}): SearchController {
  const search = options.search ?? searchCountries;
  const debounceMs = options.debounceMs ?? DEBOUNCE_MS;

  const listeners = new Set<(state: SearchState) => void>();
  let state: SearchState = { status: SEARCH_STATUS.idle, query: '' };
  let activeController: AbortController | null = null;
  let lastQuery = '';

  const emit = (next: SearchState): void => {
    state = next;

    for (const listener of listeners) {
      listener(state);
    }
  };

  const abortActive = (): void => {
    if (activeController !== null) {
      activeController.abort();
      activeController = null;
    }
  };

  const run = async (query: string): Promise<void> => {
    abortActive();

    const controller = new AbortController();
    activeController = controller;

    emit({ status: SEARCH_STATUS.loading, query });

    try {
      const countries = await search(query, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      emit(
        countries.length === 0
          ? { status: SEARCH_STATUS.notFound, query }
          : { status: SEARCH_STATUS.results, query, countries },
      );
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      const kind = classifySearchError(error);

      if (kind === SEARCH_ERROR_KIND.aborted) {
        return;
      }

      emit({ status: SEARCH_STATUS.error, query, kind });
    } finally {
      if (activeController === controller) {
        activeController = null;
      }
    }
  };

  const debouncedRun = debounce((query: string) => {
    void run(query);
  }, debounceMs);

  const submit = (rawQuery: string): void => {
    const query = rawQuery.trim();
    lastQuery = query;

    abortActive();
    debouncedRun.cancel();

    if (query === '') {
      emit({ status: SEARCH_STATUS.idle, query: '' });
      return;
    }

    void run(query);
  };

  const setQuery = (rawQuery: string): void => {
    const query = rawQuery.trim();
    lastQuery = query;

    abortActive();
    debouncedRun.cancel();

    if (query === '') {
      emit({ status: SEARCH_STATUS.idle, query: '' });
      return;
    }

    if (state.status === SEARCH_STATUS.loading) {
      emit({ status: SEARCH_STATUS.loading, query });
    }

    debouncedRun(query);
  };

  const retry = (): void => {
    const { status } = state;

    if (status !== SEARCH_STATUS.error && status !== SEARCH_STATUS.notFound) {
      return;
    }

    const query = lastQuery === '' ? state.query : lastQuery;

    debouncedRun.cancel();
    void run(query);
  };

  return {
    setQuery,
    submit,
    retry,
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
