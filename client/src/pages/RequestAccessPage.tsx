import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { requestAccess } from '../api/accessRequestApi';

export function RequestAccessPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !reason.trim()) return;

    setSubmitting(true);
    setError(null);

    const result = await requestAccess(name.trim(), email.trim(), reason.trim());

    if (result.type === 'success') {
      setSubmitted(true);
    } else if (result.type === 'dailyLimitReached') {
      setError("We've received the maximum number of requests for today. Please contact us tomorrow.");
    } else {
      setError(result.message);
    }

    setSubmitting(false);
  };

  return (
    <div className="login-page">
      <Header variant="login" />

      <div className="login-content">
        <div className="login-card">
          {submitted ? (
            <>
              <div className="login-card-header">
                <h2>Request Received</h2>
                <p>Thanks — we'll be in touch soon.</p>
              </div>
              <div className="login-footer">
                <p className="login-footer-alt">
                  <Link to="/login">Back to sign in</Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="login-card-header">
                <h2>Request Access</h2>
                <p>Tell us a bit about yourself and we'll follow up</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="login-field">
                  <label className="login-label" htmlFor="request-access-name">Name</label>
                  <input
                    id="request-access-name"
                    className="login-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={submitting}
                    autoFocus
                  />
                </div>

                <div className="login-field">
                  <label className="login-label" htmlFor="request-access-email">Email</label>
                  <input
                    id="request-access-email"
                    className="login-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="login-field">
                  <label className="login-label" htmlFor="request-access-reason">Reason</label>
                  <textarea
                    id="request-access-reason"
                    className="login-input"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    disabled={submitting}
                    rows={4}
                  />
                </div>

                {error && <p className="error-text">{error}</p>}

                <button
                  type="submit"
                  className="sign-in-button"
                  disabled={submitting || !name.trim() || !email.trim() || !reason.trim()}
                >
                  {submitting ? 'Sending…' : 'Submit Request'}
                </button>
              </form>

              <div className="login-footer">
                <p className="login-footer-alt">
                  Already have an account? <Link to="/login">Sign in</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
