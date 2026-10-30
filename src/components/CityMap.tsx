import { walkColor } from '../data/walk-colors'
import StreetLayer from './StreetLayer'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Place, LAYERS, Walk, placeById } from '../data/places'
import { RINGS, RingId, elementById } from '../data/rings'
import { QUARTERS } from '../data/city'
import { Doc } from '../lib/logic'
import { coverOf } from '../data/media'
import { needsLocation } from '../data/identity'
import { PATHS as paths } from '../data/paths'

const RAD: Record<RingId, number> = { tnua: 42, lev: 30, ruach: 18 }

// סמן = טביעת האצבע של המקום, בזעיר. הנקודה במרכז בצבע השכבה.
function pinSvg(p: Place, size: number, selected: boolean) {
  const pr = Object.fromEntries(RINGS.map((r) => [r.id, r.id === p.ring ? 100 : 0])) as Record<RingId, number>
  const rings = RINGS.map((r) => {
    const c = 2 * Math.PI * RAD[r.id]
    return `<circle cx="50" cy="50" r="${RAD[r.id]}" fill="none" stroke="${r.color}" stroke-opacity=".22" stroke-width="11"/><circle cx="50" cy="50" r="${RAD[r.id]}" fill="none" stroke="${r.color}" stroke-width="11" stroke-dasharray="${(c * pr[r.id]) / 100} ${c}" transform="rotate(-90 50 50)"/>`
  }).join('')
  const bg = selected ? '<circle cx="50" cy="50" r="49" fill="#14202B"/>' : '<circle cx="50" cy="50" r="49" fill="#FFFDF8"/>'
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${bg}${rings}<circle cx="50" cy="50" r="9" fill="${LAYERS[p.layer].color}"/></svg>`
}

type Props = {
  places: Place[]
  selected?: string
  onSelect?: (id: string) => void
  walks?: Walk[]
  showQuarters?: boolean
  docs?: Doc[]
  onMapClick?: (lat: number, lng: number) => void
  fit?: boolean
  height?: string
  me?: [number, number] | null
  numbered?: boolean
  streetControl?: boolean
}

export default function CityMap({ places, selected, onSelect, walks = [], showQuarters = true, docs = [], onMapClick, fit, height = '100%', me, numbered, streetControl = false }: Props) {
  const [readyMap, setReadyMap] = useState<L.Map | null>(null)
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const fitted = useRef(false)
  const clickRef = useRef(onMapClick)
  clickRef.current = onMapClick

  useEffect(() => {
    if (!el.current || map.current) return
    const m = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: true, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false }).setView([31.795, 34.652], 13)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
      className: 'pm-tiles',
    }).addTo(m)
    m.on('click', (e: L.LeafletMouseEvent) => clickRef.current?.(e.latlng.lat, e.latlng.lng))
    layer.current = L.layerGroup().addTo(m)
    map.current = m
    setReadyMap(m)
    const resizeTimer = setTimeout(() => m.invalidateSize(), 50)
    return () => {
      clearTimeout(resizeTimer)
      m.stop()
      m.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    const g = layer.current
    const m = map.current
    if (!g || !m) return
    g.clearLayers()
    if (showQuarters) {
      QUARTERS.forEach((q) => {
        L.marker([q.lat, q.lng], {
          interactive: false,
          icon: L.divIcon({ className: 'pm-q', html: `<span style="font:600 11px 'IBM Plex Sans Hebrew';color:#4C5864;white-space:nowrap;text-shadow:0 0 3px #fff,0 0 3px #fff;letter-spacing:.02em">${q.name}</span>`, iconSize: [80, 14], iconAnchor: [40, 7] }),
        }).addTo(g)
      })
    }
    walks.forEach((w) => {
      // תוואי על רשת הרחובות המחושבת; דורש דיוק ובדיקת שטח, ונשאר גלוי למיפוי.
      const path = paths[w.id]
      const real = path?.line
      if (!path) return
      const pts = real
      const color = walkColor(w)
      const segments = path.segments || (real?.length ? [real] : [])
      segments.forEach((segment) => {
        L.polyline(segment, { color: '#fff', weight: 8, opacity: 0.85, lineJoin: 'round' }).addTo(g)
        const routeLine = L.polyline(segment, { color, weight: 5, opacity: 0.9, lineJoin: 'round', dashArray: w.ring ? '10 5' : undefined, className: `route-line route-${w.id}` }).addTo(g)
        const routeTip = document.createElement('span'); routeTip.textContent = `${w.title} · תוואי מוצע בין העוגנים · ${path.source || 'ניתוב מחושב'}`
        routeLine.bindTooltip(routeTip, { sticky: true, direction: 'top', className: 'pm-tip' })
      })
      ;(path.planningLinks || []).forEach(segment => {
        const proposal=L.polyline(segment,{color,weight:3,opacity:.65,dashArray:'2 7',className:'planning-link'}).addTo(g)
        proposal.bindTooltip('חיבור תכנוני לסגירת הטבעת · אינו דרך ממופה או הוראת ניווט',{sticky:true})
      })
      w.stops.forEach((station, i) => {
        const p = placeById(station.place)
        if (!p || needsLocation(p)) return
        const mk = L.marker([p.lat, p.lng], { keyboard: true, title: `${w.title} · תחנה ${i + 1} · ${p.name}`, zIndexOffset: 2100 + i,
          icon: L.divIcon({ className: 'pm-pin route-stop', html: `<span style="display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:${color};color:#fff;font:700 12px sans-serif;border:3px ${p.approx || needsLocation(p) ? 'dashed' : 'solid'} #fff;box-shadow:0 1px 5px #0008">${i + 1}</span>`, iconSize: [32,32], iconAnchor: [16,16] }) })
        const tip = document.createElement('div'); tip.dir = 'rtl'
        tip.textContent = `${w.title} · תחנה ${i + 1}: ${p.name}${p.approx || needsLocation(p) ? ' · מיקום מוצע לדיוק' : ''}`
        mk.bindTooltip(tip, { className: 'pm-tip', direction: 'top' })
        mk.on('click', () => onSelect?.(p.id)); mk.addTo(g)
      })
    })
    if (me) {
      L.circle(me, { radius: 40, color: '#2B6CA3', weight: 1, fillOpacity: 0.12 }).addTo(g)
      L.marker(me, { zIndexOffset: 3000, interactive: false, icon: L.divIcon({ className: 'pm-pin', html: '<span class="me-dot"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(g)
    }
    places.filter((p) => !needsLocation(p)).forEach((p) => {
      const sel = p.id === selected
      const size = sel ? 44 : 28
      const mk = L.marker([p.lat, p.lng], {
        icon: L.divIcon({ className: 'pm-pin', html: pinSvg(p, size, sel), iconSize: [size, size], iconAnchor: [size / 2, size / 2] }),
        keyboard: true,
        title: p.name,
        zIndexOffset: sel ? 1000 : 0,
      })
      const tip = document.createElement('div')
      tip.dir = 'rtl'
      const photo = coverOf(p.id)
      if (photo) {
        const img = document.createElement('img')
        img.src = photo.src; img.alt = photo.caption; img.className = 'map-tip-photo'
        img.addEventListener('error', () => img.remove(), { once: true })
        tip.append(img)
      }
      const name = document.createElement('strong'); name.textContent = p.name; tip.append(name)
      const label = document.createElement('div'); label.textContent = `${LAYERS[p.layer].name}${p.approx ? ' · מיקום משוער' : ' · מיקום מהמאגר'}`; tip.append(label)
      mk.bindTooltip(tip, { className: 'pm-tip', direction: 'top', offset: [0, -size / 2] })
      mk.on('click', () => onSelect?.(p.id))
      mk.addTo(g)
    })
    docs.forEach((d) => {
      const col = d.state === 'קיים' ? '#1F8A5B' : d.state === 'חסר' ? '#B3261E' : '#D9822B'
      L.marker([d.lat, d.lng], {
        icon: L.divIcon({ className: 'pm-pin', html: `<svg viewBox="0 0 20 20" width="18" height="18"><rect x="2" y="2" width="16" height="16" fill="${col}" stroke="#fff" stroke-width="2"/></svg>`, iconSize: [18, 18], iconAnchor: [9, 9] }),
      })
        .bindTooltip(`<strong>${elementById(d.element).name}: ${d.state}</strong><br/>${d.note || ''}`, { className: 'pm-tip', direction: 'top' })
        .addTo(g)
    })
    if (fit && !fitted.current && places.length && !me) {
      const b = L.latLngBounds(places.map((p) => [p.lat, p.lng] as [number, number]))
      m.fitBounds(b.pad(0.25), { maxZoom: 15, animate: false })
      fitted.current = true
    }
  }, [places, selected, walks, showQuarters, docs, fit, onSelect, me, numbered])

  // בחירת מסלול מציגה את כל התוואי; החלפת שכבות אינה מאפסת את המבט.
  const walkKey = walks.map((w) => w.id).join(',')
  useEffect(() => {
    const m = map.current
    const points = walks.flatMap((w) => paths[w.id]?.line || [])
    if (m && points.length && !me) m.fitBounds(L.latLngBounds(points).pad(0.12), { animate: false, maxZoom: 17 })
  }, [walkKey])

  useEffect(() => {
    const m = map.current
    const p = places.find((x) => x.id === selected)
    if (m && p && !needsLocation(p) && !fit) m.panTo([p.lat, p.lng], { animate: false })
  }, [selected])

  return <div style={{ position: 'relative', width: '100%', height }}><div ref={el} style={{ width: '100%', height: '100%' }} />{streetControl && <StreetLayer map={readyMap} />}</div>
}
