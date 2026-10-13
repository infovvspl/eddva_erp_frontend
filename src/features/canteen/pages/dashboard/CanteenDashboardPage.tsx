import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, IndianRupee, PlayCircle, Receipt, Users, Wallet } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import { ChartCard, Leaderboard } from '../../../../components/premium/charts';
import ModuleSectionCards from '../../../../components/dashboard/ModuleSectionCards';
import { navItems } from '../../../../layouts/navConfig';
import { getCanteenDashboardSummary } from '../../api/canteen.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { CanteenDashboardSummary } from '../../types/canteen.types';
import { rupees } from '../../../../utils/dashboardFormat';
import { formatDateTime } from '../../../../utils/formatDate';

const CANTEEN_SECTIONS = (navItems.find((item) => item.path === '/canteen')?.children ?? []).filter(
  (child) => child.path !== '/canteen',
);

const ACCENT = '#c98500';

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PENDING: 'bg-amber-100 text-amber-700',
};

// Entrance stagger — capped so late cards don't wait noticeably.
const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

export default function CanteenDashboardPage() {
  const [summary, setSummary] = useState<CanteenDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);

  const load = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setSummary(await getCanteenDashboardSummary());
      setUpdatedAt(Date.now());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the canteen dashboard'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void load(false);
  }, [load]);

  if (loading) return <DashboardSkeleton />;
  if (error || !summary) return <ErrorState message={error ?? 'No dashboard data available.'} onRetry={() => load(false)} />;

  const { totals, top_items_today, recent_orders } = summary;

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Canteen"
        title="Canteen dashboard"
        subtitle="Orders, wallets and POS shifts at a glance"
        highlights={[{ icon: PlayCircle, label: `${totals.open_shifts} open POS shift${totals.open_shifts === 1 ? '' : 's'}` }]}
        updatedAt={updatedAt}
        refreshing={refreshing}
        onRefresh={() => load(true)}
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <KpiTile label="Orders today" value={totals.orders_today} icon={Receipt} accent={ACCENT} style={stagger(0)} />
        <KpiTile label="Revenue today" value={rupees(totals.revenue_today)} icon={IndianRupee} accent={ACCENT} style={stagger(1)} />
        <KpiTile
          label="Wallet balance (total)"
          value={rupees(totals.wallet_balance_total)}
          icon={Wallet}
          hint={`${totals.active_members} members`}
          accent={ACCENT}
          style={stagger(2)}
        />
        <KpiTile label="Unpaid orders" value={totals.unpaid_orders} icon={ClipboardList} accent={ACCENT} style={stagger(3)} />
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <ChartCard title="Top items today" subtitle="By quantity sold" icon={Users} className="lg:col-span-5" style={stagger(4)}>
          <Leaderboard rows={top_items_today.map((i) => ({ label: i.name, value: i.quantity_sold }))} />
        </ChartCard>

        <ChartCard title="Recent orders" subtitle="Latest activity" icon={Receipt} className="lg:col-span-7" style={stagger(5)}>
          {recent_orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No orders recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent_orders.map((o) => (
                <li key={o.order_id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{o.order_number}</p>
                    <p className="truncate text-xs text-slate-500">
                      {o.member_name ?? 'Walk-in'} · {formatDateTime(o.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">{rupees(o.total_amount)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[o.status] ?? STATUS_STYLE.PENDING}`}>
                      {o.status.toLowerCase()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick links</h2>
        <ModuleSectionCards sections={CANTEEN_SECTIONS} />
      </div>
    </div>
  );
}
