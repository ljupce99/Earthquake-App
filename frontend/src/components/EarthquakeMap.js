import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { format } from 'date-fns';

const MAG_RADIUS = (mag) => Math.max(4, mag * 4);
const MAG_COLOR = (mag) => {
  if (mag >= 5) return '#ef4444';
  if (mag >= 3) return '#eab308';
  return '#22c55e';
};

export default function EarthquakeMap({ earthquakes }) {
  const valid = (earthquakes || []).filter(
    e => e.latitude != null && e.longitude != null
  );

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #334155', height: 420 }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        {valid.map((eq) => (
          <CircleMarker
            key={eq.id}
            center={[eq.latitude, eq.longitude]}
            radius={MAG_RADIUS(eq.magnitude)}
            pathOptions={{
              color: MAG_COLOR(eq.magnitude),
              fillColor: MAG_COLOR(eq.magnitude),
              fillOpacity: 0.75,
              weight: 1.5,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, minWidth: 180 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  M {eq.magnitude?.toFixed(1)} — {eq.magType || ''}
                </div>
                <div style={{ color: '#555', marginBottom: 2 }}>{eq.place || 'Unknown'}</div>
                <div style={{ color: '#888', fontSize: 11 }}>
                  {eq.time ? format(new Date(eq.time), 'yyyy-MM-dd HH:mm:ss') + ' UTC' : ''}
                </div>
                {eq.depth != null && (
                  <div style={{ color: '#888', fontSize: 11 }}>Depth: {eq.depth.toFixed(1)} km</div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
