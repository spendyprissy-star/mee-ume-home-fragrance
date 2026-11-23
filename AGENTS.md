# AGENTS.md

## Workspace & Commands
- **Build bundle**: `node build.mjs` (or `npm.cmd run build`; PowerShell `npm` may be blocked by execution policy—use `npm.cmd`). Bundles `src/main.js` via `esbuild` into an IIFE at `dist/advert.bundle.js` so `index.html` runs both over HTTP and directly via `file://`.
- **Local preview server**: `node server.mjs` (serves on `http://127.0.0.1:4173`).
- **Entrypoints**:
  - `index.html`: Interactive player shell (`9:16` / `16:9` switcher, 10-step scrubber, `3D Inspect` orbit mode, `.webm` video exporter).
  - `src/products/textures.js` & `src/products/meeUmeBox.js`: Procedural Canvas2D textures and Three.js 3D packaging/bottle/floral geometry.
  - `src/scene/environment.js` & `src/scene/timeline.js`: 42-second 10-step choreography and interior props.
  - `src/overlay/hudRenderer.js` & `src/audio/soundtrack.js`: Synced 2D typography/icon/promo HUD canvas and Web Audio soundtrack.
- Reference product images were provided in chat rather than saved on disk.

## Product Reference Constraints (Do Not Alter)
Both **Mee Ume™ Home Fragrance** variants share the same packaging silhouette and must stay visually consistent with the reference images:
- **Brand & Tagline**: `Mee Ume™` / `HOME FRAGRANCE` — `"A touch of calm in every space."`
- **Packaging**: Clear transparent rectangular display box with circular `MU` seal at top center, arched cream inner backing card (`Mee Ume™` / `Indoor Fragrance Creation Room`), and a scalloped cream/ivory die-cut lower paperboard sleeve.
- **Diffuser Hardware**: Short rounded clear-glass apothecary bottle seated in a black base ring, flared glass rim, flat-top cylindrical natural light-wood cap, and vertical natural wood reeds positioned behind the left floral arrangement.
- **Shared Box Copy**: `Flameless Aromatherapy` above `French fragrance | Master perfumer`.
- **Variant 1 — `Desert Water`**: Subtitle `Essential Oil Diffuser`; light sky-blue hydrangea blossoms inside; lower sleeve has cream and warm taupe-gold daisy-style floral prints.
- **Variant 2 — `Solitary Oriental`**: Subtitle `Lavender`; large purple blossom with cream stamen center plus purple lavender sprigs inside; lower sleeve has purple lavender sprig prints.

## Advert & Promo Requirements
- **Formats**: Support both **9:16** vertical (TikTok / Reels / WhatsApp Status) and **16:9** landscape (web / presentation), ~30–45s total pacing.
- **Visual Direction**: Warm cream/beige luxury interiors, marble surfaces, soft sunlight, translucent fragrance light waves (not heavy smoke/cartoon effects), calm piano/ambient audio tone.
- **Key Features**: `Long-lasting Fragrance`, `Flameless & Safe`, `Elegant Décor`, `Perfect for Home & Office`.
- **Offer**: **25% discount — 2 diffusers for GH₵300**.
