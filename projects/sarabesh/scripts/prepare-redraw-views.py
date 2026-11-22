from PIL import Image
import numpy as np,math,json
from pathlib import Path
import sys
root=Path.cwd();scene=sys.argv[1] if len(sys.argv)>1 else 'rocket-exit'; state='light-on' if scene in ['foyer','hotel'] else 'day' if scene=='town' else 'day-on';work=root/'.panorama-work'/scene;work.mkdir(parents=True,exist_ok=True); im=Image.open(root/f'assets/panoramas-hd/{scene}/{state}.webp').convert('RGB');arr=np.asarray(im)
views=[]
for name,yaw,pitch in [('front',0,0),('right',90,0),('back',180,0),('left',-90,0),('up',0,90),('down',0,-90)]:
 w=h=1254; yy,xx=np.mgrid[:h,:w];t=math.tan(math.radians(55));x=(2*(xx+.5)/w-1)*t;y=(1-2*(yy+.5)/h)*t;z=np.ones_like(x);a,b=np.radians([yaw,pitch]);yp=y*np.cos(b)+z*np.sin(b);zp=-y*np.sin(b)+z*np.cos(b);xp=x*np.cos(a)+zp*np.sin(a);zp=-x*np.sin(a)+zp*np.cos(a);lon=np.arctan2(xp,zp);lat=np.arctan2(yp,np.sqrt(xp*xp+zp*zp));sx=((lon/(2*np.pi)+.5)*im.width).astype(int)%im.width;sy=np.clip(((.5-lat/np.pi)*im.height).astype(int),0,im.height-1);Image.fromarray(arr[sy,sx]).save(work/f'{name}-guide.jpg',quality=96);views.append(dict(name=name+'-guide',yaw=yaw,pitch=pitch,hfov=110,width=w,height=h))
(work/'layout.json').write_text(json.dumps(dict(targetSize=[6144,3072],views=views)))
