import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import type { Fine, FinePayFormData } from '../../types/library.types';

interface PayFineModalProps {
  isOpen: boolean;
  onClose: () => void;
  fine: Fine | null;
  onSubmit: (id: number, data: FinePayFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function PayFineModal({ isOpen, onClose, fine, onSubmit, isLoading }: PayFineModalProps) {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const [formData, setFormData] = useState<FinePayFormData>({
    amount_paid: 0,
    payment_mode: 'cash',
    transaction_ref: '',
    received_by: 1,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fine) return;
    setError(null);
    try {
      await onSubmit(fine.fine_id, formData);
      setFormData({
        amount_paid: 0,
        payment_mode: 'cash',
        transaction_ref: '',
        received_by: 1,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || t('fines.payModal.failedToPay'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('fines.payModal.title')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {fine && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="text-sm text-slate-600">
              <span className="font-medium">{t('fines.payModal.totalFineAmount')}</span> ₹{fine.amount.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              <span className="font-medium">{t('fines.payModal.alreadyPaid')}</span> ₹{fine.amount_paid.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              <span className="font-medium">{t('fines.payModal.remaining')}</span> ₹{(fine.amount - fine.amount_paid).toFixed(2)}
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('fines.payModal.amountToPay')}</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.amount_paid}
            onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('fines.payModal.paymentMode')}</label>
          <select
            required
            value={formData.payment_mode}
            onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="cash">{t('fines.paymentModes.cash')}</option>
            <option value="card">{t('fines.paymentModes.card')}</option>
            <option value="upi">{t('fines.paymentModes.upi')}</option>
            <option value="bank_transfer">{t('fines.paymentModes.bank_transfer')}</option>
            <option value="cheque">{t('fines.paymentModes.cheque')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('fines.payModal.transactionRef')}</label>
          <input
            type="text"
            required
            value={formData.transaction_ref}
            onChange={(e) => setFormData({ ...formData, transaction_ref: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('fines.payModal.transactionRefPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('fines.payModal.receivedBy')}</label>
          <input
            type="number"
            required
            value={formData.received_by}
            onChange={(e) => setFormData({ ...formData, received_by: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 1"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {tc('actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? t('fines.payModal.processing') : t('fines.payModal.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
