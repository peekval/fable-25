'use strict'
/* Verify 72-klar: zero errors @1280+390, scrollWidth<=392, dot thread moves,
   counters reach targets, one principle at a time, screenshots. */
const { chromium } = require('playwright-core')
const URL = 'file:///home/fabio/fable-25/public/72-klar/index.html'
const SHOT = '/tmp/claude-1000/-home-fabio-fable-25/f3c2a2a0-f804-4859-a0e7-4151708e83df/scratchpad'

;(async () => {
  const b = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  let fail = 0
  const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++ }

  for (const vp of [{ w: 1280, h: 800 }, { w: 390, h: 844 }]) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } })
    const errs = []
    p.on('pageerror', e => errs.push(e.message.split('\n')[0]))
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)) })
    await p.goto(URL, { waitUntil: 'load', timeout: 20000 })
    await p.waitForTimeout(1200)
    console.log(`@${vp.w}:`)

    // dot present & positioned near wordmark full stop
    const dot0 = await p.evaluate(() => {
      const d = document.getElementById('dot').getBoundingClientRect()
      const o = document.getElementById('dot-origin').getBoundingClientRect()
      return { dx: d.left, dy: d.top, ox: o.left, oy: o.top, live: document.getElementById('dot').classList.contains('live') }
    })
    check(dot0.live && Math.abs(dot0.dx - dot0.ox) < 30, `dot born at wordmark (Δx ${(dot0.dx - dot0.ox).toFixed(1)}px)`)
    if (vp.w === 1280) await p.screenshot({ path: SHOT + '/72-hero.png' })

    // scroll to case rows, wait counters
    await p.evaluate(() => document.querySelectorAll('.case-row')[0].scrollIntoView({ block: 'center', behavior: 'instant' }))
    await p.waitForTimeout(1400)
    const counts = await p.evaluate(() => [...document.querySelectorAll('[data-count]')].slice(0, 2).map(e => e.textContent))
    check(counts[0] === '+212%', `counter 1 = "${counts[0]}"`)
    check(counts[1] === '−38%', `counter 2 = "${counts[1]}" (minus sign)`)

    // dot on rail now
    const dot1 = await p.evaluate(() => {
      const d = document.getElementById('dot').getBoundingClientRect()
      const r = document.getElementById('thread').getBoundingClientRect()
      return { dx: d.left + 5.5, rx: r.left }
    })
    check(Math.abs(dot1.dx - dot1.rx) < 3, `dot riding rail (Δx ${(dot1.dx - dot1.rx).toFixed(1)}px)`)
    if (vp.w === 1280) await p.screenshot({ path: SHOT + '/72-case.png' })

    // parallax transform present
    const plx = await p.evaluate(() => {
      document.querySelector('.case-figure').scrollIntoView({ block: 'center', behavior: 'instant' })
      return new Promise(r => setTimeout(() => r(document.getElementById('parallax').style.transform), 300))
    })
    check(/translateY/.test(plx), `parallax active (${plx})`)

    // ansatz: exactly one principle visible at three depths
    for (const frac of [0.1, 0.5, 0.9]) {
      const res = await p.evaluate(f => {
        const s = document.getElementById('ansatz')
        const top = s.offsetTop + (s.offsetHeight - innerHeight) * f
        scrollTo(0, top)
        return new Promise(r => setTimeout(() => {
          const act = [...document.querySelectorAll('.prinzip')].map(el => el.classList.contains('active'))
          r({ act, count: document.getElementById('ansatz-count').textContent })
        }, 700))
      }, frac)
      check(res.act.filter(Boolean).length === 1, `ansatz @${frac}: one active [${res.act}] ${res.count}`)
      if (vp.w === 1280 && frac === 0.5) await p.screenshot({ path: SHOT + '/72-prinzip.png' })
    }

    // bottom, overflow, errors
    await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
    await p.waitForTimeout(600)
    const ovfl = await p.evaluate(() => document.documentElement.scrollWidth)
    check(ovfl <= vp.w + 2, `scrollWidth ${ovfl} <= ${vp.w + 2}`)
    check(errs.length === 0, 'zero errors' + (errs.length ? ' → ' + errs.slice(0, 3).join(' | ') : ''))
    if (vp.w === 390) await p.screenshot({ path: SHOT + '/72-mobile.png' })
    await p.close()
  }

  // reduced motion pass
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  const errs = []
  p.on('pageerror', e => errs.push(e.message.split('\n')[0]))
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)) })
  await p.goto(URL, { waitUntil: 'load', timeout: 20000 })
  await p.waitForTimeout(900)
  console.log('@reduced-motion:')
  const rm = await p.evaluate(() => ({
    dotHidden: getComputedStyle(document.getElementById('dot')).display === 'none',
    allP: [...document.querySelectorAll('.prinzip')].every(el => getComputedStyle(el).opacity === '1'),
    firstCount: (document.querySelectorAll('.case-row')[0].scrollIntoView(), null)
  }))
  await p.waitForTimeout(400)
  const c0 = await p.evaluate(() => document.querySelector('[data-count]').textContent)
  check(rm.dotHidden, 'fixed dot hidden (static coral full stop instead)')
  check(rm.allP, 'all principles statically visible')
  check(c0 === '+212%', `counter prints final immediately ("${c0}")`)
  check(errs.length === 0, 'zero errors (reduced)')
  await p.close()

  // guide page
  const g = await b.newPage({ viewport: { width: 390, height: 844 } })
  const gerrs = []
  g.on('pageerror', e => gerrs.push(e.message.split('\n')[0]))
  g.on('console', m => { if (m.type() === 'error') gerrs.push('console: ' + m.text().slice(0, 160)) })
  try {
    await g.goto('file:///home/fabio/fable-25/public/72-klar/guide/index.html', { waitUntil: 'load', timeout: 20000 })
    await g.waitForTimeout(800)
    console.log('guide @390:')
    const gw = await g.evaluate(() => document.documentElement.scrollWidth)
    const words = await g.evaluate(() => (document.getElementById('prompt') || { textContent: '' }).textContent.trim().split(/\s+/).length)
    check(gw <= 392, `guide scrollWidth ${gw}`)
    check(words >= 340 && words <= 460, `prompt ~${words} words`)
    check(gerrs.length === 0, 'guide zero errors' + (gerrs.length ? ' → ' + gerrs.join(' | ') : ''))
  } catch (e) { check(false, 'guide load: ' + e.message.split('\n')[0]) }
  await g.close()

  await b.close()
  console.log(fail ? `\n${fail} FAILURES` : '\nALL PASS')
  process.exit(fail ? 1 : 0)
})().catch(e => { console.error('FATAL', e); process.exit(2) })
