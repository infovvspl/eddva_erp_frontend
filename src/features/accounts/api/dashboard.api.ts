import axiosInstance from '../../../lib/axios';
import type { AccountsDashboardSummary } from '../types/dashboard.types';

export async function getAccountsDashboardSummary(): Promise<AccountsDashboardSummary> {
  const response = await axiosInstance.get('/accounts/dashboard/summary');
  return response.data.data ?? response.data;
}
