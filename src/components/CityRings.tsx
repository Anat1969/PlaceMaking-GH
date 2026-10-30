import { PATHS } from '../data/paths'
import { needsLocation } from '../data/identity'
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

const stopsOf = (ring: RingId) => WALKS.find((x) => x.ring === ring)!.stops.map((s) => placeById(s.place)).filter((p) => p && !needsLocation(p)).map((p) => [X(p!.lng), Y(p!.lat)] as [number, number])
const linePath = (pts: [number, number][]) => pts.map(([lat,lng], i) => `${i ? 'L' : 'M'}${X(lng).toFixed(1)},${Y(lat).toFixed(1)}`).join(' ')

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
      
      <path d={smooth(coast, false)} fill="none" stroke="#E8D9BC" strokeWidth="3" />

      <text x="26" y="250" fill="#7FB8D9" fontSize="13" fontFamily="IBM Plex Mono" opacity=".8">הים התיכון</text>
      <text x={X(34.668) + 8} y={Y(31.806)} fill="#7FB8D9" fontSize="11" fontFamily="IBM Plex Mono" opacity=".8">נחל לכיש</text>

      {PLACES.map((p) => (
        <circle key={p.id} cx={X(p.lng)} cy={Y(p.lat)} r="2.2" fill="#F5EFE4" opacity={active && p.ring !== active ? 0.15 : 0.55} />
      ))}

      {RINGS.map((r, i) => {
        const path = PATHS[`ring-${r.id}`]
        const segments = path?.segments || (path?.line?.length ? [path.line] : [])
        const stops = stopsOf(r.id)
        const dim = active && active !== r.id
        return (
          <g key={r.id} style={{ cursor: 'pointer' }} onClick={() => onPick?.(r.id)} opacity={dim ? 0.25 : 1}>
            {segments.map((pts, k) => <motion.path key={k}
              d={linePath(pts)}
              fill="none"
              stroke={r.color}
              strokeWidth={active === r.id ? 6 : 4}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, delay: 0.3 + i * 0.5, ease: 'easeInOut' }}
            />)}
            {(path?.planningLinks || []).map((pts,k)=><path key={"planned"+k} d={linePath(pts)} fill="none" stroke={r.color} strokeWidth="2" strokeDasharray="2 7" opacity=".7"/>)}
            {stops.map((pt, k) => (
              <circle key={k} cx={pt[0]} cy={pt[1]} r="4.5" fill="#0E3A53" stroke={r.color} strokeWidth="2.5" />
            ))}
          </g>
        )
      })}
      <text x="250" y="482" textAnchor="middle" fill="#F5EFE4" fontSize="12">תוואים למיפוי · חיבורים חסרים מפורטים באטלס</text>

    </svg>
  )
}
