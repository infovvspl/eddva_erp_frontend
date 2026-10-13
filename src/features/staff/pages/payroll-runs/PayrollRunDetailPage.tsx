import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getPayrollRun, finalizePayrollRun, payPayrollRun } from '../../api/staff.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { cn } from '../../../../utils/cn';
import type { PayrollRun } from '../../types/staff.types';

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-700',
  finalized: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PayrollRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const runId = Number(id);

  const [run, setRun] = useState<PayrollRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRun(await getPayrollRun(runId));
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load payroll run'));
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFinalize() {
    if (!confirm('Finalize this payroll run? It will be locked from further edits.')) return;
    try {
      setBusy(true);
      await finalizePayrollRun(runId);
      await load();
    } catch (err: any) {
      alert(getApiErrorMessage(err, 'Failed to finalize payroll run'));
    } finally {
      setBusy(false);
    }
  }

  async function handlePay() {
    if (!confirm('Mark this payroll run as paid? This posts each payslip to the ledger and cannot be undone.')) return;
    try {
      setBusy(true);
      await payPayrollRun(runId);
      await load();
    } catch (err: any) {
      alert(getApiErrorMessage(err, 'Failed to mark payroll run paid'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (error || !run) return <div className="p-8 text-center text-red-500">{error || 'Payroll run not found'}</div>;

  const totals = (run.payslips || []).reduce(
    (acc, p) => ({
      gross: acc.gross + Number(p.gross_salary),
      lop: acc.lop + Number(p.lop_amount),
      net: acc.net + Number(p.net_salary),
    }),
    { gross: 0, lop: 0, net: 0 }
  );

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/staff/payroll-runs')} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Payroll Runs
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {MONTH_NAMES[run.month - 1]} {run.year} Payroll
          </h1>
          <span className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize mt-2', STATUS_BADGE[run.status])}>
            {run.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {run.status === 'draft' && (
            <Button variant="primary" onClick={handleFinalize} disabled={busy}>
              Finalize
            </Button>
          )}
          {run.status === 'finalized' && (
            <Button variant="primary" onClick={handlePay} disabled={busy}>
              Mark Paid &amp; Post to Ledger
            </Button>
          )}
        </div>
      </div>

      {run.skipped && run.skipped.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
          {run.skipped.length} staff member(s) skipped — no salary structure in force for this month.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 p-4">
          <div className="text-sm text-slate-500">Total Gross</div>
          <div className="text-xl font-bold text-slate-900">₹{totals.gross.toLocaleString()}</div>
        </Card>
        <Card className="border-slate-200 p-4">
          <div className="text-sm text-slate-500">Total Loss of Pay</div>
          <div className="text-xl font-bold text-red-600">₹{totals.lop.toLocaleString()}</div>
        </Card>
        <Card className="border-slate-200 p-4">
          <div className="text-sm text-slate-500">Total Net</div>
          <div className="text-xl font-bold text-green-700">₹{totals.net.toLocaleString()}</div>
        </Card>
      </div>

      <Card className="border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Staff</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Gross</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">LOP Days</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">LOP Amount</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {(run.payslips || []).map((p) => (
                <tr key={p.payslip_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-900">{p.staff?.full_name ?? p.staff_id}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 text-right">₹{Number(p.gross_salary).toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 text-right">{p.lop_days}</td>
                  <td className="py-3 px-4 text-sm text-red-600 text-right">₹{Number(p.lop_amount).toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-900 text-right">₹{Number(p.net_salary).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
