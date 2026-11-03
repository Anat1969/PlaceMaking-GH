import { useEffect, useState } from 'react'
import L from 'leaflet'
import { loadStreets } from '../lib/streets-data'
import { rankGroup, GROUPS, RankGroup } from '../lib/street-rank'

// צבע ועובי לפי דרג הרחוב (מידרג). רצועות חניה (9) מוסתרות. המשמעות היא הערכה מתוך שמות הרחובות.
const STYLE: Record<RankGroup, { color: string; weight: number }> = { boulevard: { color: '#B3261E', weight: 4 }, main: { color: '#D9822B', weight: 3 }, local: { color: '#1F8A5B', weight: 1.6 }, unknown: { color: '#8C979F', weight: 1.4 }, off: { color: '#8C979F', weight: 1 } }

export default function StreetLayer({ map }: { map: L.Map | null }) {
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState('')
  const [food, setFood] = useState(false)
  const [foodStatus, setFoodStatus] = useState('')
  useEffect(() => {
    if (!visible || !map) return
    const abort = new AbortController()
    let layer: L.GeoJSON | undefined
    setStatus('טוען רחובות…')
    loadStreets().then((data) => {
      if (abort.signal.aborted) return
      const renderer = L.canvas()
      layer = L.geoJSON(data as unknown as GeoJSON.FeatureCollection, { filter: (f) => rankGroup(f.properties?.hierarchy) !== null, style: (f) => { const g = rankGroup(f?.properties?.hierarchy) || 'unknown'; return { ...STYLE[g], opacity: 0.8, renderer } }, onEachFeature: (feature, item) => {
        const tip = document.createElement('div'); tip.dir = 'rtl'
        const g = GROUPS.find((x) => x.id === rankGroup(feature.properties?.hierarchy))
        tip.textContent = `${feature.properties?.name || 'מקטע ללא שם'} · ${feature.properties?.quarter || 'רובע לא צוין'} · ${g ? g.label : ''} (מידרג ${feature.properties?.hierarchy ?? '?'}, הערכה)`
        item.bindTooltip(tip)
      }}).addTo(map)
      setStatus(`${layer.getLayers().length.toLocaleString('en-US')} מקטעים · אדום שדרה · כתום ראשי · ירוק מקומי. הדרג: הערכה מתוך השמות.`)
    }).catch((e) => { if (e.name !== 'AbortError') setStatus('טעינת הרחובות נכשלה. כבו והפעילו שוב לניסיון נוסף.') })
    return () => { abort.abort(); if (layer && map.hasLayer(layer)) map.removeLayer(layer) }
  }, [visible, map])
  useEffect(() => {
    if (!food || !map) return
    const abort = new AbortController(); let layer: L.GeoJSON | undefined
    setFoodStatus('טוען עמדות…')
    fetch(import.meta.env.BASE_URL + 'data/food-positions.geojson', { signal: abort.signal }).then((r) => { if (!r.ok) throw Error(); return r.json() }).then((data) => {
      if (abort.signal.aborted) return
      layer = L.geoJSON(data, { pointToLayer: (_, latlng) => L.circleMarker(latlng, { radius: 6, color: '#fff', weight: 2, fillColor: '#1F8A5B', fillOpacity: 1 }), onEachFeature: (feature,item) => {
        const tip=document.createElement('div');tip.dir='rtl';tip.textContent=`עמדה ${feature.properties.number}: ${feature.properties.name} · ${feature.properties.area} · נתוני ניהול, לא אישור פעילות`; item.bindTooltip(tip, { className: 'pm-tip' })
      }}).addTo(map)
      setFoodStatus(`${data.features.length} עמדות · מקור: אפליקציית ניהול הפודטרקים`)
    }).catch((e) => { if (e.name !== 'AbortError') setFoodStatus('הטעינה נכשלה. כבו והפעילו לניסיון נוסף.') })
    return () => { abort.abort(); if (layer && map.hasLayer(layer)) map.removeLayer(layer) }
  }, [food, map])
  return <div className="street-control"><button className="press chip" aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'הסתרת רחובות' : 'הצגת רחובות מהקובץ'}</button>{visible && <small role="status">{status}</small>}<button className="press chip" aria-pressed={food} onClick={() => setFood(!food)}>{food ? 'הסתרת עמדות פודטרקים' : 'הצגת עמדות פודטרקים'}</button>{food && <small role="status">{foodStatus}</small>}</div>
}
