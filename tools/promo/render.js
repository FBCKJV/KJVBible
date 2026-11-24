const {chromium}=require('playwright');
const M=['read','chapter','audio','plans','streak','search','card','back','tools','concord','dict','strongs','topics','doct','maps','timeline','hymns','glow','keep','notes','drill','drill2','share','links','tips','privacy','laptop','present','intro','outro','bezel','lbezel'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
for(const m of (process.argv[2]?process.argv[2].split(','):M)){
 await p.goto('file://'+__dirname+'/stage.html?m='+m);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
 await p.screenshot({path:__dirname+'/st-'+m+'.png',omitBackground:/bezel/.test(m)});}
await b.close();})();
