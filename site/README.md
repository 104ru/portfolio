# Shared portfolio styling

Typography and component rules are defined in `portfolio-template.css` and documented in [STYLE-GUIDE.md](STYLE-GUIDE.md). Both active pages load this shared stylesheet last. Use these styles for all future changes.

# Portfolio visual homepage

Responsive visual draft of the approved editorial homepage. Open `index.html`, or serve this directory with `python3 -m http.server 8045 --directory site` from the repository root.

- Google Fonts: Newsreader and Public Sans.
- Real project imagery and screenshots; no image desaturation, opacity treatment, or color filters.
- Screenshots exported as RGB / sRGB WebP; original PNG captures retained.
- Book covers use the front panels cropped from the supplied full-wrap covers.
- Project pairs share grid rows on desktop and stack on mobile.
- Book cover buttons open accessible native dialogs.
- External project links point to their existing sites. Big Oil now links to the local results-first case study, `bigoil.html`.
- Dwellers artwork comes from the supplied local project. Its public case URL is not yet available.

Sources: lazy.vacations, pleasant.vacations, liza-bam.github.io/rancourt-shopify, liza-bam.github.io/loomik-app, the archived sandyux.com Big Oil case, the local Dwellers portfolio, and the supplied book covers.

## Big Oil case study

Open `bigoil.html` directly. The results cards are followed by the original Empathize, Define, Ideate, Plan, Develop and Adopt sequence, with research, profiles, journeys, blueprints, planning, development, testing, measurement and adoption grouped as in the source. Source narrative and the five-column measurement table are native HTML. Original RGB diagrams link to their full-size files. Profiles and all six process blueprints remain visible.

Desktop uses the original two-column compositions; mobile reorders business research evidence and stacks profiles and deliverables. The source typefaces are Google Fonts Abel, Roboto and Roboto Condensed; the retained opening uses Public Sans and Abel. Dense workshop and functional-flow diagrams have local horizontal scrolling.

Verified in Chrome at 320, 390, 430, 768, 1024 and 1440px: no page overflow, missing images or JavaScript errors. Screenshots are in `output/bigoil/`. This is local, not published to sandyux.com.
