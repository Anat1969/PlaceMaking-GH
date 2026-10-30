// שבילי הליכה אמיתיים בין התחנות. נוצר ב-scripts/paths.py מניתוב הולכי רגל של OpenStreetMap.
import raw from './paths.json'
export type Path = { line: [number, number][]; meters: number; legs: number[] }
export const PATHS = raw as unknown as Record<string, Path>
