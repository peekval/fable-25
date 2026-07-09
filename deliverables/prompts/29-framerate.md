# FRAME:RATE — 7th Festival of Experimental Film

## Full Reproduction Prompt

Build a one-page website for FRAME:RATE, a fictional experimental film festival, as a single self-contained HTML file using three.js (UMD from a CDN) and Google Fonts only — no images. Palette: cinema black #0B0A0A background, projector white #F7F4EE text, amber lamp #FFB454 accents, deep curtain red #8E1F2F details. Type: Bebas Neue for huge marquee display words, Sora for body copy.

Signature technique: a scroll-driven cinematic dolly through 3D space. Render festival words and film titles as flat white planes using CanvasTexture text, scattered at drifted angles along a long Z-corridor, alongside thin white-bordered film-frame rectangles with sprocket holes. Map page scroll to camera Z with frame-rate-independent damped lerp; add slight banking on mouse X, fog for depth falloff, additive amber glow sprites, a cone of dust motes like a projector beam, and a very subtle vignette flickering at 24 steps per second. When the camera nears a section boundary, snap that zone's title into perfect flat alignment for reading (smoothstep lock-on), then fade it as the camera passes through.

Sync fixed HTML overlay sections to camera zones, crossfading so one is readable at a time: hero, program of four fictional experimental films with clever loglines, venues, ticket passes, credits footer. Keep 60fps: planes and sprites only, device pixel ratio capped at 2, fewer particles on mobile, pause when the tab is hidden. For prefers-reduced-motion, serve a static poster layout with all content readable and no tunnel. Mood: late-night projection booth — patient, warm, reverent about light.
