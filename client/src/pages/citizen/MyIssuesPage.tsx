import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { issuesApi } from '../../api/issues';
import { formatDate } from '../../lib/utils';
import type { PublicIssue } from '../../types';
import { AlertTriangle, Plus, Eye, CheckCircle, RotateCcw, X } from 'lucide-react';

export default function MyIssuesPage() {
  const [issues, setIssues] = useState<PublicIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Verify modal state
  const [verifyingIssue, setVerifyingIssue] = useState<PublicIssue | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [actionType, setActionType] = useState<'confirm' | 'dispute'>('confirm');
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const fetchIssues = () => {
    setLoading(true);
    issuesApi
      .getMyIssues(statusFilter !== 'ALL' ? { status: statusFilter } : undefined)
      .then((res) => {
        if (res.data.data) {
          setIssues(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load issues:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIssues();
  }, [statusFilter]);

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingIssue) return;
    setSubmittingVerification(true);
    try {
      await issuesApi.verifyResolution(verifyingIssue._id, {
        confirmed: actionType === 'confirm',
        disputeReason: actionType === 'dispute' ? disputeReason : undefined,
      });
      setVerifyingIssue(null);
      setDisputeReason('');
      fetchIssues();
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setSubmittingVerification(false);
    }
  };

  const tabs = [
    { label: 'All Issues', value: 'ALL' },
    { label: 'Reported / Open', value: 'REPORTED' },
    { label: 'Under Review / Assigned', value: 'ASSIGNED' },
    { label: 'Resolved / Closed', value: 'RESOLVED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="My Reported Issues"
          subtitle="View real-time investigation and cleanup status from municipal operations."
          breadcrumbs={[
            { label: 'Dashboard', href: '/citizen/dashboard' },
            { label: 'My Issues' },
          ]}
          className="border-0 pb-0 mb-0"
        />
        <Link
          to="/citizen/report-issue"
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Report Issue
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-border overflow-x-auto no-scrollbar gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-text-muted hover:text-text hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8">
          <EmptyState
            icon={AlertTriangle}
            title="No Issues Reported"
            description="You have not filed any public reports under this filter category."
            action={
              <Link
                to="/citizen/report-issue"
                className="inline-flex items-center gap-2 bg-primary text-white text-xs font-medium px-3 py-2 rounded-md mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> File an Issue Report
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {issues.map((issue) => {
            const isResolvedPending =
              issue.status === 'RESOLVED' &&
              (issue.citizenVerification === 'PENDING' || !issue.citizenVerification);

            return (
              <div
                key={issue._id}
                className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={issue.severity} type="severity" size="sm" />
                    <StatusBadge status={issue.status} type="issue" size="sm" />
                    {issue.isOverdue && (
                      <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-200">
                        OVERDUE SLA
                      </span>
                    )}
                    <span className="font-semibold text-text text-base ml-1">{issue.title}</span>
                  </div>

                  <p className="text-xs text-text-muted line-clamp-1">{issue.description}</p>

                  <div className="text-xs text-text-muted">
                    <span className="font-medium text-charcoal">{issue.address}</span> • Ward:{' '}
                    {(issue.serviceArea as any)?.name || 'Central'} • Reported on {formatDate(issue.createdAt)}
                  </div>

                  {issue.resolutionNotes && (
                    <div className="text-xs bg-gray-50 border border-border p-2 rounded text-charcoal">
                      <strong className="text-primary">Resolution Note:</strong> {issue.resolutionNotes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Link
                    to={`/citizen/issues/${issue._id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-background border border-border text-xs font-medium text-charcoal rounded hover:bg-gray-50"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </Link>

                  {isResolvedPending && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setVerifyingIssue(issue);
                          setActionType('confirm');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-status-successBg text-status-success border border-status-success/20 text-xs font-medium rounded hover:bg-green-100"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Confirm
                      </button>
                      <button
                        onClick={() => {
                          setVerifyingIssue(issue);
                          setActionType('dispute');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-status-warningBg text-status-warning border border-status-warning/20 text-xs font-medium rounded hover:bg-amber-100"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Dispute
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm / Dispute Modal */}
      {verifyingIssue && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border max-w-md w-full p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-text">
                {actionType === 'confirm' ? 'Confirm Resolution' : 'Dispute Resolution'}
              </h3>
              <button onClick={() => setVerifyingIssue(null)} className="text-text-muted hover:text-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-muted">
              {actionType === 'confirm'
                ? 'By confirming, you acknowledge that the waste issue at this site has been cleaned and the report will be formally closed.'
                : 'If the waste was not properly removed or has already recurred, explain the dispute reason below to reopen the task for municipal officers.'}
            </p>

            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              {actionType === 'dispute' && (
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Dispute Reason</label>
                  <textarea
                    rows={3}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="e.g. Only half of the debris was cleared; the sidewalk is still blocked..."
                    className="w-full p-3 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyingIssue(null)}
                  className="px-4 py-2 bg-background border border-border text-xs font-medium rounded text-charcoal hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVerification}
                  className={`px-4 py-2 text-white text-xs font-medium rounded disabled:opacity-50 ${
                    actionType === 'confirm' ? 'bg-status-success hover:bg-green-700' : 'bg-status-warning hover:bg-amber-700'
                  }`}
                >
                  {submittingVerification
                    ? 'Submitting...'
                    : actionType === 'confirm'
                    ? 'Confirm & Close Issue'
                    : 'Submit Dispute & Reopen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
