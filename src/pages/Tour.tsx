import { useCallback, useEffect, useMemo, useState } from 'react'
import CityMap from '../components/CityMap'
import RingGlyph from '../components/RingGlyph'
import { StopFilm, ThenNow, Credit } from '../components/Media'
import { WALKS, placeById } from '../data/places'
import { RINGS } from '../data/rings'
import { PATHS } from '../data/paths'
import { photosOf, thenNow } from '../data/media'
import { profile } from '../lib/logic'
import { speak, hush, canSpeak, sea, useRecorder, clipsOf, dropClip, Clip, useGeo, meters } from '../lib/senses'
import { href } from '../lib/route'

const ARRIVE = 70 // מטרים: רדיוס זיהוי תחנה

function Recorder({ place }: { place: string }) {
  const [clips, setClips] = useState<Clip[]>([])
  const load = useCallback(() => { clipsOf(place).then(setClips) }, [place])
  useEffect(load, [load])
  const r = useRecorder(place, load)
  return (
    <div className="card" style={{ boxShadow: 'none' }}>
      <strong>הקול שלכם</strong>
      <p className="muted" style={{ margin: '2px 0 8px' }}>זיכרון, שיר או סיפור על המקום. נשמר במכשיר שלכם.</p>
      <button className={`press btn ${r.recording ? '' : 'btn-primary'}`} onClick={r.recording ? r.stop : r.start} style={r.recording ? { background: 'var(--cut)', color: '#fff', borderColor: 'var(--cut)' } : undefined}>
        {r.recording ? `עצירה · ${r.secs} שנ'` : 'הקלטה'}
      </button>
      {r.err && <p style={{ color: 'var(--cut)', fontSize: 13 }}>{r.err}</p>}
      {clips.map((c) => (
        <div key={c.id} className="row" style={{ marginTop: 8 }}>
          <audio controls src={URL.createObjectURL(c.blob)} style={{ height: 32, maxWidth: '100%' }} />
          <span className="muted">{new Date(c.at).toLocaleDateString('he-IL')}</span>
          <button className="press chip" onClick={() => dropClip(c.id).then(load)}>מחיקה</button>
        </div>
      ))}
    </div>
  )
}

