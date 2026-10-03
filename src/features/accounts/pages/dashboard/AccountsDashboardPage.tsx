import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, Calendar, FileClock, IndianRupee, Landmark, Receipt, Wallet } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import LoadingState from '../../../../components/feedback/LoadingState';
import ErrorState from '../../../../components/feedback/ErrorState';
import StatCard from '../../../../components/dashboard/StatCard';
import ModuleSectionCards from '../../../../components/dashboard/ModuleSectionCards';
import { navItems } from '../../../../layouts/navConfig';
import { getAccountsDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { AccountsDashboardSummary } from '../../types/dashboard.types';

const ACCOUNTS_SECTIONS = (navItems.find((item) => item.path === '/accounts')?.children ?? []).filter(
  (child) => child.path !== '/accounts',
);

const STATUS_STYLE: Record<string, string> = {
  DRAFT: 'bg-slate-200 text-slate-700',
  POSTED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function formatRupees(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function AccountsDashboardPage() {
  const [summary, setSummary] = useState<AccountsDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await getAccountsDashboardSummary());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the accounts dashboard'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void load();
  }, [load]);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error || !summary) return <ErrorState message={error ?? 'No dashboard data available.'} onRetry={load} />;

  const { open_financial_year, totals, recent_vouchers } = summary;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Wallet className="h-7 w-7 text-[#008BE9]" />
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Accounts</h1>
        </div>
        {open_financial_year ? (
          <span className="flex items-center gap-1.5 rounded-full bg-[#008BE9]/10 px-3 py-1 text-sm font-medium text-[#002C6D]">
            <Calendar className="h-4 w-4" />
            FY {open_financial_year}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            <Calendar className="h-4 w-4" />
            No open financial year
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Cash balance" value={formatRupees(totals.cash_balance)} icon={IndianRupee} color="green" />
        <StatCard label="Bank balance" value={formatRupees(totals.bank_balance)} icon={Landmark} color="green" />
        <StatCard label="Draft vouchers" value={totals.draft_vouchers} icon={FileClock} color={totals.draft_vouchers > 0 ? 'amber' : 'slate'} />
        <StatCard label="Posted this month" value={totals.posted_this_month} icon={Receipt} color="blue" />
        <StatCard label="Cancelled this month" value={totals.cancelled_this_month} icon={Ban} color={totals.cancelled_this_month > 0 ? 'red' : 'slate'} />
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Receipt className="h-5 w-5 text-[#008BE9]" />
              Recent vouchers
            </h2>
            <Link to="/accounts/vouchers" className="text-sm font-medium text-[#008BE9] hover:text-[#002C6D]">
              View all
            </Link>
          </div>
          {recent_vouchers.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No vouchers recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent_vouchers.map((v) => (
                <li key={v.voucher_id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{v.voucher_number}</p>
                    <p className="truncate text-xs text-slate-500">
                      {v.narration || 'No narration'} · {formatDate(v.voucher_date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">{formatRupees(v.total_amount)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[v.status] ?? STATUS_STYLE.DRAFT}`}>
                      {v.status.toLowerCase()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick links</h2>
        <ModuleSectionCards sections={ACCOUNTS_SECTIONS} />
      </div>
    </div>
  );
}
