const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');const sites=['my-car-advisor','car-advisor-chicago','islamic-car-financing'];
const now=new Date().toISOString();const fixture={sourceVerified:true,updatedAt:now,vehicles:Array.from({length:12},(_,i)=>({vin:'1HGCM82633A'+String(400000+i),year:2023,make:'Honda',model:'Civic',body:'Sedan',condition:'Used',price:15000+i*100,mileage:20000+i,url:'https://www.oaklawnmazda.com/inventory/used-2023-honda-civic-'+i+'/',dealerId:'oak-lawn-mazda',sourceLabel:"Napleton's Oak Lawn Mazda",status:'listed',verifiedAt:now}))};
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)])}
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});const report={pages:[],failures:[],behavior:[]};
for(let i=0;i<sites.length;i++){
 const site=sites[i],origin='http://127.0.0.1:'+(8800+i);const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
 const page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const file of files(path.join(root,site)).filter(p=>p.endsWith('.html')&&!path.basename(p).startsWith('google'))){
  const relative=path.relative(path.join(root,site),file).replaceAll(path.sep,'/');errors=[];
  try{const res=await page.goto(origin+'/'+relative,{waitUntil:'domcontentloaded'});assert.equal(res.status(),200);await page.waitForTimeout(80);
   const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));assert(width.scroll<=width.inner+2,'mobile overflow '+JSON.stringify(width));
   assert.deepEqual(errors,[],'page JS error');
   if(!['404.html','thank-you.html'].includes(relative)){
    assert(await page.locator('#mca-chat-button').isVisible(),'finder missing');
    const form=page.locator('.lead-form');await form.locator('[name=name]').fill('QA Test');await form.locator('[name=contact]').fill('qa@example.com');await form.locator('[name=vehicle]').fill('Honda Civic');await form.locator('[name=location]').fill('Chicago IL');await form.locator('[name=consent]').check();await form.locator('[type=submit]').click();assert((await form.locator('[role=status]').innerText()).match(/Local preview|معاينة محلية|Vista previa/),'preview falsely submitted');
    await page.locator('#mca-chat-button').click();assert(await page.locator('#mca-chat').isVisible());await page.locator('#mca-chat-step .mca-options button').nth(1).click();
    for(let q=1;q<7;q++)await page.locator('#mca-chat-step .mca-secondary').click();
    await page.locator('#mca-chat-step input').fill('Chicago IL');await page.locator('#mca-chat-step form button').click();await page.locator('#mca-chat-step .mca-secondary').click();
    await page.locator('#mca-chat-step .mca-primary').last().click();assert(await page.locator('#mca-chat-lead').isVisible(),'chat contact missing');
    await page.locator('#mca-chat-lead [name=name]').fill('QA Test');await page.locator('#mca-chat-lead [name=phone]').fill('7085550100');await page.locator('#mca-chat-lead [name=consent]').check();await page.locator('#mca-chat-lead [type=submit]').click();assert((await page.locator('.mca-status').innerText()).match(/Local preview|معاينة محلية|Vista previa/));
    await page.locator('#mca-chat-close').click();assert(await page.locator('#mca-chat-button').evaluate(n=>n===document.activeElement),'focus not restored');
   }
   report.pages.push({site,page:relative,mobile:'pass',forms:'pass',guidedChat:'pass'});
  }catch(e){report.failures.push({site,page:relative,error:e.message});console.log('FAIL',site,relative,e.message.slice(0,180))}
 }
 // Per-site behavioral tests with explicitly synthetic stock and AI fixtures, never production data.
 try{
  await page.route('**/api/inventory',r=>r.fulfill({json:fixture}));await page.goto(origin+'/inventory.html');await page.locator('#advisor-inventory form button').click();await page.waitForSelector('.advisor-card');assert.equal(await page.locator('.advisor-card').count(),10,'max 10 results');assert.equal(await page.locator('.advisor-card a').count(),0,'dealer referral');await page.locator('.advisor-card button').first().click();assert((await page.locator('.lead-form [name=vehicle]').inputValue()).includes('VIN'));
  await page.locator('#advisor-inventory [name=model]').fill('NoSuchModel');await page.locator('#advisor-inventory form button').click();await page.waitForTimeout(100);assert.equal(await page.locator('.advisor-card').count(),0,'stale results on no match');
  await page.locator('#mca-chat-button').click();await page.locator('.advisor-ai summary').click();await page.locator('.advisor-ai input[type=text]').fill('Which SUV should I consider?');await page.locator('.advisor-ai form button').click();assert((await page.locator('.ai-status').innerText()).match(/consent|وافق|Acepte/));
  await page.locator('.ai-consent').check();await page.locator('.advisor-ai input[type=text]').fill('qa@example.com');await page.locator('.advisor-ai form button').click();assert((await page.locator('.ai-status').innerText()).match(/identifiers|المعلومات الشخصية|datos personales/));
  await page.route('**/api/chat',r=>r.fulfill({json:{reply:'TEST FIXTURE: What total budget would you prefer?',mode:'ai'}}));await page.locator('.advisor-ai input[type=text]').fill('Which SUV should I consider?');await page.locator('.advisor-ai form button').click();await page.waitForFunction(()=>document.querySelector('.advisor-ai-log').textContent.includes('TEST FIXTURE'));await page.locator('.ai-clear').click();assert.equal(await page.locator('.advisor-ai-log p').count(),0);
  await page.unroute('**/api/chat');await page.locator('.advisor-ai input[type=text]').fill('Help me find a car');await page.locator('.advisor-ai form button').click();await page.waitForFunction(()=>document.querySelector('.ai-status').textContent.length>0);await page.locator('#mca-chat-close').click();
  // Calculator output, zero-APR and invalid input are checked wherever the original calculator exists.
  const calcPath=site==='car-advisor-chicago'?'/en/':'/';await page.goto(origin+calcPath);
  if(site==='car-advisor-chicago'){assert((await page.locator('#loan-payment').innerText()).includes('$'));await page.locator('[data-loan-input=apr]').fill('0');await page.locator('[data-loan-input=price]').fill('10000');await page.locator('[data-loan-input=term]').selectOption('60');assert((await page.locator('#loan-payment').innerText()).includes('196'));await page.locator('[data-loan-input=price]').fill('-1');assert(await page.locator('#loan-error').isVisible())}
  if(site==='islamic-car-financing'){assert((await page.locator('#payment-calculator output').innerText()).includes('562.92'));await page.locator('#payment-calculator [name=price]').fill('-1');assert((await page.locator('#payment-calculator output').innerText()).includes('valid'))}
  await page.screenshot({path:path.join(__dirname,'')+site+'-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:path.join(__dirname,'')+site+'-desktop.png',fullPage:true});
  report.behavior.push({site,inventory10:true,noDealerReferrals:true,leadPrefill:true,aiConsent:true,piiGuard:true,mockedAI:true,aiOutage:true,calculator:'pass where present'});
 }catch(e){report.failures.push({site,behavior:e.message});console.log('BEHAVIOR FAIL',site,e.message)}
 await context.close();console.log(site,'complete')
}
await browser.close();fs.writeFileSync(path.join(__dirname,'browser-report.json'),JSON.stringify(report,null,2));console.log('PAGES',report.pages.length,'FAILURES',report.failures.length);if(report.failures.length)process.exitCode=1;
})();
