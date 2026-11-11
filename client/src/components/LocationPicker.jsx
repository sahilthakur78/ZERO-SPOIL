import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Crosshair } from 'lucide-react';
import toast from 'react-hot-toast';
import { pin } from './MapView';

const ClickHandler = ({ onPick }) => { useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) }); return null; };
function Recenter({ value }) {
  const map = useMap();
  useEffect(() => { if (value) map.setView([value.lat, value.lng], Math.max(map.getZoom(), 14)); }, [value?.lat, value?.lng]);
  return null;
}

export default function LocationPicker({ value, onChange, onAddress, height = '260px' }) {
  // Reverse geocoding via OpenStreetMap Nominatim (respect their usage policy in production)
  const reverse = async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const j = await r.json();
      if (j.display_name) onAddress?.(j.display_name);
    } catch { /* address stays manual */ }
  };
  const pick = (lat, lng) => { onChange({ lat, lng }); reverse(lat, lng); };
  const locate = () =>
    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition((p) => pick(p.coords.latitude, p.coords.longitude), () => toast.error('Location permission denied'))
      : toast.error('Geolocation is not supported');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Click the map to drop a pin on the exact pickup point.</p>
        <button type="button" onClick={locate} className="btn-secondary !px-3 !py-1.5 text-xs"><Crosshair size={14} />Use my location</button>
      </div>
      <MapContainer center={value ? [value.lat, value.lng] : [30.7046, 76.7179]} zoom={13} style={{ height }} className="ring-1 ring-slate-200">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onPick={pick} />
        <Recenter value={value} />
        {value && <Marker position={[value.lat, value.lng]} icon={pin('🍲')} />}
      </MapContainer>
    </div>
  );
}
