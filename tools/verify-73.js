'use strict'
/* Verify 73-mira: zero errors @1280+390, scrollWidth <= 392 @390,
   screenshots hero / media-kit / kitchen. */
const { chromium } = require('playwright-core')
const URL = 'file:///home/fabio/fable-25/public/73-mira/index.html'
const SHOT = '/tmp/claude-1000/-home-fabio-fable-25/f3c2a2a0-f804-4859-a0e7-4151708e83df/scratchpad'

;(async () => {
  const b = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  let fail = 0
  const check = (ok, msg) => { console.log((ok ? '  OK ' : '  FAIL ') + msg); if (!ok) fail++ }

  for (const vp of [{ w: 1280, h: 800 }, { w: 390, h: 844 }]) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } })
    const errs = []
    p.on('pageerror', e => errs.push(e.message.split('\n')[0]))
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 140)) })
    await p.goto(URL, { waitUntil: 'load', timeout: 20000 })
    await p.waitForTimeout(1200)
    await p.evaluate(() => new Promise(r => { let i = 0; const iv = setInterval(() => { window.scrollBy(0, 800); if (++i > 12) { clearInterval(iv); r() } }, 90) }))
    await p.waitForTimeout(900)
    const sw = await p.evaluate(() => document.documentElement.scrollWidth)
    console.log(`@${vp.w}:`)
    check(errs.length === 0, 'zero errors' + (errs.length ? ' -> ' + errs.slice(0, 4).join(' | ') : ''))
    check(sw <= (vp.w === 390 ? 392 : 1290), `scrollWidth ${sw}`)
    // newsletter mock
    await p.fill('#nlform input', 'test@mail.de')
    await p.click('#nlform .btn')
    await p.waitForTimeout(500)
    const ok = await p.evaluate(() => document.getElementById('nlok').classList.contains('show'))
    check(ok, 'newsletter demo confirmation shows')
    if (vp.w === 1280) {
      await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(900)
      await p.screenshot({ path: SHOT + '/73-hero-1280.png' })
      await p.evaluate(() => document.getElementById('mediakit').scrollIntoView()); await p.waitForTimeout(1300)
      await p.screenshot({ path: SHOT + '/73-mediakit-1280.png' })
      await p.evaluate(() => document.querySelector('.kitchen').scrollIntoView()); await p.waitForTimeout(1100)
      await p.screenshot({ path: SHOT + '/73-kitchen-1280.png' })
    } else {
      await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(900)
      await p.screenshot({ path: SHOT + '/73-hero-390.png' })
      await p.evaluate(() => document.getElementById('mediakit').scrollIntoView()); await p.waitForTimeout(1300)
      await p.screenshot({ path: SHOT + '/73-mediakit-390.png' })
    }
    await p.close()
  }

  // reduced motion: squiggles drawn, content visible
  const p2 = await b.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  const errs2 = []
  p2.on('pageerror', e => errs2.push(e.message))
  await p2.goto(URL, { waitUntil: 'load', timeout: 20000 })
  await p2.waitForTimeout(800)
  const rm = await p2.evaluate(() => {
    const path = document.querySelector('.hero .squig path')
    const off = getComputedStyle(path).strokeDashoffset
    const h1 = getComputedStyle(document.querySelector('h1')).opacity
    return { off, h1 }
  })
  console.log('@reduced-motion:')
  check(errs2.length === 0, 'zero errors')
  check(parseFloat(rm.off) === 0, `squiggle drawn (dashoffset ${rm.off})`)
  check(rm.h1 === '1', 'content visible')
  await p2.close()

  await b.close()
  console.log(fail ? `\n${fail} FAILURES` : '\nALL PASS')
  process.exit(fail ? 1 : 0)
})().catch(e => { console.error(e); process.exit(1) })
