/** @file Application footer with the repository and task links. */

import { REPOSITORY_URL, TASK_URL } from '../../config/constants.js';
import { createElement, createSvgElement } from '../dom.js';

const GITHUB_PATH =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z';

/** Mortarboard drawn as strokes: readable at 16px and matches the neon style. */
const TASK_ICON_PATHS = [
  'M8 3.2 14.8 6.2 8 9.2 1.2 6.2Z',
  'M4.2 8.4v2.4c0 1.1 1.7 1.8 3.8 1.8s3.8-.7 3.8-1.8V8.4',
  'M14.8 6.2v3.2',
];

/**
 * @returns Footer with the current year and two external links.
 */
export function createFooter(): HTMLElement {
  const year = new Date().getFullYear();

  return createElement('footer', {
    className: 'app__footer',
    children: [
      createElement('span', { text: `© ${year} // country-search` }),
      createLink(REPOSITORY_URL, 'GitHub repository', createGithubIcon()),
      createLink(TASK_URL, 'RS School task', createTaskIcon()),
    ],
  });
}

function createLink(href: string, label: string, icon: SVGSVGElement): HTMLAnchorElement {
  return createElement('a', {
    className: 'app__footer-link',
    attributes: { href, target: '_blank', rel: 'noreferrer noopener' },
    children: [icon, createElement('span', { text: label })],
  });
}

function createGithubIcon(): SVGSVGElement {
  const icon = createSvgElement('svg', {
    class: 'app__icon',
    viewBox: '0 0 16 16',
    'aria-hidden': 'true',
    focusable: 'false',
  });

  icon.append(createSvgElement('path', { d: GITHUB_PATH }));

  return icon;
}

function createTaskIcon(): SVGSVGElement {
  const icon = createSvgElement('svg', {
    class: 'app__icon app__icon--stroke',
    viewBox: '0 0 16 16',
    'aria-hidden': 'true',
    focusable: 'false',
  });

  for (const d of TASK_ICON_PATHS) {
    icon.append(createSvgElement('path', { d }));
  }

  icon.append(createSvgElement('circle', { cx: '14.8', cy: '10', r: '1' }));

  return icon;
}
