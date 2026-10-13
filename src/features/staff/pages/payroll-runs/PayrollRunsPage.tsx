import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import { getPayrollRuns, generatePayrollRun } from '../../api/staff.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { cn } from '../../../../utils/cn';
import type { PayrollRun } from '../../types/staff.types';

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-700',
  finalized: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PayrollRunsPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setRuns(await getPayrollRuns());
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load payroll runs'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError(null);
      const run = await generatePayrollRun({ month, year });
      setModalOpen(false);
      window.location.href = `/staff/payroll-runs/${run.run_id}`;
    } catch (err: any) {
      setFormError(getApiErrorMessage(err, 'Failed to generate payroll run'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Runs</h1>
          <p className="text-slate-600 mt-1">Monthly payslip generation, with Loss-of-Pay from approved unpaid leave</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Payroll Run
        </Button>
      </div>

      <Card className="border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Period</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Generated</th>
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      No payroll runs yet.
                    </td>
                  </tr>
                ) : (
                  runs.map((r) => (
                    <tr key={r.run_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <Link to={`/staff/payroll-runs/${r.run_id}`} className="font-medium text-slate-900 hover:text-[#008BE9]">
                          {MONTH_NAMES[r.month - 1]} {r.year}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize', STATUS_BADGE[r.status])}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{r.generated_at?.slice(0, 10)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Generate Payroll Run">
        <form onSubmit={handleGenerate} className="space-y-4">
          {formError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Month *</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Creates one payslip per active staff member with a salary structure in force that month. Staff without one are skipped.
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
