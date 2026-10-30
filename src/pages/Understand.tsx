import { useState } from 'react'
import { CIVIC_LEARNING } from '../data/civic-learning'
export default function Understand() {
  const [notes, setNotes] = useState<Record<string,string>>(() => { try { return JSON.parse(localStorage.getItem('pm-civic-learning') || '{}') } catch { return {} } })
  const [status,setStatus] = useState('')
  return <div className="page"><h1 className="page-title">להכיר, להבין ולהיות מעורבים</h1><p className="page-sub">חוויית העיר כוללת גם הבנת הנתונים הטבעיים, השיקולים והחלופות — ויכולת לשאול ולהשפיע.</p><p>השאלות הבאות הן מסגרת לחקירה. מפות מדידה יתווספו רק עם מקור, מועד ורזולוציה; אין כאן מדידה אקלימית של אשדוד.</p><div className="grid-2">{CIVIC_LEARNING.map((topic) => <section className="card" key={topic.id}><h2>{topic.name}</h2><p><strong>מה צריך לדעת:</strong> {topic.data}</p><p><strong>מה מנסים להבין:</strong> {topic.understand}</p><p><strong>מה צריך לשקול:</strong> {topic.decision}</p><label className="knowledge-field"><strong>{topic.question}</strong><textarea rows={3} className="field" value={notes[topic.id] || ''} onChange={(e) => { const next={...notes,[topic.id]:e.target.value};setNotes(next);try {localStorage.setItem('pm-civic-learning',JSON.stringify(next));setStatus('נשמר במכשיר בלבד; לא נשלח לעירייה.')}catch{setStatus('השמירה נכשלה. העתיקו את התצפית לפני יציאה.')} }} /></label></section>)}</div><p role="status">{status}</p></div>
}
