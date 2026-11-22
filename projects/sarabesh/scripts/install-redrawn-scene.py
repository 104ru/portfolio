"""Install a reviewed complete state set without retaining backup copies."""
from pathlib import Path
from PIL import Image
import sys,json,shutil
root=Path(__file__).resolve().parents[1];scene=sys.argv[1];state=sys.argv[2];master=root/sys.argv[3];folder=root/'.panorama-work/final'/scene;folder.mkdir(parents=True,exist_ok=True)
expected=set(json.loads((root/'world/assets.json').read_text())['scenes'][scene]['states'])
assert {p.stem for p in folder.glob('*.webp')}|{state}==expected
for p in list(folder.glob('*.webp'))+[master]:
 with Image.open(p) as im:im.load();assert im.size==(6144,3072)
if master.resolve()!=(folder/(state+'.webp')).resolve():shutil.move(str(master),folder/(state+'.webp'))
for p in folder.glob('*.webp'):shutil.move(str(p),root/'assets/panoramas-hd'/scene/p.name)
progress=root/'docs/redraw-progress.json';d=json.loads(progress.read_text());d['productionRedrawScenes']=sorted(set(d['productionRedrawScenes'])|{scene});d['published']=False;progress.write_text(json.dumps(d,indent=2)+'\n')
print(f'Installed {scene}: {len(expected)} redrawn states')
