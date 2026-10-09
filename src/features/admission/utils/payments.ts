import type { AdmissionPayment } from '../types/admission.types';

// RBAC resource the admission-fee payment endpoints are checked against.
export const PAYMENTS_RESOURCE = 'admission_payments';

export function paymentApplicantName(payment: AdmissionPayment): string {
  return payment.application?.applicant?.name ?? `Application #${payment.application_id}`;
}
