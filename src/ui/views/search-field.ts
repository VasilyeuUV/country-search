/** @file Search field with a clear action. */

import { createElement, createSvgElement } from '../dom.js';

/** Public parts of the search field. */
export interface SearchField {
  readonly element: HTMLElement;
  readonly input: HTMLInputElement;
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
    children: [createClearIcon()],
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

  return { element, input };
}

function createClearIcon(): SVGSVGElement {
  const icon = createSvgElement('svg', {
    class: 'search__icon',
    viewBox: '0 0 16 16',
    'aria-hidden': 'true',
    focusable: 'false',
  });

  icon.append(createSvgElement('path', { d: 'M3 3 13 13M13 3 3 13' }));

  return icon;
}
