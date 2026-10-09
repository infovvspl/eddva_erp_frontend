import { getApiErrorMessage } from './errors';
import type { ApplicationStatus, Offer } from '../types/admission.types';

// RBAC resource the offer endpoints are checked against
// (offers:read / create / accept / decline).
export const OFFERS_RESOURCE = 'offers';

// An offer can only be issued while the application is shortlisted or waitlisted.
export const OFFERABLE_STATUSES: ApplicationStatus[] = ['shortlisted', 'waitlisted'];

export function offerApplicantName(offer: Offer): string {
  return offer.application?.applicant?.name ?? `Application #${offer.application_id}`;
}

// The expiry has passed. seconds_until_expiry and expiry_pending_sweep come
// from the backend; the client never runs its own clock against the date.
export function isPastExpiry(offer: Offer): boolean {
  if (offer.status === 'expired') return true;
  if (offer.status !== 'offered') return false;
  return !!offer.expiry_pending_sweep || offer.seconds_until_expiry === 0;
}

// Still waiting on the applicant's answer and not yet lapsed.
export function awaitingResponse(offer: Offer): boolean {
  return offer.status === 'offered' && !isPastExpiry(offer);
}

export function canAcceptOffer(offer: Offer): boolean {
  return awaitingResponse(offer);
}

// An offered or already-accepted offer can be declined (the server locks it
// once a payment or confirmation exists).
export function canDeclineOffer(offer: Offer): boolean {
  return (offer.status === 'offered' && !isPastExpiry(offer)) || offer.status === 'accepted';
}

// Human wording for a seconds_until_expiry value.
export function formatTimeLeft(seconds: number): string {
  if (seconds <= 0) return 'less than a minute';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${Math.max(minutes, 1)}m`;
}

const OFFER_ERROR_MESSAGES: Record<string, string> = {
  OFFER_CANNOT_BE_DECLINED: 'Contact accounts to process a refund/cancellation.',
};

// Surfaces the backend's message for each offer error code; a few get fixed wording.
export function offerErrorMessage(err: any, fallback: string): string {
  const code = err?.response?.data?.error?.code ?? err?.response?.data?.code;
  if (code && OFFER_ERROR_MESSAGES[code]) return OFFER_ERROR_MESSAGES[code];
  if (err?.response?.status === 409 && !code) {
    return getApiErrorMessage(err, 'Another user has already processed this offer. Refresh and try again.');
  }
  return getApiErrorMessage(err, fallback);
}
