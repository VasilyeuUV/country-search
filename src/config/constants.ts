/** @file Application constants shared across layers. */

/** Base URL of the countries API. */
export const API_BASE_URL = 'https://countries.dev';

/** Path of the name search endpoint; the query is appended to it. */
export const API_NAME_PATH = '/name/';

/** Status the API returns when nothing matches the query. */
export const HTTP_STATUS_NOT_FOUND = 404;

/** Idle time before a search request is sent, in milliseconds. */
export const DEBOUNCE_MS = 400;

/** Hard limit for a single request, in milliseconds. */
export const REQUEST_TIMEOUT_MS = 8000;

/** Locale used to format numbers in the UI. */
export const LOCALE = 'en-US';
