import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getVendorMasterList } from '../../api/library.api';
import type { BookVendorFormData, VendorMaster } from '../../types/library.types';

interface CreateVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookVendorFormData) => Promise<void>;
  isLoading?: boolean;
}

const emptyForm: BookVendorFormData = {
  vendor_name: '',
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  last_purchase_price: 0,
};

export default function CreateVendorModal({ isOpen, onClose, onSubmit, isLoading }: CreateVendorModalProps) {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  // Picking an existing vendor avoids retyping the same contact details for
  // every book bought from them; "new" is for a vendor not seen before.
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [vendors, setVendors] = useState<VendorMaster[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [lastPurchasePrice, setLastPurchasePrice] = useState(0);
  const [formData, setFormData] = useState<BookVendorFormData>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setVendorsLoading(true);
    getVendorMasterList()
      .then((list) => {
        setVendors(list);
        setMode(list.length > 0 ? 'existing' : 'new');
      })
      .catch(() => setVendors([]))
      .finally(() => setVendorsLoading(false));
  }, [isOpen]);

  const reset = () => {
    setFormData(emptyForm);
    setSelectedVendorId('');
    setLastPurchasePrice(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'existing') {
        if (!selectedVendorId) {
          setError(t('vendors.createModal.selectVendorRequired', { defaultValue: 'Select a vendor' }));
          return;
        }
        await onSubmit({ ...emptyForm, vendor_id: Number(selectedVendorId), last_purchase_price: lastPurchasePrice });
      } else {
        await onSubmit(formData);
      }
      reset();
    } catch (err: any) {
      setError(err.message || t('vendors.createModal.failedToCreate'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('vendors.createModal.title')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {vendors.length > 0 && (
          <div className="flex gap-1 text-sm border border-slate-200 rounded-lg p-1 w-fit">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`px-3 py-1 rounded-md ${mode === 'existing' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}
            >
              {t('vendors.createModal.selectExisting', { defaultValue: 'Select existing' })}
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`px-3 py-1 rounded-md ${mode === 'new' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}
            >
              {t('vendors.createModal.addNew', { defaultValue: 'Add new vendor' })}
            </button>
          </div>
        )}

        {mode === 'existing' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.createModal.vendorName')}</label>
              <select
                required
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                disabled={vendorsLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{vendorsLoading ? t('vendors.createModal.adding') : t('vendors.createModal.vendorNamePlaceholder')}</option>
                {vendors.map((v) => (
                  <option key={v.vendor_id} value={v.vendor_id}>
                    {v.vendor_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.createModal.lastPurchasePrice')}</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={lastPurchasePrice}
                onChange={(e) => setLastPurchasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.createModal.vendorName')}</label>
              <input
                type="text"
                required
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('vendors.createModal.vendorNamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.createModal.name')}</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('vendors.createModal.vendorNamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.createModal.contactPerson')}</label>
              <input
                type="text"
                required
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('vendors.createModal.contactPersonPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.createModal.phone')}</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('vendors.createModal.phonePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.createModal.email')}</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('vendors.createModal.emailPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.createModal.address')}</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('vendors.createModal.addressPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('vendors.createModal.lastPurchasePrice')}</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.last_purchase_price}
                onChange={(e) => setFormData({ ...formData, last_purchase_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {tc('actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? t('vendors.createModal.adding') : t('vendors.createModal.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
