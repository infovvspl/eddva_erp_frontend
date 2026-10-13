import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { createStaffMember, getDepartments } from '../../api/staff.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { CreateStaffMemberFormData, StaffDepartment } from '../../types/staff.types';

const EMPTY: CreateStaffMemberFormData = {
  full_name: '',
  staff_type: 'teaching',
  designation: '',
  employment_type: '',
  email: '',
  phone: '',
  date_of_joining: '',
};

export default function CreateMemberPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<StaffDepartment[]>([]);
  const [formData, setFormData] = useState<CreateStaffMemberFormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => undefined);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const member = await createStaffMember(formData);
      navigate(`/staff/members/${member.staff_id}`);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to create staff member'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Staff Member</h1>
        <p className="text-slate-600 mt-1">
          Teaching staff with an email are automatically given an LMS login — this is the only place to add a teacher.
        </p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Staff Type *</label>
                <Select
                  value={formData.staff_type}
                  onChange={(e) => setFormData({ ...formData, staff_type: e.target.value as 'teaching' | 'non_teaching' })}
                  options={[
                    { value: 'teaching', label: 'Teaching' },
                    { value: 'non_teaching', label: 'Non-teaching' },
                  ]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <Select
                  value={formData.department_id || ''}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Unassigned — can be set later"
                  options={departments.map((d) => ({ value: String(d.department_id), label: d.name }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Designation *</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g., Mathematics Teacher"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email {formData.staff_type === 'teaching' && <span className="text-slate-400 font-normal">(required for LMS login)</span>}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                <input
                  type="text"
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  placeholder="e.g., permanent, contract"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Joining *</label>
                <input
                  type="date"
                  value={formData.date_of_joining}
                  onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => navigate('/staff/members')} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Staff Member'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
