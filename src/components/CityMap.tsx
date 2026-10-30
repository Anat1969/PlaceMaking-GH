import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { Place, LAYERS, Walk, placeById } from '../data/places'
import { RINGS, RingId, elementById } from '../data/rings'
import { QUARTERS } from '../data/city'
import { profile, Doc } from '../lib/logic'

const RAD: Record<RingId, number> = { tnua: 42, lev: 30, ruach: 18 }

// סמן = טביעת האצבע של המקום, בזעיר. הנקודה במרכז בצבע השכבה.
function pinSvg(p: Place, size: number, selected: boolean) {
  const pr = profile(p)
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
}

export default function CityMap({ places, selected, onSelect, walks = [], showQuarters = true, docs = [], onMapClick, fit, height = '100%' }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const clickRef = useRef(onMapClick)
  clickRef.current = onMapClick

  useEffect(() => {
    if (!el.current || map.current) return
    const m = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: true }).setView([31.795, 34.652], 13)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
      className: 'pm-tiles',
    }).addTo(m)
    m.on('click', (e: L.LeafletMouseEvent) => clickRef.current?.(e.latlng.lat, e.latlng.lng))
    layer.current = L.layerGroup().addTo(m)
    map.current = m
    setTimeout(() => m.invalidateSize(), 50)
    return () => {
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
      const pts = w.stops.map((s) => placeById(s.place)).filter(Boolean).map((p) => [p!.lat, p!.lng] as [number, number])
      const color = w.ring ? RINGS.find((r) => r.id === w.ring)!.color : '#14202B'
      if (w.ring && pts.length > 2) pts.push(pts[0])
      L.polyline(pts, { color: '#fff', weight: 9, opacity: 0.8 }).addTo(g)
      L.polyline(pts, { color, weight: 5, opacity: 0.9, dashArray: w.ring ? undefined : '8 6' }).addTo(g)
    })
    places.forEach((p) => {
      const sel = p.id === selected
      const size = sel ? 44 : 28
      const mk = L.marker([p.lat, p.lng], {
        icon: L.divIcon({ className: 'pm-pin', html: pinSvg(p, size, sel), iconSize: [size, size], iconAnchor: [size / 2, size / 2] }),
        keyboard: true,
        title: p.name,
        zIndexOffset: sel ? 1000 : 0,
      })
      mk.bindTooltip(`<strong>${p.name}</strong><br/><span style="color:#77818A">${LAYERS[p.layer].name}${p.approx ? ' · מיקום משוער' : ''}</span>`, { className: 'pm-tip', direction: 'top', offset: [0, -size / 2] })
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
    if (fit && places.length) {
      const b = L.latLngBounds(places.map((p) => [p.lat, p.lng] as [number, number]))
      m.fitBounds(b.pad(0.25), { maxZoom: 15 })
    }
  }, [places, selected, walks, showQuarters, docs, fit, onSelect])

  useEffect(() => {
    const m = map.current
    const p = places.find((x) => x.id === selected)
    if (m && p && !fit) m.panTo([p.lat, p.lng], { animate: true })
  }, [selected])

  return <div ref={el} style={{ width: '100%', height }} />
}
