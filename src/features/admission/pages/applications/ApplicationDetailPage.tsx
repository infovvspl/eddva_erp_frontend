import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Pencil, Trash2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ApplicationFeePanel from '../../components/applications/ApplicationFeePanel';
import ApplicationHistoryPanel from '../../components/applications/ApplicationHistoryPanel';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import ApplicationStatusPanel from '../../components/applications/ApplicationStatusPanel';
import DocumentsPanel from '../../components/applications/DocumentsPanel';
import ApplicationOfferPanel from '../../components/offers/ApplicationOfferPanel';
import ApplicationConfirmationPanel from '../../components/confirmations/ApplicationConfirmationPanel';
import AdmissionFeePanel from '../../components/payments/AdmissionFeePanel';
import { deleteApplication, getApplication, getApplicationStatus } from '../../api/admission.api';
import { useProgramOptions } from '../../hooks/useProgramOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatDate, formatLabel } from '../../utils/format';
import { INTERVIEWS_RESOURCE } from '../../utils/interviews';
import type { Application, ApplicationStatusInfo, ApplicationStatusSupporting } from '../../types/admission.types';

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 break-words">{children}</dd>
    </div>
  );
}

// The supporting values may be plain strings or small objects; never hand an object to React.
function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${formatLabel(k)}: ${typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}`)
      .join(', ');
  }
  return formatLabel(String(value));
}

const PIPELINE_FIELDS: Array<[keyof ApplicationStatusSupporting, string]> = [
  ['application_fee_status', 'Application Fee'],
  ['document_status', 'Documents'],
  ['test_status', 'Test'],
  ['interview_status', 'Interview'],
  ['offer_status', 'Offer'],
  ['admission_fee', 'Admission Fee'],
  ['confirmation_status', 'Confirmation'],
];

export default function ApplicationDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('applications');
  const interviewAccess = useResourceAccess(INTERVIEWS_RESOURCE);
  const { nameOf: programName } = useProgramOptions();
  const { nameOf: sessionName } = useSessionOptions();
  const [application, setApplication] = useState<Application | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusInfo, setStatusInfo] = useState<ApplicationStatusInfo | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getApplication(id)
      .then((data) => {
        if (cancelled) return;
        setApplication(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load application'));
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  // Refetched with the application after every change: allowed_transitions depends on the status.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getApplicationStatus(id)
      .then((data) => {
        if (cancelled) return;
        setStatusInfo(data);
        setStatusError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatusInfo(null);
        setStatusError(getApiErrorMessage(err, 'Failed to load status'));
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const handleDelete = async () => {
    if (!application) return;
    if (!window.confirm('Delete this application?')) return;
    try {
      await deleteApplication(application.application_id);
      toast.success('Application deleted');
      navigate('/admission/applications');
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete application'));
    }
  };

  const backLink = (
    <Link to="/admission/applications" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
      <ArrowLeft className="h-4 w-4" />
      All applications
    </Link>
  );

  if (loadError) {
    return (
      <div className="space-y-6">
        {backLink}
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{loadError}</div>
        </Card>
      </div>
    );
  }

  if (!application || !ready) {
    return (
      <div className="space-y-6">
        {backLink}
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  const canUpdate = can('update');
  const applicant = application.applicant;

  return (
    <div className="space-y-6">
      {backLink}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {applicant?.name ?? `Applicant #${application.applicant_id}`}
          </h1>
          <ApplicationStatusBadge status={application.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          {interviewAccess.can('schedule') && (
            <Link to={`/admission/interviews/new?application_id=${application.application_id}`}>
              <Button variant="secondary">
                <CalendarClock className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            </Link>
          )}
          {canUpdate && (
            <Link to={`/admission/applications/${application.application_id}/edit`}>
              <Button variant="secondary">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
          {can('delete') && (
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {!canUpdate && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
              <dl className="space-y-4">
                <Detail label="Application #">{application.application_id}</Detail>
                <Detail label="Applicant">
                  {applicant?.name ?? `Applicant #${application.applicant_id}`}
                  {applicant?.dob && (
                    <span className="block text-sm text-slate-500">
                      Born {formatDate(applicant.dob)} · <span className="capitalize">{applicant.gender}</span>
                    </span>
                  )}
                  {applicant?.guardian_name && (
                    <span className="block text-sm text-slate-500">Guardian: {applicant.guardian_name}</span>
                  )}
                </Detail>
                <Detail label="Program">
                  {application.program?.name ?? programName(application.program_id) ?? `Program #${application.program_id}`}
                </Detail>
                <Detail label="Session">
                  {application.session?.name ?? sessionName(application.session_id) ?? `Session #${application.session_id}`}
                </Detail>
                <Detail label="Application Date">{formatDate(application.application_date)}</Detail>
                <Detail label="Status">
                  <span className="capitalize">{formatLabel(application.status)}</span>
                </Detail>
                {application.source_enquiry_id ? (
                  <Detail label="Source Enquiry">
                    <Link
                      to={`/admission/enquiries/${application.source_enquiry_id}`}
                      className="text-[#008BE9] hover:underline"
                    >
                      Enquiry #{application.source_enquiry_id}
                    </Link>
                  </Detail>
                ) : null}
              </dl>
            </div>
          </Card>

          {statusError && (
            <Card className="border-slate-200">
              <div className="p-6 text-sm text-red-500">{statusError}</div>
            </Card>
          )}
          {statusInfo && (
            <>
              <ApplicationStatusPanel
                key={statusInfo.status}
                info={statusInfo}
                onChanged={() => setReloadKey((key) => key + 1)}
              />
              <Card className="border-slate-200">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Pipeline</h2>
                  <dl className="space-y-3">
                    {PIPELINE_FIELDS.map(([key, label]) => {
                      const value = statusInfo.supporting?.[key];
                      return (
                        <Detail key={key} label={label}>
                          {key === 'admission_fee' && value && typeof value === 'object' ? (
                            <span>
                              {(value as any).is_paid ? 'Paid in full' : `Balance ${(value as any).balance ?? '—'}`}
                              <span className="block text-sm text-slate-500">
                                Paid {(value as any).paid ?? 0} of {(value as any).required ?? '—'}
                                {(value as any).due_date ? ` · due ${formatDate((value as any).due_date)}` : ''}
                              </span>
                            </span>
                          ) : (
                            <span className="capitalize">{displayValue(value)}</span>
                          )}
                          {key === 'document_status' && statusInfo.supporting?.document_summary && (
                            <span className="block text-sm text-slate-500">{displayValue(statusInfo.supporting.document_summary)}</span>
                          )}
                        </Detail>
                      );
                    })}
                  </dl>
                </div>
              </Card>
            </>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <ApplicationOfferPanel
            applicationId={application.application_id}
            applicationStatus={statusInfo?.status ?? application.status}
            onChanged={() => setReloadKey((key) => key + 1)}
          />
          <AdmissionFeePanel
            applicationId={application.application_id}
            onChanged={() => setReloadKey((key) => key + 1)}
          />
          <ApplicationConfirmationPanel
            applicationId={application.application_id}
            applicantName={applicant?.name ?? `Applicant #${application.applicant_id}`}
            offerStatus={statusInfo?.supporting?.offer_status}
            feeConfigured={statusInfo?.supporting?.admission_fee_configured}
            feePaid={statusInfo?.supporting?.admission_fee?.is_paid}
            feeBalance={statusInfo?.supporting?.admission_fee?.balance}
            programId={application.program_id}
            sessionId={application.session_id}
            onChanged={() => setReloadKey((key) => key + 1)}
          />
          <ApplicationFeePanel
            applicationId={application.application_id}
            onChanged={() => setReloadKey((key) => key + 1)}
          />
          <DocumentsPanel applicationId={application.application_id} />
          <ApplicationHistoryPanel
            applicationId={application.application_id}
            refreshKey={`${application.status}|${application.updated_at}`}
          />
        </div>
      </div>
    </div>
  );
}
