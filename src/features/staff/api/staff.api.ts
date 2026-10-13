import axiosInstance from '../../../lib/axios';
import type {
  StaffDepartment,
  StaffDepartmentFormData,
  StaffMember,
  CreateStaffMemberFormData,
  UpdateStaffMemberFormData,
  RelieveStaffFormData,
  LeaveType,
  CreateLeaveTypeFormData,
  LeaveBalance,
  LeaveApplication,
  CreateLeaveApplicationFormData,
  SalaryStructure,
  CreateSalaryStructureFormData,
  PayrollRun,
  GeneratePayrollRunFormData,
  ListResult,
  LmsTeacher,
  ImportLmsTeacherFormData,
  StaffDashboardSummary,
} from '../types/staff.types';

// --- Departments ---

export async function getDepartments(search?: string): Promise<StaffDepartment[]> {
  const response = await axiosInstance.get('/staff/departments', { params: search ? { search } : undefined });
  return response.data.data || [];
}

export async function getDepartment(id: number): Promise<StaffDepartment> {
  const response = await axiosInstance.get(`/staff/departments/${id}`);
  return response.data.data;
}

export async function createDepartment(data: StaffDepartmentFormData): Promise<StaffDepartment> {
  const response = await axiosInstance.post('/staff/departments', data);
  return response.data.data;
}

export async function updateDepartment(id: number, data: StaffDepartmentFormData): Promise<StaffDepartment> {
  const response = await axiosInstance.patch(`/staff/departments/${id}`, data);
  return response.data.data;
}

export async function deleteDepartment(id: number): Promise<void> {
  await axiosInstance.delete(`/staff/departments/${id}`);
}

// --- Staff Members ---

