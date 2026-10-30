import type { Walk } from './places'
import { RINGS } from './rings'
const COLORS = ['#087F8C', '#7A3E9D', '#9E4B16', '#206A3D', '#BB3148', '#355BB5', '#786600', '#9F397B', '#3F6168']
// אותו מזהה מסלול מקבל אותו צבע בכל המפות והמקרא.
export function walkColor(w: Walk): string {
  if (w.ring) return RINGS.find((r) => r.id === w.ring)!.color
  const index = Number(w.id.replace('route-', '')) - 1
  return COLORS[Number.isInteger(index) && index >= 0 ? index % COLORS.length : 0]
}
