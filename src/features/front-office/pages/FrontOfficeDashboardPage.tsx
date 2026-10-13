import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  MessageSquare,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  CheckCheck,
  Flag,
  Timer,
  Footprints,
  Network,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import ErrorState from '../../../components/feedback/ErrorState';
import DashboardSkeleton from '../../../components/premium/DashboardSkeleton';
import PageHero from '../../../components/premium/PageHero';
import KpiTile from '../../../components/premium/KpiTile';
import SectionHeading from '../../../components/premium/SectionHeading';
import { ChartCard, DonutChart, GradientArea, Leaderboard } from '../../../components/premium/charts';
import { humanize } from '../../../utils/dashboardFormat';
import { getDashboardSummary } from '../api/dashboard.api';
import { getEmployees } from '../api/employees.api';
import { getApiErrorMessage } from '../utils/rbac.utils';
import type { FrontOfficeDashboardSummary } from '../types/dashboardRecord.types';

const ACCENT = '#7c3aed';

// Entrance stagger — capped so late cards don't wait noticeably.
const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

function formatResolutionTime(hours: number): string {
  if (!hours || hours <= 0) return '—';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

function shortDay(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface SectionHeaderProps {
  viewAllHref: string;
}

function ViewAllLink({ viewAllHref }: SectionHeaderProps) {
  return (
    <Link to={viewAllHref} className="inline-flex items-center text-xs font-medium text-brand hover:text-brand-navy">
      View all <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
    </Link>
  );
}

export default function FrontOfficeDashboardPage() {
  const [summary, setSummary] = useState<FrontOfficeDashboardSummary | null>(null);
  const [employeeMap, setEmployeeMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const [summaryData, employeesData] = await Promise.all([
        getDashboardSummary(),
        getEmployees({ limit: 100 }).catch(() => ({ data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } })),
      ]);
      setSummary(summaryData);
      setEmployeeMap(new Map(employeesData.data.map((e) => [e.employee_id, e.name])));
      setUpdatedAt(Date.now());
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={() => load()} />;
  if (!summary) return <ErrorState message="No dashboard data available." onRetry={() => load()} />;

  const { visitors, enquiries, appointments, complaints } = summary;

  const enquiriesBySource = enquiries.by_source.map((s) => ({ label: humanize(s.source), value: s.count }));
  const enquiriesByCategory = enquiries.by_category.map((c) => ({ label: humanize(c.category), value: c.count }));
  const enquiriesByAssignee = enquiries.by_assignee.map((a) => ({
    label: employeeMap.get(a.assigned_to) ?? `Employee #${a.assigned_to}`,
    value: a.count,
  }));

  const visitorsByHost = visitors.by_host.map((h) => ({ label: `${h.host_name} (${h.department})`, value: h.count }));

  const appointmentsByDepartment = appointments.by_department.map((d) => ({ label: d.department, value: d.count }));
  const appointmentsByEmployee = appointments.by_employee.map((e) => ({ label: e.employee, value: e.count }));

  const complaintsByPriority = complaints.by_priority.map((p) => ({ label: humanize(p.priority), value: p.count }));
  const complaintsByCategory = complaints.by_category.map((c) => ({ label: humanize(c.category), value: c.count }));
  const complaintsByAssignee = complaints.by_assignee.map((a) => ({
    label: employeeMap.get(a.assigned_to) ?? `Employee #${a.assigned_to}`,
    value: a.count,
  }));

  const kpis = [
    {
      label: "Today's visitors",
      value: visitors.today_visitors,
      icon: Users,
      hint: `${visitors.checked_out_today} checked out today`,
      accent: ACCENT,
    },
    {
      label: 'Currently checked in',
      value: visitors.currently_checked_in,
      icon: UserCheck,
      hint: 'On campus right now',
      accent: ACCENT,
    },
    {
      label: 'Enquiries in progress',
      value: enquiries.in_progress,
      icon: Clock,
      hint: `${enquiries.open} open · ${enquiries.total} total`,
      accent: ACCENT,
    },
    {
      label: 'Open complaints',
      value: complaints.open,
      icon: AlertTriangle,
      hint: `${complaints.critical_or_high} critical/high`,
      accent: ACCENT,
    },
    {
      label: "Today's appointments",
      value: appointments.today,
      icon: Calendar,
      hint: `${appointments.upcoming} upcoming`,
      accent: ACCENT,
    },
    {
      label: 'Pending follow-ups',
      value: enquiries.pending_followups,
      icon: Timer,
      hint: `${enquiries.overdue_followups} overdue`,
      accent: ACCENT,
    },
  ];

  const highlights = [
    { icon: UserCheck, label: `${visitors.currently_checked_in} visitors checked in now` },
    { icon: AlertTriangle, label: `${complaints.open} open complaint${complaints.open === 1 ? '' : 's'}` },
    { icon: Calendar, label: `${appointments.today} appointment${appointments.today === 1 ? '' : 's'} today` },
  ];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Front Office"
        title="Front Office overview"
        subtitle="Visitors, enquiries, appointments, and complaints at a glance"
        highlights={highlights}
        updatedAt={updatedAt}
        refreshing={refreshing}
        onRefresh={() => load(true)}
      />

      <div className="flex flex-wrap gap-2">
        <Link to="/front-office/visitors/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Visitor
          </Button>
        </Link>
        <Link to="/front-office/enquiries/new">
          <Button variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Enquiry
          </Button>
        </Link>
        <Link to="/front-office/appointments/new">
          <Button variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Appointment
          </Button>
        </Link>
        <Link to="/front-office/complaints/new">
          <Button variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Complaint
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi, index) => (
          <KpiTile key={kpi.label} {...kpi} style={stagger(index)} />
        ))}
      </div>

      {/* Visitors */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Visitors" title="Front desk traffic" />
        <ChartCard
          title="Visits (last few days)"
          subtitle={`${visitors.currently_checked_in} currently checked in`}
          icon={Footprints}
          className="lg:col-span-7"
        >
          <GradientArea name="Visitors" rows={visitors.by_day.map((d) => ({ label: shortDay(d.day), value: d.count }))} />
        </ChartCard>
        <ChartCard title="Top hosts" subtitle="By visitor count" icon={Users} className="lg:col-span-5" style={stagger(1)}>
          <Leaderboard rows={visitorsByHost} />
        </ChartCard>
      </div>

      {/* Enquiries */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Enquiries" title="Enquiry pipeline" />
        <ChartCard
          title="Enquiries by status"
          subtitle={`${enquiries.total} total`}
          icon={MessageSquare}
          className="lg:col-span-4"
        >
          <DonutChart
            totalLabel="enquiries"
            rows={[
              { label: 'Open', value: enquiries.open },
              { label: 'In progress', value: enquiries.in_progress },
              { label: 'Closed', value: enquiries.closed },
            ]}
          />
        </ChartCard>
        <ChartCard title="By source" subtitle="Where enquiries come from" icon={MessageSquare} className="lg:col-span-4" style={stagger(1)}>
          <Leaderboard rows={enquiriesBySource} />
        </ChartCard>
        <ChartCard title="By category" subtitle="Topic breakdown" icon={Flag} className="lg:col-span-4" style={stagger(2)}>
          <Leaderboard rows={enquiriesByCategory} />
        </ChartCard>
        <ChartCard title="By assignee" subtitle="Workload across the team" icon={Network} className="lg:col-span-12" style={stagger(3)}>
          <Leaderboard rows={enquiriesByAssignee} />
        </ChartCard>
      </div>

      {/* Appointments */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Appointments" title="Scheduling overview" />
        <ChartCard
          title="Appointments by status"
          subtitle={`${appointments.today} today · ${appointments.upcoming} upcoming`}
          icon={Calendar}
          className="lg:col-span-4"
        >
          <DonutChart
            totalLabel="appointments"
            rows={[
              { label: 'Completed', value: appointments.completed },
              { label: 'Upcoming', value: appointments.upcoming },
              { label: 'Cancelled', value: appointments.cancelled },
              { label: 'No show', value: appointments.no_show },
            ]}
          />
        </ChartCard>
        <ChartCard title="By department" subtitle="Where appointments are booked" icon={Network} className="lg:col-span-4" style={stagger(1)}>
          <Leaderboard rows={appointmentsByDepartment} />
        </ChartCard>
        <ChartCard title="By employee" subtitle="Who's hosting" icon={Users} className="lg:col-span-4" style={stagger(2)}>
          <Leaderboard rows={appointmentsByEmployee} />
        </ChartCard>
      </div>

      {/* Complaints */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Complaints" title="Resolution tracking" />
        <ChartCard
          title="Complaints by priority"
          subtitle={`${complaints.total} total · avg resolution ${formatResolutionTime(complaints.average_resolution_hours)}`}
          icon={AlertTriangle}
          className="lg:col-span-4"
        >
          <DonutChart totalLabel="complaints" rows={complaintsByPriority} />
        </ChartCard>
        <ChartCard title="By category" subtitle="What's being reported" icon={Flag} className="lg:col-span-4" style={stagger(1)}>
          <Leaderboard rows={complaintsByCategory} />
        </ChartCard>
        <ChartCard
          title="Status breakdown"
          subtitle={`${complaints.critical_or_high} critical/high`}
          icon={CheckCheck}
          className="lg:col-span-4"
          style={stagger(2)}
        >
          <DonutChart
            totalLabel="complaints"
            rows={[
              { label: 'Open', value: complaints.open },
              { label: 'In progress', value: complaints.in_progress },
              { label: 'Resolved', value: complaints.resolved },
              { label: 'Closed', value: complaints.closed },
            ]}
          />
        </ChartCard>
        <ChartCard title="By assignee" subtitle="Workload across the team" icon={Network} className="lg:col-span-12" style={stagger(3)}>
          <Leaderboard rows={complaintsByAssignee} />
        </ChartCard>
      </div>

      {/* Quick links to full module pages */}
      <div className="flex flex-wrap gap-4 text-sm">
        <ViewAllLink viewAllHref="/front-office/visitors" />
        <ViewAllLink viewAllHref="/front-office/enquiries" />
        <ViewAllLink viewAllHref="/front-office/appointments" />
        <ViewAllLink viewAllHref="/front-office/complaints" />
      </div>
    </div>
  );
}
