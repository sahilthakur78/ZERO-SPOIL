import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { foodMeta, expiryInfo } from '../utils/format';

export const pin = (emoji, bg = '#16a34a') =>
  L.divIcon({
    className: '',
    html: `<div style="background:${bg};width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 4px 10px rgba(0,0,0,.3);border:2px solid #fff"><span style="transform:rotate(45deg);font-size:18px">${emoji}</span></div>`,
    iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -34],
  });

function Fit({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
    else if (points.length === 1) map.setView(points[0], 14);
  }, [JSON.stringify(points)]);
  return null;
}

export default function MapView({ listings = [], user, height = '440px', link = true }) {
  const pts = listings.map((l) => [l.location.coordinates[1], l.location.coordinates[0]]);
  if (user?.lat) pts.push([user.lat, user.lng]);
  return (
    <MapContainer center={pts[0] || [30.7046, 76.7179]} zoom={12} style={{ height }} scrollWheelZoom className="shadow-sm ring-1 ring-slate-200">
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Fit points={pts} />
      {user?.lat && <Marker position={[user.lat, user.lng]} icon={pin('📍', '#2563eb')}><Popup>You are here</Popup></Marker>}
      {listings.map((l) => (
        <Marker key={l._id} position={[l.location.coordinates[1], l.location.coordinates[0]]} icon={pin(foodMeta(l.foodType).emoji)}>
          <Popup>
            <div className="min-w-[160px]">
              <p className="font-bold">{l.title}</p>
              <p className="text-xs text-slate-500">{l.quantity} {l.unit} · {expiryInfo(l.expiresAt).text}</p>
              {link && <Link to={`/app/listing/${l._id}`} className="mt-1 inline-block text-xs font-semibold text-brand-700">View details →</Link>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
