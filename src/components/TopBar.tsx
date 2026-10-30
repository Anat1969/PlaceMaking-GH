import { createElement } from 'react'
import { href } from '../lib/route'

export const NAV = [
  { page: 'atlas', label: 'אטלס' },
  { page: 'walks', label: 'מסלולים' },
  { page: 'kit', label: 'ארגז כלים' },
  { page: 'plan', label: 'תכנון ותזמון' },
  { page: 'city', label: 'העיר וסיפוריה' },
  { page: 'method', label: 'שיטה' },
  { page: 'show', label: 'מצגת' },
]

export default function TopBar({ page }: { page: string }) {
  const current = page === 'place' ? 'atlas' : page === 'walk' ? 'walks' : page
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
        {createElement('ai-menu', { brand: 'ashdod', chat: 'https://claude.ai/code/session_018qeN17iFt8BF9pUKUMW2cU' })}
      </div>
    </header>
  )
}
