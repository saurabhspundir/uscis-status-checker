import { useState } from 'react';

interface Props {
  onSubmit: (code: string) => Promise<void>;
  onCancel: () => void;
  error: string | null;
}

export function InvitationCodeModal({ onSubmit, onCancel, error }: Props) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    await onSubmit(code.trim());
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Invitation Required</h2>
        <p>This app is invite-only. Please enter the invitation code you received.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={code}
            onChange={e => setCode(e.target.value)}
            disabled={submitting}
            autoFocus
          />
          {error && <p className="error-text">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onCancel} disabled={submitting}>Cancel</button>
            <button type="submit" disabled={submitting || !code.trim()}>
              {submitting ? 'Verifying…' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
