import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CaseStatusCard } from '../components/CaseStatusCard';
import type { CaseStatusResponse } from '../types/caseStatus';

const fullData: CaseStatusResponse = {
  case_status: {
    receiptNumber: 'EAC9999103403',
    formType: 'I-485',
    submittedDate: '2023-01-15',
    modifiedDate: '2024-06-01',
    current_case_status_text_en: 'Case Was Approved',
    current_case_status_desc_en: 'Your case has been approved.',
    hist_case_status: [],
  },
};

describe('CaseStatusCard', () => {
  it('renders receipt number', () => {
    render(<CaseStatusCard data={fullData} />);
    expect(screen.getByText('EAC9999103403')).toBeInTheDocument();
  });

  it('renders form type', () => {
    render(<CaseStatusCard data={fullData} />);
    expect(screen.getByText('I-485')).toBeInTheDocument();
  });

  it('renders submitted and last updated dates', () => {
    render(<CaseStatusCard data={fullData} />);
    expect(screen.getByText('2023-01-15')).toBeInTheDocument();
    expect(screen.getByText('2024-06-01')).toBeInTheDocument();
  });

  it('renders current status text and description', () => {
    render(<CaseStatusCard data={fullData} />);
    expect(screen.getByText('Case Was Approved')).toBeInTheDocument();
    expect(screen.getByText('Your case has been approved.')).toBeInTheDocument();
  });

  it('falls back to "Current Status" heading when status text is absent', () => {
    const data: CaseStatusResponse = { case_status: { hist_case_status: [] } };
    render(<CaseStatusCard data={data} />);
    expect(screen.getByText('Current Status')).toBeInTheDocument();
  });

  it('shows "No current status available" when description is absent', () => {
    const data: CaseStatusResponse = { case_status: { hist_case_status: [] } };
    render(<CaseStatusCard data={data} />);
    expect(screen.getByText('No current status available')).toBeInTheDocument();
  });

  it('does not render optional fields when absent', () => {
    const data: CaseStatusResponse = { case_status: { hist_case_status: [] } };
    render(<CaseStatusCard data={data} />);
    expect(screen.queryByText('Receipt Number:')).toBeNull();
    expect(screen.queryByText('Form:')).toBeNull();
    expect(screen.queryByText('Submitted:')).toBeNull();
    expect(screen.queryByText('Last Updated:')).toBeNull();
  });
});
