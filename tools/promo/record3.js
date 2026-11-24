// Laptop part: study notes beside the chapter, then Present
const {openApp,tap,sleep,recorder}=require('./lib');
(async()=>{const {p,browser,server}=await openApp({viewport:{width:1440,height:900},dsf:4/3,seed:{kjv_nudge_asked:true}});
const L=s=>p.locator(s+' >> visible=true').first();
const T=async(sel,o)=>tap(p,typeof sel==='string'?await L(sel).elementHandle():sel,o);
const H=fn=>p.evaluateHandle(fn);
await p.evaluate(()=>jumpToRef('Romans 5:1'));await sleep(1500);
await p.evaluate(()=>{document.getElementById('screen-reader').scrollTop=0;});await sleep(300);
await p.evaluate(()=>{Element.prototype.requestFullscreen=function(){return Promise.resolve();};document.documentElement.webkitRequestFullscreen=null;});
const r=await recorder(p,__dirname+'/rec-'+(process.argv[2]||'l'));
r.mark('laptop');
await sleep(1800);
// open the study notebook beside the chapter
await T(await H(()=>[...document.querySelectorAll('.hbtn')].find(b=>b.offsetParent&&b.textContent.includes('📝'))));await sleep(1500);
const ed='#nb-ed';
await T(ed);await p.keyboard.press('Control+End');
await p.keyboard.type('Peace with God',{delay:70});await p.keyboard.press('Enter');
await p.keyboard.type('Justified by faith, not by works. ',{delay:45});await p.keyboard.press('Enter');await sleep(500);
// a verse from the chapter goes into the study
await T('#verses .vblock[data-ref="Romans 5:1"]');await sleep(1400);
await T(await H(()=>[...document.querySelectorAll('#vpop .pa')].find(b=>/Add to Study/.test(b.textContent))));await sleep(1600);
await p.evaluate(()=>{const x=document.getElementById('vpop-x');if(x&&x.offsetParent)x.click();});await sleep(600);
await T('#verses .vblock[data-ref="Romans 5:8"]');await sleep(1200);
await T(await H(()=>[...document.querySelectorAll('#vpop .pa')].find(b=>/Add to Study/.test(b.textContent))));await sleep(1400);
await p.evaluate(()=>{const x=document.getElementById('vpop-x');if(x&&x.offsetParent)x.click();});await sleep(1800);
r.mark('present');
await T(await H(()=>[...document.querySelectorAll('#screen-reader button, .ch-present, button')].find(b=>b.offsetParent&&/Present/.test(b.textContent)&&b.getBoundingClientRect().left<1000)));await sleep(2800);
for(let k=0;k<3;k++){await p.keyboard.press('ArrowRight');await sleep(2300);}
r.mark('end');
await r.stop();
await browser.close();server.close();})();
