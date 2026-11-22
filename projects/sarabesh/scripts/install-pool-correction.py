"""Project registered painted pool-table corrections into their matching spheres."""
from pathlib import Path
import json,math,sys
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1]
folder=root/'.panorama-work/pool';report_path=root/'docs/pool-table-correction.json';report=json.loads(report_path.read_text())['states'] if report_path.exists() else [];installed={r['state'] for r in report}
a,b=map(math.radians,[-80,-20]);t=math.tan(math.radians(45))
for patch in sorted(folder.glob('*-corrected.webp')):
 state=patch.stem.replace('-corrected','')
 if state in installed:continue
 target=root/'assets/panoramas-hd/bar'/(state+'.webp')
 original=np.asarray(Image.open(target).convert('RGB'));paint=np.asarray(Image.open(patch).convert('RGB'));h,w=original.shape[:2];ph,pw=paint.shape[:2];result=original.copy();count=0
 for row in range(0,h,96):
  end=min(h,row+96);yy,xx=np.mgrid[row:end,:w];lon=((xx+.5)/w-.5)*2*np.pi;lat=(.5-(yy+.5)/h)*np.pi
  x=np.sin(lon)*np.cos(lat);y=np.sin(lat);z=np.cos(lon)*np.cos(lat)
  xp=x*np.cos(a)-z*np.sin(a);zp=x*np.sin(a)+z*np.cos(a);yp=y*np.cos(b)-zp*np.sin(b);zz=y*np.sin(b)+zp*np.cos(b)
  u=(xp/np.maximum(zz,1e-8)/t+1)/2;v=(1-yp/np.maximum(zz,1e-8)/t)/2
  edge=np.minimum.reduce([(u-.265)/.025,(.73-u)/.025,(v-.345)/.025,(.82-v)/.025]);weight=np.clip(edge,0,1);weight=weight*weight*(3-2*weight);weight[zz<=0]=0
  sx=np.clip(u*pw-.5,0,pw-1);sy=np.clip(v*ph-.5,0,ph-1);x0=sx.astype(int);y0=sy.astype(int);x1=np.minimum(x0+1,pw-1);y1=np.minimum(y0+1,ph-1);fx=(sx-x0)[...,None];fy=(sy-y0)[...,None]
  sample=paint[y0,x0]*(1-fx)*(1-fy)+paint[y0,x1]*fx*(1-fy)+paint[y1,x0]*(1-fx)*fy+paint[y1,x1]*fx*fy
  result[row:end]=np.clip(original[row:end]*(1-weight[...,None])+sample*weight[...,None],0,255).astype(np.uint8);count+=int((weight>0).sum())
 Image.fromarray(result).save(target,quality=92,method=6)
 report.append({'state':state,'paintedViewSize':[pw,ph],'productionSize':[w,h],'projectedPixels':count})
 print('Installed',state,flush=True)
(root/'docs/pool-table-correction.json').write_text(json.dumps({'method':'Built-in image edit of a registered 90° view; localized spherical projection at yaw -80°, pitch -20°','scope':'Remove chairs/stools immediately around the billiards table; preserve dining and bar seating','states':report},indent=2)+'\n')
