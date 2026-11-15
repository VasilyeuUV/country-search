/** @file Pure formatters for the country views. No DOM. */

import { LOCALE } from '../config/constants.js';
import type { Country, CountryCurrency } from '../domain/country.js';

/** Placeholder for values the API does not provide. */
const EMPTY_VALUE = '—';

/**
 * Formats a population with grouped thousands.
 *
 * @param population - Raw population.
 * @returns Localised number.
 */
export function formatPopulation(population: number): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(population);
}

/**
 * Formats an area in square kilometres.
 *
 * @param areaKm2 - Area or `null` when unknown.
 * @returns Formatted area or a dash.
 */
export function formatArea(areaKm2: number | null): string {
  return areaKm2 === null ? EMPTY_VALUE : `${formatPopulation(areaKm2)} km²`;
}

/**
 * @param languages - Language names.
 * @returns Comma separated list or a dash.
 */
export function formatLanguages(languages: readonly string[]): string {
  return languages.length === 0 ? EMPTY_VALUE : languages.join(', ');
}

/**
 * @param currencies - Currencies of the country.
 * @returns `Name (CODE, symbol)` items joined with a semicolon, or a dash.
 */
export function formatCurrencies(currencies: readonly CountryCurrency[]): string {
  if (currencies.length === 0) {
    return EMPTY_VALUE;
  }

  return currencies
    .map(({ code, name, symbol }) =>
      symbol === null ? `${name} (${code})` : `${name} (${code}, ${symbol})`,
    )
    .join('; ');
}

/**
 * @param borderCodes - Alpha-3 codes of the neighbours.
 * @returns Comma separated codes or a human sentence.
 */
export function formatBorders(borderCodes: readonly string[]): string {
  return borderCodes.length === 0 ? 'No land borders' : borderCodes.join(', ');
}

/**
 * Builds the one-sentence description shown in the details view.
 *
 * The API has no description field, so it is derived from the geography and
 * the names the country is known by.
 *
 * @param country - Country to describe.
 * @returns Human readable sentence.
 */
export function describeCountry(country: Country): string {
  const { geography, demonym, nativeName, name } = country;
  const place = geography.subregion ?? geography.region;
  const sentences = [`Country in ${place}, ${geography.region}.`];

  if (demonym !== null) {
    sentences.push(`Demonym: ${demonym}.`);
  }

  if (nativeName !== name) {
    sentences.push(`Also known as ${nativeName}.`);
  }

  return sentences.join(' ');
}
