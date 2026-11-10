(() => {
 const config=window.MCA_CONFIG||{}, engine=window.MCAInventory;
 const lang=document.documentElement.lang.slice(0,2);
 const dictionary=window.ADVISOR_I18N?.[lang]||{};
 const tr=text=>dictionary[text]||(text==='New or used vehicle?'?local('New or used vehicle?','سيارة جديدة أم مستعملة؟','¿Vehículo nuevo o usado?'):text==='New vehicle'?local('New vehicle','سيارة جديدة','Vehículo nuevo'):text);
 const local=(en,ar,es)=>lang==='ar'?ar:lang==='es'?es:en;
 const launch=document.getElementById('mca-chat-button'),dialog=document.getElementById('mca-chat');
 if(!launch||!dialog||!engine||!config.chatEnabled)return;
 launch.hidden=false;
 const step=document.getElementById('mca-chat-step'),form=document.getElementById('mca-chat-lead'),back=document.getElementById('mca-chat-back'),status=form.querySelector('.mca-status');
 let index=0, answers={}, selected=null, submitting=false, completed=false, currentFeed=null, resultVersion=0;
 const questions=[
  {key:'type',title:config.siteName==='My Car Advisor'?'New Mazda, Used Car, or Not Sure?':'New or used vehicle?',options:[config.siteName==='My Car Advisor'?'New Mazda':'New vehicle','Used Car','Not Sure']},
  {key:'payment',title:'How would you like to pay?',options:['Finance','Cash','Not Sure'],optional:true},
  {key:'credit',title:'How would you describe your credit?',options:['Excellent','Good','Fair','Poor','Prefer Not to Say'],optional:true},
  {key:'budget',title:'What budget feels comfortable?',optional:true},
  {key:'body',title:'Which vehicle style do you prefer?',options:['SUV','Sedan','Truck','Other'],optional:true},
  {key:'trade_in',title:'Do you have a trade-in?',options:['Yes','No'],optional:true},
  {key:'timeline',title:'When are you planning to buy?',options:['As soon as possible','Within a month','1–3 months','Later','Not Sure'],optional:true},
  {key:'location',title:'Which city and state are you in?',optional:false},
  {key:'model',title:'Any preferred vehicle or model?',optional:true}
 ];
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=tr(text);if(cls)n.className=cls;return n;};
 const button=(text,fn,cls='mca-primary')=>{const b=el('button',text,cls);b.type='button';b.addEventListener('click',fn);return b;};
 function focusStep(){dialog.scrollTop=0;const h=step.querySelector('h3');if(h){h.tabIndex=-1;h.focus({preventScroll:true});dialog.scrollTop=0;}}
 function answer(key,value){answers[key]=value;selected=null;index++;render();}
 function render(){
  step.replaceChildren();form.hidden=true;form.querySelector('[type=submit]').disabled=false;back.hidden=index===0;status.textContent='';completed=false;
  if(index>=questions.length){results();return;}
  const q=questions[index];step.append(el('p',local(`Question ${index+1} of ${questions.length}`,`السؤال ${index+1} من ${questions.length}`,`Pregunta ${index+1} de ${questions.length}`),'mca-disclosure'),el('h3',q.title));
  if(q.key==='credit')step.append(el('p','Optional, self-reported category only. This does not determine approval.','mca-disclosure'));
  if(q.options){const opts=el('div',undefined,'mca-options');for(const value of q.options)opts.append(button(value,()=>answer(q.key,value)));step.append(opts);}
  else {
   const entry=el('form');
   if(q.key==='budget'){
    const label=el('label','Budget type'),kind=el('select');kind.name='budgetKind';kind.setAttribute('aria-label','Budget type');
    for(const text of ['Total price','Monthly payment']){const o=el('option',text);o.value=text;kind.append(o);}kind.value=answers.budgetKind||'Total price';label.append(kind);
    const amountLabel=el('label','Maximum amount ($)'),amount=el('input');amount.type='number';amount.min='1';amount.max='10000000';amount.step='1';amount.required=true;amount.inputMode='numeric';amount.setAttribute('aria-label','Maximum budget');amount.value=answers.budgetAmount||'';amountLabel.append(amount);entry.append(label,amountLabel);
    step.append(el('p','Monthly payments depend on financing terms; we will not infer a vehicle price or promise approval from a monthly budget.','mca-disclosure'));
    entry.addEventListener('submit',e=>{e.preventDefault();if(!entry.reportValidity())return;answers.budgetKind=kind.value;answers.budgetAmount=amount.value;answer('budget',`$${amount.value} — ${kind.value}`);});
   }else{
    const label=el('label',q.key==='location'?'City and state':'Preferred model (optional)'),input=el('input');input.name=q.key;input.required=q.key==='location';input.maxLength=120;input.value=answers[q.key]||'';input.autocomplete='off';label.append(input);entry.append(label);
    entry.addEventListener('submit',e=>{e.preventDefault();if(!entry.reportValidity())return;answer(q.key,input.value.trim());});
   }
   const next=el('button','Continue','mca-primary');next.type='submit';entry.append(next);step.append(entry);
  }
  if(q.optional)step.append(button('Skip this question',()=>{if(q.key==='budget'){delete answers.budgetKind;delete answers.budgetAmount;}answer(q.key,'');},'mca-secondary'));
  focusStep();
 }
 function showContact(){
  if(!config.leadFormEnabled){step.append(el('p','Online requests are not yet enabled. email alisys10@gmail.com to discuss your preferences.'));return;}
  form.hidden=false;status.textContent='';document.getElementById('mca-trade-details').hidden=answers.trade_in!=='Yes';if(answers.trade_in!=='Yes')form.elements.trade_details.value='';
  const vals={shopping_type:answers.type||'Not Sure',vehicle:answers.model||answers.type||'Not specified',budget:answers.budget||'Not specified',payment:answers.payment||'Not specified',credit:answers.credit||'Not provided',body:answers.body||'Not specified',trade_in:answers.trade_in||'Not provided',timeline:answers.timeline||'Not specified',selected_vehicle:selected?`${selected.year} ${selected.make} ${selected.model}`:'Ali to find options',dealership:selected?(engine.dealers.find(d=>d.id===selected.dealerId)?.name||selected.sourceLabel||selected.dealerId):'Not selected',vin:selected?.vin||'',listing_url:selected?.url||'',source:location.pathname,location:answers.location||''};
  for(const [key,value] of Object.entries(vals)){const field=form.elements.namedItem(key);if(field)field.value=value;}
  const review=document.getElementById('mca-chat-review');review.replaceChildren();
  for(const [key,value] of Object.entries(vals)){review.append(el('dt',key.replaceAll('_',' ')),el('dd',value||'Not provided'));}
 }
 async function results(){
  const version=++resultVersion;
  step.append(el('h3','Let’s find the right options for you'));
  const pending=el('p',local('Checking source listings…','جارٍ التحقق من بيانات السيارات…','Buscando anuncios…'));step.append(pending);
  let feed=null;
  try{feed=await window.advisorFetchInventory();}catch{}
  if(version!==resultVersion||index<questions.length)return;
  pending.remove();currentFeed=feed;
  const matches=engine.match(feed,answers);
  if(matches.length){
   step.append(el('p',local(`${matches.length} matching source listings (maximum 10). Ali must confirm availability and final price.`,`${matches.length} سيارات مطابقة من المصدر (حتى 10). يؤكد علي التوفر والسعر النهائي.`,`${matches.length} anuncios coincidentes (máximo 10). Ali confirmará disponibilidad y precio.`)));
   if(answers.budgetKind==='Monthly payment')step.append(el('p',local('Monthly payment affordability requires lender terms; these results are not a payment quote.','تحديد القسط يتطلب شروط الجهة الممولة؛ هذه النتائج ليست عرض أقساط.','Los pagos requieren condiciones del prestamista; estos resultados no son una cotización.')));
   for(const v of matches){
    const card=el('article',undefined,'mca-card');
    const photo=engine.photoURL(feed,v);
    if(photo){const image=el('img');image.src=photo;image.alt=`${v.year} ${v.make} ${v.model}`;image.loading='lazy';image.referrerPolicy='no-referrer';image.addEventListener('error',()=>image.remove());card.append(image);}
    card.append(el('h3',`${v.year} ${v.make} ${v.model}`));
    card.append(el('p',Number.isFinite(v.price)?`$${v.price.toLocaleString('en-US')} — `+local('advertised price; taxes and fees may apply','السعر المعلن؛ قد تضاف الضرائب والرسوم','precio anunciado; pueden aplicar impuestos y cargos'):local('Price: ask Ali','السعر: اسأل علي','Precio: consulte a Ali')));
    card.append(el('p',`${v.mileage!=null?v.mileage.toLocaleString('en-US')+' miles · ':''}VIN: ${v.vin}`));
    card.append(el('p',local('Source: ','المصدر: ','Fuente: ')+(v.sourceLabel||v.dealerId)));
    card.append(button(local("I'm interested — contact Ali",'مهتم بالسيارة — تواصل مع علي','Me interesa — contactar a Ali'),()=>{selected=v;showContact();form.scrollIntoView({block:'nearest'});form.elements.namedItem('name').focus();window.advisorTrack?.('vehicle_interest')}));step.append(card);
   }
  }else{
   step.append(el('p',local('No matching listings could be verified right now. Your preferences stay here; Ali can check for suitable vehicles.','لا توجد نتائج مطابقة مؤكدة الآن. تبقى خياراتك هنا ليبحث علي عن السيارة المناسبة.','No hay anuncios coincidentes verificados. Ali puede buscar según sus preferencias.')));
  }
  step.append(button('Let Ali Find Suitable Options',()=>{selected=null;showContact();if(!form.hidden){form.scrollIntoView({block:'nearest'});form.elements.namedItem('name').focus();}}));
  focusStep();
 }
 function close(){if(!submitting){dialog.close();launch.focus({preventScroll:true});dialog.scrollTop=0;}}
 launch.addEventListener('click',()=>{dialog.showModal();if(!step.childNodes.length)render();});
 document.getElementById('mca-chat-close').addEventListener('click',close);
 dialog.addEventListener('cancel',e=>{if(submitting)e.preventDefault();});
 back.addEventListener('click',()=>{if(submitting)return;index=Math.max(0,index-1);selected=null;resultVersion++;render();});
 document.getElementById('mca-chat-reset').addEventListener('click',()=>{if(submitting)return;form.reset();answers={};selected=null;index=0;render();});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(submitting||completed||!config.leadFormEnabled||!form.reportValidity())return;
  if(form.elements.website.value){status.textContent='Request could not be confirmed. Please email alisys10@gmail.com.';return;}
  const phone=form.elements.phone.value.trim(),email=form.elements.email.value.trim();
  if(!/^\+?[\d\s().-]{7,30}$/.test(phone)||phone.replace(/\D/g,'').length<10||phone.replace(/\D/g,'').length>15){status.textContent='Please enter a valid phone number.';return;}
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status.textContent='Please enter a valid email or leave it blank.';return;}
  if(window.advisorPreview?.()){status.textContent=local('Local preview: nothing was sent.','معاينة محلية: لم يتم إرسال الطلب.','Vista previa: no se envió nada.');return;}
  window.advisorPrepareForm?.(form);
  if(selected&&!engine.match(currentFeed,answers).some(v=>v.vin===selected.vin)){selected=null;render();step.prepend(el('p','That vehicle’s verification expired. Ask Ali to check it again.'));return;}
  form.elements.source.value=location.pathname;
  const payload=new URLSearchParams(new FormData(form));
  const send=form.querySelector('[type=submit]');submitting=true;send.disabled=true;status.textContent=local('Sending your request…','جارٍ إرسال طلبك…','Enviando su solicitud…');
  try{
   const response=await fetch('/thank-you.html',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:payload.toString(),signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw Error('submission');
   completed=true;form.reset();answers={};selected=null;index=0;
   document.getElementById('mca-chat-review').replaceChildren();
   status.textContent=local('Request submitted to Ali.','تم تقديم طلبك لعلي.','Solicitud enviada a Ali.');
   document.dispatchEvent(new Event('mca:lead-submitted'));
  }catch{status.textContent=local('Submission could not be confirmed. Retry or email alisys10@gmail.com; your details remain here.','تعذر تأكيد الإرسال. حاول ثانية أو راسل alisys10@gmail.com؛ بياناتك ما زالت هنا.','No se pudo confirmar el envío. Reintente o escriba a alisys10@gmail.com.');}
  finally{submitting=false;send.disabled=completed;}
 });
})();
