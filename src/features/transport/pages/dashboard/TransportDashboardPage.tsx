import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bus,
  IndianRupee,
  Route,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import ModuleSectionCards from '../../../../components/dashboard/ModuleSectionCards';
import { ChartCard, DonutChart, Leaderboard } from '../../../../components/premium/charts';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import { navItems } from '../../../../layouts/navConfig';
import { getTransportDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportDashboardSummary } from '../../types/dashboard.types';
import { humanize, rupees } from '../../../../utils/dashboardFormat';

const TRANSPORT_SECTIONS = (navItems.find((item) => item.path === '/transport')?.children ?? []).filter(
  (child) => child.path !== '/transport',
);

const ALERT_LABEL: Record<string, string> = {
  route_deviation: 'Route deviation',
  speed_violation: 'Speed violation',
  stop_delay: 'Stop delay',
  sos: 'SOS',
};

const ACCENT = '#0891b2';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

// Entrance stagger — capped so late cards don't wait noticeably.
const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

export default function TransportDashboardPage() {
  const [summary, setSummary] = useState<TransportDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setSummary(await getTransportDashboardSummary());
      setUpdatedAt(Date.now());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the transport dashboard'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void load();
  }, [load]);

  if (loading) return <DashboardSkeleton />;
  if (error || !summary) return <ErrorState message={error ?? 'No dashboard data available.'} onRetry={() => load()} />;

  const { totals, drivers, fees, alerts, recent_alerts } = summary;

  const kpis = [
    {
      label: 'Active vehicles',
      value: `${totals.active_vehicles} / ${totals.vehicles}`,
      icon: Bus,
      hint: `${totals.maintenance_due} due for maintenance`,
      accent: ACCENT,
    },
    {
      label: 'Routes',
      value: totals.routes,
      icon: Route,
      accent: ACCENT,
    },
    {
      label: 'Active passengers',
      value: `${totals.active_passengers} / ${totals.passengers}`,
      icon: UserPlus,
      accent: ACCENT,
    },
    {
      label: 'Fees collected',
      value: rupees(fees.collection_in_range),
      icon: IndianRupee,
      hint: `${fees.payments_in_range} payment${fees.payments_in_range === 1 ? '' : 's'}`,
      accent: ACCENT,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Module"
        title="Transport"
        subtitle="Fleet, routes, drivers and passengers at a glance"
        highlights={[{ icon: AlertTriangle, label: `${alerts.unresolved} unresolved alert${alerts.unresolved === 1 ? '' : 's'}` }]}
        updatedAt={updatedAt}
        refreshing={refreshing}
        onRefresh={() => load(true)}
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KpiTile key={kpi.label} {...kpi} style={stagger(index)} />
        ))}
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <ChartCard
          title="Drivers by status"
          subtitle={`${drivers.active} active · ${drivers.on_leave} on leave`}
          icon={ShieldAlert}
          className="lg:col-span-5"
        >
          <DonutChart totalLabel="drivers" rows={drivers.by_status.map((d) => ({ label: humanize(d.status), value: d.count }))} />
        </ChartCard>

        <ChartCard
          title="Alerts by type"
          subtitle={`${alerts.unresolved} unresolved`}
          icon={AlertTriangle}
          className="lg:col-span-7"
          style={stagger(1)}
        >
          <Leaderboard rows={alerts.by_type.map((a) => ({ label: humanize(a.type), value: a.count }))} />
        </ChartCard>
      </div>

      <ChartCard title="Open geofence alerts" subtitle="Most recent first" icon={AlertTriangle} className="lg:col-span-12">
        <div className="mb-3 flex justify-end">
          <Link to="/transport/tracking" className="text-sm font-medium text-brand hover:text-brand-navy">
            View all
          </Link>
        </div>
        {recent_alerts.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No open alerts.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent_alerts.map((alert) => (
              <li key={alert.alert_id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{alert.registration_number}</p>
                  <p className="truncate text-xs text-slate-500">{formatDateTime(alert.triggered_at)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  {ALERT_LABEL[alert.alert_type] ?? alert.alert_type}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ChartCard>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick links</h2>
        <ModuleSectionCards sections={TRANSPORT_SECTIONS} />
      </div>
    </div>
  );
}
