import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { getDepartments } from '../../api/departments.api';
import { getEmployees } from '../../api/employees.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { AGENCY_VENDOR_VISITOR_TYPES, VISITOR_TYPE_LABELS } from '../../types/visitorLog.types';
import type { CheckInFormData, VisitorType } from '../../types/visitorLog.types';
import type { FrontOfficeDepartment } from '../../types/departmentRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckInFormData) => Promise<void>;
  isLoading?: boolean;
}

const EMPTY_FORM: CheckInFormData = {
  full_name: '',
  phone: '',
  visitor_type: undefined,
  agency_vendor_name: '',
  purpose: '',
  department_id: undefined,
  host_employee_id: undefined,
};

const VISITOR_TYPES = Object.keys(VISITOR_TYPE_LABELS) as VisitorType[];

export default function CheckInModal({ isOpen, onClose, onSubmit, isLoading }: CheckInModalProps) {
  const [formData, setFormData] = useState<CheckInFormData>(EMPTY_FORM);
  const [departments, setDepartments] = useState<FrontOfficeDepartment[]>([]);
  const [employees, setEmployees] = useState<FrontOfficeEmployee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getDepartments().then(setDepartments).catch(() => setDepartments([]));
      setFormData(EMPTY_FORM);
      setEmployees([]);
      setError(null);
    }
  }, [isOpen]);

  // "Person to Meet" only ever shows employees from the selected department.
  useEffect(() => {
    if (!formData.department_id) {
      setEmployees([]);
      return;
    }
    setEmployeesLoading(true);
    getEmployees({ department_id: formData.department_id, limit: 100 })
      .then((r) => setEmployees(r.data))
      .catch(() => setEmployees([]))
      .finally(() => setEmployeesLoading(false));
  }, [formData.department_id]);

  function handleDepartmentChange(departmentId: number | undefined) {
    // A host from the previous department would no longer be valid.
    setFormData({ ...formData, department_id: departmentId, host_employee_id: undefined });
  }

  const needsAgencyVendorName = formData.visitor_type ? AGENCY_VENDOR_VISITOR_TYPES.includes(formData.visitor_type) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name?.trim()) {
      setError("Enter the visitor's name.");
      return;
    }
    if (!formData.phone?.trim()) {
      setError('Enter the mobile number.');
      return;
    }
    if (!formData.visitor_type) {
      setError('Select a visitor type.');
      return;
    }
    if (needsAgencyVendorName && !formData.agency_vendor_name?.trim()) {
      setError('Enter the agency/vendor name.');
      return;
    }
    if (!formData.purpose?.trim()) {
      setError('Enter the purpose of visit.');
      return;
    }
    if (!formData.department_id) {
      setError('Select the department to visit.');
      return;
    }
    if (!formData.host_employee_id) {
      setError('Select who the visitor is meeting.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to register visitor'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Visitor" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name of Visitor *</label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g., Rahul Verma"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9876543210"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Visitor Type *</label>
            <select
              value={formData.visitor_type ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  visitor_type: (e.target.value || undefined) as VisitorType | undefined,
                  // Clear a stale value when switching away from an agency/vendor type.
                  agency_vendor_name: '',
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select type</option>
              {VISITOR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {VISITOR_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          {needsAgencyVendorName && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Agency / Vendor Name *</label>
              <Input
                value={formData.agency_vendor_name}
                onChange={(e) => setFormData({ ...formData, agency_vendor_name: e.target.value })}
                placeholder="e.g., Blue Dart Logistics"
                required
              />
            </div>
          )}

          <div className={needsAgencyVendorName ? 'col-span-2' : ''}>
            <label className="block text-sm font-medium text-slate-700 mb-1">Purpose of Visit *</label>
            <Input
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g., Parent-teacher meeting"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department to Visit *</label>
            <select
              value={formData.department_id ?? ''}
              onChange={(e) => handleDepartmentChange(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Person to Meet *</label>
            <select
              value={formData.host_employee_id ?? ''}
              onChange={(e) => setFormData({ ...formData, host_employee_id: e.target.value ? Number(e.target.value) : undefined })}
              disabled={!formData.department_id || employeesLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
              required
            >
              <option value="">
                {!formData.department_id ? 'Select a department first' : employeesLoading ? 'Loading...' : 'Select person'}
              </option>
              {employees.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.name}{e.designation ? ` — ${e.designation}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Check-in time and the visitor pass number are generated automatically on registration. {formData.host_employee_id ? 'The person to meet will be notified.' : ''}
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register Visitor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
