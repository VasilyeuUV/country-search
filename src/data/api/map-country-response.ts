/** @file Adapter from the countries.dev wire format to the country domain model. */

import type { Country, CountryCurrency } from '../../domain/country.js';
import type { CountryRaw } from './countries-raw.js';

/**
 * Converts one API record into the domain model.
 *
 * @param raw - Country object exactly as returned by `GET /name/{query}`.
 * @returns Normalised country; nested objects and collections are fresh copies.
 */
export function mapCountryResponse(raw: CountryRaw): Country {
  const currencies: readonly CountryCurrency[] = (raw.currencies ?? []).map((currency) => ({
    code: currency.code,
    name: currency.name,
    symbol: currency.symbol ?? null,
  }));

  return {
    code: raw.alpha3Code,
    name: raw.name,
    nativeName: raw.nativeName,
    flag: { emoji: raw.flag, url: raw.flags.png },
    capital: raw.capital ?? null,
    geography: {
      region: raw.region,
      subregion: raw.subregion ?? null,
      areaKm2: raw.area ?? null,
      borderCodes: [...(raw.borders ?? [])],
    },
    population: raw.population,
    languages: raw.languages.map((language) => language.name),
    currencies,
    demonym: raw.demonym ?? null,
  };
}
