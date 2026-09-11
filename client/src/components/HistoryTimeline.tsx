import type { HistCaseStatus } from '../types/caseStatus';

interface Props {
  history: HistCaseStatus[];
}

export function HistoryTimeline({ history }: Props) {
  if (!history.length) {
    return <p className="no-history">No history available.</p>;
  }

  return (
    <div className="timeline">
      <h3>History</h3>
      <ol className="timeline-list">
        {history.map((entry, i) => (
          <li key={i} className="timeline-item">
            <span className="timeline-date">{entry.date ?? 'Unknown date'}</span>
            <span className="timeline-status">{entry.completed_text_en ?? 'No description'}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
