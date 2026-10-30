import { useState } from 'react'
import Rich, { Lines } from '../components/Rich'
import RingGlyph from '../components/RingGlyph'
import { RINGS, RingId } from '../data/rings'
import { SENSES } from '../data/experience'
import { WALKS, placeById } from '../data/places'
import { PATHS } from '../data/paths'
import { coverOf } from '../data/media'
import { profile } from '../lib/logic'

const PALETTE = [
  { name: 'חול־נייר', hex: '#F5EFE4', means: 'הרקע. הדיונה שעליה נבנתה העיר.' },
  { name: 'ים עמוק', hex: '#0E3A53', means: 'כותרות, לילה, ומסגרת לכל השאר.' },
  { name: 'כתום התנועה', hex: '#D9822B', means: 'טבעת חיצונית: גוף, ים, דיונה ונחל.' },
  { name: 'בוגנוויליה הלב', hex: '#B83C6F', means: 'טבעת אמצעית: זיכרון, קהילה ומקימים.' },
  { name: 'כחול הרוח', hex: '#2B6CA3', means: 'טבעת פנימית: תרבות, למידה ועתיד.' },
  { name: 'מרקר', hex: '#FFE45C', means: 'תובנה אחת בכל קטע. ובלילה: אור.' },
  { name: 'ירוק פתרון', hex: '#1F8A5B', means: 'פתרון, צמחייה, קיר ירוק.' },
  { name: 'אדום בעיה', hex: '#B3261E', means: 'פער שצריך לתקן. רק לזה.' },
]

const SHAPES = [
  { name: 'טבעת', means: 'מקום', svg: <circle cx="40" cy="40" r="26" fill="none" stroke="#B83C6F" strokeWidth="10" /> },
  { name: 'ריבוע', means: 'פעולה', svg: <rect x="16" y="16" width="48" height="48" fill="#0E3A53" /> },
  { name: 'גל', means: 'מסלול וים', svg: <path d="M6 44 Q20 26 34 44 T62 44 T90 44" fill="none" stroke="#2B6CA3" strokeWidth="7" /> },
  { name: 'נקודה', means: 'תחנה', svg: <><circle cx="40" cy="40" r="10" fill="#D9822B" /><circle cx="40" cy="40" r="20" fill="none" stroke="#D9822B" strokeWidth="2" strokeDasharray="3 4" /></> },
]

const COMPOSITIONS = [
  { name: 'אדווה', use: 'דף בית, מצגת, שער של מסלול', svg: <>{[34, 24, 14].map((r, i) => <circle key={r} cx="60" cy="40" r={r} fill="none" stroke={RINGS[i].color} strokeWidth="5" />)}</> },
  { name: 'גריד שיכון', use: 'רשימות, כרטיסים, טבלאות', svg: <>{Array.from({ length: 12 }).map((_, i) => <rect key={i} x={14 + (i % 4) * 24} y={10 + Math.floor(i / 4) * 21} width="18" height="15" fill={i === 5 ? '#FFE45C' : '#C9C4BA'} />)}</> },
  { name: 'קו חוף', use: 'כותרות עמוד, שלטים, מפות', svg: <><rect x="0" y="0" width="120" height="30" fill="#0E3A53" /><rect x="0" y="30" width="120" height="10" fill="#7FB8D9" /><rect x="0" y="40" width="120" height="40" fill="#EADCC2" /></> },
  { name: 'אז והיום', use: 'תחנת סיפור, כתבה, מצגת', svg: <><rect x="0" y="0" width="60" height="80" fill="#BBA27E" /><rect x="60" y="0" width="60" height="80" fill="#7FB8D9" /><rect x="58" y="0" width="4" height="80" fill="#FFE45C" /></> },
]

const RULES = [
  ['צבע אומר איפה', 'צבע של טבעת רק למה ששייך לטבעת.'],
  ['טקסטורה אומרת איך', 'לכל חוש טקסטורה אחת, בשלט ובמסך.'],
  ['קנה מידה אומר מאיזה מרחק', 'טקסט גדול לעיר, פרט קטן לילד.'],
  ['כפתור מרובע, מקום עגול', 'מה שלוחצים עליו מרובע. מה שמבקרים בו עגול.'],
  ['תמונה אמיתית לפני איור', 'צילום מתיק התיעוד קודם. איור רק כשאין צילום.'],
  ['מרקר אחד בכל קטע', 'אם הכול מודגש, שום דבר לא מודגש.'],
]

function Sign({ ring, walk }: { ring: RingId; walk: string }) {
  const r = RINGS.find((x) => x.id === ring)!
  const w = WALKS.find((x) => x.id === walk)!
  const s = w.stops[1]
  const p = placeById(s.place)!
  const img = coverOf(p.id)
  const leg = PATHS[w.id]?.legs?.[1]
  return (
    <div className="sign-mock" style={{ borderTopColor: r.color }}>
      {img && <div className="photo-hero" style={{ height: 150 }}><img src={img.src} alt="" /></div>}
      <div className="tx-sound" style={{ height: 8, background: r.color }} />
      <div style={{ padding: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
          <span className="label" style={{ color: r.color, margin: 0 }}>{r.name} · תחנה 2</span>
          <RingGlyph p={profile(p)} size={34} stroke={11} />
        </div>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: '4px 0' }}>{p.name}</h3>
        <p style={{ fontSize: 14 }}><strong>{s.text}</strong></p>
        <div style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr)', gap: 10, alignItems: 'center', marginTop: 8 }}>
          <div className="tx-concrete" style={{ width: 64, height: 64, display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink)', background: '#fff', boxShadow: 'inset 0 0 0 3px var(--ink)' }}>QR</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>סרקו: הקראה, סרטון והקלטה.<br />התחנה הבאה: <strong>{leg ? `${leg} מ'` : ''}</strong></div>
        </div>
      </div>
      <div style={{ background: 'var(--sea)', color: '#fff', padding: '6px 14px', fontFamily: 'var(--mono)', fontSize: 11, display: 'flex', justifyContent: 'space-between' }}><span>אשדוד · עיר של טבעות</span><span>70</span></div>
    </div>
  )
}

