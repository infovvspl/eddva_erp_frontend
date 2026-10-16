import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import MemberTable from '../../components/members/MemberTable';
import { getMembers } from '../../api/library.api';
import type { Member } from '../../types/library.types';
import { ROUTES } from '../../../../constants/routes';

export default function MembersPage() {
  const { t } = useTranslation('library');
  const { t: tc } = useTranslation('common');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      setLoading(true);
      const data = await getMembers();
      setMembers(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : t('members.listPage.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('members.listPage.title')}</h1>
          <p className="text-slate-600 mt-1">{t('members.listPage.subtitle')}</p>
        </div>
        <Link to={ROUTES.LIBRARY_MEMBERS_NEW}>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            {t('members.listPage.addMember')}
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">{tc('status.loading')}</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <MemberTable members={members} />
        </Card>
      )}
    </div>
  );
}