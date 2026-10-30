import { useState } from 'react'
import { Place } from '../data/places'
import { photosOf } from '../data/media'
import { proposedSystems, SYSTEMS } from '../data/identity'
import { Credit } from './Media'

type Notes = { local: string; city: string; strategy: string; circulation: string; composition: string; participation: string }
const EMPTY: Notes = { local: '', city: '', strategy: '', circulation: '', composition: '', participation: '' }
const FIELDS: [keyof Notes, string][] = [['local', 'תפקיד מקומי · הרובע והקהילה'], ['city', 'תפקיד רוחבי · קשרים ותלות בעיר'], ['strategy', 'אסטרטגיה · מטרה וקהל'], ['circulation', 'סירקולציה · רצף, חיבורים וחסמים'], ['composition', 'קומפוזיציה · מוקדים, קצב ומבטים'], ['participation', 'תצפית, שאלה או הצעה שלך']]
export default function PlaceKnowledge({ p }: { p: Place }) {
  const [period, setPeriod] = useState<'past' | 'present' | 'future'>('present')
  const [failed, setFailed] = useState<string[]>([])
  const [notes, setNotes] = useState<Notes>(() => { try { return { ...EMPTY, ...JSON.parse(localStorage.getItem('pm-knowledge-' + p.id) || '{}') } } catch { return EMPTY } })
  const [save, setSave] = useState('')
  const ps = photosOf(p.id).filter((x) => period === 'past' ? x.kind === 'old' || x.kind === 'archive' : period === 'present' ? x.kind !== 'old' && x.kind !== 'archive' && x.kind !== 'future' : x.kind === 'future')
  const photo = ps.find((x) => !failed.includes(x.src))
  return <section className="place-knowledge" aria-label="ידע על המקום">
    <div className="row" style={{ margin: '12px 0' }}>{([['past', 'עבר · תיעוד'], ['present', 'הווה · צילומים'], ['future', 'עתיד · תכנון']] as const).map(([id, name]) => <button key={id} className="press chip" aria-pressed={period === id} onClick={() => setPeriod(id)}>{name}</button>)}</div>
    {photo ? <figure style={{ margin: 0 }}><img className="knowledge-photo" src={photo.src} alt={photo.caption} onError={() => setFailed((xs) => [...xs, photo.src])} /><Credit p={photo} /><p className="muted">{photo.date ? `תאריך: ${photo.date}` : 'תאריך הצילום לא תועד במאגר.'}{period === 'past' ? ' חומר מתיק תיעוד אינו בהכרח צילום היסטורי מתוארך.' : ''}</p></figure> : <div className="knowledge-empty">{period === 'future' ? 'טרם צורפה תוכנית או הדמיה עם מקור ומעמד.' : 'חסר צילום זמין לתקופה שנבחרה.'}</div>}
    <p>{p.body}</p>
    <div className="tone tone-insight"><strong>להכיר, להבין ולהיות מעורבים</strong><p>מה הנתונים של המקום מלמדים? אילו חלופות הם פותחים, ומה כדאי לבדוק עם התושבים?</p><p className="muted">אפשר לתעד תצפית או שאלה בקריאה התכנונית של המקום. נשמר במכשיר בלבד.</p></div>
    {p.locationSource && <p className="src">מיקום: <a href={p.locationSource.url} target="_blank" rel="noreferrer">{p.locationSource.label}</a> · {p.locationSource.precision}</p>}
    <p className="src">מקור הרשומה: {p.source.url ? <a href={p.source.url} target="_blank" rel="noreferrer">{p.source.label}</a> : p.source.label}</p>
    <p className="muted">{p.layer === 'renewal' || p.layer === 'project' ? `תכנון · ${p.eraLabel}. שנת ציר הזמן היא אומדן תצוגה, לא מועד ביצוע מאושר.` : `${p.eraLabel} · שיוך הזמן ברשומה עשוי להיות משוער.`}</p>
    <strong>מערכות זהות · שיוך מוצע</strong>
    <div className="row" style={{ marginTop: 6 }}>{proposedSystems(p).map((id) => <span className="chip" key={id}>{SYSTEMS[id]}</span>)}</div>
    <details style={{ marginTop: 14 }}><summary>קריאה תכנונית של המקום</summary><p className="muted">הערות עבודה ופרשנות שלך, נשמרות במכשיר זה בלבד.</p>{FIELDS.map(([key, title]) => <label className="knowledge-field" key={key}><strong>{title}</strong><textarea className="field" rows={2} value={notes[key]} onChange={(e) => { const next = { ...notes, [key]: e.target.value }; setNotes(next); try { localStorage.setItem('pm-knowledge-' + p.id, JSON.stringify(next)); setSave('נשמר במכשיר') } catch { setSave('השמירה נכשלה. הטקסט נשאר פתוח; העתיקו אותו לפני יציאה.') } }} /></label>)}<p role="status">{save}</p></details>
  </section>
}
