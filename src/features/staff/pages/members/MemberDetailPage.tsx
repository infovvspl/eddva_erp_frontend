import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Building2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import Select from '../../../../components/ui/Select';
import {
  getStaffMember,
  getStaffLeaveBalances,
  getStaffSalaryStructures,
  relieveStaffMember,
  reinstateStaffMember,
  createSalaryStructure,
} from '../../api/staff.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { cn } from '../../../../utils/cn';
import type { StaffMember, LeaveBalance, SalaryStructure } from '../../types/staff.types';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  resigned: 'bg-slate-100 text-slate-600',
  terminated: 'bg-red-100 text-red-700',
};

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const staffId = Number(id);

  const [member, setMember] = useState<StaffMember | null>(null);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [relieveOpen, setRelieveOpen] = useState(false);
  const [relieveStatus, setRelieveStatus] = useState<'resigned' | 'terminated'>('resigned');
  const [relievedOn, setRelievedOn] = useState('');
  const [relieveReason, setRelieveReason] = useState('');
  const [busy, setBusy] = useState(false);

  const [salaryOpen, setSalaryOpen] = useState(false);
  const [basicSalary, setBasicSalary] = useState('');
  const [hra, setHra] = useState('');
  const [da, setDa] = useState('');
  const [pf, setPf] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [m, b, s] = await Promise.all([
        getStaffMember(staffId),
        getStaffLeaveBalances(staffId).catch(() => []),
        getStaffSalaryStructures(staffId).catch(() => []),
      ]);
      setMember(m);
      setBalances(b);
      setStructures(s);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load staff member'));
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRelieve(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);
      await relieveStaffMember(staffId, { status: relieveStatus, relieved_on: relievedOn, status_reason: relieveReason || undefined });
      setRelieveOpen(false);
      await load();
    } catch (err: any) {
      alert(getApiErrorMessage(err, 'Failed to relieve staff member'));
    } finally {
      setBusy(false);
    }
  }

  async function handleReinstate() {
    const date = prompt('New date of joining (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
    if (!date) return;
    try {
      setBusy(true);
      await reinstateStaffMember(staffId, date);
      await load();
    } catch (err: any) {
      alert(getApiErrorMessage(err, 'Failed to reinstate staff member'));
    } finally {
      setBusy(false);
    }
  }

  async function handleSetSalary(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);
      const allowances: Record<string, number> = {};
      if (hra) allowances.hra = Number(hra);
      if (da) allowances.da = Number(da);
      const deductions: Record<string, number> = {};
      if (pf) deductions.pf = Number(pf);
      await createSalaryStructure({
        staff_id: staffId,
        basic_salary: Number(basicSalary),
        allowances: Object.keys(allowances).length ? allowances : undefined,
        deductions: Object.keys(deductions).length ? deductions : undefined,
        effective_from: effectiveFrom,
      });
      setSalaryOpen(false);
      setBasicSalary('');
      setHra('');
      setDa('');
      setPf('');
      setEffectiveFrom('');
      await load();
    } catch (err: any) {
      alert(getApiErrorMessage(err, 'Failed to set salary'));
    } finally {
      setBusy(false);
    }
  }

  const applyDefaultPf = (basic: string) => {
    setBasicSalary(basic);
    const n = Number(basic);
    if (n > 0) setPf(String(Math.round(n * 0.12)));
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (error || !member) return <div className="p-8 text-center text-red-500">{error || 'Staff member not found'}</div>;

  const currentStructure = structures.find((s) => !s.effective_to);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/staff/members')} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Staff Directory
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{member.full_name}</h1>
          <p className="text-slate-600 mt-1">
            {member.staff_code} · {member.designation}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {member.status === 'active' ? (
            <Button variant="danger" onClick={() => setRelieveOpen(true)}>
              Relieve
            </Button>
          ) : (
            <Button variant="primary" onClick={handleReinstate} disabled={busy}>
              Reinstate
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 p-6 space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STATUS_BADGE[member.status])}>
              {member.status}
            </span>
            <span className="text-xs text-slate-500 capitalize">{member.staff_type.replace('_', '-')}</span>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" /> {member.department?.name ?? '—'}
            </div>
            {member.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" /> {member.email}
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" /> {member.phone}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" /> Joined {member.date_of_joining?.slice(0, 10)}
            </div>
          </div>

          {member.staff_type === 'teaching' && (
            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">LMS Login</div>
              {member.lms_sync_status === 'synced' ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Synced
                </span>
              ) : member.lms_sync_error ? (
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <XCircle className="h-3.5 w-3.5" /> Sync failed
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{member.lms_sync_error}</p>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  <Clock className="h-3.5 w-3.5" /> Pending
                </span>
              )}
            </div>
          )}

          {member.status !== 'active' && (
            <div className="pt-3 border-t border-slate-100 text-sm text-slate-500">
              {member.status_reason && <p>Reason: {member.status_reason}</p>}
              {member.relieved_on && <p>Relieved on: {member.relieved_on.slice(0, 10)}</p>}
            </div>
          )}
        </Card>

        <Card className="border-slate-200 p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Leave Balances ({new Date().getFullYear()})</h2>
            <Link to="/staff/leave-applications/new" state={{ staffId }} className="text-sm text-[#008BE9] hover:underline">
              Apply leave
            </Link>
          </div>
          {balances.length === 0 ? (
            <p className="text-sm text-slate-500">
              No balances yet.{' '}
              <Link to="/staff/leave-balances" className="text-[#008BE9] hover:underline">
                Run the leave sync
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-2">
              {balances.map((b) => (
                <div key={b.balance_id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{b.leave_type?.name}</span>
                  <span className="text-slate-500">
                    {Number(b.allocated_days) - Number(b.used_days)} / {b.allocated_days} days left
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="border-slate-200 p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Salary</h2>
            <Button variant="secondary" size="sm" onClick={() => setSalaryOpen(true)}>
              Set Salary
            </Button>
          </div>
          {!currentStructure ? (
            <p className="text-sm text-slate-500">No salary structure set.</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Basic</span>
                <span className="font-medium text-slate-900">₹{Number(currentStructure.basic_salary).toLocaleString()}</span>
              </div>
              {Object.entries(currentStructure.allowances || {}).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-slate-600 capitalize">{k}</span>
                  <span className="text-slate-900">+ ₹{Number(v).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-semibold">
                <span>Gross</span>
                <span>
                  ₹
                  {(
                    Number(currentStructure.basic_salary) + Object.values(currentStructure.allowances || {}).reduce((s, v) => s + Number(v), 0)
                  ).toLocaleString()}
                </span>
              </div>
              {Object.entries(currentStructure.deductions || {}).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-slate-600 capitalize">{k}</span>
                  <span className="text-red-600">- ₹{Number(v).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-semibold">
                <span>Net (before leave deductions)</span>
                <span>
                  ₹
                  {(
                    Number(currentStructure.basic_salary) +
                    Object.values(currentStructure.allowances || {}).reduce((s, v) => s + Number(v), 0) -
                    Object.values(currentStructure.deductions || {}).reduce((s, v) => s + Number(v), 0)
                  ).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-400">Effective from {currentStructure.effective_from.slice(0, 10)}</p>
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={relieveOpen} onClose={() => setRelieveOpen(false)} title="Relieve Staff Member">
        <form onSubmit={handleRelieve} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <Select
              value={relieveStatus}
              onChange={(e) => setRelieveStatus(e.target.value as 'resigned' | 'terminated')}
              options={[
                { value: 'resigned', label: 'Resigned' },
                { value: 'terminated', label: 'Terminated' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Last Working Day *</label>
            <input
              type="date"
              value={relievedOn}
              onChange={(e) => setRelievedOn(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={relieveReason}
              onChange={(e) => setRelieveReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              rows={2}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setRelieveOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={busy}>
              {busy ? 'Saving...' : 'Confirm Relieve'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={salaryOpen} onClose={() => setSalaryOpen(false)} title="Set Salary Structure">
        <form onSubmit={handleSetSalary} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Basic Salary *</label>
            <input
              type="number"
              min={0}
              value={basicSalary}
              onChange={(e) => applyDefaultPf(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">HRA</label>
              <input
                type="number"
                min={0}
                value={hra}
                onChange={(e) => setHra(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">DA</label>
              <input
                type="number"
                min={0}
                value={da}
                onChange={(e) => setDa(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">PF (deduction)</label>
            <input
              type="number"
              min={0}
              value={pf}
              onChange={(e) => setPf(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <p className="text-xs text-slate-400 mt-1">Defaults to 12% of basic salary — edit if needed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Effective From *</label>
            <input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setSalaryOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
