import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Loader2, CheckCircle2, Compass, Move } from 'lucide-react';
import { getInstantStreetAddress, reverseGeocodeCoords } from '../../utils/ncrGeocoder';

// Custom high-contrast marker icon
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = customIcon;

// Quick location presets for Ghaziabad & Delhi NCR
const AREA_PRESETS = [
  { name: 'Indirapuram (Ghaziabad)', lat: 28.6415, lng: 77.3714 },
  { name: 'Raj Nagar (Ghaziabad)', lat: 28.6811, lng: 77.4422 },
  { name: 'Vasundhara (Ghaziabad)', lat: 28.6600, lng: 77.3550 },
  { name: 'Sahibabad (Ghaziabad)', lat: 28.6720, lng: 77.3450 },
  { name: 'Crossings Republik (Ghaziabad)', lat: 28.6280, lng: 77.4340 },
  { name: 'Kaushambi / Anand Vihar', lat: 28.6502, lng: 77.3210 },
  { name: 'Connaught Place (Delhi)', lat: 28.6315, lng: 77.2167 },
  { name: 'Saket (South Delhi)', lat: 28.5244, lng: 77.2100 },
  { name: 'Laxmi Nagar (East Delhi)', lat: 28.6180, lng: 77.2980 },
  { name: 'Chandni Chowk (Old Delhi)', lat: 28.6562, lng: 77.2300 },
  { name: 'Rohini (North West Delhi)', lat: 28.7166, lng: 77.1147 },
  { name: 'Dwarka (South West Delhi)', lat: 28.5823, lng: 77.0500 },
  { name: 'Noida Sector 62', lat: 28.6270, lng: 77.3650 },
  { name: 'Noida Sector 18', lat: 28.5708, lng: 77.3260 },
];

// Controller component to smoothly fly map to new coordinates
function MapPanController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 15, { duration: 1 });
    }
  }, [center, map]);
  return null;
}

// Marker component with both drag-and-drop AND click listeners
function InteractiveDraggableMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          onPositionChange(pos.lat, pos.lng);
        },
      }}
    />
  ) : null;
}

export function LocationPickerMap({ coordinates, onChange, onAddressSelect, className }) {
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState('');
  const [geoError, setGeoError] = useState('');
  const lastGeocodedKey = useRef('');

  // Default to Ghaziabad / Delhi NCR [lat, lng]
  const currentLat = coordinates && coordinates[1] ? coordinates[1] : 28.6415;
  const currentLng = coordinates && coordinates[0] ? coordinates[0] : 77.3714;

  // Reverse geocoding helper with instant local address + async enrichment
  const reverseGeocode = async (lat, lng) => {
    // 1. Instant local address ensures zero lag and immunity to network rate-limiting
    const instantAddr = getInstantStreetAddress(lat, lng);
    setDetectedAddress(instantAddr);
    if (onAddressSelect) {
      onAddressSelect(instantAddr);
    }

    // 2. Background enrichment if network endpoint is reachable
    setIsGeocoding(true);
    try {
      const enriched = await reverseGeocodeCoords(lat, lng);
      if (enriched && enriched !== instantAddr) {
        setDetectedAddress(enriched);
        if (onAddressSelect) {
          onAddressSelect(enriched);
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding enrichment warning:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Run reverse geocoding on mount and whenever coordinates change
  useEffect(() => {
    const key = `${Number(currentLat).toFixed(4)},${Number(currentLng).toFixed(4)}`;
    if (lastGeocodedKey.current !== key) {
      lastGeocodedKey.current = key;
      reverseGeocode(currentLat, currentLng);
    }
  }, [currentLat, currentLng]);

  // Handle position change from marker drag OR map click
  const handlePositionChange = (lat, lng) => {
    setGeoError('');
    const instantAddr = getInstantStreetAddress(lat, lng);
    setDetectedAddress(instantAddr);
    if (onAddressSelect) {
      onAddressSelect(instantAddr);
    }
    if (onChange) {
      onChange([lng, lat], instantAddr);
    }
  };

  // Quick Preset select
  const handlePresetSelect = (preset) => {
    setGeoError('');
    const instantAddr = getInstantStreetAddress(preset.lat, preset.lng);
    setDetectedAddress(instantAddr);
    if (onAddressSelect) {
      onAddressSelect(instantAddr);
    }
    if (onChange) {
      onChange([preset.lng, preset.lat], instantAddr);
    }
  };

  // Browser GPS auto-fetch
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoError('');
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const instantAddr = getInstantStreetAddress(lat, lng);
        setDetectedAddress(instantAddr);
        if (onAddressSelect) {
          onAddressSelect(instantAddr);
        }
        if (onChange) {
          onChange([lng, lat], instantAddr);
        }
      },
      (err) => {
        setIsLocating(false);
        setGeoError('GPS access denied or unavailable. Please click or drag the pin to your location.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-2">
      {/* Controls & Quick Area Chips Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 shrink-0">
            <Compass className="w-3.5 h-3.5 text-emerald-600" /> Quick Areas:
          </span>
          {AREA_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 transition border border-gray-200 shrink-0 cursor-pointer font-medium"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* GPS Auto-detect Button */}
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-semibold shadow-xs transition disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              <span>Detect My Location</span>
            </>
          )}
        </button>
      </div>

      {geoError && (
        <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
          {geoError}
        </div>
      )}

      {/* Map Container */}
      <div className={className || 'h-64 w-full rounded-xl overflow-hidden border border-border shadow-xs relative'}>
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
        >
          {/* Official Free OpenStreetMap Standard Tiles (Zero Watermarks, 100% Free, No API Key Required) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <InteractiveDraggableMarker
            position={[currentLat, currentLng]}
            onPositionChange={handlePositionChange}
          />
          <MapPanController center={[currentLat, currentLng]} />
        </MapContainer>

        {/* Drag Hint Overlay */}
        <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-gray-600 shadow-xs border border-gray-200 flex items-center gap-1 pointer-events-none">
          <Move className="w-3 h-3 text-emerald-600" />
          <span>Click anywhere or drag pin</span>
        </div>
      </div>

      {/* Detected Location Status Bar */}
      <div className="flex items-center justify-between text-[11px] px-3 py-2 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-900">
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="font-semibold text-emerald-800 shrink-0">Auto-Detected:</span>
          {isGeocoding ? (
            <span className="flex items-center gap-1 text-gray-500 italic">
              <Loader2 className="w-3 h-3 animate-spin" /> Fetching street name...
            </span>
          ) : (
            <span className="truncate text-gray-800 font-medium">
              {detectedAddress || `${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold shrink-0 ml-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Location Synced</span>
        </div>
      </div>
    </div>
  );
}
export default LocationPickerMap;
