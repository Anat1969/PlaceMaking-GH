import { useEffect, useMemo, useRef, useState } from 'react'

// מעבדת הקיר: כמו בתוכנות המיפוי (MadMapper, Resolume), מצמידים ארבע פינות של התוכן לחזית,
// והתוכן מתעוות בפרספקטיבה כדי לשבת על המבנה. שלושה מצבים: הקרנה בלילה, ציור קיר וקיר ירוק.

export type Facade = { id: string; name: string; src: string; corners: [number, number][] }
export const FACADES: Facade[] = [
  { id: 'kanada', name: 'בית קנדה', src: '/media/s05-old.jpg', corners: [[0.02, 0.02], [0.98, 0.0], [0.98, 0.5], [0.02, 0.5]] },
  { id: 'eshkol', name: 'תחנת הכוח אשכול', src: '/media/s25-eshkol.jpg', corners: [[0.22, 0.3], [0.62, 0.3], [0.62, 0.66], [0.22, 0.66]] },
  { id: 'fortress', name: 'מצודת אשדוד ים', src: '/media/s14-arches.jpg', corners: [[0.03, 0.12], [0.97, 0.2], [0.97, 0.66], [0.03, 0.72]] },
  { id: 'lighthouse', name: 'המגדלור', src: '/media/s01-night.jpg', corners: [[0.63, 0.12], [0.73, 0.12], [0.735, 0.86], [0.625, 0.86]] },
]

export type Mode = 'project' | 'mural' | 'green'
export const SCENES: Record<Mode, { id: string; name: string; idea: string }[]> = {
  project: [
    { id: 'windows', name: 'חלונות נדלקים', idea: 'הבניין מתעורר, דירה אחר דירה, כמו הגעת העולים.' },
    { id: 'waves', name: 'הים עולה', idea: 'גלים עולים על החזית ונסוגים. הים שמתחת לעיר.' },
    { id: 'archive', name: 'ארכיון', idea: 'צילום השיכונים הראשונים חוזר לקיר, ונמוג.' },
    { id: 'rings', name: 'שלוש טבעות', idea: 'אדווה של גוף, לב ורוח מתפשטת מהמרכז.' },
    { id: 'words', name: 'מילים', idea: 'שורות הסיפור נכתבות על הקיר.' },
  ],
  mural: [
    { id: 'sea', name: 'ים תיכון', idea: 'פסים של ים וחול בצבעי העיר.' },
    { id: 'kids', name: 'בגובה ילד', idea: 'צורות משחק בשליש התחתון של הקיר.' },
  ],
  green: [{ id: 'leaves', name: 'צמחייה', idea: 'מטפסים שעולים מהקרקע לאורך כבלים.' }],
}

