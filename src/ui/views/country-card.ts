/** @file Country card: full-bleed flag with the required fields on top. */

import type { Country } from '../../domain/country.js';
import { createElement } from '../dom.js';
import { formatPopulation } from '../format.js';

/** Options of a card. */
export interface CountryCardOptions {
  readonly country: Country;
  readonly onSelect: (country: Country) => void;
}

/**
 * Creates a country card.
 *
 * @param options - Country and selection callback.
 * @returns Button element representing the country.
 */
export function createCountryCard(options: CountryCardOptions): HTMLButtonElement {
  const { country, onSelect } = options;

  const media = createElement('img', {
    className: 'country-card__media',
    attributes: {
      src: country.flag.url,
      alt: `Flag of ${country.name}`,
      loading: 'lazy',
      decoding: 'async',
    },
  });

  const card = createElement('button', {
    className: 'country-card',
    attributes: { type: 'button', 'aria-haspopup': 'dialog' },
    children: [
      media,
      createElement('span', {
        className: 'country-card__fallback',
        text: country.flag.emoji,
        attributes: { 'aria-hidden': 'true' },
      }),
      createElement('span', {
        className: 'country-card__scrim',
        attributes: { 'aria-hidden': 'true' },
      }),
      createElement('span', {
        className: 'country-card__body',
        children: [
          createElement('span', { className: 'country-card__name', text: country.name }),
          createField('Capital', country.capital ?? '—'),
          createField('Region', country.geography.region),
          createField('Population', formatPopulation(country.population)),
        ],
      }),
    ],
  });

  media.addEventListener('error', () => {
    card.classList.add('country-card--image-failed');
  });

  card.addEventListener('click', () => {
    onSelect(country);
  });

  return card;
}

function createField(label: string, value: string): HTMLSpanElement {
  return createElement('span', {
    className: 'country-card__meta',
    children: [createElement('b', { text: `${label}: ` }), createElement('span', { text: value })],
  });
}
