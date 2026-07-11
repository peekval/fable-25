# SERVO — Help, at home.

## Full Reproduction Prompt

Build a single-file product-launch site for SERVO, a fictional consumer humanoid-robot company. Tagline: "Help, at home." Aesthetic: futuristic-clean LIGHT — a seamless white studio world (#FCFCFD paper, #F4F5F7 studio grey), ink #16181C, warm grey #8A8F96, and exactly one accent: cyan #5EEAD4 (deep variant #2BB8A3 on white). Fonts: Sora (light geometric display, weight 300 with 500 emphasis spans), Instrument Sans (text), JetBrains Mono (labels, specs). The design system is the "status line": every section rule is a 1px line whose ::after gradient (transparent-cyan-white-cyan-transparent) sweeps across once when it enters the viewport, echoing the robot's visor light — fire it via IntersectionObserver adding a class, never on a loop.

Hero: stage a 1920x1072 photo of a white humanoid in a white studio like a keynote — copy vertically centered left (mono kicker "SERVO 01 · HOME UNIT", huge light headline "Help, at home.", one warm sentence), the unit full-height right via object-fit cover; melt the photo's studio grey into the page with edge gradients so no rectangle shows. Reveal it with a light-bloom: a radial white overlay fades out while the image eases from blur(14px)/scale(1.05) to sharp over ~2s. Add a fixed mono meta line at the bottom: "UNIT 01 / STANDING BY · 178 CM · 58 KG · ● STATUS: CALM" with the dot gently blinking. On mobile, stack: copy, then the unit at ~190% width cropped by the viewport.

Then: (1) "What it does" — six capability cards (laundry, dishes, plants, fetching, nightly tidying, gentle checking) in a 1px-gap grid; each card gets a hand-drawn inline SVG line icon with pathLength=100 whose ink strokes draw in on entry, plus one cyan detail stroke drawing after, staggered per card; end each card with a mono tag like "0 FICUS CASUALTIES". (2) THE trust moment: a full-bleed portrait photo of the robot's hand holding an egg, revealed by a slow focus-in (blur 22px to sharp, ~1.7s) beside force-control copy — 0.6 N egg grip, 2,000 force samples/s, zero cracked in 1.2M grips — with the caption "FIG. 02 — GRIP TEST, UNSTAGED. THE EGG WAS BREAKFAST." (3) A dark ink specs strip with mono count-up counters: 9 h battery, 15 kg payload, 31 dB, 1.4 m/s, footnoted "measured, not promised". (4) A calm, serious safety/privacy section: on-device processing, a physical camera shutter, hardware force limits, a mechanical off switch, annual public audits. (5) A mock reserve form ($149 refundable) that swaps to "Reserved ✓ — you're #4,182 in line" on submit.

Voice: warm-precise English. prefers-reduced-motion pre-applies all final states. Images lazy with real dimensions (hero eager). No horizontal overflow at 390px; zero console errors from file://.

## Assets

- `assets/unit.webp` (1920×1072) — the robot standing in a white studio, cyan visor bars
- `assets/hand.webp` (1400×1738) — articulated hand holding a brown egg, cyan wrist glow
- Generated with **Nano Banana 2 via Higgsfield MCP**, 2K renders, converted to WebP with **ffmpeg**
