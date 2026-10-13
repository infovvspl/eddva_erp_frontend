import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, BookCopy, BookOpen, Gauge as GaugeIcon, IndianRupee, RotateCcw } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import { ChartCard, Gauge } from '../../../../components/premium/charts';
import { rupees } from '../../../../utils/dashboardFormat';
import { formatDate } from '../../../../utils/formatDate';
import { getLibraryDashboardSummary } from '../../api/library.api';
import { getApiErrorMessage } from '../../utils/apiError';
import type { LibraryDashboardSummary } from '../../types/library.types';

const ACCENT = '#0a55a4';

const STATUS_STYLE: Record<string, string> = {
  issued: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
  returned: 'bg-green-100 text-green-700',
  lost: 'bg-slate-200 text-slate-700',
};

// Entrance stagger — capped so late cards don't wait noticeably.
const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

export default function LibraryDashboardPage() {
  const [summary, setSummary] = useState<LibraryDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      setSummary(await getLibraryDashboardSummary());
      setUpdatedAt(Date.now());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the library dashboard'));
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
  if (error || !summary) return <ErrorState message={error ?? 'No dashboard data available.'} onRetry={load} />;

  const { totals, due_soon, recent_issues } = summary;

  const kpis = [
    { label: 'Total books', value: totals.titles, icon: BookOpen, hint: `${totals.copies} copies`, accent: ACCENT },
    { label: 'Available copies', value: totals.available_copies, icon: BookCopy, hint: `of ${totals.copies} total`, accent: ACCENT },
    { label: 'Currently issued', value: totals.issued_now, icon: RotateCcw, hint: `${totals.overdue} overdue`, accent: ACCENT },
    { label: 'Pending fines', value: rupees(totals.unpaid_fines), icon: IndianRupee, accent: ACCENT },
  ];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Library"
        title="Library dashboard"
        subtitle="Catalog, circulation and fines at a glance"
        highlights={[{ icon: AlertTriangle, label: `${totals.overdue} overdue` }]}
        updatedAt={updatedAt}
        refreshing={refreshing}
        onRefresh={() => void load()}
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KpiTile key={kpi.label} {...kpi} style={stagger(index)} />
        ))}
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <ChartCard title="Copy availability" subtitle="Available vs total copies" icon={GaugeIcon} className="lg:col-span-4">
          <Gauge
            label="Available copies"
            value={totals.available_copies}
            max={totals.copies}
            caption={`${totals.available_copies} of ${totals.copies} copies`}
            color={ACCENT}
          />
        </ChartCard>

        <ChartCard title="Due soon" subtitle="Issues due in the next few days" icon={BookCopy} className="lg:col-span-4" style={stagger(1)}>
          {due_soon.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Nothing due soon.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {due_soon.map((i) => (
                <li key={i.issue_id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{i.title}</p>
                    <p className="truncate text-xs text-slate-500">{i.member_name}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">{formatDate(i.due_date)}</span>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>

        <ChartCard title="Recent issues" subtitle="Latest circulation activity" icon={RotateCcw} className="lg:col-span-4" style={stagger(2)}>
          {recent_issues.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No issues recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent_issues.map((i) => (
                <li key={i.issue_id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{i.title}</p>
                    <p className="truncate text-xs text-slate-500">
                      {i.member_name} · {formatDate(i.issue_date)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[i.status] ?? STATUS_STYLE.issued}`}>
                    {i.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
