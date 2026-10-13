import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import Select from '../../../../components/ui/Select';
import { getLeaveTypes, createLeaveType } from '../../api/staff.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { cn } from '../../../../utils/cn';
import type { LeaveType, CreateLeaveTypeFormData } from '../../types/staff.types';

const EMPTY: CreateLeaveTypeFormData = { name: '', code: '', annual_quota_days: 0, is_paid: true, allow_carry_forward: false };

export default function LeaveTypesPage() {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateLeaveTypeFormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setTypes(await getLeaveTypes());
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load leave types'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError(null);
      await createLeaveType(formData);
      setModalOpen(false);
      setFormData(EMPTY);
      await load();
    } catch (err: any) {
      setFormError(getApiErrorMessage(err, 'Failed to create leave type'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Types</h1>
          <p className="text-slate-600 mt-1">Casual leave, sick leave, leave without pay, etc.</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Leave Type
        </Button>
      </div>

      <Card className="border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Annual Quota</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Paid</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Applies To</th>
                </tr>
              </thead>
              <tbody>
                {types.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No leave types yet.
                    </td>
                  </tr>
                ) : (
                  types.map((t) => (
                    <tr key={t.leave_type_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{t.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{t.code}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{t.annual_quota_days} days</td>
                      <td className="py-3 px-4">
                        <span className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium', t.is_paid ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600')}>
                          {t.is_paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 capitalize">
                        {t.applicable_staff_type ? t.applicable_staff_type.replace('_', '-') : 'All staff'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Leave Type">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">{formError}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Casual Leave"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., CL"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Quota (days) *</label>
            <input
              type="number"
              min={0}
              value={formData.annual_quota_days || ''}
              onChange={(e) => setFormData({ ...formData, annual_quota_days: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Applies To</label>
            <Select
              value={formData.applicable_staff_type || ''}
              onChange={(e) => setFormData({ ...formData, applicable_staff_type: (e.target.value || undefined) as any })}
              placeholder="All staff"
              options={[
                { value: 'teaching', label: 'Teaching only' },
                { value: 'non_teaching', label: 'Non-teaching only' },
              ]}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={formData.is_paid ?? true}
              onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
            />
            Paid leave (unchecked = Loss of Pay for Payroll)
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
