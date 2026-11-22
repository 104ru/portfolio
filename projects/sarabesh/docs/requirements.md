# Agreed requirements

- Build the background world for a future game using Sandy’s existing visuals and JavaScript viewer as the starting point.
- Start in a rocket exit room; landscape must be clearly visible outside.
- This is a ten-viewpoint proof of concept, expandable later through the existing doors and stairs. Ten fixed viewpoints for V1. Free looking includes up, down and all horizontal directions; move between viewpoints, not freely through 3D geometry.
- Target full spherical 360 by 180 degree panoramas. Existing 2:1 image dimensions do not establish complete image coverage; several sources contain black areas.
- Preserve the shown visual style. One focused polish pass on existing scenes establishes the direction for remaining work; no batches of competing takes.
- Outdoors have morning, day, evening and night variants.
- Match visitor-local time immediately in V1 with fixed ranges: morning 06:00–10:00; day 10:00–18:00; evening 18:00–21:00; night 21:00–06:00. No sunset calculation or geolocation.
- Interior light switches work in all interiors. One artificial light per interior for now. Windowed interiors preserve outside daylight independently of the light switch.
- Paris idea dropped by Sandy. No Paris assets, map entry or travel route.
- Full-screen scene; no headers or footers. An initial nameplate and brass entry handle, tiny map control, two-position indoor light lever and five-position time dial (Auto, Morning, Day, Evening, Night). Navigation hotspots use pulsing dots.
- Map displays all ten places as clickable porthole previews, with curved routes, current location and visited marks. Direct map travel was requested for the demo.
- Browser first, including mobile touch. Landscape lock where supported and rotate prompt elsewhere; headset support remains an architectural consideration for later.
- No sound yet. No game objects or animated scenery yet. Reserve extension points without adding inventory, dashboard items or other controls.
- Current requested delivery: polish existing scenes, create the rocket exit room and remaining scenery, and deliver full panoramas and the agreed lighting states. No game objects, scene animation or audio.
