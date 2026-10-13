import { useCallback, useEffect, useState } from 'react';
import { Briefcase, CalendarDays, HeartHandshake, UserCheck, Users } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import ReportData from '../../components/reports/ReportData';
import PageHero from '../../../../components/premium/PageHero';
import KpiTile from '../../../../components/premium/KpiTile';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import {
  getDashboardCommunication,
  getDashboardDirectory,
  getDashboardDonations,
  getDashboardEvents,
  getDashboardJobs,
  getDashboardMentorship,
  getDashboardSummary,
} from '../../api/dashboard.api';
import type { AlumniDashboardSummary } from '../../types/alumni.types';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage } from '../../utils/errors';

type Tab = 'directory' | 'events' | 'jobs' | 'mentorship' | 'donations' | 'communication';

const ACCENT = '#008300';

// Entrance stagger — capped so late tiles don't wait noticeably.
const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

const TABS: { key: Tab; label: string; load: () => Promise<unknown> }[] = [
  { key: 'directory', label: 'Directory', load: getDashboardDirectory },
  { key: 'events', label: 'Events', load: getDashboardEvents },
  { key: 'jobs', label: 'Jobs', load: getDashboardJobs },
  { key: 'mentorship', label: 'Mentorship', load: getDashboardMentorship },
  { key: 'donations', label: 'Donations', load: getDashboardDonations },
  { key: 'communication', label: 'Communication', load: getDashboardCommunication },
];

interface SectionState {
  key: string;
  data?: unknown;
  error?: string;
}

interface SummaryState {
  data?: AlumniDashboardSummary;
  error?: string;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryState | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryUpdatedAt, setSummaryUpdatedAt] = useState(0);
  const [tab, setTab] = useState<Tab>('directory');
  const [section, setSection] = useState<SectionState | null>(null);

  const loadSummary = useCallback(() => {
    let cancelled = false;
    setSummaryLoading(true);
    getDashboardSummary()
      .then((data) => {
        if (cancelled) return;
        setSummary({ data });
        setSummaryUpdatedAt(Date.now());
      })
      .catch((err) => {
        if (cancelled) return;
        setSummary({ error: getApiErrorMessage(err, 'Failed to load summary') });
        setSummaryUpdatedAt(Date.now());
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => loadSummary(), [loadSummary]);

  useEffect(() => {
    const current = TABS.find((t) => t.key === tab)!;
    let cancelled = false;
    setSection(null);
    current
      .load()
      .then((data) => {
        if (!cancelled) setSection({ key: tab, data });
      })
      .catch((err) => {
        if (!cancelled) setSection({ key: tab, error: getApiErrorMessage(err, `Failed to load ${current.label.toLowerCase()}`) });
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const s = summary?.data;

  return (
    <div className="space-y-6">
      {!summary ? (
        <DashboardSkeleton />
      ) : summary.error ? (
        <Card className="border-slate-200">
          <div className="p-6 text-center text-red-500">{summary.error}</div>
        </Card>
      ) : s ? (
        <div className="space-y-5">
          <PageHero
            eyebrow="Alumni"
            title="Alumni"
            subtitle="A snapshot of the alumni program"
            highlights={[
              { icon: UserCheck, label: `${s.alumni.pending_verification} pending verification` },
              { icon: Briefcase, label: `${s.jobs.open} open jobs` },
            ]}
            updatedAt={summaryUpdatedAt}
            refreshing={summaryLoading}
            onRefresh={loadSummary}
          />
          <div className="grid gap-4 grid-cols-2 xl:grid-cols-5">
            <KpiTile label="Total alumni" value={s.alumni.total} icon={Users} accent={ACCENT} style={stagger(0)} />
            <KpiTile
              label="Pending verification"
              value={s.alumni.pending_verification}
              icon={UserCheck}
              accent={ACCENT}
              style={stagger(1)}
            />
            <KpiTile label="Upcoming events" value={s.events.upcoming} icon={CalendarDays} accent={ACCENT} style={stagger(2)} />
            <KpiTile label="Open jobs" value={s.jobs.open} icon={Briefcase} accent={ACCENT} style={stagger(3)} />
            <KpiTile
              label="Active campaigns"
              value={s.donations.active_campaigns}
              icon={HeartHandshake}
              accent={ACCENT}
              style={stagger(4)}
            />
          </div>
        </div>
      ) : null}

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {!section || section.key !== tab ? (
            <div className="text-center text-slate-500 py-8">Loading...</div>
          ) : section.error ? (
            <div className="text-center text-red-500 py-8">{section.error}</div>
          ) : (
            <ReportData key={tab} data={section.data} />
          )}
        </div>
      </Card>
    </div>
  );
}
