import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VendorForm from '../../components/vendors/VendorForm';
import { getVendor, updateVendor } from '../../api/sales-purchase.api';
import type { VendorFormData } from '../../types/sales-purchase.types';

export default function EditVendorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<VendorFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(vendorId: string) {
    try {
      setLoading(true);
      const data = await getVendor(vendorId);
      setDefaultValues({
        vendorName: data.vendorName,
        gstin: data.gstin,
        taxId: data.taxId,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        paymentTermId: data.paymentTermId,
        creditLimit: data.creditLimit,
        status: data.status,
        contacts: data.contacts,
        bankDetails: data.bankDetails,
      });
    } catch (error: any) {
      console.error('Failed to load data:', error);
      if (error.response?.status === 401) {
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: VendorFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateVendor(id, data);
      navigate('/sales-purchase/vendors');
    } catch (error: any) {
      console.error('Failed to update vendor:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/vendors">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Vendor</h1>
          <p className="text-slate-600 mt-1">Update vendor information</p>
        </div>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="p-6">
            {defaultValues && (
              <VendorForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Vendor"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
