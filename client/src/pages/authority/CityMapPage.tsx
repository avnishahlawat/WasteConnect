import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { IssuesMap } from '../../components/maps/IssuesMap';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { authorityApi } from '../../api/authority';
import { sharedApi } from '../../api/shared';
import type { PublicIssue, ServiceArea } from '../../types';

export default function CityMapPage() {
  const [issues, setIssues] = useState<PublicIssue[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'OVERDUE' | 'RESOLVED'>('ACTIVE');

  useEffect(() => {
    Promise.all([authorityApi.getIssues({ limit: 100 }), sharedApi.getServiceAreas()])
      .then(([issueRes, areaRes]) => {
        if (issueRes.data.data) setIssues(issueRes.data.data);
        if (areaRes.data.data) setServiceAreas(areaRes.data.data);
      })
      .catch((err) => console.error('Map load failed:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredIssues = issues.filter((i) => {
    if (filter === 'ACTIVE') return !['RESOLVED', 'CLOSED', 'REJECTED'].includes(i.status);
    if (filter === 'OVERDUE') return i.isOverdue;
    if (filter === 'RESOLVED') return ['RESOLVED', 'CLOSED'].includes(i.status);
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Greenfield Municipal City Map"
          subtitle="Live geospatial distribution of public waste reports and service area hotspot perimeters."
          breadcrumbs={[
            { label: 'Operations Command', href: '/authority/dashboard' },
            { label: 'City Map' },
          ]}
          className="border-0 pb-0 mb-0"
        />

        {/* Status Filter Toggle */}
        <div className="flex items-center bg-surface border border-border p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === 'ACTIVE' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            Active Incidents ({issues.filter((i) => !['RESOLVED', 'CLOSED'].includes(i.status)).length})
          </button>
          <button
            onClick={() => setFilter('OVERDUE')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === 'OVERDUE' ? 'bg-status-error text-white shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            Overdue ({issues.filter((i) => i.isOverdue).length})
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === 'RESOLVED' ? 'bg-status-success text-white shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === 'ALL' ? 'bg-charcoal text-white shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            All Pins ({issues.length})
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" />
      ) : (
        <div className="space-y-4">
          <IssuesMap
            issues={filteredIssues}
            serviceAreas={serviceAreas}
            height="620px"
            detailBaseUrl="/authority/issues"
          />

          {/* Map Legend */}
          <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-text">Severity Markers:</span>
              <span className="flex items-center gap-1.5 text-text-muted">
                <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span> Critical
              </span>
              <span className="flex items-center gap-1.5 text-text-muted">
                <span className="w-3 h-3 rounded-full bg-orange-600 inline-block"></span> High
              </span>
              <span className="flex items-center gap-1.5 text-text-muted">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> Moderate
              </span>
              <span className="flex items-center gap-1.5 text-text-muted">
                <span className="w-3 h-3 rounded-full bg-green-600 inline-block"></span> Low
              </span>
            </div>

            <div className="text-text-muted text-[11px]">
              Dashed circular overlays indicate municipal service area radius and active hotspot rating.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
