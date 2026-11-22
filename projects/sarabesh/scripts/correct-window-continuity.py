"""Project the approved bedroom-facing opening correction into its existing panorama."""
from pathlib import Path
import math,shutil,sys
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
root=Path(__file__).resolve().parents[1];work=root/'.panorama-work';work.mkdir(exist_ok=True)
source=Path(sys.argv[1]) if len(sys.argv)>1 else work/'approved-window-correction.png';patch=work/'window-return-redraw.png'
if source.exists():shutil.move(source,patch)
image=Image.open(patch).convert('RGB');w,h=image.size
mask=Image.new('L',image.size);draw=ImageDraw.Draw(mask);points=[(205,395),(285,360),(347,293),(385,251),(450,221),(515,211),(590,211),(662,235),(706,269),(733,321),(735,740),(205,720)];draw.polygon([(x*w/1254,y*h/1254) for x,y in points],fill=255);mask=mask.filter(ImageFilter.GaussianBlur(4));arr=np.asarray(image,dtype=np.float32);alpha=np.asarray(mask,dtype=np.float32)/255
base=Image.open(root/'assets/panoramas-hd/window/day-on.webp').convert('RGB');out=np.asarray(base).copy();pw,ph=base.size;opening_mask=np.zeros((ph,pw),dtype='uint8');a=math.radians(145);t=math.tan(math.radians(55))
for row in range(0,ph,128):
 end=min(ph,row+128);lon=((np.arange(pw)+.5)/pw-.5)*2*math.pi;lat=(.5-(np.arange(row,end)+.5)/ph)*math.pi;x=np.cos(lat[:,None])*np.sin(lon);y=np.broadcast_to(np.sin(lat[:,None]),x.shape);z=np.cos(lat[:,None])*np.cos(lon);xr=x*math.cos(a)-z*math.sin(a);zr=x*math.sin(a)+z*math.cos(a);xx=xr/np.maximum(zr,1e-8)/t;yy=y/np.maximum(zr,1e-8)/t;sx=np.clip((xx+1)*.5*w-.5,0,w-1.001);sy=np.clip((1-yy)*.5*h-.5,0,h-1.001);ix=sx.astype(int);iy=sy.astype(int);dx=sx-ix;dy=sy-iy
 def sample(v):
  if v.ndim==3:return (v[iy,ix]*(1-dx[:,:,None])+v[iy,ix+1]*dx[:,:,None])*(1-dy[:,:,None])+(v[iy+1,ix]*(1-dx[:,:,None])+v[iy+1,ix+1]*dx[:,:,None])*dy[:,:,None]
  return (v[iy,ix]*(1-dx)+v[iy,ix+1]*dx)*(1-dy)+(v[iy+1,ix]*(1-dx)+v[iy+1,ix+1]*dx)*dy
 weight=sample(alpha)*(zr>0)*(np.abs(xx)<1)*(np.abs(yy)<1);color=sample(arr);opening_mask[row:end]=np.clip(weight*255,0,255).astype('uint8');out[row:end]=np.clip(out[row:end]*(1-weight[:,:,None])+color*weight[:,:,None],0,255).astype('uint8')
folder=work/'masters';folder.mkdir(exist_ok=True);Image.fromarray(out).save(folder/'window-day-on.webp',quality=96,method=5);Image.fromarray(opening_mask).save(folder/'window-opening-mask.png')
print('Corrected the existing outside opening to reveal the bedroom; retained exterior architecture and floor.')
