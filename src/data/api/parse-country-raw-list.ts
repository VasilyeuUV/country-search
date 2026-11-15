/** @file Runtime guard for the countries.dev payload. */

import { InvalidResponseError } from '../../core/invalid-response-error.js';
import type { CountryRaw } from './countries-raw.js';

/**
 * Checks that a value can be used as a country record.
 *
 * @param value - Parsed JSON value of unknown shape.
 * @returns `true` when the value is safe to map.
 */
export function isCountryRaw(value: unknown): value is CountryRaw {
  if (!isRecord(value)) {
    return false;
  }

  const { flags, languages } = value;

  return (
    typeof value.name === 'string' &&
    typeof value.nativeName === 'string' &&
    typeof value.flag === 'string' &&
    typeof value.region === 'string' &&
    typeof value.population === 'number' &&
    typeof value.alpha3Code === 'string' &&
    isRecord(flags) &&
    typeof flags.png === 'string' &&
    Array.isArray(languages)
  );
}

/**
 * Validates a parsed payload and narrows it to the raw country list.
 *
 * @param value - Parsed JSON value of unknown shape.
 * @returns The same list, narrowed to `CountryRaw`.
 * @throws {InvalidResponseError} When the payload is not a country list.
 */
export function parseCountryRawList(value: unknown): readonly CountryRaw[] {
  if (!Array.isArray(value)) {
    throw new InvalidResponseError();
  }
  const items: unknown[] = value;
  const countries = items.filter(isCountryRaw);

  if (countries.length !== items.length) {
    throw new InvalidResponseError();
  }

  return countries;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
