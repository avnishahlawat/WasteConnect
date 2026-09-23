import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { authorityApi } from '../../api/authority';
import { formatDateTime } from '../../lib/utils';
import { ArrowLeft, MapPin, Edit, FileCheck, } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
export default function AuthorityIssueDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    // Triage state
    const [targetStatus, setTargetStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [severity, setSeverity] = useState('');
    const [internalNotes, setInternalNotes] = useState('');
    const [assignedTeam, setAssignedTeam] = useState('');
    // Resolution state
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [submittingAction, setSubmittingAction] = useState(false);
    const fetchDetail = () => {
        if (!id)
            return;
        setLoading(true);
        authorityApi
            .getIssueById(id)
            .then((res) => {
            if (res.data.data) {
                setData(res.data.data);
                setTargetStatus(res.data.data.issue.status);
                setPriority(res.data.data.issue.priority);
                setSeverity(res.data.data.issue.severity);
                setAssignedTeam(res.data.data.issue.assignedTeam || '');
            }
        })
            .catch((err) => console.error('Failed to load issue:', err))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        fetchDetail();
    }, [id]);
    const handleTriageSubmit = async (e) => {
        e.preventDefault();
        if (!id)
            return;
        setSubmittingAction(true);
        try {
            await authorityApi.triageIssue(id, {
                status: targetStatus,
                priority,
                severity,
                assignedTeam: assignedTeam || undefined,
                internalNotes: internalNotes || undefined,
            });
            fetchDetail();
            alert('Issue status and triage updated successfully');
        }
        catch (err) {
            alert(err.response?.data?.message || 'Failed to update triage');
        }
        finally {
            setSubmittingAction(false);
        }
    };
    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        if (!id || !resolutionNotes)
            return;
        setSubmittingAction(true);
        try {
            await authorityApi.resolveIssue(id, {
                resolutionNotes,
            });
            fetchDetail();
            setResolutionNotes('');
            alert('Issue marked resolved and notification sent to citizen');
        }
        catch (err) {
            alert(err.response?.data?.message || 'Failed to resolve issue');
        }
        finally {
            setSubmittingAction(false);
        }
    };
    if (loading)
        return <LoadingSkeleton type="card"/>;
    if (!data?.issue)
        return <div className="p-8 text-center text-text-muted">Issue not found.</div>;
    const { issue, events } = data;
    const coords = [issue.location.coordinates[1], issue.location.coordinates[0]];
    return (<div className="max-w-5xl mx-auto space-y-6">
      <Link to="/authority/issues" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
        <ArrowLeft className="w-4 h-4"/> Back to Issue Queue
      </Link>

      {/* Header card */}
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
          Reported: {formatDateTime(issue.createdAt)} • Ward: {issue.serviceArea?.name || 'Central'} • Reporter:{' '}
          <strong className="text-charcoal">
            {issue.reporter?.firstName} {issue.reporter?.lastName} ({issue.reporter?.email})
          </strong>
        </div>
      </div>

      {/* Actions Grid: Triage & Resolution Forms */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Triage & Dispatch Form */}
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-text flex items-center gap-2">
            <Edit className="w-4 h-4 text-primary"/> Triage & Dispatch
          </h3>

          <form onSubmit={handleTriageSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-text-muted mb-1">Target Status</label>
              <select value={targetStatus} onChange={(e) => setTargetStatus(e.target.value)} className="w-full h-9 px-2 bg-background border border-border rounded-md text-xs focus:outline-none">
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="ASSIGNED">Assigned to Team</option>
                <option value="IN_PROGRESS">In Progress (Field Work)</option>
                <option value="DUPLICATE">Mark Duplicate</option>
                <option value="REJECTED">Reject (Out of Scope)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-muted mb-1">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full h-9 px-2 bg-background border border-border rounded-md text-xs focus:outline-none">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-text-muted mb-1">Severity</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full h-9 px-2 bg-background border border-border rounded-md text-xs focus:outline-none">
                  <option value="LOW">Low</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-muted mb-1">Assigned Field Crew / Team</label>
              <input type="text" value={assignedTeam} onChange={(e) => setAssignedTeam(e.target.value)} placeholder="e.g. Sanitation Unit 4, Heavy Equipment Crew" className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs focus:outline-none"/>
            </div>

            <div>
              <label className="block font-semibold text-text-muted mb-1">Internal Note (Authority Only)</label>
              <textarea rows={2} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Private operational notes not visible to citizens..." className="w-full p-2 bg-background border border-border rounded-md text-xs focus:outline-none"/>
            </div>

            <button type="submit" disabled={submittingAction} className="w-full py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50">
              {submittingAction ? 'Updating...' : 'Save Triage Updates'}
            </button>
          </form>
        </div>

        {/* Resolution Completion Form */}
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-text flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-status-success"/> Mark Resolved
          </h3>

          <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
            <p className="text-text-muted">
              Once the field team finishes cleanup at {issue.address}, enter formal resolution notes to update the SLA metrics and alert the reporting citizen.
            </p>

            <div>
              <label className="block font-semibold text-text-muted mb-1">Resolution Summary / Action Taken</label>
              <textarea rows={4} value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="Detail what equipment was deployed, total debris removed, and confirmation that the area has been cleared..." className="w-full p-2 bg-background border border-border rounded-md text-xs focus:outline-none" required/>
            </div>

            <button type="submit" disabled={submittingAction || !resolutionNotes} className="w-full py-2 bg-status-success text-white font-semibold rounded-md hover:bg-green-700 transition-colors disabled:opacity-50">
              {submittingAction ? 'Processing...' : 'Confirm Resolution & Notify Citizen'}
            </button>
          </form>

          {issue.resolutionNotes && (<div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs space-y-1">
              <div className="font-bold text-green-900">Current Resolution Record</div>
              <p className="text-green-800">{issue.resolutionNotes}</p>
            </div>)}
        </div>
      </div>

      {/* Incident Map & Location */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-text flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary"/> Incident Coordinates & Site Map
        </h3>
        <div className="text-xs text-text font-medium">{issue.address}</div>
        <div className="h-56 w-full rounded-lg overflow-hidden border border-border">
          <MapContainer center={coords} zoom={14} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <Marker position={coords}/>
          </MapContainer>
        </div>
      </div>

      {/* Immutable Event Audit Log */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-text">Operational Timeline & Audit Trail</h3>
        <div className="divide-y divide-border">
          {events.map((ev) => (<div key={ev._id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div>
                <div className="font-medium text-text">
                  Status transitioned to <strong className="text-primary">{ev.newStatus}</strong>
                </div>
                {ev.note && <div className="text-text-muted mt-0.5">{ev.note}</div>}
                <div className="text-gray-400 mt-1">
                  Actor: {ev.actor?.firstName || 'Municipal Staff'} ({ev.actorRole})
                </div>
              </div>
              <div className="text-text-muted whitespace-nowrap">{formatDateTime(ev.timestamp)}</div>
            </div>))}
        </div>
      </div>
    </div>);
}
