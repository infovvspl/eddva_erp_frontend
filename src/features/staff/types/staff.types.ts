export type StaffType = 'teaching' | 'non_teaching';
export type StaffStatus = 'active' | 'resigned' | 'terminated';
export type LmsSyncStatus = 'pending' | 'synced';
export type LeaveApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type PayrollRunStatus = 'draft' | 'finalized' | 'paid';

export interface StaffDepartment {
  department_id: number;
  institute_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  _count?: { members: number };
}

export interface StaffDepartmentFormData {
  name: string;
  description?: string;
}

export interface StaffMember {
  staff_id: number;
  institute_id: string;
  staff_code: string;
  staff_type: StaffType;
  full_name: string;
  department_id?: number | null;
  department?: StaffDepartment | null;
  designation: string;
  employment_type?: string | null;
  email?: string | null;
  phone?: string | null;
  date_of_joining: string;
  reporting_to_id?: number | null;
  reporting_to?: StaffMember | null;
  status: StaffStatus;
  status_reason?: string | null;
  relieved_on?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  lms_teacher_ref?: string | null;
  lms_sync_status?: LmsSyncStatus;
  lms_sync_error?: string | null;
}

export interface CreateStaffMemberFormData {
  full_name: string;
  staff_type: StaffType;
  department_id?: number;
  designation: string;
  employment_type?: string;
  email?: string;
  phone?: string;
  date_of_joining: string;
  reporting_to_id?: number;
}

export interface UpdateStaffMemberFormData {
  full_name?: string;
  department_id?: number;
  designation?: string;
  employment_type?: string;
  email?: string;
  phone?: string;
  date_of_joining?: string;
  reporting_to_id?: number;
}

export interface RelieveStaffFormData {
  status: 'resigned' | 'terminated';
  relieved_on: string;
  status_reason?: string;
}

export interface LeaveType {
  leave_type_id: number;
  institute_id: string;
  name: string;
  code: string;
  applicable_staff_type?: StaffType | null;
  annual_quota_days: string;
  is_paid: boolean;
  allow_carry_forward: boolean;
  max_carry_forward_days?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLeaveTypeFormData {
  name: string;
  code: string;
  applicable_staff_type?: StaffType;
  annual_quota_days: number;
  is_paid?: boolean;
  allow_carry_forward?: boolean;
  max_carry_forward_days?: number;
}

export interface LeaveBalance {
  balance_id: number;
  institute_id: string;
  staff_id: number;
  staff?: { staff_id: number; full_name: string; staff_code: string };
  leave_type_id: number;
  leave_type?: LeaveType;
  year: number;
  allocated_days: string;
  used_days: string;
}

export interface LeaveApplication {
  application_id: number;
  institute_id: string;
  staff_id: number;
  staff?: { staff_id: number; full_name: string; staff_code: string };
  leave_type_id: number;
  leave_type?: LeaveType;
  from_date: string;
  to_date: string;
  days_count: string;
  reason?: string | null;
  status: LeaveApplicationStatus;
  applied_by: string;
  decided_by?: string | null;
  decided_at?: string | null;
  decision_reason?: string | null;
  created_at: string;
}

export interface CreateLeaveApplicationFormData {
  staff_id: number;
  leave_type_id: number;
  from_date: string;
  to_date: string;
  reason?: string;
}

export interface SalaryStructure {
  structure_id: number;
  institute_id: string;
  staff_id: number;
  basic_salary: string;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  effective_from: string;
  effective_to?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface CreateSalaryStructureFormData {
  staff_id: number;
  basic_salary: number;
  allowances?: Record<string, number>;
  deductions?: Record<string, number>;
  effective_from: string;
}

export interface Payslip {
  payslip_id: number;
  institute_id: string;
  run_id: number;
  staff_id: number;
  staff?: { staff_id: number; full_name: string; staff_code: string };
  basic_salary: string;
  allowances_total: string;
  gross_salary: string;
  lop_days: string;
  lop_amount: string;
  other_deductions: string;
  net_salary: string;
}

export interface PayrollRun {
  run_id: number;
  institute_id: string;
  month: number;
  year: number;
  status: PayrollRunStatus;
  generated_by?: string | null;
  generated_at: string;
  finalized_by?: string | null;
  finalized_at?: string | null;
  paid_by?: string | null;
  paid_at?: string | null;
  payslips?: Payslip[];
  payslips_created?: number;
  skipped?: Array<{ staff_id: number; reason: string }>;
}

export interface GeneratePayrollRunFormData {
  month: number;
  year: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResult<T> {
  data: T[];
  pagination: Pagination;
}

export interface LmsTeacher {
  teacherId: string;
  employeeId: string | null;
  name: string;
  email: string;
  department: string | null;
  designation: string | null;
  joiningDate: string | null;
  isActive: boolean;
  in_erp: boolean;
  erp_staff_id: number | null;
  duplicate_employee_id: boolean;
}

export interface ImportLmsTeacherFormData {
  teacher_id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department_id?: number;
  designation: string;
  date_of_joining: string;
}

export interface StaffDashboardTypeCount {
  staff_type: StaffType;
  count: number;
}

export interface StaffDashboardDepartmentCount {
  department_id: number;
  department: string;
  count: number;
}

export interface StaffDashboardSummary {
  total_staff: number;
  active_staff: number;
  by_type: StaffDashboardTypeCount[];
  by_department: StaffDashboardDepartmentCount[];
}
