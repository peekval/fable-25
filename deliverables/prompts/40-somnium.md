# SOMNIUM — a sleep & dream journal

## Full Reproduction Prompt

Build a one-page marketing site for SOMNIUM, a sleep and dream journal app, as a single self-contained HTML file (Google Fonts only; no images). Palette: dusk lavender #B9AEE0, drowsy peach #F5C9B0, deep-sleep indigo #232152, mist #E9E4F4, star glimmer #FFF3C9. Fonts: Fraunces for dreamy display headlines (italic accents), Albert Sans for body.

The hero is a surreal floating dreamscape with true depth: a fixed full-viewport scene of 5–6 parallax planes — twinkling starfield, a giant slow SVG moon with radial shading and craters, soft blurred SVG cloud blobs near and far, and floating SVG islands with tiny glowing windows. One rAF loop moves each plane by a different ratio of damped pointer position (lerp ~0.035, underwater-slow) plus scroll offset, so scrolling sinks the dreamscape upward. Give every plane its own slow drift or bob animation with mismatched durations and negative delays so nothing moves in sync. Add ~80 canvas fireflies on slow sine drift (40 on mobile) and occasional falling-star streaks. As the user scrolls, fade in a fixed indigo overlay so the palette deepens dusk-to-indigo like falling asleep.

Sections: how it works (three rituals), dream journal feature with sample half-awake entries, a genuinely usable 4-7-8 breathing widget (expanding orb, text cue, countdown), a science-of-sleep note, download CTA, footer. Barely-moving wavy SVG dividers between sections. Tender, unsappy copy. Transforms and opacity only, pause when hidden, full prefers-reduced-motion fallback with a static dreamscape and text-timed breathing.
