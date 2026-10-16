import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { useToast } from '../../../../hooks/useToast';
import { getReservations, cancelReservation } from '../../api/reservations.api';
import { getApiErrorMessage } from '../../utils/apiError';
import ReservationTable from '../../components/reservations/ReservationTable';
import type { Reservation, ReservationStatus } from '../../types/library.types';

export default function ReservationsPage() {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const { toast } = useToast();

  const STATUS_OPTIONS = [
    { value: '', label: t('reservations.listPage.allStatuses') },
    { value: 'pending', label: t('reservations.statusBadge.pending') },
    { value: 'ready_for_pickup', label: t('reservations.statusBadge.readyForPickup') },
    { value: 'fulfilled', label: t('reservations.statusBadge.fulfilled') },
    { value: 'cancelled', label: t('reservations.statusBadge.cancelled') },
    { value: 'expired', label: t('reservations.statusBadge.expired') },
  ];
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    loadReservations();
  }, [statusFilter]);

  async function loadReservations() {
    try {
      setLoading(true);
      const data = await getReservations(statusFilter || undefined);
      setReservations(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, t('reservations.listPage.failedToLoad')));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(reservation: Reservation) {
    setCancellingId(reservation.reservation_id);
    try {
      await cancelReservation(reservation.reservation_id);
      await loadReservations();
      toast.success(t('reservations.listPage.cancelled'));
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, t('reservations.listPage.failedToCancel')));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('reservations.listPage.title')}</h1>
        <p className="text-slate-600 mt-1">{t('reservations.listPage.subtitle')}</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | '')}
              options={STATUS_OPTIONS}
              className="w-52"
            />
            <span className="text-sm text-slate-600">{t('reservations.listPage.reservationCount', { count: reservations.length })}</span>
          </div>
          {loading ? (
            <div className="text-center py-8 text-slate-500">{tc('status.loading')}</div>
          ) : (
            <ReservationTable
              reservations={reservations}
              onCancel={handleCancel}
              cancellingId={cancellingId}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
