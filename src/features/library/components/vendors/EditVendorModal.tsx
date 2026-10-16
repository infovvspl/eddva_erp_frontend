import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import type { BookVendor, BookVendorUpdateData } from '../../types/library.types';

interface EditVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: BookVendor | null;
  onSubmit: (id: number, data: BookVendorUpdateData) => Promise<void>;
  isLoading?: boolean;
}

export default function EditVendorModal({ isOpen, onClose, vendor, onSubmit, isLoading }: EditVendorModalProps) {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const [formData, setFormData] = useState<BookVendorUpdateData>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vendor) {
      setFormData({
        vendor_name: vendor.vendor_name,
        name: vendor.name,
        contact_person: vendor.contact_person,
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
        last_purchase_price: Number(vendor.last_purchase_price),
      });
    }
  }, [vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;
    setError(null);
    try {
      await onSubmit(vendor.book_vendor_id || vendor.id, formData);
    } catch (err: any) {
      setError(err.message || t('vendors.editModal.failedToUpdate'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('vendors.editModal.title')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.editModal.vendorName')}</label>
          <input
            type="text"
            value={formData.vendor_name || ''}
            onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('vendors.editModal.vendorNamePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.editModal.name')}</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('vendors.editModal.vendorNamePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.editModal.contactPerson')}</label>
          <input
            type="text"
            value={formData.contact_person || ''}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('vendors.editModal.contactPersonPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.editModal.phone')}</label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('vendors.editModal.phonePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.editModal.email')}</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('vendors.editModal.emailPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.editModal.address')}</label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('vendors.editModal.addressPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.editModal.lastPurchasePrice')}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.last_purchase_price || 0}
            onChange={(e) => setFormData({ ...formData, last_purchase_price: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {tc('actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? t('vendors.editModal.updating') : t('vendors.editModal.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
