/** @file Status panel: loading, no matches and failure states. */

import type { SearchErrorKind } from '../../core/search-errors.js';
import { SEARCH_STATUS } from '../../domain/search-state.js';
import type { SearchState } from '../../domain/search-state.js';
import { createElement } from '../dom.js';

const ILLUSTRATION_PATH = './assets/illustrations/';
const ITEM_VISIBLE_CLASS = 'status__item--visible';
/** Must match the transition duration in styles.css. */
const FADE_MS = 180;

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

/** One visible block of the panel with the key that identifies it. */
interface StatusView {
  readonly key: string;
  readonly node: HTMLElement;
}

/**
 * Creates the status panel.
 *
 * Only one block is visible at a time. Blocks cross-fade instead of being
 * swapped instantly, and a block with the same key is never re-created, so the
 * loader keeps spinning across keystrokes instead of restarting.
 *
 * @param options - Retry callback.
 * @returns Panel element and its render function.
 */
export function createStatusPanel(options: StatusPanelOptions): StatusPanel {
  const element = createElement('div', {
    className: 'status',
    attributes: { 'aria-live': 'polite' },
  });

  let current: HTMLElement | null = null;
  let currentKey: string | null = null;

  const fadeOut = (node: HTMLElement): void => {
    node.classList.remove(ITEM_VISIBLE_CLASS);

    const remove = (): void => {
      node.remove();
    };

    node.addEventListener('transitionend', remove, { once: true });
    // fallback for reduced motion and for browsers that skip transitionend
    window.setTimeout(remove, FADE_MS + 80);
  };

  const show = (key: string, node: HTMLElement): void => {
    currentKey = key;

    if (current !== null) {
      fadeOut(current);
    }

    current = node;
    element.append(node);
    window.requestAnimationFrame(() => {
      node.classList.add(ITEM_VISIBLE_CLASS);
    });
  };

  return {
    element,
    render: (state) => {
      const next = describe(state, options.onRetry);

      if (next === null) {
        if (current !== null) {
          fadeOut(current);
          current = null;
        }

        currentKey = null;
        return;
      }

      if (next.key === currentKey) {
        return;
      }

      show(next.key, next.node);
    },
  };
}

function describe(state: SearchState, onRetry: () => void): StatusView | null {
  switch (state.status) {
    case SEARCH_STATUS.loading:
      return { key: 'loading', node: createLoader() };
    case SEARCH_STATUS.notFound:
      return { key: 'not-found', node: createNotFound() };
    case SEARCH_STATUS.error:
      return { key: `error:${state.kind}`, node: createError(state.kind, onRetry) };
    case SEARCH_STATUS.idle:
      return { key: 'welcome', node: createWelcome() };
    default:
      return null;
  }
}

function createLoader(): HTMLElement {
  return createElement('div', {
    className: 'status__item loader',
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

function createWelcome(): HTMLElement {
  return createElement('div', {
    className: 'status__item welcome',
    children: [
      createElement('img', {
        className: 'welcome__image',
        attributes: { src: `${ILLUSTRATION_PATH}welcome.svg`, alt: '', 'aria-hidden': 'true' },
      }),
      createElement('p', { className: 'welcome__title', text: 'AWAITING QUERY' }),
      createElement('p', {
        className: 'welcome__hint',
        text: 'Type a country name to start the scan.',
      }),
    ],
  });
}

function createNotFound(): HTMLElement {
  return createElement('div', {
    className: 'status__item empty',
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
    className: 'status__item error',
    attributes: { role: 'alert' },
    children: [
      createElement('p', { className: 'error__title', text: ERROR_TITLES[kind] }),
      createElement('p', { className: 'error__message', text: ERROR_MESSAGES[kind] }),
      retry,
    ],
  });
}
