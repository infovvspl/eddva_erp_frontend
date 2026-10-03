import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CalendarClock, ListChecks, Medal, Trophy, Users } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import LoadingState from '../../../../components/feedback/LoadingState';
import ErrorState from '../../../../components/feedback/ErrorState';
import StatCard from '../../../../components/dashboard/StatCard';
import ModuleSectionCards from '../../../../components/dashboard/ModuleSectionCards';
import { navItems } from '../../../../layouts/navConfig';
import { getSportsDashboardSummary } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { SportsDashboardSummary } from '../../types/sports.types';

const SPORTS_SECTIONS = (navItems.find((item) => item.path === '/sports')?.children ?? []).filter(
  (child) => child.path !== '/sports',
);

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

export default function SportsDashboardPage() {
  const [summary, setSummary] = useState<SportsDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await getSportsDashboardSummary());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the sports dashboard'));
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

  const { totals, house_standings, upcoming_fixtures } = summary;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-[#008BE9]" />
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Sports</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sports" value={totals.sports} icon={Medal} />
        <StatCard label="Participants" value={totals.participants} icon={Users} color="purple" />
        <StatCard label="Houses" value={totals.houses} icon={Award} color="amber" />
        <StatCard label="Upcoming tournaments" value={totals.upcoming_tournaments} icon={Trophy} color="blue" />
        <StatCard label="Ongoing tournaments" value={totals.ongoing_tournaments} icon={Trophy} color="green" />
        <StatCard label="Fixtures scheduled" value={totals.fixtures_scheduled} icon={ListChecks} color="blue" />
        <StatCard label="Fixtures completed" value={totals.fixtures_completed} icon={ListChecks} color="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Award className="h-5 w-5 text-[#008BE9]" />
                House standings
              </h2>
              <Link to="/sports/houses" className="text-sm font-medium text-[#008BE9] hover:text-[#002C6D]">
                View all
              </Link>
            </div>
            {house_standings.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No standings recorded yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {house_standings.map((s) => (
                  <li key={s.house_id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#008BE9]/10 text-xs font-bold text-[#002C6D]">
                        {s.rank ?? '–'}
                      </span>
                      {s.name}
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{s.total_points} pts</span>
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
                <CalendarClock className="h-5 w-5 text-[#008BE9]" />
                Upcoming fixtures
              </h2>
              <Link to="/sports/tournaments" className="text-sm font-medium text-[#008BE9] hover:text-[#002C6D]">
                View all
              </Link>
            </div>
            {upcoming_fixtures.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Nothing scheduled.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcoming_fixtures.map((f) => (
                  <li key={f.fixture_id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {f.team_a} vs {f.team_b}
                      </p>
                      <p className="truncate text-xs text-slate-500">{f.tournament_name}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-slate-600">{formatDate(f.scheduled_date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick links</h2>
        <ModuleSectionCards sections={SPORTS_SECTIONS} />
      </div>
    </div>
  );
}
