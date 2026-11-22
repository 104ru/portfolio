"""Apply narrow registered seam repairs to a panorama trial, in place."""
from pathlib import Path
import math
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1]
p=root/'assets/review/landing-night-panorama-trial.webp'
im=np.asarray(Image.open(p).convert('RGB'),dtype=np.float32)
h,w=im.shape[:2]
for name,yaw in [('join-left',-125),('join-right',-35)]:
    patch=np.asarray(Image.open(root/'.panorama-work'/f'{name}.webp').convert('RGB'),dtype=np.float32)
    ph,pw=patch.shape[:2]
    for row in range(0,h,96):
        stop=min(h,row+96)
        lon=((np.arange(w)+.5)/w-.5)*2*np.pi
        lat=(.5-(np.arange(row,stop)+.5)/h)*np.pi
        delta=(lon-math.radians(yaw)+np.pi)%(2*np.pi)-np.pi
        z=np.cos(lat[:,None])*np.cos(delta[None,:])
        xx=np.cos(lat[:,None])*np.sin(delta[None,:])/np.maximum(z,1e-8)
        yy=np.sin(lat[:,None])/np.maximum(z,1e-8)*1600/983
        # Preserve outer areas; replace only central 32 degrees of each repair.
        wx=np.clip((math.radians(23)-np.abs(delta))/math.radians(7),0,1)[None,:]
        wy=np.clip((1-np.abs(yy))/.16,0,1)
        weight=wx*wy*(z>0)
        sx=np.clip((xx+1)*.5*pw-.5,0,pw-1.001)
        sy=np.clip((1-yy)*.5*ph-.5,0,ph-1.001)
        ix,iy=sx.astype(int),sy.astype(int)
        dx,dy=(sx-ix)[...,None],(sy-iy)[...,None]
        sample=(patch[iy,ix]*(1-dx)+patch[iy,ix+1]*dx)*(1-dy)+(patch[iy+1,ix]*(1-dx)+patch[iy+1,ix+1]*dx)*dy
        im[row:stop]=im[row:stop]*(1-weight[...,None])+sample*weight[...,None]
Image.fromarray(np.clip(im,0,255).astype(np.uint8)).save(p,quality=94,method=6)
print('Applied two narrow seam repairs')
