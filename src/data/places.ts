// מקור נתונים אחד. כל מפה, רשימה, מסלול ומצגת נגזרים מכאן.
import shimur from './shimur.json'
import renewal from './renewal.json'
import { CRITERIA, RingId } from './rings'

export type Layer = 'heritage' | 'renewal' | 'project' | 'anchor'

export type Place = {
  id: string
  layer: Layer
  ring: RingId
  name: string
  area: string
  lat: number
  lng: number
  locationSource?: { label: string; url: string; precision: string }
  approx?: boolean
  era: number // שנה משוערת להופעה על ציר הזמן
  eraLabel: string
  lead: string // משפט אחד
  body: string
  source: { label: string; url?: string }
  scores: Record<string, number> // 0..3 לכל קריטריון
  why: string[] // איך חושבה ההערכה
  extra?: Record<string, string>
}

export const LAYERS: Record<Layer, { name: string; color: string; desc: string }> = {
  heritage: { name: 'אתרי שימור וזיכרון', color: '#7A5230', desc: '34 אתרים מרשימת השימור והתיעוד' },
  renewal: { name: 'התחדשות עירונית', color: '#4E5B6E', desc: '17 מתחמי פינוי־בינוי, מתוך "מה נבנה סביבי"' },
  project: { name: 'מיזמי פלייסמייקינג', color: '#526862', desc: '7 המיזמים של אגף אדריכלות העיר' },
  anchor: { name: 'עוגני הטבעות', color: '#596774', desc: 'מוסדות התרבות, הים והדיונה, לפי מצגת עיר של טבעות' },
}

const SHIMUR_SRC = { label: 'רשימת שימור ותיק תיעוד, אשדוד', url: 'https://shimur-gh.vercel.app' }
const UR_SRC = { label: 'מה נבנה סביבי, אשדוד', url: 'https://ashdod-ma-nivne.vercel.app' }
const RINGS_SRC = { label: 'אשדוד: עיר של טבעות, מצגת אדריכלית העיר, ספטמבר 2026' }
const PROJ_SRC = { label: 'שבעת מיזמי הפלייסמייקינג, אגף אדריכלות העיר, נובמבר 2025' }

// הערכת פתיחה שקופה: חוקים פשוטים מהמידע הקיים, עד שסקר שטח מחליף אותה.
function assess(p: { layer: Layer; ring: RingId; text: string; name: string }) {
  const s: Record<string, number> = Object.fromEntries(CRITERIA.map((c) => [c.id, 1]))
  const why: string[] = ['בסיס: כל קריטריון מתחיל ב-1 מתוך 3, כי עוד לא נעשה סקר שטח.']
  const t = p.text + ' ' + p.name
  if (p.layer === 'heritage') {
    s.story = 2
    s.learn = 0
    why.push('אתר שימור: יש סיפור (זיכרון 2), אבל בלי שילוט מסביר במקום (מידע 0).')
  }
  if (/סגור|הופסק|נטוש/.test(t)) {
    s.safety = 0; s.sit = 0; s.talk = 0
    why.push('האתר סגור או לא בשימוש: ביטחון, ישיבה ומפגש ב-0.')
  }
  if (p.ring === 'tnua') {
    s.see = 3; s.play = 2; s.climate = 0
    why.push('טבעת התנועה: נוף פתוח (מבטים 3) ופעילות (2), אבל חשוף לשמש (אקלים 0).')
  }
  if (p.ring === 'lev' && p.layer !== 'renewal') {
    s.scale = 2; s.talk = 2
    why.push('רובע ותיק: קנה מידה של שיכון נמוך ומרכז שכונתי (2).')
  }
  if (/מוזיאון|ספרייה|מרכז/.test(t)) {
    s.learn = Math.max(s.learn, 2); s.talk = Math.max(s.talk, 2)
    why.push('מוסד תרבות או מרכז: מידע ומפגש (2).')
  }
  if (/פארק|גן|שדרה|טיילת/.test(t)) {
    s.sit = Math.max(s.sit, 2); s.beauty = 2; s.climate = Math.max(s.climate, 1)
    why.push('פארק, גן או טיילת: ישיבה, צמחייה וצל חלקי (2).')
  }
  if (p.layer === 'renewal') {
    s.story = 0; s.scale = 1; s.traffic = 1
    why.push('מתחם התחדשות: הסיפור הקיים עלול להימחק בהריסה (זיכרון 0), עד שמתעדים אותו.')
  }
  if (p.layer === 'project') {
    why.push('מיזם מתוכנן: ההערכה מתארת את המצב לפני הביצוע.')
  }
  return { s, why }
}

