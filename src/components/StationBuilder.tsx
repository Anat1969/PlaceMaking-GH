import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { PLACES, Place } from '../data/places'
import { RINGS, RingId } from '../data/rings'
import { needsLocation } from '../data/identity'
import { CustomWalk, Station, loadCustom, saveCustom, removeCustom, routeThrough } from '../data/custom-walks'
import { meters } from '../lib/senses'
import { href } from '../lib/route'

// בניית מסלול מתחנות: הקשה על מקום מהמאגר מוסיפה אותו כתחנה; הקשה בכל נקודה אחרת מוסיפה תחנה אישית.
// השביל בין התחנות מחושב לאורך הרחובות אחרי כל שינוי.
const SNAP = 60 // מטרים: הקשה קרובה למקום קיים נצמדת אליו
const NONE = '#14202B'
const blank = (): CustomWalk => ({ id: 'custom-' + Date.now().toString(36), title: '', loop: false, stations: [], line: [], meters: 0, legs: [], routed: false, at: '' })

export default function StationBuilder() {
  const [w, setW] = useState<CustomWalk>(blank)
  const [saved, setSaved] = useState(loadCustom)
  const [sel, setSel] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const wRef = useRef(w)
  wRef.current = w
  const color = w.ring ? RINGS.find((r) => r.id === w.ring)!.color : NONE

  const setStations = (stations: Station[]) => setW((x) => ({ ...x, stations }))
  const addStation = (s: Station) => {
    const st = wRef.current.stations
    setStations([...st, s])
    setSel(st.length)
  }
  const fromPlace = (p: Place): Station => ({ lat: p.lat, lng: p.lng, name: p.name, text: p.lead, place: p.id })

  useEffect(() => {
    if (!el.current) return
    const m = L.map(el.current, { zoomAnimation: false }).setView([31.8, 34.65], 14)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19, className: 'pm-tiles' }).addTo(m)
    const base = L.layerGroup().addTo(m)
    PLACES.filter((p) => !needsLocation(p)).forEach((p) => {
      L.circleMarker([p.lat, p.lng], { radius: 6, color: '#fff', weight: 2, fillColor: RINGS.find((r) => r.id === p.ring)!.color, fillOpacity: 0.9 })
        .bindTooltip(`${p.name} · הקשה מוסיפה כתחנה`)
        .on('click', (e) => { L.DomEvent.stopPropagation(e); addStation(fromPlace(p)) })
        .addTo(base)
    })
    m.on('click', (e: L.LeafletMouseEvent) => {
      const at: [number, number] = [e.latlng.lat, e.latlng.lng]
      const near = PLACES.filter((p) => !needsLocation(p)).map((p) => ({ p, d: meters(at, [p.lat, p.lng]) })).sort((a, b) => a.d - b.d)[0]
      if (near && near.d < SNAP) addStation(fromPlace(near.p))
      else addStation({ lat: at[0], lng: at[1], name: `תחנה ${wRef.current.stations.length + 1}`, text: '' })
    })
    layer.current = L.layerGroup().addTo(m)
    map.current = m
    setTimeout(() => m.invalidateSize(), 50)
    return () => { m.remove(); map.current = null }
  }, [])

  // שביל ברחובות, מחושב מחדש חצי שנייה אחרי כל שינוי
  const key = JSON.stringify([w.stations.map((s) => [s.lat, s.lng]), w.loop])
  useEffect(() => {
    if (w.stations.length < 2) { setW((x) => ({ ...x, line: [], meters: 0, legs: [], routed: false })); return }
    setBusy(true)
    const t = setTimeout(async () => {
      const r = await routeThrough(wRef.current.stations, wRef.current.loop)
      setW((x) => ({ ...x, ...r }))
      setBusy(false)
      setMsg(r.routed ? '' : 'שרת הניתוב לא זמין כרגע. מוצג חיבור ישיר בין התחנות, ואפשר לשמור ולנסות שוב.')
    }, 500)
    return () => clearTimeout(t)
  }, [key])

  useEffect(() => {
    const g = layer.current
    if (!g) return
    g.clearLayers()
    if (w.line.length > 1) {
      L.polyline(w.line, { color: '#fff', weight: 8, opacity: 0.9 }).addTo(g)
      L.polyline(w.line, { color, weight: 4, dashArray: w.routed ? undefined : '6 8' }).addTo(g)
    }
    w.stations.forEach((s, i) => {
      const mk = L.marker([s.lat, s.lng], {
        draggable: true, zIndexOffset: 1000,
        icon: L.divIcon({ className: 'pm-pin', html: `<span class="stop-num" style="background:${i === sel ? '#FFE45C' : color};color:${i === sel ? '#14202B' : '#fff'}">${i + 1}</span>`, iconSize: [26, 26], iconAnchor: [13, 13] }),
      })
      mk.bindTooltip(`${i + 1}. ${s.name} · גרירה להזזה`)
      mk.on('click', (e) => { L.DomEvent.stopPropagation(e); setSel(i) })
      mk.on('dragend', () => {
        const p = mk.getLatLng()
        setStations(wRef.current.stations.map((x, k) => (k === i ? { ...x, lat: p.lat, lng: p.lng, place: undefined } : x)))
        setSel(i)
      })
      mk.addTo(g)
    })
  }, [w.line, w.stations, sel, color, w.routed])

  const move = (i: number, d: number) => {
    const st = [...w.stations]
    const j = i + d
    if (j < 0 || j >= st.length) return
    ;[st[i], st[j]] = [st[j], st[i]]
    setStations(st)
    setSel(j)
  }
  const edit = (i: number, patch: Partial<Station>) => setStations(w.stations.map((s, k) => (k === i ? { ...s, ...patch } : s)))
  const save = () => {
    if (w.stations.length < 2) { setMsg('צריך לפחות שתי תחנות.'); return }
    try {
      const full = { ...w, title: w.title.trim() || `מסלול אישי ${saved.length + 1}`, at: new Date().toISOString() }
      saveCustom(full)
      setW(full)
      setSaved(loadCustom())
      setMsg('נשמר במכשיר הזה. המסלול מופיע ברשימת המסלולים ונפתח בסיור החי.')
    } catch {
      setMsg('השמירה במכשיר נכשלה. ייצאו גיבוי מ"העבודה שלי".')
    }
  }
  const open = (c: CustomWalk) => { setW(c); setSel(null); setMsg(''); if (c.stations.length) map.current?.fitBounds(L.latLngBounds(c.stations.map((s) => [s.lat, s.lng])).pad(0.2)) }
  const minutes = Math.round(w.meters / 75) // כ-4.5 קמ"ש

  return (
    <div className="builder">
      <div className="builder-map-wrap">
        <div ref={el} className="editor-map" aria-label="מפה לבניית מסלול: הקשה מוסיפה תחנה" />
        <div className="builder-hint">הקשה על נקודה צבעונית: מקום מהמאגר. הקשה בכל מקום אחר: תחנה אישית. גרירה: הזזה.</div>
      </div>
      <aside className="card builder-side">
        <label className="label" htmlFor="b-title">שם המסלול</label>
        <input id="b-title" className="field" value={w.title} onChange={(e) => setW({ ...w, title: e.target.value })} placeholder="למשל: מהשוק אל הים" />
        <span className="label">טבעת</span>
        <div className="row">
          <button className="press chip" aria-pressed={!w.ring} onClick={() => setW({ ...w, ring: undefined })}>בלי טבעת</button>
          {RINGS.map((r) => <button key={r.id} className="press chip" aria-pressed={w.ring === r.id} onClick={() => setW({ ...w, ring: r.id })} style={{ borderBottom: `3px solid ${r.color}` }}>{r.name}</button>)}
        </div>
        <label className="row" style={{ fontSize: 14 }}><input type="checkbox" checked={w.loop} onChange={(e) => setW({ ...w, loop: e.target.checked })} /> לולאה: לחזור לתחנה הראשונה</label>

        <div className="builder-stats">
          <div><span className="label">תחנות</span><strong className="num">{w.stations.length}</strong></div>
          <div><span className="label">אורך השביל</span><strong className="num">{(w.meters / 1000).toFixed(1)}</strong> <small>ק"מ</small></div>
          <div><span className="label">הליכה</span><strong className="num">{minutes}</strong> <small>דק'</small></div>
        </div>
        <p className="muted" role="status" style={{ minHeight: 18, margin: 0 }}>{busy ? 'מחשב שביל ברחובות' : w.stations.length < 2 ? 'הוסיפו תחנות במפה.' : w.routed ? 'השביל עובר ברחובות ובשבילים.' : ''}</p>

        <ol className="builder-list">
          {w.stations.map((s, i) => (
            <li key={i} className={i === sel ? 'is-sel' : ''} onClick={() => setSel(i)}>
              <span className="stop-num" style={{ background: color }}>{i + 1}</span>
              <div style={{ minWidth: 0 }}>
                {s.place ? <strong>{s.name}</strong> : <input className="field" value={s.name} onChange={(e) => edit(i, { name: e.target.value })} aria-label={`שם תחנה ${i + 1}`} />}
                {i === sel && <textarea className="field" rows={2} value={s.text} placeholder="מה מספרים בתחנה הזו?" onChange={(e) => edit(i, { text: e.target.value })} aria-label={`סיפור תחנה ${i + 1}`} />}
                {w.legs[i] !== undefined && i < w.stations.length - 1 && <small className="muted">עד התחנה הבאה: {w.legs[i]} מ'</small>}
              </div>
              <div className="builder-tools">
                <button className="press chip" aria-label="למעלה" disabled={i === 0} onClick={(e) => { e.stopPropagation(); move(i, -1) }}>↑</button>
                <button className="press chip" aria-label="למטה" disabled={i === w.stations.length - 1} onClick={(e) => { e.stopPropagation(); move(i, 1) }}>↓</button>
                <button className="press chip" aria-label="מחיקה" onClick={(e) => { e.stopPropagation(); setStations(w.stations.filter((_, k) => k !== i)); setSel(null) }}>×</button>
              </div>
            </li>
          ))}
        </ol>

        <div className="row">
          <button className="press btn btn-primary" onClick={save} disabled={w.stations.length < 2 || busy}>שמירת המסלול</button>
          <button className="press btn" onClick={() => { setW(blank()); setSel(null); setMsg('') }}>מסלול חדש</button>
        </div>
        {w.at && <div className="row"><a className="press chip" href={href('tour', { id: w.id })}>לסיור חי</a><a className="press chip" href={href('walk', { id: w.id })}>לדף המסלול</a></div>}
        {msg && <p role="status" style={{ margin: 0, fontSize: 13 }}>{msg}</p>}

        {saved.length > 0 && (
          <div>
            <span className="label">המסלולים שלי</span>
            {saved.map((c) => (
              <div key={c.id} className="row" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--rule)', padding: '6px 0' }}>
                <button className="app-text-link" onClick={() => open(c)} style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, font: 'inherit' }}>{c.title} · {c.stations.length} תחנות</button>
                <button className="press chip" onClick={() => { if (!confirm(`למחוק את "${c.title}"?`)) return; removeCustom(c.id); setSaved(loadCustom()); if (w.id === c.id) setW(blank()) }}>מחיקה</button>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  )
}
