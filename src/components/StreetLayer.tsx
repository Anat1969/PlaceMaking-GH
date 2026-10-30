import { useEffect, useState } from 'react'
import L from 'leaflet'

export default function StreetLayer({ map }: { map: L.Map | null }) {
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState('')
  useEffect(() => {
    if (!visible || !map) return
    const abort = new AbortController()
    let layer: L.GeoJSON | undefined
    setStatus('טוען רחובות…')
    fetch(import.meta.env.BASE_URL + 'data/streets.geojson', { signal: abort.signal }).then((r) => { if (!r.ok) throw Error('load'); return r.json() }).then((data) => {
      if (abort.signal.aborted) return
      layer = L.geoJSON(data, { style: { color: '#65787c', weight: 2, opacity: 0.65, renderer: L.canvas() }, onEachFeature: (feature, item) => {
        const tip = document.createElement('div'); tip.dir = 'rtl'
        tip.textContent = `${feature.properties?.name || 'מקטע ללא שם'} · ${feature.properties?.quarter || 'רובע לא צוין'} · מקובץ הרחובות שסופק`
        item.bindTooltip(tip)
      }}).addTo(map)
      setStatus('2,991 מקטעים · קובץ שסופק · אינו תוואי ניווט')
    }).catch((e) => { if (e.name !== 'AbortError') setStatus('טעינת הרחובות נכשלה. כבו והפעילו שוב לניסיון נוסף.') })
    return () => { abort.abort(); if (layer && map.hasLayer(layer)) map.removeLayer(layer) }
  }, [visible, map])
  return <div className="street-control"><button className="press chip" aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'הסתרת רחובות' : 'הצגת רחובות מהקובץ'}</button>{visible && <small role="status">{status}</small>}</div>
}
