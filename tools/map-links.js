#!/usr/bin/env node
// Map how the study tools link to each other and back to Scripture.
//
//   node tools/map-links.js            prints the map and writes tools/link-map.json
//   node tools/map-links.js person     only the stations whose name has "person"
//
// For each station (a tool's page, opened on a real entry) it taps every link
// on the page in a phone-sized browser and records where the tap lands (the
// function the app called: another tool, the chapter, the verse card, a map…)
// and whether the phone's Back button returns to the station. The result is
// what a reader can actually do, not what the code looks like it can do.
// Same Playwright/Chromium setup as tools/check-app.js.

const fs = require('fs');
const path = require('path');
const http = require('http');
const ROOT = path.join(__dirname, '..');
const ONLY = process.argv.slice(2).filter(a => !a.startsWith('--'));

function loadPlaywright(){
  try{ return require('playwright'); }catch(e){}
  try{ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(e){}
  console.error('Playwright is not installed: npm i -g playwright'); process.exit(2);
}
const TYPES = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml'};
const serve = () => new Promise(r => {
  const s = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const f = path.join(ROOT, p === '/' ? 'index.html' : p);
    if(!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ res.writeHead(404); res.end(); return; }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const sleep = ms => new Promise(r => setTimeout(r, ms));

// The functions that carry a reader somewhere; each tap is named by the first one it calls
const NAV = {
  jumpToRef:'Scripture', openPassage:'Scripture', jumpToCh:'Scripture', openHistoryChapter:'Scripture', jumpRR:'Scripture',
  openVPop:'Verse card', openHymn:'Hymn', openStrongs:"Strong's", openWord:'Dictionary', openNaveTopic:'Topic (Nave)', openNaveTopicAt:'Topic (Nave)',
  openTreasury:'Treasury', openPerson:'Person', openPlace:'Place', openNamePage:'Name', openTimelineAt:'Timeline', openTimelinePane:'Timeline',
  openJourney:'Journey', openMap:'Map', openWhereMap:'Map', openChapterMap:'Map', showDoctrineVerses:'Doctrine', openDoctrineFromSearch:'Doctrine',
  openConcordWord:'Concordance', nbAddHymn:'Study (add)', nbAddVerse:'Study (add)', nbAdd:'Study (add)', openScrOverlay:'Card', shareSub:'Share', showSharePop:'Share',
  openMemorize:'Sword Drill', openPersonFromVerse:'Person', openPlaceFromVerse:'Place', openWordFromVerse:'Dictionary', openDoctrineFromVerse:'Doctrine', openTreasuryFromVerse:'Treasury',
};

// Stations: a tool's page opened on a real entry. `sel` picks what to tap (all links inside it).
const STATIONS = [
  {name:'Chapter (Genesis 12)',  open:`jumpToRef('Genesis 12:1')`, sel:'#screen-reader .ch-map, #screen-reader #ch-jr button, #screen-reader #ch-jr a'},
  {name:'Verse card (Genesis 12:1)', open:`jumpToRef('Genesis 12:1').then(()=>openVPop('Genesis 12:1','Now the LORD had said unto Abram, Get thee out of thy country, and from thy kindred, and from thy father\\'s house, unto a land that I will shew thee:'))`, sel:'#vpop button, #vpop a', wait:2500},
  {name:'Verse card (John 3:16)', open:`jumpToRef('John 3:16').then(()=>openVPop('John 3:16','For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'))`, sel:'#vpop button, #vpop a', wait:2500},
  {name:'Doctrine verses',      open:`(showScreen('search'), switchSearchMode('doctrine'), showDoctrineVerses(0,0))`, sel:'#doctrine-verses button, #doctrine-verses a, #doctrine-view button, #doctrine-view a'},
  {name:'Topic (Nave)',         open:`(showScreen('search'), switchSearchMode('topics'), openNaveTopic('faith'))`, sel:'#topic-view button, #topic-view a'},
  {name:'Treasury (cross-refs)',open:`(showScreen('search'), switchSearchMode('topics'), openTreasury('Genesis 1:1'))`, sel:'#xref-view button, #xref-view a'},
  {name:'Name (Hitchcock)',     open:`(showScreen('search'), switchSearchMode('names'), openNamePage('abraham'))`, sel:'#name-view button, #name-view a'},
  {name:'Person',               open:`(showScreen('search'), switchSearchMode('names'), openPerson('Adam_1'))`, sel:'#person-view button, #person-view a'},
  {name:'Place',                open:`(showScreen('search'), switchSearchMode('names'), openPlace('a64f355'))`, sel:'#place-view button, #place-view a'},
  {name:'Timeline event',       open:`(showScreen('search'), switchSearchMode('timeline'), openTimelineAt('tl-1-0'))`, sel:'#tl-pane button, #tl-pane a, #timeline-panel button, #timeline-panel a'},
  {name:'Journey',              open:`(showScreen('search'), switchSearchMode('journeys'), openJourney('abraham'))`, sel:'#journey-view button, #journey-view a, #journeys-panel button, #journeys-panel a'},
  {name:'Classic map',          open:`(showScreen('search'), switchSearchMode('maps'), openMap(0))`, sel:'#maps-panel button, #maps-panel a, #map-view button, #map-view a'},
  {name:'Dictionary word',      open:`(showScreen('search'), switchSearchMode('dict'), openWord('grace'))`, sel:'#word-view button, #word-view a'},
  {name:"Strong's word",        open:`(showScreen('search'), switchSearchMode('strongs'), openStrongs('G26'))`, sel:'#strongs-view button, #strongs-view a'},
  {name:'Concordance word',     open:`(showScreen('search'), switchSearchMode('concordance'), openConcordWord('grace'))`, sel:'#concordance-panel button, #concordance-panel a'},
  {name:'Hymn',                 open:`(showScreen('search'), switchSearchMode('hymns'), openHymn(0))`, sel:'#hymn-view button, #hymn-view a'},
];

const PAGE_FUNCS = JSON.stringify(Object.keys(NAV));
async function openApp(ctx, base){
  const p = await ctx.newPage(); p._errors = [];
  p.on('pageerror', e => p._errors.push(e.message));
  const wn = (fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/WHATS_NEW_VERSION = '([^']+)'/) || [])[1];
  await p.addInitScript(([wn]) => { localStorage.setItem('kjv_rc', 'MAPPER'); localStorage.setItem('kjv_whatsnew', wn); localStorage.setItem('kjv_hints_off', 'true'); }, [wn]);
  await p.goto(base + '/index.html'); await sleep(2200);
  // log every navigation call
  await p.evaluate(names => {
    window.__nav = [];
    names.forEach(n => { const o = window[n]; if(typeof o !== 'function') return;
      window[n] = function(...a){ window.__nav.push([n, a.map(x => typeof x === 'string' ? x.slice(0, 40) : typeof x === 'number' ? x : '').join(',')]); return o.apply(this, a); }; });
    window.__sig = () => JSON.stringify({scr: S.screen, sub: S._subView ? S._subView.sub + ':' + S._subView.key : '', ref: S.book + ' ' + S.ch,
      vpop: document.getElementById('vpop').classList.contains('on'),
      ov: [...document.querySelectorAll('.on,[style*="display: block"],[style*="display:block"]')].map(e => e.id).filter(Boolean).slice(0, 30).join(',')});
  }, JSON.parse(PAGE_FUNCS));
  return p;
}

(async () => {
  const {chromium} = loadPlaywright();
  const server = await serve(), base = `http://127.0.0.1:${server.address().port}`;
  const launch = {}; if(process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH; else if(fs.existsSync('/opt/pw-browsers/chromium')) launch.executablePath = '/opt/pw-browsers/chromium';
  const browser = await chromium.launch(launch), out = {};
  for(const st of STATIONS.filter(s => !ONLY.length || ONLY.some(o => s.name.toLowerCase().includes(o.toLowerCase())))){
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}}), p = await openApp(ctx, base);
    const reopen = async () => { await p.evaluate(`window.__nav = []`); await p.evaluate(st.open).catch(() => {}); await sleep(st.wait || 1800); await p.evaluate(`window.__nav = []`); };
    await reopen();
    // distinct, visible links on the station
    const links = await p.evaluate(sel => {
      const seen = new Set(), res = [];
      [...document.querySelectorAll(sel)].forEach((e, i) => {
        const r = e.getBoundingClientRect(); if(!r.width || !r.height || getComputedStyle(e).visibility === 'hidden') return;
        const label = (e.textContent || e.getAttribute('aria-label') || e.title || '').replace(/\s+/g, ' ').trim().slice(0, 50);
        const key = (e.getAttribute('onclick') || '') + '|' + label.replace(/\d+/g, '#');
        if(seen.has(key)) return; seen.add(key); res.push({i, label});
      });
      return res;
    }, st.sel);
    const rows = [];
    for(const l of links.slice(0, 40)){
      await reopen();
      const before = await p.evaluate('__sig()');
      const clicked = await p.evaluate(([sel, i]) => { const e = document.querySelectorAll(sel)[i]; if(!e) return false; e.click(); return true; }, [st.sel, l.i]);
      if(!clicked){ continue; }
      await sleep(1100);
      const log = await p.evaluate('__nav'), after = await p.evaluate('__sig()');
      const first = log.find(([n]) => NAV[n]);
      const dest = first ? NAV[first[0]] : (after !== before ? 'other' : 'in place');
      await p.evaluate(() => history.back()); await sleep(900);
      const back = await p.evaluate('__sig()');
      rows.push({label: l.label, dest, call: first ? first[0] + '(' + first[1] + ')' : '', backToStation: dest === 'in place' ? null : back === before || JSON.parse(back).sub === JSON.parse(before).sub && JSON.parse(back).ref === JSON.parse(before).ref && JSON.parse(back).scr === JSON.parse(before).scr});
    }
    out[st.name] = rows;
    const by = {}; rows.forEach(r => by[r.dest] = (by[r.dest] || 0) + 1);
    console.log(`\n■ ${st.name}  —  ${rows.length} links${p._errors.length ? '  (page errors: ' + p._errors.length + ')' : ''}`);
    console.log('  → ' + Object.entries(by).map(([k, v]) => `${k} ${v}`).join(' · '));
    const noBack = rows.filter(r => r.backToStation === false); if(noBack.length) console.log('  Back did not return from: ' + noBack.map(r => `“${r.label}” (${r.dest})`).join('; '));
    await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, 'link-map.json'), JSON.stringify(out, null, 1));
  await browser.close(); server.close();
})();
