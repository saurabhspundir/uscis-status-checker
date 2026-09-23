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
  | { type: 'requiresTermsAcceptance' }
  | { type: 'error'; message: string };

export async function googleLogin(
  idToken: string,
  invitationCode?: string,
  acceptedTerms?: boolean
): Promise<GoogleLoginResult> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, invitationCode, acceptedTerms: acceptedTerms ?? false }),
    });
  } catch {
    return { type: 'error', message: 'Unable to reach the server. Please check your connection and try again.' };
  }

  if (res.ok) {
    const data: AuthResponse = await res.json();
    return { type: 'success', data };
  }

  if (res.status === 403) {
    const body = await res.json();
    if (body.requiresInvitation) return { type: 'requiresInvitation' };
    if (body.requiresTermsAcceptance) return { type: 'requiresTermsAcceptance' };
  }

  const body = await res.json().catch(() => ({ error: 'Unknown error' }));
  return { type: 'error', message: body.error ?? 'Authentication failed.' };
}
