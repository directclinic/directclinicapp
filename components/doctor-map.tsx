'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import { DOCTORS, NYC_CENTER, type Doctor } from '@/lib/doctors'

// Build a purple / green SVG pin as a Leaflet divIcon so we never rely on
// the (often broken) default marker asset URLs.
function pinIcon(active: boolean) {
  const fill = active ? '#16a34a' : '#7c2fd4'
  return L.divIcon({
    className: 'doctor-pin',
    html: `
      <span style="
        display:flex;align-items:center;justify-content:center;
        width:${active ? 38 : 30}px;height:${active ? 38 : 30}px;
        transform:translate(-50%,-100%);
      ">
        <svg viewBox="0 0 24 24" width="${active ? 38 : 30}" height="${active ? 38 : 30}"
          fill="${fill}" stroke="white" stroke-width="1.5"
          style="filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35))">
          <path d="M12 2C7.6 2 4 5.6 4 10c0 5.2 6.6 11.2 7.3 11.8.4.3.9.3 1.3 0C13.4 21.2 20 15.2 20 10c0-4.4-3.6-8-8-8z"/>
          <circle cx="12" cy="10" r="3" fill="white"/>
        </svg>
      </span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

function MapController({
  focused,
  markerRefs,
}: {
  focused: Doctor | null
  markerRefs: React.RefObject<Record<string, L.Marker | null>>
}) {
  const map = useMap()
  useEffect(() => {
    if (focused) {
      map.flyTo([focused.latitude, focused.longitude], 15, {
        duration: 1.1,
      })
      // Open the matching clinic's popup once the fly-to animation settles.
      const marker = markerRefs.current[focused.id]
      if (marker) {
        const timer = setTimeout(() => marker.openPopup(), 700)
        return () => clearTimeout(timer)
      }
    }
  }, [focused, map, markerRefs])
  return null
}

export default function DoctorMap({
  doctors = DOCTORS,
  focused,
  onSelect,
  copayLabel = 'Co-pay',
}: {
  doctors?: Doctor[]
  focused: Doctor | null
  onSelect: (d: Doctor) => void
  copayLabel?: string
}) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({})

  return (
    <MapContainer
      center={NYC_CENTER}
      zoom={11}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: '#e8eef5' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController focused={focused} markerRefs={markerRefs} />
      {doctors.map((d) => (
        <Marker
          key={d.id}
          position={[d.latitude, d.longitude]}
          icon={pinIcon(focused?.id === d.id)}
          ref={(ref) => {
            markerRefs.current[d.id] = ref
          }}
          eventHandlers={{ click: () => onSelect(d) }}
        >
          <Popup>
            <span className="block text-sm font-bold text-foreground">
              {d.fullName}, {d.credential}
            </span>
            <span className="block text-xs text-muted-foreground">
              {d.specialty} · {d.neighborhood}
            </span>
            <span className="mt-1 block text-sm font-bold text-[#16a34a]">
              {copayLabel}: ${d.copayUsd}
            </span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