export async function getStaffMembers(params?: {
  staff_type?: string;
  status?: string;
  department_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ListResult<StaffMember>> {
  // The backend's global interceptor spreads {data, pagination} flat for
  // paginated endpoints, rather than nesting them under `data`.
  const response = await axiosInstance.get('/staff/members', { params });
  return { data: response.data.data || [], pagination: response.data.pagination };
}

export async function getStaffMember(id: number): Promise<StaffMember> {
  const response = await axiosInstance.get(`/staff/members/${id}`);
  return response.data.data;
}

export async function createStaffMember(data: CreateStaffMemberFormData): Promise<StaffMember> {
  const response = await axiosInstance.post('/staff/members', data);
  return response.data.data;
}

export async function updateStaffMember(id: number, data: UpdateStaffMemberFormData): Promise<StaffMember> {
  const response = await axiosInstance.patch(`/staff/members/${id}`, data);
  return response.data.data;
}

export async function relieveStaffMember(id: number, data: RelieveStaffFormData): Promise<StaffMember> {
  const response = await axiosInstance.patch(`/staff/members/${id}/relieve`, data);
  return response.data.data;
}

export async function reinstateStaffMember(id: number, date_of_joining: string): Promise<StaffMember> {
  const response = await axiosInstance.patch(`/staff/members/${id}/reinstate`, { date_of_joining });
  return response.data.data;
}

// --- Leave Types ---

export async function getLeaveTypes(includeInactive = false): Promise<LeaveType[]> {
  const response = await axiosInstance.get('/staff/leave-types', { params: { include_inactive: includeInactive } });
  return response.data.data || [];
}

export async function createLeaveType(data: CreateLeaveTypeFormData): Promise<LeaveType> {
  const response = await axiosInstance.post('/staff/leave-types', data);
  return response.data.data;
}

export async function updateLeaveType(id: number, data: Partial<CreateLeaveTypeFormData> & { is_active?: boolean }): Promise<LeaveType> {
  const response = await axiosInstance.patch(`/staff/leave-types/${id}`, data);
  return response.data.data;
}

export async function deactivateLeaveType(id: number): Promise<void> {
  await axiosInstance.delete(`/staff/leave-types/${id}`);
}

// --- Leave Balances ---

export async function syncLeaveBalances(year?: number): Promise<{ rows_created: number }> {
  const response = await axiosInstance.post('/staff/leave-balances/sync', undefined, { params: year ? { year } : undefined });
  return response.data.data;
}

export async function getLeaveBalances(params?: { staff_id?: number; year?: number }): Promise<LeaveBalance[]> {
  const response = await axiosInstance.get('/staff/leave-balances', { params });
  return response.data.data || [];
}

export async function getStaffLeaveBalances(staffId: number, year?: number): Promise<LeaveBalance[]> {
  const response = await axiosInstance.get(`/staff/leave-balances/staff/${staffId}`, { params: year ? { year } : undefined });
  return response.data.data || [];
}

// --- Leave Applications ---

export async function getLeaveApplications(params?: {
  staff_id?: number;
  leave_type_id?: number;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ListResult<LeaveApplication>> {
  const response = await axiosInstance.get('/staff/leave-applications', { params });
  return { data: response.data.data || [], pagination: response.data.pagination };
}

export async function getLeaveApplication(id: number): Promise<LeaveApplication> {
  const response = await axiosInstance.get(`/staff/leave-applications/${id}`);
  return response.data.data;
}

export async function createLeaveApplication(data: CreateLeaveApplicationFormData): Promise<LeaveApplication> {
  const response = await axiosInstance.post('/staff/leave-applications', data);
  return response.data.data;
}

export async function approveLeaveApplication(id: number): Promise<LeaveApplication> {
  const response = await axiosInstance.patch(`/staff/leave-applications/${id}/approve`);
  return response.data.data;
}

export async function rejectLeaveApplication(id: number, decision_reason?: string): Promise<LeaveApplication> {
  const response = await axiosInstance.patch(`/staff/leave-applications/${id}/reject`, { decision_reason });
  return response.data.data;
}

export async function cancelLeaveApplication(id: number): Promise<LeaveApplication> {
  const response = await axiosInstance.patch(`/staff/leave-applications/${id}/cancel`);
  return response.data.data;
}

// --- Salary Structures ---

export async function createSalaryStructure(data: CreateSalaryStructureFormData): Promise<SalaryStructure> {
  const response = await axiosInstance.post('/staff/salary-structures', data);
  return response.data.data;
}

export async function getStaffSalaryStructures(staffId: number): Promise<SalaryStructure[]> {
  const response = await axiosInstance.get(`/staff/salary-structures/staff/${staffId}`);
  return response.data.data || [];
}

// --- Payroll Runs ---

export async function generatePayrollRun(data: GeneratePayrollRunFormData): Promise<PayrollRun> {
  const response = await axiosInstance.post('/staff/payroll-runs', data);
  return response.data.data;
}

export async function getPayrollRuns(year?: number): Promise<PayrollRun[]> {
  const response = await axiosInstance.get('/staff/payroll-runs', { params: year ? { year } : undefined });
  return response.data.data || [];
}

export async function getPayrollRun(id: number): Promise<PayrollRun> {
  const response = await axiosInstance.get(`/staff/payroll-runs/${id}`);
  return response.data.data;
}

export async function finalizePayrollRun(id: number): Promise<PayrollRun> {
  const response = await axiosInstance.patch(`/staff/payroll-runs/${id}/finalize`);
  return response.data.data;
}

export async function payPayrollRun(id: number): Promise<PayrollRun> {
  const response = await axiosInstance.patch(`/staff/payroll-runs/${id}/pay`);
  return response.data.data;
}

// --- Dashboard ---

export async function getStaffDashboard(): Promise<StaffDashboardSummary> {
  const response = await axiosInstance.get('/staff/dashboard');
  return response.data.data;
}

// --- LMS Teachers (read-only) ---

export async function getLmsTeachers(): Promise<LmsTeacher[]> {
  const response = await axiosInstance.get('/staff/lms-teachers');
  return response.data.data || [];
}

export async function importLmsTeacher(data: ImportLmsTeacherFormData): Promise<StaffMember> {
  const response = await axiosInstance.post('/staff/members/import-from-lms', data);
  return response.data.data;
}