const ringForHeritage = (area: string, name: string): RingId => {
  if (/מוזיאון/.test(name)) return 'ruach'
  if (/חוף|נחל|ים/.test(area)) return 'tnua'
  return 'lev'
}

const eraOf = (periods: string[] = [], name: string): [number, string] => {
  if (periods.some((x) => /ברונזה|ברזל|פרסית|אפיפליאו|כנעני/.test(x)) || /תל מור|אפיפליאו|הסוללה האשורית/.test(name)) return [-1500, 'העת העתיקה']
  if (periods.some((x) => /ביזנטי|אסלאמי|ממלוכי|רומי/.test(x)) || /מצודת|אחוזות הקברים|המצדית/.test(name)) return [700, 'ימי הביניים']
  if (periods.some((x) => /מנדט/.test(x))) return [1930, 'תקופת המנדט']
  if (/שנות ה-60|1960|196/.test(name)) return [1962, 'שנות ה-60']
  return [1962, 'שנות העיר הצעירה']
}

type ShimurB = { id: string; name: string; address: string; neighborhood: string; lat: number; lng: number; type: string; periods: string[]; level: string; use: string; desc: string; info?: string; year?: number }

const heritage: Place[] = (shimur.buildings as ShimurB[]).map((b) => {
  const ring = ringForHeritage(b.neighborhood, b.name)
  const [era, eraLabel] = b.year ? [b.year, String(b.year)] : eraOf(b.periods, b.name)
  const { s, why } = assess({ layer: 'heritage', ring, text: (b.use || '') + ' ' + (b.type || ''), name: b.name })
  return {
    id: 'h' + b.id,
    layer: 'heritage',
    ring,
    name: b.name,
    area: b.neighborhood,
    lat: b.lat,
    lng: b.lng,
    era,
    eraLabel,
    lead: (b.desc || '').split('. ')[0] + '.',
    body: [b.desc, b.info].filter(Boolean).join(' '),
    source: SHIMUR_SRC,
    scores: s,
    why,
    extra: { 'רמת שימור': b.level || '', 'שימוש היום': b.use || '', 'כתובת': b.address || '' },
  }
})

type UR = { id: string; plan: string; name: string; kicker: string; headline: string; deck: string; status: string; mavat?: string; lat: number; lng: number; approx?: boolean }
const statusYear = (st: string) => (/בביצוע/.test(st) ? 2027 : /היתר/.test(st) ? 2028 : /מאושרת/.test(st) ? 2030 : /הפקדה/.test(st) ? 2032 : 2035)

const renewals: Place[] = (renewal as UR[]).map((r) => {
  const { s, why } = assess({ layer: 'renewal', ring: 'lev', text: r.deck, name: r.name })
  return {
    id: r.id,
    layer: 'renewal',
    ring: 'lev',
    name: r.headline,
    area: r.kicker,
    lat: r.lat,
    lng: r.lng,
    approx: r.approx,
    era: statusYear(r.status),
    eraLabel: r.status,
    lead: r.deck.split('. ')[0] + '.',
    body: r.deck,
    source: { label: `${UR_SRC.label}, תוכנית ${r.plan}`, url: r.mavat || UR_SRC.url },
    scores: s,
    why,
    extra: { 'תוכנית': r.plan, 'סטטוס': r.status, 'שם רשמי': r.name },
  }
})

