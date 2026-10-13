import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, BedDouble, DoorOpen, Users, Wallet } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import PageHero, { type HeroHighlight } from '../../../../components/premium/PageHero';
import KpiTile from '../../../../components/premium/KpiTile';
import { ChartCard, Gauge, GroupedColumns } from '../../../../components/premium/charts';
import { humanize, rupees, toNumber } from '../../../../utils/dashboardFormat';
import { getDashboardSection } from '../../api/hostel.api';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { HostelDashboardSummary } from '../../types/hostel.types';

const ACCENT = '#d55181';

export default function DashboardPage() {
  const [summary, setSummary] = useState<HostelDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);
  const hasLoaded = useRef(false);

  const load = useCallback(() => {
    setIsFetching(true);
    setError(null);
    // The summary section's response already matches HostelDashboardSummary.
    getDashboardSection('summary')
      .then((result) => {
        setSummary(result.data as unknown as HostelDashboardSummary);
        setUpdatedAt(Date.now());
      })
      .catch((err) => {
        setError(isAuthError(err) ? 'You can’t view this dashboard.' : getApiErrorMessage(err, 'Failed to load dashboard'));
      })
      .finally(() => {
        setIsLoading(false);
        setIsFetching(false);
      });
  }, []);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    load();
  }, [load]);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!summary) return null;

  const { occupancy, gate, complaints, fees, mess } = summary;

  const highlights: HeroHighlight[] = [];
  if (gate.overdue_passes > 0) {
    highlights.push({ icon: AlertTriangle, label: `${gate.overdue_passes} overdue gate pass${gate.overdue_passes === 1 ? '' : 'es'}` });
  } else if (complaints.urgent > 0) {
    highlights.push({ icon: AlertTriangle, label: `${complaints.urgent} urgent complaint${complaints.urgent === 1 ? '' : 's'}` });
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Hostel"
        title="Hostel"
        subtitle="Where the hostel stands right now"
        highlights={highlights}
        updatedAt={updatedAt}
        refreshing={isFetching}
        onRefresh={load}
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Occupancy"
          value={`${occupancy.occupancy_percentage}%`}
          icon={BedDouble}
          hint={`${occupancy.occupied_places} of ${occupancy.total_capacity} places`}
          accent={ACCENT}
        />
        <KpiTile
          label="Active residents"
          value={occupancy.residents.active}
          icon={Users}
          hint={`${occupancy.residents.total_residents} total`}
          accent={ACCENT}
        />
        <KpiTile
          label="Overdue gate passes"
          value={gate.overdue_passes}
          icon={DoorOpen}
          hint={`${gate.currently_out} currently out`}
          accent={ACCENT}
        />
        <KpiTile
          label="Fees outstanding"
          value={rupees(fees.outstanding)}
          icon={Wallet}
          hint={`${fees.overdue_invoices} overdue invoice${fees.overdue_invoices === 1 ? '' : 's'}`}
          accent={ACCENT}
        />
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <ChartCard
          title="Occupancy & fees"
          subtitle={`${occupancy.residents.active} active residents`}
          icon={BedDouble}
          className="lg:col-span-5"
        >
          <div className="grid grid-cols-2 gap-3">
            <Gauge
              label="Bed occupancy"
              value={occupancy.occupied_places}
              max={occupancy.total_capacity}
              caption={`${occupancy.vacant_places} places vacant`}
              color="#d55181"
            />
            <Gauge
              label="Fees collected"
              value={toNumber(fees.total_paid)}
              max={toNumber(fees.total_due)}
              caption={`${rupees(fees.outstanding)} outstanding`}
              color="#008BE9"
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Mess today"
          subtitle={`${mess.opted_in} opted in · ${mess.opted_out} opted out`}
          icon={Users}
          className="lg:col-span-7"
          style={{ animationDelay: '50ms' }}
        >
          <GroupedColumns
            rows={mess.by_meal.map((m) => ({
              label: humanize(m.meal_type),
              expected: m.expected_meals,
              opted_in: m.opted_in,
              opted_out: m.opted_out,
            }))}
            series={[
              { key: 'expected', name: 'Expected' },
              { key: 'opted_in', name: 'Opted in' },
              { key: 'opted_out', name: 'Opted out' },
            ]}
            height={260}
            showValues
          />
        </ChartCard>
      </div>
    </div>
  );
}
