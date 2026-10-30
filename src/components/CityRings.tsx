import { motion, useReducedMotion } from 'framer-motion'
import { PLACES, WALKS, placeById } from '../data/places'
import { RINGS, RingId } from '../data/rings'

// אשדוד כעיר של טבעות: כל טבעת נמתחת דרך התחנות האמיתיות שלה, על רקע קו החוף.
const W = 500, H = 500
const box = { w: 34.612, e: 34.69, n: 31.842, s: 31.762 }
const X = (lng: number) => ((lng - box.w) / (box.e - box.w)) * W
const Y = (lat: number) => ((box.n - lat) / (box.n - box.s)) * H

// קו חוף משוער, מצפון לדרום
const COAST: [number, number][] = [[31.842, 34.652], [31.83, 34.641], [31.82, 34.636], [31.81, 34.6365], [31.8, 34.6315], [31.79, 34.6275], [31.78, 34.6195], [31.77, 34.6135], [31.762, 34.609]]
const RIVER: [number, number][] = [[31.828, 34.648], [31.822, 34.653], [31.816, 34.657], [31.808, 34.662], [31.797, 34.666], [31.786, 34.668], [31.778, 34.672], [31.766, 34.68]]

function smooth(pts: [number, number][], closed: boolean) {
  if (pts.length < 2) return ''
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]]
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

// מעטפת קמורה של התחנות, מורחבת מעט: כך הטבעות יושבות זו בתוך זו, כמו במצגת
function hull(pts: [number, number][]) {
  const P = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lo: [number, number][] = [], up: [number, number][] = []
  for (const p of P) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p) }
  for (const p of [...P].reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p) }
  return lo.slice(0, -1).concat(up.slice(0, -1))
}
function loop(ring: RingId, pad: number): [number, number][] {
  const w = WALKS.find((x) => x.ring === ring)!
  const pts = w.stops.map((s) => placeById(s.place)!).map((p) => [X(p.lng), Y(p.lat)] as [number, number])
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length
  const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length
  return hull(pts).map(([x, y]) => { const d = Math.hypot(x - cx, y - cy) || 1; return [x + ((x - cx) / d) * pad, y + ((y - cy) / d) * pad] as [number, number] })
}
const stopsOf = (ring: RingId) => WALKS.find((x) => x.ring === ring)!.stops.map((s) => placeById(s.place)!).map((p) => [X(p.lng), Y(p.lat)] as [number, number])

export default function CityRings({ active, onPick }: { active?: RingId | null; onPick?: (r: RingId) => void }) {
  const reduce = useReducedMotion()
  const coast = COAST.map(([la, ln]) => [X(ln), Y(la)] as [number, number])
  const sea = `${smooth(coast, false)} L0,${H} L0,0 Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="hero-ring" style={{ direction: 'ltr' }} role="img" aria-label="מפת אשדוד עם שלוש הטבעות: התנועה לאורך הים והנחל, הלב ברובעים הוותיקים, והרוח במרכז העיר">
      <defs>
        <radialGradient id="land" cx="60%" cy="45%" r="70%">
          <stop offset="0" stopColor="#F5EFE4" stopOpacity=".16" />
          <stop offset="1" stopColor="#F5EFE4" stopOpacity=".04" />
        </radialGradient>
        <pattern id="waves" width="14" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4 Q3.5 1 7 4 T14 4" fill="none" stroke="#7FB8D9" strokeOpacity=".25" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#land)" />
      <path d={sea} fill="#0A2A3D" />
      <path d={sea} fill="url(#waves)" />
      <path d={smooth(coast, false)} fill="none" stroke="#E8D9BC" strokeWidth="3" />
      <path d={smooth(RIVER.map(([la, ln]) => [X(ln), Y(la)]), false)} fill="none" stroke="#7FB8D9" strokeWidth="3" strokeOpacity=".7" />
      <text x="26" y="250" fill="#7FB8D9" fontSize="13" fontFamily="IBM Plex Mono" opacity=".8">הים התיכון</text>
      <text x={X(34.668) + 8} y={Y(31.806)} fill="#7FB8D9" fontSize="11" fontFamily="IBM Plex Mono" opacity=".8">נחל לכיש</text>

      {PLACES.map((p) => (
        <circle key={p.id} cx={X(p.lng)} cy={Y(p.lat)} r="2.2" fill="#F5EFE4" opacity={active && p.ring !== active ? 0.15 : 0.55} />
      ))}

      {RINGS.map((r, i) => {
        const pts = loop(r.id, [26, 18, 14][i])
        const stops = stopsOf(r.id)
        const dim = active && active !== r.id
        return (
          <g key={r.id} style={{ cursor: 'pointer' }} onClick={() => onPick?.(r.id)} opacity={dim ? 0.25 : 1}>
            <motion.path
              d={smooth(pts, true)}
              fill={r.color}
              fillOpacity={active === r.id ? 0.18 : 0.07}
              stroke={r.color}
              strokeWidth={active === r.id ? 6 : 4}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, delay: 0.3 + i * 0.5, ease: 'easeInOut' }}
            />
            {stops.map((pt, k) => (
              <circle key={k} cx={pt[0]} cy={pt[1]} r="4.5" fill="#0E3A53" stroke={r.color} strokeWidth="2.5" />
            ))}
          </g>
        )
      })}
      <text x="250" y="482" textAnchor="middle" fill="#F5EFE4" fontSize="12">תרשים רעיוני · אינו תוואי ניווט</text>
      {!reduce && (
        <motion.circle cx={X(34.6435)} cy={Y(31.7935)} fill="none" stroke="#FFE45C" strokeWidth="1.5"
          initial={{ r: 8, opacity: 0.8 }} animate={{ r: [8, 120], opacity: [0.8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' }} />
      )}
    </svg>
  )
}
