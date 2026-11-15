/** @file Application header. */

import { APP_TAGLINE, APP_TITLE } from '../../config/constants.js';
import { createElement } from '../dom.js';

/**
 * @returns Header with the application title and the terminal tagline.
 */
export function createHeader(): HTMLElement {
  return createElement('header', {
    className: 'app__header',
    children: [
      createElement('h1', { className: 'app__title', text: APP_TITLE }),
      createElement('p', { className: 'app__tagline', text: APP_TAGLINE }),
    ],
  });
}
