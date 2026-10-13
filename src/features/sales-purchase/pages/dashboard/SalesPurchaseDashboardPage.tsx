import { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  Building2,
  Handshake,
  Package,
  PieChart as PieIcon,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { getApiErrorMessage } from '../../utils/errors';
import { getDashboardSummary } from '../../api/sales-purchase.api';
import ErrorState from '../../../../components/feedback/ErrorState';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import PageHero from '../../../../components/premium/PageHero';
import KpiTile from '../../../../components/premium/KpiTile';
import { ChartCard, DonutChart, GroupedColumns, Leaderboard } from '../../../../components/premium/charts';
import type { DashboardSummary } from '../../types/sales-purchase.types';
import { compactRupees, humanize, rupees } from '../../../../utils/dashboardFormat';

// Entrance stagger — capped so late cards don't wait noticeably.
const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

function rangeLabel(range?: DashboardSummary['range']): string {
  if (!range?.from && !range?.to) return 'All time';
  return `${range.from ? new Date(range.from).toLocaleDateString('en-IN') : '…'} – ${
    range.to ? new Date(range.to).toLocaleDateString('en-IN') : 'today'
  }`;
}

export default function SalesPurchaseDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await getDashboardSummary();
      setSummary(data);
      setUpdatedAt(Date.now());
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={() => loadData()} />;
  if (!summary) return null;

  const kpis = [
    {
      label: 'Sales invoiced',
      value: rupees(summary.sales.invoices.period_grand_total),
      icon: TrendingUp,
      hint: `${rupees(summary.sales.invoices.outstanding_amount)} receivable`,
      accent: '#1f8fe6',
    },
    {
      label: 'Purchases invoiced',
      value: rupees(summary.purchase.invoices.period_grand_total),
      icon: ShoppingCart,
      hint: `${rupees(summary.purchase.invoices.outstanding_amount)} payable`,
      accent: '#e66a36',
    },
    {
      label: 'Outstanding receivable',
      value: rupees(summary.sales.invoices.outstanding_amount),
      icon: Handshake,
      hint: `${summary.sales.invoices.outstanding_count} invoice${summary.sales.invoices.outstanding_count === 1 ? '' : 's'}`,
      accent: '#eb6834',
    },
    {
      label: 'Outstanding payable',
      value: rupees(summary.purchase.invoices.outstanding_amount),
      icon: Truck,
      hint: `${summary.purchase.invoices.outstanding_count} invoice${summary.purchase.invoices.outstanding_count === 1 ? '' : 's'}`,
      accent: '#eb6834',
    },
  ];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Sales & Purchase"
        title="Sales & Purchase dashboard"
        subtitle="Overview of purchase and sales activity"
        highlights={[
          { icon: Building2, label: `${summary.vendor_count} vendors` },
          { icon: Users, label: `${summary.customer_count} customers` },
          { icon: Package, label: `${summary.active_item_count} active items` },
        ]}
        updatedAt={updatedAt}
        refreshing={refreshing}
        onRefresh={() => loadData(true)}
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KpiTile key={kpi.label} {...kpi} style={stagger(index)} />
        ))}
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <ChartCard
          tone="dark"
          title="Sales vs purchase"
          subtitle={`Invoice value · ${rangeLabel(summary.range)}`}
          icon={BarChart3}
          className="lg:col-span-7"
        >
          <div className="mb-4 grid grid-cols-2 gap-3">
            {[
              { name: 'Sales', total: summary.sales.invoices.period_grand_total, count: summary.sales.invoices.period_count, color: '#1f8fe6' },
              { name: 'Purchase', total: summary.purchase.invoices.period_grand_total, count: summary.purchase.invoices.period_count, color: '#e66a36' },
            ].map((s) => (
              <div key={s.name} className="rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
                <p className="flex items-center gap-1.5 text-xs text-sky-100/75">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{rupees(s.total)}</p>
                <p className="text-[11px] text-sky-100/60">{s.count} invoices</p>
              </div>
            ))}
          </div>
          <GroupedColumns
            tone="dark"
            rows={[
              { label: 'Invoiced', sales: summary.sales.invoices.period_grand_total, purchase: summary.purchase.invoices.period_grand_total },
              { label: 'Tax', sales: summary.sales.invoices.period_tax, purchase: summary.purchase.invoices.period_tax },
              { label: 'Outstanding', sales: summary.sales.invoices.outstanding_amount, purchase: summary.purchase.invoices.outstanding_amount },
              { label: 'Overdue', sales: summary.sales.invoices.overdue_amount, purchase: summary.purchase.invoices.overdue_amount },
            ]}
            series={[
              { key: 'sales', name: 'Sales' },
              { key: 'purchase', name: 'Purchase' },
            ]}
            format={compactRupees}
            height={230}
          />
        </ChartCard>

        <ChartCard title="Orders by status" subtitle="Sales and purchase orders" icon={PieIcon} className="lg:col-span-5" style={stagger(1)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Sales</p>
              <DonutChart
                totalLabel="orders"
                rows={summary.sales.sales_orders.by_status.map((s) => ({ label: humanize(s.status), value: s.count }))}
              />
            </div>
            <div>
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Purchase</p>
              <DonutChart
                totalLabel="orders"
                rows={summary.purchase.purchase_orders.by_status.map((s) => ({ label: humanize(s.status), value: s.count }))}
              />
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Top customers" subtitle={`By invoice value · ${summary.customer_count} customers`} icon={Handshake} className="lg:col-span-6">
          <Leaderboard
            format={rupees}
            rows={summary.sales.top_customers.map((c) => ({
              label: c.customer_name,
              value: c.total_amount,
              detail: `${c.customer_code} · ${c.invoice_count} invoice${c.invoice_count === 1 ? '' : 's'}`,
            }))}
          />
        </ChartCard>
        <ChartCard title="Top vendors" subtitle={`By invoice value · ${summary.vendor_count} vendors`} icon={Truck} className="lg:col-span-6" style={stagger(1)}>
          <Leaderboard
            format={rupees}
            rows={summary.purchase.top_vendors.map((v) => ({
              label: v.vendor_name,
              value: v.total_amount,
              detail: `${v.vendor_code} · ${v.invoice_count} invoice${v.invoice_count === 1 ? '' : 's'}`,
            }))}
          />
        </ChartCard>
      </div>
    </div>
  );
}
