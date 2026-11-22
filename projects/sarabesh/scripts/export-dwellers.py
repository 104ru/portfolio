"""Export existing Dwellers artwork with poses from its native CharacterLayout."""
from pathlib import Path
from PIL import Image,ImageOps,ImageChops,ImageDraw
import json,sys
source=Path(sys.argv[1]);layouts=json.loads(Path(sys.argv[2]).read_text());out=Path('assets/dwellers');out.mkdir(parents=True,exist_ok=True);metadata={};sheet=Image.new('RGB',(1200,900),'#25362d')
for i,entry in enumerate(layouts):
 body=Image.new('RGBA',(640,800));eyes=Image.new('RGBA',(640,800));eye=None
 for p in entry['poses']:
  art=Image.open(source/'PartsV2'/p['file']).convert('RGBA');art=art.resize((max(1,round(p['width']*2)),max(1,round(p['height']*2))),Image.Resampling.LANCZOS)
  art=art.rotate(-p['rotation'],resample=Image.Resampling.BICUBIC,expand=True)
  if p['mirrored']:art=ImageOps.mirror(art)
  dest=eyes if p['category']=='sensor' else body
  dest.alpha_composite(art,(round(p['x']*2-art.width/2),round(p['y']*2-art.height/2)))
  if p['category']=='sensor':eye=(p['x']*2,p['y']*2)
 complete=Image.alpha_composite(body,eyes);bounds=complete.getchannel('A').point(lambda x:255 if x>8 else 0).getbbox();l,t,r,b=bounds;l=max(0,l-4);t=max(0,t-4);r=min(640,r+4);b=min(800,b+4);bounds=(l,t,r,b)
 key=entry['id'];body=body.crop(bounds);eyes=eyes.crop(bounds);complete=complete.crop(bounds)
 body.save(out/(key+'-body.webp'),quality=94,method=6);eyes.save(out/(key+'-eyes.webp'),quality=96,method=6)
 metadata[key]={'aspect':body.width/body.height,'eyeX':(eye[0]-l)/body.width,'eyeY':(eye[1]-t)/body.height,'body':(out/(key+'-body.webp')).as_posix(),'eyes':(out/(key+'-eyes.webp')).as_posix()}
 complete.thumbnail((270,270));x=(i%4)*300+(300-complete.width)//2;y=(i//4)*300;sheet.paste(complete,(x,y),complete);ImageDraw.Draw(sheet).text(((i%4)*300+15,y+278),key,fill='#e6cc90')
Path('world/cast-art.json').write_text(json.dumps(metadata,indent=2)+'\n');sheet.save('.life-work/cast-review.jpg',quality=94)
Path('docs/dwellers-art-source.json').write_text(json.dumps({'source':'Existing Dwellers PartsV2 artwork, read without modifying its working tree','layout':'DwellersCore.CharacterLayout exported from the current native source','recipes':[{k:v for k,v in e.items() if k!='poses'} for e in layouts],'output':'assets/dwellers; separate chassis and eye layers for blinking and night illumination','newImageGenerations':0},indent=2)+'\n')
