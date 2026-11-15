/** @file Classification of search failures for the controller and the UI. */

import { HttpError } from './http-error.js';
import { InvalidResponseError } from './invalid-response-error.js';

/** Kinds of failure the search flow distinguishes. */
export const SEARCH_ERROR_KIND = {
  aborted: 'aborted',
  timeout: 'timeout',
  http: 'http',
  invalid: 'invalid',
  network: 'network',
} as const;

/** Union of all failure kinds. */
export type SearchErrorKind = (typeof SEARCH_ERROR_KIND)[keyof typeof SEARCH_ERROR_KIND];

/**
 * Classifies a rejected search.
 *
 * @param error - Anything thrown by `searchCountries`.
 * @returns Failure kind, `network` for unrecognised errors.
 */
export function classifySearchError(error: unknown): SearchErrorKind {
  if (error instanceof HttpError) {
    return SEARCH_ERROR_KIND.http;
  }

  if (error instanceof InvalidResponseError) {
    return SEARCH_ERROR_KIND.invalid;
  }

  switch (readErrorName(error)) {
    case 'AbortError':
      return SEARCH_ERROR_KIND.aborted;
    case 'TimeoutError':
      return SEARCH_ERROR_KIND.timeout;
    default:
      return SEARCH_ERROR_KIND.network;
  }
}

function readErrorName(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'name' in error) {
    return String(error.name);
  }

  return '';
}
