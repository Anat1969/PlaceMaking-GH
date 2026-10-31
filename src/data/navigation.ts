export const SECTIONS=[
 {id:'discover',number:'01',name:'להכיר',description:'מקומות, רובעים וסיפורים',page:'atlas'},
 {id:'understand',number:'02',name:'להבין',description:'מפות, מערכות ומקורות ידע',page:'understand'},
 {id:'experience',number:'03',name:'לחוות',description:'טבעות, מסלולים והתנסות',page:'walks'},
 {id:'create',number:'04',name:'לתכנן',description:'כלים, התערבויות והצגת החלטות',page:'plan'},
] as const
export type SectionId=typeof SECTIONS[number]['id']
export const PAGES:{page:string;title:string;section:SectionId;purpose:string;action:string}[]=[
 {page:'atlas',title:'אטלס המקומות',section:'discover',purpose:'לקרוא את המרחב, לסנן מקומות ולפתוח תיק מקום.',action:'בחרו מקום על המפה'},
 {page:'city',title:'העיר והרובעים',section:'discover',purpose:'לחבר בין המבנה העירוני, ההיסטוריה והקהילות.',action:'הכירו את הרובעים'},
 {page:'understand',title:'מפות וידע',section:'understand',purpose:'להשוות שכבות ולהבין את המשמעות שלהן לחיי העיר ולתכנון.',action:'בחרו נושא לחקירה'},
 {page:'sources',title:'מקורות ומעמד המידע',section:'understand',purpose:'לבדוק מה מקור הנתון, מה מעמדו ומה עדיין חסר.',action:'בדקו את מקור המידע'},
 {page:'method',title:'שיטת העבודה',section:'understand',purpose:'להבחין בין מידע, פרשנות והצעה ולחבר אותם להחלטה.',action:'הכירו את השיטה'},
 {page:'walks',title:'טבעות ומסלולים',section:'experience',purpose:'לבחור רצף מרחבי ולהכיר את התחנות והחיבורים שלו.',action:'בחרו מסלול'},
 {page:'route-editor',title:'עורך המסלולים',section:'experience',purpose:'להתוות מסלול חדש בהקשה על המפה, תחנה אחר תחנה, או לדייק את תוואי הטבעות.',action:'הקישו על המפה כדי להוסיף תחנה'},
 {page:'xp',title:'חוויית העיר',section:'experience',purpose:'לחבר סקרנות, רגש ופעילות דרך מקום ותוכן.',action:'בחרו דרך לחוות'},
 {page:'games',title:'משחקים וחקירה',section:'experience',purpose:'לחקור את הסיפור העירוני במשחק עצמאי בתוך האפליקציה.',action:'התחילו משחק'},
 {page:'mapping',title:'מעבדת ההקרנה',section:'create',purpose:'לבחון רעיון של הקרנה על חזית; ההדמיה אינה התקנה בשטח.',action:'פתחו את המעבדה'},
 {page:'walls',title:'קירות במרחב',section:'create',purpose:'לבחון ציורי קיר, קירות ירוקים וקנה מידה עירוני.',action:'בחנו התערבות בקיר'},
 {page:'kit',title:'ארגז כלים',section:'create',purpose:'להתאים רכיב למקום ולצורך; ההמלצות הן נקודת פתיחה לבדיקה.',action:'בחרו כלי תכנוני'},
 {page:'plan',title:'תוכנית העבודה',section:'create',purpose:'לרכז התערבויות, שלבים וסטטוסים בתוכנית אישית.',action:'בנו תוכנית עבודה'},
 {page:'language',title:'שפת המערכת',section:'create',purpose:'לשמור על משמעות עקבית לצבע, צורה ואייקון.',action:'עיינו בכללי השפה'},
 {page:'show',title:'מצגת לראש העיר',section:'create',purpose:'להציג חזון, מהלך מרחבי והצעה ממוקדת להחלטה.',action:'פתחו את המצגת'},
 {page:'workspace',title:'העבודה שלי',section:'create',purpose:'לראות מה נשמר במכשיר ולייצא או לשחזר גיבוי להעברה.',action:'פתחו את העבודה שלי'},
]
const PARENT:Record<string,string>={place:'atlas',walk:'walks',tour:'walks'}
export const pageInfo=(page:string)=>PAGES.find(p=>p.page===(PARENT[page]||page))
export const pageTitle=(page:string)=>page==='home'?'מבט על':pageInfo(page)?.title||'מבט על'
