import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Select from '../../../../components/ui/Select';
import { getLmsTeachers, importLmsTeacher, getDepartments } from '../../api/staff.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { cn } from '../../../../utils/cn';
import type { LmsTeacher, StaffDepartment, ImportLmsTeacherFormData } from '../../types/staff.types';

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_IMPORT: ImportLmsTeacherFormData = {
  teacher_id: '',
  employee_id: '',
  full_name: '',
  email: '',
  designation: 'Teacher',
  date_of_joining: today(),
};

export default function LmsTeachersPage() {
  const [teachers, setTeachers] = useState<LmsTeacher[]>([]);
  const [departments, setDepartments] = useState<StaffDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importForm, setImportForm] = useState<ImportLmsTeacherFormData>(EMPTY_IMPORT);
  const [busy, setBusy] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ succeeded: number; failed: Array<{ name: string; reason: string }> } | null>(null);

  const load = () => {
    setLoading(true);
    getLmsTeachers()
      .then(setTeachers)
      .catch((err) => {
        if (err.response?.status === 401) return;
        setError(getApiErrorMessage(err, 'Failed to load LMS teachers'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getDepartments().then(setDepartments).catch(() => undefined);
  }, []);

  const missingCount = teachers.filter((t) => !t.in_erp).length;

  const openImport = (t: LmsTeacher) => {
    setImportForm({
      teacher_id: t.teacherId,
      employee_id: t.employeeId ?? '',
      full_name: t.name,
      email: t.email,
      designation: t.designation ?? 'Teacher',
      date_of_joining: t.joiningDate ? t.joiningDate.slice(0, 10) : today(),
    });
    setImportError(null);
    setImportOpen(true);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setImportError(null);
    try {
      await importLmsTeacher(importForm);
      setImportOpen(false);
      load();
    } catch (err) {
      setImportError(getApiErrorMessage(err, 'Failed to import teacher'));
    } finally {
      setBusy(false);
    }
  };

  const handleImportAll = async () => {
    const missing = teachers.filter((t) => !t.in_erp);
    if (missing.length === 0) return;
    setBulkBusy(true);
    setBulkResult(null);
    let succeeded = 0;
    const failed: Array<{ name: string; reason: string }> = [];

    for (const t of missing) {
      if (!t.employeeId) {
        failed.push({ name: t.name, reason: 'No employee ID on file in the LMS' });
        continue;
      }
      if (t.duplicate_employee_id) {
        failed.push({ name: t.name, reason: `Employee ID "${t.employeeId}" is shared by more than one teacher in the LMS — fix it there first` });
        continue;
      }
      try {
        await importLmsTeacher({
          teacher_id: t.teacherId,
          employee_id: t.employeeId,
          full_name: t.name,
          email: t.email,
          designation: t.designation ?? undefined,
          date_of_joining: t.joiningDate ? t.joiningDate.slice(0, 10) : undefined,
        });
        succeeded++;
      } catch (err) {
        failed.push({ name: t.name, reason: getApiErrorMessage(err, 'Import failed') });
      }
    }

    setBulkResult({ succeeded, failed });
    setBulkBusy(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">LMS Teachers</h1>
        <p className="text-slate-600 mt-1">
          Every teacher that already exists in the LMS for this institute. Import all of the missing ones at once,
          or import one at a time to review/adjust department and designation first.
        </p>
      </div>

      {missingCount > 0 && !loading && !error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-4">
          <span>
            {missingCount} of these teacher(s) have no matching record in the ERP's{' '}
            <Link to="/staff/members" className="underline font-medium">
              Staff Directory
            </Link>
            .
          </span>
          <Button size="sm" variant="primary" onClick={handleImportAll} disabled={bulkBusy}>
            {bulkBusy ? 'Importing...' : `Import All (${missingCount})`}
          </Button>
        </div>
      )}

      {bulkResult && (
        <div
          className={cn(
            'px-4 py-3 rounded-lg text-sm border',
            bulkResult.failed.length === 0
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          )}
        >
          <p>
            Imported {bulkResult.succeeded} teacher{bulkResult.succeeded === 1 ? '' : 's'}
            {bulkResult.failed.length > 0 ? `, ${bulkResult.failed.length} skipped:` : '.'}
          </p>
          {bulkResult.failed.length > 0 && (
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {bulkResult.failed.map((f, i) => (
                <li key={i}>
                  <span className="font-medium">{f.name}</span> — {f.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Card className="border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Employee ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Department (in LMS)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">In ERP?</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700"></th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No teachers found in the LMS for this institute.
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.teacherId} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{t.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {t.employeeId ?? '—'}
                        {t.duplicate_employee_id && (
                          <span
                            title="This employee ID is shared by more than one teacher in the LMS"
                            className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700"
                          >
                            <AlertTriangle className="h-3 w-3" /> Duplicate ID
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{t.email}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{t.department ?? '—'}</td>
                      <td className="py-3 px-4">
                        {t.in_erp ? (
                          <Link
                            to={t.erp_staff_id ? `/staff/members/${t.erp_staff_id}` : '/staff/members'}
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200'
                            )}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Yes
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <XCircle className="h-3.5 w-3.5" /> No
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {!t.in_erp && t.employeeId && !t.duplicate_employee_id && (
                          <Button size="sm" variant="secondary" onClick={() => openImport(t)}>
                            Import
                          </Button>
                        )}
                        {!t.in_erp && t.duplicate_employee_id && (
                          <span className="text-xs text-slate-400">Fix duplicate ID in LMS first</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={importOpen} onClose={() => setImportOpen(false)} title="Import LMS Teacher into Staff Directory">
        <form onSubmit={handleImport} className="space-y-4">
          {importError && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{importError}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={importForm.full_name}
              disabled
              className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
            <input
              type="text"
              value={importForm.employee_id}
              disabled
              className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <Select
              value={importForm.department_id ?? ''}
              onChange={(e) =>
                setImportForm({ ...importForm, department_id: e.target.value ? Number(e.target.value) : undefined })
              }
              options={[
                { value: '', label: 'Unassigned — can be set later' },
                ...departments.map((d) => ({ value: String(d.department_id), label: d.name })),
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
            <input
              type="text"
              value={importForm.designation}
              onChange={(e) => setImportForm({ ...importForm, designation: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Joining</label>
            <input
              type="date"
              value={importForm.date_of_joining}
              onChange={(e) => setImportForm({ ...importForm, date_of_joining: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
