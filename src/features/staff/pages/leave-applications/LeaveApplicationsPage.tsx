import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, X, Ban } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import {
  getLeaveApplications,
  approveLeaveApplication,
  rejectLeaveApplication,
  cancelLeaveApplication,
} from '../../api/staff.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { cn } from '../../../../utils/cn';
import type { LeaveApplication } from '../../types/staff.types';

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

export default function LeaveApplicationsPage() {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const result = await getLeaveApplications({ status: status || undefined, limit: 50 });
      setApplications(result.data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load leave applications'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleAction(id: number, action: 'approve' | 'reject' | 'cancel') {
    try {
      setBusyId(id);
      if (action === 'approve') await approveLeaveApplication(id);
      else if (action === 'reject') {
        const reason = prompt('Reason for rejection (optional):') || undefined;
        await rejectLeaveApplication(id, reason);
      } else await cancelLeaveApplication(id);
      await load();
    } catch (err: any) {
      alert(getApiErrorMessage(err, `Failed to ${action} application`));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Applications</h1>
          <p className="text-slate-600 mt-1">Review and decide on staff leave requests</p>
        </div>
        <Link to="/staff/leave-applications/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            File Leave Application
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="All statuses"
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Staff</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Leave Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Dates</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Days</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No leave applications found.
                    </td>
                  </tr>
                ) : (
                  applications.map((a) => (
                    <tr key={a.application_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-900">{a.staff?.full_name ?? a.staff_id}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{a.leave_type?.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {a.from_date.slice(0, 10)} → {a.to_date.slice(0, 10)}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{a.days_count}</td>
                      <td className="py-3 px-4">
                        <span className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize', STATUS_BADGE[a.status])}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {a.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleAction(a.application_id, 'approve')}
                              disabled={busyId === a.application_id}
                              className="p-1.5 hover:bg-green-50 rounded-lg text-green-600"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAction(a.application_id, 'reject')}
                              disabled={busyId === a.application_id}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        {a.status === 'approved' && (
                          <button
                            onClick={() => handleAction(a.application_id, 'cancel')}
                            disabled={busyId === a.application_id}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                            title="Cancel"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
