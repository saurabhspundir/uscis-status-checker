import { useState } from 'react';

interface Props {
  onAccept: () => Promise<void>;
  onCancel: () => void;
  error: string | null;
}

export function TermsAcceptanceModal({ onAccept, onCancel, error }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) return;
    setSubmitting(true);
    await onAccept();
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal--terms">
        <h2>Terms of Service &amp; Privacy Policy</h2>
        <p>
          Before you continue, please review and accept our policies. This application
          uses the USCIS TORCH API to look up immigration case statuses on your behalf.
        </p>
        <ul className="terms-links">
          <li>
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service ↗
            </a>
          </li>
          <li>
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy ↗
            </a>
          </li>
        </ul>
        <form onSubmit={handleSubmit}>
          <label className="terms-checkbox">
            <input
              type="checkbox"
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              disabled={submitting}
            />
            <span>
              I have read and agree to the Terms of Service and Privacy Policy.
            </span>
          </label>
          {error && <p className="error-text">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || !accepted}>
              {submitting ? 'Saving…' : 'Accept &amp; Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
