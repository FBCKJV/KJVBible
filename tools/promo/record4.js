// Phone part, each scene at least as long as its narration
//   node record4.js <name> <vo-dir>
const {openApp,tap,sleep,typeSlow,recorder}=require('./lib');
const fs=require('fs');
const LENS=JSON.parse(fs.readFileSync(__dirname+'/'+(process.argv[3]||'vo-mike')+'/lens.json'));
const LEAD=0.5, TAIL=0.9;
// a scene whose narration waits a moment for the screen to catch up (seconds)
const DELAY=JSON.parse(fs.readFileSync(__dirname+'/delays.json'));
const day=n=>{const d=new Date(2026,10,1+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const days={},chs={};for(let i=0;i<23;i++){days[i]=day(i);chs['19:'+i]=day(i);}
const seed={kjv_streak:23,kjv_streak_best:23,kjv_streak_last:day(22),kjv_streak_ts:String(Date.now()-86400000),kjv_streak_tokens:'2',kjv_nudge_asked:true,
  kjv_plans:{list:[{id:'demo1',plan:'prov',start:day(0),st:'active',days,chs,fin:null}]}};
(async()=>{const {p,browser,server}=await openApp({seed,showNotif:true});
const L=s=>p.locator(s+' >> visible=true').first();
const T=async(sel,o)=>tap(p,typeof sel==='string'?await L(sel).elementHandle():sel,o);
const H=fn=>p.evaluateHandle(fn);
const E=async fn=>(await H(fn)).asElement();
const glide=(sel,scr,at=300,ms=900)=>p.evaluate(([sel,scr,at,ms])=>{const s=typeof scr==='string'?document.getElementById(scr):scr;const t=typeof sel==='string'?document.querySelector(sel):null;const el=t||[...s.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent.trim()===sel.text);if(!el)return 'none';return __scrollAnim(s,el.getBoundingClientRect().top-at,ms);},[sel,scr,at,ms]);
const scrollBy=(id,dy,ms)=>p.evaluate(([id,dy,ms])=>__scrollAnim(document.getElementById(id),dy,ms),[id,dy,ms]);
const r=await recorder(p,__dirname+'/rec-'+(process.argv[2]||'n'));
let t0=0,cur=null;
const scene=async(key,fn)=>{
  if(cur) await pad();
  cur=key;t0=Date.now();r.mark(key);
  try{await fn();}catch(e){console.log('SCENE',key,'FAILED',e.message.split('\n')[0]);}
};
const pad=async()=>{const need=(LEAD+(DELAY[cur]||0)+(LENS[cur]||3)+TAIL)*1000-(Date.now()-t0);if(need>0)await sleep(need);else console.log('  over',cur,(-need/1000).toFixed(1)+'s');};
const hubTool=async name=>{const home=await E(()=>{const b=document.getElementById('cat-home');return b&&b.offsetParent?b:null;});
  if(home){await T(home);await sleep(600);} await T(`.hub-t >> text=${name}`);await sleep(800);};
const lp=async ref=>{await T(`#verses .vblock[data-ref="${ref}"]`,{hold:650,act:()=>p.evaluate(r=>{enterSelectMode();toggleVerseSelect(document.querySelector(`.vblock[data-ref="${r}"]`));},ref)});};

await scene('read',async()=>{await sleep(5200);await scrollBy('screen-books',380,1800);});
await scene('chapter',async()=>{
  await glide({text:'Psalms'},'screen-books',330,1300);await sleep(200);
  await T('#screen-books >> text=/^Psalms$/');await sleep(900);
  await T('.ch-btn >> text=/^23$/');await sleep(1600);
  await scrollBy('screen-reader',200,1500);
  await p.evaluate(()=>setTheme('light'));await sleep(1300);
  await p.evaluate(()=>setTheme('sepia'));await sleep(1300);
  await p.evaluate(()=>setTheme('dark'));await sleep(500);
  await scrollBy('screen-reader',900,2600);});
await scene('romans',async()=>{
  await T('#bn-books');await sleep(700);
  await glide('#rr-card','screen-books',300,1300);await sleep(300);
  await T('#rr-header');await sleep(1200);
  await scrollBy('screen-books',330,1400);await sleep(600);
  await T('.rr-step');await sleep(1500);});
await scene('audio',async()=>{
  await scrollBy('screen-reader',-3000,1000);await sleep(300);
  await T('#ch-play-btn');await sleep(3000);
  const moon=await E(()=>[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/🌙/.test(b.textContent)&&b.getBoundingClientRect().top>600));
  if(moon){await T(moon);await sleep(2400);await p.evaluate(()=>history.back());}});
await scene('plans',async()=>{
  await p.evaluate(()=>{try{scourbyStop();}catch(e){}});
  await T('#bn-plans');await sleep(3000);
  await scrollBy('screen-plans',520,2600);});
await scene('streak',async()=>{
  await scrollBy('screen-plans',-600,800);await sleep(200);
  await T('#screen-plans >> text=/reading calendar/');await sleep(3200);
  await p.evaluate(()=>{const o=[...document.querySelectorAll('*')].find(e=>{const s=getComputedStyle(e);return /auto|scroll/.test(s.overflowY)&&e.scrollHeight>e.clientHeight+50&&e.offsetParent&&e.getBoundingClientRect().top<120&&e.textContent.includes('day streak');});if(o)return __scrollAnim(o,500,2400);});
  await sleep(2600);});
await scene('search',async()=>{
  await p.evaluate(()=>history.back());await sleep(300);
  await T('#bn-search');await sleep(900);
  await T('#s-input');await typeSlow(p,'#s-input','everlasting life',75);await sleep(1800);
  const h=await E(()=>[...document.querySelectorAll('#screen-search *')].find(e=>/^John 3:16/.test(e.textContent.trim())&&e.children.length<3&&e.getBoundingClientRect().height>0));
  if(h){await p.evaluate(e=>{const s=document.getElementById('screen-search');return __scrollAnim(s,e.getBoundingClientRect().top-330,900);},h);await sleep(1100);await T(h);}
  await sleep(1600);
  if(!(await p.evaluate(()=>S.book==='John'&&S.ch===2&&document.getElementById('screen-reader').classList.contains('on')))){console.log('search fallback');await p.evaluate(()=>jumpToRef('John 3:16'));await sleep(1500);}});
await scene('card',async()=>{
  await glide('.vblock[data-ref="John 3:16"]','screen-reader',260,500);await sleep(400);
  await T('#verses .vblock[data-ref="John 3:16"]');await sleep(1500);
  await T(await H(()=>[...document.querySelectorAll('#vpop-txt .vw')].find(x=>x.textContent==='begotten')));await sleep(2300);
  await T('#vpop >> text=/Greek words/');await sleep(2000);
  await T('#vpop >> text=/Faith Alone/');await sleep(2300);});
await scene('back',async()=>{
  await p.evaluate(()=>history.back());await sleep(1300);
  await p.evaluate(()=>{const v=document.getElementById('vpop-def-x');if(v&&v.offsetParent)v.click();});
  await T(await H(()=>[...document.querySelectorAll('#vpop .xr-ref')].find(b=>/Rom 5:8/.test(b.textContent))));await sleep(2600);
  await T('#vpop-x');await sleep(400);});
await scene('tools',async()=>{await T('#bn-search');await sleep(1200);});
await scene('concord',async()=>{await hubTool('Concordance');await T('#concord-filter');await typeSlow(p,'#concord-filter','grace',60);await sleep(300);await T('#screen-search >> text=/^grace$/i');await sleep(1600);});
await scene('dict',async()=>{await hubTool('Dictionary');await T('#dict-input');await typeSlow(p,'#dict-input','charity',60);await sleep(400);await T('#screen-search .wd-row');await sleep(2200);});
await scene('strongs',async()=>{await hubTool('Hebrew');await T('#strongs-input');await typeSlow(p,'#strongs-input','love',60);await sleep(600);await T(await H(()=>[...document.querySelectorAll('#screen-search .wd-row')].find(b=>/G26\b/.test(b.textContent))));await sleep(2000);});
await scene('topics',async()=>{await hubTool('Topics');await T('#topics-filter');await typeSlow(p,'#topics-filter','prayer',60);await sleep(300);await T('#screen-search >> text=/^prayer$/i');await sleep(1800);});
await scene('doct',async()=>{await hubTool('Doctrines');await T('#screen-search .doc-cat-hdr');await sleep(700);await T('#screen-search .doc-topic');await sleep(2200);});
await scene('maps',async()=>{await hubTool('Maps');await glide({text:"Paul's first journey"},'screen-search',420,1000);await sleep(200);
  await T(await H(()=>[...document.querySelectorAll('#screen-search .jr-item')].find(b=>/Paul's first/.test(b.textContent))));await sleep(3200);
  for(let k=0;k<2;k++){const nx=await E(()=>[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/Next stop/.test(b.textContent)));if(nx){await T(nx);await sleep(2400);}}});
await scene('timeline',async()=>{await p.evaluate(()=>history.back());await sleep(700);await hubTool('Timeline');await sleep(600);await scrollBy('screen-search',900,2600);});
await scene('hymns',async()=>{await hubTool('Hymns');await sleep(1200);await T(await H(()=>[...document.querySelectorAll('#screen-search .hy-row, #screen-search [onclick^="openHymn"]')].find(b=>b.offsetParent)));await sleep(2200);await scrollBy('screen-search',250,1500);});
await scene('glow',async()=>{await hubTool('Verse Glow');await sleep(Math.max(5200,(LENS.glow||5)*1000-600));await p.evaluate(()=>history.back());await sleep(300);});
await scene('keep',async()=>{
  const b=await E(()=>{const b=document.getElementById('btn-return');return b&&b.offsetParent?b:null;});
  if(b) await T(b); else await p.evaluate(()=>jumpToRef('John 3:16'));
  await sleep(1300);
  if(!(await p.evaluate(()=>S.book==='John'&&document.getElementById('screen-reader').classList.contains('on')))){await p.evaluate(()=>jumpToRef('John 3:16'));await sleep(1200);}
  await glide('.vblock[data-ref="John 3:16"]','screen-reader',300,500);await sleep(400);
  await lp('John 3:16');await sleep(500);
  await T('#verses .vblock[data-ref="John 3:17"]');await sleep(700);
  await T('#multibar >> text=Highlight');await sleep(900);
  await T(await p.locator('text=Yellow >> visible=true').first().elementHandle());await sleep(1300);
  await lp('John 3:16');await sleep(500);
  await T('#multibar >> text=Save');await sleep(900);
  await T('#col-new-in');await p.type('#col-new-in','The Gospel',{delay:70});await sleep(300);
  await T('#col-new button');await sleep(1200);
  const dn=await E(()=>[...document.querySelectorAll('#col-sheet button')].find(b=>b.textContent.trim()==='Done'));if(dn){await T(dn);await sleep(600);}
  await p.evaluate(()=>{if(S.selectMode)exitSelectMode(true);});});
await scene('notes',async()=>{
  await glide('.vblock[data-ref="John 3:18"]','screen-reader',360,500);await sleep(300);
  await lp('John 3:18');await sleep(700);
  await T('#multibar >> text=Study');await sleep(1600);
  await T('#nb-btn');await sleep(2200);
  const ref=await E(()=>[...document.querySelectorAll('#nb-ed .nb-ref')].find(e=>/John 3:18/.test(e.textContent)));
  if(ref){await T(ref);await sleep(2200);} else console.log('no nb ref');});
await scene('drill',async()=>{
  await lp('John 3:17');await sleep(400);
  await T('#multibar >> text=Sword Drill');await sleep(1300);
  await p.evaluate(()=>startMem('John 3:17'));await sleep(1000);
  await T(await H(()=>[...document.querySelectorAll('.mg-mode')].find(b=>/First Letters/.test(b.textContent))));await sleep(400);
  const i=await E(()=>[...document.querySelectorAll('input')].find(i=>/first letter/i.test(i.placeholder)&&i.offsetParent));
  if(i){await i.focus();for(const c of 'FGsnhSitw'){await p.keyboard.type(c);await sleep(230);}}});
await scene('drill2',async()=>{
  const bk=await E(()=>{const b=document.getElementById('mem-back');return b&&b.offsetParent?b:null;});
  if(bk){await T(bk);await sleep(900);}
  await p.evaluate(()=>{const s=document.getElementById('mem-select');return __scrollAnim(s,s.scrollHeight-s.clientHeight-900,9000);});await sleep(2500);
  await p.evaluate(()=>{const s=document.getElementById('mem-select');return __scrollAnim(s,900,4000);});});
await scene('share',async()=>{
  await p.evaluate(()=>{history.back();});await sleep(300);await p.evaluate(()=>{history.back();});await sleep(400);
  await p.evaluate(()=>jumpToRef('Psalms 23:1'));await sleep(1300);
  await T('#verses .vblock[data-ref="Psalms 23:1"]');await sleep(1100);
  await T(await H(()=>[...document.querySelectorAll('#vpop .pa')].find(b=>b.textContent.trim()==='Screenshot')));await sleep(1500);
  for(const sc of ['meadow','sunrise']){await T(`[onclick="switchCardScene('${sc}')"]`);await sleep(1200);}
  await T('#ct-upload',{act:()=>p.setInputFiles('#card-photo-input',require('path').join(__dirname,'..','..','backgrounds','morning.jpg'))});await sleep(2000);
  const sh=await E(()=>[...document.querySelectorAll('#scr-overlay button')].find(b=>b.offsetParent&&/Share/.test(b.textContent)));if(sh){await T(sh,{act:false});}});
await scene('links',async()=>{
  await p.evaluate(()=>history.back());await sleep(700);
  const x=await E(()=>{const b=document.getElementById('vpop-x');return b&&b.offsetParent?b:null;});if(x){await T(x);await sleep(500);}
  await p.evaluate(async()=>{showScreen('search');await openHymn(26);});await sleep(1800);
  await T('#hymn-view .hy-st');await sleep(900);
  await T('#hybar >> text=/Card/');await sleep(2400);});
await scene('tips',async()=>{
  await p.evaluate(()=>history.back());await sleep(700);
  await p.evaluate(()=>openSettings());await sleep(1000);
  await T(await H(()=>[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/Tips & Help/.test(b.textContent))));await sleep(1600);
  await p.evaluate(()=>{const s=document.querySelector('#tips-sheet .tips-inner, #tips-sheet > div');if(s)return __scrollAnim(s,700,2200);});});
await scene('privacy',async()=>{
  await p.evaluate(()=>history.back());await sleep(700);
  await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/Privacy — what is kept/.test(b.textContent));b&&b.scrollIntoView({block:'center',behavior:'smooth'});});await sleep(1000);
  await T(await H(()=>[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/Privacy — what is kept/.test(b.textContent))));await sleep(2600);});
await pad();
r.mark('end');
await r.stop();
await browser.close();server.close();})();
