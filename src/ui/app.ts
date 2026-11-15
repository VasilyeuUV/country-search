/** @file Composition root of the UI. */

import { searchCountries } from '../data/api/search-countries.js';
import { SEARCH_STATUS } from '../domain/search-state.js';
import { createCachedSearch } from '../services/request-cache.js';
import { createSearchHistory } from '../services/search-history.js';
import { createSearchController } from '../services/search-controller.js';
import type { SearchController } from '../services/search-controller.js';
import { createElement } from './dom.js';
import { createCountryGrid } from './views/country-grid.js';
import { createDetailsDialog } from './views/details-dialog.js';
import { createFooter } from './views/footer.js';
import { createHeader } from './views/header.js';
import { createHistoryList } from './views/history-list.js';
import { createSearchField } from './views/search-field.js';
import { createStatusPanel } from './views/status-panel.js';

/** Must match the transition duration in styles.css. */
const RESULTS_FADE_MS = 160;

/**
 * Mounts the application.
 *
 * @param container - Host element, `body` in production.
 * @returns Search controller used by the mounted views.
 */
export function mountApp(container: HTMLElement): SearchController {
  const controller = createSearchController({ search: createCachedSearch(searchCountries) });
  const details = createDetailsDialog();
  const results = createElement('div', { className: 'app__results' });
  const history = createSearchHistory(window.localStorage);

  const fadeOutResults = (): void => {
    for (const item of [...results.children]) {
      item.classList.add('is-leaving');
      window.setTimeout(() => {
        item.remove();
      }, RESULTS_FADE_MS);
    }
  };

  const searchField = createSearchField({
    onInput: (query) => {
      fadeOutResults();
      controller.setQuery(query);
    },
  });

  const historyList = createHistoryList({
    onSelect: (query) => {
      searchField.setValue(query);
      fadeOutResults();
      controller.submit(query);
    },
    onClear: () => {
      history.clear();
      historyList.render(history.getAll());
    },
  });

  historyList.render(history.getAll());

  const status = createStatusPanel({
    onRetry: () => {
      controller.retry();
    },
  });

  status.render(controller.getState());

  controller.subscribe((state) => {
    status.render(state);

    if (state.status === SEARCH_STATUS.results) {
      history.add(state.query);
      historyList.render(history.getAll());
      results.replaceChildren(
        createCountryGrid(state.countries, (country) => {
          details.open(country);
        }),
      );
      return;
    }

    fadeOutResults();
  });

  const main = createElement('main', {
    className: 'app__main',
    children: [searchField.element, historyList.element, status.element, results],
  });

  container.append(createHeader(), main, createFooter(), details.element);

  return controller;
}
