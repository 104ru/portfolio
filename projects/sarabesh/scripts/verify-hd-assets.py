"""Verify every selected production image, without relying on old upscale metadata."""
from pathlib import Path
from PIL import Image,ImageStat
import hashlib,json
root=Path(__file__).resolve().parents[1];manifest=json.loads((root/'world/assets.json').read_text());records=[];selected=set()
assert len(manifest['scenes'])==10 and manifest['available']==manifest['expected']==64 and not manifest['missing']
for scene,s in manifest['scenes'].items():
 for state,a in s['states'].items():
  p=root/a['url'];selected.add(p.resolve())
  with Image.open(p) as im:
   im.load();assert im.size==(6144,3072),(scene,state,im.size);rgb=im.convert('RGB');poles=[ImageStat.Stat(rgb.crop((0,y,im.width,y+8))).var for y in [0,im.height-8]];assert all(max(v)>0 for v in poles),(scene,state,'blank pole')
  sha=hashlib.sha256(p.read_bytes()).hexdigest();assert sha.startswith(a['revision'])
  records.append({'scene':scene,'state':state,'file':a['url'],'width':6144,'height':3072,'bytes':p.stat().st_size,'sha256':sha,'hasImageAtBothPoles':True})
actual={p.resolve() for p in (root/'assets/panoramas-hd').rglob('*') if p.is_file() and p.suffix in ['.webp','.avif','.png','.jpg']}
assert actual==selected,'Unselected or missing production images remain'
report={'viewpoints':10,'lightingAssets':len(records),'productionResolution':[6144,3072],'oneProductionImagePerState':True,'assets':records};(root/'docs/asset-verification.json').write_text(json.dumps(report,indent=2)+'\n');print('Verified all 64 selected images: exact selection, decode, dimensions, both poles and checksums.')
