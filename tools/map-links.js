#!/usr/bin/env node
// Map how the study tools link to each other and back to Scripture.
//
//   node tools/map-links.js            prints the map and writes tools/link-map.json and tools/LINK-MAP.md
//   node tools/map-links.js person     only the stations whose name has "person"
//
// For each station (a tool's page, opened on a real entry in a phone-sized
// browser) it reads every link on the page and names where it goes by the
// function it calls (another tool, the chapter, a map, a study…). It is what
// a reader is offered on the page, not what the code looks like it can do.
// Back is checked as whole journeys in tools/check-app.js ("the trail back").
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

// Stations: a tool's page opened on a real entry. `sel` picks whose links are read (buttons, links and tappable rows inside it).
const STATIONS = [
  {name:'Chapter (Genesis 12)',  open:`jumpToRef('Genesis 12:1')`, sel:'#screen-reader .ch-map, #screen-reader #ch-jr button, #screen-reader #ch-jr a'},
  {name:'Verse card (Genesis 12:1)', open:`jumpToRef('Genesis 12:1').then(()=>openVPop('Genesis 12:1','Now the LORD had said unto Abram, Get thee out of thy country, and from thy kindred, and from thy father\\'s house, unto a land that I will shew thee:'))`, sel:'#vpop button, #vpop a', wait:2500},
  {name:'Verse card (Genesis 28:19)', open:`jumpToRef('Genesis 28:19').then(()=>openVPop('Genesis 28:19','And he called the name of that place Bethel: but the name of that city was called Luz at the first.'))`, sel:'#vpop button, #vpop a', wait:2500},
  {name:'Verse card (John 3:16)', open:`jumpToRef('John 3:16').then(()=>openVPop('John 3:16','For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'))`, sel:'#vpop button, #vpop a', wait:2500},
  {name:'Doctrine verses',      open:`(showScreen('search'), switchSearchMode('doctrine'), showDoctrineVerses(0,0))`, wait:2500, sel:'#doctrine-panel button, #doctrine-panel a'},
  {name:'Topic (Nave)',         open:`(showScreen('search'), switchSearchMode('topics'), openNaveTopic('FAITH'))`, sel:'#topic-view button, #topic-view a', hidden:true, pre:3500, wait:3000},
  {name:'Treasury (cross-refs)',open:`(showScreen('search'), switchSearchMode('topics'), openTreasury(tskKey('Genesis 1:1')))`, sel:'#xref-view button, #xref-view a', wait:2500},
  {name:'Name (Hitchcock)',     open:`(showScreen('search'), switchSearchMode('names'), openNamePage('bethel'))`, sel:'#name-view button, #name-view a'},
  {name:'Person',               open:`(showScreen('search'), switchSearchMode('names'), openPerson('David_1'))`, sel:'#person-view button, #person-view a', wait:3000},
  {name:'Place',                open:`(showScreen('search'), switchSearchMode('names'), openPlace('a64f355'))`, sel:'#place-view button, #place-view a'},
  {name:'Timeline event',       open:`(showScreen('search'), switchSearchMode('timeline'), openTimelineAt('tl-1-0'))`, sel:'#tl-pane button, #tl-pane a, #timeline-panel button, #timeline-panel a'},
  {name:'Journey',              open:`(showScreen('search'), switchSearchMode('journeys'), openJourney('abraham'))`, sel:'#wm-overlay button, #wm-overlay a', wait:3000},
  {name:'Classic map',          open:`(LS.set('kjv_mapmore_open', true), showScreen('search'), switchSearchMode('maps'), openMap(1))`, sel:'#map-overlay button, #map-overlay a', wait:3000},
  {name:'Dictionary word',      open:`(showScreen('search'), switchSearchMode('dict'), openWord('grace'))`, sel:'#word-view button, #word-view a'},
  {name:"Strong's word",        open:`(showScreen('search'), switchSearchMode('strongs'), openStrongs('G26'))`, sel:'#strongs-view button, #strongs-view a'},
  {name:'Concordance word',     open:`(showScreen('search'), switchSearchMode('concord'), openConcordWord('grace'))`, sel:'#concord-panel button, #concord-panel a'},
  {name:'Hymn (Amazing Grace)',               open:`(showScreen('search'), switchSearchMode('hymns'), openHymn(26))`, sel:'#hymn-view button, #hymn-view a'},
];

