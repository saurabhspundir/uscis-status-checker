const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export type RequestAccessResult =
  | { type: 'success' }
  | { type: 'dailyLimitReached' }
  | { type: 'error'; message: string };

export async function requestAccess(
  name: string,
  email: string,
  reason: string
): Promise<RequestAccessResult> {
  const res = await fetch(`${BASE}/api/access-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, reason }),
  });

  if (res.ok) return { type: 'success' };

  if (res.status === 429) return { type: 'dailyLimitReached' };

  const body = await res.json().catch(() => ({ error: 'Unknown error' }));
  return { type: 'error', message: body.error ?? 'Something went wrong.' };
}
