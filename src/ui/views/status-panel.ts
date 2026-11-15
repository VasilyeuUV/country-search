/** @file Status panel: loading, no matches and failure states. */

import type { SearchErrorKind } from '../../core/search-errors.js';
import { SEARCH_STATUS } from '../../domain/search-state.js';
import type { SearchState } from '../../domain/search-state.js';
import { createElement } from '../dom.js';

const ILLUSTRATION_PATH = './assets/illustrations/';

const ERROR_TITLES: Readonly<Record<SearchErrorKind, string>> = {
  aborted: 'REQUEST CANCELLED',
  timeout: 'SIGNAL TIMEOUT',
  http: 'SERVER ERROR',
  invalid: 'BAD DATA',
  network: 'CONNECTION LOST',
};

const ERROR_MESSAGES: Readonly<Record<SearchErrorKind, string>> = {
  aborted: 'The request was cancelled.',
  timeout: 'The server did not answer in time.',
  http: 'The API rejected the request.',
  invalid: 'The response had an unexpected shape.',
  network: 'Check your network connection and try again.',
};

/** Status panel with an imperative render. */
export interface StatusPanel {
  /** Panel element to mount once. */
  readonly element: HTMLElement;
  /** Renders the given state, or nothing for `idle` and `results`. */
  render(state: SearchState): void;
}

/** Options of the status panel. */
export interface StatusPanelOptions {
  /** Called when the user asks to repeat the last search. */
  readonly onRetry: () => void;
}

/**
 * Creates the status panel.
 *
 * Only one state is rendered at a time: the loader, the empty result or the
 * failure with the retry action. The results grid lives outside the panel.
 *
 * @param options - Retry callback.
 * @returns Panel element and its render function.
 */
export function createStatusPanel(options: StatusPanelOptions): StatusPanel {
  const element = createElement('div', {
    className: 'status',
    attributes: { 'aria-live': 'polite' },
  });

  return {
    element,
    render: (state) => {
      element.replaceChildren();

      switch (state.status) {
        case SEARCH_STATUS.loading:
          element.append(createLoader());
          break;
        case SEARCH_STATUS.notFound:
          element.append(createNotFound());
          break;
        case SEARCH_STATUS.error:
          element.append(createError(state.kind, options.onRetry));
          break;
        default:
          break;
      }
    },
  };
}

function createLoader(): HTMLElement {
  return createElement('div', {
    className: 'loader',
    children: [
      createElement('div', {
        className: 'loader__scene',
        attributes: { 'aria-hidden': 'true' },
        children: [
          createElement('div', {
            className: 'loader__orbit',
            children: [
              createElement('div', {
                className: 'loader__track',
                children: [createElement('span', { className: 'loader__rocket' })],
              }),
            ],
          }),
          createElement('span', { className: 'loader__planet' }),
        ],
      }),
      createElement('p', { className: 'loader__label', text: 'Scanning sector...' }),
    ],
  });
}

function createNotFound(): HTMLElement {
  return createElement('div', {
    className: 'empty',
    children: [
      createElement('img', {
        className: 'empty__image',
        attributes: { src: `${ILLUSTRATION_PATH}no-results.svg`, alt: '', 'aria-hidden': 'true' },
      }),
      createElement('p', { className: 'empty__title', text: 'NO MATCHES' }),
      createElement('p', {
        className: 'empty__hint',
        text: 'Nothing on the radar. Try another spelling.',
      }),
    ],
  });
}

function createError(kind: SearchErrorKind, onRetry: () => void): HTMLElement {
  const retry = createElement('button', {
    className: 'error__retry',
    attributes: { type: 'button', 'aria-label': 'Repeat the last search' },
    text: 'RETRY',
  });

  retry.addEventListener('click', () => {
    onRetry();
  });

  return createElement('div', {
    className: 'error',
    attributes: { role: 'alert' },
    children: [
      createElement('p', { className: 'error__title', text: ERROR_TITLES[kind] }),
      createElement('p', { className: 'error__message', text: ERROR_MESSAGES[kind] }),
      retry,
    ],
  });
}
