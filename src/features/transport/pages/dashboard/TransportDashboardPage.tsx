import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bus,
  Contact,
  IndianRupee,
  Route,
  ShieldAlert,
  UserPlus,
  Wrench,
} from 'lucide-react';
import Card from '../../../../components/ui/Card';
import LoadingState from '../../../../components/feedback/LoadingState';
import ErrorState from '../../../../components/feedback/ErrorState';
import StatCard from '../../../../components/dashboard/StatCard';
import ModuleSectionCards from '../../../../components/dashboard/ModuleSectionCards';
import { navItems } from '../../../../layouts/navConfig';
import { getTransportDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportDashboardSummary } from '../../types/dashboard.types';

const TRANSPORT_SECTIONS = (navItems.find((item) => item.path === '/transport')?.children ?? []).filter(
  (child) => child.path !== '/transport',
);

const ALERT_LABEL: Record<string, string> = {
  route_deviation: 'Route deviation',
  speed_violation: 'Speed violation',
  stop_delay: 'Stop delay',
  sos: 'SOS',
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

function formatRupees(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function TransportDashboardPage() {
  const [summary, setSummary] = useState<TransportDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await getTransportDashboardSummary());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the transport dashboard'));
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

  const { totals, fees, recent_alerts } = summary;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bus className="h-7 w-7 text-[#008BE9]" />
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Transport</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active vehicles" value={`${totals.active_vehicles} / ${totals.vehicles}`} icon={Bus} />
        <StatCard label="Routes" value={totals.routes} icon={Route} color="blue" />
        <StatCard label="Active drivers" value={`${totals.active_drivers} / ${totals.drivers}`} icon={Contact} color="purple" />
        <StatCard
          label="Licenses expiring soon"
          value={totals.licenses_expiring_soon}
          icon={ShieldAlert}
          color={totals.licenses_expiring_soon > 0 ? 'amber' : 'slate'}
        />
        <StatCard label="Active passengers" value={`${totals.active_passengers} / ${totals.passengers}`} icon={UserPlus} color="purple" />
        <StatCard label="Open alerts" value={totals.open_alerts} icon={AlertTriangle} color={totals.open_alerts > 0 ? 'red' : 'slate'} />
        <StatCard label="Maintenance due" value={totals.maintenance_due} icon={Wrench} color={totals.maintenance_due > 0 ? 'amber' : 'slate'} />
        <StatCard label="Fees collected this month" value={formatRupees(fees.collected_this_month)} icon={IndianRupee} color="green" />
        <StatCard label="Active fee subscriptions" value={fees.active_subscriptions} icon={IndianRupee} color="blue" />
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <AlertTriangle className="h-5 w-5 text-[#008BE9]" />
              Open geofence alerts
            </h2>
            <Link to="/transport/tracking" className="text-sm font-medium text-[#008BE9] hover:text-[#002C6D]">
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
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick links</h2>
        <ModuleSectionCards sections={TRANSPORT_SECTIONS} />
      </div>
    </div>
  );
}
