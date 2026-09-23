import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { dashboardsApi } from '../../api/dashboards';
import { formatDate } from '../../lib/utils';
import { AlertTriangle, List, CheckCircle2, Clock, Flame, AlertCircle, MapPin, ArrowRight, ShieldAlert, } from 'lucide-react';
export default function AuthorityDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        dashboardsApi
            .getAuthorityDashboard()
            .then((res) => {
            if (res.data.data) {
                setData(res.data.data);
            }
        })
            .catch((err) => console.error('Authority dashboard failed:', err))
            .finally(() => setLoading(false));
    }, []);
    if (loading) {
        return (<div className="space-y-6">
        <LoadingSkeleton type="card"/>
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
        </div>
      </div>);
    }
    const metrics = data?.metrics || {
        totalReports: 0,
        underReviewCount: 0,
        inProgressCount: 0,
        overdueCount: 0,
        resolvedCount: 0,
        criticalHotspots: 0,
        slaComplianceRate: 100,
    };
    return (<div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Municipal Operations Command" subtitle="Triage public reports, coordinate field teams, and manage hotspot remediation." className="border-0 pb-0 mb-0"/>
        <div className="flex items-center gap-3">
          <Link to="/authority/map" className="flex items-center gap-1.5 bg-surface border border-border text-charcoal text-xs font-semibold px-4 py-2 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
            <MapPin className="w-4 h-4 text-primary"/> Live Incident Map
          </Link>
          <Link to="/authority/issues" className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-primary-dark transition-colors shadow-sm">
            <List className="w-4 h-4"/> Issue Queue
          </Link>
        </div>
      </div>

      {/* SLA Alert Box if Overdue issues exist */}
      {metrics.overdueCount > 0 && (<div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"/>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-900">
              SLA Attention Required: {metrics.overdueCount} Overdue Report(s)
            </h4>
            <p className="text-xs text-red-700 mt-0.5">
              These reports have passed their resolution deadline without verified remediation. Priority dispatch recommended.
            </p>
          </div>
          <Link to="/authority/issues?isOverdue=true" className="text-xs font-bold text-red-800 underline whitespace-nowrap self-center">
            View Overdue Queue &rarr;
          </Link>
        </div>)}

      {/* 6 Real KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard title="Total Reports" value={metrics.totalReports} icon={List} variant="default"/>
        <MetricCard title="Under Review" value={metrics.underReviewCount} icon={Clock} variant="warning"/>
        <MetricCard title="In Field Dispatch" value={metrics.inProgressCount} icon={AlertTriangle} variant="info"/>
        <MetricCard title="Overdue SLA" value={metrics.overdueCount} icon={AlertCircle} variant="error"/>
        <MetricCard title="Resolved" value={metrics.resolvedCount} icon={CheckCircle2} variant="success"/>
        <MetricCard title="Critical Hotspots" value={metrics.criticalHotspots} subtitle={`Score: ${metrics.slaComplianceRate}% SLA`} icon={Flame} variant="error"/>
      </div>

      {/* Urgent Issues & Hotspot Zones */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Urgent Issue Queue */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-text">Urgent Incident Reports</h3>
            <Link to="/authority/issues" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Full Queue <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>

          {!data?.urgentIssues?.length ? (<EmptyState icon={CheckCircle2} title="Queue Clear" description="No unresolved issues currently pending in your jurisdiction."/>) : (<div className="divide-y divide-border">
              {data.urgentIssues.map((issue) => (<div key={issue._id} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={issue.severity} type="severity" size="sm"/>
                      <StatusBadge status={issue.status} type="issue" size="sm"/>
                      {issue.isOverdue && (<span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded border border-red-200">
                          OVERDUE
                        </span>)}
                    </div>
                    <div className="font-medium text-sm text-text">{issue.title}</div>
                    <div className="text-xs text-text-muted">
                      {issue.address} • {issue.serviceArea?.name || 'Central'} • {formatDate(issue.createdAt)}
                    </div>
                  </div>
                  <Link to={`/authority/issues/${issue._id}`} className="text-xs font-semibold text-primary hover:underline whitespace-nowrap ml-4">
                    Triage &rarr;
                  </Link>
                </div>))}
            </div>)}
        </div>

        {/* Hotspot Remediations Summary */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-text">Service Area Hotspot Risk</h3>
            <Link to="/authority/hotspots" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Detailed Index <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>

          <div className="space-y-4">
            {data?.hotspotSummary?.map((area) => (<div key={area._id} className="p-3 bg-background border border-border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm text-text flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-text-muted"/>
                    {area.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={area.hotspotLevel} type="hotspot" size="sm"/>
                    <span className="text-xs font-bold text-charcoal">{area.hotspotScore}/100</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${area.hotspotScore > 80
                ? 'bg-status-error'
                : area.hotspotScore > 60
                    ? 'bg-orange-500'
                    : area.hotspotScore > 40
                        ? 'bg-status-warning'
                        : area.hotspotScore > 20
                            ? 'bg-status-info'
                            : 'bg-status-success'}`} style={{ width: `${Math.min(100, Math.max(5, area.hotspotScore))}%` }}/>
                </div>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
}
