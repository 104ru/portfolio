"""Archive publicly linked SandyUX pages and original media with provenance."""
import concurrent.futures, hashlib, html, json, re, subprocess
from pathlib import Path
from urllib.parse import urlsplit, urljoin
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]/'archive/sandyux'
for folder in ('pages','text','assets'): (ROOT/folder).mkdir(parents=True,exist_ok=True)
def fetch(url,path):
 r=subprocess.run(['curl','-sS','-L','--fail','--retry','2','--max-time','90',url,'-o',str(path)],capture_output=True,text=True)
 return r.returncode, r.stderr.strip()
class Parser(HTMLParser):
 def __init__(self): super().__init__(); self.links=[]; self.text=[]; self.skip=0
 def handle_starttag(self,t,a):
  d=dict(a)
  if t in ('script','style'): self.skip+=1
  if t=='a' and d.get('href'): self.links.append(d['href'])
 def handle_endtag(self,t):
  if t in ('script','style'): self.skip=max(0,self.skip-1)
 def handle_data(self,d):
  if not self.skip and d.strip(): self.text.append(d.strip())
queue=['https://www.sandyux.com/']; seen=set(); assets={}; pages=[]; external=set()
# Include sitemap-only public pages as well as navigation links.
code,err=fetch('https://www.sandyux.com/sitemap.xml',ROOT/'sitemap.xml')
if not code:
 for loc in re.findall(r'<loc>(.*?)</loc>',(ROOT/'sitemap.xml').read_text()):
  if loc.endswith('.xml'):
   p=ROOT/('sitemap-'+urlsplit(loc).path.rsplit('/',1)[-1]); c,e=fetch(loc,p)
   if not c: queue.extend(re.findall(r'<loc>(.*?)</loc>',p.read_text()))
  else: queue.append(loc)
while queue:
 url=queue.pop(0); u=urlsplit(url)
 if u.hostname not in ('www.sandyux.com','sandyux.com'): continue
 url='https://www.sandyux.com'+(u.path or '/')
 if url in seen: continue
 seen.add(url); slug=u.path.strip('/').replace('/','__') or 'home'; path=ROOT/'pages'/f'{slug}.html'
 code,err=fetch(url,path)
 if code: pages.append({'url':url,'error':err}); continue
 source=path.read_text(); p=Parser(); p.feed(source)
 (ROOT/'text'/f'{slug}.txt').write_text('\n'.join(p.text)+'\n')
 pages.append({'url':url,'html':str(path.relative_to(ROOT)),'text':f'text/{slug}.txt'})
 urls=set(re.findall(r'https://[^\s"<>\\]+',html.unescape(source)))
 for link in p.links:
  link=urljoin(url,link); host=urlsplit(link).hostname
  if host in ('www.sandyux.com','sandyux.com'): queue.append(link)
  else: external.add(link)
 for link in urls:
  link=link.rstrip(');,')
  if 'static.wixstatic.com/media/' in link:
   link=link.split('/v1/')[0]
   if link.endswith('/media/'): continue
  elif not ('.usrfiles.com/' in link or 'video.wixstatic.com/' in link or re.search(r'\.(pdf|mp4|webm|zip)(?:\?|$)',link)): continue
  assets.setdefault(link,set()).add(url)
 print('Page:',url,flush=True)
def download(item):
 url,sources=item; name=urlsplit(url).path.rsplit('/',1)[-1]; name=re.sub(r'[^a-zA-Z0-9._~-]','_',name)
 path=ROOT/'assets'/(hashlib.sha256(url.encode()).hexdigest()[:10]+'-'+name)
 code,err=fetch(url,path)
 result={'url':url,'sources':sorted(sources),'path':str(path.relative_to(ROOT))}
 if code: result['error']=err
 else: result.update(bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest())
 return result
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: results=list(pool.map(download,assets.items()))
manifest={'source':'https://www.sandyux.com/','pages':pages,'assets':results,'external_links':sorted(external)}
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('DONE',len(pages),'pages',len(results),'assets',sum('error' in a for a in results),'asset failures',flush=True)
