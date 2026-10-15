import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Clock, User, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { useToast } from '../../../../hooks/useToast';
import { getIssue, returnIssue, renewIssue } from '../../api/issues.api';
import { getApiErrorMessage } from '../../utils/apiError';
import IssueStatusBadge from '../../components/issues/IssueStatusBadge';
import ReturnIssueModal from '../../components/issues/ReturnIssueModal';
import RenewIssueModal from '../../components/issues/RenewIssueModal';
import FineTable from '../../components/fines/FineTable';
import type { IssueDetail, BookIssueReturnData, BookIssueRenewData } from '../../types/library.types';

export default function IssueDetailPage() {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getIssue(id);
      setIssue(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, t('issues.detailPage.failedToLoad')));
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn(issueId: number, data: BookIssueReturnData) {
    setIsSubmitting(true);
    try {
      const result = await returnIssue(issueId, data);
      await load();
      setIsReturnModalOpen(false);
      toast.success(result.fine ? t('issues.activeListPage.returnedWithFine', { amount: result.fine.amount }) : t('issues.activeListPage.returnedNoFine'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRenew(issueId: number, data: BookIssueRenewData) {
    setIsSubmitting(true);
    try {
      await renewIssue(issueId, data);
      await load();
      setIsRenewModalOpen(false);
      toast.success(t('issues.activeListPage.issueRenewed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">{tc('status.loading')}</div>;
  }

  if (!issue) {
    return <div className="text-center py-8 text-slate-500">{t('issues.detailPage.notFound')}</div>;
  }

  const isActive = !issue.return_date;

  return (
    <div className="space-y-6">
      <Link to="/library/issues" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> {t('issues.detailPage.backToIssues')}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {t('issues.detailPage.issueHeading', { id: issue.issue_id })}
            <IssueStatusBadge status={issue.status} dueDate={issue.due_date} returnDate={issue.return_date} />
          </h1>
          <p className="text-slate-600 mt-1">{issue.copy?.book?.title ?? issue.book_title}</p>
        </div>
        {isActive && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsRenewModalOpen(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('issues.detailPage.renew')}
            </Button>
            <Button onClick={() => setIsReturnModalOpen(true)}>{t('issues.detailPage.returnBook')}</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              {t('issues.detailPage.copyAndBook')}
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p><span className="font-medium text-slate-900">{t('issues.detailPage.titleLabel')}</span> {issue.copy?.book?.title ?? issue.book_title}</p>
              <p><span className="font-medium text-slate-900">{t('issues.detailPage.authorLabel')}</span> {issue.copy?.book?.author ?? '—'}</p>
              <p><span className="font-medium text-slate-900">{t('issues.detailPage.copyIdLabel')}</span> {issue.copy_id}</p>
              <p><span className="font-medium text-slate-900">{t('issues.detailPage.barcodeLabel')}</span> {issue.copy?.barcode ?? '—'}</p>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200">
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {t('issues.detailPage.member')}
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p><span className="font-medium text-slate-900">{t('issues.detailPage.nameLabel')}</span> {issue.member?.name ?? t('issues.detailPage.memberFallback', { id: issue.member_id })}</p>
              <p><span className="font-medium text-slate-900">{t('issues.detailPage.cardLabel')}</span> {issue.member?.library_card_number ?? '—'}</p>
              <p><span className="font-medium text-slate-900">{t('issues.detailPage.typeLabel')}</span> {issue.member?.member_type ?? '—'}</p>
              {issue.member && (
                <Link to={`/library/members/${issue.member_id}`} className="text-blue-600 hover:underline text-sm">
                  {t('issues.detailPage.viewMemberProfile')}
                </Link>
              )}
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 lg:col-span-2">
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              {t('issues.detailPage.loanTimeline')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500">{t('issues.detailPage.issued')}</p>
                <p className="font-medium text-slate-900">{new Date(issue.issue_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {t('issues.detailPage.due')}</p>
                <p className="font-medium text-slate-900">{new Date(issue.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-500">{t('issues.detailPage.returned')}</p>
                <p className="font-medium text-slate-900">{issue.return_date ? new Date(issue.return_date).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <p className="text-slate-500">{t('issues.detailPage.renewals')}</p>
                <p className="font-medium text-slate-900">{issue.renewal_count ?? 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 lg:col-span-2">
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">{t('issues.detailPage.fineHistory')}</h3>
            <FineTable fines={issue.fines ?? []} />
          </div>
        </Card>
      </div>

      <ReturnIssueModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        issue={issue}
        onSubmit={handleReturn}
        isLoading={isSubmitting}
      />
      <RenewIssueModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        issue={issue}
        onSubmit={handleRenew}
        isLoading={isSubmitting}
      />
    </div>
  );
}
