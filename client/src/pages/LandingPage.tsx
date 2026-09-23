import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function LandingPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  return (
    <div className="landing-page">
      <Header variant="landing" />

      {/* Hero Section */}
      <div className="landing-hero">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-text">
              <h2>Stay Updated on Your Immigration Case</h2>
              <p>
                Check your USCIS case status anytime, anywhere. Get instant updates on application processing with our secure, easy-to-use platform.
              </p>
            </div>

            {/* Features */}
            <div className="hero-features">
              <div className="feature">
                <div className="feature-icon">✓</div>
                <div>
                  <div className="feature-title">Real-Time Status With Full History</div>
                  <div className="feature-desc">Real time update with full history</div>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">✓</div>
                <div>
                  <div className="feature-title">No User Data Tracking</div>
                  <div className="feature-desc">We don't track or store your personal data</div>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">✓</div>
                <div>
                  <div className="feature-title">Powered By The USCIS API</div>
                  <div className="feature-desc">Using USCIS API to fetch data</div>
                </div>
              </div>
            </div>

            <button
              className="cta-button"
              onClick={() => navigate('/login')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Sign in
            </button>
          </div>

          {/* Right Visual Cards */}
          <div className="hero-right">
            <div className="case-card">
              <div className="card-label">Case Status</div>
              <div className="case-card-meta">
                <div>
                  <span className="meta-label">Receipt Number</span>
                  <span className="meta-value">EAC9999103403</span>
                </div>
                <div>
                  <span className="meta-label">Form</span>
                  <span className="meta-value">I-130</span>
                </div>
              </div>
              <div className="card-title">Case Was Approved</div>
              <div className="card-description">
                On September 5, 2023, we approved your Form I-130, Petition for Alien Relative, Receipt Number EAC9999103403. We sent you an approval notice.
              </div>
              <div className="card-status">
                <div className="status-dot"></div>
                <span>Approved</span>
              </div>
            </div>

            <div className="timeline-card">
              <div className="card-label">Timeline</div>
              <div className="timeline-entries">
                <div className="timeline-entry">
                  <span className="timeline-date">Sep 5, 2023</span>
                  <span className="timeline-text">We approved your Form I-130, Petition for Alien Relative.</span>
                </div>
                <div className="timeline-entry">
                  <span className="timeline-date">Sep 5, 2023</span>
                  <span className="timeline-text">We mailed your document to a USCIS International Office, U.S. Embassy, or Consulate that has jurisdiction for your case. We also mailed you a separate approval notice.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
   </div>
  );
}
