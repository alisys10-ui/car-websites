from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlsplit,urljoin
from urllib.request import build_opener,HTTPRedirectHandler,Request
from urllib.error import HTTPError
import argparse,json,xml.etree.ElementTree as ET,urllib.robotparser
parser=argparse.ArgumentParser();parser.add_argument('--base',default='http://localhost:8890');parser.add_argument('--output',default='netlify-local-results.json');args=parser.parse_args()
repo=Path(__file__).resolve().parents[2];root=repo/'my-car-advisor';origin='https://mycaradvisor.netlify.app';urls=[n.text for n in ET.parse(root/'sitemap.xml').findall('.//{*}loc')]
class NoRedirect(HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):return None
opener=build_opener(NoRedirect)
def get(path,ua='SEO validation client'):
 try:r=opener.open(Request(args.base.rstrip('/')+path,headers={'User-Agent':ua}),timeout=20)
 except HTTPError as error:r=error
 return r.status,r.headers,r.read().decode('utf-8',errors='replace')
results=[];failures=[]
status,headers,body=get('/robots.txt');assert status==200 and 'User-agent:' in body and origin+'/sitemap.xml' in body
robot=urllib.robotparser.RobotFileParser();robot.parse(body.splitlines())
status,headers,body=get('/sitemap.xml');assert status==200
actual=[n.text for n in ET.fromstring(body).findall('.//{*}loc')];assert actual==urls
for url in urls:
 route=urlsplit(url).path
 try:
  status,headers,body=get(route);assert status==200,(status,dict(headers))
  assert 'location'not in headers and 'noindex'not in headers.get('X-Robots-Tag','').lower()
  assert 'text/html' in headers.get('Content-Type','')
  s=BeautifulSoup(body,'html.parser');assert [x['href']for x in s.select('link[rel=canonical]')]==[url]
  assert all('noindex'not in m.get('content','').lower()for m in s.select('meta[name=robots],meta[name=googlebot]'))
  assert len(s.select('script[type="application/ld+json"]'))==1
  assert robot.can_fetch('Googlebot',url) and robot.can_fetch('Googlebot',origin+'/assets/advisor.js')
  google_status,google_headers,_=get(route,'Googlebot');assert google_status==200 and 'noindex'not in google_headers.get('X-Robots-Tag','').lower()
  if route!='/':
   old=route.rstrip('/')+'.html';code,h,_=get(old);assert code==301,(old,code);assert urlsplit(urljoin(args.base,h['Location'])).path==route,(old,h['Location'])
   code,h,_=get(route+'index.html');assert code==301 and urlsplit(urljoin(args.base,h['Location'])).path==route
   code,h,alias_body=get(route.rstrip('/'));assert code in (200,301,308),(route,code);
   if code==200:assert BeautifulSoup(alias_body,'html.parser').select_one('link[rel=canonical]')['href']==url
   else:assert urlsplit(urljoin(args.base,h['Location'])).path==route
  results.append({'url':url,'HTTP':status,'googlebotHTTP':google_status,'canonical':url,'indexAllowed':True,'legacyHTMLRedirect':301 if route!='/' else 'not applicable','slashlessAliasHTTP':code if route!='/' else 'not applicable'})
 except Exception as e:failures.append({'url':url,'error':str(e)})
for path in ['/index.html','/index']:
 try:
  code,h,_=get(path);assert code==301 and urlsplit(urljoin(args.base,h['Location'])).path=='/'
 except Exception as e:failures.append({'url':path,'error':str(e)})
code,_,_=get('/not-a-real-page-seo-test/');assert code==404,'Missing pages must not return a soft 200'
output=Path(__file__).with_name(args.output);output.write_text(json.dumps({'base':args.base,'tested':len(urls),'passed':len(results),'pages':results,'failures':failures},indent=2)+'\n')
print(json.dumps({'base':args.base,'passed':len(results),'failures':failures},indent=2))
assert not failures
