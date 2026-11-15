/** @file Tests for the HttpError. */

import { describe, expect, it } from '@jest/globals';

import { HttpError } from '../../core/http-error.js';

describe('HttpError', () => {
  it('is an instance of Error', () => {
    expect(new HttpError(500)).toBeInstanceOf(Error);
  });

  it('keeps the http status', () => {
    expect(new HttpError(500).status).toBe(500);
  });

  it('has a stable name', () => {
    expect(new HttpError(503).name).toBe('HttpError');
  });

  it('mentions the status in the message', () => {
    expect(new HttpError(429).message).toContain('429');
  });

  it('is distinguishable from other errors', () => {
    const error = new HttpError(404);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).not.toBeInstanceOf(TypeError);
  });
});