async function openApp(ctx, base){
  const p = await ctx.newPage(); p._errors = [];
  p.on('pageerror', e => p._errors.push(e.message));
  const wn = (fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/WHATS_NEW_VERSION = '([^']+)'/) || [])[1];
  await p.addInitScript(([wn]) => { localStorage.setItem('kjv_rc', 'MAPPER'); localStorage.setItem('kjv_whatsnew', wn); localStorage.setItem('kjv_hints_off', 'true'); }, [wn]);
  await p.goto(base + '/index.html'); await sleep(2200);
  return p;
}


// What a link does, by the function it calls
const TOOL = {
  jumpToRef:'Scripture', openPassage:'Scripture', xrPreview:'Scripture', tlPaneRead:'Scripture', jrRead:'Scripture', openHistoryChapter:'Scripture',
  openTreasuryFromVerse:'Cross-references', openTreasury:'Cross-references', openPersonFromVerse:'People', openPerson:'People', openPlaceFromVerse:'Places', openPlace:'Places',
  showVpopDictList:'Dictionary', showVpopNameList:'Names', openWordFromVerse:'Dictionary', openWord:'Dictionary', openDoctrineFromVerse:'Doctrines', openDoctrineFromSearch:'Doctrines', hymnsSearchFor:'Hymns',
  hyToggleFold:'Hymns', openHymn:'Hymns', sgToggleFold:"Hebrew & Greek", sgFilter:"Hebrew & Greek", strongsSearchFor:"Hebrew & Greek", openStrongs:"Hebrew & Greek",
  openJourney:'Journeys', jrView:'Journeys', jrGo:'Journeys', openChapterMap:'Maps', tlMap:'Maps', openWhereMap:'Maps', openMap:'Maps',
  vpopShowMap:'Maps', jrPlace:'Places', nbAddMap:'Study', shareMap:'Share', jrTimeline:'Timeline', openTimelineAt:'Timeline', openNaveTopicAt:'Topics (Nave)', openNaveTopic:'Topics (Nave)',
  concordSearch:'Concordance', selectConcordLetter:'Concordance', toggleConcordWord:'Concordance', placeSearch:'Search the Bible', namesSearch:'Search the Bible',
  nbAddVerse:'Study', nbAddHymn:'Study', nbAddPerson:'Study', nbAddPlace:'Study', nbAddWord:'Study', nbAddStrongs:'Study', nbAddEvent:'Study', nbAddDoctrine:'Study', nbAddTopic:'Study', hyStudy:'Study',
  toggleBM:'My Verses', colFromDoctrine:'My Verses', openNote:'Notes', saveNote:'Notes', singleScreenshot:'Card', addToClipboard:'Card', hyCard:'Card', presOpen:'Present', presFromReader:'Present', jrPresent:'Present',
  shareVerse:'Share', copyVerseLink:'Share', copyVerse:'Share', shareSub:'Share', hyShare:'Share',
};
const QUIET = new Set(['setHL','hlNameSheet','cancelNote','closePop','sayIt','toolTips','closePopover','docBackToList','toggleTreasuryLine','togglePersonVerses','togglePlaceVerses','wdShowAll','sgShowVerses','hyClear','hyTap','toggleNaveLine','mapZoom','closeMap','mapMoreToggle','toolTips','renderConcordHits','leaveVPopThen']);
(async () => {
  const {chromium} = loadPlaywright();
  const server = await serve(), base = `http://127.0.0.1:${server.address().port}`;
  const launch = {}; if(process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH; else if(fs.existsSync('/opt/pw-browsers/chromium')) launch.executablePath = '/opt/pw-browsers/chromium';
  const browser = await chromium.launch(launch), out = {};
  for(const st of STATIONS.filter(s => !ONLY.length || ONLY.some(o => s.name.toLowerCase().includes(o.toLowerCase())))){
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}}), p = await openApp(ctx, base);
    // "(showScreen('search'), switchSearchMode('x'), openThing())" runs as three steps, so the tool's list has drawn before its page opens
    const m = st.open.match(/^\(showScreen\('search'\), (switchSearchMode\('\w+'\)), (.+)\)$/);
    const steps = m ? ["showScreen('search')", m[1], m[2]] : [st.open];
    for(const [i, x] of steps.entries()){ await p.evaluate(x).catch(() => {}); await sleep(i < steps.length - 1 ? (st.pre || 1200) : (st.wait || 2200)); }
    const sel = st.sel + ', ' + st.sel.split(',').map(x => x.trim().replace(/ (button|a)$/, ' [onclick]')).join(', ');
    const links = await p.evaluate(([sel, hidden]) => [...document.querySelectorAll(sel)].filter(e => hidden || (e.getBoundingClientRect().width && e.getBoundingClientRect().height)).map(e => {
      const oc = (e.getAttribute('onclick') || '').replace(/event\.stopPropagation\(\);?/g, '');
      const fns = [...oc.matchAll(/\b([a-zA-Z]+)\(/g)].map(x => x[1]).filter(f => !['event','preventDefault','history','back','then','if','leaveVPopThen','leaveMapThen','stopPropagation'].includes(f));
      const t = (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      return {fn: fns[0] || (/🗺/.test(t) ? 'openMap' : /📅/.test(t) ? 'openTimelineAt' : /🎧/.test(t) ? 'openHymn' : '') || (e.dataset.ref || /^\d? ?[A-Za-z. ]+ \d+:\d+/.test(t) ? 'jumpToRef' : ''), t};
    }), [sel, !!st.hidden]);
    const by = {};
    links.forEach(l => { const k = TOOL[l.fn] || (QUIET.has(l.fn) || !l.fn ? null : '? ' + l.fn); if(!k) return; (by[k] = by[k] || new Set()).add(l.t); });
    out[st.name] = Object.fromEntries(Object.entries(by).map(([k, v]) => [k, [...v].slice(0, 3)]));
    console.log('\n■ ' + st.name + ' — leads to: ' + (Object.keys(out[st.name]).join(' · ') || '(nothing found)'));
    await ctx.close();
  }
  const file = path.join(__dirname, 'link-map.json');
  const all = fs.existsSync(file) && ONLY.length ? {...JSON.parse(fs.readFileSync(file, 'utf8')), ...out} : out;
  fs.writeFileSync(file, JSON.stringify(all, null, 1));
  const ORDER = ['Scripture','Cross-references','People','Places','Names','Dictionary','Hebrew & Greek','Doctrines','Topics (Nave)','Hymns','Timeline','Journeys','Maps','Concordance','Search the Bible','Study','My Verses','Notes','Card','Present','Share'];
  const rows = Object.entries(all).map(([st, by]) => `| ${st} | ${ORDER.filter(k => by[k]).join(' · ') || '—'} |`);
  fs.writeFileSync(path.join(__dirname, 'LINK-MAP.md'), `# What each page links to\n\nWritten by \`node tools/map-links.js\`: each tool's page opened on a real entry in a phone-sized browser, and every link on it read. \`Scripture\` means a tappable reference that opens the chapter. A Nave topic's and a place's verses appear when their fold is opened, so those Scripture links are not counted here.\n\n| Page | Leads to |\n|---|---|\n${rows.join('\n')}\n`);
  await browser.close(); server.close();
})();
