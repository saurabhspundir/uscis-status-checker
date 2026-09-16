import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../auth/AuthContext';
import { InvitationCodeModal } from './InvitationCodeModal';
import { TermsAcceptanceModal } from './TermsAcceptanceModal';

type LoginStep =
  | 'idle'
  | 'requiresInvitation'
  | 'requiresTerms';

export function LoginPage() {
  const { login, loginWithInvite, loginWithTermsAccepted } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<LoginStep>('idle');
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);
  const [pendingInviteCode, setPendingInviteCode] = useState<string | undefined>(undefined);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
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
      setStep('requiresInvitation');
    } else if (result === 'requiresTermsAcceptance') {
      setPendingIdToken(idToken);
      setStep('requiresTerms');
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
    } else if (result === 'requiresTermsAcceptance') {
      setPendingInviteCode(code);
      setStep('requiresTerms');
    } else {
      setInviteError('Invalid invitation code. Please check and try again.');
    }
  };

  const handleInviteCancel = () => {
    setPendingIdToken(null);
    setPendingInviteCode(undefined);
    setInviteError(null);
    setStep('idle');
  };

  const handleTermsAccept = async () => {
    if (!pendingIdToken) return;
    setTermsError(null);
    const result = await loginWithTermsAccepted(pendingIdToken, pendingInviteCode);

    if (result === 'success') {
      navigate('/', { replace: true });
    } else {
      setTermsError('Something went wrong. Please try signing in again.');
    }
  };

  const handleTermsCancel = () => {
    setPendingIdToken(null);
    setPendingInviteCode(undefined);
    setTermsError(null);
    setStep('idle');
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

      {step === 'requiresInvitation' && (
        <InvitationCodeModal
          onSubmit={handleInviteSubmit}
          onCancel={handleInviteCancel}
          error={inviteError}
        />
      )}

      {step === 'requiresTerms' && (
        <TermsAcceptanceModal
          onAccept={handleTermsAccept}
          onCancel={handleTermsCancel}
          error={termsError}
        />
      )}
    </div>
  );
}
