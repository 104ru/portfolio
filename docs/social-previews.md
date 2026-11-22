# Shared-link previews

The portfolio and each local project have a 1200 × 630 JPEG share image built from the actual project artwork. Static Open Graph and Twitter large-image tags are embedded in each page's HTML, including demo entry points and direct routes. `docs/social-previews.json` defines the projects, images and page groups; `docs/social-metadata-coverage.json` lists every covered URL.

Lazy and Pleasant Street's production sites already have their own complete OG metadata and images. Their live services remain unchanged. The Lazy portfolio case study has its own portfolio preview.

To regenerate cards, serve `site/` locally and run `scripts/build-social-previews.cjs` with Playwright available (`PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` can select existing installations). Then run `python3 scripts/apply-social-metadata.py`. The Loomik build script reapplies share metadata after rebuilding its entry points.

The JPEGs are the maintained sharing assets, not backup copies. Temporary render previews are not committed.
