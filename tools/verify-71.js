'use strict'
/* Verify 71-domus: zero errors @1280+390 (file://), scrollWidth <= 392 @390,
   walkthrough screenshots at 4 scroll depths w/ caption readout, reduced-motion stills, guide. */
const { chromium } = require('playwright-core')
const URL = 'file:///home/fabio/fable-25/public/71-domus/index.html'
const GUIDE = 'file:///home/fabio/fable-25/public/71-domus/guide/index.html'
const SHOT = '/tmp/claude-1000/-home-fabio-fable-25/f3c2a2a0-f804-4859-a0e7-4151708e83df/scratchpad'
const fs = require('fs')

;(async () => {
  const b = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  let fail = 0
  const check = (ok, msg) => { console.log((ok ? '  OK   ' : '  FAIL ') + msg); if (!ok) fail++ }

  for (const vp of [{ w: 1280, h: 800 }, { w: 390, h: 844 }]) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } })
    const errs = []
    p.on('pageerror', e => errs.push('page: ' + e.message.split('\n')[0]))
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)) })
    await p.goto(URL, { waitUntil: 'load', timeout: 25000 })
    await p.waitForTimeout(1200)
    await p.screenshot({ path: `${SHOT}/71-hero-${vp.w}.png` })

    // trigger frame loading by scrolling near the walkthrough, wait for veil off
    await p.evaluate(() => { const r = document.getElementById('rundgang'); scrollTo(0, r.offsetTop - 200) })
    await p.waitForTimeout(400)
    await p.waitForFunction(() => document.getElementById('veil').classList.contains('off'), null, { timeout: 20000 }).catch(() => {})
    const veilOff = await p.evaluate(() => document.getElementById('veil').classList.contains('off'))
    await p.waitForTimeout(3500) // let more frames arrive

    // 4 scroll depths inside the walkthrough
    const depths = [0.12, 0.38, 0.55, 0.88]
    const caps = []
    for (const d of depths) {
      await p.evaluate(fr => {
        const r = document.getElementById('rundgang')
        scrollTo(0, r.offsetTop + (r.offsetHeight - innerHeight) * fr)
      }, d)
      await p.waitForTimeout(1400) // damped playhead settle + frame availability
      const info = await p.evaluate(() => ({
        chip: document.getElementById('frameChip').textContent,
        cap: (document.querySelector('.cap.on .r-name') || {}).textContent || '(none)',
        label: document.getElementById('planLabel').textContent
      }))
      caps.push(`${Math.round(d * 100)}% -> ${info.chip} | ${info.cap} | plan:${info.label}`)
      await p.screenshot({ path: `${SHOT}/71-walk-${Math.round(d * 100)}-${vp.w}.png` })
    }
    console.log(`@${vp.w} walkthrough:\n    ` + caps.join('\n    '))

    // overflow at 12 depths across the whole page
    let worst = 0
    for (let f = 0; f <= 12; f++) {
      await p.evaluate(fr => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * fr / 12), f)
      await p.waitForTimeout(120)
      worst = Math.max(worst, await p.evaluate(() => document.documentElement.scrollWidth))
    }

    // form mock
    await p.evaluate(() => document.getElementById('besichtigung').scrollIntoView({ block: 'start' }))
    await p.fill('#fName', 'Test Person')
    await p.fill('#fMail', 'test@example.ch')
    await p.click('.f-send')
    await p.waitForTimeout(250)
    const sent = await p.evaluate(() => document.getElementById('visitForm').classList.contains('sent'))
    await p.screenshot({ path: `${SHOT}/71-preis-${vp.w}.png` })

    console.log(`@${vp.w}:`)
    check(errs.length === 0, 'zero errors' + (errs.length ? ' -> ' + errs.slice(0, 4).join(' | ') : ''))
    check(worst <= (vp.w === 390 ? 392 : vp.w + 2), `scrollWidth worst ${worst}`)
    check(veilOff, 'loading veil clears')
    check(sent, 'form mock confirms')
    await p.close()
  }

  // reduced motion
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const errs = []
  p.on('pageerror', e => errs.push(e.message))
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await p.goto(URL, { waitUntil: 'load' })
  await p.waitForTimeout(800)
  const rm = await p.evaluate(() => ({
    scrubHidden: getComputedStyle(document.getElementById('rundgang')).display === 'none',
    stills: document.querySelectorAll('.rm-walk figure').length,
    rmShown: getComputedStyle(document.querySelector('.rm-walk')).display !== 'none'
  }))
  await p.evaluate(() => document.querySelector('.rm-walk').scrollIntoView())
  await p.waitForTimeout(900)
  await p.screenshot({ path: `${SHOT}/71-rm-390.png` })
  console.log('reduced motion:')
  check(rm.scrubHidden && rm.rmShown && rm.stills === 5, `scrub hidden, 5 stills shown (${JSON.stringify(rm)})`)
  check(errs.length === 0, 'zero errors RM')
  await p.close()

  // guide
  if (fs.existsSync('/home/fabio/fable-25/public/71-domus/guide/index.html')) {
    const g = await b.newPage({ viewport: { width: 390, height: 844 } })
    const gerrs = []
    g.on('pageerror', e => gerrs.push(e.message))
    g.on('console', m => { if (m.type() === 'error') gerrs.push(m.text()) })
    await g.goto(GUIDE, { waitUntil: 'load' })
    await g.waitForTimeout(500)
    const gw = await g.evaluate(() => document.documentElement.scrollWidth)
    const words = await g.evaluate(() => (document.getElementById('prompt') || { textContent: '' }).textContent.trim().split(/\s+/).length)
    await g.screenshot({ path: `${SHOT}/71-guide-390.png` })
    console.log('guide:')
    check(gerrs.length === 0, 'zero errors guide')
    check(gw <= 392, `guide scrollWidth ${gw}`)
    check(words >= 300, `prompt words ${words}`)
    await g.close()
  } else console.log('  (guide not present yet)')

  await b.close()
  console.log(fail ? `\n${fail} FAILURES` : '\nALL PASS')
  process.exit(fail ? 1 : 0)
})().catch(e => { console.error(e); process.exit(2) })
