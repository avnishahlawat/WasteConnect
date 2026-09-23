import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { LocationPickerMap } from '../../components/maps/LocationPickerMap';
import { issuesApi } from '../../api/issues';
import { sharedApi } from '../../api/shared';
import { MapPin, AlertCircle, FileText, Check, CheckCircle2 } from 'lucide-react';
import { getInstantStreetAddress } from '../../utils/ncrGeocoder';
const COMMON_CATEGORIES = [
    'Illegal Dumping',
    'Overflowing Public Bin',
    'Garbage Accumulation',
    'Uncollected Waste',
    'Plastic Accumulation',
    'Construction Debris',
    'E-waste Dumping',
    'Waste Burning',
    'Damaged Infrastructure',
];
export default function ReportIssuePage() {
    const navigate = useNavigate();
    const [serviceAreas, setServiceAreas] = useState([]);
    const [selectedCity, setSelectedCity] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [formData, setFormData] = useState({
        category: 'Illegal Dumping',
        title: '',
        description: '',
        photos: [],
        address: 'Plot 42, Near Ahinsa Khand 2, Mall Mile Road, Indirapuram, Ghaziabad',
        coordinates: [77.3714, 28.6415],
        serviceArea: '',
        severity: 'MODERATE',
    });
    useEffect(() => {
        sharedApi
            .getServiceAreas()
            .then((res) => {
            if (res.data.data) {
                setServiceAreas(res.data.data);
                if (res.data.data.length > 0) {
                    const areas = res.data.data;
                    const [lng, lat] = [77.3714, 28.6415];
                    let closest = areas[0];
                    let minD = Infinity;
                    areas.forEach((a) => {
                        if (a.coordinates && a.coordinates.lat && a.coordinates.lng) {
                            const d = Math.hypot(a.coordinates.lat - lat, a.coordinates.lng - lng);
                            if (d < minD) { minD = d; closest = a; }
                        }
                    });
                    const initAddr = getInstantStreetAddress(lat, lng, areas);
                    setSelectedCity(closest.city || 'ALL');
                    setFormData((prev) => ({
                        ...prev,
                        serviceArea: closest._id,
                        address: initAddr || prev.address,
                    }));
                }
            }
        })
            .catch((err) => console.error('Failed to load areas:', err));
    }, []);

    // Auto-sync Service Area AND Street Address when pin/coordinates move
    const handleLocationChange = (coords, autoAddress) => {
        const [lng, lat] = coords;
        let closestArea = null;
        let minDistance = Infinity;

        serviceAreas.forEach((area) => {
            if (area.coordinates && area.coordinates.lat && area.coordinates.lng) {
                const d = Math.hypot(area.coordinates.lat - lat, area.coordinates.lng - lng);
                if (d < minDistance) {
                    minDistance = d;
                    closestArea = area;
                }
            }
        });

        const newAddress = autoAddress || getInstantStreetAddress(lat, lng, serviceAreas);

        if (closestArea && closestArea.city) {
            setSelectedCity(closestArea.city);
        }

        setFormData((prev) => ({
            ...prev,
            coordinates: coords,
            serviceArea: closestArea ? closestArea._id : prev.serviceArea,
            address: newAddress || prev.address,
        }));
    };

    // Auto-sync pin, map, and street address when Service Area dropdown is changed manually
    const handleServiceAreaChange = (areaId) => {
        const selected = serviceAreas.find((a) => a._id === areaId);
        if (selected && selected.coordinates) {
            const coords = [selected.coordinates.lng, selected.coordinates.lat];
            const addr = getInstantStreetAddress(selected.coordinates.lat, selected.coordinates.lng, serviceAreas);
            if (selected.city) {
                setSelectedCity(selected.city);
            }
            setFormData((prev) => ({
                ...prev,
                serviceArea: areaId,
                coordinates: coords,
                address: addr || prev.address,
            }));
        } else {
            setFormData((prev) => ({ ...prev, serviceArea: areaId }));
        }
    };
    const handleAiAssist = async () => {
        if (!formData.description && !formData.title) {
            setError('Please provide a title or description first for AI classification.');
            return;
        }
        setError('');
        setAiLoading(true);
        try {
            const res = await issuesApi.classifyIssueAi(formData.title, formData.description);
            if (res.data.success && res.data.data) {
                const d = res.data.data;
                if (COMMON_CATEGORIES.includes(d.predictedCategory)) {
                    setFormData((prev) => ({
                        ...prev,
                        category: d.predictedCategory,
                        severity: d.suggestedSeverity || prev.severity,
                    }));
                }
                setAiResult({
                    suggestedSeverity: d.suggestedSeverity,
                    suggestedAction: d.suggestedAction,
                    explanation: d.explanation,
                });
            }
        }
        catch {
            setError('AI assistant preview unavailable. Please select category manually.');
        }
        finally {
            setAiLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await issuesApi.reportIssue(formData);
            if (res.data.success) {
                navigate('/citizen/issues');
            }
            else {
                setError(res.data.message || 'Failed to submit report');
            }
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to submit report');
        }
        finally {
            setLoading(false);
        }
    };

    const filteredServiceAreas = selectedCity === 'ALL'
        ? serviceAreas
        : serviceAreas.filter((a) => a.city === selectedCity);
    const nearestArea = serviceAreas.find((a) => a._id === formData.serviceArea);

    return (<div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Report a Public Waste Issue" subtitle="Notify municipal sanitation authorities about overflowing bins, illegal dumping, or road debris." breadcrumbs={[
            { label: 'Dashboard', href: '/citizen/dashboard' },
            { label: 'Report Issue' },
        ]}/>

      {error && (<div className="p-4 bg-status-errorBg text-status-error text-sm font-medium rounded-lg border border-status-error/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0"/> {error}
        </div>)}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Issue Details */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-text flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary"/> 1. Issue Information
          </h3>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">Issue Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Large pile of construction debris blocking sidewalk" className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required/>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {COMMON_CATEGORIES.map((cat) => (<option key={cat} value={cat}>
                    {cat}
                  </option>))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Severity Level</label>
              <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="LOW">Low (Minor debris, non-obstructive)</option>
                <option value="MODERATE">Moderate (Standard overflowing bin)</option>
                <option value="HIGH">High (Substantial dumping, traffic impediment)</option>
                <option value="CRITICAL">Critical (Hazardous, active fire, biohazard)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-muted">Detailed Description</label>
              <button type="button" onClick={handleAiAssist} disabled={aiLoading} className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 disabled:opacity-50">
                <CheckCircle2 className="w-3.5 h-3.5"/>
                {aiLoading ? 'Analyzing...' : 'AI Triage Assist'}
              </button>
            </div>
            <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe what kind of waste is present, how long it has been accumulating, and any specific access instructions for the municipal crew..." className="w-full p-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required/>
          </div>

          {aiResult && (<div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs space-y-1">
              <div className="font-semibold text-primary flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5"/> AI Recommended Classification
              </div>
              {aiResult.explanation && <p className="text-text">{aiResult.explanation}</p>}
              {aiResult.suggestedAction && <p className="text-text-muted italic">{aiResult.suggestedAction}</p>}
            </div>)}
        </div>

        {/* Location Information */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-text flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary"/> 2. Exact Location
          </h3>

          {/* Nearest Ward Recommendation Banner */}
          {nearestArea && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Auto-Detected Nearest Ward: <strong className="text-emerald-800">{nearestArea.name}</strong> ({nearestArea.city})
                </span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold shrink-0">
                Synced with Map Pin
              </span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-muted">Filter by City / Zone:</label>
                <span className="text-[11px] text-gray-500 font-medium">
                  {filteredServiceAreas.length} ward{filteredServiceAreas.length === 1 ? '' : 's'} available
                </span>
              </div>

              {/* City Filter Pills */}
              <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1">
                {['ALL', 'Ghaziabad', 'New Delhi', 'Noida'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                      selectedCity === city
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {city === 'ALL' ? 'All Cities' : city}
                  </button>
                ))}
              </div>

              <label className="block text-xs font-semibold text-text-muted mb-1.5">Service Ward</label>
              <select
                value={formData.serviceArea}
                onChange={(e) => handleServiceAreaChange(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
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
                      {a.name} ({a.district} District)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                Street Address / Landmark (Auto-filled on click or editable)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Opposite Gate 3, Sector 4 Industrial Road"
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-text-muted mb-2 font-medium">Pin exact issue coordinates on the map:</div>
            <LocationPickerMap
              coordinates={formData.coordinates}
              onChange={handleLocationChange}
              onAddressSelect={(addr) => setFormData((prev) => ({ ...prev, address: addr }))}
              className="h-64 w-full rounded-xl overflow-hidden border border-border"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate('/citizen/dashboard')} className="px-5 py-2.5 bg-surface border border-border text-charcoal rounded-md text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-70 shadow-sm">
            {loading ? 'Submitting Report...' : 'File Issue Report'}
          </button>
        </div>
      </form>
    </div>);
}
