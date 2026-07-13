// Lightweight client-side geocoding using the free OpenStreetMap Nominatim API.
// No API key required. Results are biased to the New York City area so a query
// like "77th street" or a full street address resolves to the right place.

export interface GeoResult {
  lat: number
  lng: number
  label: string
}

// Bounding box roughly covering the five boroughs (left, top, right, bottom).
const NYC_VIEWBOX = '-74.30,40.92,-73.68,40.48'

export async function geocodeAddress(
  address: string,
  signal?: AbortSignal,
): Promise<GeoResult | null> {
  const q = address.trim()
  if (!q) return null

  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({
      q,
      format: 'jsonv2',
      addressdetails: '0',
      limit: '1',
      countrycodes: 'us',
      viewbox: NYC_VIEWBOX,
      bounded: '1',
    }).toString()

  const res = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)

  const data = (await res.json()) as Array<{
    lat: string
    lon: string
    display_name: string
  }>
  if (!data.length) return null

  const hit = data[0]
  return {
    lat: Number.parseFloat(hit.lat),
    lng: Number.parseFloat(hit.lon),
    label: hit.display_name,
  }
}

// Reverse geocode a lat/lng pair (used by the browser "use my location" button)
// into a short human-readable label.
export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<string> {
  const url =
    'https://nominatim.openstreetmap.org/reverse?' +
    new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'jsonv2',
      zoom: '18',
    }).toString()

  try {
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return 'Your location'
    const data = (await res.json()) as { display_name?: string }
    return data.display_name ?? 'Your location'
  } catch {
    return 'Your location'
  }
}
