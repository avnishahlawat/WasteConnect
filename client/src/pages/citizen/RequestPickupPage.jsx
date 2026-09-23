import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { LocationPickerMap } from '../../components/maps/LocationPickerMap';
import { pickupsApi } from '../../api/pickups';
import { sharedApi } from '../../api/shared';
import { CheckCircle2, Calendar, MapPin, Package, Check, AlertCircle } from 'lucide-react';
import { getInstantStreetAddress } from '../../utils/ncrGeocoder';

export default function RequestPickupPage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [serviceAreas, setServiceAreas] = useState([]);
    const [selectedCity, setSelectedCity] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiGuidance, setAiGuidance] = useState(null);
    const [formData, setFormData] = useState({
        wasteCategory: '',
        estimatedQuantity: '5',
        unit: 'kg',
        address: 'Plot 42, Near Ahinsa Khand 2, Mall Mile Road, Indirapuram, Ghaziabad',
        coordinates: [77.3714, 28.6415],
        serviceArea: '',
        preferredDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
        timeSlot: 'MORNING',
        notes: '',
    });

    const handleCategoryChange = (catId) => {
        const cat = categories.find((c) => c._id === catId);
        let defaultQty = formData.estimatedQuantity;
        let defaultUnit = formData.unit;
        if (cat) {
            const name = cat.name.toLowerCase();
            if (name.includes('e-waste') || name.includes('electronic')) {
                defaultQty = '2';
                defaultUnit = 'items';
            } else if (name.includes('hazard') || name.includes('battery')) {
                defaultQty = '1';
                defaultUnit = 'items';
            } else if (name.includes('bulk') || name.includes('furniture')) {
                defaultQty = '1';
                defaultUnit = 'items';
            } else if (name.includes('plastic') || name.includes('paper') || name.includes('dry')) {
                defaultQty = '5';
                defaultUnit = 'kg';
            }
        }
        setFormData((prev) => ({
            ...prev,
            wasteCategory: catId,
            estimatedQuantity: defaultQty,
            unit: defaultUnit,
        }));
    };
    useEffect(() => {
        Promise.all([sharedApi.getCategories(), sharedApi.getServiceAreas()])
            .then(([catRes, areaRes]) => {
            if (catRes.data.data) {
                setCategories(catRes.data.data);
                if (catRes.data.data.length > 0) {
                    setFormData((prev) => ({ ...prev, wasteCategory: catRes.data.data[0]._id }));
                }
            }
            if (areaRes.data.data) {
                setServiceAreas(areaRes.data.data);
                if (areaRes.data.data.length > 0) {
                    const areas = areaRes.data.data;
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
            .catch((err) => console.error('Failed to load form options:', err));
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
        if (!formData.notes) {
            setError('Please type a brief note or description of the waste in the Notes field first.');
            return;
        }
        setError('');
        setAiLoading(true);
        try {
            const res = await pickupsApi.classifyWasteAi(formData.notes);
            if (res.data.success && res.data.data) {
                const classified = res.data.data;
                const matched = categories.find((c) => c.name.toLowerCase() === classified.predictedCategory.toLowerCase());
                if (matched) {
                    setFormData((prev) => ({ ...prev, wasteCategory: matched._id }));
                }
                setAiGuidance({
                    suggestedAction: classified.suggestedAction,
                    disposalGuidance: classified.disposalGuidance,
                    explanation: classified.explanation,
                });
            }
        }
        catch (err) {
            setError('AI assistant unavailable at the moment. Please select manually.');
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
            const payload = {
                ...formData,
                estimatedQuantity: parseFloat(formData.estimatedQuantity) || 1,
            };
            const res = await pickupsApi.requestPickup(payload);
            if (res.data.success) {
                navigate('/citizen/pickups');
            }
            else {
                setError(res.data.message || 'Failed to submit pickup request');
            }
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to submit pickup request');
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
      <PageHeader title="Schedule a Waste Pickup" subtitle="Book an authorized collector for recyclable, hazardous, or bulk items." breadcrumbs={[
            { label: 'Dashboard', href: '/citizen/dashboard' },
            { label: 'Request Pickup' },
        ]}/>

      {error && (<div className="p-4 bg-status-errorBg text-status-error text-sm font-medium rounded-lg border border-status-error/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0"/> {error}
        </div>)}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Category & Details */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-text flex items-center gap-2">
            <Package className="w-5 h-5 text-primary"/> 1. Waste Category & Quantity
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Waste Category</label>
              <select
                value={formData.wasteCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.recyclable ? '(Recyclable)' : ''} {c.hazardous ? '(Hazardous)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-text-muted">Est. Quantity & Unit</label>
                {/* Quick Presets */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400 font-medium mr-0.5">Quick:</span>
                  {['1', '2', '5', '10', '20'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, estimatedQuantity: preset }))}
                      className={`text-[10px] px-1.5 py-0.5 rounded border transition cursor-pointer ${
                        String(formData.estimatedQuantity) === preset
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={formData.estimatedQuantity}
                    onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
                    placeholder="e.g. 5"
                    className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>
                <div>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="kg">kg</option>
                    <option value="bags">bags</option>
                    <option value="items">items</option>
                    <option value="liters">liters</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-muted">Item Details / Notes</label>
              <button type="button" onClick={handleAiAssist} disabled={aiLoading} className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 disabled:opacity-50">
                <CheckCircle2 className="w-3.5 h-3.5"/>
                {aiLoading ? 'Analyzing...' : 'AI Category Assist'}
              </button>
            </div>
            <textarea rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="e.g. Two boxes of old computer batteries and cables, or clean cardboard cartons..." className="w-full p-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"/>
          </div>

          {aiGuidance && (<div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs space-y-1">
              <div className="font-semibold text-primary flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5"/> Suggested Handling Guideline
              </div>
              {aiGuidance.disposalGuidance && <p className="text-text">{aiGuidance.disposalGuidance}</p>}
              {aiGuidance.suggestedAction && <p className="text-text-muted italic">{aiGuidance.suggestedAction}</p>}
            </div>)}
        </div>

        {/* Step 2: Location */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-text flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary"/> 2. Collection Location
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
                placeholder="House #, Street name, Landmark"
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-text-muted mb-2 font-medium">Pin exact collection location on map (click or drag to set marker):</div>
            <LocationPickerMap
              coordinates={formData.coordinates}
              onChange={handleLocationChange}
              onAddressSelect={(addr) => setFormData((prev) => ({ ...prev, address: addr }))}
              className="h-64 w-full rounded-xl overflow-hidden border border-border"
            />
          </div>
        </div>

        {/* Step 3: Preferred Date & Time */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-text flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary"/> 3. Schedule Slot
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Preferred Date</label>
              <input type="date" min={new Date().toISOString().split('T')[0]} value={formData.preferredDate} onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })} className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Time Slot</label>
              <select value={formData.timeSlot} onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })} className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="MORNING">Morning (08:00 - 12:00)</option>
                <option value="AFTERNOON">Afternoon (12:00 - 16:00)</option>
                <option value="EVENING">Evening (16:00 - 20:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate('/citizen/dashboard')} className="px-5 py-2.5 bg-surface border border-border text-charcoal rounded-md text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-70 shadow-sm">
            {loading ? 'Submitting Request...' : 'Confirm Pickup Request'}
          </button>
        </div>
      </form>
    </div>);
}
