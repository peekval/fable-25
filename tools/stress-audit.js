'use strict'
/* Stress-Audit: tiefer als audit.js. Pro Site & Viewport:
   - kompletter Scroll-Durchlauf in Schritten (fängt scroll-getriebene Fehler)
   - Klicks auf sichtbare Buttons/[role=button] (keine <a>-Navigation)
   - Tastendruck, Resize-Zyklus, visibility-Toggle
   - Blank-Screen-Heuristik: Viewport-JPEG < BLANK_BYTES ≈ leerer/einfarbiger Screen
   Findings landen in stress-results.json; Screenshots der Blank-Verdachtsfälle im Scratchpad. */
const { chromium } = require('playwright-core')
const fs = require('fs')
const SCRATCH = '/tmp/claude-1000/-home-fabio-fable-25/f3c2a2a0-f804-4859-a0e7-4151708e83df/scratchpad/stress'
const BLANK_BYTES = 7000
const SITES = process.argv.length > 2 ? process.argv.slice(2)
  : fs.readdirSync('/home/fabio/fable-25/public', { withFileTypes: true })
      .filter(d => d.isDirectory() && /^\d\d-/.test(d.name)).map(d => d.name).sort()

fs.mkdirSync(SCRATCH, { recursive: true })

;(async () => {
  const b = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'] })
  const results = []
  for (const site of SITES) {
    const row = { site, errors: [], blanks: [], overflow: [] }
    for (const vp of [{ w: 1280, h: 800 }, { w: 390, h: 844 }]) {
      const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } })
      const tag = m => `[${vp.w}] ` + m.split('\n')[0].slice(0, 160)
      p.on('pageerror', e => row.errors.push(tag('PAGE ' + e.message)))
      p.on('console', m => { if (m.type() === 'error') row.errors.push(tag('CONS ' + m.text())) })
      try {
        await p.goto(`file:///home/fabio/fable-25/public/${site}/index.html`, { waitUntil: 'load', timeout: 30000 })
        await p.waitForTimeout(2200)

        // Scroll-Durchlauf in 8 Schritten + Blank-Check je Schritt
        const H = await p.evaluate(() => Math.max(1, document.documentElement.scrollHeight - innerHeight))
        for (let i = 0; i <= 8; i++) {
          await p.evaluate(y => scrollTo(0, y), Math.round(H * i / 8))
          await p.waitForTimeout(650)
          const shot = await p.screenshot({ type: 'jpeg', quality: 50 })
          if (shot.length < BLANK_BYTES) {
            const name = `${site}-${vp.w}-s${i}.jpeg`
            fs.writeFileSync(`${SCRATCH}/${name}`, shot)
            row.blanks.push(`[${vp.w}] step${i} ${shot.length}b -> ${name}`)
          }
          const ow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)
          if (ow > 2) row.overflow.push(`[${vp.w}] step${i} +${ow}px`)
        }

        // Interaktionen: bis zu 8 sichtbare Buttons klicken (keine Links)
        await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500)
        const nBtn = await p.evaluate(() => {
          const els = [...document.querySelectorAll('button, [role="button"]')]
          return els.filter(el => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 }).length
        })
        for (let i = 0; i < Math.min(nBtn, 8); i++) {
          await p.evaluate(idx => {
            const els = [...document.querySelectorAll('button, [role="button"]')]
              .filter(el => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 })
            els[idx] && els[idx].click()
          }, i).catch(() => {})
          await p.waitForTimeout(350)
        }

        // Tasten + Maus-Wischen + Resize-Zyklus + visibility-Toggle
        await p.keyboard.press('Space').catch(() => {})
        await p.keyboard.type('g').catch(() => {})
        await p.mouse.move(vp.w * .2, vp.h * .5)
        await p.mouse.move(vp.w * .8, vp.h * .4, { steps: 12 })
        await p.mouse.down(); await p.mouse.move(vp.w * .5, vp.h * .6, { steps: 8 }); await p.mouse.up()
        await p.setViewportSize({ width: Math.round(vp.w * .7), height: vp.h }); await p.waitForTimeout(450)
        await p.setViewportSize({ width: vp.w, height: vp.h }); await p.waitForTimeout(450)
        await p.evaluate(() => { document.dispatchEvent(new Event('visibilitychange')) }).catch(() => {})
        await p.waitForTimeout(400)
      } catch (e) { row.errors.push(tag('NAV ' + e.message)) }
      await p.close()
    }
    results.push(row)
    const bad = row.errors.length || row.blanks.length || row.overflow.length
    console.log(`${site} err:${row.errors.length} blank:${row.blanks.length} ovfl:${row.overflow.length}${bad ? ' ⚠️' : ' ✓'}`)
  }
  await b.close()
  fs.writeFileSync('/home/fabio/fable-25/tools/stress-results.json', JSON.stringify(results, null, 1))
  const bad = results.filter(r => r.errors.length || r.blanks.length || r.overflow.length)
  console.log('\n=== FINDINGS ===')
  bad.forEach(r => console.log(r.site, JSON.stringify({ e: r.errors.slice(0, 3), b: r.blanks.slice(0, 3), o: r.overflow.slice(0, 2) })))
  console.log(bad.length + ' Sites mit Findings / ' + results.length)
})()
