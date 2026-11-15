/** @file Modal details of a country, styled as a PIP-BOY screen. */

import type { Country } from '../../domain/country.js';
import { createElement } from '../dom.js';
import {
  describeCountry,
  formatArea,
  formatBorders,
  formatCurrencies,
  formatLanguages,
  formatPopulation,
} from '../format.js';

const TITLE_ID = 'details-title';

/** Sections of the details screen. */
export const DETAILS_TAB = {
  all: 'all',
  geography: 'geography',
  capital: 'capital',
  currency: 'currency',
  population: 'population',
  languages: 'languages',
} as const;

/** Identifier of a details section. */
export type DetailsTab = (typeof DETAILS_TAB)[keyof typeof DETAILS_TAB];

const TABS: readonly (readonly [DetailsTab, string])[] = [
  [DETAILS_TAB.all, 'All'],
  [DETAILS_TAB.geography, 'Geography'],
  [DETAILS_TAB.capital, 'Capital'],
  [DETAILS_TAB.currency, 'Currency'],
  [DETAILS_TAB.population, 'Population'],
  [DETAILS_TAB.languages, 'Languages'],
];

/** Details dialog with imperative controls. */
export interface DetailsDialog {
  readonly element: HTMLDialogElement;
  open(country: Country): void;
}

/**
 * Creates the details dialog.
 *
 * @returns Dialog controller.
 */
export function createDetailsDialog(): DetailsDialog {
  const flag = createElement('div', { className: 'details__flag' });
  const title = createElement('h2', {
    className: 'details__title',
    attributes: { id: TITLE_ID },
  });
  const nativeName = createElement('p', { className: 'details__native' });
  const description = createElement('p', { className: 'details__description' });
  const body = createElement('div', {
    className: 'details__body',
    attributes: { role: 'tabpanel', 'aria-labelledby': TITLE_ID },
  });

  const closeButton = createElement('button', {
    className: 'details__close',
    attributes: { type: 'button', title: 'Close', 'aria-label': 'Close details' },
    text: '✕',
  });

  const tabsBar = createElement('div', {
    className: 'details__tabs',
    attributes: { role: 'tablist', 'aria-label': 'Details sections' },
  });

  let country: Country | null = null;
  let activeTab: DetailsTab = DETAILS_TAB.all;

  const selectTab = (tab: DetailsTab): void => {
    activeTab = tab;

    for (const button of tabsBar.children) {
      const isActive = button.getAttribute('data-tab') === tab;
      button.setAttribute('aria-selected', String(isActive));
    }

    if (country !== null) {
      body.replaceChildren(createValueList(country, activeTab));
    }
  };

  for (const [tab, label] of TABS) {
    const button = createElement('button', {
      className: 'details__tab',
      attributes: { type: 'button', role: 'tab', 'data-tab': tab, 'aria-selected': 'false' },
      text: label,
    });

    button.addEventListener('click', () => {
      selectTab(tab);
    });

    tabsBar.append(button);
  }

  const screen = createElement('div', {
    className: 'details__screen',
    children: [
      createElement('div', {
        className: 'details__head',
        children: [
          flag,
          createElement('div', { className: 'details__names', children: [title, nativeName] }),
          closeButton,
        ],
      }),
      description,
      body,
      tabsBar,
    ],
  });

  const dialog = createElement('dialog', {
    className: 'details',
    attributes: { 'aria-labelledby': TITLE_ID },
    children: [screen],
  });

  closeButton.addEventListener('click', () => {
    dialog.close();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  return {
    element: dialog,
    open: (next) => {
      country = next;
      fillFlag(flag, next);
      title.textContent = next.name;
      nativeName.textContent = next.nativeName;
      description.textContent = describeCountry(next);
      selectTab(DETAILS_TAB.all);

      if (!dialog.open) {
        dialog.showModal();
      }
    },
  };
}

function createValueList(forCountry: Country, tab: DetailsTab): HTMLDListElement {
  const list = createElement('dl', { className: 'details__list' });

  for (const [label, value] of rowsFor(forCountry, tab)) {
    list.append(
      createElement('dt', { className: 'details__term', text: label }),
      createElement('dd', { className: 'details__value', text: value }),
    );
  }

  return list;
}

function rowsFor(forCountry: Country, tab: DetailsTab): readonly (readonly [string, string])[] {
  const { geography } = forCountry;
  const capital: readonly (readonly [string, string])[] = [['Capital', forCountry.capital ?? '—']];
  const geoRows: readonly (readonly [string, string])[] = [
    ['Region', geography.region],
    ['Subregion', geography.subregion ?? '—'],
    ['Area', formatArea(geography.areaKm2)],
    ['Borders', formatBorders(geography.borderCodes)],
  ];
  const currencyRows: readonly (readonly [string, string])[] = [
    ['Currencies', formatCurrencies(forCountry.currencies)],
  ];
  const populationRows: readonly (readonly [string, string])[] = [
    ['Population', formatPopulation(forCountry.population)],
  ];
  const languageRows: readonly (readonly [string, string])[] = [
    ['Languages', formatLanguages(forCountry.languages)],
  ];

  switch (tab) {
    case DETAILS_TAB.geography:
      return geoRows;
    case DETAILS_TAB.capital:
      return capital;
    case DETAILS_TAB.currency:
      return currencyRows;
    case DETAILS_TAB.population:
      return populationRows;
    case DETAILS_TAB.languages:
      return languageRows;
    default:
      return [...capital, ...geoRows, ...populationRows, ...languageRows, ...currencyRows];
  }
}

function fillFlag(container: HTMLDivElement, forCountry: Country): void {
  const image = createElement('img', {
    className: 'details__flag-image',
    attributes: {
      src: forCountry.flag.url,
      alt: `Flag of ${forCountry.name}`,
      loading: 'lazy',
      decoding: 'async',
    },
  });

  const fallback = createElement('span', {
    className: 'details__flag-fallback',
    text: forCountry.flag.emoji,
    attributes: { 'aria-hidden': 'true' },
  });

  image.addEventListener('error', () => {
    container.classList.add('details__flag--image-failed');
  });

  container.classList.remove('details__flag--image-failed');
  container.replaceChildren(image, fallback);
}
