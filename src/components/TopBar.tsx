import { createElement } from 'react'
import { href } from '../lib/route'

export const NAV = [
  { page: 'atlas', label: 'אטלס' },
  { page: 'walks', label: 'מסלולים' },
  { page: 'xp', label: 'חוויה' },
  { page: 'games', label: 'משחקים' },
  { page: 'kit', label: 'ארגז כלים' },
  { page: 'plan', label: 'תכנון' },
  { page: 'city', label: 'העיר' },
  { page: 'language', label: 'שפה' },
  { page: 'understand', label: 'מפות וידע' },
  { page: 'sources', label: 'מקורות' },
  { page: 'method', label: 'שיטה' },
  { page: 'show', label: 'מצגת' },
]
const PARENT: Record<string, string> = { place: 'atlas', 'route-editor': 'walks', walk: 'walks', tour: 'walks', mapping: 'xp', walls: 'xp' }

export default function TopBar({ page }: { page: string }) {
  const current = PARENT[page] || page
  return (
    <header className="topbar">
      <div className="topbar-in">
        <a className="brand" href="#/" aria-label="שלוש טבעות, לדף הבית">
          <img src={import.meta.env.BASE_URL + "favicon.svg"} alt="" />
          <span className="bt">שלוש טבעות<small>PLACEMAKING · אשדוד</small></span>
        </a>
        <nav className="tabs" aria-label="ניווט ראשי">
          {NAV.map((n) => (
            <a key={n.page} className="tab" href={href(n.page)} aria-current={current === n.page ? 'page' : undefined}>{n.label}</a>
          ))}
        </nav>
        {createElement('ai-menu', { brand: 'ashdod' })}
      </div>
    </header>
  )
}
