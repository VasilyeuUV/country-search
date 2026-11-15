/** @file Tests for the search error classification. */

import { describe, expect, it } from '@jest/globals';

import { HttpError } from '../../core/http-error.js';
import { InvalidResponseError } from '../../core/invalid-response-error.js';
import { classifySearchError, SEARCH_ERROR_KIND } from '../../core/search-errors.js';

describe('classifySearchError', () => {
  it('treats the caller cancellation as aborted', () => {
    expect(classifySearchError(new DOMException('aborted', 'AbortError'))).toBe(
      SEARCH_ERROR_KIND.aborted,
    );
  });

  it('gives a timeout its own kind', () => {
    expect(classifySearchError(new DOMException('timed out', 'TimeoutError'))).toBe(
      SEARCH_ERROR_KIND.timeout,
    );
  });

  it('recognises an http failure', () => {
    expect(classifySearchError(new HttpError(500))).toBe(SEARCH_ERROR_KIND.http);
  });

  it('recognises a broken payload', () => {
    expect(classifySearchError(new InvalidResponseError())).toBe(SEARCH_ERROR_KIND.invalid);
  });

  it('treats a network failure as network', () => {
    expect(classifySearchError(new TypeError('Failed to fetch'))).toBe(SEARCH_ERROR_KIND.network);
  });

  it('falls back to network for unrecognised values', () => {
    expect(classifySearchError('boom')).toBe(SEARCH_ERROR_KIND.network);
    expect(classifySearchError(undefined)).toBe(SEARCH_ERROR_KIND.network);
    expect(classifySearchError({ name: 'Weird' })).toBe(SEARCH_ERROR_KIND.network);
  });

  it('never mixes aborted with timeout', () => {
    const aborted = classifySearchError(new DOMException('x', 'AbortError'));
    const timeout = classifySearchError(new DOMException('y', 'TimeoutError'));

    expect(aborted).not.toBe(timeout);
  });
});
