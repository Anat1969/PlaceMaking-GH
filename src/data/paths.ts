// תוואים מוצעים ממקורות מתועדים: רשת הרחובות שסופקה וניתוב OSM דרך עוגנים מוגדרים. segments אינם מחוברים מעל gaps; מקור גאומטרי אינו אישור מעבר או נגישות.
import raw from './paths.json'
export type Path = { line: [number, number][]; meters: number; legs: number[]; segments?: [number, number][][]; gaps?: { from: string; to: string; reason: string }[]; source?: string; kind?: string; requiredStations?: string[] }
export const PATHS = raw as unknown as Record<string, Path>
