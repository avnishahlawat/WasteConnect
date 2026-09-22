import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { pickupsApi } from '../../api/pickups';
import { sharedApi } from '../../api/shared';
import { formatDate } from '../../lib/utils';
import type { PickupRequest, ServiceArea } from '../../types';
import { Inbox, Check, MapPin, Calendar, Clock } from 'lucide-react';

export default function AvailablePickupsPage() {
  const navigate = useNavigate();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const loadData = () => {
    setLoading(true);
    pickupsApi
      .getAvailablePickups(selectedArea ? { serviceArea: selectedArea } : undefined)
      .then((res) => {
        if (res.data.data) {
          setPickups(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load available pickups:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    sharedApi
      .getServiceAreas()
      .then((res) => {
        if (res.data.data) setServiceAreas(res.data.data);
      })
      .catch((err) => console.error('Failed to load service areas:', err));
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedArea]);

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    setMessage('');
    try {
      const res = await pickupsApi.acceptPickup(id);
      if (res.data.success) {
        setMessage('Pickup accepted! It has been added to your active route.');
        setTimeout(() => {
          navigate('/collector/pickups');
        }, 1200);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept pickup');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Available Pickups Marketplace"
          subtitle="Accept unassigned household collection requests in your jurisdiction."
          breadcrumbs={[
            { label: 'Collector Hub', href: '/collector/dashboard' },
            { label: 'Marketplace' },
          ]}
          className="border-0 pb-0 mb-0"
        />

        <div className="w-full sm:w-64">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All My Authorized Areas</option>
            {serviceAreas.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" /> {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : pickups.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8">
          <EmptyState
            icon={Inbox}
            title="No Open Requests"
            description="All pickup requests in this zone have been claimed by collection teams."
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {pickups.map((p) => (
            <div
              key={p._id}
              className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text text-base">
                    {(p.wasteCategory as any)?.name || 'Waste'}
                  </span>
                  <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                    {p.estimatedQuantity} {p.unit}
                  </span>
                  <StatusBadge status={p.status} type="pickup" size="sm" />
                </div>

                <div className="text-xs text-text-muted flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                  <span className="font-medium text-text">{p.address}</span> • Ward:{' '}
                  {(p.serviceArea as any)?.name || 'Central'}
                </div>

                <div className="text-xs text-text-muted flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" /> {formatDate(p.preferredDate)}
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <Clock className="w-3.5 h-3.5 text-text-muted" /> {p.timeSlot.toLowerCase()}
                  </span>
                </div>

                {p.notes && (
                  <p className="text-xs text-text-muted bg-gray-50 border border-border p-2 rounded line-clamp-2">
                    Note: {p.notes}
                  </p>
                )}
              </div>

              <div className="self-end md:self-center">
                <button
                  onClick={() => handleAccept(p._id)}
                  disabled={acceptingId === p._id}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {acceptingId === p._id ? 'Accepting...' : 'Accept Job'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
