# The Museum of Lost Things — Hall of Ephemera

## Full Reproduction Prompt

Build a single-page dark-academia digital museum called "The Museum of Lost Things — Hall of Ephemera," a candlelit catalogue of four obsolete objects: the card catalog, the public telephone box, the compact cassette, and the paper road map.

Palette: near-black ink #23201B page background (deeper variant #1B1815), warm parchment #E9E2D0 text, oxblood accents #5C1F1F (bright variant #7A2C2C), antique brass #9C7C46 for rubrics and hairline rules. Typography: Playfair Display (medium italic) for display headings and drop caps, EB Garamond for body prose, IBM Plex Mono for catalogue numbers, rubrics, dates, and footnote markers.

Signature technique: each exhibit is a light parchment "museum plate" card carrying a hand-drawn engraving built entirely from inline SVG strokes. Give every path a pathLength of 1 with the dash fully offset, then transition the offset to zero when an IntersectionObserver marks the plate as seen, staggering stroke groups with per-element delay variables so each illustration draws itself line by line. Layer two fixed radial-gradient candle glows that flicker on a slow opacity-and-scale keyframe loop, plus a fixed vignette and repeating-gradient page-edge textures. Plates sit in a two-column grid with even cards offset downward; hovering lifts a plate and unfolds a hidden monospace acquisition note via a grid-rows zero-to-one transition.

Sections in order: entrance-hall hero (mono kicker, italic title, fleuron, descend thread), Permanent Collection of four plates with footnote superscripts, Curator's Note blockquote, Marginalia footnotes with target highlighting and return links, Visitor Book footer on ruled-paper background with colophon.

Copy: elegiac, literary museum-label prose. Under prefers-reduced-motion render everything settled and static; keep it library-free with one tiny observer script.