type Proj = Omit<Place, 'scores' | 'why' | 'layer' | 'source' | 'era' | 'eraLabel'>
const PROJECTS: Proj[] = [
  { id: 'p1', ring: 'tnua', name: 'הדרכים המובילות לים', area: "רובע א', רחוב מקס נורדאו", lat: 31.8112, lng: 34.6428, approx: true, lead: 'רחוב שמוביל את העיר אל הים, בפס כחול מדורג.', body: 'ריצוף עם פס כחול מדורג, תאורת LED שקועה, עצי צל, ריהוט מינימליסטי ושילוט חרוט. פיילוט של 1 ק"מ ברוחב 3 מ\'. בעתיד גם ברובע ד\', ברחוב יצחק הנשיא. אומדן 825,000 ₪.', extra: { 'היקף': '1 ק"מ × 3 מ\'', 'אומדן': '825,000 ₪' } },
  { id: 'p2', ring: 'lev', name: 'חצרות המתנ"סים', area: "רובע ב', רחוב המעפילים", lat: 31.8048, lng: 34.6531, approx: true, lead: 'חצר מתנ"ס שהופכת לכיכר שכונתית.', body: 'ריצוף במעגלים קונצנטריים צבעוניים, מתקני משחק אלטרנטיביים, ריהוט מודולרי, תאורה תלויה וקיר אינטראקטיבי. 1,000 מ"ר. אומדן 825,000 ₪.', extra: { 'היקף': '1,000 מ"ר', 'אומדן': '825,000 ₪' } },
  { id: 'p3', ring: 'tnua', name: 'מתקני ספורט', area: "רובע ו', רחוב אלבז נתן", lat: 31.7918, lng: 34.6552, approx: true, lead: 'מגרש שכונתי שמזמין לשבת, לא רק לשחק.', body: 'סימון מסלולים בגרפיטי, מדרגות ישיבה מבטון ועץ, הצללות ותאורה מקצועית. 2,000 מ"ר. אומדן 825,000 ₪.', extra: { 'היקף': '2,000 מ"ר', 'אומדן': '825,000 ₪' } },
  { id: 'p4', ring: 'lev', name: 'מרכזי מסחר ישנים', area: "רובע ב', כיכר אלי כהן", lat: 31.8063, lng: 34.6566, approx: true, lead: 'המרכז המסחרי הוותיק מקבל חזית אחת וזיכרון משותף.', body: 'אחידות חזיתות, תאורת ויטרינות, שילוט אחיד, מיצב בחצר וקיר תמונות היסטוריות. אומדן 825,000 ₪.', extra: { 'אומדן': '825,000 ₪' } },
  { id: 'p5', ring: 'lev', name: 'הגינה הקהילתית', area: "רובע ב', פארק הלוחמים", lat: 31.8028, lng: 34.6596, approx: true, lead: 'גינה שהשכנים מגדלים יחד.', body: 'שילוט דינמי מעץ, מחסן כלים, תאורה סולרית, ברז מים והצללת בד. 1,200 מ"ר. אומדן 450,000 ₪.', extra: { 'היקף': '1,200 מ"ר', 'אומדן': '450,000 ₪' } },
  { id: 'p6', ring: 'tnua', name: 'מבנה המכולות הכחולות־ירוקות', area: 'רצועת החוף', lat: 31.7995, lng: 34.6335, approx: true, lead: 'מכולות ממוחזרות שהופכות לבית קטן על החוף.', body: 'מכולות ממוחזרות, גג ירוק, גרפיטי בנושא הים התיכון ושילוט חינוכי. 500 מ"ר. אומדן 1,040,000 ₪.', extra: { 'היקף': '500 מ"ר', 'אומדן': '1,040,000 ₪' } },
  { id: 'p7', ring: 'tnua', name: 'דיונת הכושר הקרבי', area: 'הדיונה', lat: 31.7745, lng: 34.6395, approx: true, lead: 'חולות שהופכים לחדר כושר פתוח.', body: '18 תחנות אימון מציוד ממוחזר, שילוט עם QR ונקודת מים. 2,500 מ"ר. אומדן 825,000 ₪.', extra: { 'היקף': '2,500 מ"ר', 'אומדן': '825,000 ₪' } },
]

