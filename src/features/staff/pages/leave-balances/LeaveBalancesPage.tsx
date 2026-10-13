import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { getLeaveBalances, syncLeaveBalances, getStaffMembers } from '../../api/staff.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { LeaveBalance, StaffMember } from '../../types/staff.types';

export default function LeaveBalancesPage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [staffId, setStaffId] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getStaffMembers({ limit: 200 }).then((r) => setMembers(r.data)).catch(() => undefined);
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getLeaveBalances({ staff_id: staffId ? Number(staffId) : undefined });
      setBalances(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load leave balances'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId]);

  async function handleSync() {
    try {
      setSyncing(true);
      setMessage(null);
      const result = await syncLeaveBalances();
      setMessage(`Allocated balances for ${result.rows_created} staff/leave-type pair(s).`);
      await load();
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to sync leave balances'));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Balances ({new Date().getFullYear()})</h1>
          <p className="text-slate-600 mt-1">Run this after adding a new leave type or staff member</p>
        </div>
        <Button variant="primary" onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Balances'}
        </Button>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{message}</div>}

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <Select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            placeholder="All staff"
            options={members.map((m) => ({ value: String(m.staff_id), label: `${m.full_name} (${m.staff_code})` }))}
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Staff</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Leave Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Allocated</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Used</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {balances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No balances found. Click "Sync Balances" to allocate this year's leave.
                    </td>
                  </tr>
                ) : (
                  balances.map((b) => (
                    <tr key={b.balance_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-900">{b.staff?.full_name ?? b.staff_id}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{b.leave_type?.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{b.allocated_days}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{b.used_days}</td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">{Number(b.allocated_days) - Number(b.used_days)}</td>
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
