"""Write crawler-readable social metadata into the maintained portfolio HTML."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape,unescape
from urllib.parse import quote
import json,re
root=Path(__file__).resolve().parents[1]
config=json.loads((root/'docs/social-previews.json').read_text())
class Metadata(HTMLParser):
 def __init__(self):super().__init__();self.title='';self.in_title=False;self.description=''
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='title':self.in_title=True
  if tag=='meta' and a.get('name')=='description':self.description=a.get('content','')
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
 def handle_data(self,data):
  if self.in_title:self.title+=data
coverage=[]
for project in config['projects']:
 files=set()
 for pattern in project['pages']:files.update((root/'site').glob(pattern))
 for page in sorted(files):
  text=page.read_text();meta=Metadata();meta.feed(text)
  if not re.search(r'<head\b',text,re.I):continue
  path=page.relative_to(root/'site').as_posix()
  route=path[:-10] if path.endswith('index.html') else path
  url=config['origin']+'/'+quote(route)
  image=config['origin']+'/'+project['image']
  title=meta.title.strip() or project['title']+' · Sandy Tayts'
  description=meta.description.strip() or project['summary']
  alt=project['title']+' — '+project['summary']
  text=re.sub(r'<meta\b[^>]*\b(?:property|name)\s*=\s*[\"\'](?:og:|twitter:)[^\"\']*[\"\'][^>]*>\s*','',text,flags=re.I)
  text=re.sub(r'<link\b[^>]*\brel\s*=\s*[\"\']canonical[\"\'][^>]*>\s*','',text,flags=re.I)
  tags=[('og:type','website'),('og:site_name','Sandy Tayts'),('og:locale','en_US'),('og:title',title),('og:description',description),('og:url',url),('og:image',image),('og:image:secure_url',image),('og:image:type','image/jpeg'),('og:image:width','1200'),('og:image:height','630'),('og:image:alt',alt),('twitter:card','summary_large_image'),('twitter:title',title),('twitter:description',description),('twitter:image',image),('twitter:image:alt',alt)]
  block='\n<link rel="canonical" href="'+escape(url,quote=True)+'">\n'+'\n'.join('<meta '+('name' if k.startswith('twitter:') else 'property')+'="'+k+'" content="'+escape(v,quote=True)+'">' for k,v in tags)+'\n'
  text=re.sub(r'</head\s*>',lambda m:block+m[0],text,count=1,flags=re.I)
  page.write_text(text)
  coverage.append({'project':project['slug'],'path':path,'url':url,'image':image})
(root/'docs/social-metadata-coverage.json').write_text(json.dumps(coverage,indent=2)+'\n')
print(f'Static OG and Twitter metadata installed on {len(coverage)} pages across {len(config["projects"])} portfolio/project previews')
