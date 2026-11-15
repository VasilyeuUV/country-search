/** @file Chips with the recent queries. */

import { createElement } from '../dom.js';

/** History chips with an imperative render. */
export interface HistoryList {
  /** Container element to mount. */
  readonly element: HTMLElement;
  /** Replaces the chips with the given queries. */
  render(queries: readonly string[]): void;
}

/** Options of the history list. */
export interface HistoryListOptions {
  /** Called with the query of the clicked chip. */
  readonly onSelect: (query: string) => void;
  /** Called when the user clears the history. */
  readonly onClear: () => void;
}

/**
 * Creates the history chips.
 *
 * @param options - Selection and clear callbacks.
 * @returns Element and its render function.
 */
export function createHistoryList(options: HistoryListOptions): HistoryList {
  const chips = createElement('div', { className: 'history__chips' });

  const clearButton = createElement('button', {
    className: 'history__clear',
    attributes: { type: 'button', title: 'Clear history', 'aria-label': 'Clear search history' },
    text: 'CLEAR',
  });

  clearButton.addEventListener('click', () => {
    options.onClear();
  });

  const element = createElement('div', {
    className: 'history',
    children: [
      createElement('span', { className: 'history__label', text: 'RECENT' }),
      chips,
      clearButton,
    ],
  });

  return {
    element,
    render: (queries) => {
      element.hidden = queries.length === 0;

      chips.replaceChildren(
        ...queries.map((query) => {
          const chip = createElement('button', {
            className: 'history__item',
            attributes: { type: 'button' },
            text: query,
          });

          chip.addEventListener('click', () => {
            options.onSelect(query);
          });

          return chip;
        }),
      );
    },
  };
}
