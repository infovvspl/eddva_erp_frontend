import { Link } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import ErrorState from '../../../components/feedback/ErrorState';
import DashboardSkeleton from '../../../components/premium/DashboardSkeleton';
import AttentionList from '../../../components/premium/AttentionList';
import { collectAttentionItems } from '../utils/attention';
import { ROUTES } from '../../../constants/routes';

// Full, unclipped version of the dashboard's "Needs attention" rail — linked
// from its "View all" action since the rail itself only has room for a
// handful of items before scrolling.
export default function AttentionPage() {
  const { data, isLoading, error, refetch } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message="Failed to load dashboard" onRetry={() => refetch()} />;
  if (!data) return null;

  const items = collectAttentionItems(data);
  const critical = items.filter((i) => i.severity === 'critical');
  const warning = items.filter((i) => i.severity === 'warning');

  return (
    <div className="space-y-6">
      <div>
        <Link to={ROUTES.DASHBOARD} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="mt-2 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Bell className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Needs attention</h1>
            <p className="text-sm text-slate-500">
              {items.length} open item{items.length === 1 ? '' : 's'} across every module
            </p>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-5 grid-cols-1 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <h2 className="text-sm font-semibold text-slate-900">Critical</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{critical.length}</span>
          </div>
          <AttentionList items={critical} />
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <h2 className="text-sm font-semibold text-slate-900">Needs follow-up</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{warning.length}</span>
          </div>
          <AttentionList items={warning} />
        </section>
      </div>
    </div>
  );
}
