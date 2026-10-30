import math,io,json,urllib.request,concurrent.futures
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
import contourpy
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'public/data'; z=12;n=2**z
west,east,south,north=34.605,34.705,31.745,31.855
def xy(lon,lat):return (lon+180)/360*n,(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n
x0,y0=map(math.floor,xy(west,north)); x1,y1=map(math.floor,xy(east,south))
def get(t):
 x,y=t;u=f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
 p=Path(f'dem-{z}-{x}-{y}.png')
 if not p.exists():p.write_bytes(urllib.request.urlopen(u,timeout=25).read())
 a=np.asarray(Image.open(p)).astype(float);return x,y,a[:,:,0]*256+a[:,:,1]+a[:,:,2]/256-32768
canvas=np.zeros(((y1-y0+1)*256,(x1-x0+1)*256))
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for x,y,a in pool.map(get,[(x,y) for x in range(x0,x1+1) for y in range(y0,y1+1)]):canvas[(y-y0)*256:(y-y0+1)*256,(x-x0)*256:(x-x0+1)*256]=a
cols=np.arange(canvas.shape[1]);rows=np.arange(canvas.shape[0]);lng=(x0+(cols+.5)/256)/n*360-180;lat=np.degrees(np.arctan(np.sinh(math.pi*(1-2*(y0+(rows+.5)/256)/n))))
ci=np.where((lng>=west)&(lng<=east))[0];ri=np.where((lat>=south)&(lat<=north))[0]
a=gaussian_filter(canvas[np.ix_(ri,ci)],.7);lng=lng[ci];lat=lat[ri]
def simplify(points,tol=.00004):
 if len(points)<=2:return points
 a=points[0];b=points[-1];v=b-a
 if np.dot(v,v)==0:dist=np.linalg.norm(points-a,axis=1)
 else:
  t=np.clip((points-a)@v/np.dot(v,v),0,1);dist=np.linalg.norm(points-(a+t[:,None]*v),axis=1)
 idx=int(np.argmax(dist))
 if dist[idx]<=tol:return points[[0,-1]]
 return np.vstack([simplify(points[:idx+1],tol)[:-1],simplify(points[idx:],tol)])
features=[]
cg=contourpy.contour_generator(x=lng,y=lat,z=a)
for h in range(0,81,5):
 for line in cg.lines(h):
  if len(line)<4:continue
  features.append({'type':'Feature','properties':{'kind':'contour','height':h},'geometry':{'type':'LineString','coordinates':np.round(simplify(line),6).tolist()}})
# Arrows follow local steepest descent. They are NOT a pipe network, flood prediction or official catchment boundary.
for r in range(4,len(lat)-4,10):
 for c in range(4,len(lng)-4,10):
  if a[r,c]<2:continue
  gy=(a[r+2,c]-a[r-2,c])/4;gx=(a[r,c+2]-a[r,c-2])/4
  if math.hypot(gx,gy)<.25:continue
  m=math.hypot(gx,gy);dr=-gy/m*3;dc=-gx/m*3
  coords=[[float(lng[c]),float(lat[r])],[float(lng[c]+dc*(lng[1]-lng[0])),float(lat[r]+dr*(lat[1]-lat[0]))]]
  features.append({'type':'Feature','properties':{'kind':'flow'},'geometry':{'type':'LineString','coordinates':[[round(x,6),round(y,6)] for x,y in coords]}})
meta={'source':'Terrain Tiles / Mapzen, hosted on AWS Open Data','url':'https://registry.opendata.aws/terrain-tiles/','accessed':'2026-10-30','method':'Terrarium z12 decoded R*256+G+B/256-32768; Gaussian sigma0.7; contours5m, vertex simplification tolerance0.00004deg; local gradient arrows. No hydrological conditioning.','nominalPixelMeters':33,'verticalDatum':'מקור DEM עולמי; לא גובה מדידה עירוני ולא מפלס ים בזמן אמת','warning':'ללמידה מרחבית בלבד. אין כאן קו פרשת מים מאומת, אגני ניקוז מוסדרים, מערכת תת-קרקעית או מפת סיכון הצפה.'}
out.joinpath('terrain.geojson').write_text(json.dumps({'type':'FeatureCollection','metadata':meta,'features':features},ensure_ascii=False,separators=(',',':')))
print('terrain',len(features),'features',out.joinpath('terrain.geojson').stat().st_size)
