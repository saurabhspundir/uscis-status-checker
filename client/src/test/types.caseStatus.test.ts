import { describe, it, expect } from 'vitest';
import { isApiError } from '../types/caseStatus';

describe('isApiError', () => {
  it('returns true for a valid ApiError object', () => {
    expect(isApiError({ error: 'Something went wrong' })).toBe(true);
  });

  it('returns true when optional fields are present', () => {
    expect(isApiError({ error: 'Rate limited', limit: 100, count: 101 })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isApiError(null)).toBe(false);
  });

  it('returns false for a plain string', () => {
    expect(isApiError('error string')).toBe(false);
  });

  it('returns false when error field is missing', () => {
    expect(isApiError({ message: 'oops' })).toBe(false);
  });

  it('returns false when error field is not a string', () => {
    expect(isApiError({ error: 42 })).toBe(false);
  });

  it('returns false for a TypeError instance', () => {
    expect(isApiError(new TypeError('network'))).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isApiError(undefined)).toBe(false);
  });
});
