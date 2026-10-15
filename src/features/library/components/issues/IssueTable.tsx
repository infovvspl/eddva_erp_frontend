import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Clock, RotateCcw, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BookIssue } from '../../types/library.types';
import { cn } from '../../../../utils/cn';
import IssueStatusBadge from './IssueStatusBadge';

interface IssueTableProps {
  issues: BookIssue[];
  className?: string;
  onReturn?: (issue: BookIssue) => void;
  onRenew?: (issue: BookIssue) => void;
}

export default function IssueTable({ issues, className, onReturn, onRenew }: IssueTableProps) {
  const { t } = useTranslation('library');
  const navigate = useNavigate();
  const issuesArray = Array.isArray(issues) ? issues : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('issues.table.book')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('issues.table.memberId')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('issues.table.issued')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('issues.table.due')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('issues.table.returned')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('issues.table.status')}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{t('issues.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {issuesArray.length === 0 ? (
            <tr key="no-issues">
              <td colSpan={7} className="py-8 text-center text-slate-500">
                {t('issues.table.noIssuesFound')}
              </td>
            </tr>
          ) : (
            issuesArray.map((issue) => (
              <tr
                key={issue.issue_id}
                onClick={() => navigate(`/library/issues/${issue.issue_id}`)}
                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900">{issue.book_title}</div>
                      <div className="text-xs text-slate-500">{t('issues.table.copyId', { id: issue.copy_id })}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  #{issue.member_id}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(issue.issue_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(issue.due_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {issue.return_date ? (
                    <div className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      {new Date(issue.return_date).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <IssueStatusBadge status={issue.status} dueDate={issue.due_date} returnDate={issue.return_date} />
                </td>
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {!issue.return_date && (
                      <>
                        <button
                          onClick={() => onRenew?.(issue)}
                          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          title={t('issues.table.renewTitle')}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onReturn?.(issue)}
                          className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          title={t('issues.table.returnTitle')}
                        >
                          {t('issues.table.return')}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
