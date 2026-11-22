# Portfolio demos

All public portfolio demonstrations are maintained in this repository and published from `site/` to `https://sandy.tayts.com` by the existing main-branch workflow.

| Demo | Maintained public path |
| --- | --- |
| Sarabesh | `/sarabesh/` |
| Frey storefront | `/frey/` |
| Looped In | `/looped-in/` |
| Looped In wireflows | `/looped-in/wireflows.html` |
| Loomik floating workspace | `/loomik/?demo=floating` |
| Loomik original prototype | `/loomik-classic/` |
| Rancourt storefront | `/rancourt-store/` |
| EY Digital Hub wireflows | `/dh-map/wireflows.html` |
| Dwellers browser prototype | `/dwellers/prototype.html` |
| Early AI gallery and original world | `/early-ai/` and `/early-ai/tour/` |
| Noah illustrated book | `/noah.html` with assets in `site/noah-book` |
| No Grounds for Panic book | `/panic.html` with assets in `site/panic-book` |

The existing case studies, shared styles, illustrations, diagrams and book readers remain in `site/` at their established paths. Lazy, Pleasant Street, and real external services are not migrated or retired.

## Maintenance

- Edit Frey and Looped In directly in their `site/` folders: these are the complete browser demo sources.
- Loomik application sources live in `projects/loomik` and `projects/loomik-classic`. Run `python3 scripts/build-loomik-demos.py` after source changes. The build preserves direct-route entry pages for static hosting.
- Sarabesh runtime and selected assets have one maintained location, `site/sarabesh`. Production tools and verification history are in `projects/sarabesh`, linked to those files without a second asset copy.
- Commit and push main to update the portfolio domain. Do not deploy duplicate standalone sites.
