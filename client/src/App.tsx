import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SearchForm } from './components/SearchForm';
import { ErrorBanner } from './components/ErrorBanner';
import { LoadingSpinner } from './components/LoadingSpinner';
import { CaseStatusCard } from './components/CaseStatusCard';
import { HistoryTimeline } from './components/HistoryTimeline';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { fetchCaseStatus } from './api/uscisApi';
import { isApiError } from './types/caseStatus';
import type { CaseStatusResponse } from './types/caseStatus';
import './App.css';

type Status = 'idle' | 'loading' | 'success' | 'error';

function mapErrorMessage(e: unknown): string {
  if (isApiError(e)) {
    if (e.error.toLowerCase().includes('daily')) return 'Daily request limit reached. Try again tomorrow.';
    if (e.error.toLowerCase().includes('too many')) return 'Too many requests. Please wait a moment and try again.';
    if (e.error.toLowerCase().includes('invalid')) return 'Invalid receipt number format.';
    if (e.error.toLowerCase().includes('upstream')) return 'USCIS service error. Try again later.';
    return e.error;
  }
  if (e instanceof TypeError) return 'Network error. Check your connection and try again.';
  return 'An unexpected error occurred.';
}

function MainApp() {
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<CaseStatusResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (caseNumber: string) => {
    setStatus('loading');
    setData(null);
    setErrorMessage(null);
    try {
      const result = await fetchCaseStatus(caseNumber);
      setData(result);
      setStatus('success');
    } catch (e) {
      setErrorMessage(mapErrorMessage(e));
      setStatus('error');
    }
  };

  return (
    <div className="app">
      <Header variant="app" />
      <main className="app-main">
        <SearchForm onSearch={handleSearch} isLoading={status === 'loading'} />
        {status === 'loading' && <LoadingSpinner />}
        <ErrorBanner message={errorMessage} />
        {status === 'success' && data && (
          <>
            <CaseStatusCard data={data} />
            <HistoryTimeline history={data.case_status?.hist_case_status ?? []} />
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
