"""Rebuild lighting from the selected full-detail redraw, never from enlarged lighting artwork.

The existing lighting image supplies only an illumination field. All solid geometry,
material edges and texture come from the assembled scene master. Sky/weather is
kept in large sky regions, not transferred onto blue books or painted machinery.
Outputs are staged for full-set inspection before installation.
"""
from pathlib import Path
from collections import deque
import json,hashlib,sys
import numpy as np
from PIL import Image,ImageFilter,ImageDraw

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.panorama-work'
MANIFEST=json.loads((ROOT/'world/assets.json').read_text())
MASTERS={scene:('light-on' if s['windowless'] else 'night-on' if scene=='landing' else 'day' if scene=='town' else 'day-on') for scene,s in MANIFEST['scenes'].items()}

def sky_region(image):
    small=np.asarray(image.resize((768,384)),dtype=np.float32)
    blue=(small[:,:,2]>small[:,:,0]+12)&(small[:,:,2]>small[:,:,1]+6)
    visited=np.zeros(blue.shape,dtype=bool);keep=np.zeros_like(blue)
    for y,x in zip(*np.where(blue)):
        if visited[y,x]:continue
        queue=deque([(int(y),int(x))]);visited[y,x]=True;component=[]
        while queue:
            yy,xx=queue.popleft();component.append((yy,xx))
            for ny,nx in [(yy-1,xx),(yy+1,xx),(yy,xx-1),(yy,xx+1)]:
                if 0<=ny<384 and 0<=nx<768 and blue[ny,nx] and not visited[ny,nx]:visited[ny,nx]=True;queue.append((ny,nx))
        if len(component)>=150:
            for yy,xx in component:keep[yy,xx]=True
    mask=Image.fromarray((keep*255).astype('uint8')).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
    return np.asarray(mask.resize(image.size,Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(1)),dtype=np.float32)/255

def relight(structure,reference,target,sky):
    size=structure.size;small=(1536,768)
    source=np.asarray(reference.resize(small).filter(ImageFilter.GaussianBlur(2)),dtype=np.float32)+8
    light=np.asarray(target.resize(small).filter(ImageFilter.GaussianBlur(2)),dtype=np.float32)+8
    gain=np.clip(light/source,.035,5)
    channels=[Image.fromarray(gain[:,:,c]).resize(size,Image.Resampling.BILINEAR) for c in range(3)]
    base=np.asarray(structure);old=np.asarray(target);result=np.empty_like(base)
    for row in range(0,size[1],128):
        end=min(size[1],row+128);g=np.stack([np.asarray(c.crop((0,row,size[0],end))) for c in channels],axis=2)
        pixels=np.clip((base[row:end].astype(np.float32)+8)*g-8,0,255)
        mask=sky[row:end,:,None]
        result[row:end]=np.clip(pixels*(1-mask)+old[row:end]*mask,0,255).astype('uint8')
    return Image.fromarray(result)

if __name__=='__main__':
    selected_scene=sys.argv[1] if len(sys.argv)>1 else None
    previous=WORK/'rebuilt-set.json'
    records=[r for r in json.loads(previous.read_text())['records'] if r['scene']!=selected_scene] if selected_scene and previous.exists() else []
    for scene,states in MANIFEST['scenes'].items():
        if selected_scene and selected_scene!=scene:continue
        master_state=MASTERS[scene];master_path=ROOT/states['states'][master_state]['url']
        reference=Image.open(master_path).convert('RGB')
        corrected=WORK/'masters'/f'{scene}-{master_state}.webp'
        structure=Image.open(corrected).convert('RGB') if corrected.exists() else reference
        sky=sky_region(structure);folder=WORK/'rebuilt'/scene;folder.mkdir(parents=True,exist_ok=True)
        for state,asset in states['states'].items():
            original=ROOT/asset['url'];target=Image.open(original).convert('RGB')
            if state==master_state and not corrected.exists():
                output=original;rebuilt=False
            else:
                image=structure if state==master_state else relight(structure,reference,target,sky)
                opening=WORK/'masters/window-opening-mask.png'
                if scene=='window' and state!=master_state and opening.exists():
                    period=state.split('-')[0];on=state.endswith('-on')
                    levels={'morning':(.95,.7),'day':(1,.82),'evening':(.92,.5),'night':(.86,.22)}
                    strength=levels[period][0 if on else 1];tint=np.array([1,.97,.91] if on else [.88,.94,1],dtype=np.float32)
                    mask=np.asarray(Image.open(opening),dtype=np.float32)[:,:,None]/255
                    pixels=np.asarray(image,dtype=np.float32);interior=np.asarray(structure,dtype=np.float32)*strength*tint
                    image=Image.fromarray(np.clip(pixels*(1-mask)+interior*mask,0,255).astype('uint8'))
                output=folder/(state+'.avif');image.save(output,quality=82,speed=8,subsampling='4:4:4');rebuilt=True
            with Image.open(output) as check:check.load();assert check.size==(6144,3072)
            records.append(dict(scene=scene,state=state,master=master_path.relative_to(ROOT).as_posix(),masterSha256=hashlib.sha256(master_path.read_bytes()).hexdigest(),originalSha256=hashlib.sha256(original.read_bytes()).hexdigest(),selected=output.relative_to(ROOT).as_posix(),rebuilt=rebuilt,width=6144,height=3072,sha256=hashlib.sha256(output.read_bytes()).hexdigest()))
            print(scene+'/'+state+': '+('rebuilt from detailed master' if rebuilt else 'detailed master retained'),flush=True)
    assert len(records)==64
    (WORK/'rebuilt-set.json').write_text(json.dumps({'expected':64,'selected':len(records),'records':records},indent=2)+'\n')
