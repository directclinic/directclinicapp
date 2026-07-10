// Address geocoding via the public OpenStreetMap Nominatim API. We already use
// OpenStreetMap tiles for the map, so this keeps the whole location experience
// on one free, key-less provider. Results are constrained to the New York City
// bounding box so a patient's address resolves to a local point.

export interface GeoResult {
  lat: number
  lng: number
  label: string
}

// NYC bounding box as Nominatim expects it: left,top,right,bottom
// (min lon / west, max lat / north, max lon / east, min lat / south).
const NYC_VIEWBOX = '-74.30,40.92,-73.68,40.48'

export async function geocodeAddress(query: string): Promise<GeoResult | null> {
  const q = query.trim()
  if (!q) return null

  const params = new URLSearchParams({
    q,
    format: 'json',
    limit: '1',
    countrycodes: 'us',
    viewbox: NYC_VIEWBOX,
    bounded: '1',
  })

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return null

    const data = (await res.json()) as Array<{
      lat: string
      lon: string
      display_name: string
    }>
    if (!data.length) return null

    const hit = data[0]
    const lat = Number(hit.lat)
    const lng = Number(hit.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

    return { lat, lng, label: hit.display_name }
  } catch {
    return null
  }
}
