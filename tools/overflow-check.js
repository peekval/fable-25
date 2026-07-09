'use strict'
/* Listet pro Site die Elemente, die bei 390px Viewport horizontal überlaufen. */
const { chromium } = require('playwright-core')
const SITES = process.argv.slice(2)

;(async () => {
  const b = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'] })
  for (const site of SITES) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } })
    try {
      await p.goto(`file:///home/fabio/fable-25/public/${site}/index.html`, { waitUntil: 'load', timeout: 25000 })
      await p.waitForTimeout(1200)
      const info = await p.evaluate(() => {
        const vw = window.innerWidth
        const out = { scrollWidth: document.documentElement.scrollWidth, vw, offenders: [] }
        const els = document.querySelectorAll('*')
        const clipped = (el) => {
          // steigt zu den Vorfahren auf; ein overflow-x != visible clippt (Näherung, ignoriert abs-pos-Containing-Block-Feinheiten)
          for (let a = el.parentElement; a && a !== document.documentElement && a !== document.body; a = a.parentElement) {
            const ov = getComputedStyle(a).overflowX
            if (ov !== 'visible') return true
          }
          return false
        }
        for (const el of els) {
          const r = el.getBoundingClientRect()
          if (r.right > vw + 2 || r.left < -2) {
            const cs = getComputedStyle(el)
            if (cs.position === 'fixed') continue
            if (clipped(el)) continue
            out.offenders.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || null,
              cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().slice(0, 60),
              left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
              pos: cs.position, transform: cs.transform !== 'none'
            })
          }
        }
        // nur die "äußersten" zeigen: nach Breite sortiert, max 12
        out.offenders.sort((a, b2) => b2.right - a.right)
        out.offenders = out.offenders.slice(0, 12)
        return out
      })
      console.log(`\n=== ${site} scrollWidth:${info.scrollWidth} vw:${info.vw} ===`)
      for (const o of info.offenders) console.log(` <${o.tag}${o.id ? '#' + o.id : ''}${o.cls ? '.' + o.cls.split(' ').join('.') : ''}> L:${o.left} R:${o.right} w:${o.w} ${o.pos}${o.transform ? ' [transform]' : ''}`)
      if (!info.offenders.length && info.scrollWidth <= info.vw + 2) console.log(' (kein Overflow mehr)')
    } catch (e) { console.log(`\n=== ${site} FEHLER: ${e.message.split('\n')[0]}`) }
    await p.close()
  }
  await b.close()
})()
