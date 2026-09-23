import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { pickupsApi } from '../../api/pickups';
import { formatDate, formatWeight } from '../../lib/utils';
import { Truck, Play, CheckCircle2, Phone, MapPin, X, Scale } from 'lucide-react';
export default function CollectorMyPickupsPage() {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ACTIVE');
    // Completion modal state
    const [completingPickup, setCompletingPickup] = useState(null);
    const [actualWeight, setActualWeight] = useState(5);
    const [notes, setNotes] = useState('');
    const [submittingCompletion, setSubmittingCompletion] = useState(false);
    const fetchPickups = () => {
        setLoading(true);
        pickupsApi
            .getCollectorPickups()
            .then((res) => {
            if (res.data.data) {
                setPickups(res.data.data);
            }
        })
            .catch((err) => console.error('Failed to load collector pickups:', err))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        fetchPickups();
    }, []);
    const handleStart = async (id) => {
        try {
            await pickupsApi.startPickup(id);
            fetchPickups();
        }
        catch (err) {
            alert(err.response?.data?.message || 'Failed to start pickup route');
        }
    };
    const handleCompleteSubmit = async (e) => {
        e.preventDefault();
        if (!completingPickup)
            return;
        setSubmittingCompletion(true);
        try {
            await pickupsApi.completePickup(completingPickup._id, {
                actualQuantity: parseFloat(actualWeight) || completingPickup.estimatedQuantity || 1,
                collectorNotes: notes,
            });
            setCompletingPickup(null);
            setNotes('');
            fetchPickups();
        }
        catch (err) {
            alert(err.response?.data?.message || 'Failed to record completion');
        }
        finally {
            setSubmittingCompletion(false);
        }
    };
    const filtered = pickups.filter((p) => {
        if (statusFilter === 'ACTIVE') {
            return ['ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'].includes(p.status);
        }
        if (statusFilter === 'IN_PROGRESS')
            return p.status === 'IN_PROGRESS';
        return true;
    });
    return (<div className="space-y-6">
      <PageHeader title="My Route & Active Assignments" subtitle="Progress your scheduled collections through pickup, transport, and facility weigh-in." breadcrumbs={[
            { label: 'Collector Hub', href: '/collector/dashboard' },
            { label: 'My Pickups' },
        ]}/>

      {/* Filter Tabs */}
      <div className="flex border-b border-border gap-2">
        <button onClick={() => setStatusFilter('ACTIVE')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${statusFilter === 'ACTIVE'
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-text-muted hover:text-text'}`}>
          Active Route Jobs
        </button>
        <button onClick={() => setStatusFilter('IN_PROGRESS')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${statusFilter === 'IN_PROGRESS'
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-text-muted hover:text-text'}`}>
          In Transit Only
        </button>
        <button onClick={() => setStatusFilter('ALL')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${statusFilter === 'ALL'
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-text-muted hover:text-text'}`}>
          All Assigned
        </button>
      </div>

      {loading ? (<div className="space-y-3">
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
        </div>) : filtered.length === 0 ? (<div className="bg-surface border border-border rounded-xl p-8">
          <EmptyState icon={Truck} title="No Active Pickups" description="You do not have any collections scheduled on your route right now."/>
        </div>) : (<div className="grid gap-4">
          {filtered.map((p) => {
                const isAccepted = ['ACCEPTED', 'SCHEDULED'].includes(p.status);
                const isInProgress = p.status === 'IN_PROGRESS';
                return (<div key={p._id} className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text text-base">
                      {p.wasteCategory?.name || 'Waste'}
                    </span>
                    <span className="text-xs bg-gray-100 text-charcoal font-medium px-2 py-0.5 rounded">
                      {formatWeight(p.actualQuantity || p.estimatedQuantity, p.unit)}
                    </span>
                    <StatusBadge status={p.status} type="pickup" size="sm"/>
                  </div>

                  <div className="text-xs text-text-muted flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-text-muted"/>
                    <span className="font-medium text-text">{p.address}</span> • Ward:{' '}
                    {p.serviceArea?.name || 'Central'}
                  </div>

                  <div className="text-xs text-text-muted">
                    Citizen: <strong className="text-text">{p.citizen?.firstName} {p.citizen?.lastName}</strong>
                    {p.citizen?.phone && (<span className="inline-flex items-center gap-1 ml-2 text-primary font-medium">
                        <Phone className="w-3 h-3"/> {p.citizen.phone}
                      </span>)}
                  </div>

                  <div className="text-xs text-text-muted">
                    Target Date: {formatDate(p.preferredDate)} ({p.timeSlot})
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {isAccepted && (<button onClick={() => handleStart(p._id)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-dark transition-colors shadow-sm">
                      <Play className="w-3.5 h-3.5"/> Start Route
                    </button>)}

                  {isInProgress && (<button onClick={() => {
                            setCompletingPickup(p);
                            setActualWeight(p.estimatedQuantity || 5);
                        }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-status-success text-white text-xs font-semibold rounded-md hover:bg-green-700 transition-colors shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5"/> Record Completion
                    </button>)}
                </div>
              </div>);
            })}
        </div>)}

      {/* Completion Record Modal */}
      {completingPickup && (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border max-w-md w-full p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-text flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary"/> Record Collection Weight
              </h3>
              <button onClick={() => setCompletingPickup(null)} className="text-text-muted hover:text-text">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <p className="text-xs text-text-muted">
              Enter the verified weight/quantity collected from {completingPickup.address}. This will create an immutable WasteRecord.
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Actual Quantity Collected ({completingPickup.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">Collector Notes (Optional)</label>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Segregation verified, delivered to Central Ward MRF facility..." className="w-full p-3 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"/>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCompletingPickup(null)} className="px-4 py-2 bg-background border border-border text-xs font-medium rounded text-charcoal hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submittingCompletion} className="px-5 py-2 bg-status-success text-white text-xs font-semibold rounded hover:bg-green-700 disabled:opacity-50">
                  {submittingCompletion ? 'Recording...' : 'Confirm & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
}
