import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Photo } from '../data/media'

export function Credit({ p }: { p: Photo }) {
  return (
    <div className="credit">
      <strong>{p.caption}</strong> · {p.page ? <a href={p.page} target="_blank" rel="noreferrer">{p.credit}</a> : p.credit}
    </div>
  )
}

// אז והיום: גוררים את הקו ורואים איך המקום השתנה
export function ThenNow({ then, now, height = 360 }: { then: Photo; now: Photo; height?: number }) {
  const [x, setX] = useState(50)
  return (
    <figure className="thennow" style={{ height }}>
      <img src={now.src} alt={now.caption} loading="lazy" />
      <div className="tn-then" style={{ clipPath: `inset(0 0 0 ${100 - x}%)` }}>
        <img src={then.src} alt={then.caption} loading="lazy" />
      </div>
      <div className="tn-line" style={{ right: `${x}%` }} />
      <span className="tn-tag" style={{ right: 10 }}>מתיק התיעוד</span>
      <span className="tn-tag" style={{ left: 10 }}>היום</span>
      <input type="range" min={0} max={100} value={x} onChange={(e) => setX(+e.target.value)} aria-label="הזזת קו אז והיום" />
      <figcaption className="credit" style={{ position: 'absolute', bottom: 0, insetInline: 0 }}>{now.credit}</figcaption>
    </figure>
  )
}

// סרטון התחנה: התמונות נעות לאט (Ken Burns), עם הסיפור כשורות כתוביות
export function StopFilm({ photos, lines, height = 380, auto = true }: { photos: Photo[]; lines: string[]; height?: number; auto?: boolean }) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const n = Math.max(photos.length, lines.length, 1)
  useEffect(() => {
    if (!auto || reduce) return
    const t = setInterval(() => setI((k) => (k + 1) % n), 5200)
    return () => clearInterval(t)
  }, [n, auto, reduce])
  const p = photos.length ? photos[i % photos.length] : null
  const line = lines[i % Math.max(lines.length, 1)]
  return (
    <div className="film" style={{ height }}>
      <AnimatePresence mode="sync">
        {p ? (
          <motion.img key={p.src + i} src={p.src} alt={p.caption} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: reduce ? 1.02 : 1.14, x: reduce ? 0 : i % 2 ? -18 : 18 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 1.2 }, scale: { duration: 6, ease: 'linear' }, x: { duration: 6, ease: 'linear' } }} />
        ) : (
          <motion.div key={'tx' + i} className="film-blank tx-sand" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        )}
      </AnimatePresence>
      <div className="film-shade" />
      {line && (
        <AnimatePresence mode="wait">
          <motion.p key={line + i} className="film-line" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>{line}</motion.p>
        </AnimatePresence>
      )}
      <div className="film-dots">{Array.from({ length: n }).map((_, k) => <button key={k} aria-label={`פריים ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} />)}</div>
      {p && <div className="film-credit">{p.caption} · {p.credit}</div>}
    </div>
  )
}

export function Strip({ photos }: { photos: Photo[] }) {
  return (
    <div className="strip">
      {photos.map((p, i) => (
        <figure key={i}>
          <img src={p.src} alt={p.caption} loading="lazy" />
          <figcaption>{p.caption}</figcaption>
        </figure>
      ))}
    </div>
  )
}
