from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlsplit
from collections import deque,Counter
import json,xml.etree.ElementTree as ET,tomllib,subprocess
repo=Path(__file__).resolve().parents[2];root=repo/'my-car-advisor';origin='https://mycaradvisor.netlify.app'
urls=[node.text for node in ET.parse(root/'sitemap.xml').findall('.//{*}loc')]
assert len(urls)==len(set(urls))==22
rules=[line.split() for line in (root/'_redirects').read_text().splitlines() if line and not line.startswith('#')]
assert all(len(rule)==3 and rule[2]=='301!' and rule[0]!=rule[1] for rule in rules)
config=tomllib.loads((root/'netlify.toml').read_text());assert config['build']['processing']['html']['pretty_urls'] is True
assert 'noindex' not in (root/'_headers').read_text().lower()
robots=(root/'robots.txt').read_text();assert 'Allow: /' in robots and 'Disallow: /\n' not in robots and origin+'/sitemap.xml' in robots
report=[];titles=[];descriptions=[];edges={}
for url in urls:
 route=urlsplit(url).path;assert url.startswith(origin+'/') and route.endswith('/') and '.html' not in route
 p=root/route.strip('/')/'index.html' if route!='/' else root/'index.html';assert p.is_file(),route
 s=BeautifulSoup(p.read_text(),'html.parser');canonicals=s.select('link[rel=canonical]');assert len(canonicals)==1 and canonicals[0]['href']==url
 for meta in s.select('meta[name=robots],meta[name=googlebot]'):assert 'noindex' not in meta.get('content','').lower() and 'nofollow' not in meta.get('content','').lower()
 assert len(s.select('h1'))==1
 title=s.title.get_text(' ',strip=True);description=s.select_one('meta[name=description]')['content'];titles.append(title);descriptions.append(description)
 blocks=s.select('script[type="application/ld+json"]');assert len(blocks)==1
 graph=json.loads(blocks[0].get_text())['@graph'];ids=[obj['@id']for obj in graph];assert len(ids)==len(set(ids));assert sum(obj['@type']=='WebPage'for obj in graph)==1
 for obj in graph:
  assert obj.get('url',url).startswith(origin+'/')
  for value in [obj.get('url',''),obj.get('@id','')]:assert '.html' not in value
 assert s.select_one('meta[property="og:url"]')['content']==url
 ids=[el['id']for el in s.select('[id]')];assert len(ids)==len(set(ids))
 links=[]
 for el in s.select('[href],[src],[action],[poster]'):
  for attr in ['href','src','action','poster']:
   raw=el.get(attr,'');parts=urlsplit(raw)
   if not raw or raw.startswith('#') or (parts.scheme and parts.netloc!='mycaradvisor.netlify.app') or raw.startswith('//'):continue
   path=parts.path
   if not path:continue
   assert path.startswith('/'),(route,attr,raw)
   if path.endswith('.html'):assert path=='/404.html',(route,attr,raw)
   target=root/path.lstrip('/')
   assert target.is_file() or (target/'index.html').is_file(),(route,attr,raw)
   if attr=='href':links.append(origin+path)
 edges[url]=links
 if route!='/':
  slug=route.strip('/');assert ['/'+slug+'.html',route,'301!'] in rules;assert [route+'index.html',route,'301!']in rules
 report.append({'url':url,'canonical':url,'schemaGraphs':1,'indexAllowed':True,'localAssetsAndLinks':'pass'})
assert len(titles)==len(set(titles)) and len(descriptions)==len(set(descriptions))
seen=set();queue=deque([origin+'/'])
while queue:
 node=queue.popleft()
 if node in seen:continue
 seen.add(node);queue.extend(edges.get(node,[]))
assert set(urls)<=seen,'Unlinked sitemap pages'
# All original stylesheets and images are unchanged; no design asset edits.
for p in root.rglob('*'):
 if p.is_file() and p.suffix in ['.css','.png','.webp','.jpg','.svg']:
  baseline=subprocess.check_output(['git','show','a60ccf905449440f7e64b63b20c637a778a7ac3e:'+p.relative_to(repo).as_posix()],cwd=repo)
  assert p.read_bytes()==baseline,p
out={'scope':'My Car Advisor only','sitemapCount':22,'discoverable':22,'distinctTitles':22,'distinctDescriptions':22,'cssAndImagesUnchanged':True,'pages':report,'failures':[]}
Path(__file__).with_name('static-results.json').write_text(json.dumps(out,indent=2)+'\n');print('PASS: 22 sitemap pages, metadata, one schema graph each, internal links, legacy redirects, robots and unchanged CSS/images.')
