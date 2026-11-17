#!/bin/sh
# Regenerates site/dh-map/html/manifest.js from the screen files present.
cd "$(dirname "$0")/site/dh-map/html" && printf "window.DH_HTML_SCREENS=[%s];\n" "$(ls *.html | sed 's/\.html$//' | grep -v '^manifest$' | sed "s/.*/'&'/" | paste -sd, -)" > manifest.js && cat manifest.js
