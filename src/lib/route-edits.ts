import { PATHS, Path } from '../data/paths'
export type Point=[number,number]
export const closeLoop=(pts:Point[]):Point[]=>pts.length<3?pts:[...pts,pts[0]]
export function saveRoute(id:string,points:Point[]) {
 if(points.length<3||points.some(p=>p.length!==2||p.some(n=>!Number.isFinite(n))||p[0]<31.6||p[0]>32||p[1]<34.4||p[1]>34.9))throw Error('נדרשות לפחות שלוש נקודות באזור אשדוד.')
 const line=closeLoop(points),path:Path={line,segments:[line],meters:0,legs:[],gaps:[],kind:'user-draft',source:'עריכה אישית · הצעה תכנונית; אינה מסלול מאושר'}
 const all=JSON.parse(localStorage.getItem('pm-route-edits')||'{}');all[id]=path;localStorage.setItem('pm-route-edits',JSON.stringify(all));PATHS[id]=path
}
export function downloadRoute(id:string,points:Point[]) { const a=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify({type:'Feature',properties:{id,status:'personal-planning-draft',closed:true},geometry:{type:'LineString',coordinates:closeLoop(points).map(([lat,lng])=>[lng,lat])}})],{type:'application/geo+json'}));a.href=url;a.download=id+'.geojson';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000) }
