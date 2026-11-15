/** @file Raw country shape of the countries.dev API: a faithful wire-format mirror. */

/**
 * Language entry as returned by the API.
 */
export interface CountryRawLanguage {
  readonly name: string;
  readonly iso639_1?: string;
  readonly iso639_2?: string;
  readonly nativeName?: string;
}

/**
 * Currency entry as returned by the API.
 */
export interface CountryRawCurrency {
  readonly code: string;
  readonly name: string;
  readonly symbol?: string;
}

/**
 * Flag image URLs.
 */
export interface CountryRawFlags {
  readonly png: string;
  readonly svg: string;
}

/**
 * Country object of `GET /name/{query}`
 */
export interface CountryRaw {
  readonly name: string;
  readonly nativeName: string;
  /** Flag emoji. */
  readonly flag: string;
  readonly flags: CountryRawFlags;
  readonly region: string;
  readonly subregion?: string;
  readonly capital?: string;
  readonly population: number;
  readonly area?: number;
  readonly borders?: readonly string[];
  readonly languages: readonly CountryRawLanguage[];
  readonly currencies?: readonly CountryRawCurrency[];
  readonly demonym?: string;
  readonly alpha2Code: string;
  readonly alpha3Code: string;
  readonly latlng?: readonly [number, number];
  readonly timezones: readonly string[];
  readonly independent: boolean;
  readonly populationDensity?: number;
  readonly cioc?: string;
  readonly gini?: number;
  readonly numericCode: string;
  readonly callingCodes: readonly string[];
  readonly topLevelDomain: readonly string[];
}
