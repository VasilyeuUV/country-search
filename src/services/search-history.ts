/** @file Persisted history of the recent searches. */

import { HISTORY_LIMIT, HISTORY_STORAGE_KEY } from '../config/constants.js';

/** Minimal storage contract, satisfied by `localStorage` and by test doubles. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** History of search queries. */
export interface SearchHistory {
  getAll(): readonly string[];
  add(query: string): void;
  clear(): void;
}

/**
 * Creates the persisted search history.
 *
 * @param storage - Storage to use, usually `window.localStorage`.
 * @param limit - Maximum number of stored queries.
 * @returns History bound to the given storage.
 */
export function createSearchHistory(
  storage: StorageLike,
  limit: number = HISTORY_LIMIT,
): SearchHistory {
  const read = (): readonly string[] => {
    const raw = storage.getItem(HISTORY_STORAGE_KEY);

    if (raw === null) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((item): item is string => typeof item === 'string').slice(0, limit);
    } catch {
      return [];
    }
  };

  const write = (queries: readonly string[]): void => {
    try {
      storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(queries));
    } catch {
      // quota and private mode failures are not fatal for the search
    }
  };

  return {
    getAll: read,
    add: (rawQuery) => {
      const query = rawQuery.trim();

      if (query === '') {
        return;
      }

      const rest = read().filter((item) => item.toLowerCase() !== query.toLowerCase());

      write([query, ...rest].slice(0, limit));
    },
    clear: () => {
      try {
        storage.removeItem(HISTORY_STORAGE_KEY);
      } catch {
        // ignore: nothing to clear in a broken storage
      }
    },
  };
}
