import type { CaseStatusResponse, ApiError } from '../types/caseStatus';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('uscis_auth');
    if (raw) return (JSON.parse(raw) as { token?: string }).token ?? null;
  } catch { /* ignore */ }
  return null;
}

export async function fetchCaseStatus(caseNumber: string): Promise<CaseStatusResponse> {
  const token = getToken();
  const res = await fetch(`${BASE}/api/case/${caseNumber.trim().toUpperCase()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err: ApiError = await res.json();
    throw err;
  }
  return res.json() as Promise<CaseStatusResponse>;
}
