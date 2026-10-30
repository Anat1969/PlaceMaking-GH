import { useEffect, useRef, useState } from 'react'

// ---------- הקראה: קול עברי של המכשיר (Web Speech) ----------
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window
export function speak(text: string, onEnd?: () => void) {
  if (!canSpeak()) return false
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'he-IL'
  u.rate = 0.95
  const he = speechSynthesis.getVoices().find((v) => v.lang.startsWith('he') || v.lang.startsWith('iw'))
  if (he) u.voice = he
  u.onend = () => onEnd?.()
  speechSynthesis.speak(u)
  return true
}
export const hush = () => canSpeak() && speechSynthesis.cancel()

// ---------- צליל הים: רעש ורוד שעולה ויורד כמו גלים ----------
let ctx: AudioContext | null = null
let seaNodes: { src: AudioBufferSourceNode; gain: GainNode } | null = null
export function sea(on: boolean) {
  if (!on) {
    seaNodes?.src.stop()
    seaNodes = null
    return
  }
  if (seaNodes) return
  ctx = ctx || new AudioContext()
  const len = ctx.sampleRate * 4
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1
    b0 = 0.997 * b0 + w * 0.029
    b1 = 0.985 * b1 + w * 0.032
    b2 = 0.95 * b2 + w * 0.048
    d[i] = (b0 + b1 + b2) * 0.25
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 900
  const gain = ctx.createGain()
  gain.gain.value = 0.25
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.11 // גל כל 9 שניות בערך
  const depth = ctx.createGain()
  depth.gain.value = 0.2
  lfo.connect(depth).connect(gain.gain)
  src.connect(filter).connect(gain).connect(ctx.destination)
  src.start()
  lfo.start()
  seaNodes = { src, gain }
}

// ---------- הקלטה: נשמרת במכשיר (IndexedDB) ----------
export type Clip = { id: string; place: string; at: string; blob: Blob; secs: number }
const DB = 'pm-ashdod-clips'
const open = () =>
  new Promise<IDBDatabase>((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => r.result.createObjectStore('clips', { keyPath: 'id' })
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
export async function saveClip(c: Clip) {
  const db = await open()
  await new Promise((res, rej) => {
    const t = db.transaction('clips', 'readwrite')
    t.objectStore('clips').put(c)
    t.oncomplete = res
    t.onerror = () => rej(t.error)
  })
}
export async function clipsOf(place: string): Promise<Clip[]> {
  try {
    const db = await open()
    return await new Promise((res) => {
      const r = db.transaction('clips').objectStore('clips').getAll()
      r.onsuccess = () => res((r.result as Clip[]).filter((c) => c.place === place).sort((a, b) => b.at.localeCompare(a.at)))
      r.onerror = () => res([])
    })
  } catch {
    return []
  }
}
export async function dropClip(id: string) {
  const db = await open()
  db.transaction('clips', 'readwrite').objectStore('clips').delete(id)
}

export function useRecorder(place: string, onSaved: () => void) {
  const [rec, setRec] = useState<MediaRecorder | null>(null)
  const [err, setErr] = useState('')
  const [secs, setSecs] = useState(0)
  const t0 = useRef(0)
  useEffect(() => {
    if (!rec) return
    const i = setInterval(() => setSecs(Math.round((Date.now() - t0.current) / 1000)), 500)
    return () => clearInterval(i)
  }, [rec])
  const start = async () => {
    setErr('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      const chunks: Blob[] = []
      mr.ondataavailable = (e) => chunks.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' })
        await saveClip({ id: Math.random().toString(36).slice(2), place, at: new Date().toISOString(), blob, secs: Math.round((Date.now() - t0.current) / 1000) })
        onSaved()
      }
      t0.current = Date.now()
      setSecs(0)
      mr.start()
      setRec(mr)
    } catch {
      setErr('אין גישה למיקרופון. אשרו הרשאה בדפדפן ונסו שוב.')
    }
  }
  const stop = () => {
    rec?.stop()
    setRec(null)
  }
  return { recording: !!rec, start, stop, err, secs }
}

// ---------- מיקום: הטלפון מזהה את התחנה ----------
export const meters = (a: [number, number], b: [number, number]) => {
  const R = 6371000, toR = Math.PI / 180
  const dLat = (b[0] - a[0]) * toR, dLng = (b[1] - a[1]) * toR
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * toR) * Math.cos(b[0] * toR) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
export function useGeo(on: boolean) {
  const [pos, setPos] = useState<[number, number] | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    if (!on) return
    if (!('geolocation' in navigator)) { setErr('המכשיר לא תומך במיקום.'); return }
    const id = navigator.geolocation.watchPosition(
      (p) => { setPos([p.coords.latitude, p.coords.longitude]); setErr('') },
      () => setErr('אין הרשאת מיקום. אפשר להמשיך במצב הדגמה.'),
      { enableHighAccuracy: true, maximumAge: 5000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [on])
  return { pos, err }
}
