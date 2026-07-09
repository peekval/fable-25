'use strict'
/* Performance-/Fehler-Audit über alle 40 Sites.
   Misst: Ladezeit (load event), pageerrors, console.error, rAF-Proxy-FPS (2s),
   horizontalen Overflow @390px. HINWEIS: FPS unter SwiftShader (CPU-GL) ist
   NICHT repräsentativ für echte GPUs — dient nur als relativer Jank-Indikator. */
const { chromium } = require('playwright-core')
const fs = require('fs')
const SITES = fs.readdirSync('/home/fabio/fable-25/public', { withFileTypes: true })
  .filter(d => d.isDirectory() && /^\d\d-/.test(d.name)).map(d => d.name).sort()

;(async () => {
  const b = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const results = []
  for (const site of SITES) {
    const row = { site, errors: [], consoleErr: [], load: 0, fps: 0, overflowX: false }
    for (const vp of [{ w: 390, h: 844 }, { w: 1280, h: 800 }]) {
      const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } })
      p.on('pageerror', e => row.errors.push(`[${vp.w}] ` + e.message.split('\n')[0].slice(0, 140)))
      p.on('console', m => { if (m.type() === 'error') row.consoleErr.push(`[${vp.w}] ` + m.text().slice(0, 120)) })
      const t0 = Date.now()
      try {
        await p.goto(`file:///home/fabio/fable-25/public/${site}/index.html`, { waitUntil: 'load', timeout: 25000 })
        row.load = Math.max(row.load, Date.now() - t0)
        await p.waitForTimeout(1500)
        if (vp.w === 390) {
          row.overflowX = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
          // leichte Scroll-Simulation, um Scroll-Handler-Fehler zu triggern
          await p.evaluate(() => new Promise(r => { let i = 0; const iv = setInterval(() => { window.scrollBy(0, 600); if (++i > 8) { clearInterval(iv); r() } }, 120) }))
          await p.waitForTimeout(600)
        } else {
          row.fps = await p.evaluate(() => new Promise(r => {
            let f = 0; const t = performance.now()
            const loop = () => { f++; if (performance.now() - t < 2000) requestAnimationFrame(loop); else r(Math.round(f / 2)) }
            requestAnimationFrame(loop)
          }))
        }
      } catch (e) { row.errors.push(`[${vp.w}] NAV-FAIL ` + e.message.split('\n')[0].slice(0, 100)) }
      await p.close()
    }
    results.push(row)
    const flag = row.errors.length || row.consoleErr.length || row.overflowX ? ' ⚠️' : ' ✓'
    console.log(`${site} load:${row.load}ms fps:${row.fps} ovfl:${row.overflowX ? 'JA' : '-'} err:${row.errors.length} cerr:${row.consoleErr.length}${flag}`)
  }
  await b.close()
  fs.writeFileSync('/home/fabio/fable-25/tools/audit-results.json', JSON.stringify(results, null, 1))
  const bad = results.filter(r => r.errors.length || r.consoleErr.length || r.overflowX)
  console.log('\n=== PROBLEME ===')
  bad.forEach(r => console.log(r.site, JSON.stringify({ e: r.errors.slice(0, 2), c: r.consoleErr.slice(0, 2), o: r.overflowX })))
  console.log(bad.length + ' Sites mit Findings / ' + results.length)
})()
