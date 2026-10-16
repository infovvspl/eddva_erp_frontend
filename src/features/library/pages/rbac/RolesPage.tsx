import { Link } from 'react-router-dom';
import { Plus, Shield, Lock, Trash2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getRoles, deleteRole } from '../../api/library.api';
import type { Role } from '../../types/library.types';

function countPermissions(role: Role): number {
  return role.permissions.reduce((sum, p) => sum + p.actions.length, 0);
}

export default function RolesPage() {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      setLoading(true);
      const data = await getRoles();
      setRoles(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : t('rbac.rolesPage.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('rbac.rolesPage.confirmDelete'))) {
      return;
    }
    try {
      await deleteRole(id);
      setRoles(roles.filter((r) => r.role_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err.response?.data?.message || (err instanceof Error ? err.message : t('rbac.rolesPage.failedToDelete')));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('rbac.rolesPage.title')}</h1>
          <p className="text-slate-600 mt-1">{t('rbac.rolesPage.subtitle')}</p>
        </div>
        <Link to="/library/roles/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            {t('rbac.rolesPage.addRole')}
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">{tc('status.loading')}</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">{t('rbac.rolesPage.roleName')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">{t('rbac.rolesPage.description')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">{t('rbac.rolesPage.permissions')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">{t('rbac.rolesPage.users')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">{t('rbac.rolesPage.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      {t('rbac.rolesPage.noRolesFound')}
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.role_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{role.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{role.description}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Lock className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">{t('rbac.rolesPage.permissionsCount', { count: countPermissions(role) })}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">{role._count?.user_roles ?? 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/library/roles/${role.role_id}/edit`}>
                            <Button variant="ghost" size="sm">
                              {tc('actions.edit')}
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(role.role_id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
