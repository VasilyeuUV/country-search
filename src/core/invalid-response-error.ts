/** @file Error for a response body that does not match the API contract. */

/** Error thrown when the API payload cannot be read as country data. */
export class InvalidResponseError extends Error {
  constructor() {
    super('Response payload does not match the expected country list');
    this.name = 'InvalidResponseError';
  }
}
