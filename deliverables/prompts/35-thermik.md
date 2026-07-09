# THERMIK — Gleitschirm-Flugschule in den Alpen

## Full Reproduction Prompt

Build a one-page showcase site for "THERMIK", a fictional paragliding school in the Swiss Alps, with an infinite cinematic flight hero in three.js.

Palette: dawn peach #FFC9A3, lavender haze #C9B8E8, ridge plum #5A4A6E, snow #FFF7F0, sky gradient from #B8A5DC at the top through #FFE3C2 to #FFC9A3 at the horizon. Fonts: Gabarito (bold friendly display) and Inter (body), via Google Fonts. No images.

Hero: a low-poly terrain flythrough at dawn. Use a plane of roughly 120 by 80 segments (70 by 46 on mobile), heights from four octaves of layered value noise with a smooth valley carved down the centre. De-index the geometry and colour each face by altitude: dark plum valleys, lavender mid-slopes, peach sunlit faces, warm snow caps, with jittered band thresholds. Flat shading, one Lambert material, no shadows. Two tiles leapfrog toward the camera and regenerate from a continuous world-space noise offset for a seamless endless flight. Warm fog matching the sky gradient's horizon tone, a glowing low-poly sun disk unaffected by fog, gentle camera bob, banking on mouse, and a tiny plum paraglider silhouette drifting ahead. On scroll, pitch the camera up into the sky and fade the transparent canvas into matching CSS gradient sections.

Sections styled as altitude bands: school intro with stats, three courses as ascending altitude tiers with prices, safety and instructors, tandem booking form, plum footer. Encouraging alpine copy, 60fps, pixel ratio capped at 2, static terrain under prefers-reduced-motion.
