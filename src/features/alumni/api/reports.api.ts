import axiosInstance from '../../../lib/axios';

// Must match REPORT_NAMES in eddva_erp_backend/src/alumni/reports/dto/report-query.dto.ts —
// the backend rejects any other value with "Unknown report '<name>'".
export const REPORT_NAMES = [
  'alumni-directory',
  'alumni-by-batch',
  'alumni-by-program',
  'alumni-employment',
  'alumni-location',
  'event-registrations',
  'event-attendance',
  'event-revenue',
  'job-postings',
  'job-applications',
  'hiring',
  'mentors',
  'mentees',
  'mentorship-matches',
  'campaigns',
  'donations',
  'donor-history',
  'donation-totals',
  'payment-modes',
  'newsletters',
  'delivery-statistics',
  'engagement',
] as const;

export async function getReport(report: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const response = await axiosInstance.get(`/alumni/reports/${report}`, { params });
  return response.data.data ?? response.data;
}

export async function exportReport(
  report: string,
  params: Record<string, unknown> = {}
): Promise<{ blob: Blob; filename: string | null }> {
  const response = await axiosInstance.get(`/alumni/reports/${report}/export`, { params, responseType: 'blob' });
  const contentType = String(response.headers['content-type'] || 'application/octet-stream');
  const disposition = String(response.headers['content-disposition'] || '');
  const match = disposition.match(/filename="?([^"]+)"?/);
  return { blob: new Blob([response.data], { type: contentType }), filename: match?.[1] ?? null };
}
