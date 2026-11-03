// מוסיף לשכבת הרחובות הקיימת את השדות מידרג, סוג ושנת ביצוע מהשכבה העירונית (rehevot.shp, 03.11.2026).
// התאמה לפי source_record (מספר הרשומה בקובץ המקור), ובדיקה ששם הרחוב זהה בכל רשומה.
// שימוש: node scripts/merge-street-fields.mjs <ashdod-streets.geojson>
import fs from 'node:fs'
import crypto from 'node:crypto'
const src = process.argv[2]
if (!src) { console.error('usage: node scripts/merge-street-fields.mjs <ashdod-streets.geojson>'); process.exit(1) }
const target = new URL('../public/data/streets.geojson', import.meta.url)
const a = JSON.parse(fs.readFileSync(src, 'utf8')), b = JSON.parse(fs.readFileSync(target, 'utf8'))
if (a.features.length !== b.features.length) throw Error(`feature count ${a.features.length} != ${b.features.length}`)
b.features = b.features.map((f) => {
  const s = a.features[f.properties.source_record]
  if (!s || (s.properties.name || '').trim() !== (f.properties.name || '').trim()) throw Error(`name mismatch at ${f.id}`)
  const { name, quarter, code, source, source_record } = f.properties
  return { ...f, properties: { name, quarter, code, hierarchy: s.properties.hierarchy, type: s.properties.type, year: s.properties.year, source, source_record } }
})
const out = JSON.stringify(b)
fs.writeFileSync(target, out)
console.log('merged', b.features.length, 'sha256', crypto.createHash('sha256').update(out).digest('hex'), 'source sha256', crypto.createHash('sha256').update(fs.readFileSync(src)).digest('hex'))
