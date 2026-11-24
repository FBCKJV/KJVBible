const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.webp':'image/webp','.css':'text/css'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function serve(){const s=http.createServer((q,r)=>{const p=decodeURIComponent(new URL(q.url,'http://x').pathname);const f=path.join(ROOT,p==='/'?'index.html':p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});return new Promise(r=>s.listen(0,'127.0.0.1',()=>r(s)));}
const DEMO_CSS=`#notif-banner{display:none!important}
#__tap{position:fixed;z-index:2147483647;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;pointer-events:none;
 background:rgba(255,255,255,.35);border:2px solid rgba(255,255,255,.85);box-shadow:0 0 12px rgba(0,0,0,.35);opacity:0;transform:scale(.6);transition:opacity .18s,transform .18s}
#__tap.on{opacity:1;transform:scale(1)}#__tap.hold{transform:scale(1.25);background:rgba(232,190,100,.45)}`;
async function openApp(opts={}){
  const server=await serve();const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:opts.viewport||{width:390,height:844},deviceScaleFactor:opts.dsf||2});
  // nothing leaves this machine except the fonts: no cloud backup, push or analytics
  await ctx.route(u=>!/^http:\/\/127\.0\.0\.1|fonts\.(googleapis|gstatic)\.com/.test(u.href),r=>r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>console.log('PAGEERR',e.message));
  const WN=fs.readFileSync(ROOT+'/index.html','utf8').match(/WHATS_NEW_VERSION = '([^']+)'/)[1];
  // full screen would change the recording's size mid-scene (Verse Glow, Present): stay in the page
  await p.addInitScript(()=>{Element.prototype.requestFullscreen=function(){return Promise.resolve();};Element.prototype.webkitRequestFullscreen=function(){};});
  await p.addInitScript(([wn,seed])=>{if(sessionStorage.getItem('__s'))return;sessionStorage.setItem('__s',1);
    localStorage.setItem('kjv_rc','DEMO01');localStorage.setItem('kjv_whatsnew',wn);localStorage.setItem('kjv_hints_off','true');
    for(const [k,v] of Object.entries(seed||{})) localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v));},[WN,opts.seed]);
  await p.goto(base+'/index.html');await sleep(2500);
  await p.addStyleTag({content:opts.showNotif?DEMO_CSS.replace('#notif-banner{display:none!important}',''):DEMO_CSS});
  await p.evaluate(()=>{const d=document.createElement('div');d.id='__tap';document.body.appendChild(d);
    window.__scrollAnim=(el,dy,ms)=>new Promise(res=>{el=el||document.scrollingElement;const s=el.scrollTop,t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/ms);const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;el.scrollTop=s+dy*e;k<1?requestAnimationFrame(f):res();};requestAnimationFrame(f);});});
  return {p,ctx,browser,server,base};
}
// a visible tap on an element, then the action
async function tap(p,sel,{act=true,hold=0,nth=0,offset}={}){
  let h=typeof sel==='string'?(await p.$$(sel))[nth]:sel; if(h&&h.asElement) h=h.asElement(); if(!h) throw new Error('no element: '+sel);
  await h.scrollIntoViewIfNeeded().catch(()=>{});
  const b=await h.boundingBox(); const x=b.x+(offset?offset[0]:b.width/2), y=b.y+(offset?offset[1]:b.height/2);
  await p.evaluate(([x,y,hold])=>{const d=document.getElementById('__tap');d.style.left=x+'px';d.style.top=y+'px';d.classList.add('on');if(hold)setTimeout(()=>d.classList.add('hold'),150);},[x,y,hold]);
  await sleep(hold||320);
  if(act===true) await p.mouse.click(x,y);
  else if(typeof act==='function') await act();
  await sleep(140); await p.evaluate(()=>{const d=document.getElementById('__tap');d.classList.remove('on','hold');});
  return {x,y};
}
async function typeSlow(p,sel,text,ms=110){await p.focus(sel);for(const ch of text){await p.keyboard.type(ch);await sleep(ms);}}
// screencast recorder: frames to a new folder, with their times and the scene marks
async function recorder(p,dir){
  fs.mkdirSync(dir,{recursive:true});
  const cdp=await p.context().newCDPSession(p);const frames=[];let n=0;let on=true;
  cdp.on('Page.screencastFrame',async f=>{if(on){const fn=path.join(dir,String(n++).padStart(6,'0')+'.jpg');fs.writeFileSync(fn,Buffer.from(f.data,'base64'));frames.push([fn,f.metadata.timestamp]);}cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,everyNthFrame:1});
  const marks=[];const t0=Date.now()/1000;
  return {mark:(id)=>{marks.push([id,Date.now()/1000]);console.log('mark',id,(Date.now()/1000-t0).toFixed(1));},
    stop:async()=>{await sleep(300);on=false;await cdp.send('Page.stopScreencast');
      const out={frames,marks,end:Date.now()/1000};fs.writeFileSync(dir+'.json',JSON.stringify(out));return out;}};
}
module.exports={openApp,tap,typeSlow,recorder,sleep};
