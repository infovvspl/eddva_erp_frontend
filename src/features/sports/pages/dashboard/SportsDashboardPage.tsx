import { useCallback, useEffect, useState } from 'react';
import { Award, CalendarClock, ListChecks, Trophy, Users } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import ModuleSectionCards from '../../../../components/dashboard/ModuleSectionCards';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import { ChartCard, Leaderboard } from '../../../../components/premium/charts';
import { navItems } from '../../../../layouts/navConfig';
import { getSportsDashboardSummary } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { SportsDashboardSummary } from '../../types/sports.types';
import { formatDate } from '../../../../utils/formatDate';

const SPORTS_SECTIONS = (navItems.find((item) => item.path === '/sports')?.children ?? []).filter(
  (child) => child.path !== '/sports',
);

const ACCENT = '#e34948';

// Entrance stagger — capped so late cards don't wait noticeably.
const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

export default function SportsDashboardPage() {
  const [summary, setSummary] = useState<SportsDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setSummary(await getSportsDashboardSummary());
      setUpdatedAt(Date.now());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the sports dashboard'));
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

  const { totals, house_standings, upcoming_fixtures } = summary;

  const kpis = [
    { label: 'Participants', value: totals.participants, icon: Users, accent: ACCENT },
    { label: 'Houses', value: totals.houses, icon: Award, accent: ACCENT },
    { label: 'Ongoing tournaments', value: totals.ongoing_tournaments, icon: Trophy, accent: ACCENT },
    { label: 'Upcoming tournaments', value: totals.upcoming_tournaments, icon: ListChecks, accent: ACCENT },
  ];

  const standings = [...house_standings].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Sports"
        title="Sports"
        subtitle="Tournaments, houses, and participation across the sports program"
        highlights={[{ icon: Trophy, label: `${totals.ongoing_tournaments} ongoing tournament${totals.ongoing_tournaments === 1 ? '' : 's'}` }]}
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
        <ChartCard title="House standings" subtitle="Current standings" icon={Award} className="lg:col-span-6">
          <Leaderboard
            rows={standings.map((s) => ({
              label: s.name,
              value: s.total_points,
              detail: s.rank != null ? `Rank ${s.rank}` : undefined,
            }))}
          />
        </ChartCard>

        <ChartCard title="Upcoming fixtures" subtitle={`${totals.fixtures_scheduled} scheduled`} icon={CalendarClock} className="lg:col-span-6" style={stagger(1)}>
          {upcoming_fixtures.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No fixtures scheduled.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming_fixtures.map((f) => (
                <li key={f.fixture_id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {f.team_a} vs {f.team_b}
                    </p>
                    <p className="truncate text-xs text-slate-500">{f.tournament_name}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">{formatDate(f.scheduled_date)}</span>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick links</h2>
        <ModuleSectionCards sections={SPORTS_SECTIONS} />
      </div>
    </div>
  );
}
