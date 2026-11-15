/** @file Selection of the data source used by the application. */

/** Available data sources. */
export const DATA_SOURCE = {
  api: 'api',
  mock: 'mock',
} as const;

/** Union of the supported data sources. */
export type DataSource = (typeof DATA_SOURCE)[keyof typeof DATA_SOURCE];

/** Query parameter that switches the data source. */
export const DATA_SOURCE_PARAM = 'source';

/**
 * Resolves the data source from a URL search string.
 *
 * @param search - `window.location.search`-like string.
 * @returns `mock` for `?source=mock`, `api` otherwise.
 */
export function resolveDataSource(search: string): DataSource {
  const params = new URLSearchParams(search);

  return params.get(DATA_SOURCE_PARAM) === DATA_SOURCE.mock ? DATA_SOURCE.mock : DATA_SOURCE.api;
}
