import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { sharedApi } from '../../api/shared';
import { adminApi } from '../../api/admin';
import { Plus, X } from 'lucide-react';
export default function ServiceAreasPage() {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    // Form state
    const [name, setName] = useState('');
    const [city, setCity] = useState('Greenfield');
    const [district, setDistrict] = useState('Central');
    const [lat, setLat] = useState(28.6139);
    const [lng, setLng] = useState(77.2090);
    const [submitting, setSubmitting] = useState(false);
    const fetchAreas = () => {
        setLoading(true);
        sharedApi
            .getServiceAreas()
            .then((res) => {
            if (res.data.data) {
                setAreas(res.data.data);
            }
        })
            .catch((err) => console.error('Failed to load areas:', err))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        fetchAreas();
    }, []);
    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminApi.createServiceArea({
                name,
                city,
                district,
                coordinates: { lat, lng },
            });
            setModalOpen(false);
            setName('');
            fetchAreas();
        }
        catch (err) {
            alert(err.response?.data?.message || 'Failed to add service area');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Service Areas & Ward Jurisdiction" subtitle="Configure municipal districts, operational boundaries, and geographical hotspot scoring centers." breadcrumbs={[
            { label: 'Admin Command', href: '/admin/dashboard' },
            { label: 'Service Areas' },
        ]} className="border-0 pb-0 mb-0"/>

        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-primary-dark shadow-sm">
          <Plus className="w-4 h-4"/> Add Service Area
        </button>
      </div>

      {loading ? (<LoadingSkeleton type="card"/>) : (<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((a) => (<div key={a._id} className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-text">{a.name}</h3>
                  <div className="text-xs text-text-muted">{a.district} District • {a.city}</div>
                </div>
                <StatusBadge status={a.hotspotLevel} type="hotspot" size="sm"/>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted">Hotspot Score:</span>
                <span className="font-bold text-charcoal">{a.hotspotScore} / 100</span>
              </div>

              <div className="text-[11px] text-text-muted">
                Coordinates: {a.coordinates.lat.toFixed(4)}, {a.coordinates.lng.toFixed(4)}
              </div>
            </div>))}
        </div>)}

      {modalOpen && (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-text">Add Service Area</h3>
              <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-text">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-text-muted mb-1">Area / Ward Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. West Ward (Commercial)" className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs focus:outline-none" required/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-muted mb-1">City</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs focus:outline-none" required/>
                </div>
                <div>
                  <label className="block font-semibold text-text-muted mb-1">District</label>
                  <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs focus:outline-none" required/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-muted mb-1">Latitude</label>
                  <input type="number" step="0.0001" value={lat} onChange={(e) => setLat(parseFloat(e.target.value) || 0)} className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs focus:outline-none" required/>
                </div>
                <div>
                  <label className="block font-semibold text-text-muted mb-1">Longitude</label>
                  <input type="number" step="0.0001" value={lng} onChange={(e) => setLng(parseFloat(e.target.value) || 0)} className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs focus:outline-none" required/>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-background border border-border text-xs font-medium rounded text-charcoal hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-dark disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Save Area'}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
}
