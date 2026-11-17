# Dwellers case study and separate prototype

- `index.html`: case study using the actual local portfolio template.
- `prototype.html`: independent playable phone prototype.

## Template

`portfolio-template.css` is an unchanged copy of `/Users/sandy/Documents/ChatGPT/Portfolio/site/bigoil.css`.
`portfolio-opening.css` is an unchanged copy of that template’s `bigoil-opening.css`.
The page uses the same masthead, opening-title, project-facts, case-nav, stage-header, source-body, two-col and footer markup patterns. `dwellers-case.css` only handles exhibit-specific image grids, player charts and wireframes. The case-study page does not load the game script or embed the interactive app. There is one separate prototype link.

## Four sections

1. Why I made the game: selected motivation text from Sandy’s Steam Zoo executive summary.
2. Player profiles: Hunter, Creator and Spectator text and original spider charts from Dwellers.pdf.
3. Rules and wireframes: original game rules and newly drawn Creator/Hunter/Spectator flows; original site map as supporting material.
4. Final designs: original application and builder screens, followed by current prototype artwork.

Text receives light spelling/grammar corrections. The unfinished Hunter sentence is omitted. No research outcomes, performance statistics or test results are invented.

Sources: `/Users/sandy/Desktop/Dwellers.pdf` and `/Users/sandy/Documents/Steam Zoo/Research and Planning/Steam Zoo book and research - iCloud AAU Dwellers/book Folder/book.pdf`. The current-game collage comes from the existing local portfolio project materials. Browser prototype location and camera are simulated; session progress resets on reload.

## Verification

Compared both template CSS files byte for byte with the actual portfolio. Checked JavaScript syntax, local asset references, unique IDs, exactly four case sections, one prototype link and no embedded game. Browser-checked the desktop and 390px mobile layout, charts, all flow tabs and final designs. No horizontal overflow or broken images observed. Hosting identity remains in the separate Sites source checkout.

Preview: `python3 -m http.server 4181 --directory portfolio`.
