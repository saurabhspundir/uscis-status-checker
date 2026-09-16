const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export type GoogleLoginResult =
  | { type: 'success'; data: AuthResponse }
  | { type: 'requiresInvitation' }
  | { type: 'error'; message: string };

export async function googleLogin(
  idToken: string,
  invitationCode?: string
): Promise<GoogleLoginResult> {
  const res = await fetch(`${BASE}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, invitationCode }),
  });

  if (res.ok) {
    const data: AuthResponse = await res.json();
    return { type: 'success', data };
  }

  if (res.status === 403) {
    const body = await res.json();
    if (body.requiresInvitation) return { type: 'requiresInvitation' };
  }

  const body = await res.json().catch(() => ({ error: 'Unknown error' }));
  return { type: 'error', message: body.error ?? 'Authentication failed.' };
}
