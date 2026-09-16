import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../auth/AuthContext';
import { InvitationCodeModal } from './InvitationCodeModal';

export function LoginPage() {
  const { login, loginWithInvite } = useAuth();
  const navigate = useNavigate();
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;
    if (!idToken) return;

    setLoginError(null);
    const result = await login(idToken);
    if (result === 'success') {
      navigate('/', { replace: true });
    } else if (result === 'requiresInvitation') {
      setPendingIdToken(idToken);
    } else {
      setLoginError('Sign-in failed. Please try again.');
    }
  };

  const handleInviteSubmit = async (code: string) => {
    if (!pendingIdToken) return;
    setInviteError(null);
    const result = await loginWithInvite(pendingIdToken, code);
    if (result === 'success') {
      navigate('/', { replace: true });
    } else {
      setInviteError('Invalid invitation code. Please check and try again.');
    }
  };

  const handleInviteCancel = () => {
    setPendingIdToken(null);
    setInviteError(null);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>USCIS Case Status</h1>
        <p>Sign in to check your case status</p>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setLoginError('Google sign-in failed. Please try again.')}
        />
        {loginError && <p className="error-text">{loginError}</p>}
      </div>
      {pendingIdToken && (
        <InvitationCodeModal
          onSubmit={handleInviteSubmit}
          onCancel={handleInviteCancel}
          error={inviteError}
        />
      )}
    </div>
  );
}
