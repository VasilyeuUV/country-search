/** @file Composition root of the UI. */

import { createSearchController } from '../services/search-controller.js';
import type { SearchController } from '../services/search-controller.js';
import { createElement } from './dom.js';
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
  const searchField = createSearchField({
    onInput: (query) => {
      controller.setQuery(query);
    },
  });
  const main = createElement('main', {
    className: 'app__main',
    children: [searchField.element],
  });

  container.append(createHeader(), main, createFooter());

  return controller;
}
