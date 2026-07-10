# FABLE/25

**Live: [25-by-fable.netlify.app](https://25-by-fable.netlify.app)**

A showcase of **64 single-file demo websites**, each a fictional brand with its own art direction and one signature technique — WebGL shaders, canvas simulations, scroll choreography, generative art, soft-body physics, raymarching, holographic foil, cloth simulation, and more.

Every site is one self-contained `index.html`. No build step, no frameworks (three.js via CDN where it earns its place).

## Explore

| | |
|---|---|
| 🏛 **Gallery hub** | [`/`](https://25-by-fable.netlify.app/) — all 64 sites in five waves |
| 💎 **Signature Collection** | sites 49–58 — ten flagship builds combining three signature techniques each (living ocean, self-engraving guilloché, WebGL gem dispersion, altitude-driven pages …) |
| 📖 **Global guide** | [`/guide`](https://25-by-fable.netlify.app/guide/) — how the collection was made |
| 🔬 **Per-site guides** | every site links to `NN-name/guide/` with a technique breakdown and a full reproduction prompt |

## Reproduction prompts

Each site can be rebuilt from a single prompt. They live in two places:

- embedded in every per-site guide page (`public/NN-name/guide/index.html`)
- as standalone markdown in [`deliverables/prompts/`](deliverables/prompts/) — one file per site

## Generated assets

Select sites carry AI-generated imagery and ambient video loops (30 stills, 5 loops), produced with **Nano Banana 2** (text-to-image) and **Kling 3.0 Turbo** (image-to-video) via the Higgsfield MCP, palette-locked to each site's design tokens and optimized with ffmpeg (WebP ≤1920px; h264 CRF 26 crossfade self-loops ≤600 KB). Sites whose concept is explicitly code-only (e.g. MONSOON, VELUM, MAGNITUDE) stay 100% hand-drawn.

## Quality bar

- `tools/audit.js` — fleet audit: page errors, console errors, load time, rAF-FPS proxy, horizontal overflow at 390px
- `tools/stress-audit.js` — full scroll sweeps, interaction clicks, resize cycles, blank-screen detection
- every animation honors `prefers-reduced-motion`; WebGL sites ship non-GL fallbacks; videos pause offscreen

Current status: **0 findings across all 64 sites.**

## Structure

```
public/
  index.html            gallery hub
  guide/                global making-of
  NN-name/
    index.html          the site (single file)
    guide/index.html    technique guide + repro prompt
    assets/             generated imagery (where applicable)
deliverables/prompts/   64 standalone reproduction prompts
tools/                  audit tooling (playwright)
```

---

Built with [Claude Code](https://claude.com/claude-code). Deployed on Netlify.
