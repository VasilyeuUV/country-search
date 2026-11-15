/** @file HTTP transport of the countries API. The only module that calls fetch. */

import {
  API_BASE_URL,
  API_NAME_PATH,
  HTTP_STATUS_NOT_FOUND,
  REQUEST_TIMEOUT_MS,
} from '../../config/constants.js';
import { HttpError } from '../../core/http-error.js';
import type { Country } from '../../domain/country.js';
import { mapCountryResponse } from './map-country-response.js';
import { parseCountryRawList } from './parse-country-raw-list.js';

/**
 * Searches countries by a partial name.
 *
 * @param query - Raw user input, encoded into the URL as is.
 * @param signal - Cancellation signal of the caller (new input, cleared field).
 * @param timeoutMs - Request timeout, overridable for tests.
 * @returns Matching countries mapped to the domain model, or an empty list.
 * @throws {HttpError} When the status is neither 200 nor 404.
 * @throws {InvalidResponseError} When the payload is not a country list.
 * @throws {DOMException} `AbortError` on cancellation, `TimeoutError` on timeout.
 */
export async function searchCountries(
  query: string,
  signal?: AbortSignal,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<readonly Country[]> {
  const url = `${API_BASE_URL}${API_NAME_PATH}${encodeURIComponent(query)}`;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const requestSignal =
    signal === undefined ? timeoutSignal : AbortSignal.any([signal, timeoutSignal]);

  const response = await fetch(url, { signal: requestSignal });

  if (response.status === HTTP_STATUS_NOT_FOUND) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  const payload: unknown = await response.json();

  return parseCountryRawList(payload).map(mapCountryResponse);
}
