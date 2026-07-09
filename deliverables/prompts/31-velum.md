# VELUM — House of the Raised Curtain

## Full Reproduction Prompt

Build a single-file HTML showcase site for VELUM, an avant-garde theatre house. Palette: velvet crimson #7A1425, deep stage black #0D0709, gold trim #C9A55C, playbill cream #F0E8D8. Google Fonts: Italiana for theatrical display headings, Cinzel for letter-spaced small caps labels, Crimson Pro for literate body copy. No images, no libraries.

The hero is a real-time cloth-simulation curtain on a 2D canvas: two halves, each a grid of points (about 30×20 total, capped near 20×14 on mobile) pinned along the top, integrated with Verlet physics under a fixed-timestep accumulator — gravity plus a gentle two-octave sine wind so the crimson cloth ripples. Solve structural distance constraints in two iterations per frame. Render each grid cell as a filled quad shaded by its area ratio versus rest shape (compressed folds darken, stretched crests gain a warm sheen), multiplied by static per-column pleat stripes for a velvet feel. The cursor brushes the cloth, pushing nearby points. A centered ENTER button opens the curtain: top pins animate outward in a staggered wave from the center line, gathering into narrow stacks at the edges while a golden stage-light bloom reveals the content beneath. Honor prefers-reduced-motion with a statically painted open curtain.

Below: a season section with three playbill-styled cards (cream, double-ruled frames, gold-foil gradient shimmer on hover), a history of the house, a director's note set as a framed letter, ticket tiers, and a footer. A soft spotlight follows scroll to illuminate section headers. Mood: crimson dark, hushed, ceremonial — the moment before the reveal.
