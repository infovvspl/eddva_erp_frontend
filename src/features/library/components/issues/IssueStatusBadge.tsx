import { useTranslation } from 'react-i18next';
import Badge from '../../../../components/ui/Badge';
import type { IssueStatus } from '../../types/library.types';

const VARIANT_BY_STATUS: Record<IssueStatus, 'info' | 'danger' | 'success'> = {
  issued: 'info',
  overdue: 'danger',
  returned: 'success',
};

interface IssueStatusBadgeProps {
  status: IssueStatus;
  // Computes a live overdue flag from the due date instead of relying only on
  // the stored `status`, which a nightly batch job updates — so a book due
  // today/yesterday still shows "issued" (not overdue) until that job runs.
  dueDate?: string;
  returnDate?: string | null;
}

export default function IssueStatusBadge({ status, dueDate, returnDate }: IssueStatusBadgeProps) {
  const { t } = useTranslation('library');
  const LABEL_BY_STATUS: Record<IssueStatus, string> = {
    issued: t('issues.statusBadge.issued'),
    overdue: t('issues.statusBadge.overdue'),
    returned: t('issues.statusBadge.returned'),
  };

  let effectiveStatus = status;
  let overdueDays = 0;
  if (status === 'issued' && !returnDate && dueDate) {
    const due = new Date(dueDate);
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.floor((Date.now() - due.getTime()) / msPerDay);
    if (days > 0) {
      effectiveStatus = 'overdue';
      overdueDays = days;
    }
  }

  const label = LABEL_BY_STATUS[effectiveStatus] ?? effectiveStatus;
  return (
    <Badge variant={VARIANT_BY_STATUS[effectiveStatus] ?? 'neutral'}>
      {overdueDays > 0 ? `${label} · ${overdueDays}d` : label}
    </Badge>
  );
}
