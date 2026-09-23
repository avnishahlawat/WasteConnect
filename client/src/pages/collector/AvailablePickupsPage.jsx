import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { pickupsApi } from '../../api/pickups';
import { sharedApi } from '../../api/shared';
import { formatDate, formatWeight } from '../../lib/utils';
import { Inbox, Check, MapPin, Calendar, Clock } from 'lucide-react';
export default function AvailablePickupsPage() {
    const navigate = useNavigate();
    const [pickups, setPickups] = useState([]);
    const [serviceAreas, setServiceAreas] = useState([]);
    const [selectedCity, setSelectedCity] = useState('ALL');
    const [selectedArea, setSelectedArea] = useState('');
    const [onlyMyAreas, setOnlyMyAreas] = useState(false);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState(null);
    const [message, setMessage] = useState('');
    const loadData = () => {
        setLoading(true);
        const params = {};
        if (selectedArea && selectedArea !== 'ALL') params.serviceArea = selectedArea;
        if (selectedCity && selectedCity !== 'ALL') params.city = selectedCity;
        if (onlyMyAreas) params.onlyMyAreas = 'true';
        pickupsApi
            .getAvailablePickups(Object.keys(params).length > 0 ? params : undefined)
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
            if (res.data.data)
                setServiceAreas(res.data.data);
        })
            .catch((err) => console.error('Failed to load service areas:', err));
    }, []);
    useEffect(() => {
        loadData();
    }, [selectedArea, selectedCity, onlyMyAreas]);
    const handleAccept = async (id) => {
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
        }
        catch (err) {
            alert(err.response?.data?.message || 'Failed to accept pickup');
        }
        finally {
            setAcceptingId(null);
        }
    };

    const filteredServiceAreas = selectedCity === 'ALL'
        ? serviceAreas
        : serviceAreas.filter((a) => a.city === selectedCity);

    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Available Pickups Marketplace" subtitle="Accept unassigned household collection requests in your jurisdiction." breadcrumbs={[
            { label: 'Collector Hub', href: '/collector/dashboard' },
            { label: 'Marketplace' },
        ]} className="border-0 pb-0 mb-0"/>

        <div className="flex flex-wrap items-center gap-2">
          {/* City Filter Pills */}
          <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg text-xs font-semibold">
            {['ALL', 'Ghaziabad', 'New Delhi', 'Noida'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => { setSelectedCity(city); setSelectedArea(''); }}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  selectedCity === city
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {city === 'ALL' ? 'All Cities' : city}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full h-9 px-2.5 bg-surface border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Wards ({filteredServiceAreas.length})</option>
              {selectedCity === 'ALL' ? (
                <>
                  <optgroup label="Ghaziabad Wards">
                    {serviceAreas.filter((a) => a.city === 'Ghaziabad').map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name} ({a.district})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="New Delhi Wards">
                    {serviceAreas.filter((a) => a.city === 'New Delhi').map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name} ({a.district})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Noida Wards">
                    {serviceAreas.filter((a) => a.city === 'Noida').map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name} ({a.district})
                      </option>
                    ))}
                  </optgroup>
                </>
              ) : (
                filteredServiceAreas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {message && (<div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0"/> {message}
        </div>)}

      {loading ? (<div className="space-y-3">
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
        </div>) : pickups.length === 0 ? (<div className="bg-surface border border-border rounded-xl p-8">
          <EmptyState icon={Inbox} title="No Open Requests" description="All pickup requests in this zone have been claimed by collection teams."/>
        </div>) : (<div className="grid gap-4">
          {pickups.map((p) => (<div key={p._id} className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text text-base">
                    {p.wasteCategory?.name || 'Waste'}
                  </span>
                  <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                    {formatWeight(p.actualQuantity || p.estimatedQuantity, p.unit)}
                  </span>
                  <StatusBadge status={p.status} type="pickup" size="sm"/>
                </div>

                <div className="text-xs text-text-muted flex flex-wrap items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0"/>
                  <span className="font-medium text-text">{p.address}</span> • Ward:{' '}
                  <span className="font-semibold text-text">{p.serviceArea?.name || 'Central Ward'}</span>
                  {p.serviceArea?.city && <span className="text-gray-500">({p.serviceArea.city})</span>}
                  {p.citizen && (
                    <span className="text-text-muted">
                      • Citizen: <span className="font-medium text-text">{p.citizen.firstName} {p.citizen.lastName}</span>
                    </span>
                  )}
                </div>

                <div className="text-xs text-text-muted flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-text-muted"/> {formatDate(p.preferredDate)}
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <Clock className="w-3.5 h-3.5 text-text-muted"/> {p.timeSlot.toLowerCase()}
                  </span>
                </div>

                {p.notes && (<p className="text-xs text-text-muted bg-gray-50 border border-border p-2 rounded line-clamp-2">
                    Note: {p.notes}
                  </p>)}
              </div>

              <div className="self-end md:self-center">
                <button onClick={() => handleAccept(p._id)} disabled={acceptingId === p._id} className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-sm flex items-center gap-1.5">
                  <Check className="w-4 h-4"/>
                  {acceptingId === p._id ? 'Accepting...' : 'Accept Job'}
                </button>
              </div>
            </div>))}
        </div>)}
    </div>);
}
