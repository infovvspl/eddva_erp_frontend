import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { createLeaveApplication, getStaffMembers, getLeaveTypes } from '../../api/staff.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { CreateLeaveApplicationFormData, StaffMember, LeaveType } from '../../types/staff.types';

export default function CreateLeaveApplicationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillStaffId = (location.state as { staffId?: number } | null)?.staffId;

  const [members, setMembers] = useState<StaffMember[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [formData, setFormData] = useState<CreateLeaveApplicationFormData>({
    staff_id: prefillStaffId ?? 0,
    leave_type_id: 0,
    from_date: '',
    to_date: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStaffMembers({ status: 'active', limit: 200 }).then((r) => setMembers(r.data)).catch(() => undefined);
    getLeaveTypes().then(setLeaveTypes).catch(() => undefined);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.staff_id || !formData.leave_type_id) {
      setError('Please select a staff member and a leave type');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await createLeaveApplication(formData);
      navigate('/staff/leave-applications');
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to file leave application'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">File Leave Application</h1>
        <p className="text-slate-600 mt-1">Checked against the staff member's remaining leave balance</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Staff Member *</label>
              <Select
                value={formData.staff_id || ''}
                onChange={(e) => setFormData({ ...formData, staff_id: Number(e.target.value) })}
                placeholder="Select a staff member"
                options={members.map((m) => ({ value: String(m.staff_id), label: `${m.full_name} (${m.staff_code})` }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type *</label>
              <Select
                value={formData.leave_type_id || ''}
                onChange={(e) => setFormData({ ...formData, leave_type_id: Number(e.target.value) })}
                placeholder="Select a leave type"
                options={leaveTypes.map((t) => ({ value: String(t.leave_type_id), label: `${t.name} (${t.is_paid ? 'Paid' : 'Unpaid'})` }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From *</label>
                <input
                  type="date"
                  value={formData.from_date}
                  onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To *</label>
                <input
                  type="date"
                  value={formData.to_date}
                  onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => navigate('/staff/leave-applications')} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
