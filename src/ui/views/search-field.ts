/** @file Search field with a clear action. */

import { createElement } from '../dom.js';

/** Public parts of the search field. */
export interface SearchField {
  /** Container element to mount. */
  readonly element: HTMLElement;
  /** The input itself, for focus management. */
  readonly input: HTMLInputElement;
  /** Sets the value and syncs the clear button visibility. */
  setValue(value: string): void;
}

/** Options of the search field. */
export interface SearchFieldOptions {
  readonly onInput: (query: string) => void;
}

/**
 * Creates the search field.
 *
 * @param options - Input callback.
 * @returns Element and input reference.
 */
export function createSearchField(options: SearchFieldOptions): SearchField {
  const input = createElement('input', {
    className: 'search__input',
    attributes: {
      type: 'text',
      id: 'country-search',
      placeholder: 'Type a country name...',
      'aria-label': 'Search a country by name',
      autocomplete: 'off',
      autocapitalize: 'off',
      spellcheck: 'false',
    },
  });

  const clearButton = createElement('button', {
    className: 'search__clear',
    attributes: { type: 'button', title: 'Clear search', 'aria-label': 'Clear search' },
    children: [
      createElement('img', {
        className: 'search__icon',
        attributes: { src: './assets/icons/close.svg', alt: '', 'aria-hidden': 'true' },
      }),
    ],
  });

  clearButton.hidden = true;

  const element = createElement('div', {
    className: 'search',
    attributes: { role: 'search' },
    children: [
      createElement('span', { className: 'search__prefix', text: '>' }),
      input,
      clearButton,
    ],
  });

  input.addEventListener('input', () => {
    clearButton.hidden = input.value.length === 0;
    options.onInput(input.value);
  });

  clearButton.addEventListener('click', () => {
    input.value = '';
    clearButton.hidden = true;
    input.focus();
    options.onInput('');
  });

  const setValue = (value: string): void => {
    input.value = value;
    clearButton.hidden = value.length === 0;
  };

  return { element, input, setValue };
}
