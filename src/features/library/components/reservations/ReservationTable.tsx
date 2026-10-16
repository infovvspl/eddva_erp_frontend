import { Calendar, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Reservation } from '../../types/library.types';
import { cn } from '../../../../utils/cn';
import ReservationStatusBadge from './ReservationStatusBadge';

interface ReservationTableProps {
  reservations: Reservation[];
  className?: string;
  onCancel?: (reservation: Reservation) => void;
  cancellingId?: number | null;
}

const CANCELLABLE_STATUSES = ['pending', 'ready_for_pickup'];

export default function ReservationTable({ reservations, className, onCancel, cancellingId }: ReservationTableProps) {
  const { t } = useTranslation('library');
  const reservationsArray = Array.isArray(reservations) ? reservations : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('reservations.table.book')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('reservations.table.member')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('reservations.table.reserved')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('reservations.table.expiry')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('reservations.table.status')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('reservations.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {reservationsArray.length === 0 ? (
            <tr key="no-reservations">
              <td colSpan={6} className="py-8 text-center text-slate-500">
                {t('reservations.table.noReservationsFound')}
              </td>
            </tr>
          ) : (
            reservationsArray.map((reservation) => (
              <tr key={reservation.reservation_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900">
                        {reservation.book?.title ?? t('reservations.table.bookFallback', { id: reservation.book_id })}
                      </div>
                      <div className="text-xs text-slate-500">{reservation.book?.author}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {reservation.member?.name ?? `#${reservation.member_id}`}
                  {reservation.member?.library_card_number && (
                    <div className="text-xs text-slate-400">{reservation.member.library_card_number}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(reservation.reserved_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {reservation.expiry_date ? new Date(reservation.expiry_date).toLocaleDateString() : '—'}
                </td>
                <td className="py-3 px-4">
                  <ReservationStatusBadge status={reservation.status} />
                </td>
                <td className="py-3 px-4">
                  {CANCELLABLE_STATUSES.includes(reservation.status) && (
                    <button
                      onClick={() => onCancel?.(reservation)}
                      disabled={cancellingId === reservation.reservation_id}
                      className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                    >
                      {cancellingId === reservation.reservation_id ? t('reservations.table.cancelling') : t('reservations.table.cancel')}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
