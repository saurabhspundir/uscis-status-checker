import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import * as uscisApi from '../api/uscisApi';
import type { CaseStatusResponse } from '../types/caseStatus';

vi.mock('../api/uscisApi');

// Mock auth so the app thinks a user is already signed in
vi.mock('../auth/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    token: 'mock-token',
    user: { id: '1', email: 'test@example.com', displayName: 'Test User', avatarUrl: null, isAdmin: false },
    login: vi.fn(),
    loginWithInvite: vi.fn(),
    logout: vi.fn(),
  }),
}));

// GoogleOAuthProvider is used in main.tsx, not App.tsx, so no mock needed here

const successResponse: CaseStatusResponse = {
  case_status: {
    receiptNumber: 'EAC9999103403',
    formType: 'I-485',
    submittedDate: '2023-01-15',
    modifiedDate: '2024-06-01',
    current_case_status_text_en: 'Case Was Approved',
    current_case_status_desc_en: 'Your case has been approved.',
    hist_case_status: [
      { date: '2024-06-01', completed_text_en: 'Case approved.' },
    ],
  },
};

function renderApp(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>
  );
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(uscisApi.fetchCaseStatus).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders header and search form on initial load', () => {
    renderApp();
    expect(screen.getByText('USCIS Case Status Lookup')).toBeInTheDocument();
    expect(screen.getByLabelText('Receipt Number')).toBeInTheDocument();
  });

  it('shows loading spinner while fetching', async () => {
    vi.mocked(uscisApi.fetchCaseStatus).mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Receipt Number'), 'EAC9999103403');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays case card and history on success', async () => {
    vi.mocked(uscisApi.fetchCaseStatus).mockResolvedValue(successResponse);
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Receipt Number'), 'EAC9999103403');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => expect(screen.getByText('Case Was Approved')).toBeInTheDocument());
    expect(screen.getByText('Case approved.')).toBeInTheDocument();
  });

  it('shows daily limit error message', async () => {
    vi.mocked(uscisApi.fetchCaseStatus).mockRejectedValue({ error: 'daily limit exceeded' });
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Receipt Number'), 'EAC9999103403');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Daily request limit reached')
    );
  });

  it('shows too many requests error message', async () => {
    vi.mocked(uscisApi.fetchCaseStatus).mockRejectedValue({ error: 'too many requests' });
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Receipt Number'), 'EAC9999103403');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Too many requests')
    );
  });

  it('shows invalid receipt number error message', async () => {
    vi.mocked(uscisApi.fetchCaseStatus).mockRejectedValue({ error: 'invalid receipt' });
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Receipt Number'), 'EAC9999103403');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid receipt number format')
    );
  });

  it('shows upstream error message', async () => {
    vi.mocked(uscisApi.fetchCaseStatus).mockRejectedValue({ error: 'upstream failure' });
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Receipt Number'), 'EAC9999103403');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('USCIS service error')
    );
  });

  it('shows network error for TypeError', async () => {
    vi.mocked(uscisApi.fetchCaseStatus).mockRejectedValue(new TypeError('Failed to fetch'));
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Receipt Number'), 'EAC9999103403');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Network error')
    );
  });

  it('shows generic error for unknown error', async () => {
    vi.mocked(uscisApi.fetchCaseStatus).mockRejectedValue({ error: 'something weird' });
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Receipt Number'), 'EAC9999103403');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('something weird')
    );
  });

  it('clears previous results before a new search', async () => {
    vi.mocked(uscisApi.fetchCaseStatus)
      .mockResolvedValueOnce(successResponse)
      .mockReturnValueOnce(new Promise(() => {}));
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Receipt Number'), 'EAC9999103403');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => expect(screen.getByText('Case Was Approved')).toBeInTheDocument());

    // Second search — result should disappear during loading
    await user.clear(screen.getByLabelText('Receipt Number'));
    await user.type(screen.getByLabelText('Receipt Number'), 'EAC9999103404');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.queryByText('Case Was Approved')).toBeNull();
  });
});
