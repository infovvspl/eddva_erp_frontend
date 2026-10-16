import type { VisitorLogStatus } from './visitorRecord.types';

export interface VisitorLogSummary {
  log_id: number;
  visitor_id: number;
  visitor_type?: string | null;
  agency_vendor_name?: string | null;
  department_id?: number | null;
  host_employee_id: number;
  appointment_id?: number | null;
  purpose?: string;
  badge_number: string;
  check_in_time: string;
  check_out_time?: string | null;
  status: VisitorLogStatus;
  created_by?: string;
  visitor?: {
    visitor_id: number;
    full_name: string;
    phone?: string;
    organization?: string;
  };
  department?: {
    department_id: number;
    name: string;
  } | null;
  host_employee?: {
    employee_id: number;
    name: string;
    department_id: number;
  };
}

export interface VisitorLogDetail extends VisitorLogSummary {
  visitor?: {
    visitor_id: number;
    full_name: string;
    phone?: string;
    email?: string;
    organization?: string;
    photo_url?: string;
  };
  appointment?: {
    appointment_id: number;
    purpose?: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: string;
  } | null;
}

export type VisitorType = 'parents' | 'guardian' | 'alumni' | 'vendor' | 'delivery_agency' | 'official' | 'others';

// Visitor types that represent an organization rather than an individual —
// these require agency_vendor_name.
export const AGENCY_VENDOR_VISITOR_TYPES: VisitorType[] = ['vendor', 'delivery_agency', 'official', 'others'];

export const VISITOR_TYPE_LABELS: Record<VisitorType, string> = {
  parents: 'Parents',
  guardian: 'Guardian',
  alumni: 'Alumni',
  vendor: 'Vendor',
  delivery_agency: 'Delivery Agency',
  official: 'Official',
  others: 'Others',
};

export interface CheckInFormData {
  visitor_id?: number;
  full_name?: string;
  phone?: string;
  email?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  photo_url?: string;
  organization?: string;
  visitor_type?: VisitorType;
  agency_vendor_name?: string;
  department_id?: number;
  appointment_id?: number;
  host_employee_id?: number;
  purpose?: string;
}

export interface CheckOutFormData {
  remarks?: string;
}

export interface VisitorLogQueryParams {
  date?: string;
  host_employee_id?: number;
  status?: VisitorLogStatus;
  appointment_id?: number;
  visitor_id?: number;
  page?: number;
  limit?: number;
}

export interface VisitorLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VisitorLogListResult {
  data: VisitorLogSummary[];
  pagination: VisitorLogPagination;
}
