import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Fine } from '../../types/library.types';
import { cn } from '../../../../utils/cn';

interface FineTableProps {
  fines: Fine[];
  className?: string;
  onWaive?: (fine: Fine) => void;
  onPay?: (fine: Fine) => void;
}

export default function FineTable({ fines, className, onWaive, onPay }: FineTableProps) {
  const { t } = useTranslation('library');
  const finesArray = Array.isArray(fines) ? fines : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('fines.table.reason')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('fines.table.amount')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('fines.table.paid')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('fines.table.status')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('fines.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {finesArray.length === 0 ? (
            <tr key="no-fines">
              <td colSpan={5} className="py-8 text-center text-slate-500">
                {t('fines.table.noFinesFound')}
              </td>
            </tr>
          ) : (
            finesArray.map((fine) => (
              <tr key={fine.fine_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="text-sm text-slate-900">{fine.reason}</div>
                  <div className="text-xs text-slate-500">{new Date(fine.created_at).toLocaleDateString()}</div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {fine.amount.toFixed(2)}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {fine.amount_paid.toFixed(2)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {fine.waived ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      <XCircle className="h-3 w-3" />
                      {t('fines.table.waived')}
                    </span>
                  ) : fine.paid ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      {t('fines.table.paidStatus')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      <Clock className="h-3 w-3" />
                      {t('fines.table.pending')}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {!fine.paid && !fine.waived && (
                      <>
                        <button
                          onClick={() => onPay?.(fine)}
                          className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          title={t('fines.table.payFineTitle')}
                        >
                          {t('fines.table.pay')}
                        </button>
                        <button
                          onClick={() => onWaive?.(fine)}
                          className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                          title={t('fines.table.waiveFineTitle')}
                        >
                          {t('fines.table.waive')}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