export default function Tour({ id }: { id: string }) {
  const w = WALKS.find((x) => x.id === id) || WALKS[0]
  const ring = w.ring ? RINGS.find((r) => r.id === w.ring)! : null
  const stops = w.stops.map((s) => ({ ...s, p: placeById(s.place)! })).filter((s) => s.p)
  const [i, setI] = useState(0)
  const [gps, setGps] = useState(false)
  const [tab, setTab] = useState<'see' | 'hear' | 'voice'>('see')
  const [reading, setReading] = useState(false)
  const [waves, setWaves] = useState(false)
  const [arrived, setArrived] = useState<string | null>(null)
  const { pos, err } = useGeo(gps)
  const s = stops[i]
  const path = PATHS[w.id]

  // הטלפון מזהה את התחנה: כשמתקרבים לפחות מ-70 מ', התחנה נפתחת
  const nearest = useMemo(() => {
    if (!pos) return null
    return stops.map((x, k) => ({ k, d: meters(pos, [x.p.lat, x.p.lng]) })).sort((a, b) => a.d - b.d)[0]
  }, [pos])
  useEffect(() => {
    if (nearest && nearest.d < ARRIVE && nearest.k !== i) {
      setI(nearest.k)
      setArrived(stops[nearest.k].p.name)
      navigator.vibrate?.(200)
      setTimeout(() => setArrived(null), 4000)
    }
  }, [nearest?.k, nearest && nearest.d < ARRIVE])
  useEffect(() => () => { hush(); sea(false) }, [])
  useEffect(() => { hush(); setReading(false) }, [i])

  const text = `${s.p.name}. ${s.text} ${s.p.body}`
  const read = () => {
    if (reading) { hush(); setReading(false); return }
    if (speak(text, () => setReading(false))) setReading(true)
  }
  const tn = thenNow(s.p.id)
  const photos = photosOf(s.p.id)
  const dNext = path?.legs?.[i]
  const distMe = nearest && pos ? Math.round(meters(pos, [s.p.lat, s.p.lng])) : null

  return (
    <div className="tour">
      <div className="tour-map">
        <CityMap places={stops.map((x) => x.p)} selected={s.p.id} walks={[w]} numbered fit={!pos} me={pos} showQuarters={false} onSelect={(pid) => setI(stops.findIndex((x) => x.p.id === pid))} />
        <div className="tour-bar">
          <button className="press chip" aria-pressed={gps} onClick={() => setGps(!gps)}>{gps ? (pos ? 'המיקום פעיל' : 'מאתר מיקום') : 'זיהוי לפי מיקום'}</button>
          <button className="press chip" aria-pressed={waves} onClick={() => { sea(!waves); setWaves(!waves) }}>צליל הים</button>
          <a className="press chip" href={href('walk', { id: w.id })}>למסלול</a>
        </div>
      </div>
      {arrived && <div className="arrive" role="status">הגעתם: {arrived}</div>}
      <aside className="tour-side">
        <div style={{ padding: '14px 16px 6px', borderTop: `5px solid ${ring ? ring.color : 'var(--sea)'}` }}>
          <div className="crumbs"><a href={href('walks')}>מסלולים</a> / {w.title}</div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="label" style={{ margin: 0 }}>תחנה {i + 1} מתוך {stops.length}{path ? ` · שביל של ${(path.meters / 1000).toFixed(1)} ק"מ` : ''}</span>
            {distMe !== null && <span className="label" style={{ margin: 0, color: 'var(--sea)' }}>אתם במרחק {distMe} מ'</span>}
          </div>
          <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'center', marginTop: 4 }}>
            <RingGlyph p={profile(s.p)} size={52} stroke={10} />
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, lineHeight: 1.2 }}>{s.p.name}</h1>
          </div>
          {err && <p style={{ color: 'var(--cut)', fontSize: 13 }}>{err}</p>}
        </div>
        <div className="stop-tabs" role="tablist">
          <button aria-pressed={tab === 'see'} onClick={() => setTab('see')}>לראות</button>
          <button aria-pressed={tab === 'hear'} onClick={() => setTab('hear')}>לשמוע ולקרוא</button>
          <button aria-pressed={tab === 'voice'} onClick={() => setTab('voice')}>להקליט</button>
        </div>
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          {tab === 'see' && (
            <>
              <StopFilm photos={photos} lines={[s.text, ...s.p.body.split('. ').slice(0, 3).map((x) => x.replace(/\.$/, '') + '.')]} height={260} />
              {tn && <ThenNow then={tn.then} now={tn.now} height={220} />}
              {!photos.length && <p className="muted">עוד אין צילום לתחנה. צלמו והקליטו, והתחנה תתעשר.</p>}
            </>
          )}
          {tab === 'hear' && (
            <>
              <button className="press btn btn-primary" onClick={read} disabled={!canSpeak()}>{reading ? 'עצירת ההקראה' : 'הקראת הסיפור'}</button>
              {!canSpeak() && <p className="muted">הדפדפן לא תומך בהקראה. אפשר לקרוא כאן.</p>}
              <p style={{ fontSize: 17, fontFamily: 'var(--serif)' }}><strong>{s.text}</strong></p>
              <p style={{ fontSize: 15 }}>{s.p.body}</p>
              {photos[0] && <Credit p={photos[0]} />}
            </>
          )}
          {tab === 'voice' && <Recorder place={s.p.id} />}
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <button className="press btn" disabled={i === 0} onClick={() => setI(i - 1)}>התחנה הקודמת</button>
            <button className="press btn btn-primary" disabled={i === stops.length - 1} onClick={() => setI(i + 1)}>
              התחנה הבאה{dNext ? ` · ${dNext} מ'` : ''}
            </button>
          </div>
          <p className="muted" style={{ margin: 0 }}>במצב מיקום, התחנה נפתחת לבד כשמתקרבים אליה, פחות מ-{ARRIVE} מ'.</p>
        </div>
      </aside>
    </div>
  )
}
