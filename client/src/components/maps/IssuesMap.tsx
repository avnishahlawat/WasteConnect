import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { PublicIssue, ServiceArea } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Link } from 'react-router-dom';

const createCustomIcon = (color: string) =>
  L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const severityColors: Record<string, string> = {
  CRITICAL: '#DC2626',
  HIGH: '#EA580C',
  MODERATE: '#2563EB',
  LOW: '#16A34A',
};

const hotspotColors: Record<string, string> = {
  CRITICAL: '#DC2626',
  HIGH: '#EA580C',
  ELEVATED: '#D97706',
  MODERATE: '#2563EB',
  LOW: '#16A34A',
};

interface IssuesMapProps {
  issues: PublicIssue[];
  serviceAreas?: ServiceArea[];
  height?: string;
  detailBaseUrl?: string; // e.g. '/authority/issues' or '/citizen/issues'
}

export function IssuesMap({
  issues,
  serviceAreas = [],
  height = '500px',
  detailBaseUrl = '/authority/issues',
}: IssuesMapProps) {
  // Center map on Greenfield
  const defaultCenter: [number, number] = [28.6139, 77.2090];

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden border border-border shadow-sm">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Service Area Outlines */}
        {serviceAreas.map((area) => (
          <Circle
            key={area._id}
            center={[area.coordinates.lat, area.coordinates.lng]}
            radius={2500}
            pathOptions={{
              color: hotspotColors[area.hotspotLevel] || '#2D6A4F',
              fillColor: hotspotColors[area.hotspotLevel] || '#2D6A4F',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          >
            <Popup>
              <div className="p-1">
                <h4 className="font-semibold text-sm">{area.name}</h4>
                <div className="text-xs text-text-muted mt-1">
                  Hotspot Score: <span className="font-bold">{area.hotspotScore}/100</span> ({area.hotspotLevel})
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Issue Markers */}
        {issues.map((issue) => {
          const coords: [number, number] = [
            issue.location.coordinates[1],
            issue.location.coordinates[0],
          ];
          const color = severityColors[issue.severity] || '#2563EB';

          return (
            <Marker key={issue._id} position={coords} icon={createCustomIcon(color)}>
              <Popup>
                <div className="p-1 max-w-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={issue.severity} type="severity" size="sm" />
                    <StatusBadge status={issue.status} type="issue" size="sm" />
                  </div>
                  <h4 className="font-semibold text-sm leading-snug">{issue.title}</h4>
                  <p className="text-xs text-text-muted line-clamp-2">{issue.description}</p>
                  <div className="text-xs font-medium text-charcoal">{issue.address}</div>
                  <div className="pt-1">
                    <Link
                      to={`${detailBaseUrl}/${issue._id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View Full Details &rarr;
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
