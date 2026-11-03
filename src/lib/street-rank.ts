// "כמה שקט המסלול": על איזה דרג רחוב עובר כל חלק של מסלול הליכה.
// טהור, בלי DOM ובלי Leaflet. נבדק ב-scripts/check-street-rank.mjs.
// מקור: שכבת הרחובות של העירייה (rehevot.shp, 03.11.2026), השדה מידרג.
// משמעות הקודים לא נמסרה מהעירייה: החלוקה כאן היא הערכה מתוך שמות הרחובות.

export type RankGroup = 'boulevard' | 'main' | 'local' | 'unknown' | 'off'
export type LatLng = [number, number]
export type StreetFeature = { properties?: { name?: string; hierarchy?: number } | null; geometry?: { type: string; coordinates: unknown } | null }

export const RADIUS_M = 15
export const STEP_M = 10

// לפי השמות: 1 שדרות ראשיות (שד בני ברית, שד הרצל), 8 כבישים בין־עירוניים (כביש 4, 41, 42),
// 2 רחובות ראשיים (הפלמ"ח, נורדאו), 3 ומעלה מקומיים, 10 מדרחוב, 9 רצועות חניה (לא נספרות), 0 לא מסווג.
export function rankGroup(h: number | undefined | null): RankGroup | null {
  if (h === 9) return null
  if (h === 1 || h === 8) return 'boulevard'
  if (h === 2) return 'main'
  if (h != null && h >= 3) return 'local'
  return 'unknown'
}

export const GROUPS: { id: RankGroup; label: string; short: string }[] = [
  { id: 'local', label: 'רחוב מקומי', short: 'מקומי' },
  { id: 'main', label: 'רחוב ראשי', short: 'ראשי' },
  { id: 'boulevard', label: 'שדרה ראשית או כביש', short: 'שדרה' },
  { id: 'unknown', label: 'רחוב לא מסווג', short: 'לא מסווג' },
  { id: 'off', label: 'שביל / מחוץ לרחוב', short: 'שביל' },
]

// הטלה מקומית במטרים סביב אשדוד. בטווח של כמה קילומטרים השגיאה זניחה מול רדיוס של 15 מ'.
const LAT0 = 31.8
const MY = 111_320, MX = 111_320 * Math.cos((LAT0 * Math.PI) / 180)
const xy = (lat: number, lng: number): [number, number] => [lng * MX, lat * MY]

type Seg = { ax: number; ay: number; bx: number; by: number; group: RankGroup; name: string }
export type StreetIndex = { cell: number; grid: Map<string, Seg[]>; count: number }

const key = (i: number, j: number) => i + ':' + j

export function buildIndex(features: StreetFeature[], cell = 50): StreetIndex {
  const grid = new Map<string, Seg[]>()
  let count = 0
  for (const f of features) {
    const group = rankGroup(f.properties?.hierarchy)
    if (!group || !f.geometry) continue
    const g = f.geometry
    const lines = (g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []) as [number, number][][]
    const name = f.properties?.name || ''
    for (const line of lines) for (let k = 1; k < line.length; k++) {
      const [ax, ay] = xy(line[k - 1][1], line[k - 1][0]), [bx, by] = xy(line[k][1], line[k][0])
      const s: Seg = { ax, ay, bx, by, group, name }
      count++
      const i0 = Math.floor(Math.min(ax, bx) / cell), i1 = Math.floor(Math.max(ax, bx) / cell)
      const j0 = Math.floor(Math.min(ay, by) / cell), j1 = Math.floor(Math.max(ay, by) / cell)
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
        const c = grid.get(key(i, j)); if (c) c.push(s); else grid.set(key(i, j), [s])
      }
    }
  }
  return { cell, grid, count }
}

function segDist(px: number, py: number, s: Seg) {
  const dx = s.bx - s.ax, dy = s.by - s.ay, l2 = dx * dx + dy * dy
  const t = l2 ? Math.max(0, Math.min(1, ((px - s.ax) * dx + (py - s.ay) * dy) / l2)) : 0
  const qx = s.ax + t * dx - px, qy = s.ay + t * dy - py
  return Math.sqrt(qx * qx + qy * qy)
}

