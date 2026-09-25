import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BookCopy,
  BookOpen,
  CalendarClock,
  Clock,
  IndianRupee,
  Library,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import Card from '../../../../components/ui/Card';
import LoadingState from '../../../../components/feedback/LoadingState';
import ErrorState from '../../../../components/feedback/ErrorState';
import StatCard from '../../../../components/dashboard/StatCard';
import ModuleSectionCards from '../../../../components/dashboard/ModuleSectionCards';
import { navItems } from '../../../../layouts/navConfig';
import { getLibraryDashboardSummary } from '../../api/library.api';
import { getApiErrorMessage } from '../../utils/apiError';
import type { LibraryDashboardSummary } from '../../types/library.types';

const LIBRARY_SECTIONS = (navItems.find((item) => item.path === '/library')?.children ?? []).filter(
  (child) => child.path !== '/library',
);

const STATUS_STYLE: Record<string, string> = {
  issued: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
  returned: 'bg-green-100 text-green-700',
  lost: 'bg-slate-200 text-slate-700',
};

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : '—';
}

function formatRupees(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function LibraryDashboardPage() {
  const [summary, setSummary] = useState<LibraryDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await getLibraryDashboardSummary());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the library dashboard'));
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

  const { totals, due_soon, recent_issues } = summary;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Library className="h-7 w-7 text-[#008BE9]" />
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Library</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Book titles" value={totals.titles} icon={BookOpen} />
        <StatCard label="Total copies" value={totals.copies} icon={BookCopy} color="purple" />
        <StatCard label="Available copies" value={totals.available_copies} icon={BookCopy} color="green" />
        <StatCard label="Issued now" value={totals.issued_now} icon={RotateCcw} color="blue" />
        <StatCard label="Overdue" value={totals.overdue} icon={AlertTriangle} color={totals.overdue > 0 ? 'red' : 'slate'} />
        <StatCard label="Active members" value={totals.active_members} icon={UserCheck} color="green" />
        <StatCard label="Open reservations" value={totals.pending_reservations} icon={Clock} color="amber" />
        <StatCard label="Unpaid fines" value={formatRupees(totals.unpaid_fines)} icon={IndianRupee} color={totals.unpaid_fines > 0 ? 'amber' : 'slate'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <CalendarClock className="h-5 w-5 text-[#008BE9]" />
                Due in the next 3 days
              </h2>
              <Link to="/library/issues" className="text-sm font-medium text-[#008BE9] hover:text-[#002C6D]">
                View all
              </Link>
            </div>
            {due_soon.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Nothing is due soon.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {due_soon.map((item) => (
                  <li key={item.issue_id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="truncate text-xs text-slate-500">{item.member_name}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-slate-600">{formatDate(item.due_date)}</span>
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
                <RotateCcw className="h-5 w-5 text-[#008BE9]" />
                Recent activity
              </h2>
              <Link to="/library/issues" className="text-sm font-medium text-[#008BE9] hover:text-[#002C6D]">
                View all
              </Link>
            </div>
            {recent_issues.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No books have been issued yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent_issues.map((item) => (
                  <li key={item.issue_id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="truncate text-xs text-slate-500">
                        {item.member_name} · {formatDate(item.issue_date)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[item.status] ?? STATUS_STYLE.lost}`}
                    >
                      {item.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick links</h2>
        <ModuleSectionCards sections={LIBRARY_SECTIONS} />
      </div>
    </div>
  );
}
