/** @file Application footer with the repository and task links. */

import { REPOSITORY_URL, TASK_URL, DEVELOPER, RSSCHOOL_TASK } from '../../config/constants.js';
import { createElement } from '../dom.js';

const ICONS_PATH = './assets/icons/';

/**
 * @returns Footer with the repository link, the year and the task link.
 */
export function createFooter(): HTMLElement {
  const year = new Date().getFullYear();

  return createElement('footer', {
    className: 'app__footer',
    children: [
      createLink(REPOSITORY_URL, DEVELOPER, 'github.svg'),
      createElement('span', { className: 'app__year', text: `© ${year}` }),
      createLink(TASK_URL, RSSCHOOL_TASK, 'mortarboard.svg'),
    ],
  });
}

function createLink(href: string, label: string, icon: string): HTMLAnchorElement {
  return createElement('a', {
    className: 'app__footer-link',
    attributes: { href, target: '_blank', rel: 'noreferrer noopener' },
    children: [
      createElement('img', {
        className: 'app__icon',
        attributes: { src: `${ICONS_PATH}${icon}`, alt: '', 'aria-hidden': 'true' },
      }),
      createElement('span', { text: label }),
    ],
  });
}
