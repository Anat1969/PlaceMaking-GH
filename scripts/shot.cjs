// צילומי מסך ובדיקת קצה לקצה מול vite preview. הרצה: node scripts/shot.cjs
const { chromium } = require('playwright')
const path = require('path')
const BASE = process.env.BASE || 'http://localhost:4173'
const pages = ['', 'atlas', 'atlas?place=h5', 'place?id=h5', 'walks', 'walk?id=ring-lev', 'kit', 'plan', 'city', 'method', 'show']
;(async () => {
  const b = await chromium.launch()
  const errors = []
  for (const [name, vp] of [['desk', { width: 1366, height: 860 }], ['mob', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, locale: 'he-IL' })
    if (!process.env.LIVE) await ctx.route('**/ai-menu.js', (r) => r.fulfill({ path: path.join(__dirname, 'ai-menu.local.js'), contentType: 'text/javascript' }))
    const p = await ctx.newPage()
    p.on('pageerror', (e) => errors.push(`${name} pageerror: ${e.message}`))
    p.on('console', (m) => m.type() === 'error' && !/tile|cartocdn|favicon|Failed to load resource/.test(m.text()) && errors.push(`${name} console: ${m.text()}`))
    for (const pg of pages) {
      await p.goto(`${BASE}/#/${pg}`)
      await p.waitForTimeout(pg.startsWith('atlas') || pg.startsWith('walk?') || pg.startsWith('place') ? 2500 : 1600)
      if (pg === 'plan') { await p.click('text=בניית תוכנית לפיילוט'); await p.waitForTimeout(400) }
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      if (ov > 1) errors.push(`${name} ${pg} horizontal overflow ${ov}px`)
      await p.screenshot({ path: `shots/${name}-${(pg || 'home').replace(/[?=]/g, '_')}.png` })
    }
    await ctx.close()
  }
  await b.close()
  console.log(errors.length ? errors.join('\n') : 'no errors')
})()
