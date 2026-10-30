import { WALKS, placeById } from '../src/data/places'
const out = WALKS.map((w) => ({ id: w.id, loop: !!w.ring, pts: w.stops.map((s) => placeById(s.place)!).filter(Boolean).map((p) => [p.lng, p.lat]) }))
console.log(JSON.stringify(out))
