"""Package the browser POC from the selected production textures."""
from pathlib import Path
from PIL import Image
import json
import shutil

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'world/assets.json').read_text())
if manifest['missing']:
    raise ValueError('Cannot package an incomplete lighting set: ' + ', '.join(manifest['missing']))
dist = root / 'dist'
dist.mkdir(exist_ok=True)
shutil.copy2(root / 'index.html', dist / 'index.html')
for name in ['world/viewer.mjs', 'world/preview.css', 'world/time.mjs', 'world/life.mjs', 'world/life.json', 'world/cast-art.json', 'world/geography.json', 'viewer/pannellum.js', 'viewer/pannellum.css', 'viewer/COPYING', 'assets/fonts/Rye-Regular.ttf', 'assets/fonts/Rye-OFL.txt']:
    dest = dist / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / name, dest)
if (dist / 'assets/ui').exists():
    shutil.rmtree(dist / 'assets/ui')
shutil.copytree(root / 'assets/ui', dist / 'assets/ui')
if (dist / 'assets/dwellers').exists():
    shutil.rmtree(dist / 'assets/dwellers')
shutil.copytree(root / 'assets/dwellers', dist / 'assets/dwellers')
with Image.open(root / 'assets/ui/dwellers-chart-paper.jpg') as paper:
    paper.thumbnail((1600, 1600))
    paper.convert('RGB').save(dist / 'assets/ui/dwellers-chart-paper.jpg', 'JPEG', quality=85, optimize=True)
for scene in manifest['scenes'].values():
    for asset in scene['states'].values():
        source = root / asset['url']
        dest = dist / asset['url']
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists() or dest.stat().st_mtime < source.stat().st_mtime:
            if source.suffix in ['.webp','.avif']:
                shutil.copy2(source, dest)
            else:
                with Image.open(source) as image:
                    image.convert('RGB').save(dest, 'WEBP', quality=90, method=4)
        asset['url'] = dest.relative_to(dist).as_posix()
        asset['bytes'] = dest.stat().st_size
        preview = (dist / 'assets/map' / dest.parent.name / dest.name).with_suffix('.webp')
        preview.parent.mkdir(parents=True, exist_ok=True)
        if not preview.exists() or preview.stat().st_mtime < source.stat().st_mtime:
            with Image.open(source) as image:
                image.thumbnail((384, 192))
                image.convert('RGB').save(preview, 'WEBP', quality=82, method=4)
        asset['previewUrl'] = preview.relative_to(dist).as_posix()
(dist / 'world/assets.json').write_text(json.dumps(manifest, indent=2) + '\n')
wanted = {asset['url'] for scene in manifest['scenes'].values() for asset in scene['states'].values()}
for folder in ['assets/panoramas','assets/panoramas-hd']:
    for path in (dist / folder).rglob('*'):
        if path.is_file() and path.relative_to(dist).as_posix() not in wanted:
            path.unlink()
total = sum(p.stat().st_size for p in dist.rglob('*') if p.is_file())
print(f"Packaged {manifest['available']} lighting assets across 10 viewpoints; {total / 1024 / 1024:.1f} MiB browser release")
