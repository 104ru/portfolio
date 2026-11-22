"""Reproject registered painted views; report uncovered pixels before approval."""
from pathlib import Path
import json, math, sys
import numpy as np
from PIL import Image

root=Path(__file__).resolve().parents[1]
work=root/(sys.argv[1] if len(sys.argv)>1 else '.panorama-work')
layout=json.loads((work/'layout.json').read_text())
w,h=layout['targetSize']
patches=[]
for v in layout['views']:
    name=v['name'].replace('-guide','')
    path=root/layout['frontApproved'] if name=='front' and 'frontApproved' in layout else work/f'{name}.webp'
    arr=np.asarray(Image.open(path).convert('RGB'),dtype=np.float32)
    patches.append((v,arr))
result=np.zeros((h,w,3),dtype=np.uint8)
uncovered=0
for row in range(0,h,96):
    stop=min(h,row+96)
    lon=((np.arange(w)+.5)/w-.5)*2*np.pi
    lat=(.5-(np.arange(row,stop)+.5)/h)*np.pi
    x=np.cos(lat[:,None])*np.sin(lon[None,:])
    y=np.broadcast_to(np.sin(lat[:,None]),x.shape)
    z=np.cos(lat[:,None])*np.cos(lon[None,:])
    colors=np.zeros((*x.shape,3),dtype=np.float32)
    total=np.zeros(x.shape,dtype=np.float32)
    for v,arr in patches:
        a,b=np.radians([v['yaw'],v['pitch']])
        xr=x*np.cos(a)-z*np.sin(a)
        zr=x*np.sin(a)+z*np.cos(a)
        yr=y*np.cos(b)-zr*np.sin(b)
        zr=y*np.sin(b)+zr*np.cos(b)
        tangent=math.tan(math.radians(v['hfov']/2))
        xx=xr/np.maximum(zr,1e-8)/tangent
        yy=yr/np.maximum(zr,1e-8)/tangent*v['width']/v['height']
        edge=np.minimum(1-np.abs(xx),1-np.abs(yy))
        weight=np.clip(edge/.18,0,1)**2*(zr>0)
        ah,aw=arr.shape[:2]
        sx=np.clip((xx+1)*.5*aw-.5,0,aw-1.001)
        sy=np.clip((1-yy)*.5*ah-.5,0,ah-1.001)
        ix,iy=sx.astype(int),sy.astype(int)
        dx,dy=(sx-ix)[...,None],(sy-iy)[...,None]
        sampled=(arr[iy,ix]*(1-dx)+arr[iy,ix+1]*dx)*(1-dy)+(arr[iy+1,ix]*(1-dx)+arr[iy+1,ix+1]*dx)*dy
        colors+=sampled*weight[...,None]
        total+=weight
    uncovered+=int(np.sum(total<=0))
    result[row:stop]=np.clip(colors/np.maximum(total[...,None],1e-8),0,255).astype(np.uint8)
out=root/layout.get('output','assets/review/landing-night-panorama-trial.webp')
Image.fromarray(result).save(out,quality=94,method=6)
report={'size':[w,h],'uncoveredPixels':uncovered,'approval':'pending visual seam review','output':str(out.relative_to(root))}
(work/'assembly-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
