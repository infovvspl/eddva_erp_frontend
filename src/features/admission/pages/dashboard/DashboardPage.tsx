import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import ReportData from '../../components/reports/ReportData';
import SessionSelect from '../../components/sessions/SessionSelect';
import { getDashboardSummary } from '../../api/admission.api';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { getApiErrorMessage } from '../../utils/errors';

interface SummaryResult {
  key: number;
  data?: unknown;
  error?: string;
  loadedAt: Date;
}

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admission Dashboard</h1>
          <p className="text-slate-600 mt-1">
            {result && !loading
              ? `Updated ${result.loadedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
              : 'Where admissions stand right now'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Session filter */}
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

          <Button variant="secondary" disabled={loading} onClick={() => setReloadKey((key) => key + 1)}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active session badge */}
      {sessionLabel && (
        <div className="inline-flex items-center gap-2 rounded-full bg-[#008BE9]/10 px-3 py-1 text-sm text-[#002C6D]">
          <span className="h-2 w-2 rounded-full bg-[#008BE9]" />
          Showing data for: <strong>{sessionLabel}</strong>
        </div>
      )}

      {loading && !result ? (
        <div className="text-center text-slate-500 py-12">Loading...</div>
      ) : result?.error ? (
        <div className="text-center text-red-500 py-12">{result.error}</div>
      ) : (
        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <ReportData data={result?.data} />
        </div>
      )}
    </div>
  );
}
