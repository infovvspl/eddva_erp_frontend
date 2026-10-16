import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { createCategory } from '../../api/library.api';
import type { CategoryFormData } from '../../types/library.types';
import { ROUTES } from '../../../../constants/routes';

export default function CreateCategoryPage() {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createCategory(formData);
      navigate(ROUTES.LIBRARY_CATEGORIES);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err.response?.data?.message || t('categories.createPage.failedToCreate'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('categories.createPage.title')}</h1>
        <p className="text-slate-600 mt-1">{t('categories.createPage.subtitle')}</p>
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
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                {t('categories.formFields.name')}
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('categories.formFields.namePlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(ROUTES.LIBRARY_CATEGORIES)}
                disabled={submitting}
              >
                {tc('actions.cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? tc('status.creating') : t('categories.createPage.submit')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}