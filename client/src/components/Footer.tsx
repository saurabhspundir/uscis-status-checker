import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <nav className="footer-links">
        <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
        <span className="footer-separator">&bull;</span>
        <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link>
      </nav>
      <p className="footer-copyright">
        &copy; {year} MyUSCISCase.org. All rights reserved.
      </p>
    </footer>
  );
}
