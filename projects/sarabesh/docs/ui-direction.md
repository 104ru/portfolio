# POC interface direction

The world fills the viewport. No header, footer, inventory or dashboard.

Palette sampled from the supplied artwork: aged brass #93632f, brass highlight #e2bf70, worn teal #293a38, dark iron #192322, rusted wood #563b27, engraved ivory #e9d6ae.

Rye, already used in Sandy’s Dwellers source, is the entrance-name display face. Georgia provides readable engraved control labels; system type is reserved for status/help text. The font’s OFL license is preserved.

The opening nameplate sits low over the rocket floor so the large exterior viewport remains visible. An actual-looking brass handle enters the world. It is an introductory overlay, not permanent page chrome.

Persistent controls occupy the lower corners: engraved map cap and two-position indoor light lever on the left; compact rotary time knob on the right. The time knob expands into a five-position radial dial: Auto, Morning, Day, Evening, Night. Selection is functional, keyboard accessible and indicated by both the pointer position and checked state. Auto follows fixed visitor-local time ranges. Manual selection overrides it.

The material treatment belongs to the scene: weathered brass bevels, restrained patina, mechanical stops and fastening screws. No extra decorative meters, gear clusters or animated scenery. Navigation dots retain their small pulse, with reduced-motion support.

Other doors and stairs remain scenery for future expansion. The POC keeps exactly ten viewpoint nodes.

The retained Pannellum 2.5.6 engine is used without explicit pitch crop bounds for full-sphere scenes. In this version, explicit -90/+90 bounds limit the viewport edges and prevent the camera center from reaching the poles; leaving those optional crop bounds unset permits looking directly up and down.

## Demo polish, 2026-11-21

The actual Dwellers bezel and chart-paper assets are reused unchanged in assets/ui. On/Off text and floating time labels are removed. The time stops use brass clock, rising sun, sun, setting sun and moon symbols with accessible names/tooltips. The traveller’s chart has ten porthole views, curved ink routes, a current-position marker and visited stamps. All ten places support direct travel by click or keyboard. No underlined links or new dashboard.

## Larger instruments and travel motion

Persistent map/time controls are displayed at 1.4× their previous scale, and the chart can expand to 1280 pixels. The light switch uses two matching transparent illustrated states generated from the Dwellers bezel reference, saved as lossless WebP. Both are preloaded to avoid a blank frame when toggling. The previous CSS lever and unused bronze texture are removed.

Travel turns toward the selected hotspot and approaches it for 300 ms, crossfades scenes for 440 ms and settles into the arrival view. Map travel uses the same forward glide without steering toward an unrelated doorway. Scene lighting changes keep the camera still with a short 180 ms dissolve. Reduced-motion preferences disable camera travel and fades. Input is guarded until the transition finishes.

## Visible travel markers and illustrated instruments

Travel is the sole neon accent: lime #83ff00 with a pale luminous core, dark green edge #112c16 and an expanding ring. The core remains visible throughout a 1.65-second pulse. Destination plates use forest enamel #14281f, brass #e2bb70 and ivory #f1d89d with centered 20-pixel Georgia lettering. They sit above the marker, move below it near the top edge, and remain within the viewport horizontally. This is a navigation cue requested by Sandy; do not spread the neon treatment to other controls.

Map, time-selector face, rotating hand and entry handle use native illustrated image artwork matching the approved light switch. The five time icons are integrated into one dial image with the interactive stops and hand registered to the painted symbol positions. The actual HTML radio controls stay as transparent interactive areas. Keep one final asset per function and remove generation/build copies after publication.
