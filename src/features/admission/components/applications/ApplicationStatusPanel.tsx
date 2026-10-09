import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import { changeApplicationStatus } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatLabel } from '../../utils/format';
import type { ApplicationStatus, ApplicationStatusInfo } from '../../types/admission.types';

interface ApplicationStatusPanelProps {
  info: ApplicationStatusInfo;
  // Refetches the application and its status info.
  onChanged: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

// Offered / admitted are reached through the Offer and Confirmation workflows only.
const WORKFLOW_ONLY: ApplicationStatus[] = ['offered', 'admitted'];
const REASON_REQUIRED: ApplicationStatus[] = ['rejected', 'cancelled'];
// These targets need "applications:review" on top of "applications:change_status".
const REVIEW_TARGETS: ApplicationStatus[] = ['under_review', 'shortlisted', 'waitlisted', 'rejected'];

function errorCode(err: any): string | undefined {
  return err?.response?.data?.error?.code ?? err?.response?.data?.code;
}

// Mount with a key that changes with the status, so the inputs reset after a save.
export default function ApplicationStatusPanel({ info, onChanged }: ApplicationStatusPanelProps) {
  const { toast } = useToast();
  const { can, isViewOnlyAdmin } = useResourceAccess('applications');
  const [target, setTarget] = useState<ApplicationStatus | ''>('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = (Array.isArray(info.allowed_transitions) ? info.allowed_transitions : []).filter((s) => !WORKFLOW_ONLY.includes(s));
  const canChange = can('change_status');
  const canReview = can('review');
  const rawMissing = info.supporting?.applicant_profile_missing;
  const missing = Array.isArray(rawMissing) ? rawMissing.map(String) : [];

  const blockReason = (s: ApplicationStatus): string | null => {
    if (REVIEW_TARGETS.includes(s) && !canReview) {
      return 'You need the "applications: review" permission to move an application to this status.';
    }
    if (s === 'submitted' && missing.length > 0) {
      return `Applicant profile is incomplete: ${missing.join(', ')}`;
    }
    return null;
  };

  const targetBlock = target ? blockReason(target) : null;
  const reasonRequired = target !== '' && REASON_REQUIRED.includes(target);
  const reasonMissing = reasonRequired && !reason.trim();

  const handleSave = async () => {
    if (!target || targetBlock) return;
    if (reasonMissing) {
      setError(`A reason is required to move an application to ${formatLabel(target)}.`);
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await changeApplicationStatus(info.application_id, target, reason);
      toast.success('Application status updated');
      setTarget('');
      setReason('');
      onChanged();
    } catch (err: any) {
      if (err?.response?.status === 409 || errorCode(err) === 'APPLICATION_STATUS_CONFLICT') {
        setError(
          getApiErrorMessage(err, 'Another user has already changed this application. Refresh and try again.')
        );
        setTarget('');
        onChanged();
      } else if (errorCode(err) === 'INVALID_STATUS_TRANSITION') {
        setError(getApiErrorMessage(err, 'That status change is not allowed from the current status.'));
        setTarget('');
        onChanged();
      } else if (!isAuthError(err)) {
        // Covers APPLICANT_PROFILE_INCOMPLETE and the 400 for a missing reason.
        setError(getApiErrorMessage(err, 'Failed to update status'));
        if (errorCode(err) === 'APPLICANT_PROFILE_INCOMPLETE') onChanged();
      }
    } finally {
      setSaving(false);
    }
  };

  const isFinal = options.length === 0;

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Status</h2>

        <div className="flex items-center gap-2">
          <ApplicationStatusBadge status={info.status} />
          {isFinal && <span className="text-sm text-slate-500">Final status</span>}
        </div>

        {isFinal ? (
          <p className="text-sm text-slate-500">
            {WORKFLOW_ONLY.includes(info.status)
              ? 'This status is managed through the Offer and Confirmation workflows.'
              : 'No further status changes are available.'}
          </p>
        ) : !canChange ? (
          <p className="text-sm text-slate-500">
            {isViewOnlyAdmin ? 'View-only access.' : "You don't have permission to change the status."}
          </p>
        ) : (
          <>
            <div>
              <label htmlFor="application-status" className="block text-sm font-medium text-slate-700 mb-1">
                Change status to
              </label>
              <select
                id="application-status"
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value as ApplicationStatus | '');
                  setError(null);
                }}
                className={`${inputClass} capitalize`}
              >
                <option value="">Select a status</option>
                {options.map((option) => {
                  const block = blockReason(option);
                  return (
                    <option key={option} value={option} disabled={!!block} title={block ?? undefined}>
                      {formatLabel(option)}
                      {block ? ' (unavailable)' : ''}
                    </option>
                  );
                })}
              </select>
              {!canReview && options.some((s) => REVIEW_TARGETS.includes(s)) && (
                <p className="mt-1 text-xs text-slate-500">
                  Review statuses are disabled: they need the "applications: review" permission.
                </p>
              )}
              {missing.length > 0 && options.includes('submitted') && (
                <p className="mt-1 text-xs text-amber-700">
                  Submit is disabled — applicant profile missing: {missing.join(', ')}
                </p>
              )}
            </div>

            {reasonRequired && (
              <div>
                <label htmlFor="application-reason" className="block text-sm font-medium text-slate-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="application-reason"
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Required — recorded in the status history"
                  className={inputClass}
                />
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button variant="primary" disabled={!target || !!targetBlock || reasonMissing || saving} onClick={handleSave}>
              {saving ? 'Saving...' : 'Update Status'}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
