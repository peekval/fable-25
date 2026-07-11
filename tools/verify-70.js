'use strict'
/* Verify 70-servo: zero errors @1280+390 (file://), scrollWidth <= 392 @390,
   screenshots: hero (both vps), egg moment mid-reveal + settled, specs, guide. */
const { chromium } = require('playwright-core')
const URL = 'file:///home/fabio/fable-25/public/70-servo/index.html'
const GUIDE = 'file:///home/fabio/fable-25/public/70-servo/guide/index.html'
const SHOT = '/tmp/claude-1000/-home-fabio-fable-25/f3c2a2a0-f804-4859-a0e7-4151708e83df/scratchpad'
const fs = require('fs')

;(async () => {
  const b = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  let fail = 0
  const check = (ok, msg) => { console.log((ok ? '  OK  ' : '  FAIL ') + msg); if (!ok) fail++ }

  for (const vp of [{ w: 1280, h: 800 }, { w: 390, h: 844 }]) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } })
    const errs = []
    p.on('pageerror', e => errs.push('page: ' + e.message.split('\n')[0]))
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)) })
    await p.goto(URL, { waitUntil: 'load', timeout: 20000 })
    await p.waitForTimeout(2600)
    await p.screenshot({ path: `${SHOT}/70-hero-${vp.w}.png` })
    // scroll to egg section, catch mid-reveal
    await p.evaluate(() => document.getElementById('trust').scrollIntoView({ behavior: 'instant', block: 'center' }))
    await p.waitForTimeout(300)
    await p.screenshot({ path: `${SHOT}/70-egg-mid-${vp.w}.png` })
    await p.waitForTimeout(2200)
    await p.screenshot({ path: `${SHOT}/70-egg-${vp.w}.png` })
    // specs
    await p.evaluate(() => document.getElementById('specs').scrollIntoView({ behavior: 'instant', block: 'center' }))
    await p.waitForTimeout(1800)
    await p.screenshot({ path: `${SHOT}/70-specs-${vp.w}.png` })
    // full silent scroll for overflow at depths
    let worst = 0
    for (let f = 0; f <= 10; f++) {
      await p.evaluate(fr => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * fr / 10), f)
      await p.waitForTimeout(120)
      const ov = await p.evaluate(() => document.documentElement.scrollWidth)
      worst = Math.max(worst, ov)
    }
    // reserve interaction
    await p.evaluate(() => document.getElementById('reserve').scrollIntoView({ behavior: 'instant' }))
    await p.fill('#resmail', 'test@home.example')
    await p.click('#resbtn')
    await p.waitForTimeout(300)
    const done = await p.evaluate(() => document.getElementById('resbtn').classList.contains('done'))
    if (vp.w === 390) await p.screenshot({ path: `${SHOT}/70-reserve-390.png` })
    console.log(`@${vp.w}:`)
    check(errs.length === 0, 'zero errors' + (errs.length ? ' -> ' + errs.slice(0, 3).join(' | ') : ''))
    check(worst <= (vp.w === 390 ? 392 : vp.w + 2), `scrollWidth worst ${worst}`)
    check(done, 'reserve mock completes')
    await p.close()
  }

  // reduced motion pass
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const errs = []
  p.on('pageerror', e => errs.push(e.message))
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await p.goto(URL, { waitUntil: 'load' })
  await p.waitForTimeout(800)
  const vis = await p.evaluate(() => {
    const img = document.querySelector('.stage img')
    const cs = getComputedStyle(img)
    const counter = document.querySelector('[data-count="31"]').textContent
    return { op: cs.opacity, blur: cs.filter, counter }
  })
  console.log('REDUCED MOTION:')
  check(vis.op === '1' && (vis.blur === 'none' || vis.blur === 'blur(0px)'), `hero static visible (opacity ${vis.op}, filter ${vis.blur})`)
  check(vis.counter === '31', `counters pre-set (${vis.counter})`)
  check(errs.length === 0, 'zero errors')
  await p.close()

  // guide
  if (fs.existsSync('/home/fabio/fable-25/public/70-servo/guide/index.html')) {
    const g = await b.newPage({ viewport: { width: 390, height: 844 } })
    const gerrs = []
    g.on('pageerror', e => gerrs.push(e.message))
    g.on('console', m => { if (m.type() === 'error') gerrs.push(m.text()) })
    await g.goto(GUIDE, { waitUntil: 'load' })
    await g.waitForTimeout(1200)
    const gsw = await g.evaluate(() => document.documentElement.scrollWidth)
    const words = await g.evaluate(() => (document.getElementById('prompt') || { textContent: '' }).textContent.trim().split(/\s+/).length)
    console.log('GUIDE:')
    check(gerrs.length === 0, 'zero errors' + (gerrs.length ? ' -> ' + gerrs[0] : ''))
    check(gsw <= 392, `scrollWidth ${gsw}`)
    check(words >= 340 && words <= 470, `prompt word count ${words}`)
    await g.screenshot({ path: `${SHOT}/70-guide-390.png` })
    await g.close()
  } else console.log('GUIDE: not built yet')

  await b.close()
  console.log(fail ? `\n${fail} FAILURE(S)` : '\nALL PASS')
  process.exit(fail ? 1 : 0)
})().catch(e => { console.error(e); process.exit(2) })
