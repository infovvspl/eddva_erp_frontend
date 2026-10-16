import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getMember, getMemberCurrentIssues, getMemberFines, waiveFine, payFine, getFine } from '../../api/library.api';
import type { Member, BookIssue, Fine, FineWaiveFormData, FinePayFormData } from '../../types/library.types';
import { ROUTES } from '../../../../constants/routes';
import FineTable from '../../components/fines/FineTable';
import WaiveFineModal from '../../components/fines/WaiveFineModal';
import PayFineModal from '../../components/fines/PayFineModal';

export default function MemberDetailsPage() {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [currentIssues, setCurrentIssues] = useState<BookIssue[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [isWaiveModalOpen, setIsWaiveModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const [memberData, issuesData, finesData] = await Promise.all([
        getMember(id),
        getMemberCurrentIssues(id),
        getMemberFines(id)
      ]);
      setMember(memberData);
      setCurrentIssues(issuesData);
      setFines(finesData);
      console.log('Fines data:', finesData);
      if (finesData.length > 0) {
        console.log('First fine:', finesData[0]);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : t('members.detailsPage.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }

  async function handleWaiveFine(fineId: number, data: FineWaiveFormData) {
    try {
      setIsSubmitting(true);
      await waiveFine(fineId, data);
      // Refresh the specific fine
      const updatedFine = await getFine(fineId);
      setFines(fines.map(f => f.fine_id === fineId ? updatedFine : f));
      setIsWaiveModalOpen(false);
      setSelectedFine(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      console.error('Failed to waive fine:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePayFine(fineId: number, data: FinePayFormData) {
    try {
      setIsSubmitting(true);
      await payFine(fineId, data);
      // Refresh the specific fine
      const updatedFine = await getFine(fineId);
      setFines(fines.map(f => f.fine_id === fineId ? updatedFine : f));
      setIsPayModalOpen(false);
      setSelectedFine(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      console.error('Failed to pay fine:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleWaiveClick(fine: Fine) {
    setSelectedFine(fine);
    setIsWaiveModalOpen(true);
  }

  function handlePayClick(fine: Fine) {
    setSelectedFine(fine);
    setIsPayModalOpen(true);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('members.detailsPage.title')}</h1>
          <p className="text-slate-600 mt-1">{t('members.detailsPage.subtitle')}</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">{tc('status.loading')}</div>
        </Card>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('members.detailsPage.title')}</h1>
          <p className="text-slate-600 mt-1">{t('members.detailsPage.subtitle')}</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error || t('members.detailsPage.memberNotFound')}</div>
        </Card>
      </div>
    );
  }

  const totalFines = fines.reduce((sum, fine) => sum + (fine.paid ? 0 : fine.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={ROUTES.LIBRARY_MEMBERS}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('members.detailsPage.backToMembers')}
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('members.detailsPage.title')}</h1>
          <p className="text-slate-600 mt-1">{t('members.detailsPage.subtitle')}</p>
        </div>
      </div>

      {/* Member Info Card */}
      <Card className="border-slate-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">{t('members.table.externalRefId')}</p>
              <p className="font-mono text-slate-900">{member.external_ref_id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">{t('members.table.name')}</p>
              <p className="font-medium text-slate-900">{member.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">{t('members.table.memberType')}</p>
              <p className="capitalize text-slate-900">{member.member_type}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">{t('members.table.joinedDate')}</p>
              <p className="text-slate-900">{new Date(member.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Current Issues Card */}
      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t('members.detailsPage.currentBookIssues')}
            </h2>
            <span className="text-sm text-slate-600">{t('members.detailsPage.bookCount', { count: currentIssues.length })}</span>
          </div>
          {currentIssues.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {t('members.detailsPage.noCurrentIssues')}
            </div>
          ) : (
            <div className="space-y-3">
              {currentIssues.map((issue) => (
                <div key={issue.issue_id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">{issue.book_title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{t('members.detailsPage.issuedLabel', { date: new Date(issue.issue_date).toLocaleDateString() })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{t('members.detailsPage.dueLabel', { date: new Date(issue.due_date).toLocaleDateString() })}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      issue.status === 'overdue' 
                        ? 'bg-red-100 text-red-700' 
                        : issue.status === 'returned'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {issue.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Fines Card */}
      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('members.detailsPage.fines')}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">{t('members.detailsPage.totalOutstanding')}</span>
              <span className="text-lg font-bold text-red-600">₹{totalFines.toFixed(2)}</span>
            </div>
          </div>
          <FineTable
            fines={fines}
            onWaive={handleWaiveClick}
            onPay={handlePayClick}
          />
        </div>
      </Card>

      {/* Modals */}
      <WaiveFineModal
        isOpen={isWaiveModalOpen}
        onClose={() => setIsWaiveModalOpen(false)}
        fine={selectedFine}
        onSubmit={handleWaiveFine}
        isLoading={isSubmitting}
      />
      <PayFineModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        fine={selectedFine}
        onSubmit={handlePayFine}
        isLoading={isSubmitting}
      />
    </div>
  );
}