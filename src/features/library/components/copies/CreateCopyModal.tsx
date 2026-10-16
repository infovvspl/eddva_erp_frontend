import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import type { BookCopyFormData } from '../../types/library.types';

interface CreateCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookCopyFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateCopyModal({ isOpen, onClose, onSubmit, isLoading }: CreateCopyModalProps) {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const [formData, setFormData] = useState<BookCopyFormData>({
    barcode: '',
    rack_location: '',
    condition: 'new',
    acquired_date: new Date().toISOString().split('T')[0],
    price: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
      setFormData({
        barcode: '',
        rack_location: '',
        condition: 'new',
        acquired_date: new Date().toISOString().split('T')[0],
        price: 0,
      });
    } catch (err: any) {
      setError(err.message || t('copies.createModal.failedToCreate'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('copies.createModal.title')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('copies.createModal.barcode')}</label>
          <input
            type="text"
            required
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('copies.createModal.barcodePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('copies.createModal.rackLocation')}</label>
          <input
            type="text"
            required
            value={formData.rack_location}
            onChange={(e) => setFormData({ ...formData, rack_location: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('copies.createModal.rackLocationPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('copies.createModal.condition')}</label>
          <select
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="new">{t('copies.conditions.new')}</option>
            <option value="good">{t('copies.conditions.good')}</option>
            <option value="fair">{t('copies.conditions.fair')}</option>
            <option value="poor">{t('copies.conditions.poor')}</option>
            <option value="damaged">{t('copies.conditions.damaged')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('copies.createModal.acquiredDate')}</label>
          <input
            type="date"
            required
            value={formData.acquired_date}
            onChange={(e) => setFormData({ ...formData, acquired_date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('copies.createModal.price')}</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {tc('actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? t('copies.createModal.adding') : t('copies.createModal.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
