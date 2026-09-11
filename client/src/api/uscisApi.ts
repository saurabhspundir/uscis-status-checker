import type { CaseStatusResponse, ApiError } from '../types/caseStatus';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export async function fetchCaseStatus(caseNumber: string): Promise<CaseStatusResponse> {
  const res = await fetch(`${BASE}/api/case/${caseNumber.trim().toUpperCase()}`);
  if (!res.ok) {
    const err: ApiError = await res.json();
    throw err;
  }
  return res.json() as Promise<CaseStatusResponse>;
}
