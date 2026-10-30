import { useEffect, useState } from 'react'
import { CRITERIA, ELEMENTS, ElementKind, RingId, RINGS } from '../data/rings'
import { Place, PLACES } from '../data/places'

// ---------- שמירה מקומית ----------
const KEY = 'pm-ashdod-v1'
type Survey = Record<string, Record<string, number>> // place -> criterion -> 0..3
export type Action = { id: string; place: string; element: string; quarter: string; status: 'רעיון' | 'מתוכנן' | 'בביצוע' | 'בוצע'; note?: string }
export type Doc = { id: string; lat: number; lng: number; element: string; state: 'קיים' | 'חסר' | 'פגום'; note: string; at: string }
type Store = { survey: Survey; actions: Action[]; docs: Doc[] }

const empty: Store = { survey: {}, actions: [], docs: [] }
const load = (): Store => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}
let state: Store = load()
const subs = new Set<() => void>()
let savedAt = 0
let saveError = ''
export function update(fn: (s: Store) => Store) {
  state = fn(state)
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    savedAt = Date.now()
    saveError = ''
  } catch {
    savedAt = 0
    saveError = 'השמירה במכשיר נכשלה. השינויים נשארו פתוחים בזיכרון; ייצאו גיבוי לפני יציאה.'
  }
  subs.forEach((f) => f())
}
export function useStore() {
  const [, set] = useState(0)
  useEffect(() => {
    const f = () => set((n) => n + 1)
    subs.add(f)
    return () => void subs.delete(f)
  }, [])
  return { ...state, savedAt, saveError }
}

// ---------- ציון ----------
export const scoresOf = (p: Place) => ({ ...p.scores, ...(state.survey[p.id] || {}) })
export const surveyed = (p: Place) => !!state.survey[p.id]

export function ringScore(p: Place, ring: RingId) {
  const s = scoresOf(p)
  const cs = CRITERIA.filter((c) => c.ring === ring)
  return Math.round((cs.reduce((a, c) => a + (s[c.id] ?? 0), 0) / (cs.length * 3)) * 100)
}
export const profile = (p: Place) => Object.fromEntries(RINGS.map((r) => [r.id, ringScore(p, r.id)])) as Record<RingId, number>
export const total = (p: Place) => {
  const pr = profile(p)
  return Math.round((pr.tnua + pr.lev + pr.ruach) / 3)
}
export const weakest = (p: Place): RingId => {
  const pr = profile(p)
  return (Object.keys(pr) as RingId[]).sort((a, b) => pr[a] - pr[b])[0]
}

// ---------- המלצות: הפער החלש ביותר, ולכל אחד הרכיב שמשפר אותו ----------
export type Rec = { el: ElementKind; criterion: string; gain: number; why: string }
export function recommend(p: Place, n = 4): Rec[] {
  const s = scoresOf(p)
  const gaps = CRITERIA.map((c) => ({ c, v: s[c.id] ?? 0 })).filter((g) => g.v < 2).sort((a, b) => a.v - b.v)
  const out: Rec[] = []
  for (const g of gaps) {
    const el = ELEMENTS.filter((e) => e.serves.includes(g.c.id)).sort((a, b) => tierRank(a) - tierRank(b))[0]
    if (!el || out.some((o) => o.el.id === el.id)) continue
    out.push({ el, criterion: g.c.name, gain: 2 - g.v, why: `${g.c.name} ב-${g.v} מתוך 3. ${g.c.ask}` })
    if (out.length >= n) break
  }
  return out
}
const tierRank = (e: ElementKind) => ({ 'קל-זול-מהיר': 0, 'בינוני': 1, 'הון': 2 })[e.tier]

// ---------- סיכום עירוני ----------
export function cityStats() {
  const byRing = Object.fromEntries(RINGS.map((r) => [r.id, Math.round(PLACES.reduce((a, p) => a + ringScore(p, r.id), 0) / PLACES.length)])) as Record<RingId, number>
  const needs = CRITERIA.map((c) => ({ c, avg: PLACES.reduce((a, p) => a + (scoresOf(p)[c.id] ?? 0), 0) / PLACES.length })).sort((a, b) => a.avg - b.avg)
  return { byRing, needs }
}

export const QUARTERS = ['2026 ר4', '2027 ר1', '2027 ר2', '2027 ר3', '2027 ר4', '2028 ר1', '2028 ר2', '2028 ר3']
export const uid = () => Math.random().toString(36).slice(2, 9)
