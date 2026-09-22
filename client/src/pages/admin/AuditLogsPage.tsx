import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { adminApi } from '../../api/admin';
import { formatDateTime } from '../../lib/utils';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    adminApi
      .getAuditLogs({ action: action || undefined })
      .then((res) => {
        if (res.data.data) {
          setLogs(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load audit logs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [action]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Security & System Audit Trail"
          subtitle="Immutable operational record of platform authentication, triage events, and privileged actions."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin/dashboard' },
            { label: 'Audit Logs' },
          ]}
          className="border-0 pb-0 mb-0"
        />

        <div className="w-full sm:w-64">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full h-9 px-3 bg-surface border border-border rounded-md text-xs focus:outline-none"
          >
            <option value="">All Action Types</option>
            <option value="USER_LOGIN">User Logins</option>
            <option value="USER_REGISTERED">User Registrations</option>
            <option value="USER_ACTIVATED">User Activations</option>
            <option value="USER_DEACTIVATED">User Deactivations</option>
            <option value="PICKUP_ASSIGNED">Pickup Assignments</option>
            <option value="ISSUE_VERIFIED">Issue Verifications</option>
            <option value="ISSUE_RESOLVED">Issue Resolutions</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-xs uppercase font-semibold text-text-muted">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Actor / Principal</th>
                <th className="px-5 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-text-muted font-mono whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-5 py-3 font-semibold">
                    <span className="font-mono text-[11px] bg-gray-100 text-charcoal px-2 py-0.5 rounded border border-gray-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-text">{log.actorEmail || 'System'}</div>
                    <div className="text-text-muted text-[10px]">{log.actorRole}</div>
                  </td>
                  <td className="px-5 py-3 text-text-muted">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
