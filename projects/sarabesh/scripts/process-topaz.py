"""Package completed Topaz GUI exports without further altering their content."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
import argparse, json, time

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--watch', action='store_true')
args = parser.parse_args()
tasks = json.loads((root / 'docs/upscale-input-provenance.json').read_text())

def convert(task):
    name = task['scene'] + '--' + task['state']
    source = root / '.upscale/test' / (name + '-topaz-cgi-4x.png')
    dest = root / 'assets/panoramas-hd' / task['scene'] / (task['state'] + '.webp')
    if dest.exists(): return True
    if not source.exists() or time.time() - source.stat().st_mtime < 5: return False
    try:
        with Image.open(source) as image:
            if image.size != (7096, 3548): raise ValueError(f'Unexpected Topaz output size: {source} {image.size}')
            image.load()
            dest.parent.mkdir(parents=True, exist_ok=True)
            temporary = dest.with_suffix('.pending')
            image.convert('RGB').save(temporary, 'WEBP', quality=90, method=4)
            temporary.replace(dest)
        print('Packaged ' + name, flush=True)
        return True
    except (OSError, SyntaxError):
        return False

while True:
    with ThreadPoolExecutor(max_workers=2) as pool:
        done = sum(pool.map(convert, tasks))
    print(f'HD assets ready: {done}/{len(tasks)}', flush=True)
    if done == len(tasks) or not args.watch: break
    time.sleep(15)
