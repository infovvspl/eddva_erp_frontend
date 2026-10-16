import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { useLibrarianStore } from '../../stores/librarian.store';
import { getApiErrorMessage } from '../../utils/apiError';
import type { BookIssue, BookIssueRenewData } from '../../types/library.types';

interface RenewIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: BookIssue | null;
  onSubmit: (id: number, data: BookIssueRenewData) => Promise<void>;
  isLoading?: boolean;
}

export default function RenewIssueModal({ isOpen, onClose, issue, onSubmit, isLoading }: RenewIssueModalProps) {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const { librarianId } = useLibrarianStore();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!issue) return;
    setError(null);
    try {
      await onSubmit(issue.issue_id, { renewed_by: librarianId });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, t('issues.renewModal.failedToRenew')));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('issues.renewModal.title')} size="lg">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {issue && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="text-sm text-slate-600">
              <span className="font-medium">{t('issues.renewModal.book')}</span> {issue.book_title}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              <span className="font-medium">{t('issues.renewModal.copyId')}</span> {issue.copy_id}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              <span className="font-medium">{t('issues.renewModal.currentDueDate')}</span> {new Date(issue.due_date).toLocaleDateString()}
            </div>
            {issue.renewal_count !== undefined && (
              <div className="text-sm text-slate-600 mt-1">
                <span className="font-medium">{t('issues.renewModal.renewalCount')}</span> {issue.renewal_count}
              </div>
            )}
          </div>
        )}
        <p className="text-sm text-slate-500">{t('issues.renewModal.confirmPrompt')}</p>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {tc('actions.cancel')}
          </Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? t('issues.renewModal.renewing') : t('issues.renewModal.submit')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
