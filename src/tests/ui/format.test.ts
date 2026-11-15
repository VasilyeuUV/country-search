/** @file Tests for the pure UI formatters. */

import { describe, expect, it } from '@jest/globals';

import {
  describeCountry,
  formatArea,
  formatBorders,
  formatCurrencies,
  formatLanguages,
  formatPopulation,
} from '../../ui/format.js';
import { ANTARCTICA_COUNTRY, SPAIN_COUNTRY } from '../fixtures/country.fixture.js';

describe('formatPopulation', () => {
  it('groups thousands with the en-US locale', () => {
    expect(formatPopulation(47351567)).toBe('47,351,567');
  });

  it('keeps small numbers as they are', () => {
    expect(formatPopulation(300)).toBe('300');
  });
});

describe('formatArea', () => {
  it('adds the unit and groups thousands', () => {
    expect(formatArea(505992)).toBe('505,992 km²');
  });

  it('returns a dash when the area is unknown', () => {
    expect(formatArea(null)).toBe('—');
  });
});

describe('formatLanguages', () => {
  it('joins languages with a comma', () => {
    expect(formatLanguages(['Swahili', 'English'])).toBe('Swahili, English');
  });

  it('returns a dash for an empty list', () => {
    expect(formatLanguages([])).toBe('—');
  });
});

describe('formatCurrencies', () => {
  it('formats a single currency', () => {
    expect(formatCurrencies([{ code: 'EUR', name: 'Euro', symbol: '€' }])).toBe('Euro (EUR, €)');
  });

  it('omits a missing symbol', () => {
    expect(formatCurrencies([{ code: 'GBP', name: 'British pound', symbol: null }])).toBe(
      'British pound (GBP)',
    );
  });

  it('joins several currencies', () => {
    expect(
      formatCurrencies([
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'XOF', name: 'West African CFA franc', symbol: 'Fr' },
      ]),
    ).toBe('Euro (EUR, €); West African CFA franc (XOF, Fr)');
  });

  it('returns a dash for an empty list', () => {
    expect(formatCurrencies([])).toBe('—');
  });
});

describe('formatBorders', () => {
  it('joins the neighbour codes', () => {
    expect(formatBorders(['AND', 'FRA', 'GIB', 'PRT', 'MAR'])).toBe('AND, FRA, GIB, PRT, MAR');
  });

  it('explains the absence of land borders', () => {
    expect(formatBorders([])).toBe('No land borders');
  });
});

describe('describeCountry', () => {
  it('builds a sentence from the geography and the names', () => {
    expect(describeCountry(SPAIN_COUNTRY)).toBe(
      'Country in Southern Europe, Europe. Demonym: Spanish. Also known as España.',
    );
  });

  it('does not repeat the native name when it matches', () => {
    expect(describeCountry(ANTARCTICA_COUNTRY)).toBe(
      'Country in Antarctica, Polar. Demonym: Antarctic.',
    );
  });
});
