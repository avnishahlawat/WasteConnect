import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardsApi } from '../../api/dashboards';
import { PageHeader } from '../../components/ui/PageHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, formatWeight } from '../../lib/utils';
import { Truck, AlertTriangle, Package, CheckCircle2, Plus, ArrowRight, Megaphone, } from 'lucide-react';
export default function CitizenDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        dashboardsApi
            .getCitizenDashboard()
            .then((res) => {
            if (res.data.success && res.data.data) {
                setData(res.data.data);
            }
        })
            .catch((err) => console.error('Dashboard load failed:', err))
            .finally(() => setLoading(false));
    }, []);
    if (loading) {
        return (<div className="space-y-6">
        <LoadingSkeleton type="card"/>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
        </div>
      </div>);
    }
    const metrics = data?.metrics || {
        totalPickups: 0,
        activePickups: 0,
        completedPickups: 0,
        totalIssues: 0,
        resolvedIssues: 0,
        resolutionRate: 100,
        unreadNotificationsCount: 0,
    };
    return (<div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title={`Welcome back, ${user?.firstName || 'Citizen'}`} subtitle="Manage your household collections and report civic waste issues." className="border-0 pb-0 mb-0"/>
        <div className="flex flex-wrap gap-3">
          <Link to="/citizen/request-pickup" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors shadow-sm">
            <Plus className="w-4 h-4"/> Request Pickup
          </Link>
          <Link to="/citizen/report-issue" className="flex items-center gap-2 bg-surface border border-border text-charcoal px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm">
            <AlertTriangle className="w-4 h-4 text-status-warning"/> Report Issue
          </Link>
        </div>
      </div>

      {/* Announcements Banner */}
      {data?.announcements && data.announcements.length > 0 && (<div className="bg-primary-muted/20 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"/>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-text">{data.announcements[0].title}</h4>
            <p className="text-sm text-text-muted mt-0.5">{data.announcements[0].content}</p>
          </div>
        </div>)}

      {/* Aggregated Real Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Pickups" value={metrics.totalPickups} subtitle={`${metrics.activePickups} in progress`} icon={Truck} variant="default"/>
        <MetricCard title="Completed Collections" value={metrics.completedPickups} subtitle="Household waste diverted" icon={CheckCircle2} variant="success"/>
        <MetricCard title="Public Issues Reported" value={metrics.totalIssues} subtitle={`${metrics.resolvedIssues} resolved`} icon={Package} variant="warning"/>
        <MetricCard title="Issue Resolution Rate" value={`${metrics.resolutionRate}%`} subtitle="Municipal response rate" icon={CheckCircle2} variant="info"/>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Pickups */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-text">Recent Pickup Requests</h3>
            <Link to="/citizen/pickups" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>

          {!data?.recentPickups?.length ? (<EmptyState icon={Truck} title="No Pickups Requested" description="Schedule your first recyclable or bulk waste collection." action={<Link to="/citizen/request-pickup" className="inline-flex items-center gap-2 bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-md mt-2">
                  <Plus className="w-3.5 h-3.5"/> Request Pickup
                </Link>}/>) : (<div className="divide-y divide-border">
              {data.recentPickups.map((p) => (<div key={p._id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-text">
                      {p.wasteCategory?.name || 'Waste'} ({formatWeight(p.actualQuantity || p.estimatedQuantity, p.unit)})
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {p.address} • Scheduled: {formatDate(p.preferredDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={p.status} type="pickup" size="sm"/>
                    <Link to={`/citizen/pickups/${p._id}`} className="text-xs text-primary font-medium hover:underline">
                      Details
                    </Link>
                  </div>
                </div>))}
            </div>)}
        </div>

        {/* Recent Public Issues */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-text">Recent Public Reports</h3>
            <Link to="/citizen/issues" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>

          {!data?.recentIssues?.length ? (<EmptyState icon={AlertTriangle} title="No Issues Reported" description="Help keep your neighborhood clean by reporting public waste accumulation." action={<Link to="/citizen/report-issue" className="inline-flex items-center gap-2 bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-md mt-2">
                  <Plus className="w-3.5 h-3.5"/> Report Issue
                </Link>}/>) : (<div className="divide-y divide-border">
              {data.recentIssues.map((i) => (<div key={i._id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-text">{i.title}</div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {i.address} • Reported: {formatDate(i.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={i.status} type="issue" size="sm"/>
                    <Link to={`/citizen/issues/${i._id}`} className="text-xs text-primary font-medium hover:underline">
                      Details
                    </Link>
                  </div>
                </div>))}
            </div>)}
        </div>
      </div>
    </div>);
}
