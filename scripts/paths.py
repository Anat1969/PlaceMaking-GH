# מחשב שבילי הליכה אמיתיים בין תחנות, דרך שרת הניתוב להולכי רגל של OpenStreetMap (routing.openstreetmap.de).
# הרצה: python3 -I scripts/paths.py <stops.json> src/data/paths.json
import json, sys, time, urllib.request
stops = json.load(open(sys.argv[1]))
out = {}
for w in stops:
    pts = w['pts'] + ([w['pts'][0]] if w['loop'] else [])
    coords = ';'.join(f'{x:.6f},{y:.6f}' for x, y in pts)
    url = f'https://routing.openstreetmap.de/routed-foot/route/v1/foot/{coords}?overview=full&geometries=geojson&steps=false'
    for attempt in range(4):
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'PlaceMakingAshdod/1.0'}), timeout=30))
            break
        except Exception as e:
            time.sleep(2 ** attempt)
    route = r['routes'][0]
    line = [[round(y, 6), round(x, 6)] for x, y in route['geometry']['coordinates']]
    legs = [round(l['distance']) for l in route['legs']]
    out[w['id']] = {'line': line, 'meters': round(route['distance']), 'legs': legs}
    print(w['id'], round(route['distance']), 'm', len(line), 'pts')
    time.sleep(1)
json.dump(out, open(sys.argv[2], 'w'), separators=(',', ':'))
