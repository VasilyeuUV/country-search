/** @file Tests for the persisted search history. */

import { describe, expect, it, jest } from '@jest/globals';

import { HISTORY_STORAGE_KEY } from '../../config/constants.js';
import { createSearchHistory } from '../../services/search-history.js';
import type { StorageLike } from '../../services/search-history.js';

function createMemoryStorage(): StorageLike {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

describe('createSearchHistory', () => {
  it('starts empty', () => {
    const history = createSearchHistory(createMemoryStorage());

    expect(history.getAll()).toEqual([]);
  });

  it('keeps the newest query first', () => {
    const history = createSearchHistory(createMemoryStorage());

    history.add('spain');
    history.add('france');

    expect(history.getAll()).toEqual(['france', 'spain']);
  });

  it('moves a repeated query to the top', () => {
    const history = createSearchHistory(createMemoryStorage());

    history.add('spain');
    history.add('france');
    history.add('Spain');

    expect(history.getAll()).toEqual(['Spain', 'france']);
  });

  it('ignores blank queries', () => {
    const history = createSearchHistory(createMemoryStorage());

    history.add('   ');

    expect(history.getAll()).toEqual([]);
  });

  it('trims the list to the limit', () => {
    const history = createSearchHistory(createMemoryStorage(), 2);

    history.add('a');
    history.add('b');
    history.add('c');

    expect(history.getAll()).toEqual(['c', 'b']);
  });

  it('survives broken stored data', () => {
    const storage = createMemoryStorage();
    storage.setItem(HISTORY_STORAGE_KEY, 'not json');

    expect(createSearchHistory(storage).getAll()).toEqual([]);
  });

  it('drops non-string entries from the storage', () => {
    const storage = createMemoryStorage();
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(['spain', 42, null, 'france']));

    expect(createSearchHistory(storage).getAll()).toEqual(['spain', 'france']);
  });

  it('clears the stored queries', () => {
    const history = createSearchHistory(createMemoryStorage());

    history.add('spain');
    history.clear();

    expect(history.getAll()).toEqual([]);
  });

  it('does not throw when the storage rejects the write', () => {
    const storage = createMemoryStorage();
    const brokenStorage: StorageLike = {
      ...storage,
      setItem: jest.fn(() => {
        throw new Error('QuotaExceededError');
      }),
    };
    const history = createSearchHistory(brokenStorage);

    expect(() => {
      history.add('spain');
    }).not.toThrow();
  });
});