const projects: Place[] = PROJECTS.map((p) => {
  const { s, why } = assess({ layer: 'project', ring: p.ring, text: p.body, name: p.name })
  return { ...p, layer: 'project', source: PROJ_SRC, era: 2027, eraLabel: 'מיזם מתוכנן', scores: s, why }
})

// עוגני טבעת הרוח, מתוך המצגת. המיקום משוער, לפי מרכז העיר (רובע הסיטי).
const ANCHORS: Proj[] = [
  { id: 'a1', ring: 'ruach', name: 'הספרייה העירונית החדשה', area: 'מרכז העיר', lat: 31.7951, lng: 34.6448, approx: true, lead: 'עוגן של למידה בלב טבעת הרוח.', body: 'אחד מששת העוגנים של הטבעת האינטלקטואלית במצגת "עיר של טבעות".' },
  { id: 'a2', ring: 'ruach', name: 'מוזיאון מונארט', area: 'מרכז העיר', lat: 31.7905, lng: 34.641, approx: true, lead: 'אמנות עכשווית במרכז העיר.', body: 'מרכז מונארט לאמנות, עוגן בטבעת הרוח לפי המצגת.' },
  { id: 'a3', ring: 'ruach', name: 'מרכז האנדלוסית', area: 'מרכז העיר', lat: 31.7934, lng: 34.6402, approx: true, lead: 'מוזיקה של קהילות המקימים, על במה של עכשיו.', body: 'מרכז התרבות האנדלוסית, עוגן בטבעת הרוח. מחבר בין תרבות היסטורית ליצירה עכשווית.' },
  { id: 'a4', ring: 'ruach', name: 'עיריית אשדוד', area: 'מרכז העיר', lat: 31.7972, lng: 34.6468, approx: true, lead: 'בית העירייה כעוגן אזרחי.', body: 'העירייה מופיעה במצגת כאחד מעוגני טבעת הרוח.' },
  { id: 'a5', ring: 'ruach', name: 'קניון סימול', area: 'מרכז העיר', lat: 31.7905, lng: 34.6455, approx: true, lead: 'מסחר שהופך לחלק מרצף ההליכה.', body: 'עוגן בטבעת הרוח לפי המצגת. המשימה: לחבר את הקניון לרחוב ולא להסתגר ממנו.' },
  { id: 'a7', ring: 'ruach', name: 'המשכן לאמנויות הבמה', area: 'קריית התרבות', lat: 31.7905, lng: 34.6395, approx: true, lead: 'אולם של 938 מושבים, סמל של העיר החדשה.', body: 'נפתח באפריל 2012 בקריית התרבות. אייקון אדריכלי עכשווי, ושכן של מונארט.' },
  { id: 'a6', ring: 'ruach', name: 'גן העיר', area: 'מרכז העיר', lat: 31.7958, lng: 34.6412, approx: true, lead: 'גן אחד שמחבר את כל עוגני המרכז.', body: 'עוגן ירוק בטבעת הרוח לפי המצגת.' },
]
ANCHORS.push(
  { id: 'a8', ring: 'tnua', name: 'הדיונה הגדולה', area: 'רובע י"ד, פארק החולות', lat: 31.786, lng: 34.652, approx: true, lead: 'דיונה של 30 מ\' בלב העיר.', body: 'שמורת חולות בגובה כ-30 מ\'. התוכנית המעודכנת מ-1996 הגנה עליה. במסמך DNA ארבעת היסודות: הדיונה היא האדמה.' },
  { id: 'a9', ring: 'tnua', name: 'פארק אשדוד ים ואמפי אשדוד', area: 'חזית הים', lat: 31.793, lng: 34.636, approx: true, lead: 'פארק החוף שבו העיר פוגשת את הים.', body: 'נפתח בקיץ 2013, עם אמפי אשדוד ואנדרטת רעידת האדמה באגדיר.' },
)
const anchors: Place[] = ANCHORS.map((p) => {
  const { s, why } = assess({ layer: 'anchor', ring: p.ring, text: p.body, name: p.name })
  return { ...p, layer: 'anchor', source: RINGS_SRC, era: /2012/.test(p.body) ? 2012 : /2013/.test(p.body) ? 2013 : /1996/.test(p.body) ? 1996 : 2000, eraLabel: 'עוגן', scores: s, why }
})

