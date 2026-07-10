'use strict'
/* Perf-/Lag-Audit. FPS unter SwiftShader ist für WebGL wertlos — stattdessen:
   - longtasks (>50ms Main-Thread-Blocker) beim Idle und beim Scrollen
   - rAF-Intervall p95 (Jank sichtbar auch ohne GPU)
   - JS-Heap-Wachstum über die Messdauer (Leak-Indikator)
   - rAF-Aktivität nach Scroll ans Seitenende (pausieren die Hero-Loops?)
   Ergebnisse in perf-results.json. */
const { chromium } = require('playwright-core')
const fs = require('fs')
const SITES = process.argv.length > 2 ? process.argv.slice(2)
  : fs.readdirSync('/home/fabio/fable-25/public', { withFileTypes: true })
      .filter(d => d.isDirectory() && /^\d\d-/.test(d.name)).map(d => d.name).sort()

const METER = `(dur) => new Promise(done => {
  const res = { long: 0, longMs: 0, raf: 0, p95: 0 };
  const iv = [];
  let last = performance.now();
  const po = new PerformanceObserver(l => l.getEntries().forEach(e => { res.long++; res.longMs += Math.round(e.duration) }));
  try { po.observe({ entryTypes: ['longtask'] }) } catch (e) {}
  const t0 = performance.now();
  (function loop () {
    const n = performance.now();
    iv.push(n - last); last = n; res.raf++;
    if (n - t0 < dur) requestAnimationFrame(loop);
    else {
      po.disconnect();
      iv.sort((a, b) => a - b);
      res.p95 = Math.round(iv[Math.floor(iv.length * .95)] || 0);
      done(res);
    }
  })();
})`

;(async () => {
  const results = []
  for (const site of SITES) {
    // Browser pro Site: ein SwiftShader-GPU-Absturz (schwere Shader) darf nicht den Lauf beenden
    let b
    try { b = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader', '--js-flags=--expose-gc'] }) }
    catch (e) { results.push({ site, err: 'launch: ' + e.message.slice(0, 80) }); continue }
    const row = { site, idle: null, scroll: null, heapMB: 0, idleRafEnd: 0 }
    let p
    try {
      p = await b.newPage({ viewport: { width: 1280, height: 800 } })
      await p.goto(`file:///home/fabio/fable-25/public/${site}/index.html`, { waitUntil: 'load', timeout: 30000 })
      await p.waitForTimeout(2500) // Intros ausklingen lassen
      const heap0 = await p.evaluate(() => (performance.memory ? performance.memory.usedJSHeapSize : 0))

      // 1) Idle im Hero
      row.idle = await p.evaluate(`(${METER})(3000)`)

      // 2) Scroll-Belastung: 6 Sprünge während der Messung
      const H = await p.evaluate(() => Math.max(1, document.documentElement.scrollHeight - innerHeight))
      const scrollP = p.evaluate(`(${METER})(3600)`)
      for (let i = 1; i <= 6; i++) { await p.evaluate(y => scrollTo(0, y), Math.round(H * i / 6)); await p.waitForTimeout(550) }
      row.scroll = await scrollP

      // 3) Ende der Seite, 3s warten: pausieren Loops? (rAF/s am Seitenende)
      await p.waitForTimeout(1200)
      const end = await p.evaluate(`(${METER})(2000)`)
      row.idleRafEnd = Math.round(end.raf / 2)

      const heap1 = await p.evaluate(() => (performance.memory ? performance.memory.usedJSHeapSize : 0))
      row.heapMB = Math.round((heap1 - heap0) / 1048576 * 10) / 10
    } catch (e) { row.err = e.message.split('\n')[0].slice(0, 120) }
    try { await b.close() } catch (e) {}
    results.push(row)
    const flag = (row.idle && (row.idle.long > 3 || row.idle.p95 > 120)) || (row.scroll && row.scroll.long > 8) || row.heapMB > 25 ? ' ⚠️' : ' ✓'
    console.log(`${site} idle[long:${row.idle && row.idle.long} p95:${row.idle && row.idle.p95}ms] scroll[long:${row.scroll && row.scroll.long} p95:${row.scroll && row.scroll.p95}ms] heap:+${row.heapMB}MB endRaf/s:${row.idleRafEnd}${flag}`)
  }
  fs.writeFileSync('/home/fabio/fable-25/tools/perf-results.json', JSON.stringify(results, null, 1))
  console.log('\nfertig: ' + results.length + ' sites')
})()
