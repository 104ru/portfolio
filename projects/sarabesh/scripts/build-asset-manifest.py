from pathlib import Path
from PIL import Image
import json, hashlib

root = Path(__file__).resolve().parents[1]
geography = json.loads((root / 'world/geography.json').read_text())
periods = ['morning', 'day', 'evening', 'night']
result = {'version': 1, 'scenes': {}, 'expected': 0, 'available': 0, 'missing': []}
for scene in geography['scenes']:
    scene_id = scene['id']
    indoor = scene['environment'].startswith('interior')
    windowless = scene['environment'] == 'interior-windowless'
    linked_light = {'landing': 'rocket-exit', 'window': 'apartment'}.get(scene_id)
    expected = ['light-off', 'light-on'] if windowless else [p + '-' + l for p in periods for l in ['off', 'on']] if indoor or linked_light else periods
    assets = {}
    for state in expected:
        path = root / 'assets/panoramas' / scene_id / (state + '.png')
        if linked_light and state.endswith('-on'):
            path = path.with_name(state.removesuffix('-on') + '.png')
        if scene_id == 'town' and state == 'night':
            repaired = path.with_name('night-seam-fixed.png')
            if repaired.exists():
                path = repaired
        corrected = path.with_name(path.stem + '-corrected.png')
        if corrected.exists():
            path = corrected
        result['expected'] += 1
        hd = root / 'assets/panoramas-hd' / scene_id / (state + '.webp')
        avif = hd.with_suffix('.avif')
        selected = avif if avif.exists() else hd if hd.exists() else path
        if selected.exists():
            with Image.open(selected) as image:
                width, height = image.size
                if width != height * 2:
                    raise ValueError(f'{selected}: expected 2:1 equirectangular image; got {width}x{height}')
                if selected in [hd,avif] and (width, height) not in [(7096, 3548), (6144, 3072)]:
                    raise ValueError(f'Invalid HD panorama: {hd}')
            assets[state] = {'url': selected.relative_to(root).as_posix(), 'width': width, 'height': height, 'revision': hashlib.sha256(selected.read_bytes()).hexdigest()[:12]}
            if selected in [hd,avif]:
                assets[state]['enhancement'] = 'Full-detail assembled redraw; structure-preserving lighting' if (width, height) == (6144, 3072) else 'Topaz Gigapixel AI 7.3.2; Art & CG 4x'
            result['available'] += 1
        else:
            result['missing'].append(scene_id + '/' + state)
    result['scenes'][scene_id] = {'windowless': windowless, 'indoor': indoor, 'linkedLightScene': linked_light, 'states': assets}
(root / 'world/assets.json').write_text(json.dumps(result, indent=2) + '\n')
print(f"{result['available']}/{result['expected']} lighting assets available across {len(result['scenes'])} viewpoints")
