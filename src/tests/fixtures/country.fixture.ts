/** @file Domain-level country fixtures for UI tests. */

import type { Country } from '../../domain/country.js';

/** Spain: complete record. */
export const SPAIN_COUNTRY: Country = {
  code: 'ESP',
  name: 'Spain',
  nativeName: 'España',
  flag: { emoji: '🇪🇸', url: 'https://flagcdn.com/w320/es.png' },
  capital: 'Madrid',
  geography: {
    region: 'Europe',
    subregion: 'Southern Europe',
    areaKm2: 505992,
    borderCodes: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
  },
  population: 47351567,
  languages: ['Spanish'],
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
  demonym: 'Spanish',
};

/** Antarctica: no capital, no borders, no currencies, native name equals the name. */
export const ANTARCTICA_COUNTRY: Country = {
  code: 'ATA',
  name: 'Antarctica',
  nativeName: 'Antarctica',
  flag: { emoji: '🇦🇶', url: 'https://flagcdn.com/w320/aq.png' },
  capital: null,
  geography: {
    region: 'Polar',
    subregion: 'Antarctica',
    areaKm2: 14000000,
    borderCodes: [],
  },
  population: 1000,
  languages: ['English', 'Russian'],
  currencies: [],
  demonym: 'Antarctic',
};
