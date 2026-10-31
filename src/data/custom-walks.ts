// מסלולים שנבנו ידנית בעורך: תחנה אחר תחנה, והשביל מחושב לאורך הרחובות.
// נשמרים במכשיר בלבד, ונרשמים ל-WALKS, ל-PATHS ולתחנות האישיות כדי שהסיור, דף המסלול והמפות יעבדו כרגיל.
import { WALKS, Walk, CUSTOM_PLACES, Place } from './places'
import { PATHS, Path } from './paths'
import { CRITERIA, RingId } from './rings'

export type Station = { lat: number; lng: number; name: string; text: string; place?: string }
export type CustomWalk = { id: string; title: string; ring?: RingId; loop: boolean; stations: Station[]; line: [number, number][]; meters: number; legs: number[]; routed: boolean; at: string }

const KEY = 'pm-custom-walks-v1'
export const loadCustom = (): CustomWalk[] => {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : [] } catch { return [] }
}
const persist = (all: CustomWalk[]) => localStorage.setItem(KEY, JSON.stringify(all))

const stationId = (w: CustomWalk, i: number) => `${w.id}-s${i + 1}`
const toPlace = (w: CustomWalk, s: Station, i: number): Place => ({
  id: stationId(w, i), layer: 'project', ring: w.ring || 'lev', name: s.name || `תחנה ${i + 1}`, area: 'תחנה אישית', lat: s.lat, lng: s.lng,
  era: 2026, eraLabel: 'הצעה אישית', lead: s.text || 'תחנה שנוספה ידנית במסלול אישי.', body: s.text || 'תחנה שנוספה ידנית במסלול אישי. עוד לא נכתב לה סיפור.',
  source: { label: 'מסלול אישי שנבנה בעורך, נשמר במכשיר' }, scores: Object.fromEntries(CRITERIA.map((c) => [c.id, 1])), why: ['תחנה שנוספה ידנית. אין עדיין הערכה או סקר שטח.'],
})

function register(w: CustomWalk) {
  const walk: Walk = {
    id: w.id, title: w.title || 'מסלול אישי', theme: 'מסלול אישי', ring: w.ring,
    description: `${w.stations.length} תחנות שנבחרו ידנית${w.loop ? ', בלולאה סגורה' : ''}. טיוטה תכנונית במכשיר הזה.`,
    stops: w.stations.map((s, i) => ({ place: s.place || stationId(w, i), text: s.text || s.name })),
    source: w.routed ? 'מסלול אישי · שביל לאורך הרחובות בניתוב הולכי רגל של OpenStreetMap' : 'מסלול אישי · חיבור ישיר בין תחנות, הניתוב לא היה זמין',
  }
  w.stations.forEach((s, i) => { if (!s.place) CUSTOM_PLACES.set(stationId(w, i), toPlace(w, s, i)) })
  const k = WALKS.findIndex((x) => x.id === w.id)
  if (k >= 0) WALKS[k] = walk; else WALKS.push(walk)
  const path: Path = { line: w.line, meters: w.meters, legs: w.legs, segments: [w.line], kind: 'user-route', source: walk.source }
  PATHS[w.id] = path
}

export function saveCustom(w: CustomWalk) {
  const all = loadCustom().filter((x) => x.id !== w.id)
  persist([...all, w])
  register(w)
}
export function removeCustom(id: string) {
  persist(loadCustom().filter((x) => x.id !== id))
  const k = WALKS.findIndex((x) => x.id === id)
  if (k >= 0) WALKS.splice(k, 1)
  delete PATHS[id]
}

// שביל ברחובות דרך כל התחנות. שרת הניתוב פתוח לדפדפן (CORS). כשהוא לא זמין: קו ישר, מסומן כך.
export async function routeThrough(stations: Station[], loop: boolean): Promise<{ line: [number, number][]; meters: number; legs: number[]; routed: boolean }> {
  const pts = loop && stations.length > 2 ? [...stations, stations[0]] : stations
  const straight = () => {
    const legs = pts.slice(1).map((p, i) => Math.round(Math.hypot((p.lat - pts[i].lat) * 111000, (p.lng - pts[i].lng) * 94600)))
    return { line: pts.map((p) => [p.lat, p.lng] as [number, number]), meters: legs.reduce((a, b) => a + b, 0), legs, routed: false }
  }
  if (pts.length < 2) return { line: pts.map((p) => [p.lat, p.lng] as [number, number]), meters: 0, legs: [], routed: false }
  try {
    return await osrm(pts)
  } catch {
    try { return await valhalla(pts) } catch { return straight() }
  }
}

type R = { line: [number, number][]; meters: number; legs: number[]; routed: boolean }
async function osrm(pts: Station[]): Promise<R> {
  const coords = pts.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';')
  const r = await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coords}?overview=full&geometries=geojson&steps=false`)
  if (!r.ok) throw Error(String(r.status))
  const route = (await r.json()).routes?.[0]
  if (!route) throw Error('no route')
  return { line: route.geometry.coordinates.map(([x, y]: number[]) => [y, x] as [number, number]), meters: Math.round(route.distance), legs: route.legs.map((l: { distance: number }) => Math.round(l.distance)), routed: true }
}

// ספק גיבוי: Valhalla של OpenStreetMap, פרופיל הולכי רגל. הצורה מקודדת ב-polyline6.
async function valhalla(pts: Station[]): Promise<R> {
  const json = JSON.stringify({ locations: pts.map((p) => ({ lat: p.lat, lon: p.lng })), costing: 'pedestrian', units: 'kilometers' })
  const r = await fetch('https://valhalla1.openstreetmap.de/route?json=' + encodeURIComponent(json))
  if (!r.ok) throw Error(String(r.status))
  const legs = (await r.json()).trip?.legs as { shape: string; summary: { length: number } }[]
  if (!legs?.length) throw Error('no route')
  const line = legs.flatMap((l, i) => decode6(l.shape).slice(i ? 1 : 0))
  const ms = legs.map((l) => Math.round(l.summary.length * 1000))
  return { line, meters: ms.reduce((a, b) => a + b, 0), legs: ms, routed: true }
}
function decode6(str: string): [number, number][] {
  const out: [number, number][] = []
  let i = 0, lat = 0, lng = 0
  while (i < str.length) {
    for (const k of [0, 1]) {
      let shift = 0, result = 0, b
      do { b = str.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
      const d = result & 1 ? ~(result >> 1) : result >> 1
      if (k === 0) lat += d; else lng += d
    }
    out.push([lat / 1e6, lng / 1e6])
  }
  return out
}

// טעינה בעליית האפליקציה
loadCustom().forEach((w) => { try { register(w) } catch { /* מסלול פגום לא עוצר את האפליקציה */ } })