export default function Language() {
  const [ring, setRing] = useState<RingId>('lev')
  return (
    <div className="page">
      <span className="label">שפה עיצובית</span>
      <h1 className="page-title">עיר של טבעות: השפה</h1>
      <div className="page-sub"><Lines text="אותה שפה במסך, בשלט, במפה ובאירוע. ==צבע אומר איפה, טקסטורה אומרת איך, קנה מידה אומר מאיזה מרחק.==" /></div>

      <h2 className="section-title">צבעים</h2>
      <div className="grid-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))' }}>
        {PALETTE.map((c) => (
          <div key={c.hex} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ background: c.hex, height: 72, boxShadow: 'inset 0 -1px 0 rgba(0,0,0,.08)' }} />
            <div style={{ padding: 10 }}>
              <strong style={{ fontSize: 14 }}>{c.name}</strong>
              <span className="label" style={{ direction: 'ltr', textAlign: 'right' }}>{c.hex}</span>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>{c.means}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">צורות</h2>
      <div className="grid-kpi">
        {SHAPES.map((s) => (
          <div key={s.name} className="card" style={{ display: 'grid', gridTemplateColumns: '80px minmax(0,1fr)', alignItems: 'center', gap: 10 }}>
            <svg viewBox="0 0 90 80" width="80" height="72">{s.svg}</svg>
            <div><strong style={{ fontSize: 17 }}>{s.name}</strong><p className="muted" style={{ margin: 0 }}>= {s.means}</p></div>
          </div>
        ))}
      </div>

      <h2 className="section-title">טקסטורות: חוש לכל טקסטורה</h2>
      <div className="grid-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))' }}>
        {SENSES.map((s) => (
          <div key={s.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className={s.texture} style={{ height: 90 }} />
            <div style={{ padding: 10 }}><strong>{s.name}</strong><p className="muted" style={{ margin: 0, fontSize: 12 }}>{s.line}</p></div>
          </div>
        ))}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="tx-water" style={{ height: 90 }} />
          <div style={{ padding: 10 }}><strong>מים</strong><p className="muted" style={{ margin: 0, fontSize: 12 }}>הים והנחל, בכל מפה.</p></div>
        </div>
      </div>

      <h2 className="section-title">קומפוזיציות</h2>
      <div className="grid-kpi">
        {COMPOSITIONS.map((c) => (
          <div key={c.name} className="card">
            <svg viewBox="0 0 120 80" style={{ width: '100%', height: 90, display: 'block', marginBottom: 8 }}>{c.svg}</svg>
            <strong>{c.name}</strong>
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>{c.use}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">טיפוגרפיה</h2>
      <div className="grid-3">
        <div className="card"><span className="label">כותרות · Frank Ruhl Libre</span><div style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 700 }}>עיר של טבעות</div><p className="muted" style={{ margin: 0 }}>קול של מגזין ומוזיאון.</p></div>
        <div className="card"><span className="label">גוף · IBM Plex Sans Hebrew</span><div style={{ fontSize: 18 }}>22 משפחות הגיעו לחולות ב-1956.</div><p className="muted" style={{ margin: 0 }}>קריא בשלט ובטלפון.</p></div>
        <div className="card"><span className="label">תוויות · IBM Plex Mono</span><div style={{ fontFamily: 'var(--mono)', fontSize: 16 }}>תחנה 02 · 380 מ'</div><p className="muted" style={{ margin: 0 }}>מספרים, מרחקים וקודים.</p></div>
      </div>

      <h2 className="section-title">גרפיקה: שלט תחנה</h2>
      <p className="section-sub">נבנה מהנתונים: צילום מתיק התיעוד, טביעת האצבע, הסיפור והמרחק לתחנה הבאה לאורך השביל.</p>
      <div className="row" style={{ marginBottom: 12 }}>
        {RINGS.map((r) => <button key={r.id} className="press chip" aria-pressed={ring === r.id} onClick={() => setRing(r.id)}>{r.name}</button>)}
      </div>
      <div className="row" style={{ alignItems: 'flex-start', gap: 24 }}>
        <Sign ring={ring} walk={`ring-${ring}`} />
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          {RULES.map(([t, d]) => (
            <div key={t} style={{ borderBottom: '1px solid var(--rule)', padding: '10px 0' }}>
              <strong>{t}</strong>
              <p className="muted" style={{ margin: 0 }}>{d}</p>
            </div>
          ))}
          <div className="tone tone-insight" style={{ marginTop: 12 }}><Rich as="p">{`השלט הוא דלת לאפליקציה. ==הוא קצר, כי הסיפור המלא מחכה בטלפון.==`}</Rich></div>
        </div>
      </div>
    </div>
  )
}
