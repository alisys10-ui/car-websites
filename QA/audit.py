from pathlib import Path
from bs4 import BeautifulSoup
import json,urllib.parse,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parent.parent;issues=[];summary={}
for site in root.iterdir():
 if not site.is_dir() or not (site/'sitemap.xml').exists():continue
 pages=0;forms=0
 for path in site.rglob('*.html'):
  if path.name.startswith('google'):continue
  pages+=1;s=BeautifulSoup(path.read_text(),'html.parser')
  for kind,attr in [('a','href'),('img','src'),('script','src'),('link','href')]:
   for el in s.find_all(kind):
    raw=el.get(attr,'');u=urllib.parse.urlparse(raw)
    if not raw or u.scheme or raw.startswith('//'):continue
    if u.path:
     target=site/u.path.lstrip('/') if u.path.startswith('/') else path.parent/u.path
     if not target.exists() or (target.is_dir() and not (target/'index.html').exists()):issues.append([str(path.relative_to(root)),kind,raw])
    elif u.fragment and not s.find(id=urllib.parse.unquote(u.fragment)):issues.append([str(path.relative_to(root)),'anchor',raw])
  ids=[el['id'] for el in s.select('[id]')]
  if len(ids)!=len(set(ids)):issues.append([str(path.relative_to(root)),'duplicate IDs'])
  for script in s.select('script[type="application/ld+json"]'):
   try:json.loads(script.get_text())
   except:issues.append([str(path),'invalid JSONLD'])
  for f in s.select('form[data-netlify]'):
   forms+=1
   if not f.select_one('[name="form-name"]') or not f.select_one('[name="consent"][required]'):issues.append([str(path),'form missing name/consent'])
  if s.select_one('a[href^="sms:"]'):issues.append([str(path),'SMS handoff'])
 ET.parse(site/'sitemap.xml')
 summary[site.name]={'pages':pages,'netlifyForms':forms}
print(json.dumps({'summary':summary,'issues':issues},indent=2))
(Path(__file__).resolve().parent/'static-audit.json').write_text(json.dumps({'summary':summary,'issues':issues},indent=2))
