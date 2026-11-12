"""Supplement the page archive with Wix galleries, videos and panorama files."""
import concurrent.futures, hashlib, html, json, re, subprocess
from pathlib import Path
from urllib.parse import urlsplit,urljoin
ROOT=Path(__file__).resolve().parents[1]/'archive/sandyux'
m=json.loads((ROOT/'manifest.json').read_text()); existing={a['url']:a for a in m['assets']}; pending={}
for page in m['pages']:
 if 'html' not in page: continue
 s=html.unescape((ROOT/page['html']).read_text()).replace('\\/','/')
 for name in set(re.findall(r'c9a6ed_[a-f0-9]{32}(?:~[a-zA-Z0-9_]+)?\.(?:png|jpg|jpeg|webp|gif)',s)):
  url='https://static.wixstatic.com/media/'+name
  if url not in existing: pending.setdefault(url,set()).add(page['url'])
 vids={}
 for vid,quality in re.findall(r'video/(c9a6ed_[a-f0-9]+)/([0-9]+)p/mp4/file.mp4',s): vids[vid]=max(vids.get(vid,0),int(quality))
 for vid,q in vids.items(): pending.setdefault(f'https://video.wixstatic.com/video/{vid}/{q}p/mp4/file.mp4',set()).add(page['url'])
 # Recover blocked originals using the actual transformed URL delivered by the page.
 for url,a in existing.items():
  if 'error' not in a: continue
  matches=re.findall(re.escape(url)+r'/v1/[^\s"<>\\]+',s)
  if matches: pending.setdefault(matches[0],set()).add(page['url'])
def fetch(item):
 url,sources=item; name=urlsplit(url).path.rsplit('/',1)[-1]; name=re.sub(r'[^a-zA-Z0-9._~-]','_',name)
 path=ROOT/'assets'/(hashlib.sha256(url.encode()).hexdigest()[:10]+'-'+name)
 r=subprocess.run(['curl','-sS','-L','--fail','--max-time','120',url,'-o',str(path)],capture_output=True,text=True)
 a={'url':url,'sources':sorted(sources),'path':str(path.relative_to(ROOT))}
 if r.returncode: a['error']=r.stderr.strip()
 else: a.update(bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest())
 return a
configs={u.split('#config=',1)[1]:{'https://www.sandyux.com/art'} for u in m['external_links'] if '#config=' in u}
for url,sources in configs.items():
 a=fetch((url,sources)); m['assets'].append(a)
 if 'error' not in a:
  config=json.loads((ROOT/a['path']).read_text())
  def visit(v):
   if isinstance(v,dict):
    for k,x in v.items():
     if k=='panorama' and isinstance(x,str): pending.setdefault(urljoin(url,x),set()).update(sources)
     else: visit(x)
   elif isinstance(v,list):
    for x in v: visit(x)
  visit(config)
print('Supplemental assets:',len(pending),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 for a in pool.map(fetch,pending.items()):
  m['assets'].append(a)
  print(a['path'],a.get('bytes',a.get('error')),flush=True)
(ROOT/'manifest.json').write_text(json.dumps(m,indent=2)+'\n')
