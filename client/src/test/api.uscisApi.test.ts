import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCaseStatus } from '../api/uscisApi';
import type { CaseStatusResponse, ApiError } from '../types/caseStatus';

const mockResponse = (body: unknown, ok: boolean, status = 200) => {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
};

describe('fetchCaseStatus', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed CaseStatusResponse on success', async () => {
    const payload: CaseStatusResponse = {
      case_status: {
        receiptNumber: 'EAC9999103403',
        formType: 'I-485',
        hist_case_status: [],
      },
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse(payload, true));

    const result = await fetchCaseStatus('EAC9999103403');
    expect(result).toEqual(payload);
  });

  it('trims and uppercases the case number in the URL', async () => {
    const payload: CaseStatusResponse = { case_status: { hist_case_status: [] } };
    vi.mocked(fetch).mockResolvedValue(mockResponse(payload, true));

    await fetchCaseStatus('  eac9999103403  ');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/EAC9999103403'));
  });

  it('throws ApiError when response is not ok', async () => {
    const errorBody: ApiError = { error: 'Invalid receipt number' };
    vi.mocked(fetch).mockResolvedValue(mockResponse(errorBody, false, 400));

    await expect(fetchCaseStatus('INVALID')).rejects.toEqual(errorBody);
  });

  it('throws a network TypeError when fetch rejects', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fetchCaseStatus('EAC9999103403')).rejects.toBeInstanceOf(TypeError);
  });
});
