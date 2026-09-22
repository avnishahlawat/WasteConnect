import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { LocationPickerMap } from '../../components/maps/LocationPickerMap';
import { pickupsApi } from '../../api/pickups';
import { sharedApi } from '../../api/shared';
import type { WasteCategory, ServiceArea } from '../../types';
import { Sparkles, Calendar, MapPin, Package, Check, AlertCircle } from 'lucide-react';

export default function RequestPickupPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGuidance, setAiGuidance] = useState<{ suggestedAction?: string; disposalGuidance?: string; explanation?: string } | null>(null);

  const [formData, setFormData] = useState({
    wasteCategory: '',
    estimatedQuantity: 5,
    unit: 'kg' as 'kg' | 'bags' | 'liters' | 'items',
    address: '14 Elm Street, Central Ward',
    coordinates: [77.2090, 28.6139] as [number, number],
    serviceArea: '',
    preferredDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
    timeSlot: 'MORNING' as 'MORNING' | 'AFTERNOON' | 'EVENING',
    notes: '',
  });

  useEffect(() => {
    Promise.all([sharedApi.getCategories(), sharedApi.getServiceAreas()])
      .then(([catRes, areaRes]) => {
        if (catRes.data.data) {
          setCategories(catRes.data.data);
          if (catRes.data.data.length > 0) {
            setFormData((prev) => ({ ...prev, wasteCategory: catRes.data.data![0]._id }));
          }
        }
        if (areaRes.data.data) {
          setServiceAreas(areaRes.data.data);
          if (areaRes.data.data.length > 0) {
            setFormData((prev) => ({ ...prev, serviceArea: areaRes.data.data![0]._id }));
          }
        }
      })
      .catch((err) => console.error('Failed to load form options:', err));
  }, []);

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
        const matched = categories.find(
          (c) => c.name.toLowerCase() === classified.predictedCategory.toLowerCase()
        );
        if (matched) {
          setFormData((prev) => ({ ...prev, wasteCategory: matched._id }));
        }
        setAiGuidance({
          suggestedAction: classified.suggestedAction,
          disposalGuidance: classified.disposalGuidance,
          explanation: classified.explanation,
        });
      }
    } catch (err: any) {
      setError('AI assistant unavailable at the moment. Please select manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await pickupsApi.requestPickup(formData);
      if (res.data.success) {
        navigate('/citizen/pickups');
      } else {
        setError(res.data.message || 'Failed to submit pickup request');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit pickup request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Schedule a Waste Pickup"
        subtitle="Book an authorized collector for recyclable, hazardous, or bulk items."
        breadcrumbs={[
          { label: 'Dashboard', href: '/citizen/dashboard' },
          { label: 'Request Pickup' },
        ]}
      />

      {error && (
        <div className="p-4 bg-status-errorBg text-status-error text-sm font-medium rounded-lg border border-status-error/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Category & Details */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-text flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> 1. Waste Category & Quantity
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Waste Category</label>
              <select
                value={formData.wasteCategory}
                onChange={(e) => setFormData({ ...formData, wasteCategory: e.target.value })}
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">Est. Quantity</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.estimatedQuantity}
                  onChange={(e) => setFormData({ ...formData, estimatedQuantity: parseFloat(e.target.value) || 1 })}
                  className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-muted">Item Details / Notes</label>
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={aiLoading}
                className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiLoading ? 'Analyzing...' : 'AI Category Assist'}
              </button>
            </div>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Two boxes of old computer batteries and cables, or clean cardboard cartons..."
              className="w-full p-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {aiGuidance && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs space-y-1">
              <div className="font-semibold text-primary flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Suggested Handling Guideline
              </div>
              {aiGuidance.disposalGuidance && <p className="text-text">{aiGuidance.disposalGuidance}</p>}
              {aiGuidance.suggestedAction && <p className="text-text-muted italic">{aiGuidance.suggestedAction}</p>}
            </div>
          )}
        </div>

        {/* Step 2: Location */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-text flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> 2. Collection Location
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Service Area / Ward</label>
              <select
                value={formData.serviceArea}
                onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                {serviceAreas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.district} District)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Street Address</label>
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
            <div className="text-xs text-text-muted mb-2 font-medium">Pin exact collection location on map (click to set marker):</div>
            <LocationPickerMap
              coordinates={formData.coordinates}
              onChange={(coords) => setFormData({ ...formData, coordinates: coords })}
              className="h-56 w-full rounded-lg overflow-hidden border border-border"
            />
          </div>
        </div>

        {/* Step 3: Preferred Date & Time */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-text flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> 3. Schedule Slot
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Preferred Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Time Slot</label>
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value as any })}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="MORNING">Morning (08:00 - 12:00)</option>
                <option value="AFTERNOON">Afternoon (12:00 - 16:00)</option>
                <option value="EVENING">Evening (16:00 - 20:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/citizen/dashboard')}
            className="px-5 py-2.5 bg-surface border border-border text-charcoal rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-70 shadow-sm"
          >
            {loading ? 'Submitting Request...' : 'Confirm Pickup Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
