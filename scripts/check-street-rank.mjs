// בדיקה ל-src/lib/street-rank.ts: מקרים סינתטיים, ואחריהם הפרופיל של המסלולים הקיימים מול שכבת הרחובות.
// הרצה: node --experimental-strip-types scripts/check-street-rank.mjs
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { buildIndex, profileRoute, rankGroup, rankInsight, nearest } from '../src/lib/street-rank.ts'

assert.equal(rankGroup(1), 'boulevard'); assert.equal(rankGroup(8), 'boulevard'); assert.equal(rankGroup(2), 'main')
assert.equal(rankGroup(3), 'local'); assert.equal(rankGroup(10), 'local'); assert.equal(rankGroup(9), null); assert.equal(rankGroup(0), 'unknown')

// רחוב מקומי מזרח־מערב באורך כ-200 מ', ושדרה מקבילה 100 מ' צפונה. חניה (9) צמודה לרחוב המקומי לא נספרת.
const L = (h, lat, name) => ({ properties: { hierarchy: h, name }, geometry: { type: 'LineString', coordinates: [[34.650, lat], [34.6521, lat]] } })
const idx = buildIndex([L(3, 31.8, 'מקומי'), L(1, 31.8009, 'שדרה'), L(9, 31.80001, 'חניה')])
assert.equal(nearest(idx, 31.80005, 34.651).group, 'local')           // כ-5.5 מ' מהרחוב
assert.equal(nearest(idx, 31.8004, 34.651).group, 'off')             // כ-45 מ' משניהם
assert.equal(nearest(idx, 31.8009, 34.651).name, 'שדרה')
const p = profileRoute([[31.80005, 34.650], [31.80005, 34.652], [31.8009, 34.652], [31.8009, 34.650]], idx)
assert.ok(Math.abs(p.total - (189 + 100 + 189)) < 6, 'total ' + p.total)
assert.ok(p.share.local > 0.35 && p.share.local < 0.45, 'local ' + p.share.local)
assert.ok(p.share.boulevard > 0.35 && p.share.boulevard < 0.45, 'boulevard ' + p.share.boulevard)
assert.ok(p.share.off > 0.12 && p.share.off < 0.25, 'off ' + p.share.off)
assert.deepEqual(p.runs.map((r) => r.group), ['local', 'off', 'boulevard'])
assert.ok(Math.abs(p.runs.at(-1).to - p.total) < 1e-6)
assert.ok(rankInsight(p).insight.includes('**'))
assert.equal(rankInsight(profileRoute([], idx)).insight, 'אין מסלול למדידה')
const words = (s) => s.replace(/\*\*/g, '').trim().split(/\s+/).length
assert.ok(words(rankInsight(p).insight) <= 8 && words(rankInsight(p).detail) <= 20)
console.log('street-rank: synthetic checks passed')

// המסלולים הקיימים
const streets = JSON.parse(fs.readFileSync(new URL('../public/data/streets.geojson', import.meta.url)))
const paths = JSON.parse(fs.readFileSync(new URL('../src/data/paths.json', import.meta.url)))
const real = buildIndex(streets.features)
for (const [id, path] of Object.entries(paths)) {
  const r = profileRoute(path.line, real), s = r.share, f = (x) => String(Math.round(x * 100)).padStart(3)
  assert.ok(words(rankInsight(r).insight) <= 8 && words(rankInsight(r).detail) <= 20, id)
  console.log(id.padEnd(10), (r.total / 1000).toFixed(1).padStart(5), 'km  local', f(s.local), ' main', f(s.main), ' blvd', f(s.boulevard), ' unk', f(s.unknown), ' off', f(s.off), ' |', rankInsight(r).insight.replace(/\*\*/g, ''))
}
