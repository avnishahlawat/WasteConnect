import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { adminApi } from '../../api/admin';
import { formatDate } from '../../lib/utils';
import type { PublicIssue } from '../../types';

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<PublicIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getAllIssues({ limit: 50 })
      .then((res) => {
        if (res.data.data) {
          setIssues(res.data.data);
        }
      })
      .catch((err) => console.error('Admin issues failed:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Platform Public Issues"
        subtitle="Global audit list of all public sanitation and illegal dumping complaints."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin/dashboard' },
          { label: 'Issues' },
        ]}
      />

      {loading ? (
        <LoadingSkeleton type="card" />
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-xs uppercase font-semibold text-text-muted">
              <tr>
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3">Title & Category</th>
                <th className="px-5 py-3">Reporter</th>
                <th className="px-5 py-3">Ward Area</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {issues.map((i) => (
                <tr key={i._id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4">
                    <StatusBadge status={i.severity} type="severity" size="sm" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-text">{i.title}</div>
                    <div className="text-text-muted text-[11px]">{i.category}</div>
                  </td>
                  <td className="px-5 py-4 text-text-muted">
                    {(i.reporter as any)?.firstName} {(i.reporter as any)?.lastName}
                  </td>
                  <td className="px-5 py-4 text-text-muted">{(i.serviceArea as any)?.name || 'Central'}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={i.status} type="issue" size="sm" />
                  </td>
                  <td className="px-5 py-4 text-text-muted text-right">{formatDate(i.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
