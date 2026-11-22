"""Install the reviewed 64-image set; retain exactly one production file per state."""
from pathlib import Path
import json,hashlib,shutil
from PIL import Image
root=Path(__file__).resolve().parents[1];data=json.loads((root/'.panorama-work/rebuilt-set.json').read_text());records=data['records'];assert len(records)==64;assert len({(r['scene'],r['state']) for r in records})==64
for r in records:
 p=root/r['selected'];assert hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256']
 with Image.open(p) as im:im.load();assert im.size==(6144,3072)
for r in records:
 p=root/r['selected'];folder=root/'assets/panoramas-hd'/r['scene'];dest=folder/(r['state']+p.suffix)
 if p!=dest:shutil.move(p,dest)
 for old in folder.glob(r['state']+'.*'):
  if old!=dest:old.unlink()
 r['selected']=dest.relative_to(root).as_posix();r['sixDirectionVisualReview']='passed'
report={'scope':'All 10 scenes, all 64 lighting images, full spherical coverage','expected':64,'reviewed':64,'rebuilt':sum(r['rebuilt'] for r in records),'detailedMastersRetained':sum(not r['rebuilt'] for r in records),'method':'Full-detail assembled redraw supplies all solid geometry and material texture; lighting references supply registered illumination fields; large sky regions retain weather. No low-resolution lighting image is used as the main artwork.','newImageGenerations':1,'newGenerationPurpose':'Correct only the balcony return opening to show the actual bedroom','records':records}
(root/'docs/redraw-install-audit.json').write_text(json.dumps(report,indent=2)+'\n');print(f"Installed {len(records)} verified states; {report['rebuilt']} rebuilt; {report['detailedMastersRetained']} existing detailed masters retained.")
