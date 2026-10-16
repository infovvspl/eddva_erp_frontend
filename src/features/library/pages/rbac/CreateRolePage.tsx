import { moduleSessions } from '../../../../lib/moduleAuth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ResourcePermissionsToggle from '../../components/rbac/ResourcePermissionsToggle';
import { config } from '../../../../config/env';
import { isInstituteAdminToken } from '../../../../utils/jwt';
import { getPermissionsCatalog, getMyPermissions, createRole } from '../../api/library.api';
import {
  filterGrantablePermissions,
  getApiErrorMessage,
  sanitizeRolePermissions,
} from '../../utils/rbac.utils';
import type { PermissionResource, RolePermission } from '../../types/library.types';

export default function CreateRolePage() {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const [resources, setResources] = useState<PermissionResource[]>([]);
  const [myPermissions, setMyPermissions] = useState<RolePermission[]>([]);
  const [isInstituteAdmin, setIsInstituteAdmin] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<RolePermission[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  async function loadCatalog() {
    try {
      setLoading(true);
      const authToken = config.apiToken?.trim() || localStorage.getItem('accessToken') || '';
      setIsInstituteAdmin(isInstituteAdminToken(authToken));

      const [catalog, currentPermissions] = await Promise.all([
        getPermissionsCatalog(),
        getMyPermissions().catch(() => [] as RolePermission[]),
      ]);

      setResources(catalog.resources);
      setMyPermissions(currentPermissions);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, t('rbac.createRolePage.failedToLoadCatalog')));
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const permissions = sanitizeRolePermissions(selectedPermissions);
    if (permissions.length === 0) {
      setError(t('rbac.createRolePage.selectAtLeastOne'));
      return;
    }

    const grantablePermissions = filterGrantablePermissions(
      permissions,
      myPermissions,
      isInstituteAdmin
    );

    if (grantablePermissions.length === 0) {
      setError(t('rbac.createRolePage.onlyAssignOwnPermissions'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createRole({
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissions: grantablePermissions,
      });
      navigate('/library/roles');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, t('rbac.createRolePage.failedToCreate')));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('rbac.createRolePage.title')}</h1>
          <p className="text-slate-600 mt-1">{t('rbac.createRolePage.subtitle')}</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">{t('rbac.createRolePage.loadingPermissions')}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('rbac.createRolePage.title')}</h1>
        <p className="text-slate-600 mt-1">{t('rbac.createRolePage.subtitle')}</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!config.apiToken?.trim() && !localStorage.getItem('accessToken') && !moduleSessions.library.isAuthenticated() && (
            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
              {t('rbac.createRolePage.tokenWarning')}
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('rbac.roleFormFields.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  placeholder={t('rbac.roleFormFields.namePlaceholder')}
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('rbac.roleFormFields.description')}
                </label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  placeholder={t('rbac.roleFormFields.descriptionPlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('rbac.createRolePage.permissions')}</h3>
              <ResourcePermissionsToggle
                resources={resources}
                selectedPermissions={selectedPermissions}
                onChange={setSelectedPermissions}
                myPermissions={myPermissions}
                isInstituteAdmin={isInstituteAdmin}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/library/roles')}
                disabled={submitting}
              >
                {tc('actions.cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? tc('status.creating') : t('rbac.createRolePage.submit')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
