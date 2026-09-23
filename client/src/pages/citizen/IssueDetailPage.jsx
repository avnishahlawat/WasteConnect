import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { issuesApi } from '../../api/issues';
import { formatDateTime } from '../../lib/utils';
import { MapPin, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
export default function IssueDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!id)
            return;
        issuesApi
            .getIssueDetail(id)
            .then((res) => {
            if (res.data.data) {
                setData(res.data.data);
            }
        })
            .catch((err) => console.error('Failed to load issue detail:', err))
            .finally(() => setLoading(false));
    }, [id]);
    if (loading)
        return <LoadingSkeleton type="card"/>;
    if (!data?.issue)
        return <div className="p-8 text-center text-text-muted">Issue report not found.</div>;
    const { issue, events } = data;
    const steps = [
        { label: 'Reported', active: true },
        { label: 'Under Review', active: ['UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(issue.status) },
        { label: 'Assigned', active: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(issue.status) },
        { label: 'Resolved', active: ['RESOLVED', 'CLOSED'].includes(issue.status) },
        { label: 'Closed', active: issue.status === 'CLOSED' },
    ];
    const coords = [
        issue.location.coordinates[1],
        issue.location.coordinates[0],
    ];
    return (<div className="max-w-4xl mx-auto space-y-6">
      <Link to="/citizen/issues" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
        <ArrowLeft className="w-4 h-4"/> Back to My Issues
      </Link>

      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={issue.severity} type="severity" size="md"/>
          <StatusBadge status={issue.status} type="issue" size="md"/>
          {issue.isOverdue && (<span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200">
              SLA BREACHED
            </span>)}
          <span className="text-xs text-text-muted ml-auto">ID: {issue._id.slice(-8).toUpperCase()}</span>
        </div>

        <h1 className="text-2xl font-bold text-text">{issue.title}</h1>
        <p className="text-sm text-text-muted">{issue.description}</p>
        <div className="text-xs text-text-muted pt-2 border-t border-border">
          Reported on {formatDateTime(issue.createdAt)} • Ward: {issue.serviceArea?.name || 'Central'}
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-text mb-6">Investigation & Cleanup Lifecycle</h3>
        <div className="grid grid-cols-5 relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-0"></div>
          {steps.map((step, idx) => (<div key={idx} className="flex flex-col items-center relative z-10 text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step.active
                ? 'bg-primary text-white ring-4 ring-primary/10'
                : 'bg-gray-100 text-gray-400 border border-gray-300'}`}>
                {step.active ? <CheckCircle2 className="w-4 h-4"/> : idx + 1}
              </div>
              <div className={`text-xs font-medium mt-2 ${step.active ? 'text-primary font-bold' : 'text-text-muted'}`}>
                {step.label}
              </div>
            </div>))}
        </div>
      </div>

      {/* Map & Resolution Details */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-text flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary"/> Incident Site Location
          </h3>
          <div className="text-xs text-text font-medium">{issue.address}</div>
          <div className="h-44 w-full rounded-lg overflow-hidden border border-border">
            <MapContainer center={coords} zoom={14} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
              <Marker position={coords}/>
            </MapContainer>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-text flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary"/> Municipal Resolution Notes
          </h3>
          {issue.resolutionNotes ? (<div className="space-y-2 text-xs">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-900">
                <div className="font-bold mb-1">Cleaned by Field Team</div>
                <p>{issue.resolutionNotes}</p>
                {issue.resolvedAt && (<div className="text-[11px] text-green-700 mt-2">
                    Resolved on: {formatDateTime(issue.resolvedAt)}
                  </div>)}
              </div>
              <div className="text-xs text-text-muted">
                Citizen Verification:{' '}
                <strong className="text-charcoal capitalize">
                  {issue.citizenVerification?.toLowerCase() || 'pending'}
                </strong>
              </div>
            </div>) : (<div className="text-xs text-text-muted py-6">
              This report is currently being triaged by municipal sanitation officers. Resolution updates and evidence will be posted once cleanup is complete.
            </div>)}
        </div>
      </div>

      {/* Timeline Audit History */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-text">Audit Event Trail</h3>
        <div className="divide-y divide-border">
          {events.map((ev) => (<div key={ev._id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div>
                <div className="font-medium text-text">
                  Status updated to <strong className="text-primary">{ev.newStatus}</strong>
                </div>
                {ev.note && <div className="text-text-muted mt-0.5">{ev.note}</div>}
                <div className="text-gray-400 mt-1">
                  Updated by: {ev.actor?.firstName || 'Municipal Staff'} ({ev.actorRole})
                </div>
              </div>
              <div className="text-text-muted whitespace-nowrap">{formatDateTime(ev.timestamp)}</div>
            </div>))}
        </div>
      </div>
    </div>);
}
