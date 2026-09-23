import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../auth/AuthContext';
import { InvitationCodeModal } from './InvitationCodeModal';
import { TermsAcceptanceModal } from './TermsAcceptanceModal';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

type LoginStep =
  | 'idle'
  | 'requiresInvitation'
  | 'requiresTerms';

export function LoginPage() {
  const { token, login, loginWithInvite, loginWithTermsAccepted, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
      navigate('/dashboard', { replace: true });
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
      navigate('/dashboard', { replace: true });
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
      navigate('/dashboard', { replace: true });
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
      <Header variant="login" />

      {/* Login Card */}
      <div className="login-content">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome Back</h2>
            <p>Sign in to check your case status</p>
          </div>

          {/* Google Sign In */}
          <div className="google-signin-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setLoginError('Google sign-in failed. Please try again.')}
            />
          </div>

          {loginError && <p className="error-text">{loginError}</p>}

          {/* Footer Links */}
          <div className="login-footer">
            <p className="login-footer-text">
              <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
              {' '}&bull;{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            </p>
            <p className="login-footer-alt">
              Don't have an account? <Link to="/request-access">Request access</Link>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="trust-indicators">
          <div className="trust-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Secure</span>
          </div>
          <div className="trust-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Official</span>
          </div>
          <div className="trust-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Verified</span>
          </div>
        </div>
      </div>

      <Footer />

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
