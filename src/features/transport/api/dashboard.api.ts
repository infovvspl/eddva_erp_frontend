import axiosInstance from '../../../lib/axios';
import type { TransportDashboardSummary } from '../types/dashboard.types';

export async function getTransportDashboardSummary(): Promise<TransportDashboardSummary> {
  const response = await axiosInstance.get('/transport/dashboard/summary');
  return response.data.data ?? response.data;
}
