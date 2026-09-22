import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path in bundler environments
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface LocationPickerMapProps {
  coordinates: [number, number]; // [lng, lat]
  onChange: (coords: [number, number]) => void;
  className?: string;
}

function LocationMarker({ coordinates, onChange }: LocationPickerMapProps) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lng, e.latlng.lat]);
    },
  });

  return coordinates ? <Marker position={[coordinates[1], coordinates[0]]} /> : null;
}

export function LocationPickerMap({ coordinates, onChange, className }: LocationPickerMapProps) {
  // Default coordinates: Greenfield Center [lat: 28.6139, lng: 77.2090]
  const lat = coordinates ? coordinates[1] : 28.6139;
  const lng = coordinates ? coordinates[0] : 77.2090;

  return (
    <div className={className || 'h-64 w-full rounded-lg overflow-hidden border border-border'}>
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker coordinates={coordinates} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
