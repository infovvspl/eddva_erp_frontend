import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import {
  getPublicFeeSummary,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPublicPaymentErrorMessage,
  type PublicFeeSummary,
} from '../../api/publicPayment.api';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PayFeePage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [searchParams] = useSearchParams();
  const applicationNumber = searchParams.get('no') || '';
  const appId = Number(applicationId);

  const [summary, setSummary] = useState<PublicFeeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!appId || !applicationNumber) {
      setError('Invalid payment link — missing application details.');
      setLoading(false);
      return;
    }
    getPublicFeeSummary(appId, applicationNumber)
      .then(setSummary)
      .catch((err) => setError(getPublicPaymentErrorMessage(err, 'Failed to load fee details')))
      .finally(() => setLoading(false));
  }, [appId, applicationNumber]);

  const handlePay = async () => {
    setError(null);
    setPaying(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Failed to load the payment gateway. Check your internet connection and try again.');

      const order = await createRazorpayOrder(appId, applicationNumber);

      const razorpay = new (window as any).Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Admission Fee Payment',
        description: `Application ${applicationNumber}`,
        prefill: { name: summary?.applicant_name },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await verifyRazorpayPayment(
              appId,
              applicationNumber,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );
            setPaid(true);
          } catch (err) {
            setError(getPublicPaymentErrorMessage(err, 'Payment was received but verification failed. Please contact the institute.'));
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
        theme: { color: '#008BE9' },
      });
      razorpay.on('payment.failed', (resp: any) => {
        setError(resp?.error?.description || 'Payment failed. Please try again.');
        setPaying(false);
      });
      razorpay.open();
    } catch (err: any) {
      setError(getPublicPaymentErrorMessage(err, 'Failed to start payment'));
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-6 w-6 text-[#008BE9]" />
          <h1 className="text-xl font-bold text-slate-900">Admission Fee Payment</h1>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 text-center py-8">Loading...</p>
        ) : paid ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-900">Payment Successful</p>
            <p className="text-sm text-slate-500 mt-1">A receipt has been sent to your registered contact.</p>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">{error}</div>}

            {summary && (
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Applicant</span>
                  <span className="font-medium text-slate-900">{summary.applicant_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Application</span>
                  <span className="font-medium text-slate-900">{summary.application_number}</span>
                </div>
                {summary.fee_structure_configured ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Fee Required</span>
                      <span className="text-slate-900">₹{Number(summary.required).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Already Paid</span>
                      <span className="text-slate-900">₹{Number(summary.paid).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-100 font-semibold">
                      <span>Balance Due</span>
                      <span className="text-lg text-[#008BE9]">₹{Number(summary.balance).toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-amber-600">No fee has been configured for this application yet. Contact the institute.</p>
                )}
              </div>
            )}

            {summary?.is_paid ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">This fee has already been paid in full.</p>
              </div>
            ) : (
              summary?.fee_structure_configured && (
                <Button className="w-full" size="lg" onClick={handlePay} disabled={paying}>
                  {paying ? 'Processing...' : `Pay ₹${Number(summary.balance).toLocaleString('en-IN')} Now`}
                </Button>
              )
            )}

            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Secured by Razorpay
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
