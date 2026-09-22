import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { dashboardsApi } from '../../api/dashboards';
import { formatDate } from '../../lib/utils';
import {
  Users,
  Package,
  AlertTriangle,
  Flame,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardsApi
      .getAdminDashboard()
      .then((res) => {
        if (res.data.data) {
          setData(res.data.data);
        }
      })
      .catch((err) => console.error('Admin dashboard failed:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      </div>
    );
  }

  const m = data?.metrics || {
    totalUsers: 0,
    totalCollectors: 0,
    totalAuthorities: 0,
    totalCitizens: 0,
    totalPickups: 0,
    completedPickups: 0,
    totalIssues: 0,
    resolvedIssues: 0,
    criticalHotspots: 0,
    collectionSuccessRate: 100,
    issueResolutionRate: 100,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="System Administration Command"
          subtitle="Platform-wide user management, infrastructure configuration, and security audits."
          className="border-0 pb-0 mb-0"
        />
        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-primary-dark shadow-sm"
          >
            <Users className="w-4 h-4" /> Manage Users
          </Link>
          <Link
            to="/admin/audit-logs"
            className="flex items-center gap-1.5 bg-surface border border-border text-charcoal text-xs font-semibold px-4 py-2 rounded-md hover:bg-gray-50 shadow-sm"
          >
            <Shield className="w-4 h-4 text-primary" /> Audit Logs
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Platform Users"
          value={m.totalUsers}
          subtitle={`${m.totalCitizens} citizens, ${m.totalCollectors} collectors`}
          icon={Users}
          variant="default"
        />
        <MetricCard
          title="Total Household Pickups"
          value={m.totalPickups}
          subtitle={`${m.collectionSuccessRate}% completion rate`}
          icon={Package}
          variant="info"
        />
        <MetricCard
          title="Public Issues Logged"
          value={m.totalIssues}
          subtitle={`${m.issueResolutionRate}% resolution rate`}
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricCard
          title="Critical Hotspot Zones"
          value={m.criticalHotspots}
          subtitle="High accumulation risk"
          icon={Flame}
          variant="error"
        />
      </div>

      {/* Platform Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Public Reports */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-text">Recent Public Incident Reports</h3>
            <Link
              to="/admin/issues"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              All Reports <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {data?.recentIssues?.map((issue: any) => (
              <div key={issue._id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-text text-sm">{issue.title}</div>
                  <div className="text-text-muted">
                    {issue.address} • Ward: {issue.serviceArea?.name || 'Central'} • {formatDate(issue.createdAt)}
                  </div>
                </div>
                <StatusBadge status={issue.status} type="issue" size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Household Pickups */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-text">Recent Private Pickups</h3>
            <Link
              to="/admin/pickups"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              All Pickups <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {data?.recentPickups?.map((p: any) => (
              <div key={p._id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-text text-sm">
                    {p.wasteCategory?.name || 'Waste'} ({p.estimatedQuantity} {p.unit})
                  </div>
                  <div className="text-text-muted">
                    {p.address} • Preferred: {formatDate(p.preferredDate)}
                  </div>
                </div>
                <StatusBadge status={p.status} type="pickup" size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
