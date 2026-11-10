/* No scraper or live feed is connected. Only an authorized, freshly verified feed may enable cards. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MCAInventory=api;})(typeof window!=='undefined'?window:globalThis,()=>{
 const dealers=[
  {id:'oak-lawn-mazda',name:"Napleton's Oak Lawn Mazda",host:'www.oaklawnmazda.com',used:'https://www.oaklawnmazda.com/used-vehicles/',new:'https://www.oaklawnmazda.com/new-vehicles/'},
  {id:'oak-lawn-ford',name:'Napleton Ford of Oak Lawn',host:'www.napletonfordoaklawn.com',used:'https://www.napletonfordoaklawn.com/used-vehicles/'},
  {id:'countryside-mazda',name:"Napleton's Countryside Mazda",host:'www.napletonscountrysidemazda.com',used:'https://www.napletonscountrysidemazda.com/used-vehicles/'},
  {id:'nearby-mazda',name:'Other nearby Napleton Mazda locations',host:'www.napletonmazda.com',used:'https://www.napletonmazda.com/inventory'},
  {id:'group',name:'Steve Napleton Automotive Group',host:'www.stevenapleton.com',used:'https://www.stevenapleton.com/search/used/?tp=used'}
 ];
 const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const fresh=(date,now)=>{const t=Date.parse(date);return Number.isFinite(t)&&t<=now&&now-t<=15*60*1000;};
 function safeURL(value,host){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname===host&&!u.username&&!u.password?u.href:null;}catch{return null;}}
 function photoURL(feed,v){if(v.photoAuthorized!==true||!Array.isArray(feed?.photoHosts))return null;for(const host of feed.photoHosts){const url=safeURL(v.photo,host);if(url)return url;}return null;}
 function match(feed,prefs={},now=Date.now()){
  if(feed?.sourceVerified!==true||!fresh(feed.updatedAt,now)||!Array.isArray(feed.vehicles))return [];
  const seen=new Set();
  return feed.vehicles.filter(v=>{
   const dealer=dealers.find(d=>d.id===v.dealerId);
   if(!dealer||!['available','listed'].includes(v.status)||!fresh(v.verifiedAt,now)||!safeURL(v.url,dealer.host)||!Number.isInteger(v.year)||v.year<1980||v.year>new Date(now).getUTCFullYear()+2||!v.make||!v.model||!['New','Used'].includes(v.condition))return false;
   if(typeof v.vin!=='string'||! /^[A-HJ-NPR-Z0-9]{17}$/.test(v.vin)||seen.has(v.vin))return false;
   if((v.price!=null&&(!Number.isFinite(v.price)||v.price<0))||(v.mileage!=null&&(!Number.isFinite(v.mileage)||v.mileage<0)))return false;
   if(prefs.type==='New Mazda'&&(v.condition!=='New'||norm(v.make)!=='mazda'))return false;
   if(prefs.type==='New vehicle'&&v.condition!=='New')return false;
   if(prefs.type==='Used Car'&&v.condition!=='Used')return false;
   if(['SUV','Sedan','Truck','Other'].includes(prefs.body)&&v.body!==prefs.body)return false;
   if(prefs.budgetAmount&&prefs.budgetKind==='Total price'&&(!Number.isFinite(v.price)||v.price>Number(prefs.budgetAmount)))return false;
   if(prefs.model&&norm(prefs.model)&&!norm(`${v.make} ${v.model}`).includes(norm(prefs.model)))return false;
   seen.add(v.vin);return true;
  }).sort((a,b)=>dealers.findIndex(d=>d.id===a.dealerId)-dealers.findIndex(d=>d.id===b.dealerId)||(a.price??Infinity)-(b.price??Infinity)).slice(0,10);
 }
 return {dealers,match,safeURL,photoURL};
});
