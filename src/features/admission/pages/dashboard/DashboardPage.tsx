import { useEffect, useState } from 'react';
import { ClipboardList, Filter, PieChart as PieIcon, School, UserPlus, UserCheck2 } from 'lucide-react';
import PageHero from '../../../../components/premium/PageHero';
import KpiTile from '../../../../components/premium/KpiTile';
import SectionHeading from '../../../../components/premium/SectionHeading';
import { ChartCard, DonutChart, Funnel } from '../../../../components/premium/charts';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import ErrorState from '../../../../components/feedback/ErrorState';
import { humanize } from '../../../../utils/dashboardFormat';
import SessionSelect from '../../components/sessions/SessionSelect';
import { getDashboardSummary } from '../../api/admission.api';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { getApiErrorMessage } from '../../utils/errors';
import type { AdmissionDashboardSummary } from '../../types/admission.types';

interface SummaryResult {
  key: number;
  data?: AdmissionDashboardSummary;
  error?: string;
  loadedAt: Date;
}

// Entrance stagger — capped so late cards don't wait noticeably.
const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

const ACCENT = '#4a3aa7';

export default function DashboardPage() {
  const { sessions, status: sessionStatus, activeId, nameOf } = useSessionOptions();

  // Default to the active session; falls back to '' (server will auto-pick)
  const [sessionId, setSessionId] = useState<number | ''>('');

  // Once sessions load, pre-select the active one if the user hasn't picked yet
  useEffect(() => {
    if (sessionStatus === 'ready' && sessionId === '' && activeId !== undefined) {
      setSessionId(activeId);
    }
  }, [sessionStatus, activeId, sessionId]);

  // Bumping the key both refetches and marks the shown summary as out of date.
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const loading = result?.key !== reloadKey;

  useEffect(() => {
    let cancelled = false;
    getDashboardSummary(sessionId !== '' ? { session_id: sessionId } : {})
      .then((data) => {
        if (!cancelled) setResult({ key: reloadKey, data, loadedAt: new Date() });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ key: reloadKey, error: getApiErrorMessage(err, 'Failed to load the dashboard'), loadedAt: new Date() });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey, sessionId]);

  const sessionLabel = sessionId !== '' ? nameOf(sessionId) : undefined;
  const summary = result?.data;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Admission"
        title="Admission"
        subtitle="Where enquiries, applications, and seats stand right now"
        highlights={
          summary
            ? [
                { icon: School, label: `${summary.seats.available} of ${summary.seats.total_seats} seats open` },
                { icon: UserPlus, label: `${summary.kpis.enquiry_followups_due} follow-ups due` },
              ]
            : []
        }
        updatedAt={result ? result.loadedAt.getTime() : 0}
        refreshing={loading}
        onRefresh={() => setReloadKey((key) => key + 1)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="dashboard-session" className="text-sm text-slate-600 whitespace-nowrap">
            Session:
          </label>
          <SessionSelect
            id="dashboard-session"
            sessions={sessions}
            status={sessionStatus}
            value={sessionId}
            onChange={(v) => {
              setSessionId(v);
              setReloadKey((k) => k + 1);
            }}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-[#008BE9] focus:outline-none focus:ring-2 focus:ring-[#008BE9]/20"
          />
        </div>

        {sessionLabel && (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#008BE9]/10 px-3 py-1 text-sm text-[#002C6D]">
            <span className="h-2 w-2 rounded-full bg-[#008BE9]" />
            Showing data for: <strong>{sessionLabel}</strong>
          </div>
        )}
      </div>

      {loading && !result ? (
        <DashboardSkeleton />
      ) : result?.error ? (
        <ErrorState message={result.error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : summary ? (
        <div className={loading ? 'space-y-5 opacity-60 transition-opacity' : 'space-y-5 transition-opacity'}>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <KpiTile
              label="Applications"
              value={summary.kpis.applications}
              icon={ClipboardList}
              hint={`${summary.kpis.applications_under_review} under review`}
              accent={ACCENT}
              style={stagger(0)}
            />
            <KpiTile
              label="Confirmed admissions"
              value={summary.kpis.confirmed_admissions}
              icon={UserCheck2}
              hint={`${summary.kpis.offers_accepted} offers accepted`}
              accent={ACCENT}
              style={stagger(1)}
            />
            <KpiTile
              label="Seats available"
              value={summary.seats.available}
              icon={School}
              hint={`of ${summary.seats.total_seats} total`}
              accent={ACCENT}
              style={stagger(2)}
            />
            <KpiTile
              label="Total enquiries"
              value={summary.kpis.total_enquiries}
              icon={UserPlus}
              hint={`${summary.kpis.new_enquiries} new`}
              accent={ACCENT}
              style={stagger(3)}
            />
          </div>

          <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
            <SectionHeading eyebrow="Pipeline" title="Enquiries to admissions" />
            <ChartCard
              title="Admission funnel"
              subtitle={`${summary.kpis.confirmed_admissions} confirmed · ${summary.seats.available} seats open`}
              icon={Filter}
              className="lg:col-span-7"
              style={stagger(0)}
            >
              <Funnel rows={summary.funnel.map((f) => ({ label: humanize(f.stage), value: f.count }))} />
            </ChartCard>
            <ChartCard
              title="Applications by status"
              subtitle={`${summary.kpis.applications} total`}
              icon={PieIcon}
              className="lg:col-span-5"
              style={stagger(1)}
            >
              <DonutChart
                rows={Object.entries(summary.applications_by_status).map(([status, count]) => ({
                  label: humanize(status),
                  value: count,
                }))}
                totalLabel="applications"
              />
            </ChartCard>
          </div>
        </div>
      ) : null}
    </div>
  );
}
