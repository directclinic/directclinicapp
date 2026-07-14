// Live turn-by-turn driving directions using the free public OSRM demo server.
// No API key required. Given two lat/lng points it returns the route geometry
// (for drawing on the map), total distance/duration, and human-readable steps.

export interface RouteStep {
  instruction: string
  distanceMeters: number
}

export interface RouteResult {
  // Ordered [lat, lng] pairs tracing the driving path, ready for a Polyline.
  coordinates: [number, number][]
  distanceMeters: number
  durationSeconds: number
  steps: RouteStep[]
}

interface OsrmManeuver {
  type?: string
  modifier?: string
}

interface OsrmStep {
  name?: string
  distance?: number
  maneuver?: OsrmManeuver
}

// Turn an OSRM maneuver + street name into a short, plain instruction.
function describeStep(step: OsrmStep): string {
  const type = step.maneuver?.type ?? ''
  const modifier = step.maneuver?.modifier ?? ''
  const road = step.name?.trim()
  const onRoad = road ? ` onto ${road}` : ''
  const alongRoad = road ? ` on ${road}` : ''

  switch (type) {
    case 'depart':
      return road ? `Head out on ${road}` : 'Start driving'
    case 'arrive':
      return 'Arrive at the clinic'
    case 'turn':
    case 'end of road':
      return `Turn ${modifier || 'ahead'}${onRoad}`
    case 'new name':
    case 'continue':
      return `Continue${alongRoad}`
    case 'merge':
      return `Merge${onRoad}`
    case 'on ramp':
      return `Take the ramp${onRoad}`
    case 'off ramp':
      return `Take the exit${onRoad}`
    case 'fork':
      return `Keep ${modifier || 'ahead'}${onRoad}`
    case 'roundabout':
    case 'rotary':
      return `Enter the roundabout${onRoad}`
    default: {
      const dir = modifier ? ` ${modifier}` : ''
      return `Continue${dir}${alongRoad}`.trim()
    }
  }
}

export async function getRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  signal?: AbortSignal,
): Promise<RouteResult | null> {
  // OSRM expects lng,lat order in the path.
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`
  const url =
    `https://router.project-osrm.org/route/v1/driving/${coords}?` +
    new URLSearchParams({
      overview: 'full',
      geometries: 'geojson',
      steps: 'true',
    }).toString()

  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Routing failed (${res.status})`)

  const data = (await res.json()) as {
    code: string
    routes?: Array<{
      distance: number
      duration: number
      geometry: { coordinates: [number, number][] }
      legs: Array<{ steps: OsrmStep[] }>
    }>
  }

  if (data.code !== 'Ok' || !data.routes?.length) return null
  const route = data.routes[0]

  // GeoJSON is [lng, lat]; Leaflet wants [lat, lng].
  const coordinates: [number, number][] = route.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng],
  )

  const steps: RouteStep[] = route.legs
    .flatMap((leg) => leg.steps)
    .map((s) => ({
      instruction: describeStep(s),
      distanceMeters: s.distance ?? 0,
    }))
    // Drop zero-length "continue" noise so the list stays readable.
    .filter((s, i, arr) => i === 0 || i === arr.length - 1 || s.distanceMeters > 5)

  return {
    coordinates,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    steps,
  }
}

// Format helpers for the directions panel.
export function formatDistance(meters: number): string {
  const miles = meters / 1609.34
  if (miles < 0.1) return `${Math.round(meters * 3.281)} ft`
  return `${miles.toFixed(1)} mi`
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60)
  if (mins < 1) return '<1 min'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}
