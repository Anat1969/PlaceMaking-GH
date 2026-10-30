import Rich, { Lines } from '../components/Rich'
import { RINGS, CRITERIA } from '../data/rings'
import { PLACES } from '../data/places'
import { useStore } from '../lib/logic'

// רעיונות מעצבה (atzaba.com), מותאמים ומשודרגים לאשדוד
const ATZABA = [
  { from: 'שביל נעמי שמר, רמת גן: 12 תחנות לפי 12 שירים, פעילות ופסקול בכל תחנה.', here: 'טבעת הלב כשביל־מוזיאון: תחנה לכל קהילת מקימים, עם שיר או ניגון של הקהילה.', ring: 'lev' },
  { from: 'שביל רעננה: 16 ק"מ ב-8 מקטעי תוכן, בימות קהילתיות.', here: 'טבעת התנועה במקטעים: שפך, חוף, מצודה ודיונה. במה קהילתית בכל מקטע.', ring: 'tnua' },
  { from: 'מיפוי העיר ברכיבה ובהליכה, לפני קביעת תחנות.', here: 'מצב "תיעוד שטח" באטלס: כל צוות מסמן ספסל חסר ופנס שבור, והמפה מתעדכנת.', ring: 'tnua' },
  { from: 'מרכז מבקרים התקווה: קולות תושבים בגוף ראשון.', here: 'קיר קולות בבית קנדה: עולים מספרים על הלילה הראשון בעיר.', ring: 'lev' },
  { from: 'גן הגבורה בשדרות: קירות סיפור, תאורה ופסקול, בחמישה חודשים.', here: 'קיר תמונות היסטוריות במרכזי המסחר הוותיקים, בלוח הזמנים של הפיילוט.', ring: 'lev' },
  { from: 'SENSE THE CITY בירושלים: מסע חושי וקולינרי שמחזק עסקים.', here: 'מסלול טעמים בשוק רובע ב\' ובשוק רובע ו\': מרוקו, גאורגיה, הודו ובוכרה.', ring: 'lev' },
  { from: 'משחקיית הידע: משחוק תוכן ותוכנית הפעלה לפי חודשים.', here: 'משחק משימה למשפחות בטבעת הרוח, בין הספרייה, מונארט והמשכן.', ring: 'ruach' },
  { from: 'חוויית מבקר 360: מתחילה ונגמרת בבית.', here: 'כל QR בשלט מוביל לכרטיס המקום באפליקציה הזו, לפני הביקור ואחריו.', ring: 'ruach' },
  { from: 'פסטיבל בקופסה: אירוע מבוזר עם תוכן יומי.', here: 'שבוע ה-70: כל ערב תחנה אחרת בטבעת הלב מתעוררת.', ring: 'ruach' },
  { from: 'המבקר כשגריר.', here: 'מדד הצלחה חדש: כמה תושבים הביאו אורח לטבעת.', ring: 'lev' },
]

const METRICS = [
  ['25–30%', 'עלייה בתנועת הולכי רגל'],
  ['100%', 'עמידה בת"י 1918, נגישות'],
  ['85%', 'שביעות רצון'],
  ['70', 'ציון טבעת מינימלי לכל תחנה'],
]

