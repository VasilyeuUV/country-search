/** @file Search state consumed by the UI. */

import type { SearchErrorKind } from '../core/search-errors.js';
import type { Country } from './country.js';

/** Statuses of the search flow. */
export const SEARCH_STATUS = {
  idle: 'idle',
  loading: 'loading',
  results: 'results',
  notFound: 'not-found',
  error: 'error',
} as const;

/** Union of all search statuses. */
export type SearchStatus = (typeof SEARCH_STATUS)[keyof typeof SEARCH_STATUS];

/** Where the search flow is right now. */
export type SearchState =
  | { readonly status: typeof SEARCH_STATUS.idle; readonly query: string }
  | { readonly status: typeof SEARCH_STATUS.loading; readonly query: string }
  | {
      readonly status: typeof SEARCH_STATUS.results;
      readonly query: string;
      readonly countries: readonly Country[];
    }
  | { readonly status: typeof SEARCH_STATUS.notFound; readonly query: string }
  | {
      readonly status: typeof SEARCH_STATUS.error;
      readonly query: string;
      readonly kind: SearchErrorKind;
    };
