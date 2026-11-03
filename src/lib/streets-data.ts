// טעינה אחת של שכבת הרחובות לכל האפליקציה (שכבת המפה ופרופיל המסלול חולקים אותה).
import { buildIndex, StreetFeature, StreetIndex } from './street-rank'
export type StreetCollection = { type: 'FeatureCollection'; features: (StreetFeature & { properties: { name?: string; quarter?: string; hierarchy?: number } })[] }
let data: Promise<StreetCollection> | null = null
let index: Promise<StreetIndex> | null = null
export function loadStreets(): Promise<StreetCollection> {
  if (!data) data = fetch(import.meta.env.BASE_URL + 'data/streets.geojson').then((r) => { if (!r.ok) throw Error('load'); return r.json() })
  data.catch(() => { data = null; index = null })
  return data
}
export function loadStreetIndex(): Promise<StreetIndex> {
  if (!index) index = loadStreets().then((d) => buildIndex(d.features))
  return index
}
