/** @file Tests for the debounce helper. */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { debounce } from '../../core/debounce.js';

const DELAY_MS = 250;

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not call the callback before the delay elapses', () => {
    const callback = jest.fn<(query: string) => void>();
    const debounced = debounce(callback, DELAY_MS);

    debounced('spain');
    jest.advanceTimersByTime(DELAY_MS - 1);

    expect(callback).not.toHaveBeenCalled();
  });

  it('calls the callback once the delay elapses', () => {
    const callback = jest.fn<(query: string) => void>();
    const debounced = debounce(callback, DELAY_MS);

    debounced('spain');
    jest.advanceTimersByTime(DELAY_MS);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('spain');
  });

  it('resets the timer on every call and keeps only the last arguments', () => {
    const callback = jest.fn<(query: string) => void>();
    const debounced = debounce(callback, DELAY_MS);

    debounced('s');
    jest.advanceTimersByTime(DELAY_MS - 10);
    debounced('sp');
    jest.advanceTimersByTime(DELAY_MS - 10);
    debounced('spain');
    jest.advanceTimersByTime(DELAY_MS);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('spain');
  });

  it('passes all arguments of the last call', () => {
    const callback = jest.fn<(query: string, page: number) => void>();
    const debounced = debounce(callback, DELAY_MS);

    debounced('spain', 2);
    jest.advanceTimersByTime(DELAY_MS);

    expect(callback).toHaveBeenCalledWith('spain', 2);
  });

  it('never calls the callback after cancel()', () => {
    const callback = jest.fn<(query: string) => void>();
    const debounced = debounce(callback, DELAY_MS);

    debounced('spain');
    debounced.cancel();
    jest.advanceTimersByTime(DELAY_MS * 3);

    expect(callback).not.toHaveBeenCalled();
  });

  it('schedules a new call after cancel()', () => {
    const callback = jest.fn<(query: string) => void>();
    const debounced = debounce(callback, DELAY_MS);

    debounced('spain');
    debounced.cancel();
    debounced('france');
    jest.advanceTimersByTime(DELAY_MS);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('france');
  });

  it('keeps timers of separate wrappers independent', () => {
    const first = jest.fn<(query: string) => void>();
    const second = jest.fn<(query: string) => void>();
    const debouncedFirst = debounce(first, DELAY_MS);
    const debouncedSecond = debounce(second, DELAY_MS * 2);

    debouncedFirst('a');
    debouncedSecond('b');

    jest.advanceTimersByTime(DELAY_MS);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();

    jest.advanceTimersByTime(DELAY_MS);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
