import { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { ErrorBanner } from './components/ErrorBanner';
import { LoadingSpinner } from './components/LoadingSpinner';
import { CaseStatusCard } from './components/CaseStatusCard';
import { HistoryTimeline } from './components/HistoryTimeline';
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

function App() {
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
      <header className="app-header">
        <h1>USCIS Case Status Lookup</h1>
        <p className="subtitle">Check the status and history of your USCIS case</p>
      </header>
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

export default App;
