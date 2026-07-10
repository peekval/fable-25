'use strict'
/* Verify 68-maestro: silent path clean at both viewports, then Begin →
   AudioContext running, scroll → analyser signal, screenshots tutti & solo. */
const { chromium } = require('playwright-core')
const URL = 'file:///home/fabio/fable-25/public/68-maestro/index.html'
const SHOT = '/tmp/claude-1000/-home-fabio-fable-25/f3c2a2a0-f804-4859-a0e7-4151708e83df/scratchpad'

;(async () => {
  const b = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] })
  let fail = 0
  const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++ }

  /* ---- silent path, both viewports ---- */
  for (const vp of [{ w: 390, h: 844 }, { w: 1280, h: 800 }]) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } })
    const errs = []
    p.on('pageerror', e => errs.push(e.message.split('\n')[0]))
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 140)) })
    await p.goto(URL, { waitUntil: 'load', timeout: 20000 })
    await p.waitForTimeout(1800)
    // scroll through entire page silently
    await p.evaluate(() => new Promise(r => { let i = 0; const iv = setInterval(() => { window.scrollBy(0, 900); if (++i > 14) { clearInterval(iv); r() } }, 100) }))
    await p.waitForTimeout(800)
    const audioCreated = await p.evaluate(() => !!window.__audioCtxCreated)
    const ovfl = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    console.log(`SILENT @${vp.w}:`)
    check(errs.length === 0, 'zero errors' + (errs.length ? ' → ' + errs.slice(0, 3).join(' | ') : ''))
    check(ovfl <= 2, `scrollWidth ok (excess ${ovfl}px)`)
    check(!audioCreated, 'no AudioContext before Begin')
    if (vp.w === 390) await p.screenshot({ path: SHOT + '/68-silent-390.png' })
    await p.close()
  }

  /* ---- begin + conduct ---- */
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } })
  const errs = []
  p.on('pageerror', e => errs.push(e.message.split('\n')[0]))
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 140)) })
  // instrument AudioContext creation
  await p.addInitScript(() => {
    const AC = window.AudioContext
    window.__analysers = []
    window.AudioContext = function (...a) { window.__audioCtxCreated = true; const c = new AC(...a); window.__ctx = c; return c }
    const ca = AC.prototype.createAnalyser
    AC.prototype.createAnalyser = function () { const an = ca.call(this); window.__analysers.push(an); return an }
  })
  await p.goto(URL, { waitUntil: 'load', timeout: 20000 })
  await p.waitForTimeout(1000)
  await p.click('#begin')
  await p.waitForTimeout(1500)
  const state = await p.evaluate(() => window.__ctx && window.__ctx.state)
  console.log('CONDUCT:')
  check(state === 'running', `AudioContext state = ${state}`)

  // scroll to tutti (frac ~0.48) with velocity, sample analyser via injected probe
  await p.evaluate(() => {
    const max = document.documentElement.scrollHeight - innerHeight
    return new Promise(r => {
      let y = 0; const target = max * 0.5
      const iv = setInterval(() => { y += 400; scrollTo(0, Math.min(y, target)); if (y >= target) { clearInterval(iv); r() } }, 60)
    })
  })
  await p.waitForTimeout(6000) // let tutti events fire
  const rms = await p.evaluate(() => {
    let best = 0
    for (const an of (window.__analysers || [])) {
      const buf = new Uint8Array(an.fftSize)
      an.getByteTimeDomainData(buf)
      let s = 0
      for (let i = 0; i < buf.length; i++) { const d = (buf[i] - 128) / 128; s += d * d }
      best = Math.max(best, Math.sqrt(s / buf.length))
    }
    return best
  })
  check(rms > 0.001, `max AnalyserNode RMS at tutti = ${rms.toFixed(4)}`)
  await p.screenshot({ path: SHOT + '/68-tutti.png' })
  const hud = await p.evaluate(() => document.getElementById('hud-mvt').textContent + ' / ' + document.getElementById('hud-dyn').textContent + ' / ' + document.getElementById('hud-bar').textContent)
  console.log('  HUD @tutti: ' + hud)

  // solo (frac ~0.8)
  await p.evaluate(() => { const max = document.documentElement.scrollHeight - innerHeight; scrollTo(0, max * 0.80) })
  await p.waitForTimeout(5000)
  await p.screenshot({ path: SHOT + '/68-solo.png' })

  // coda
  await p.evaluate(() => { const max = document.documentElement.scrollHeight - innerHeight; scrollTo(0, max) })
  await p.waitForTimeout(4000)
  const stats = await p.evaluate(() => document.getElementById('st-time').textContent + ' | ' + document.getElementById('st-bars').textContent + ' | ' + document.getElementById('st-peak').textContent)
  console.log('  stats: ' + stats)
  await p.screenshot({ path: SHOT + '/68-coda.png' })
  check(errs.length === 0, 'zero errors during conduct' + (errs.length ? ' → ' + errs.slice(0, 3).join(' | ') : ''))
  await p.close()
  await b.close()
  console.log(fail ? `\n${fail} FAILURES` : '\nALL PASS')
  process.exit(fail ? 1 : 0)
})().catch(e => { console.error('FATAL', e); process.exit(2) })
