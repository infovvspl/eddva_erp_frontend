import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  ClipboardCheck,
  Clock,
  IndianRupee,
  UserCheck,
  Archive,
  Gauge as GaugeIcon,
  MapPin,
  Folder,
  Truck,
  BellRing,
} from 'lucide-react';
import Input from '../../../../components/ui/Input';
import ErrorState from '../../../../components/feedback/ErrorState';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import SectionHeading from '../../../../components/premium/SectionHeading';
import { ChartCard, Gauge, StockTreemap } from '../../../../components/premium/charts';
import RankedBarList from '../../components/dashboard/RankedBarList';
import { getDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryDashboardSummary } from '../../types/dashboard.types';
import { rupees } from '../../../../utils/dashboardFormat';

const ASSET_STATUS_COLOR: Record<string, string> = {
  in_store: '#22c55e',
  issued: '#008BE9',
  under_repair: '#f59e0b',
  disposed: '#94a3b8',
  lost: '#ef4444',
};

const ACCENT = '#15936a';

// Entrance stagger — capped so late cards don't wait noticeably.
const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

export default function InventoryDashboardPage() {
  const [summary, setSummary] = useState<InventoryDashboardSummary | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);

  const load = useCallback(async (isRefresh: boolean) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await getDashboardSummary({ from: from || undefined, to: to || undefined });
      setSummary(data);
      setUpdatedAt(Date.now());
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [from, to]);

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => load(false)} />;
  }

  if (!summary) {
    return <ErrorState message="No dashboard data available." onRetry={() => load(false)} />;
  }

  const categoryConsumption = summary.category_wise_consumption.map((c) => ({ label: c.category, count: c.issue_count }));
  const assetsByStatus = summary.assets.by_status.map((s) => ({
    label: s.status.replace('_', ' '),
    count: s.count,
    color: ASSET_STATUS_COLOR[s.status] ?? '#94a3b8',
  }));

  const kpis = [
    {
      label: 'Stock valuation',
      value: rupees(summary.stock_valuation),
      icon: IndianRupee,
      hint: `${summary.total_items} items tracked`,
      accent: ACCENT,
    },
    {
      label: 'Total items',
      value: summary.total_items,
      icon: Package,
      hint: 'Tracked across locations',
      accent: ACCENT,
    },
    {
      label: 'Low-stock items',
      value: summary.low_stock_items,
      icon: AlertTriangle,
      hint: summary.low_stock_items > 0 ? 'Needs reordering' : 'All stocked up',
      accent: ACCENT,
    },
    {
      label: 'Overdue returns',
      value: summary.overdue_returns,
      icon: Clock,
      hint: summary.overdue_returns > 0 ? 'Awaiting return' : 'Nothing overdue',
      accent: ACCENT,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Inventory"
        title="Inventory Overview"
        subtitle="Stock levels, issues, assets, and valuation at a glance"
        highlights={[
          { icon: AlertTriangle, label: `${summary.low_stock_items} low-stock item${summary.low_stock_items === 1 ? '' : 's'}` },
          { icon: Clock, label: `${summary.overdue_returns} overdue return${summary.overdue_returns === 1 ? '' : 's'}` },
          { icon: ClipboardCheck, label: `${summary.todays_issues} issue${summary.todays_issues === 1 ? '' : 's'} today` },
        ]}
        updatedAt={updatedAt}
        refreshing={refreshing}
        onRefresh={() => load(true)}
      />

      <div className="flex items-center justify-between">
        <div className="grid flex-1 grid-cols-2 gap-4 xl:grid-cols-4">
          {kpis.map((kpi, index) => (
            <KpiTile key={kpi.label} {...kpi} style={stagger(index)} />
          ))}
        </div>
      </div>

      <Link
        to="/inventory/alerts"
        className="inline-flex w-fit items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
      >
        <BellRing className="h-4 w-4" />
        View Alerts
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <SectionHeading eyebrow="Stock" title="Distribution & asset utilisation" />

        <ChartCard
          title="Stock by location"
          subtitle={`${summary.total_items} items across ${summary.stock_by_location.length} location${summary.stock_by_location.length === 1 ? '' : 's'}`}
          icon={MapPin}
          className="lg:col-span-7"
          style={stagger(0)}
        >
          <StockTreemap
            rows={[...summary.stock_by_location]
              .sort((a, b) => b.quantity - a.quantity)
              .map((l) => ({ label: l.location, value: l.quantity }))}
          />
        </ChartCard>

        <ChartCard
          title="Asset utilisation"
          subtitle={`${summary.assets.issued} of ${summary.assets.total} assets issued`}
          icon={GaugeIcon}
          className="lg:col-span-5"
          style={stagger(1)}
        >
          <div className="flex flex-col gap-3">
            <Gauge
              label="Asset utilisation"
              value={summary.assets.issued}
              max={summary.assets.total}
              caption={`${summary.assets.issued} of ${summary.assets.total} issued · ${summary.assets.idle} idle`}
              color={ACCENT}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Archive className="h-3.5 w-3.5" /> Total
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900 tabular-nums">{summary.assets.total}</p>
              </div>
              <div className="rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <UserCheck className="h-3.5 w-3.5" /> Issued
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900 tabular-nums">{summary.assets.issued}</p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold text-slate-700">By status</h3>
              <RankedBarList items={assetsByStatus} emptyText="No asset units yet." />
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <SectionHeading eyebrow="Movement" title="Consumption & purchasing" />

        <ChartCard
          title="Category-wise consumption"
          subtitle="Issues recorded by category"
          icon={Folder}
          className="lg:col-span-5"
          style={stagger(2)}
        >
          <RankedBarList items={categoryConsumption} emptyText="No issues recorded yet." />
        </ChartCard>

        <ChartCard
          title="Vendor-wise purchases"
          subtitle="Filter purchases by date range"
          icon={Truck}
          className="lg:col-span-7"
          style={stagger(3)}
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-500">From</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-500">To</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>

          {summary.vendor_wise_purchases.length === 0 ? (
            <div className="py-4 text-center text-sm text-slate-400">No purchases in this range.</div>
          ) : (
            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Vendor</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Purchases</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.vendor_wise_purchases.map((v) => (
                    <tr key={v.vendor_id} className="border-b border-slate-100">
                      <td className="px-4 py-2 text-sm text-slate-900">{v.vendor}</td>
                      <td className="px-4 py-2 text-sm text-slate-600">{v.purchase_count}</td>
                      <td className="px-4 py-2 text-sm font-medium text-slate-900">{rupees(v.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