export default function Method() {
  const store = useStore()
  const surveyedIds = Object.keys(store.survey)
  // אמינות: כמה סקר השטח מסכים עם הערכת הפתיחה
  let diffs = 0, n = 0
  surveyedIds.forEach((id) => {
    const p = PLACES.find((x) => x.id === id)
    if (!p) return
    Object.entries(store.survey[id]).forEach(([c, v]) => { diffs += Math.abs((p.scores[c] ?? 0) - v); n++ })
  })
  const agree = n ? Math.round((1 - diffs / (n * 3)) * 100) : null

  return (
    <div className="page">
      <h1 className="page-title">השיטה</h1>
      <div className="page-sub"><Lines text="שלוש טבעות במרחב, שלושה ממדים במדידה, ו-12 קריטריונים שאפשר לבדוק ברחוב. ==אותה מילה, טבעת, היא גם מסלול וגם מדד.==" /></div>

      <h2 className="section-title">שלוש הטבעות</h2>
      <p className="section-sub">מקור: "אשדוד: עיר של טבעות", תוכנית אב לפלייסמייקינג וחוויית מבקר, אדריכלית העיר אשדוד, ספטמבר 2026.</p>
      <div className="grid-3">
        {RINGS.map((r) => (
          <div key={r.id} className="card" style={{ borderTop: `5px solid ${r.color}` }}>
            <span className="label">{r.order} · {r.time}</span>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 28, color: r.color }}>{r.name}</h3>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{r.drive} · {r.dim}</div>
            <p>{r.definition}</p>
            <span className="label">עוגנים</span>
            <p style={{ fontSize: 14 }}>{r.anchors.join(' · ')}</p>
            <span className="label">עקרונות</span>
            <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 14, lineHeight: 1.7 }}>{r.principles.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        ))}
      </div>

      <h2 className="section-title">על מה המדד נשען</h2>
      <div className="grid-2">
        <div className="card">
          <strong>12 קריטריוני האיכות של יאן גל</strong>
          <p className="muted">Jan Gehl, Cities for People, Island Press, 2010. כלי מקובל לבדיקת מרחב ציבורי בגובה העיניים.</p>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginTop: 6 }}>
            <tbody>
              {RINGS.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--rule-soft)' }}>
                  <td style={{ padding: '6px 0', color: r.color, fontWeight: 600, width: 80 }}>{r.name}</td>
                  <td style={{ padding: '6px 0' }}>{CRITERIA.filter((c) => c.ring === r.id).map((c) => c.name).join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted" style={{ marginTop: 8 }}>החלוקה לטבעות היא הפרשנות של הכלי, והיא תואמת את שלושת הממדים במסמך חוויית המבקר: פיזי, רגשי ותרבותי, שכלי.</p>
        </div>
        <div className="card">
          <strong>תקנים לרכיבים</strong>
          <p><strong>ת"י 1918</strong>: נגישות הסביבה הבנויה. רצף, ריצוף מנחה, ספסלים ושילוט.</p>
          <p><strong>EN 13201</strong>: תאורת רחובות, לצד מדיניות התאורה העירונית.</p>
          <p><strong>תוכנית אב לשילוט</strong>, אשדוד: שפה אחידה לעיר וזהות לכל רובע.</p>
          <p><strong>קל, זול ומהיר</strong> (Lighter, Quicker, Cheaper): גישת Project for Public Spaces להתערבות ניסיונית לפני השקעה.</p>
        </div>
      </div>

      <h2 className="section-title">איך הכלי מודד את האמינות שלו</h2>
      <div className="grid-kpi">
        <div className="card kpi"><div className="v">{surveyedIds.length}/{PLACES.length}</div><div className="t">מקומות עם סקר שטח</div></div>
        <div className="card kpi"><div className="v">{n}</div><div className="t">סימונים בשטח</div></div>
        <div className="card kpi"><div className="v">{agree === null ? 'טרם' : agree + '%'}</div><div className="t">הסכמה בין ההערכה לסקר</div></div>
      </div>
      <div className="grid-3" style={{ marginTop: 12 }}>
        <div className="tone tone-neutral"><h4>מה חושב בקוד</h4><p>הערכת פתיחה לפי חוקים גלויים בכל כרטיס, והמלצה לפי הפער הגדול.</p></div>
        <div className="tone tone-neutral"><h4>מה קובע איש המקצוע</h4><p>הסקר בשטח גובר תמיד על ההערכה. הוא נשמר וחוזר אחרי רענון.</p></div>
        <div className="tone tone-insight"><Rich as="p">{`ההסכמה נמדדת ומוצגת. ==הסכמה נמוכה אומרת שהחוקים צריכים תיקון, לא שהשטח טועה.==`}</Rich></div>
      </div>

      <h2 className="section-title">מעצבה לאשדוד: עשרה רעיונות, משודרגים</h2>
      <p className="section-sub">שלומית עצבה, אסטרטגיה וחוויית מבקר (atzaba.com). שמאל: מה הם עשו. ימין: איך זה נראה כאן.</p>
      <div style={{ display: 'grid', gap: 8 }}>
        {ATZABA.map((a, i) => {
          const r = RINGS.find((x) => x.id === a.ring)!
          return (
            <div key={i} className="card atz" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, borderRight: `4px solid ${r.color}` }}>
              <div><span className="label">באשדוד · {r.name}</span><strong>{a.here}</strong></div>
              <div><span className="label">ההשראה</span><span className="muted">{a.from}</span></div>
            </div>
          )
        })}
      </div>

      <h2 className="section-title">מדדי הצלחה</h2>
      <p className="section-sub">מתוך מסמך "הצעה לתכנון חוויית המבקר", מרץ 2026, ועוד מדד אחד של הכלי.</p>
      <div className="grid-kpi">
        {METRICS.map(([v, t]) => <div key={t} className="card kpi"><div className="v">{v}</div><div className="t">{t}</div></div>)}
      </div>
    </div>
  )
}
