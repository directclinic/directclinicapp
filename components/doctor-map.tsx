'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet'
import { DOCTORS, NYC_CENTER, type Doctor } from '@/lib/doctors'
import type { GeoResult } from '@/lib/geocode'

// A distinct "you are here" marker (green ring with a white dot) so the
// searcher's address stands apart from the purple clinic pins.
function homeIcon() {
  return L.divIcon({
    className: 'user-home-pin',
    html: `
      <span style="
        display:flex;align-items:center;justify-content:center;
        width:26px;height:26px;transform:translate(-50%,-50%);
      ">
        <span style="
          display:block;width:20px;height:20px;border-radius:9999px;
          background:#2563eb;border:4px solid white;
          box-shadow:0 0 0 3px rgba(37,99,235,0.35),0 2px 4px rgba(0,0,0,0.35);
        "></span>
      </span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

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

// When the searcher sets an address, ease the map over to it so the nearest
// clinics come into view around the blue "you are here" marker.
function LocationController({ userLocation }: { userLocation: GeoResult | null }) {
  const map = useMap()
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.1 })
    }
  }, [userLocation, map])
  return null
}

export default function DoctorMap({
  doctors = DOCTORS,
  focused,
  onSelect,
  copayLabel = 'Co-pay',
  userLocation = null,
  nearYouPrefix = 'Near',
}: {
  doctors?: Doctor[]
  focused: Doctor | null
  onSelect: (d: Doctor) => void
  copayLabel?: string
  userLocation?: GeoResult | null
  nearYouPrefix?: string
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
      <LocationController userLocation={userLocation} />
      {userLocation && (
        <>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={1600}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#2563eb',
              fillOpacity: 0.08,
              weight: 1.5,
            }}
          />
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={homeIcon()}
            zIndexOffset={1000}
          >
            <Popup>
              <span className="block text-sm font-bold text-foreground">
                {nearYouPrefix}
              </span>
              <span className="block text-xs text-muted-foreground">
                {userLocation.label.split(',').slice(0, 3).join(',')}
              </span>
            </Popup>
          </Marker>
        </>
      )}
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
