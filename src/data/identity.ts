import { Place } from './places'

// מסגרות ארגון לפי הנחיית ענת, 30.10.2026. שיוך מוצע אינו ממצא דמוגרפי.
export const SYSTEMS = {
  sea: 'הדרכים לים', community: 'קהילה ומתנ״סים', sport: 'ספורט', public: 'מבני ציבור',
  hotels: 'מלונאות', beaches: 'חופים', heritage: 'מורשת וזיכרון', education: 'חינוך',
  culture: 'תרבות וידע', nature: 'טבע עירוני', commerce: 'מסחר', housing: 'מגורים', employment: 'תעסוקה',
}
export type SystemId = keyof typeof SYSTEMS
export const UNLOCATED = [
  { id: 'old-library', name: 'הספרייה הישנה', task: 'לזהות את המבנה, כתובתו והשימוש הנוכחי; אין להחליפו בספרייה החדשה.' },
  { id: 'a1', name: 'הספרייה החדשה ליד כיכר המפרשיות', task: 'לאמת שם, מיקום, מצב מימוש וייחוס לפוסטר. הנקודה הקודמת הוסתרה עד לבירור.' },
  { id: 'a3', name: 'אולם הקונצרטים האנדלוסיים', task: 'לאמת זהות, מיקום, מצב מימוש וייחוס לרכטר. הנקודה הקודמת הוסתרה עד לבירור.' },
  { id: 'sports', name: 'מערכת מתקני הספורט', task: 'לאתר בנפרד אצטדיון, ארנה, בריכה אולימפית ומתחם טניס בריוויירה; לתעד מצב מימוש.' },
]
export const needsLocation = (p: Place) => UNLOCATED.some((x) => x.id === p.id)
export function proposedSystems(p: Place): SystemId[] {
  const out = new Set<SystemId>()
  if (p.layer === 'heritage') out.add('heritage')
  if (p.layer === 'renewal') out.add('housing')
  if (p.ring === 'ruach') out.add('culture')
  const t = p.name + ' ' + p.area
  if (/חוף|מרינה/.test(t)) out.add('beaches')
  if (/ים|דיונ|נחל|שקמ|שקמה|פארק|חולות/.test(t)) out.add('nature')
  if (/מלון/.test(t)) out.add('hotels')
  if (/מסחר|שוק|קניון/.test(t)) out.add('commerce')
  if (/מתנ|קליטה|קהילת/.test(t)) out.add('community')
  if (/ספורט|כושר|טניס|אצטדיון/.test(t)) out.add('sport')
  if (/עירייה|ספרייה|מוזיאון|משכן/.test(t)) out.add('public')
  if (p.id === 'p1') out.add('sea')
  return [...out]
}
