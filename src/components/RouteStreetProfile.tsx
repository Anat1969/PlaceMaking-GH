// "כמה שקט המסלול": רצועה כמו חתך גובה, שמראה על איזה דרג רחוב עובר כל קטע במסלול.
import { useEffect, useState } from 'react'
import Rich from './Rich'
import { GROUPS, LatLng, RADIUS_M, RankProfile, profileRoute, rankInsight } from '../lib/street-rank'
import { loadStreetIndex } from '../lib/streets-data'

const km = (m: number) => (m / 1000).toFixed(1)

export default function RouteStreetProfile({ line, compact }: { line: LatLng[]; compact?: boolean }) {
  const [p, setP] = useState<RankProfile | null>(null)
  const [error, setError] = useState('')
  const sig = line.length + ':' + line.slice(0, 2).join() + ':' + line.slice(-2).join() + ':' + line.reduce((a, q) => a + q[0] + q[1], 0)
  useEffect(() => {
    let live = true
    if (line.length < 2) { setP(null); return }
    loadStreetIndex().then((idx) => { if (live) { setP(profileRoute(line, idx)); setError('') } })
      .catch(() => { if (live) setError('שכבת הרחובות לא נטענה. רעננו את הדף לניסיון נוסף.') })
    return () => { live = false }
  }, [sig])
  if (line.length < 2) return <section className="card rank-profile"><span className="label">כמה שקט המסלול</span><p className="muted">אחרי שתי נקודות במסלול יופיע כאן על אילו רחובות הוא עובר.</p></section>
  if (error) return <section className="card rank-profile"><span className="label">כמה שקט המסלול</span><p className="tone tone-problem">{error}</p></section>
  if (!p) return <section className="card rank-profile" aria-busy="true"><span className="label">כמה שקט המסלול</span><p className="muted">בודק את המסלול מול שכבת הרחובות…</p></section>
  const t = rankInsight(p)
  return (
    <section className={'card rank-profile' + (compact ? ' compact' : '')} aria-label="כמה שקט המסלול">
      <span className="label">כמה שקט המסלול · דרג הרחוב לאורך ההליכה</span>
      <Rich as="p" className="rank-insight">{t.insight}</Rich>
      <Rich as="p" className="rank-detail">{t.detail}</Rich>
      <div className="rank-strip" role="img" aria-label={GROUPS.map((g) => `${g.label} ${Math.round(p.share[g.id] * 100)}%`).join(', ')}>
        {p.runs.map((r, i) => (
          <span key={i} className={'rk rk-' + r.group} style={{ width: ((r.to - r.from) / p.total) * 100 + '%' }}
            title={`${GROUPS.find((g) => g.id === r.group)!.label}${r.names.length ? ': ' + r.names.slice(0, 3).join(', ') : ''} · ק"מ ${km(r.from)} עד ${km(r.to)}`} />
        ))}
      </div>
      <div className="rank-axis"><span>התחלה <bdi className="num">0</bdi></span><span><bdi className="num">{km(p.total / 2)}</bdi> ק"מ</span><span><bdi className="num">{km(p.total)}</bdi> ק"מ</span></div>
      <ul className="rank-legend">
        {GROUPS.filter((g) => g.id !== 'unknown' || p.share.unknown > 0).map((g) => (
          <li key={g.id}><i className={'rk rk-' + g.id} /><span>{g.label}</span><bdi className="num">{Math.round(p.share[g.id] * 100)}%</bdi></li>
        ))}
      </ul>
      <details className="rank-how">
        <summary>איך נבדק</summary>
        <p>כל <bdi className="num">10</bdi> מ' לאורך המסלול נבדק מקטע הרחוב הקרוב, עד <bdi className="num">{RADIUS_M}</bdi> מ'. רחוק יותר: שביל או מחוץ לרחוב.</p>
        <p>מקור: שכבת הרחובות של העירייה, <bdi className="num">03.11.2026</bdi>, השדה מידרג. רצועות חניה לא נספרות.</p>
        <p>הערכה מתוך שמות הרחובות, לא מקרא רשמי: <bdi className="num">1</bdi> שדרות ראשיות, <bdi className="num">2</bdi> רחובות ראשיים, <bdi className="num">3</bdi> ומעלה מקומיים, כבישים <bdi className="num">4</bdi> ו-<bdi className="num">41</bdi> עם השדרות.</p>
        <p>מדרכה של שדרה רחבה עשויה להיות רחוקה מ-<bdi className="num">{RADIUS_M}</bdi> מ' מציר הרחוב, ואז תיספר כשביל.</p>
      </details>
    </section>
  )
}
