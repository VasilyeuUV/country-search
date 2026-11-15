/** @file HTTP error for unsuccessful API responses. */

/** Error thrown when the API responds with an unsuccessful status. */
export class HttpError extends Error {
  /** HTTP status code of the response. */
  readonly status: number;

  /**
   * @param status - HTTP status code of the response.
   */
  constructor(status: number) {
    super(`Request failed with HTTP status ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}
