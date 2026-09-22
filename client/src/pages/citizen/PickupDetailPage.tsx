import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { pickupsApi } from '../../api/pickups';
import { formatDate, formatDateTime } from '../../lib/utils';
import type { PickupRequest, PickupEvent } from '../../types';
import { MapPin, User, CheckCircle2, Star, ArrowLeft } from 'lucide-react';

export default function PickupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ pickup: PickupRequest; events: PickupEvent[]; feedback?: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    pickupsApi
      .getPickupDetail(id)
      .then((res) => {
        if (res.data.data) {
          setData(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load pickup detail:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton type="card" />;
  if (!data?.pickup) return <div className="p-8 text-center text-text-muted">Pickup request not found.</div>;

  const { pickup, events, feedback } = data;

  const steps = [
    { label: 'Requested', status: 'AVAILABLE', active: true },
    { label: 'Accepted', status: 'ACCEPTED', active: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(pickup.status) },
    { label: 'In Progress', status: 'IN_PROGRESS', active: ['IN_PROGRESS', 'COMPLETED'].includes(pickup.status) },
    { label: 'Completed', status: 'COMPLETED', active: pickup.status === 'COMPLETED' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/citizen/pickups"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Pickups
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-6 rounded-xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={pickup.status} type="pickup" size="md" />
            <span className="text-xs text-text-muted">ID: {pickup._id.slice(-8).toUpperCase()}</span>
          </div>
          <h2 className="text-xl font-bold text-text">
            {(pickup.wasteCategory as any)?.name || 'Waste'} Collection
          </h2>
          <div className="text-xs text-text-muted mt-0.5">Created on {formatDateTime(pickup.createdAt)}</div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {pickup.actualQuantity || pickup.estimatedQuantity} {pickup.unit}
          </div>
          <div className="text-xs text-text-muted">
            {pickup.actualQuantity ? 'Actual collected weight' : 'Estimated quantity'}
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-text mb-6">Collection Lifecycle Progress</h3>
        <div className="grid grid-cols-4 relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-0"></div>
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center relative z-10 text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  step.active
                    ? 'bg-primary text-white ring-4 ring-primary/10'
                    : 'bg-gray-100 text-gray-400 border border-gray-300'
                }`}
              >
                {step.active ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <div className={`text-xs font-medium mt-2 ${step.active ? 'text-primary font-bold' : 'text-text-muted'}`}>
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details & Collector */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-text flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Location & Timing
          </h3>
          <div className="text-xs space-y-1.5 text-text-muted">
            <div>
              <span className="font-medium text-text">Address:</span> {pickup.address}
            </div>
            <div>
              <span className="font-medium text-text">Service Area:</span> {(pickup.serviceArea as any)?.name || 'Central'}
            </div>
            <div>
              <span className="font-medium text-text">Scheduled Date:</span> {formatDate(pickup.preferredDate)}
            </div>
            <div>
              <span className="font-medium text-text">Time Slot:</span> {pickup.timeSlot}
            </div>
            {pickup.notes && (
              <div className="pt-2 border-t border-border">
                <span className="font-medium text-text">Notes:</span> {pickup.notes}
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-text flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Assigned Collector
          </h3>
          {pickup.assignedCollector ? (
            <div className="text-xs space-y-1.5 text-text-muted">
              <div className="font-bold text-sm text-text">
                {(pickup.assignedCollector as any).firstName} {(pickup.assignedCollector as any).lastName}
              </div>
              <div>
                <span className="font-medium text-text">Phone:</span> {(pickup.assignedCollector as any).phone || 'N/A'}
              </div>
              <div>
                <span className="font-medium text-text">Email:</span> {(pickup.assignedCollector as any).email}
              </div>
              {feedback && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-1 font-semibold text-amber-800 text-xs mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    Rating Given: {feedback.rating} / 5
                  </div>
                  {feedback.comment && <p className="text-xs text-amber-900 italic">"{feedback.comment}"</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-text-muted py-4">
              Pending collector assignment. Once a collector accepts, their details will appear here.
            </div>
          )}
        </div>
      </div>

      {/* Audit Event History */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-text">State Transition Audit Trail</h3>
        <div className="divide-y divide-border">
          {events.map((ev) => (
            <div key={ev._id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div>
                <div className="font-medium text-text">
                  Status changed to <strong className="text-primary">{ev.newStatus}</strong>
                </div>
                {ev.note && <div className="text-text-muted mt-0.5">{ev.note}</div>}
                <div className="text-gray-400 mt-1">
                  Actor: {(ev.actor as any)?.firstName || 'System'} ({(ev.actorRole as string)})
                </div>
              </div>
              <div className="text-text-muted whitespace-nowrap">{formatDateTime(ev.timestamp)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
