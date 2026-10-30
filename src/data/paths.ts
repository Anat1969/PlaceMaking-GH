// תוואים מוצעים ממקורות מתועדים: רשת הרחובות שסופקה וניתוב OSM דרך עוגנים מוגדרים. segments אינם מחוברים מעל gaps; מקור גאומטרי אינו אישור מעבר או נגישות.
import raw from './paths.json'
export type Path = { line: [number, number][]; meters: number; legs: number[]; segments?: [number, number][][]; planningLinks?: [number, number][][]; gaps?: { from: string; to: string; reason: string }[]; source?: string; kind?: string; requiredStations?: string[] }
export const PATHS = raw as unknown as Record<string, Path>

// Personal edits are local and never silently replace the public shared source.
try {
 const edits=JSON.parse(localStorage.getItem('pm-route-edits')||'{}')
 for(const [id,value] of Object.entries(edits)){const p=value as Path;if(id.startsWith('ring-')&&Array.isArray(p.line)&&p.line.length>=4&&p.line.length<15000&&p.line.every(c=>Array.isArray(c)&&c.length===2&&c.every(Number.isFinite)&&c[0]>31.6&&c[0]<32&&c[1]>34.4&&c[1]<34.9)&&p.line[0].every((v,i)=>v===p.line[p.line.length-1][i])) PATHS[id]={...p,segments:[p.line],kind:'user-draft',source:'עריכה אישית · טיוטה תכנונית'} }
} catch { /* Invalid local data never prevents loading the shared atlas. */ }
