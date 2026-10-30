import { RINGS, RingId } from '../data/rings'

// טביעת האצבע של מקום: שלוש טבעות, החיצונית התנועה, האמצעית הלב והפנימית הרוח.
// אורך הקשת = הציון בטבעת. קשת קצרה = פער.
const R: Record<RingId, number> = { tnua: 42, lev: 30, ruach: 18 }

export default function RingGlyph({ p, size = 96, labels = false, stroke = 7 }: { p: Record<RingId, number>; size?: number; labels?: boolean; stroke?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ direction: 'ltr', display: 'block' }} role="img" aria-label={RINGS.map((r) => `${r.name} ${p[r.id]}`).join(', ')}>
      {RINGS.map((r) => {
        const rad = R[r.id]
        const c = 2 * Math.PI * rad
        const v = Math.max(0, Math.min(100, p[r.id]))
        return (
          <g key={r.id}>
            <circle cx="50" cy="50" r={rad} fill="none" stroke={r.color} strokeOpacity=".16" strokeWidth={stroke} />
            <circle cx="50" cy="50" r={rad} fill="none" stroke={r.color} strokeWidth={stroke} strokeDasharray={`${(c * v) / 100} ${c}`} transform="rotate(-90 50 50)" strokeLinecap="butt" />
          </g>
        )
      })}
      {labels && <text x="50" y="54" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="12" fontWeight="600" fill="#14202B">{Math.round((p.tnua + p.lev + p.ruach) / 3)}</text>}
    </svg>
  )
}

export function RingBars({ p }: { p: Record<RingId, number> }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {RINGS.map((r) => (
        <div key={r.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13 }}><strong style={{ color: r.color }}>{r.name}</strong> · {r.drive}</span>
            <bdi className="num" style={{ fontSize: 13 }}>{p[r.id]}</bdi>
          </div>
          <div className="bar"><i style={{ width: `${p[r.id]}%`, background: r.color }} /></div>
        </div>
      ))}
    </div>
  )
}
