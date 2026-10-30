import {useEffect,useState} from 'react'
import {Route,href} from '../lib/route'
import {SECTIONS,pageInfo,pageTitle,PAGES} from '../data/navigation'
import {placeById,walkById} from '../data/places'
import {useStore} from '../lib/logic'
export type RecentPage={url:string;title:string;page:string;at:string}
export function readRecent():RecentPage[]{try{const d=JSON.parse(localStorage.getItem('pm-recent-pages-v1')||'[]');return Array.isArray(d)?d.filter(x=>typeof x.url==='string'&&/^#\/(?:[a-z-]+)?(?:\?|$)/.test(x.url)&&typeof x.title==='string').slice(0,6):[]}catch{return []}}
export default function AppContext({route}:{route:Route}){const info=pageInfo(route.page),section=SECTIONS.find(s=>s.id===info?.section),store=useStore(),[help,setHelp]=useState(false)
 useEffect(()=>{setHelp(false);if(route.page==='home'||route.page==='show')return;const url=href(route.page,route.params);const title=route.page==='place'?placeById(route.params.id)?.name:route.page==='walk'||route.page==='tour'?walkById(route.params.id)?.title:pageTitle(route.page);if(!title||!info)return;try{const next=[{url,title,page:route.page,at:new Date().toISOString()},...readRecent().filter(x=>x.url!==url)].slice(0,6);localStorage.setItem('pm-recent-pages-v1',JSON.stringify(next))}catch{/* Reading and navigation remain available if storage is full. */}},[route.page,JSON.stringify(route.params)])
 if(route.page==='home')return store.saveError?<p className="app-save-error" role="alert">{store.saveError} <a href="#/workspace">לגיבוי העבודה</a></p>:null
 return <><div className="app-context no-print"><nav aria-label="מיקום במערכת"><a href="#/">מבט על</a><span>/</span>{section&&<><a href={href(section.page)}>{section.name}</a><span>/</span></>}<strong>{pageTitle(route.page)}</strong></nav><div><span className="app-local-state">עבודה אישית במכשיר</span><button onClick={()=>setHelp(v=>!v)} aria-expanded={help}>מה עושים כאן?</button></div></div>{help&&<div className="app-context-help"><p>{info?.purpose}</p><strong>{info?.action}</strong><a href="#/workspace">שמירה, גיבוי והעברה ←</a></div>}{store.saveError&&<p className="app-save-error" role="alert">{store.saveError} <a href="#/workspace">גיבוי העבודה</a></p>}</>
}
