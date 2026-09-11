export interface HistCaseStatus {
  date?: string;
  completed_text_en?: string;
  completed_text_es?: string;
}

export interface CaseStatusDetail {
  receiptNumber?: string;
  formType?: string;
  submittedDate?: string;
  modifiedDate?: string;
  current_case_status_text_en?: string;
  current_case_status_desc_en?: string;
  hist_case_status: HistCaseStatus[];
}

export interface CaseStatusResponse {
  case_status?: CaseStatusDetail;
  message?: string;
}

export interface ApiError {
  error: string;
  limit?: number;
  count?: number;
}

export function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'error' in e && typeof (e as ApiError).error === 'string';
}
