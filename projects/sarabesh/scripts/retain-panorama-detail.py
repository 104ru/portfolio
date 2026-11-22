"""Retired residual-only lighting path: it lost medium-scale redraw detail.

Use rebuild-redrawn-lighting.py and inspect the full 64-image set before
installing it with install-verified-redraw-set.py. This guard prevents an
accidental return to low-resolution lighting images as the main artwork.
"""
if __name__ == '__main__':
    raise SystemExit('Retired: use scripts/rebuild-redrawn-lighting.py; preserve the full-detail master as the artwork.')
