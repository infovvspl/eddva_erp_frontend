import { useCallback, useEffect, useState } from 'react';
import { Ban, Calendar, FileClock, IndianRupee, Landmark, Receipt } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import ModuleSectionCards from '../../../../components/dashboard/ModuleSectionCards';
import { navItems } from '../../../../layouts/navConfig';
import { getAccountsDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { AccountsDashboardSummary } from '../../types/dashboard.types';
import PageHero from '../../../../components/premium/PageHero';
import KpiTile from '../../../../components/premium/KpiTile';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import { ChartCard } from '../../../../components/premium/charts';
import { rupees } from '../../../../utils/dashboardFormat';
import { formatDate } from '../../../../utils/formatDate';

const ACCOUNTS_SECTIONS = (navItems.find((item) => item.path === '/accounts')?.children ?? []).filter(
  (child) => child.path !== '/accounts',
);

const STATUS_STYLE: Record<string, string> = {
  DRAFT: 'bg-slate-200 text-slate-700',
  POSTED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

// Entrance stagger — capped so late cards don't wait noticeably.
const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

export default function AccountsDashboardPage() {
  const [summary, setSummary] = useState<AccountsDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await getAccountsDashboardSummary());
      setUpdatedAt(Date.now());
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

  if (loading && !summary) return <DashboardSkeleton />;
  if (error || !summary) return <ErrorState message={error ?? 'No dashboard data available.'} onRetry={load} />;

  const { open_financial_year, totals, recent_vouchers } = summary;
  const eyebrow = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={eyebrow}
        title="Accounts"
        subtitle="Ledger health, cash position, and voucher activity for this module."
        highlights={[
          {
            icon: Calendar,
            label: open_financial_year ? `FY ${open_financial_year}` : 'No open financial year',
          },
        ]}
        updatedAt={updatedAt}
        refreshing={loading}
        onRefresh={() => void load()}
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-5">
        <KpiTile label="Cash balance" value={rupees(totals.cash_balance)} icon={IndianRupee} accent="#008BE9" style={stagger(0)} />
        <KpiTile label="Bank balance" value={rupees(totals.bank_balance)} icon={Landmark} accent="#008BE9" style={stagger(1)} />
        <KpiTile label="Draft vouchers" value={totals.draft_vouchers} icon={FileClock} accent="#008BE9" style={stagger(2)} />
        <KpiTile label="Posted this month" value={totals.posted_this_month} icon={Receipt} accent="#008BE9" style={stagger(3)} />
        <KpiTile label="Cancelled this month" value={totals.cancelled_this_month} icon={Ban} accent="#008BE9" style={stagger(4)} />
      </div>

      <ChartCard title="Recent vouchers" subtitle="Latest activity across the ledger" icon={Receipt}>
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
                  <span className="text-sm font-semibold text-slate-700">{rupees(v.total_amount)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[v.status] ?? STATUS_STYLE.DRAFT}`}>
                    {v.status.toLowerCase()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ChartCard>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick links</h2>
        <ModuleSectionCards sections={ACCOUNTS_SECTIONS} />
      </div>
    </div>
  );
}
