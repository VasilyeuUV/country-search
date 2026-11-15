/** @file Grid of country cards. */

import type { Country } from '../../domain/country.js';
import { createElement } from '../dom.js';
import { createCountryCard } from './country-card.js';

/**
 * Creates the results grid.
 *
 * @param countries - Countries to render, in the order they came.
 * @param onSelect - Called with the clicked country.
 * @returns List element with one card per country.
 */
export function createCountryGrid(
  countries: readonly Country[],
  onSelect: (country: Country) => void,
): HTMLUListElement {
  const items = countries.map((country) =>
    createElement('li', {
      className: 'country-grid__item',
      children: [createCountryCard({ country, onSelect })],
    }),
  );

  return createElement('ul', { className: 'country-grid', children: items });
}
