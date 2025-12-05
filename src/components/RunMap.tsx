import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface RunMapProps {
  center: LatLngExpression;
  currentPosition: { lat: number; lng: number } | null;
  routeCoordinates: [number, number][];
}

function MapController({ position }: { position: { lat: number; lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  return null;
}

function RunMap({ center, currentPosition, routeCoordinates }: RunMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController position={currentPosition} />
      {currentPosition && (
        <Marker 
          position={[currentPosition.lat, currentPosition.lng]} 
          icon={defaultIcon}
        />
      )}
      {routeCoordinates.length > 1 && (
        <Polyline 
          positions={routeCoordinates}
          color="#3b82f6"
          weight={4}
        />
      )}
    </MapContainer>
  );
}

export default RunMap;
