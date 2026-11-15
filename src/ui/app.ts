/** @file Composition root of the UI. */

import { SEARCH_STATUS } from '../domain/search-state.js';
import { createSearchController } from '../services/search-controller.js';
import type { SearchController } from '../services/search-controller.js';
import { createElement } from './dom.js';
import { createCountryGrid } from './views/country-grid.js';
import { createDetailsDialog } from './views/details-dialog.js';
import { createFooter } from './views/footer.js';
import { createHeader } from './views/header.js';
import { createSearchField } from './views/search-field.js';

/**
 * Mounts the application.
 *
 * @param container - Host element, `body` in production.
 * @returns Search controller used by the mounted views.
 */
export function mountApp(container: HTMLElement): SearchController {
  const controller = createSearchController();
  const details = createDetailsDialog();
  const results = createElement('div', { className: 'app__results' });

  const searchField = createSearchField({
    onInput: (query) => {
      controller.setQuery(query);
    },
  });

  controller.subscribe((state) => {
    results.replaceChildren();

    if (state.status === SEARCH_STATUS.results) {
      results.append(
        createCountryGrid(state.countries, (country) => {
          details.open(country);
        }),
      );
    }
  });

  const main = createElement('main', {
    className: 'app__main',
    children: [searchField.element, results],
  });

  container.append(createHeader(), main, createFooter(), details.element);

  return controller;
}
