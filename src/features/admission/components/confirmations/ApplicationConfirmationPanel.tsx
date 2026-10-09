import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ExternalLink } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../common/AccessNotice';
import ConfirmationActions from './ConfirmationActions';
import ConfirmationDetails from './ConfirmationDetails';
import { confirmAdmission, getApplicationConfirmation } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { CONFIRMATIONS_RESOURCE } from '../../utils/confirmations';
import type { Confirmation } from '../../types/admission.types';

interface ApplicationConfirmationPanelProps {
  applicationId: number;
  applicantName: string;
  // From the status endpoint's supporting block. The backend only confirms an accepted offer.
  offerStatus?: string | null;
  // supporting.admission_fee_configured; undefined while the status is still loading.
  feeConfigured?: boolean;
  // supporting.admission_fee.is_paid / balance: confirmation needs the fee paid in full.
  feePaid?: boolean;
  feeBalance?: number | string | null;
  programId?: number;
  sessionId?: number;
  // Confirming or cancelling changes the application, so the page refreshes.
  onChanged: () => void;
}

export default function ApplicationConfirmationPanel({
  applicationId,
  applicantName,
  offerStatus,
  feeConfigured,
  feePaid,
  feeBalance,
  programId,
  sessionId,
  onChanged,
}: ApplicationConfirmationPanelProps) {
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(CONFIRMATIONS_RESOURCE);
  // undefined = still loading; null = not confirmed yet.
  const [confirmation, setConfirmation] = useState<Confirmation | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirming, setConfirming] = useState(false);
  // Set when the confirm call answers ADMISSION_FEE_NOT_CONFIGURED; carries the ids to prefill.
  const [feeError, setFeeError] = useState<{ message: string; program_id?: number; session_id?: number } | null>(null);
  const offerAccepted = offerStatus?.toLowerCase() === 'accepted';
  useEffect(() => {
    let cancelled = false;
    getApplicationConfirmation(applicationId)
      .then((data) => {
        if (cancelled) return;
        setConfirmation(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load confirmation'));
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId, reloadKey]);

  const afterChange = () => {
    setReloadKey((key) => key + 1);
    onChanged();
  };

  const handleConfirm = async () => {
    if (!window.confirm(`Confirm the admission of ${applicantName}?`)) return;
    try {
      setConfirming(true);
      await confirmAdmission(applicationId);
      toast.success('Admission confirmed');
      setFeeError(null);
      afterChange();
    } catch (err: any) {
      const apiError = err?.response?.data?.error;
      if (apiError?.code === 'ADMISSION_FEE_NOT_CONFIGURED') {
        setFeeError({
          message: getApiErrorMessage(err, 'No admission fee is configured for this program and session.'),
          program_id: apiError.details?.program_id,
          session_id: apiError.details?.session_id,
        });
        // The status endpoint's admission_fee_configured is now known to be false.
        onChanged();
      } else if (!isAuthError(err)) {
        toast.error(getApiErrorMessage(err, 'Failed to confirm admission'));
      }
    } finally {
      setConfirming(false);
    }
  };

  const feeUnpaid = feeConfigured !== false && feePaid === false;
  const missingFee = feeConfigured === false || feeError !== null;
  const feeProgramId = feeError?.program_id ?? programId;
  const feeSessionId = feeError?.session_id ?? sessionId;
  const createFeeLink =
    `/admission/fee-structures/new?` +
    new URLSearchParams({
      ...(feeProgramId != null && { program_id: String(feeProgramId) }),
      ...(feeSessionId != null && { session_id: String(feeSessionId) }),
      return_to: `/admission/applications/${applicationId}`,
    }).toString();

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Admission Confirmation</h2>
          {confirmation && (
            <Link
              to={`/admission/confirmations/${confirmation.confirmation_id}`}
              className="inline-flex items-center gap-1 text-sm text-[#008BE9] hover:underline"
            >
              Open
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
          {ready && confirmation === null && can('create') && offerAccepted && (
            <Button variant="primary" size="sm" disabled={confirming || missingFee || feeUnpaid} onClick={handleConfirm}>
              <BadgeCheck className="h-4 w-4 mr-1" />
              {confirming ? 'Confirming...' : 'Confirm Admission'}
            </Button>
          )}
        </div>

        {confirmation === null && missingFee && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 space-y-2">
            <p>{feeError?.message ?? 'No admission fee is configured for this program and session.'}</p>
            <Link to={createFeeLink} className="inline-block font-medium text-[#008BE9] hover:underline">
              Create fee structure
            </Link>
          </div>
        )}

        {confirmation === null && feeUnpaid && !missingFee && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            The admission fee must be paid in full before confirming
            {feeBalance != null ? ` (balance ${feeBalance})` : ''}. Record the payment in the Admission Fee section.
          </div>
        )}

        {/* View-only admins already get the page-level notice. */}
        {ready && !can('create') && !can('update') && !isViewOnlyAdmin && <AccessNotice isViewOnlyAdmin={false} />}

        {loadError ? (
          <div className="text-center text-red-500 py-4">{loadError}</div>
        ) : confirmation === undefined ? (
          <div className="text-center text-slate-500 py-4">Loading...</div>
        ) : confirmation ? (
          <div className="space-y-5">
            <ConfirmationDetails confirmation={confirmation} />
            <ConfirmationActions confirmation={confirmation} canUpdate={can('update')} onChanged={afterChange} />
          </div>
        ) : (
          <div className="text-center text-slate-500 py-4">
            This admission hasn't been confirmed yet
            {!offerAccepted && (
              <span className="block text-sm">It can be confirmed once the applicant's offer has been accepted.</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
