import { useTranslation } from 'react-i18next';
import Badge from '../../../../components/ui/Badge';
import type { ReservationStatus } from '../../types/library.types';

const VARIANT_BY_STATUS: Record<ReservationStatus, 'info' | 'warning' | 'success' | 'neutral' | 'danger'> = {
  pending: 'info',
  ready_for_pickup: 'warning',
  fulfilled: 'success',
  cancelled: 'neutral',
  expired: 'danger',
};

export default function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const { t } = useTranslation('library');
  const LABEL_BY_STATUS: Record<ReservationStatus, string> = {
    pending: t('reservations.statusBadge.pending'),
    ready_for_pickup: t('reservations.statusBadge.readyForPickup'),
    fulfilled: t('reservations.statusBadge.fulfilled'),
    cancelled: t('reservations.statusBadge.cancelled'),
    expired: t('reservations.statusBadge.expired'),
  };
  return <Badge variant={VARIANT_BY_STATUS[status] ?? 'neutral'}>{LABEL_BY_STATUS[status] ?? status}</Badge>;
}
