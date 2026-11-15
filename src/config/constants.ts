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

/** Application title. */
export const APP_TITLE = 'Country Search';

/** Line under the title. */
export const APP_TAGLINE = 'PIP-BOY TERMINAL // COUNTRY DATABASE';

/** Public repository of the project. */
export const REPOSITORY_URL = 'https://github.com/VasilyeuUV/country-search';

/** Task description in the RS School repository. */
export const TASK_URL =
  'https://github.com/rolling-scopes-school/tasks/blob/master/fullstack-engineering/tasks/country-search/README.md';

/** Developer. */
export const DEVELOPER = 'Vasilyeu U.V.';

/** RS School task */
export const RSSCHOOL_TASK = 'RS School task';

/** Maximum number of cached search queries. */
export const CACHE_MAX_ENTRIES = 20;

/** Maximum number of queries kept in the history. */
export const HISTORY_LIMIT = 8;

/** Storage key of the search history. */
export const HISTORY_STORAGE_KEY = 'country-search:history';
