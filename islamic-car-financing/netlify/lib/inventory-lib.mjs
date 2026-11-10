export const SOURCES=[
 {url:'https://www.oaklawnmazda.com/new-vehicles/',host:'www.oaklawnmazda.com',dealerId:'oak-lawn-mazda',name:"Napleton's Oak Lawn Mazda",condition:'New'},
 {url:'https://www.oaklawnmazda.com/used-vehicles/',host:'www.oaklawnmazda.com',dealerId:'oak-lawn-mazda',name:"Napleton's Oak Lawn Mazda",condition:'Used'},
 {url:'https://www.stevenapleton.com/',host:'www.stevenapleton.com',dealerId:'group',name:'Steve Napleton Automotive Group',condition:null}
];
function objects(value,result=[]){if(!value||typeof value!=='object')return result;if(Array.isArray(value)){for(const v of value)objects(v,result)}else{result.push(value);for(const v of Object.values(value))if(v&&typeof v==='object')objects(v,result)}return result}
const text=v=>typeof v==='string'?v:typeof v?.name==='string'?v.name:'';
function safeURL(value,source){try{const u=new URL(value,source.url);return u.protocol==='https:'&&u.hostname===source.host&&!u.username&&!u.password?u.href:null}catch{return null}}
export function parseInventory(html,source,now=new Date().toISOString()){
 const records=[],seen=new Set();
 for(const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  let json;try{json=JSON.parse(match[1])}catch{continue}
  for(const v of objects(json)){
   const vin=text(v.vehicleIdentificationNumber||v.vin).toUpperCase();if(!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)||seen.has(vin))continue;
   const name=text(v.name),year=Number(v.vehicleModelDate||v.productionDate?.slice?.(0,4)||name.match(/\b(20\d\d|19\d\d)\b/)?.[0]);
   const make=text(v.brand||v.manufacturer),model=text(v.model);if(!Number.isInteger(year)||year<1980||year>new Date(now).getUTCFullYear()+2||!make||!model)continue;
   const offer=Array.isArray(v.offers)?v.offers[0]:v.offers||{};if(/OutOfStock|SoldOut|Discontinued/i.test(text(offer.availability)))continue;
   const url=safeURL(v.url||offer.url||source.url,source);if(!url)continue;
   const condition=/NewCondition/i.test(text(v.itemCondition))?'New':/UsedCondition|RefurbishedCondition/i.test(text(v.itemCondition))?'Used':source.condition;
   if(!condition)continue;
   // Never interpret a lease payment, monthly installment or MSRP range as an asking price.
   let price=null;if(offer.price!=null&&offer.price!==''&&(!offer.priceCurrency||offer.priceCurrency==='USD')&&!/month|lease|payment/i.test(text(offer.name))){const n=Number(String(offer.price).replace(/[$,]/g,''));if(Number.isFinite(n)&&n>1000&&n<10000000)price=n}
   const distance=v.mileageFromOdometer;let mileage=null;if(distance&&(/SMI/i.test(distance.unitCode)||/mile/i.test(distance.unitText))){const n=Number(distance.value);if(Number.isFinite(n)&&n>=0)mileage=n}
   const rawBody=text(v.bodyType);const body=/suv|crossover/i.test(rawBody)?'SUV':/sedan/i.test(rawBody)?'Sedan':/truck|pickup/i.test(rawBody)?'Truck':rawBody?'Other':null;
   records.push({vin,year,make,model,condition,price,mileage,body,url,dealerId:source.dealerId,sourceLabel:source.name,status:'listed',verifiedAt:now});seen.add(vin)
  }
 }
 return records;
}
export function detailLinks(html,source){const links=new Set();for(const m of html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)){const u=safeURL(m[1].replaceAll('&amp;','&'),source);if(u&&/\/inventory\/(?:new|used|certified)[^/?#]*-/i.test(new URL(u).pathname))links.add(u)}return [...links].slice(0,10)}
async function getPage(url){const res=await fetch(url,{headers:{Accept:'text/html','User-Agent':'AliVehicleFinder/1.0 (vehicle inquiry service)'},redirect:'error',signal:AbortSignal.timeout(6500)});if(!res.ok)throw Error('source unavailable');const raw=await res.text();if(raw.length>6000000)throw Error('source too large');return raw}
let cache=null,expires=0;
export async function loadInventory(){
 if(cache&&Date.now()<expires)return cache;
 const now=new Date().toISOString(),records=[],states=[];
 await Promise.all(SOURCES.map(async source=>{try{const raw=await getPage(source.url);let parsed=parseInventory(raw,source,now);if(!parsed.length){const links=detailLinks(raw,source).slice(0,5);const pages=await Promise.allSettled(links.map(url=>getPage(url)));for(const page of pages)if(page.status==='fulfilled')parsed.push(...parseInventory(page.value,source,now))}records.push(...parsed);states.push({source:source.name,status:parsed.length?'parsed':'no-structured-vehicles',count:parsed.length})}catch{states.push({source:source.name,status:'unavailable',count:0})}}));
 const unique=[...new Map(records.map(v=>[v.vin,v])).values()];
 cache={sourceVerified:unique.length>0,updatedAt:now,vehicles:unique,sources:states,notice:'Source listings only. Ali must confirm availability and final terms. No fallback stock or prices.'};expires=Date.now()+5*60*1000;return cache
}
