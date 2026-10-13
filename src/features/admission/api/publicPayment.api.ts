import axiosInstance from '../../../lib/axios';

// No-login surface: the parent reaches this from a shared link, never signs
// in. The request still goes out with no session (see lib/axios.ts) — the
// backend proves the caller actually has the link via application_number,
// not a session.

export interface PublicFeeSummary {
  application_number: string;
  applicant_name: string;
  required: string | null;
  paid: string;
  balance: string | null;
  due_date: string | null;
  fee_structure_configured: boolean;
  is_paid: boolean;
}

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export async function getPublicFeeSummary(applicationId: number, applicationNumber: string): Promise<PublicFeeSummary> {
  const response = await axiosInstance.get(`/admission/public/fees/${applicationId}/summary`, {
    params: { application_number: applicationNumber },
  });
  return response.data.data;
}

export async function createRazorpayOrder(applicationId: number, applicationNumber: string): Promise<RazorpayOrder> {
  const response = await axiosInstance.post(`/admission/public/fees/${applicationId}/create-order`, {
    application_number: applicationNumber,
  });
  return response.data.data;
}

export async function verifyRazorpayPayment(
  applicationId: number,
  applicationNumber: string,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
) {
  const response = await axiosInstance.post(`/admission/public/fees/${applicationId}/verify`, {
    application_number: applicationNumber,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  return response.data.data;
}

export function getPublicPaymentErrorMessage(err: any, fallback: string): string {
  return err?.response?.data?.error?.message || err?.response?.data?.message || fallback;
}
