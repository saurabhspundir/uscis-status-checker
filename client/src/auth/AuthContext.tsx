import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { googleLogin, type AuthUser } from '../api/authApi';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

interface AuthContextValue extends AuthState {
  login: (idToken: string) => Promise<'success' | 'requiresInvitation' | 'requiresTermsAcceptance' | 'error'>;
  loginWithInvite: (idToken: string, invitationCode: string) => Promise<'success' | 'requiresTermsAcceptance' | 'error'>;
  loginWithTermsAccepted: (idToken: string, invitationCode?: string) => Promise<'success' | 'error'>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'uscis_auth';

function loadFromStorage(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthState;
  } catch { /* ignore */ }
  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadFromStorage);

  const persist = useCallback((next: AuthState) => {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const login = useCallback(async (idToken: string): Promise<'success' | 'requiresInvitation' | 'requiresTermsAcceptance' | 'error'> => {
    const result = await googleLogin(idToken);
    if (result.type === 'success') {
      persist({ token: result.data.token, user: result.data.user });
      return 'success';
    }
    if (result.type === 'requiresInvitation') return 'requiresInvitation';
    if (result.type === 'requiresTermsAcceptance') return 'requiresTermsAcceptance';
    return 'error';
  }, [persist]);

  const loginWithInvite = useCallback(async (idToken: string, invitationCode: string): Promise<'success' | 'requiresTermsAcceptance' | 'error'> => {
    const result = await googleLogin(idToken, invitationCode);
    if (result.type === 'success') {
      persist({ token: result.data.token, user: result.data.user });
      return 'success';
    }
    if (result.type === 'requiresTermsAcceptance') return 'requiresTermsAcceptance';
    return 'error';
  }, [persist]);

  const loginWithTermsAccepted = useCallback(async (idToken: string, invitationCode?: string): Promise<'success' | 'error'> => {
    const result = await googleLogin(idToken, invitationCode, true);
    if (result.type === 'success') {
      persist({ token: result.data.token, user: result.data.user });
      return 'success';
    }
    return 'error';
  }, [persist]);

  const logout = useCallback(() => {
    setState({ token: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithInvite, loginWithTermsAccepted, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
