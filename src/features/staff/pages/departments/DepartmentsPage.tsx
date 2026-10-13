import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, Users } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import { getDepartments } from '../../api/staff.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { StaffDepartment } from '../../types/staff.types';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<StaffDepartment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getDepartments(search || undefined);
      setDepartments(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load departments'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Departments</h1>
          <p className="text-slate-600 mt-1">Departments staff members can be assigned to</p>
        </div>
        <Link to="/staff/departments/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments by name..." />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Staff</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      No departments found. Add your first department.
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => (
                    <tr key={dept.department_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{dept.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{dept.description || '—'}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {dept._count?.members ?? 0}
                        </div>
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
