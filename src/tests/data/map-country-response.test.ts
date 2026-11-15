/** @file Tests for the raw -> domain country mapping. */

import { describe, expect, it } from '@jest/globals';

import { mapCountryResponse } from '../../data/api/map-country-response.js';
import {
  ANTARCTICA_RAW,
  GERMANY_RAW,
  SPAIN_RAW,
  TANZANIA_RAW,
  US_MINOR_OUTLYING_ISLANDS_RAW,
} from '../../data/fixtures/countries-raw.fixture.js';

describe('mapCountryResponse', () => {
  it('maps identity fields', () => {
    const country = mapCountryResponse(SPAIN_RAW);

    expect(country.code).toBe('ESP');
    expect(country.name).toBe('Spain');
    expect(country.nativeName).toBe('España');
  });

  it('maps the flag into a single object', () => {
    expect(mapCountryResponse(SPAIN_RAW).flag).toEqual({
      emoji: '🇪🇸',
      url: 'https://flagcdn.com/w320/es.png',
    });
  });

  it('maps the fields shown on a card', () => {
    const country = mapCountryResponse(SPAIN_RAW);

    expect(country.capital).toBe('Madrid');
    expect(country.geography.region).toBe('Europe');
    expect(country.population).toBe(47351567);
  });

  it('maps languages to plain names', () => {
    expect(mapCountryResponse(TANZANIA_RAW).languages).toEqual(['Swahili', 'English']);
  });

  it('maps currencies to domain objects', () => {
    expect(mapCountryResponse(SPAIN_RAW).currencies).toEqual([
      { code: 'EUR', name: 'Euro', symbol: '€' },
    ]);
  });

  it('maps the geography shown in the details view', () => {
    const { geography, demonym } = mapCountryResponse(GERMANY_RAW);

    expect(geography.subregion).toBe('Central Europe');
    expect(geography.areaKm2).toBe(357114);
    expect(geography.borderCodes).toEqual([
      'AUT',
      'BEL',
      'CZE',
      'DNK',
      'FRA',
      'LUX',
      'NLD',
      'POL',
      'CHE',
    ]);
    expect(demonym).toBe('German');
  });

  it('normalises a missing scalar to null', () => {
    expect(mapCountryResponse(ANTARCTICA_RAW).capital).toBeNull();
  });

  it('normalises missing collections to empty arrays', () => {
    const { geography, currencies } = mapCountryResponse(ANTARCTICA_RAW);

    expect(geography.borderCodes).toEqual([]);
    expect(currencies).toEqual([]);
  });

  it('keeps a missing area as null', () => {
    expect(mapCountryResponse(US_MINOR_OUTLYING_ISLANDS_RAW).geography.areaKm2).toBeNull();
  });

  it('does not mutate the input and returns fresh nested objects', () => {
    const snapshot = structuredClone(SPAIN_RAW);

    const first = mapCountryResponse(SPAIN_RAW);
    const second = mapCountryResponse(SPAIN_RAW);

    expect(SPAIN_RAW).toEqual(snapshot);
    expect(first).not.toBe(second);
    expect(first.flag).not.toBe(second.flag);
    expect(first.geography).not.toBe(second.geography);
    expect(first.geography.borderCodes).not.toBe(second.geography.borderCodes);
    expect(first.languages).not.toBe(second.languages);
  });
});
