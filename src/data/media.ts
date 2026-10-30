// תמונות לכל מקום. מקור: אפליקציית השימור (קבצים ציבוריים בריפו SHIMUR-GH ובדלי shimur-site-images).
// לא מתוארכות: חלק מהצילומים "הישנים" מעובדים בגוון ספיה, ולכן הכיתוב הוא "מתיק התיעוד".
export type Photo = { src: string; caption: string; credit: string; page?: string; kind?: 'old' | 'now' | 'archive' | 'night' }

const B = 'https://cbhexpybdggwzyakgagd.supabase.co/storage/v1/object/public/shimur-site-images/'
const SH = 'תיק התיעוד, רשימת שימור ותיק תיעוד אשדוד'
const local = (f: string, caption: string, kind?: Photo['kind']): Photo => ({ src: '/media/' + f, caption, credit: SH, kind })
const bucket = (f: string, caption: string): Photo => ({ src: B + f, caption, credit: SH, kind: 'now' })

export const PHOTOS: Record<string, Photo[]> = {
  h1: [local('s01-night.jpg', 'המגדלור בלילה', 'night'), local('s01-old.jpg', 'גבעת יונה, המגדלור ובריכת המים', 'archive')],
  h2: [local('s02-now.jpg', 'גשר עד הלום', 'now'), local('s02-old.jpg', 'גשר עד הלום, מתיק התיעוד', 'old'), local('s02-vickers-old.jpg', 'עמדת ויקרס', 'old'), local('s02-bridge.jpg', 'הגשר, מצגת הוועדה')],
  h3: [local('s03-now.jpg', 'האובליסק המצרי', 'now'), local('s03-old.jpg', 'האובליסק, מתיק התיעוד', 'old')],
  h4: [local('s04-bank-old.jpg', 'הקליפורניות', 'old'), local('s04-old.jpg', 'השיכונים הראשונים על החול', 'archive')],
  h5: [local('s05-old.jpg', 'בית קנדה, מרכז הקליטה', 'old')],
  h6: [bucket('site-6/1791882885241.jpg', 'בית הכנסת הקראי ענן הנשיא'), bucket('site-6/1791882819434.jpg', 'בית הכנסת הקראי')],
  h7: [local('s07-c.jpg', 'מרכז רובע א\''), local('s07-a.jpg', 'מרכז רובע א\''), local('s07-b.jpg', 'מרכז רובע א\''), local('s07-d.jpg', 'מרכז רובע א\'')],
  h10: [bucket('site-10/1791952437031.jpg', 'בית המלון הראשון')],
  h11: [bucket('site-11/1791891136237.jpg', 'פארק נחל לכיש')],
  h12: [bucket('site-12/1791891188638.jpg', 'שדרת השקמים')],
  h13: [bucket('site-13/1791891259159.jpg', 'תל מור')],
  h14: [local('s14-arches.jpg', 'קשתות מצודת אשדוד ים'), bucket('site-14/1791950711759.jpg', 'מצודת אשדוד ים'), local('s14-aerial.jpg', 'המצודה ממבט על'), local('s14-old.jpg', 'המצודה, מתיק התיעוד', 'old'), bucket('site-14/1791950940870.jpg', 'המצודה'), local('s14-ruins.jpg', 'שרידי המצודה')],
  h15: [bucket('site-15/1791891340059.jpg', 'אנדרטת חללי אגוז'), local('archive-egoz.jpg', 'חללי אגוז, מתיק התיעוד', 'archive')],
  h16: [bucket('site-16/1791891563639.jpg', 'אנדרטת לזכר הבנים'), local('archive-yad-labanim.jpg', 'יד לבנים, מתיק התיעוד', 'archive')],
  h17: [local('s17-gan-elisheva.jpg', 'גן אלישבע ואנדרטת חיל הים')],
  h18: [bucket('site-18/1791891620611.jpg', 'אנדרטת הנופלים לשחרור אשדוד')],
  h19: [bucket('site-19/1791878563383.jpg', 'אנדרטת סטרומה ומפקורה'), local('archive-struma.jpg', 'סטרומה, מתיק התיעוד', 'archive')],
  h20: [bucket('site-20/1791878852973.jpg', 'אנדרטה בסיטי')],
  h21: [bucket('site-21/1791946165483.jpg', 'שיכון ארבע־משפחתי'), local('archive-shikunim.jpg', 'השיכונים, מתיק התיעוד', 'archive')],
  h22: [bucket('site-22/1791946943407.jpg', 'בריכת המים ומבנה העירייה הראשון')],
  h23: [bucket('site-23/1791947029846.jpg', 'שוק רובע ב\'')],
  h24: [bucket('site-24/1791947076674.jpg', 'עץ השקמה ברובע ו\'')],
  h25: [local('s25-eshkol.jpg', 'תחנת הכוח אשכול', 'archive')],
  h26: [bucket('site-26/1791947226659.jpg', 'המרינה ופארק אשדוד־ים'), bucket('site-26/1791947154683.jpg', 'המרינה')],
  h27: [bucket('site-27/1791947418205.jpg', 'בית העלמין')],
  h29: [bucket('site-29/1791949954814.jpg', 'מוזיאון אשדוד'), bucket('site-29/1791949898832.jpg', 'מוזיאון אשדוד')],
  h30: [bucket('site-30/1791950327701.jpg', 'אחוזות הקברים'), bucket('site-30/1791950250276.jpg', 'אחוזות הקברים')],
}

// תמונות חופשיות מוויקימדיה (נוספות מ-images.json כשנמצאו)
import extra from './images.json'
type Extra = { key: string; group: string; subject: string; url: string; page: string; author: string; license: string; place?: string; kind?: Photo['kind']; year?: string }
export const EXTRA = (extra as Extra[]).map((e) => ({ ...e, photo: { src: e.url, caption: e.subject, credit: `${e.author}, ${e.license}, ויקישיתוף`, page: e.page, kind: e.kind || 'now' } as Photo }))
EXTRA.forEach((e) => {
  // תמונה ברזולוציה גבוהה עולה ראשונה, כדי שהשער והסרטון יהיו חדים
  if (e.group === 'place' && e.place) (PHOTOS[e.place] ||= [])[e.photo.kind === 'archive' ? 'push' : 'unshift'](e.photo)
})

export const photosOf = (id: string) => PHOTOS[id] || []
export const coverOf = (id: string): Photo | undefined => PHOTOS[id]?.find((p) => p.kind !== 'old') || PHOTOS[id]?.[0]
export const thenNow = (id: string) => {
  const ps = PHOTOS[id] || []
  const then = ps.find((p) => p.kind === 'old' || p.kind === 'archive')
  const now = ps.find((p) => p !== then && p.kind !== 'old' && p.kind !== 'archive')
  return then && now ? { then, now } : null
}
export const byGroup = (g: string) => EXTRA.filter((e) => e.group === g)
