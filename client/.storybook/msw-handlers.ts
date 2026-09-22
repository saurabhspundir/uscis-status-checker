import { http, HttpResponse } from 'msw';

export const mswHandlers = [
  http.get('http://localhost:5000/api/case/:caseNumber', ({ params }) => {
    const { caseNumber } = params;
    return HttpResponse.json({
      receipt_number: caseNumber,
      case_status: {
        status_code: 'EAC00',
        status_description: 'Application is being reviewed',
        last_update_date: '2024-09-22',
        hist_case_status: [
          {
            status_code: 'RFE04',
            status_description: 'Request for Evidence was issued',
            status_date: '2024-08-15'
          },
          {
            status_code: 'REC00',
            status_description: 'Receipt Notice was issued',
            status_date: '2024-03-15'
          }
        ]
      }
    });
  }),
];
