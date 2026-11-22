# Sarabesh — exploration POC

[Open the private browser world](https://explorable-world-poc.sandy-tayts.chatgpt.site) · [Editable Lucid geography](https://lucid.app/lucidchart/bd3546ab-00d8-4644-b79e-9062362b66d9/edit)

A ten-viewpoint panorama world based on Sandy’s original artwork and Pannellum viewer. Sarabesh is the desert city in the future game The Last Electrician.

## Included

- Eight polished existing viewpoints, a new rocket exit room with a visible landscape, and a landing ground adapted from the original desert source.
- Full 360° × 180° scene coverage, including direct up/down viewing.
- 64 lighting assets: four times of day, independent indoor light on/off states, and matching views through the rocket and apartment windows.
- A skippable animated rocket arrival, large Sarabesh title and exploration-only introduction; small illustrated instruments, fullscreen and an exploration guide.
- Auto time follows the visitor’s clock: morning 06:00–10:00, day 10:00–18:00, evening 18:00–21:00, night 21:00–06:00. Manual dial positions override Auto.
- An illustrated chart with ten clickable portholes and curved routes. Visited views are clear; unvisited views are shadowed. Each visited location has a separate brass information button that reopens its journal description. First entrances show that description once. Choose any porthole to travel.
- Desktop and landscape mobile layouts. Landscape lock is requested where supported; a rotate prompt handles unsupported portrait cases.

The POC has no game objects, inventory, puzzles, animated scenery or audio. Existing extra doors and stairs remain available for later expansion. Headset rendering is a later step; scene data and full-sphere artwork are kept separate from the current browser renderer.

## Source layout

- `index.html`, `world/viewer.mjs`, `world/preview.css`: current browser POC.
- `world/geography.json`: the ten viewpoints and nine two-way connections.
- `world/assets.json`: the complete selected lighting-state manifest.
- `assets/panoramas-hd/`: 6,144 × 3,072 assembled redrawn production textures.
- `docs/upscaling.json`: exact enhancement settings and provenance.
- `docs/generation/`: exact prompts and built-in image-generation provenance.
- `docs/qa/`: the enlarged before/after resolution comparison.
- `sources/manifest.json`: historical source provenance and checksums; redundant archives were removed.
- `viewer/`: the retained Pannellum engine and license.

## Run and package

Run `python3 -m http.server 8000` from this repository and open `http://localhost:8000/`.

With Pillow installed, run `python3 scripts/build-asset-manifest.py` and `python3 scripts/build-release.py` to create the optimized static release in ignored `dist/`. The manifest prefers the completed HD WebP textures; chart thumbnails remain small so the map loads promptly. Deployment metadata is in `.openai/hosting.json`.

## Verification and limits

All 18 directed travel paths were exercised in the browser. Auto/manual time, indoor lights, visited-map behavior, keyboard controls and desktop/landscape layouts were checked. All 64 selected image files are present, decode, have a 2:1 ratio and contain image content at both poles. Ten masters were inspected as six spherical views each. Four night light-off states received focused corrections to preserve the exterior sky.

Registered view redraws are assembled into 6,144 × 3,072 spheres. Native lighting variations retain the assembled master’s finer spatial detail; see `docs/redraw-method.md` for the distinction between generated and assembled resolution. Generated microdetails and exposure can vary between lighting states. Physical-device headset testing remains future work.

The Sarabesh demo flow was tested in Chrome: landing completion and skip, reduced motion, first-entrance notes, discovery shading, information without travel, return visits, fullscreen, persisted discoveries and landscape mobile. Results are recorded in `docs/demo-verification.json`.

## Sources and rights

Original portfolio: https://github.com/liza-bam/portfolio. The project was built from Sandy’s actual working tree without changing the portfolio. Superseded PNGs, duplicate source archives, temporary Topaz exports and local deployment staging are removed after delivery; the working tree keeps one final production texture set.

Sandy’s original artwork is retained for this project; no new artwork license is asserted. Pannellum’s license is preserved in `viewer/COPYING`. The reused Rye font’s OFL license is in `assets/fonts/Rye-OFL.txt`.