export function nearest(index: StreetIndex, lat: number, lng: number, radius = RADIUS_M): { group: RankGroup; name: string; d: number } {
  const [px, py] = xy(lat, lng), c = index.cell
  const r = Math.ceil(radius / c)
  const i = Math.floor(px / c), j = Math.floor(py / c)
  let best: Seg | null = null, bd = Infinity
  for (let a = i - r; a <= i + r; a++) for (let b = j - r; b <= j + r; b++) {
    for (const s of index.grid.get(key(a, b)) || []) { const d = segDist(px, py, s); if (d < bd) { bd = d; best = s } }
  }
  return best && bd <= radius ? { group: best.group, name: best.name, d: bd } : { group: 'off', name: '', d: bd }
}

export type Run = { group: RankGroup; from: number; to: number; names: string[] }
export type RankProfile = { total: number; runs: Run[]; meters: Record<RankGroup, number>; share: Record<RankGroup, number>; samples: number }

const dist = (a: LatLng, b: LatLng) => { const [ax, ay] = xy(a[0], a[1]), [bx, by] = xy(b[0], b[1]); return Math.hypot(bx - ax, by - ay) }

// דוגמים את המסלול כל STEP_M מטרים, ולכל דגימה מוצאים את מקטע הרחוב הקרוב בתוך RADIUS_M.
export function profileRoute(line: LatLng[], index: StreetIndex, step = STEP_M, radius = RADIUS_M): RankProfile {
  const meters = { boulevard: 0, main: 0, local: 0, unknown: 0, off: 0 } as Record<RankGroup, number>
  const runs: Run[] = []
  let total = 0, samples = 0
  for (let k = 1; k < line.length; k++) {
    const a = line[k - 1], b = line[k], len = dist(a, b)
    if (!len) continue
    const n = Math.max(1, Math.round(len / step))
    for (let s = 0; s < n; s++) {
      const t = (s + 0.5) / n, piece = len / n
      const hit = nearest(index, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, radius)
      samples++
      meters[hit.group] += piece
      const last = runs[runs.length - 1]
      if (last && last.group === hit.group) { last.to = total + piece; if (hit.name && !last.names.includes(hit.name)) last.names.push(hit.name) }
      else runs.push({ group: hit.group, from: total, to: total + piece, names: hit.name ? [hit.name] : [] })
      total += piece
    }
  }
  const share = Object.fromEntries(Object.entries(meters).map(([g, m]) => [g, total ? m / total : 0])) as Record<RankGroup, number>
  return { total, runs, meters, share, samples }
}

const pct = (x: number) => Math.round(x * 100)

// שורת תובנה עד 8 מילים, ומשפט הסבר עד 20 מילים. ** סביב המספרים.
export function rankInsight(p: RankProfile): { insight: string; detail: string } {
  if (!p.total) return { insight: 'אין מסלול למדידה', detail: 'צריך לפחות שתי נקודות כדי לבדוק על אילו רחובות עובר המסלול.' }
  const local = pct(p.share.local), loud = pct(p.share.boulevard), main = pct(p.share.main), off = pct(p.share.off)
  // התובנה נאמרת על הקבוצה הגדולה במסלול.
  const top = (['local', 'main', 'boulevard', 'off'] as RankGroup[]).sort((a, b) => p.share[b] - p.share[a])[0]
  const insight = {
    local: `**${local}%** מהמסלול ברחובות מקומיים שקטים`,
    main: `**${main}%** מהמסלול לאורך רחובות ראשיים`,
    boulevard: `**${loud}%** מהמסלול לאורך שדרות וכבישים ראשיים`,
    off: `**${off}%** מהמסלול בשבילים, מחוץ לרחובות`,
  }[top as 'local' | 'main' | 'boulevard' | 'off']
  const detail = `**${local}%** מקומיים, **${main}%** ראשיים, **${loud}%** שדרות, **${off}%** שבילים, לאורך **${(p.total / 1000).toFixed(1)}** ק"מ.`
  return { insight, detail }
}
