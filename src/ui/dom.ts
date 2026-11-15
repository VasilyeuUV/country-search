/** @file DOM helpers: the only place where elements are created. */

/** Options accepted by `createElement`. */
export interface ElementOptions {
  readonly className?: string;
  readonly text?: string;
  readonly attributes?: Readonly<Record<string, string>>;
  readonly children?: readonly Node[];
}

/**
 * Creates an HTML element.
 *
 * @param tag - Tag name.
 * @param options - Class, text, attributes and children.
 * @returns Freshly created element.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {},
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (options.className !== undefined) {
    element.className = options.className;
  }

  if (options.text !== undefined) {
    element.textContent = options.text;
  }

  if (options.attributes !== undefined) {
    for (const [name, value] of Object.entries(options.attributes)) {
      element.setAttribute(name, value);
    }
  }

  if (options.children !== undefined) {
    element.append(...options.children);
  }

  return element;
}

/**
 * Creates an SVG element.
 *
 * @param tag - SVG tag name, for example `circle`.
 * @param attributes - Attributes to set.
 * @returns Freshly created SVG element.
 */
export function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Readonly<Record<string, string>> = {},
): SVGElementTagNameMap[K] {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }

  return element;
}
