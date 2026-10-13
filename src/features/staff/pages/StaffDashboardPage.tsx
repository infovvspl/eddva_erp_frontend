import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Briefcase, Building2, GraduationCap, UserCheck, Users } from 'lucide-react';
import { getStaffDashboard } from '../api/staff.api';
import { getApiErrorMessage } from '../utils/rbac.utils';
import type { StaffDashboardSummary } from '../types/staff.types';
import PageHero from '../../../components/premium/PageHero';
import KpiTile from '../../../components/premium/KpiTile';
import DashboardSkeleton from '../../../components/premium/DashboardSkeleton';
import { ChartCard, Leaderboard } from '../../../components/premium/charts';
import { humanize } from '../../../utils/dashboardFormat';

// Accent for the Staff module's own dashboard — indigo, distinct from other modules' colors.
const ACCENT = '#4338ca';

// Entrance stagger — mirrors the central dashboard's bento rhythm.
const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

function typeIcon(staffType: string): LucideIcon {
  if (staffType === 'teaching') return GraduationCap;
  if (staffType === 'non_teaching') return Briefcase;
  return Users;
}

export default function StaffDashboardPage() {
  const [data, setData] = useState<StaffDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (reloadKey > 0) setRefreshing(true);
    getStaffDashboard()
      .then((summary) => {
        if (cancelled) return;
        setData(summary);
        setError(null);
        setUpdatedAt(Date.now());
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 401) return;
        setError(getApiErrorMessage(err, 'Failed to load dashboard'));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return null;

  const kpis = [
    { label: 'Total staff', value: data.total_staff, icon: Users, accent: ACCENT },
    { label: 'Active staff', value: data.active_staff, icon: UserCheck, accent: ACCENT },
    ...data.by_type.map((t) => ({
      label: humanize(t.staff_type),
      value: t.count,
      icon: typeIcon(t.staff_type),
      accent: ACCENT,
    })),
  ];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Staff"
        title="Staff Management"
        subtitle="Directory, leave and payroll for teaching and non-teaching staff"
        highlights={[{ icon: UserCheck, label: `${data.active_staff} active staff` }]}
        updatedAt={updatedAt}
        refreshing={refreshing}
        onRefresh={() => setReloadKey((k) => k + 1)}
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KpiTile key={kpi.label} {...kpi} style={stagger(index)} />
        ))}
      </div>

      {data.by_department.length > 0 && (
        <ChartCard title="Staff by department" subtitle="Headcount per department" icon={Building2}>
          <Leaderboard rows={data.by_department.map((d) => ({ label: d.department, value: d.count }))} />
        </ChartCard>
      )}
    </div>
  );
}