const corridorAnchors: Place[] = [
  { id: 'heart-b', ring: 'lev', name: 'מרכז רובע ב׳ · גישה מקיבוץ גלויות', area: 'רובע ב׳', lat: 31.806114, lng: 34.652167, lead: 'המרכז המסחרי הוותיק כעוגן של קהילה וזיכרון.', body: 'שלד טבעת הלב מחבר את מרכזי א׳, ב׳, ה׳ וד׳. נקודת המיקום היא תחנת מרכז מסחרי ב׳/קיבוץ גלויות, ולא קביעה של כניסה לכל המבנים.', locationSource: { label: 'OpenStreetMap · תחנת מרכז מסחרי ב׳/קיבוץ גלויות', url: 'https://www.openstreetmap.org/node/1803088994', precision: 'נקודת גישה; כניסת המרכז דורשת אימות' } },
  { id: 'heart-e', ring: 'lev', name: 'מרכז רובע ה׳ · מוקד לב אשדוד לשעבר', area: 'רובע ה׳', lat: 31.7971373087, lng: 34.6482658101, lead: 'מוקד מסחרי ותיק המשתלב בזיכרון ובשינוי העירוני.', body: 'מוקד לחיבור הרובע בטבעת הלב. המקור מתאר את אתר קניון לב אשדוד לשעבר; אין להציגו כקניון פעיל. הכניסה והרציפות הנוכחיות דורשות בדיקה.', locationSource: { label: 'עמוד ענן · אתר לב אשדוד', url: 'https://amudanan.co.il/w/P12054', precision: 'מיקום אתר היסטורי, לא כניסה פעילה מאומתת' } },
  { id: 'heart-d', ring: 'lev', name: 'המרכז המסחרי הוותיק ברובע ד׳', area: 'רובע ד׳ · חיים משה שפירא 22', lat: 31.800529104, lng: 34.641530584, lead: 'מרכז רובעי ומבני העירייה הישנים כעוגן בטבעת הלב.', body: 'זהו עוגן במרכז ד׳, המחובר למרכז ה׳ וממשיך למרכז א׳. שילוב מבני מורשת וכניסות ייבדק לאורך הדרך.', locationSource: { label: 'Waze · מרכז מסחרי רובע ד׳', url: 'https://www.waze.com/he/live-map/directions?to=place.w.22675774.227019884.4323', precision: 'נקודת המרכז במקור; כניסות טעונות בדיקה' } },
  { id: 'intellect-yad', ring: 'ruach', name: 'בית יד לבנים', area: 'קריית התרבות', lat: 31.7925953, lng: 34.6372901, lead: 'זיכרון, ידע ומפגש בתוך רצף התרבות.', body: 'בית יד לבנים הוא עוגן נפרד מאנדרטאות הזיכרון. טבעת הרוח מחברת אותו לעירייה, למונארט, להיכל התרבות, לסימול ולמוקדים העתידיים.', locationSource: { label: 'OpenStreetMap · בית יד לבנים', url: 'https://www.openstreetmap.org/way/189733742', precision: 'מיקום המבנה, לא כניסה מאומתת' } },
  { id: 'nature-estuary', ring: 'tnua', name: 'שפך נחל לכיש', area: 'מעטפת הטבע העירוני', lat: 31.8150339947, lng: 34.6422445154, lead: 'מפגש הנחל והים כתחנה להבנת העיר.', body: 'נקודת השפך נלקחה משכבת מיקומי העמדות באפליקציה הייעודית. המשך הטבעת לאורך הנחל והדיונות דורש מיפוי דרך, ולא חיבור קצר דרך פנים הרובעים.' },
  { id: 'nature-north', ring: 'tnua', name: 'רצועת החוף הצפונית', area: 'חוף הפירטים', lat: 31.8134895471, lng: 34.639932295, lead: 'תחנת קישור לאורך רצועת הים.', body: 'נקודת בקרה לתוואי החוף; אינה אישור למסלול הליכה או רכיבה.' },
  { id: 'nature-oranim', ring: 'tnua', name: 'חוף האורנים · רצף החוף', area: 'רצועת הים', lat: 31.8056389781, lng: 34.6357459115, lead: 'לשמור את תוואי הטבעת לאורך החוף.', body: 'נקודת בקרה גאוגרפית מהאפליקציה הייעודית למיקומי עמדות.' },
  { id: 'nature-kshatot', ring: 'tnua', name: 'חוף הקשתות · רצף החוף', area: 'רצועת הים', lat: 31.7996382166, lng: 34.632662566, lead: 'רצף חוף בין המוקדים העירוניים.', body: 'נקודת בקרה גאוגרפית מהאפליקציה הייעודית למיקומי עמדות.' },
  { id: 'nature-marina', ring: 'tnua', name: 'המרינה · חיבור רצפי החוף', area: 'טיילת המרינה', lat: 31.7974485515, lng: 34.6316988715, lead: 'חיבור תוואי החוף בצפון ובדרום.', body: 'נקודת בקרה לתוואי, מתוך אפליקציית ניהול העמדות. נדרש לבדוק את רציפות המעברים במרינה.' },
  { id: 'nature-adhalom', ring: 'tnua', name: 'מרחב עד הלום · חיבור לנחל ולחולות', area: 'מעטפת העיר', lat: 31.7814016168, lng: 34.6659881583, lead: 'עוגן לבדיקת החיבור בין הנחל למרחב החולות.', body: 'נקודה מאפליקציית ניהול העמדות. הדרך המקשרת אל הדיונות טרם הוכחה בנתוני התוואי.' },
].map((p) => ({ ...p, ring: p.ring as RingId, layer: 'anchor', approx: true, source: { label: 'הנחיית ענת, 30.10.2026; מקורות מיקום מפורטים בכרטיס' }, era: 2026, eraLabel: 'עוגן למיפוי תוואי', scores: Object.fromEntries(CRITERIA.map((c) => [c.id, 1])), why: ['העוגן נקבע לפי הנחיית ענת; הערכת איכות דורשת סקר.'] }))
const locationFixes: Record<string, [number, number, string, string]> = {
 a4: [31.7922591, 34.6380761, 'OpenStreetMap · עיריית אשדוד', 'https://www.openstreetmap.org/way/348041566'],
 a2: [31.7917929, 34.6372075, 'OpenStreetMap · מרכז תרבות מונארט', 'https://www.openstreetmap.org/way/101976178'],
 a5: [31.7927083, 34.6389083, 'OpenStreetMap · קניון סימול', 'https://www.openstreetmap.org/way/101976162'],
 a8: [31.773308821166, 34.654397964478, 'עמוד ענן · הדיונה הגדולה', 'https://amudanan.co.il/w/P666419'],
}
anchors.forEach((p) => { const fix = locationFixes[p.id]; if (fix) { p.lat = fix[0]; p.lng = fix[1]; p.locationSource = { label: fix[2], url: fix[3], precision: 'מיקום עוגן; כניסה ורציפות דרך טרם אומתו' } } })
export const PLACES: Place[] = [...heritage, ...renewals, ...projects, ...anchors, ...corridorAnchors]
export const placeById = (id: string) => PLACES.find((p) => p.id === id)

