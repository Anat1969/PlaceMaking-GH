import { useEffect, useState } from 'react'

// ניתוב hash: הכתובת נושאת את הדף ואת הפריט, כך שהעתקת קישור שומרת את המצב.
export type Route = { page: string; params: Record<string, string> }
const parse = (): Route => {
  const [path, query = ''] = window.location.hash.replace(/^#\/?/, '').split('?')
  return { page: path || 'home', params: Object.fromEntries(new URLSearchParams(query)) }
}

export function useRoute() {
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const on = () => {
      const next = parse()
      setRoute((prev) => {
        if (prev.page !== next.page) window.scrollTo({ top: 0 })
        return next
      })
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export const href = (page: string, params?: Record<string, string>) => {
  const q = params ? '?' + new URLSearchParams(params).toString() : ''
  return page === 'home' ? '#/' : `#/${page}${q}`
}
export const go = (page: string, params?: Record<string, string>) => {
  window.location.hash = href(page, params).slice(1)
}
