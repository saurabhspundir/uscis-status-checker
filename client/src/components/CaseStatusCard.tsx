import type { CaseStatusResponse } from '../types/caseStatus';

interface Props {
  data: CaseStatusResponse;
}

export function CaseStatusCard({ data }: Props) {
  const cs = data.case_status;

  return (
    <div className="case-card">
      <h2 className="case-title">Case Status</h2>
      <div className="case-meta">
        {cs?.receiptNumber && <p><span className="label">Receipt Number:</span> {cs.receiptNumber}</p>}
        {cs?.formType && <p><span className="label">Form:</span> {cs.formType}</p>}
        {cs?.submittedDate && <p><span className="label">Submitted:</span> {cs.submittedDate}</p>}
        {cs?.modifiedDate && <p><span className="label">Last Updated:</span> {cs.modifiedDate}</p>}
      </div>
      <div className="current-status">
        <h3>{cs?.current_case_status_text_en ?? 'Current Status'}</h3>
        {cs?.current_case_status_desc_en
          ? <p className="status-text">{cs.current_case_status_desc_en}</p>
          : <p>No current status available</p>
        }
      </div>
    </div>
  );
}
