import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { createMembershipRule, getMembershipRules } from '../../api/library.api';
import type { MembershipRuleFormData } from '../../types/library.types';
import { ROUTES } from '../../../../constants/routes';

export default function CreateMembershipRulePage() {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();

  const MEMBER_TYPES = [
    { value: 'student', label: t('membershipRules.formFields.memberTypeStudent') },
    { value: 'staff', label: t('membershipRules.formFields.memberTypeStaff') },
    { value: 'faculty', label: t('membershipRules.formFields.memberTypeFaculty') },
  ];
  const [formData, setFormData] = useState<MembershipRuleFormData>({
    member_type: '',
    max_books_allowed: 3,
    loan_period_days: 14,
    fine_per_day: 2.5,
    grace_period_days: 2,
    max_fine_cap: 100
  });
  const [existingTypes, setExistingTypes] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMembershipRules()
      .then((rules) => setExistingTypes(new Set(rules.map((r) => r.member_type))))
      .catch((err) => console.error('Failed to load existing membership rules:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createMembershipRule(formData);
      navigate(ROUTES.LIBRARY_MEMBERSHIP_RULES);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err.response?.data?.error?.message || err.response?.data?.message || t('membershipRules.createPage.failedToCreate'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('membershipRules.createPage.title')}</h1>
        <p className="text-slate-600 mt-1">{t('membershipRules.createPage.subtitle')}</p>
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
              <label htmlFor="member_type" className="block text-sm font-medium text-slate-700 mb-1">
                {t('membershipRules.formFields.memberType')}
              </label>
              <select
                id="member_type"
                value={formData.member_type}
                onChange={(e) => setFormData({ ...formData, member_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              >
                <option value="">{t('membershipRules.formFields.selectMemberType')}</option>
                {MEMBER_TYPES.map((mt) => (
                  <option key={mt.value} value={mt.value} disabled={existingTypes.has(mt.value)}>
                    {mt.label}{existingTypes.has(mt.value) ? t('membershipRules.formFields.ruleExistsSuffix') : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="max_books_allowed" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('membershipRules.formFields.maxBooksAllowed')}
                </label>
                <input
                  type="number"
                  id="max_books_allowed"
                  value={formData.max_books_allowed}
                  onChange={(e) => setFormData({ ...formData, max_books_allowed: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="loan_period_days" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('membershipRules.formFields.loanPeriodDays')}
                </label>
                <input
                  type="number"
                  id="loan_period_days"
                  value={formData.loan_period_days}
                  onChange={(e) => setFormData({ ...formData, loan_period_days: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="fine_per_day" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('membershipRules.formFields.finePerDay')}
                </label>
                <input
                  type="number"
                  id="fine_per_day"
                  value={formData.fine_per_day}
                  onChange={(e) => setFormData({ ...formData, fine_per_day: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="grace_period_days" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('membershipRules.formFields.gracePeriodDays')}
                </label>
                <input
                  type="number"
                  id="grace_period_days"
                  value={formData.grace_period_days}
                  onChange={(e) => setFormData({ ...formData, grace_period_days: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="max_fine_cap" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('membershipRules.formFields.maxFineCap')}
                </label>
                <input
                  type="number"
                  id="max_fine_cap"
                  value={formData.max_fine_cap}
                  onChange={(e) => setFormData({ ...formData, max_fine_cap: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(ROUTES.LIBRARY_MEMBERSHIP_RULES)}
                disabled={submitting}
              >
                {tc('actions.cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? tc('status.creating') : t('membershipRules.createPage.submit')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}