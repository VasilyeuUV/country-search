/** @file Search field with clear and retry actions. */

import { createElement } from '../dom.js';

/** Public parts of the search field. */
export interface SearchField {
  /** Container element to mount. */
  readonly element: HTMLElement;
  /** The input itself, for focus management. */
  readonly input: HTMLInputElement;
  /** Sets the value and syncs the clear button visibility. */
  setValue(value: string): void;
  /** Shows or hides the retry button. */
  setRetryVisible(visible: boolean): void;
}

/** Options of the search field. */
export interface SearchFieldOptions {
  /** Called with the raw value on every change. */
  readonly onInput: (query: string) => void;
  /** Called when the user asks to repeat the last search. */
  readonly onRetry: () => void;
}

/**
 * Creates the search field.
 *
 * @param options - Input and retry callbacks.
 * @returns Element, input reference and state helpers.
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

  const retryButton = createElement('button', {
    className: 'search__retry',
    attributes: {
      type: 'button',
      title: 'Retry the last search',
      'aria-label': 'Repeat the last search',
    },
    children: [
      createElement('img', {
        className: 'search__icon',
        attributes: { src: './assets/icons/retry.svg', alt: '', 'aria-hidden': 'true' },
      }),
    ],
  });

  clearButton.hidden = true;
  retryButton.hidden = true;

  const element = createElement('div', {
    className: 'search',
    attributes: { role: 'search' },
    children: [
      createElement('span', { className: 'search__prefix', text: '>' }),
      input,
      clearButton,
      retryButton,
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

  retryButton.addEventListener('click', () => {
    options.onRetry();
  });

  const setValue = (value: string): void => {
    input.value = value;
    clearButton.hidden = value.length === 0;
  };

  const setRetryVisible = (visible: boolean): void => {
    retryButton.hidden = !visible;
  };

  return { element, input, setValue, setRetryVisible };
}
