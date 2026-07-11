# MIRA — Alltag, ehrlich schön.

## Full Reproduction Prompt

Build a one-page personal-brand site for a fictional German lifestyle creator: MIRA — "Alltag, ehrlich schön." One self-contained HTML file (Google Fonts allowed, no JS libraries; local assets assets/portrait.webp 1400×1867 editorial portrait against terracotta, assets/kitchen.webp 1600×1067 filming at a kitchen counter). All copy in warm German du-Form — honest, unpolished charm ("Kein Filter-Theater. Versprochen.").

Palette: cream #FAF5EE background (#F3EADD tint), terracotta #D97D5A, rust #B5542F (deep #8F3E1F), soft brown ink #3A322C — never pure black. Generous rounded shapes: 22–44px radii, pill buttons, the portrait in an organic blob border-radius (44% 56% 52% 48% / 42% 44% 56% 58%) with a 4°-rotated terracotta outline echo and a hand-written circular sticker badge ("seit 2021 online ♥"). Fonts: Bricolage Grotesque 800 for display/numbers/buttons, Karla for text, Caveat only for tiny handwritten notes.

Signature motif: one hand-drawn SVG squiggle (three soft S-curves, stroke 7, round caps) repeated five times — under "ehrlich" in the hero headline, in each format card, in the contact block. It draws itself via stroke-dasharray/offset: JS measures getTotalLength() once, writes it as a CSS var, and an IntersectionObserver flips a class that transitions the offset to 0 in .8s. Inline the path five times — CSS selectors cannot style `<use>` shadow content. Under prefers-reduced-motion the squiggles sit fully drawn (offset 0 !important) and everything else is static.

Sections: (1) Hero — headline "Alltag, ehrlich schön.", du-Form intro, two pill CTAs plus a Caveat "PS: Runterscrollen lohnt sich ↓", portrait right (eager, fetchpriority high); below, a 3-up follower strip with count-up counters: Instagram 480k, TikTok 1,2M, YouTube 96k (German decimal comma, cubic-out rAF). (2) Formate — three playful cards (Kochen ohne Rezept / 5-Minuten-Ordnung / Ehrliche Empfehlungen) with numbered chips, per-card cream tints, a squiggle divider, weekday tags, and pointermove tilt (±7°/8°, children on translateZ; fine pointers only). (3) Media-Kit — a big rust rounded panel addressing brands: count-up stats (8,4 Mio. Reichweite, 7,2 % Engagement, 72 % weiblich, DACH), Zielgruppe as four mini bars (widest = 100%, width animates on view), CTA "Media-Kit anfragen". (4) Behind the scenes — kitchen.webp full-bleed (lazy, real dims) with a cream caption card sitting on the photo. (5) Kooperationen — five fictional text-logo rows (HAFERGLÜCK, Studio Lehm, NORDWIND KÜCHE, blattwerk., Kiesel & Co) with hover fill, plus one testimonial blockquote. (6) Kontakt — centered newsletter mock whose submit shows a handwritten demo confirmation, plus a mailto line.

Motion: exactly one easing, cubic-bezier(.25,.8,.3,1), quick reveals (.55s, 70ms stagger), the squiggle draw as the only flourish. Fixed "← 25" pill to the hub, footer "guide & prompt →". html/body overflow-x clip; scrollWidth ≤ 392 at 390px; zero console errors from file://.

## Asset credits

Both photos generated with Soul 2.0 portraits via the Higgsfield MCP (fictional person; editorial prompts against terracotta / kitchen afternoon light), converted to WebP with ffmpeg — portrait.webp 1400×1867 (~124 KB, eager), kitchen.webp 1600×1067 (~88 KB, lazy), both with real width/height attributes.