// מסלולים: תשעת המסלולים מאפליקציית השימור, ושלוש הטבעות כמסלולי הליכה.
export type Walk = { id: string; title: string; theme: string; description: string; ring?: RingId; stops: { place: string; text: string }[]; source: string }

type SR = { id: string; title: string; description: string; theme: string; sites: { b: string; t: string }[] }
const shimurWalks: Walk[] = (shimur.routes as SR[]).map((r) => ({
  id: r.id,
  title: r.title,
  theme: r.theme,
  description: r.description,
  stops: r.sites.map((s) => ({ place: 'h' + s.b, text: s.t })),
  source: SHIMUR_SRC.label,
}))

const ringWalks: Walk[] = [
  {
    id: 'ring-lev', ring: 'lev', title: 'טבעת הלב: פיילוט 70 שנה לאשדוד', theme: 'טבעת',
    description: 'לחבר את המרכזים המסחריים הוותיקים של רבעים א׳, ב׳, ה׳ וד׳, מתוך כבוד לוותיקי העיר. העוגנים והחיבורים בבירור.',
    stops: [
      { place: 'h7', text: 'מרכז רובע א׳: תחילת החיבור בין ארבעת המרכזים הוותיקים.' },
      { place: 'heart-b', text: 'מרכז רובע ב׳: הקהילה, המסחר והמורשת.' },
      { place: 'heart-e', text: 'מרכז רובע ה׳: זיכרון ושינוי במוקד לב אשדוד לשעבר.' },
      { place: 'heart-d', text: 'מרכז רובע ד׳ ומבני העירייה הישנים; חיבור חזרה למרכז א׳.' },
    ],
    source: RINGS_SRC.label,
  },
  {
    id: 'ring-tnua', ring: 'tnua', title: 'טבעת התנועה: ים, דיונה ונחל', theme: 'טבעת',
    description: 'סובב העיר בטבע העירוני: ים, שפך, נחל ודיונות. תכנון חיבורים להליכה, ריצה ורכיבה; התוואי טרם אומת.',
    stops: [
      { place: 'nature-estuary', text: 'השפך: החיבור בין הנחל לים.' },
      { place: 'nature-north', text: 'החוף הצפוני: לשמור על רצף לאורך הים.' },
      { place: 'nature-oranim', text: 'רצף החוף דרך האורנים.' },
      { place: 'nature-kshatot', text: 'רצף החוף דרך הקשתות.' },
      { place: 'nature-marina', text: 'המרינה: בדיקת רציפות בין החופים.' },
      { place: 'h14', text: 'מצודת אשדוד ים: עוגן במרחב החוף הדרומי.' },
      { place: 'a8', text: 'הדיונה הגדולה: רצף הטבע והחולות.' },
      { place: 'nature-adhalom', text: 'עד הלום: חיבור עתידי נבדק בין החולות לנחל.' },
      { place: 'h11', text: 'נחל לכיש: לחבר את הגדה לשפך, ללא קיצור דרך בתוך הרובעים.' },
    ],
    source: RINGS_SRC.label,
  },
  {
    id: 'ring-ruach', ring: 'ruach', title: 'טבעת הרוח: תרבות במרכז העיר', theme: 'טבעת',
    description: 'להתעניין, ללמוד וליצור בין העירייה ומוסדות התרבות, הספרייה והמסחר. זהות חלק מהעוגנים ורציפות החיבורים בבירור.',
    stops: [
      { place: 'a4', text: 'בית העירייה: העוגן האזרחי ברצף התרבות.' },
      { place: 'intellect-yad', text: 'בית יד לבנים: זיכרון, ידע ומפגש.' },
      { place: 'a2', text: 'מתחם מונארט והמוזאון: אמנות וידע.' },
      { place: 'a7', text: 'היכל התרבות: יצירה ומופעים.' },
      { place: 'a5', text: 'קניון סימול: המסחר כחלק מהרצף העירוני.' },
      { place: 'a1', text: 'הספרייה החדשה ליד כיכר המפרשיות: יש לאמת את המיקום והכניסה לפני קביעת חיבור.' },
      { place: 'a3', text: 'אולם האנדלוסית המיוחס לרכטר: יש לאמת את המיקום והכניסה לפני קביעת חיבור.' },
    ],
    source: RINGS_SRC.label,
  },
]

export const WALKS: Walk[] = [...ringWalks, ...shimurWalks]
export const walkById = (id: string) => WALKS.find((w) => w.id === id)
