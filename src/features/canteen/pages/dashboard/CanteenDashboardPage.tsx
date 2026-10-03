import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, IndianRupee, PlayCircle, Receipt, TrendingUp, UserPlus, Utensils, Wallet } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import LoadingState from '../../../../components/feedback/LoadingState';
import ErrorState from '../../../../components/feedback/ErrorState';
import StatCard from '../../../../components/dashboard/StatCard';
import ModuleSectionCards from '../../../../components/dashboard/ModuleSectionCards';
import { navItems } from '../../../../layouts/navConfig';
import { getCanteenDashboardSummary } from '../../api/canteen.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { CanteenDashboardSummary } from '../../types/canteen.types';

const CANTEEN_SECTIONS = (navItems.find((item) => item.path === '/canteen')?.children ?? []).filter(
  (child) => child.path !== '/canteen',
);

const STATUS_STYLE: Record<string, string> = {
  PLACED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-slate-200 text-slate-700',
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function formatRupees(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function CanteenDashboardPage() {
  const [summary, setSummary] = useState<CanteenDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await getCanteenDashboardSummary());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the canteen dashboard'));
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

  const { totals, top_items_today, recent_orders } = summary;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Utensils className="h-7 w-7 text-[#008BE9]" />
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Canteen</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Orders today" value={totals.orders_today} icon={Receipt} />
        <StatCard label="Revenue today" value={formatRupees(totals.revenue_today)} icon={IndianRupee} color="green" />
        <StatCard label="Unpaid orders" value={totals.unpaid_orders} icon={ClipboardList} color={totals.unpaid_orders > 0 ? 'amber' : 'slate'} />
        <StatCard label="Active members" value={totals.active_members} icon={UserPlus} color="purple" />
        <StatCard label="Open shifts" value={totals.open_shifts} icon={PlayCircle} color="blue" />
        <StatCard label="Wallet balance (total)" value={formatRupees(totals.wallet_balance_total)} icon={Wallet} color="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <TrendingUp className="h-5 w-5 text-[#008BE9]" />
                Top items today
              </h2>
              <Link to="/canteen/reports" className="text-sm font-medium text-[#008BE9] hover:text-[#002C6D]">
                View all
              </Link>
            </div>
            {top_items_today.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No sales recorded yet today.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {top_items_today.map((item) => (
                  <li key={item.item_id} className="flex items-center justify-between gap-3 py-3">
                    <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                    <span className="shrink-0 text-sm font-semibold text-slate-600">{item.quantity_sold} sold</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card className="border-slate-200">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Receipt className="h-5 w-5 text-[#008BE9]" />
                Recent orders
              </h2>
              <Link to="/canteen/orders" className="text-sm font-medium text-[#008BE9] hover:text-[#002C6D]">
                View all
              </Link>
            </div>
            {recent_orders.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No orders placed yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent_orders.map((order) => (
                  <li key={order.order_id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{order.order_number}</p>
                      <p className="truncate text-xs text-slate-500">
                        {order.member_name ?? 'Walk-in'} · {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{formatRupees(order.total_amount)}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[order.status] ?? STATUS_STYLE.CANCELLED}`}
                      >
                        {order.status.toLowerCase()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick links</h2>
        <ModuleSectionCards sections={CANTEEN_SECTIONS} />
      </div>
    </div>
  );
}
