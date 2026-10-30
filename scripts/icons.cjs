// יוצר אייקונים מ-public/favicon.svg. הרצה: node scripts/icons.cjs
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
;(async () => {
  const svg = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'), 'utf8')
  const b = await chromium.launch()
  const p = await b.newPage()
  for (const s of [192, 512]) {
    await p.setViewportSize({ width: s, height: s })
    await p.setContent(`<style>*{margin:0}svg{width:${s}px;height:${s}px;display:block}</style>${svg}`)
    await p.screenshot({ path: path.join(__dirname, `../public/icon-${s}.png`) })
  }
  await b.close()
})()
