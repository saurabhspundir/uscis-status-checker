import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';

interface HeaderProps {
  variant: 'landing' | 'login' | 'app';
}

function UserActions() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="header-user">
      <span>{user.displayName ?? user.email}</span>
      <button onClick={logout}>Sign out</button>
    </div>
  );
}

function NoticeBanner({ variant }: { variant: 'landing' | 'login' | 'app' }) {
  if (variant === 'landing') {
    return (
      <div className="status-banner landing-banner">
        <p><strong>Notice:</strong> This application is not live yet. Pending approval from USCIS Development team.</p>
      </div>
    );
  }

  return (
    <div className="status-banner login-banner">
      <p>⚠️ <strong>Notice:</strong> This application is not live yet. Pending approval from USCIS Development team.</p>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}

export function Header({ variant }: HeaderProps) {
  if (variant === 'landing') {
    return (
      <>
        <header className="landing-header">
          <div className="header-toggle-row">
            <ThemeToggle />
          </div>
          <h1><Link to="/" className="header-title-link">My USCIS Case</Link></h1>
          <p>Track Your Immigration Case Status in Real-Time</p>
          <UserActions />
        </header>
        <NoticeBanner variant={variant} />
      </>
    );
  }

  if (variant === 'login') {
    return (
      <>
        <div className="login-header">
          <div className="header-toggle-row">
            <ThemeToggle />
          </div>
          <h1><Link to="/" className="header-title-link">My USCIS Case</Link></h1>
          <p>Track Your Immigration Case Status in Real-Time</p>
          <UserActions />
        </div>
        <NoticeBanner variant={variant} />
      </>
    );
  }

  return (
    <>
      <header className="app-header">
        <div className="header-toggle-row">
          <ThemeToggle />
        </div>
        <h1><Link to="/" className="header-title-link">My USCIS Case</Link></h1>
        <p className="subtitle">Track Your Immigration Case Status in Real-Time</p>
        <UserActions />
      </header>
      <NoticeBanner variant={variant} />
    </>
  );
}
