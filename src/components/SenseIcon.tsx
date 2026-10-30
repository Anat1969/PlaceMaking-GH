export default function SenseIcon({id,size=24}:{id:string;size?:number}) {
 const paths:Record<string,JSX.Element>={
 see:<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
 hear:<><path d="M8 16H5V8h3l5-4v16l-5-4Z"/><path d="M17 8a7 7 0 0 1 0 8m3-11a11 11 0 0 1 0 14"/></>,
 touch:<><circle cx="14" cy="4" r="2"/><path d="m8 22 3-7-4-4 4-5 4 4 4 1M4 7h4m4 7 5 6"/></>,
 breathe:<><path d="M2 8h14c5 0 5-6 1-6m-15 11h18c4 0 4 7-1 7M2 18h7c4 0 4 5 0 5"/></>,
 taste:<><path d="M5 2v7m3-7v7M2 2v7c0 4 6 4 6 0M5 12v10m13 0V2c-5 3-5 11 0 11"/></>
 }
 return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[id]||<circle cx="12" cy="12" r="8"/>}</svg>
}
