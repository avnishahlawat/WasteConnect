import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { pickupsApi } from '../../api/pickups';
import { formatDate } from '../../lib/utils';
import type { PickupRequest } from '../../types';
import { Truck, Plus, Star, X, Eye } from 'lucide-react';

export default function MyPickupsPage() {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Rating Modal state
  const [ratingPickup, setRatingPickup] = useState<PickupRequest | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchPickups = () => {
    setLoading(true);
    pickupsApi
      .getCitizenPickups(statusFilter !== 'ALL' ? { status: statusFilter } : undefined)
      .then((res) => {
        if (res.data.data) {
          setPickups(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load pickups:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPickups();
  }, [statusFilter]);

  const handleCancel = async () => {
    if (!cancellingId) return;
    try {
      await pickupsApi.cancelPickup(cancellingId, 'Cancelled by citizen via web portal');
      setCancellingId(null);
      fetchPickups();
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingPickup) return;
    setSubmittingRating(true);
    try {
      await pickupsApi.submitFeedback(ratingPickup._id, { rating, comment });
      setRatingPickup(null);
      setComment('');
      fetchPickups();
    } catch (err) {
      console.error('Feedback failed:', err);
    } finally {
      setSubmittingRating(false);
    }
  };

  const tabs = [
    { label: 'All Requests', value: 'ALL' },
    { label: 'Available / Open', value: 'AVAILABLE' },
    { label: 'Assigned / In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="My Waste Pickups"
          subtitle="Track and manage your scheduled household waste collection requests."
          breadcrumbs={[
            { label: 'Dashboard', href: '/citizen/dashboard' },
            { label: 'My Pickups' },
          ]}
          className="border-0 pb-0 mb-0"
        />
        <Link
          to="/citizen/request-pickup"
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Request Pickup
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

      {/* List / Table */}
      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : pickups.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8">
          <EmptyState
            icon={Truck}
            title="No Pickups Found"
            description="You don't have any pickup requests under this filter."
            action={
              <Link
                to="/citizen/request-pickup"
                className="inline-flex items-center gap-2 bg-primary text-white text-xs font-medium px-3 py-2 rounded-md mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Request a Pickup
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {pickups.map((p) => {
            const canCancel = ['PENDING', 'AVAILABLE', 'ASSIGNED', 'ACCEPTED'].includes(p.status);
            const isCompleted = p.status === 'COMPLETED';

            return (
              <div
                key={p._id}
                className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={p.status} type="pickup" size="sm" />
                    <span className="font-semibold text-text text-base">
                      {(p.wasteCategory as any)?.name || 'Waste'}
                    </span>
                    <span className="text-xs bg-gray-100 text-charcoal px-2 py-0.5 rounded font-medium">
                      {p.estimatedQuantity} {p.unit}
                    </span>
                  </div>

                  <div className="text-xs text-text-muted">
                    <span className="font-medium text-charcoal">{p.address}</span> • Service Area:{' '}
                    {(p.serviceArea as any)?.name || 'Central'}
                  </div>

                  <div className="text-xs text-text-muted">
                    Scheduled: <span className="font-medium text-text">{formatDate(p.preferredDate)}</span> •{' '}
                    Slot: <span className="capitalize">{p.timeSlot.toLowerCase()}</span>
                    {p.assignedCollector && (
                      <span>
                        {' '}
                        • Collector:{' '}
                        <strong className="text-charcoal font-medium">
                          {(p.assignedCollector as any).firstName} {(p.assignedCollector as any).lastName}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Link
                    to={`/citizen/pickups/${p._id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-background border border-border text-xs font-medium text-charcoal rounded hover:bg-gray-50"
                  >
                    <Eye className="w-3.5 h-3.5" /> Timeline
                  </Link>

                  {isCompleted && (
                    <button
                      onClick={() => setRatingPickup(p)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium rounded hover:bg-amber-100"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Rate Collector
                    </button>
                  )}

                  {canCancel && (
                    <button
                      onClick={() => setCancellingId(p._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-status-errorBg text-status-error border border-status-error/20 text-xs font-medium rounded hover:bg-red-100"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(cancellingId)}
        onClose={() => setCancellingId(null)}
        onConfirm={handleCancel}
        title="Cancel Pickup Request?"
        description="Are you sure you want to cancel this waste collection request? This action cannot be undone."
        confirmText="Yes, Cancel Pickup"
        variant="danger"
      />

      {/* Collector Rating Modal */}
      {ratingPickup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border max-w-md w-full p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-text">Rate Collector Service</h3>
              <button
                onClick={() => setRatingPickup(null)}
                className="text-text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-muted">
              How was your collection experience with{' '}
              {(ratingPickup.assignedCollector as any)?.firstName || 'your collector'}?
            </p>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-charcoal ml-2">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">Feedback / Comments</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Collector was punctual, professional, and handled waste segregation cleanly..."
                  className="w-full p-3 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingPickup(null)}
                  className="px-4 py-2 bg-background border border-border text-xs font-medium rounded text-charcoal hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="px-4 py-2 bg-primary text-white text-xs font-medium rounded hover:bg-primary-dark disabled:opacity-50"
                >
                  {submittingRating ? 'Saving...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
