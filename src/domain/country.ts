/** @file Country domain model */

/**
 * Country identifier (ISO 3166-1 alpha-3 code: `ESP`, `DEU`).
 */
export type CountryCode = string;

/**
 * Currency attached to a country
 */
export interface CountryCurrency {
  readonly code: string;
  readonly name: string;
  readonly symbol: string | null;
}

/**
 * Flag of a country: emoji for lists, image URL for the details view.
 */
export interface CountryFlag {
  readonly emoji: string;
  readonly url: string;
}

/**
 * Information about the country's territory.
 */
export interface CountryGeography {
  readonly region: string;
  readonly subregion: string | null;
  /** Area in square kilometres. */
  readonly areaKm2: number | null;
  /** Alpha-3 codes of the neighbouring countries. */
  readonly borderCodes: readonly CountryCode[];
}

/**
 * Country model.
 */
export interface Country {
  readonly code: CountryCode;
  readonly name: string;
  readonly nativeName: string;
  readonly flag: CountryFlag;
  readonly capital: string | null;
  readonly geography: CountryGeography;
  readonly population: number;
  readonly languages: readonly string[];
  readonly currencies: readonly CountryCurrency[];
  readonly demonym: string | null;
}
