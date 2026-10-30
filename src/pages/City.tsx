import Rich, { Lines } from '../components/Rich'
import { QUARTERS, COMMUNITIES, MILESTONES, ARCHIVE } from '../data/city'
import { PLACES } from '../data/places'
import { href } from '../lib/route'

export default function City() {
  const minY = 1948, maxY = 2026
  const urA = PLACES.filter((p) => p.layer === 'renewal' && p.area.startsWith("רובע א'")).length
  return (
    <div className="page">
      <h1 className="page-title">העיר וסיפוריה</h1>
      <div className="page-sub"><Lines text="רובעים, קהילות, ציר זמן וארכיון. ==הסיפור הוא חומר הגלם של טבעת הלב.==" /></div>

      {/* כתבה מוזיאלית */}
      <article className="feature card" style={{ padding: '28px 28px 24px' }}>
        <span className="label">כתבה · טבעת הלב · רובע א'</span>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px, 4.6vw, 52px)', lineHeight: 1.1, margin: '6px 0 14px' }}>מצריף על החול לשכונת האם</h2>
        <p className="dropcap" style={{ fontSize: 17 }}>ב-25 בנובמבר 1956 הגיעו לחולות שמצפון לנחל לכיש <strong>22 משפחות ממרוקו</strong>. הן גרו בצריפים זמניים, ואחריהן הגיעו משפחות ממצרים ומרומניה.</p>
        <p style={{ fontSize: 17 }}>ב-1958 נבנתה השכונה הקבועה הראשונה, <strong>שיכון עובדי חברת החשמל</strong>, ליד תחנת הכוח אשכול. מכאן צמח רובע א'.</p>
        <p style={{ fontSize: 17 }}>בית קנדה, מרכז הקליטה הברוטליסטי של משה לופנפלד וגיורא גמרמן, קלט אלפי עולים. היום הוא מוכרז לשימור.</p>
        <div className="quote">
          לא להתחיל ב"איזו יצירת אמנות נשים כאן?" אלא ב"מה חסר כאן, מה הסיפור של המקום".
          <cite>"אשדוד יוצרת מקום: אמנות", אדריכלות העיר אשדוד</cite>
        </div>
        <div className="tone tone-insight"><Rich as="p">{`התובנה: ==רובע א' הוא גם שכונת האם וגם מוקד ההתחדשות.== ${urA} מתחמי פינוי־בינוי ברובע במאגר. כל תחנת סיפור שתוצב היום תתעד את מה שעוד יעמוד מחר.`}</Rich></div>
        <div className="grid-2" style={{ marginTop: 18, alignItems: 'stretch' }}>
          <div className="haiku">
            צריף, חול, ורוח<br />עשרים ושתיים משפחות<br />הים כבר קרא
            <small>הייקו: ההתחלה הייתה נוף, לפני שהייתה עיר.</small>
          </div>
          <div className="card" style={{ boxShadow: 'none' }}>
            <span className="label">פוסט מוכן לשיתוף</span>
            <p style={{ fontSize: 14 }}>22 משפחות. צריפים. חול. כך התחילה אשדוד לפני 70 שנה.</p>
            <p style={{ fontSize: 14 }}>היום ברובע א' עומדים שכונת האם, בית קנדה והמגדלור, ולצידם {urA} מתחמי התחדשות.</p>
            <p style={{ fontSize: 14 }}>טבעת הלב מחברת ביניהם: ספסל, צל, וסיפור בגוף ראשון בכל תחנה.</p>
            <p style={{ fontSize: 14 }}><strong>איזה סיפור מהרובע שלכם צריך להיות על שלט?</strong></p>
          </div>
        </div>
        <p className="src">מקורות: ויקיפדיה, "אשדוד" ו"רובע א' (אשדוד)"; רשימת השימור העירונית; הארכיון העירוני לתולדות אשדוד.</p>
      </article>

      <h2 className="section-title">ציר הזמן: 70 שנה בשורה אחת</h2>
      <div className="card" style={{ overflowX: 'auto' }}>
        <div style={{ position: 'relative', minWidth: 900, height: 190 }}>
          <div style={{ position: 'absolute', top: 92, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--ruach), var(--lev), var(--tnua))' }} />
          {MILESTONES.map((m, i) => {
            const x = ((m.year - minY) / (maxY - minY)) * 96 + 2
            const up = i % 2 === 0
            return (
              <div key={m.year} style={{ position: 'absolute', right: `${x}%`, top: up ? 0 : 100, width: 120, transform: 'translateX(50%)', textAlign: 'center' }}>
                {!up && <div style={{ width: 2, height: 10, background: 'var(--ink-mute)', margin: '0 auto' }} />}
                <div className="num" style={{ fontSize: 15, color: 'var(--sea)' }}>{m.year}</div>
                <Rich as="div" className="muted">{m.text}</Rich>
                {up && <div style={{ width: 2, height: 10, background: 'var(--ink-mute)', margin: '0 auto' }} />}
              </div>
            )
          })}
        </div>
      </div>
      <p className="src">מקור: ויקיפדיה העברית והאנגלית, "אשדוד". הארכיון העירוני מחזיק את המסמכים המקוריים לכל עשור.</p>

      <h2 className="section-title">הקהילות שבנו את העיר</h2>
      <p className="section-sub">מפת קהילות: שכבת התוכן "מגוון עדתי" ממסמך חוויית המבקר.</p>
      <div className="grid-kpi">
        {COMMUNITIES.map((c) => (
          <div key={c.name} className="card" style={{ borderTop: '4px solid var(--lev)' }}>
            <strong style={{ fontSize: 17 }}>{c.name}</strong>
            <div className="label" style={{ marginTop: 4 }}>{c.when}</div>
            <p className="muted" style={{ margin: 0 }}>{c.note}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">הרובעים</h2>
      <p className="section-sub">{QUARTERS.length} רובעים. מסומן בירוק: רובע עם מתחמי התחדשות במאגר.</p>
      <div className="grid-3">
        {QUARTERS.map((q) => {
          return (
            <div key={q.id} className="card" style={{ borderRight: `4px solid ${q.renewal ? 'var(--bank)' : 'var(--rule)'}` }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{q.name}</h3>
                {q.renewal && <span className="label" style={{ color: 'var(--bank)', margin: 0 }}>בהתחדשות</span>}
              </div>
              <div className="row" style={{ gap: 16, margin: '4px 0 6px' }}>
                <div><span className="label">נבנה</span><span style={{ fontSize: 13 }}>{q.built}</span></div>
                <div><span className="label">תושבים</span><span style={{ fontSize: 13 }}><bdi className="num">{q.people}</bdi></span></div>
              </div>
              <Rich as="p">{q.story}</Rich>
              {q.facts.map((f, i) => <Rich key={i} as="p" className="muted">{f}</Rich>)}
            </div>
          )
        })}
      </div>
      <p className="src">מקור: ויקיפדיה העברית, "רובעי אשדוד". מספרי התושבים לפי הערך, חלקם לשנת 2022.</p>

      <h2 className="section-title">הארכיון</h2>
      <div className="grid-2">
        <div className="card">
          <strong style={{ fontSize: 18 }}>{ARCHIVE.name}</strong>
          <p className="muted">{ARCHIVE.where}</p>
          <p>{ARCHIVE.holds}</p>
          <div className="row">
            <a className="press btn" href={ARCHIVE.url} target="_blank" rel="noreferrer">לאתר הארכיון</a>
            <a className="press btn" href={ARCHIVE.search} target="_blank" rel="noreferrer">חיפוש בפריטים</a>
          </div>
        </div>
        <div className="tone tone-solution">
          <h4>איך הארכיון יוצא לרחוב</h4>
          <p>1. צילום ישן מכל אתר שימור, מול אותה זווית היום, על שלט התחנה.</p>
          <p>2. QR בשלט מוביל לפריט בארכיון ולכרטיס המקום כאן.</p>
          <p>3. קולות ותיקים בגוף ראשון, בהשראת מרכז המבקרים בשכונת התקווה של עצבה.</p>
          <p><a href={href('walk', { id: 'ring-lev' })}>לטבעת הלב</a></p>
        </div>
      </div>
    </div>
  )
}