// הומוגרפיה: ממלבן w×h לארבע נקודות. פותרים 8 משוואות בגאוס.
function homography(w: number, h: number, dst: [number, number][]) {
  const src = [[0, 0], [w, 0], [w, h], [0, h]]
  const A: number[][] = []
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = dst[i]
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u])
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v])
  }
  for (let c = 0; c < 8; c++) {
    let p = c
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]]
    for (let r = 0; r < 8; r++) {
      if (r === c) continue
      const f = A[r][c] / A[c][c]
      for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k]
    }
  }
  const s = A.map((row, i) => row[8] / row[i])
  const [a, b, c, d, e, f, g, hh] = s
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`
}

const CW = 600, CH = 400

function Scene({ id }: { id: string }) {
  if (id === 'windows')
    return <div className="sc-windows">{Array.from({ length: 48 }).map((_, i) => <i key={i} style={{ animationDelay: `${(i * 37) % 48 / 10}s` }} />)}</div>
  if (id === 'waves')
    return (
      <svg viewBox="0 0 600 400" className="sc-waves" preserveAspectRatio="none">
        {[0, 1, 2].map((k) => <path key={k} className={`wv wv${k}`} d="M0 300 Q75 270 150 300 T300 300 T450 300 T600 300 T750 300 T900 300 V400 H0Z" fill={['#7FB8D9', '#2B6CA3', '#0E3A53'][k]} opacity={0.75 - k * 0.15} />)}
      </svg>
    )
  if (id === 'archive') return <div className="sc-archive"><img src="/media/archive-shikunim.jpg" alt="" /><span>אשדוד, השנים הראשונות</span></div>
  if (id === 'rings') return <div className="sc-rings">{['#D9822B', '#B83C6F', '#2B6CA3'].map((c, i) => <i key={i} style={{ borderColor: c, animationDelay: `${i * 1.1}s` }} />)}</div>
  if (id === 'words') return <div className="sc-words"><p>22 משפחות.</p><p>צריפים.</p><p>חול.</p><p>ים.</p><p>עיר.</p></div>
  if (id === 'sea') return <div className="sc-mural-sea">{['#0E3A53', '#2B6CA3', '#7FB8D9', '#E8D9BC', '#D9822B'].map((c, i) => <i key={i} style={{ background: c }} />)}<b /></div>
  if (id === 'kids') return <div className="sc-kids"><i className="k1" /><i className="k2" /><i className="k3" /><i className="k4" /></div>
  if (id === 'leaves') return <div className="sc-leaves">{Array.from({ length: 9 }).map((_, i) => <i key={i} style={{ left: `${6 + i * 11}%`, animationDelay: `${i * 0.25}s` }} />)}</div>
  return null
}

export default function WallLab({ initialMode = 'project' as Mode, facadeIds }: { initialMode?: Mode; facadeIds?: string[] }) {
  const facades = facadeIds ? FACADES.filter((f) => facadeIds.includes(f.id)) : FACADES
  const [fid, setFid] = useState(facades[0].id)
  const [mode, setMode] = useState<Mode>(initialMode)
  const [scene, setScene] = useState(SCENES[initialMode][0].id)
  const [show, setShow] = useState(true)
  const f = facades.find((x) => x.id === fid)!
  const [corners, setCorners] = useState<[number, number][]>(f.corners)
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 600, h: 400 })
  const drag = useRef<number | null>(null)

  useEffect(() => setCorners(f.corners), [fid])
  useEffect(() => { setScene(SCENES[mode][0].id) }, [mode])
  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const px = corners.map(([x, y]) => [x * size.w, y * size.h] as [number, number])
  const transform = useMemo(() => homography(CW, CH, px), [px.join()])
  const move = (e: React.PointerEvent) => {
    if (drag.current === null || !box.current) return
    const r = box.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    setCorners((cs) => cs.map((c, i) => (i === drag.current ? [x, y] : c)) as [number, number][])
  }
  const sc = SCENES[mode].find((s) => s.id === scene)

  return (
    <div className="lab">
      <div className="lab-controls">
        <div><span className="label">מבנה</span><div className="row">{facades.map((x) => <button key={x.id} className="press chip" aria-pressed={x.id === fid} onClick={() => setFid(x.id)}>{x.name}</button>)}</div></div>
        <div><span className="label">טיפול</span><div className="row">
          {(['project', 'mural', 'green'] as Mode[]).map((m) => <button key={m} className="press chip" aria-pressed={m === mode} onClick={() => setMode(m)}>{m === 'project' ? 'הקרנה בלילה' : m === 'mural' ? 'ציור קיר' : 'קיר ירוק'}</button>)}
        </div></div>
        <div><span className="label">תוכן</span><div className="row">{SCENES[mode].map((s) => <button key={s.id} className="press chip" aria-pressed={s.id === scene} onClick={() => setScene(s.id)}>{s.name}</button>)}</div></div>
      </div>
      <div ref={box} className={`lab-stage lab-${mode}`} onPointerMove={move} onPointerUp={() => (drag.current = null)} onPointerLeave={() => (drag.current = null)}>
        <img src={f.src} alt={f.name} className="lab-photo" draggable={false} />
        {show && (
          <div className="lab-content" style={{ width: CW, height: CH, transform }}>
            <Scene id={scene} />
          </div>
        )}
        {px.map(([x, y], i) => (
          <button key={i} className="lab-pin" style={{ left: x, top: y }} aria-label={`פינה ${i + 1}: גררו כדי להצמיד לחזית`}
            onPointerDown={(e) => { drag.current = i; (e.target as HTMLElement).setPointerCapture?.(e.pointerId) }}
            onKeyDown={(e) => {
              const d = 0.01, k = e.key
              const dx = k === 'ArrowLeft' ? -d : k === 'ArrowRight' ? d : 0, dy = k === 'ArrowUp' ? -d : k === 'ArrowDown' ? d : 0
              if (dx || dy) { e.preventDefault(); setCorners((cs) => cs.map((c, j) => (j === i ? [c[0] + dx, c[1] + dy] : c)) as [number, number][]) }
            }} />
        ))}
        <svg className="lab-frame" width={size.w} height={size.h}><polygon points={px.map((p) => p.join(',')).join(' ')} /></svg>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
        <p className="muted" style={{ margin: 0 }}>{sc?.idea} גררו את ארבע הפינות כדי להצמיד את התוכן לחזית.</p>
        <div className="row">
          <button className="press chip" aria-pressed={!show} onClick={() => setShow(!show)}>{show ? 'לפני' : 'אחרי'}</button>
          <button className="press chip" onClick={() => setCorners(f.corners)}>איפוס פינות</button>
        </div>
      </div>
    </div>
  )
}
