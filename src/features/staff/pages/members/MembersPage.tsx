import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, User } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { getStaffMembers, getDepartments } from '../../api/staff.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { cn } from '../../../../utils/cn';
import type { StaffMember, StaffDepartment } from '../../types/staff.types';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  resigned: 'bg-slate-100 text-slate-600',
  terminated: 'bg-red-100 text-red-700',
};

export default function MembersPage() {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<StaffDepartment[]>([]);
  const [search, setSearch] = useState('');
  const [staffType, setStaffType] = useState('');
  const [status, setStatus] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, staffType, status, departmentId]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const result = await getStaffMembers({
        search: search || undefined,
        staff_type: staffType || undefined,
        status: status || undefined,
        department_id: departmentId ? Number(departmentId) : undefined,
        limit: 50,
      });
      setMembers(result.data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load staff'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Directory</h1>
          <p className="text-slate-600 mt-1">Teaching and non-teaching staff</p>
        </div>
        <Link to="/staff/members/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or code..." />
          <Select
            value={staffType}
            onChange={(e) => setStaffType(e.target.value)}
            placeholder="All staff types"
            options={[
              { value: 'teaching', label: 'Teaching' },
              { value: 'non_teaching', label: 'Non-teaching' },
            ]}
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="All statuses"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'resigned', label: 'Resigned' },
              { value: 'terminated', label: 'Terminated' },
            ]}
          />
          <Select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            placeholder="All departments"
            options={departments.map((d) => ({ value: String(d.department_id), label: d.name }))}
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Staff</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Designation</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No staff members found.
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.staff_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <Link to={`/staff/members/${m.staff_id}`} className="flex items-center gap-2 group">
                          <User className="h-4 w-4 text-slate-400" />
                          <div>
                            <div className="font-medium text-slate-900 group-hover:text-[#008BE9]">{m.full_name}</div>
                            <div className="text-xs text-slate-500">{m.staff_code}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 capitalize">{m.staff_type.replace('_', '-')}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{m.department?.name ?? '—'}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{m.designation}</td>
                      <td className="py-3 px-4">
                        <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STATUS_BADGE[m.status])}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
