import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { format } from 'date-fns'

function magColor(mag) {
  if (mag >= 5) return '#ff3d3d'
  if (mag >= 3) return '#ff8c00'
  if (mag >= 2) return '#ffe600'
  return '#00e676'
}

export default function EarthquakeMap({ earthquakes }) {
  const valid = (earthquakes || []).filter(e => e.latitude != null && e.longitude != null)

  return (
    <div style={{ height: 460, borderTop: '1px solid var(--border)' }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} attributionControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {valid.map((eq, i) => (
          <CircleMarker
            key={eq.id ?? i}
            center={[eq.latitude, eq.longitude]}
            radius={Math.max(5, (eq.magnitude || 0) * 4.5)}
            pathOptions={{
              color: magColor(eq.magnitude),
              fillColor: magColor(eq.magnitude),
              fillOpacity: 0.7,
              weight: 1,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>M {eq.magnitude?.toFixed(1)} · {eq.magType}</div>
                <div>{eq.place}</div>
                <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>
                  {eq.time ? format(new Date(eq.time), 'yyyy-MM-dd HH:mm:ss') : ''}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
