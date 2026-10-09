import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import ReasonModal from '../common/ReasonModal';
import { acceptOffer, declineOffer } from '../../api/admission.api';
import { useToast } from '../../../../hooks/useToast';
import { isAuthError } from '../../utils/errors';
import { canAcceptOffer, canDeclineOffer, offerApplicantName, offerErrorMessage } from '../../utils/offers';
import type { Offer } from '../../types/admission.types';

interface OfferActionsProps {
  offer: Offer;
  canAccept: boolean;
  canDecline: boolean;
  onChanged: () => void;
}

// Staff record the applicant's answer here: they are told by phone / email / in person,
// there is no applicant login.
export default function OfferActions({ offer, canAccept, canDecline, onChanged }: OfferActionsProps) {
  const { toast } = useToast();
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showAccept = canAccept && canAcceptOffer(offer);
  const showDecline = canDecline && canDeclineOffer(offer);
  if (!showAccept && !showDecline) return null;

  const name = offerApplicantName(offer);

  const handleAccept = async () => {
    if (!window.confirm(`Mark this offer as accepted by ${name}?`)) return;
    try {
      setAccepting(true);
      await acceptOffer(offer.application_id);
      toast.success('Offer accepted');
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(offerErrorMessage(err, 'Failed to accept offer'));
      onChanged();
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async (reason: string) => {
    try {
      setSubmitting(true);
      setError(null);
      await declineOffer(offer.application_id, reason);
      toast.success('Offer declined');
      setDeclining(false);
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) setError(offerErrorMessage(err, 'Failed to decline offer'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {showAccept && (
          <Button variant="primary" disabled={accepting} onClick={handleAccept}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {accepting ? 'Accepting...' : 'Mark as Accepted'}
          </Button>
        )}
        {showDecline && (
          <Button
            variant="secondary"
            disabled={accepting}
            onClick={() => {
              setError(null);
              setDeclining(true);
            }}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Decline
          </Button>
        )}
      </div>

      {declining && (
        <ReasonModal
          title="Decline Offer"
          description={
            <>
              Record that <span className="font-medium text-slate-900">{name}</span> declined this offer. The application will be cancelled and the seat released.
            </>
          }
          placeholder="e.g. Family relocating"
          reasonRequired={false}
          maxLength={500}
          submitLabel="Decline Offer"
          submittingLabel="Declining..."
          submitting={submitting}
          error={error}
          onSubmit={handleDecline}
          onClose={() => setDeclining(false)}
        />
      )}
    </>
  );
}
