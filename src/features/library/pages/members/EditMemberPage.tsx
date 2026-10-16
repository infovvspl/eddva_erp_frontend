import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getMember, updateMember } from '../../api/library.api';
import type { MemberFormData } from '../../types/library.types';
import { ROUTES } from '../../../../constants/routes';

export default function EditMemberPage() {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<MemberFormData>({
    external_ref_id: '',
    name: '',
    member_type: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getMember(id);
      setFormData({
        external_ref_id: data.external_ref_id,
        name: data.name,
        member_type: data.member_type
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : t('members.editPage.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateMember(id, formData);
      navigate(ROUTES.LIBRARY_MEMBERS);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err.response?.data?.message || t('members.editPage.failedToUpdate'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('members.editPage.title')}</h1>
          <p className="text-slate-600 mt-1">{t('members.editPage.subtitle')}</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">{tc('status.loading')}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('members.editPage.title')}</h1>
        <p className="text-slate-600 mt-1">{t('members.editPage.subtitle')}</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="external_ref_id" className="block text-sm font-medium text-slate-700 mb-1">
                {t('members.formFields.externalRefId')}
              </label>
              <input
                type="text"
                id="external_ref_id"
                value={formData.external_ref_id}
                onChange={(e) => setFormData({ ...formData, external_ref_id: e.target.value })}
                placeholder={t('members.formFields.externalRefIdPlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                {t('members.formFields.name')}
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('members.formFields.namePlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="member_type" className="block text-sm font-medium text-slate-700 mb-1">
                {t('members.formFields.memberType')}
              </label>
              <select
                id="member_type"
                value={formData.member_type}
                onChange={(e) => setFormData({ ...formData, member_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              >
                <option value="">{t('members.formFields.selectMemberType')}</option>
                <option value="student">{t('members.formFields.memberTypeStudent')}</option>
                <option value="teacher">{t('members.formFields.memberTypeTeacher')}</option>
                <option value="staff">{t('members.formFields.memberTypeStaff')}</option>
                <option value="guest">{t('members.formFields.memberTypeGuest')}</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(ROUTES.LIBRARY_MEMBERS)}
                disabled={submitting}
              >
                {tc('actions.cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? tc('status.saving') : t('members.editPage.submit')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}