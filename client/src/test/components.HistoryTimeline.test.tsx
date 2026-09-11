import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistoryTimeline } from '../components/HistoryTimeline';
import type { HistCaseStatus } from '../types/caseStatus';

describe('HistoryTimeline', () => {
  it('shows "No history available." when history is empty', () => {
    render(<HistoryTimeline history={[]} />);
    expect(screen.getByText('No history available.')).toBeInTheDocument();
  });

  it('renders all history entries', () => {
    const history: HistCaseStatus[] = [
      { date: '2024-01-10', completed_text_en: 'Case received.' },
      { date: '2024-03-20', completed_text_en: 'Case approved.' },
    ];
    render(<HistoryTimeline history={history} />);
    expect(screen.getByText('2024-01-10')).toBeInTheDocument();
    expect(screen.getByText('Case received.')).toBeInTheDocument();
    expect(screen.getByText('2024-03-20')).toBeInTheDocument();
    expect(screen.getByText('Case approved.')).toBeInTheDocument();
  });

  it('uses "Unknown date" fallback when date is absent', () => {
    const history: HistCaseStatus[] = [{ completed_text_en: 'Case received.' }];
    render(<HistoryTimeline history={history} />);
    expect(screen.getByText('Unknown date')).toBeInTheDocument();
  });

  it('uses "No description" fallback when completed_text_en is absent', () => {
    const history: HistCaseStatus[] = [{ date: '2024-01-10' }];
    render(<HistoryTimeline history={history} />);
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('renders a heading "History"', () => {
    const history: HistCaseStatus[] = [{ date: '2024-01-10', completed_text_en: 'Done' }];
    render(<HistoryTimeline history={history} />);
    expect(screen.getByText('History')).toBeInTheDocument();
  });
});
