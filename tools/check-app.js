#!/usr/bin/env node
// Check the app in a phone-sized browser before pushing
//
//   node tools/check-app.js            every check
//   node tools/check-app.js strongs    only the checks whose name has "strongs"
//   node tools/check-app.js --shots    also save screenshots (light and dark) to tools/check-shots/
//
// Starts its own small web server over the repository, opens index.html in
// Chromium at 390×844 and walks the journeys people take every day: reading
// and the streak, the verse card, Search and every study tool, Strong's,
// Back, first-use hints, the cloud backup and the backup file. Each check
// runs in a fresh browser (its own storage). Prints ✓ or ✗ for each and
// exits 1 if any fails, so it can sit in front of a push.
//
// Needs Playwright (npm i -g playwright, or in this folder) and its Chromium;
// set CHROMIUM_PATH to use another Chromium. The cloud backup is checked
// against a stand-in for Firestore (below) that keeps its 1 MB record limit
// and can refuse records or go offline — the live Firebase project is never
// touched. Outside services the page loads (Firebase, OneSignal, analytics)
// may be unreachable; that is expected and not a failure.

const fs = require('fs');
const path = require('path');
const http = require('http');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots');
const ONLY = args.filter(a => !a.startsWith('--'));
const SHOT_DIR = path.join(__dirname, 'check-shots');

function loadPlaywright(){
  try{ return require('playwright'); }catch(e){}
  try{ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(e){}
  console.error('Playwright is not installed: npm i -g playwright (then npx playwright install chromium)');
  process.exit(2);
}

/* ── A static server over the repository ── */
const TYPES = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.css':'text/css',
  '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json', '.txt':'text/plain'};
function serve(){
  const server = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(ROOT, p === '/' ? 'index.html' : p);
    if(!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){ res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

/* ── A stand-in for Firestore, run inside the page ──
   Records live in window.__store by path. __offline fails every call as the
   SDK does offline; __denySub refuses records below users/{code} (as rules
   that cover only users/{code} would); __limit lowers the 1 MB record limit. */
const FIRESTORE_STANDIN = `
window.__store = {}; window.__writes = 0;
const DEL = {__del:1}, TS = {__ts:1};
window.firebase = {firestore:{FieldValue:{delete:()=>DEL, serverTimestamp:()=>TS}}};
const err = (code, m) => Object.assign(new Error(m), {code});
function chk(p){
  if(window.__offline) throw err('unavailable', 'Failed to get document because the client is offline.');
  if(window.__denySub && p.split('/').length > 2) throw err('permission-denied', 'Missing or insufficient permissions.');
}
function mk(path){ return {path, id: path.split('/').pop(),
  collection: n => ({doc: id => mk(path + '/' + n + '/' + id)}),
  get: async () => { chk(path); const d = __store[path]; return {exists: !!d, data: () => d ? JSON.parse(JSON.stringify(d)) : undefined}; }}; }
_db = { collection: n => ({doc: id => mk(n + '/' + id)}),
  runTransaction: async fn => {
    if(window.__offline) throw err('unavailable', 'offline');
    const W = [];
    const r = await fn({get: ref => ref.get(), set: (ref, d, o) => W.push(['s', ref.path, d, o && o.merge]), delete: ref => W.push(['d', ref.path])});
    const next = {...__store};
    for(const [op, p, d, merge] of W){
      chk(p);
      if(op === 'd'){ delete next[p]; continue; }
      const cur = merge ? {...(next[p] || {})} : {};
      for(const [k, v] of Object.entries(d)){ if(v === DEL) delete cur[k]; else cur[k] = v === TS ? Date.now() : v; }
      const size = JSON.stringify(cur).length;
      if(size > (window.__limit || 1048576)) throw err('invalid-argument', 'Document cannot be written because its size (' + size + ' bytes) exceeds the maximum allowed size of 1,048,576 bytes.');
      next[p] = cur;
    }
    window.__store = next; window.__writes += W.length;
    return r;
  } };
// devices: each keeps its own localStorage, swapped in and out
window.__dev = {};
window.useDevice = (name, code) => {
  if(window.__cur) __dev[window.__cur] = Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]));
  localStorage.clear();
  Object.entries(__dev[name] || {kjv_rc: code || 'TESTAA', kjv_whatsnew: WHATS_NEW_VERSION, kjv_hints_off: 'true'}).forEach(([k, v]) => localStorage.setItem(k, v));
  window.__cur = name; S._nb = null; S._stGot = {};
};
window.studiesHere = () => (LS.get('kjv_studies', {list: []}).list || []).map(x => x.id + ':' + x.h).sort().join(' | ');
window.mkStudies = ids => LS.set('kjv_studies', {active: ids[0], list: ids.map(id => ({id, t: 'Study ' + id, h: '<p>body of ' + id + '</p>', u: Date.now()}))});
window.cloudOf = code => { const m = __store['users/' + code] || {};
  return {ix: m.kjv_studies_ix ? Object.keys(JSON.parse(m.kjv_studies_ix)).sort().join(',') : null, legacy: m.kjv_studies !== undefined,
    subs: Object.keys(__store).filter(k => k.startsWith('users/' + code + '/studies/')).map(k => k.split('/').pop()).sort().join(',')}; };
window.careShown = () => document.getElementById('care-toast').classList.contains('on') ? document.getElementById('care-msg').textContent : '';
`;

/* ── The checks ──
   Each gets a page already open on the app (fresh storage, What's New seen,
   hints off unless opts.hints) and returns nothing or throws. */
const sleep = ms => new Promise(r => setTimeout(r, ms));
function assert(cond, msg){ if(!cond) throw new Error(msg); }
const CHECKS = [];
const check = (name, fn, opts = {}) => CHECKS.push({name, fn, opts});

check('scripts parse', async () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  let n = 0;
  for(const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)){
    if(/application\/ld\+json/.test(m[1])){ JSON.parse(m[2]); continue; }
    new vm.Script(m[2], {filename: 'index.html inline script ' + (++n)});
  }
  new vm.Script(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'), {filename: 'sw.js'});
}, {noPage: true});

check('versions agree (sw.js and What\'s New)', async () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const cache = (sw.match(/CACHE_NAME = 'fbckjv-bible-(v\d+)/) || [])[1], wn = (html.match(/WHATS_NEW_VERSION = '(v\d+)'/) || [])[1];
  assert(cache && wn && cache === wn, `sw.js CACHE_NAME major ${cache} ≠ WHATS_NEW_VERSION ${wn}`);
  assert(html.includes(`data-wn="${wn}"`), `no What's New item for ${wn}`);
}, {noPage: true});

check('every classic map has its picture and is kept for offline use', async () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const list = (html.match(/const MAPS=\[([\s\S]*?)\n\];/) || [])[1] || '', files = [...list.matchAll(/f:'([^']+)'/g)].map(m => m[1]);
  assert(files.length >= 11, `only ${files.length} maps found in MAPS`);
  for(const f of files){
    assert(fs.existsSync(path.join(ROOT, 'maps', f + '.jpg')), `maps/${f}.jpg is missing`);
    assert(sw.includes(`'maps/${f}.jpg'`), `maps/${f}.jpg is not in sw.js MAP_ASSETS`);
  }
  for(const m of html.matchAll(/\['([^']+)',\d+,\d+,'([^']+)'\]/g)) assert(files.includes(m[2]), `CHAPTER_MAPS ${m[1]} names no map ${m[2]}`);
}, {noPage: true});

check('hymn and verse indexes and the Psalm titles match their sources (rebuild if this fails)', async () => {
  const {execFileSync} = require('child_process');
  for(const b of ['build-hymns.js', 'build-verse-index.js', 'build-psalm-titles.js']){
    try{ execFileSync(process.execPath, [path.join(__dirname, b), '--check'], {stdio: 'pipe'}); }
    catch(e){ throw new Error(String(e.stdout || e.message).trim()); }
  }
}, {noPage: true});

check('chapter audio: every chapter has its own stretch of the recording, in order', async () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const T = JSON.parse(html.match(/const SCOURBY_TS = (\{.*?\});\n/)[1]);
  const bad = [];
  for(const [b, t] of Object.entries(T)){
    const n = JSON.parse(fs.readFileSync(path.join(ROOT, 'bible', b.replace(/ /g, '') + '.json'))).chapters.length;
    if(t.c.length !== n || t.e.length !== n) bad.push(`${b}: ${t.c.length} timings for ${n} chapters`);
    for(let i = 0; i < t.c.length; i++){
      if(t.e[i] - t.c[i] < 8) bad.push(`${b} ${i + 1} is only ${(t.e[i] - t.c[i]).toFixed(1)}s`);
      if(i && t.c[i] < t.e[i - 1]) bad.push(`${b} ${i + 1} starts before ${i} ends`);
    }
  }
  assert(!bad.length, bad.slice(0, 5).join('; '));
}, {noPage: true});

check('reading: a chapter read to the end keeps the streak', async (p, ctx) => {
  await p.evaluate(() => { const y = new Date(Date.now() - 864e5);
    LS.set('kjv_streak', 5); LS.set('kjv_streak_last', `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`);
    LS.set('kjv_streak_ts', Date.now() - 864e5); loadStreak(); });
  await p.evaluate(() => jumpToRef('Romans 2:1'));
  await p.clock.runFor(1000);
  assert(await p.evaluate(() => S.streak) === 5, 'opening a chapter from a link should not count yet');
  for(let i = 0; i < 6; i++){
    await p.evaluate(() => { const s = document.getElementById('screen-reader'); s.scrollTop = s.scrollHeight; window.scrollTo(0, 1e6); s.dispatchEvent(new Event('scroll')); });
    await p.clock.runFor(5000);
  }
  const r = await p.evaluate(() => ({streak: S.streak, logged: (readLog()[todayStr()] || []).includes('44:1')}));
  assert(r.logged, 'Romans 2 was not logged as read');
  assert(r.streak === 6, `streak should be 6 after reading to the end, is ${r.streak}`);
}, {clock: true});

check('home: Scripture first, swipe the Verse of the Day, Undo', async p => {
  const order = await p.evaluate(() => [...document.querySelectorAll('#books-inner > div > *')].map(e => e.id || e.className.split(' ')[0]).filter(Boolean));
  const at = k => order.indexOf(k);
  assert(at('vod-wrap') < at('tsec-ot') && at('tsec-ot') < at('tsec-nt') && at('tsec-nt') < at('rr-card') && at('rr-card') < at('home-search'), 'Home order is wrong: ' + order.join(' '));
  const h = await p.evaluate(() => ['#tsec-ot .t-label', '#tsec-nt .t-label', '#rr-header'].map(s => Math.round(document.querySelector(s).getBoundingClientRect().height)));
  assert(h[0] === h[1] && h[1] === h[2] && h[0] >= 60, 'the three big headers differ in size: ' + h);
  await p.evaluate(() => { document.getElementById('home-search').scrollIntoView(); document.getElementById('books-inner').parentElement.scrollTop = 0; });
  const b = await p.locator('#vod').boundingBox();
  await p.mouse.move(b.x + 80, b.y + 30); await p.mouse.down(); await p.mouse.move(b.x + 300, b.y + 30, {steps: 6}); await p.mouse.up();
  await sleep(500);
  assert(await p.evaluate(() => getComputedStyle(document.getElementById('vod-wrap')).display) === 'none', 'a swipe should put the verse away');
  assert(await p.evaluate(() => S.screen !== 'reader' && !document.getElementById('screen-reader')?.classList.contains('active')), 'a swipe must not open the chapter');
  await p.reload(); await sleep(2200);
  assert(await p.evaluate(() => getComputedStyle(document.getElementById('vod-wrap')).display) === 'none', 'it should stay away for the day');
  await p.evaluate(() => vodUndo());
  assert(await p.evaluate(() => getComputedStyle(document.getElementById('vod-wrap')).display) !== 'none', 'Undo should bring it back');
});

check('verse card: Strong\'s fold and a word', async p => {
  await p.evaluate(() => jumpToRef('John 3:16')); await sleep(1200);
  await p.evaluate(() => { const d = S.bookData.chapters[2].verses[15]; openVPop('John 3:16', d.text); sgToggleFold(); });
  await sleep(1500);
  const chips = await p.evaluate(() => [...document.querySelectorAll('.sg-chip')].map(x => x.textContent));
  assert(chips.some(c => /^loved\s*G25$/.test(c)), `John 3:16 should show “loved G25”, got ${chips.join(' | ')}`);
  await p.evaluate(() => [...document.querySelectorAll('.sg-chip')].find(x => /loved/.test(x.textContent)).click());
  await sleep(300);
  const det = await p.evaluate(() => document.getElementById('sg-det').textContent.replace(/\s+/g, ' ').trim());
  assert(/agap.*G25/.test(det), 'the word detail did not open: ' + det.slice(0, 80));
  await p.evaluate(() => document.querySelector('#sg-det .vl-chip').click()); await sleep(1500);
  assert(await p.evaluate(() => S._subView && S._subView.key) === 'G25', 'Full entry did not open G25');
  await p.evaluate(() => history.back()); await sleep(800);
  const st = await p.evaluate(() => ({screen: S.screen, book: S.book, vpop: document.getElementById('vpop').classList.contains('on')}));
  assert(st.screen === 'reader' && st.book === 'John' && !st.vpop, `Back should return to John with the card closed, got ${JSON.stringify(st)}`);
});

check('search: every study tool opens and Back leaves it', async p => {
  const tools = await p.evaluate(() => SEARCH_TOOLS.map(t => t.m));
  await p.evaluate(() => showScreen('search')); await sleep(400);
  for(const m of tools){
    await p.evaluate(m => switchSearchMode(m), m); await sleep(900);
    const on = await p.evaluate(() => currentSearchMode());
    assert(on === m, `tool ${m} did not open (on ${on})`);
    await p.evaluate(() => history.back()); await sleep(400);
  }
});

check('search: G26 and a word reach Hebrew & Greek', async p => {
  await p.evaluate(() => { showScreen('search'); switchSearchMode('search'); const i = document.getElementById('s-input'); i.value = 'G26'; handleSearch('G26'); });
  await sleep(2500);
  assert((await p.evaluate(() => (S._toolHits || []).map(r => r.t))).includes('Strong’s G26'), 'no Strong’s G26 row');
  await p.evaluate(() => { const i = document.getElementById('s-input'); i.value = 'mercy'; handleSearch('mercy'); });
  await sleep(3000);
  assert((await p.evaluate(() => (S._toolHits || []).map(r => r.t))).some(t => /Hebrew & Greek/.test(t)), 'no Hebrew & Greek row for “mercy”');
});

check('search: everyday words, a spelling fix, and no stale results', async p => {
  await p.evaluate(() => { showScreen('search'); switchSearchMode('search'); });
  const run = async (q, wait = 1500) => { await p.evaluate(q => searchFor(q), q); await sleep(wait);
    return p.evaluate(() => ({refs: (S._searchResults || []).map(r => r.ref), fixed: S._searchFixedTo, status: (document.getElementById('s-status') || {}).textContent})); };
  let r = await run('your word is a lamp', 6000);
  assert(r.refs.includes('Psalms 119:105'), '“your word is a lamp” did not find Psalm 119:105');
  r = await run('god loves');
  assert(r.refs.includes('2 Corinthians 9:7'), '“god loves” did not find “God loveth a cheerful giver”');
  r = await run('he teaches');
  assert(r.refs.includes('Psalms 18:34'), '“he teaches” did not find “He teacheth my hands to war”');
  r = await run('salvaton');
  assert(r.fixed === 'salvation' && r.refs.includes('Genesis 49:18'), '“salvaton” was not put right: ' + r.status);
  await p.evaluate(() => searchAsTyped()); await sleep(1200);
  assert(await p.evaluate(() => !S._searchFixedTo && !(S._searchResults || []).length), '“Search for … instead” did not search what was typed');
  r = await run('jesus heals');
  assert(r.refs[0] && !/^Matthew 1:/.test(r.refs[0]), 'closest matches for “jesus heals” did not put the rarer word first: ' + r.refs[0]);
  // A range of chapters is a reference, not words
  await p.evaluate(() => { const i = document.getElementById('s-input'); i.value = '2 Samuel 11-12'; doSearch('2 Samuel 11-12'); });
  await sleep(1500);
  assert(await p.evaluate(() => { const t = document.getElementById('s-results').textContent; return /2 Samuel 11–12/.test(t) && document.querySelectorAll('#s-results .rc-ref').length > 50 && !/closest/.test(t); }), '“2 Samuel 11-12” was not read as two chapters');
  // Typing over a search still finishing never shows the old results
  await p.evaluate(() => { const i = document.getElementById('s-input'); i.value = 'grace'; handleSearch('grace'); });
  await sleep(500);
  await p.evaluate(() => { const i = document.getElementById('s-input'); i.value = 'mercy'; handleSearch('mercy'); });
  await sleep(1500);
  assert(await p.evaluate(() => S._searchQuery === 'mercy' && /mercy/.test(document.getElementById('s-status').textContent)), 'the results are not for the last words typed');
  // The Testament buttons leave Hebrew & Greek's own buttons alone
  await p.evaluate(() => setSearchFilter('nt')); await sleep(800);
  assert(await p.evaluate(() => !!document.querySelector('#sg-lang .sf-btn.on')), 'the Testament buttons cleared the Hebrew & Greek buttons');
  assert(await p.evaluate(() => (S._searchResults || []).every(r => isNT(r.book))), 'New Testament filter let Old Testament verses through');
  await p.evaluate(() => setSearchFilter('all'));
});

check('search: other forms of a word find the verse (being interpreted a stone → John 1:42)', async p => {
  await p.evaluate(() => { showScreen('search'); switchSearchMode('search'); searchFor('being interpreted a stone'); });
  await sleep(6000);
  const first = await p.evaluate(() => { const r = document.querySelector('#s-results .rc .rc-ref'); return r ? r.textContent : ''; });
  assert(/John 1:42/.test(first), 'first result shown was ' + first);
});

check('bug sweep: a slow book, a study saved, a list kept, Sword Drill’s add sheet, the certificate', async p => {
  // Two books tapped quickly: the second wins, with its own text
  await p.route('**/bible/Genesis.json', async r => { await sleep(1500); r.continue(); });
  await p.evaluate(() => { delete S.cache.Genesis; delete S.cache.Exodus; selectBook('Genesis'); setTimeout(() => selectBook('Exodus'), 150); });
  await sleep(2500);
  const bk = await p.evaluate(() => ({book: S.book, n: S.bookData && S.bookData.chapters.length, grid: document.getElementById('chs-grid').children.length}));
  assert(bk.book === 'Exodus' && bk.n === 40 && bk.grid === 40, 'book race: ' + JSON.stringify(bk));
  // Typing in a study, then straight to another study: the typing is kept
  await p.evaluate(() => { nbOpen(); const ed = document.getElementById('nb-ed'); ed.innerHTML = '<p>kept words</p>'; ed.dispatchEvent(new Event('input', {bubbles: true})); });
  await sleep(100);
  await p.evaluate(() => { const a = nbActive().id; nbOpenStudy(null); S._keptId = a; });
  await sleep(600);
  assert(await p.evaluate(() => /kept words/.test(nbData().list.find(x => x.id === S._keptId).h)), 'typing was lost when another study opened');
  await p.evaluate(() => history.back()); await sleep(400);
  // ＋ Add with a list's own name never takes the verse out
  await p.evaluate(() => { LS.set('kjv_collections', {list: [{id: 'c1', n: 'Comfort', items: [{a: 'John 3:16', r: 'John 3:16', t: 'For God so loved'}], u: 1}]}); colIndex && colIndex();
    colSheet([{a: 'John 3:16', r: 'John 3:16', t: 'For God so loved'}]); document.getElementById('col-new-in').value = 'comfort'; colNewFromSheet(); });
  await sleep(300);
  assert(await p.evaluate(() => colLists().find(c => c.id === 'c1').items.length === 1), '＋ Add removed the verse');
  await p.evaluate(() => history.back()); await sleep(400);
  // Sword Drill: Add your own verse shows above the list
  await p.evaluate(() => { openMemorize(); }); await sleep(800);
  await p.evaluate(() => memAddOpen()); await sleep(500);
  const top = await p.evaluate(() => { const b = document.getElementById('memadd-save').getBoundingClientRect(); const el = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return !!(el && el.closest('#memadd-sheet')); });
  assert(top, 'the Add a Verse sheet is hidden behind Sword Drill');
  await p.evaluate(() => history.back()); await sleep(400);
  // The certificate: a Style tap redraws the certificate, not an older card
  await p.evaluate(() => { openScrOverlay([{ref: 'John 3:16', vnum: '16', txt: 'For God so loved the world'}], 'John 3:16'); });
  await sleep(500); await p.evaluate(() => history.back()); await sleep(400);
  await p.evaluate(() => openSwordCertificate()); await sleep(500);
  const w0 = await p.evaluate(() => document.getElementById('scr-canvas').width);
  await p.evaluate(() => switchCardTheme('light')); await sleep(400);
  const after = await p.evaluate(() => ({w: document.getElementById('scr-canvas').width, ref: S.scrRef}));
  assert(after.w === w0 && after.ref === 'Sword Drill Certificate', 'a Style tap replaced the certificate: ' + JSON.stringify(after));
});

check('strongs: list search, page, filter, deep link', async p => {
  await p.evaluate(() => strongsSearchFor('mercy')); await sleep(2500);
  const first = await p.evaluate(() => (document.querySelector('#strongs-results .wd-row') || {}).dataset?.k);
  assert(first === 'H2617', `“mercy” should find H2617 first, got ${first}`);
  for(const [q, want] of [['agape', 'G26'], ['chesed', 'H2617'], ['g26', 'G26']]){
    const k = await p.evaluate(q => { document.getElementById('strongs-input').value = q; handleStrongsSearch(q); return (document.querySelector('#strongs-results .wd-row') || {}).dataset?.k; }, q);
    assert(k === want, `“${q}” should find ${want} first, got ${k}`);
  }
  await p.evaluate(() => openStrongs('G25')); await sleep(2000);
  await p.evaluate(() => sgFilter(1)); await sleep(2500);
  const h = await p.evaluate(() => document.getElementById('sg-vh').textContent);
  assert(/verses where it is rendered “loved”/.test(h), `filter did not narrow: ${h}`);
  await p.evaluate(() => { location.hash = '#strongs=H2617'; }); await sleep(2000);
  assert(await p.evaluate(() => S._subView && S._subView.key) === 'H2617', 'deep link #strongs=H2617 did not open');
});

check('dictionary: a word links to Hebrew & Greek', async p => {
  await p.evaluate(() => openWord('grace')); await sleep(1500);
  const b = await p.evaluate(() => [...document.querySelectorAll('#word-view .pp-find')].map(x => x.textContent).join(' | '));
  assert(/Hebrew & Greek behind “grace”/.test(b), 'no Hebrew & Greek link on the Dictionary page');
});

check('hymns: the grown hymnal, grouped by section, old numbers unchanged', async p => {
  await p.evaluate(() => { showScreen('search'); switchSearchMode('hymns'); }); await sleep(1500);
  const r = await p.evaluate(async () => {
    const H = await loadHymns();
    await renderHymns();
    const heads = [...document.querySelectorAll('#hymns-list .hy-sec')].map(x => x.textContent);
    const rows = document.querySelectorAll('#hymns-list .hy-row').length;
    await openHymn(0);
    const first = document.querySelector('#hymn-view .dv-title').textContent;
    const last = H.length - 1;
    await openHymn(last);
    return {n: H.length, rows, heads, first, lastTitle: H[last][0], shown: document.querySelector('#hymn-view .dv-title').textContent,
      refs: document.querySelectorAll('#hymn-view .hy-refs .vl-chip').length,
      bad: H.filter(h => !h[4].length || !h[5].length || h[5].some(st => !st.length) || !(h[2] > 1500 && h[2] < 1928)).map(h => h[0]),
      dup: H.length - new Set(H.map(h => h[0])).size};
  });
  assert(r.n >= 200, `only ${r.n} hymns`);
  assert(r.rows === r.n, `${r.rows} rows for ${r.n} hymns`);
  assert(new Set(r.heads).size === r.heads.length, 'a section heading is repeated: ' + r.heads.join(' | '));
  assert(r.first === 'Holy, Holy, Holy', 'hymn 0 is now ' + r.first);
  assert(r.shown === r.lastTitle && r.refs > 0, 'the last hymn does not open with its Scriptures');
  assert(!r.bad.length, 'hymns with no refs, no words or a year outside 1500–1927: ' + r.bad.join(', '));
  assert(!r.dup, r.dup + ' duplicate titles');
});

check('verse card: 🎵 a hymn on the verse opens it; a verse with none shows nothing', async p => {
  const r = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    LS.set('kjv_hy_open', true);
    await jumpToRef('Isaiah 6:3'); await wait(1500);
    openVPop('Isaiah 6:3', 'Holy, holy, holy, is the LORD of hosts'); await wait(1500);
    const fold = document.getElementById('vpop-hy');
    const shown = fold.style.display !== 'none', text = fold.textContent;
    const row = fold.querySelector('.hy-row'); if(row) row.click();
    await wait(2000);
    const opened = (document.querySelector('#hymn-view .dv-title') || {}).textContent;
    history.back(); await wait(1500);
    const back = {screen: S.screen, book: S.book, ch: S.ch};
    await jumpToRef('Genesis 1:1'); await wait(1200);
    openVPop('Genesis 1:1', 'In the beginning God created the heaven and the earth.'); await wait(1500);
    const none = document.getElementById('vpop-hy').style.display === 'none';
    LS.set('kjv_hy_open', false);
    return {shown, text, opened, none, back};
  });
  assert(r.shown && /Holy, Holy, Holy/.test(r.text), 'no hymn fold on Isaiah 6:3: ' + r.text);
  assert(r.opened === 'Holy, Holy, Holy', 'tapping the hymn opened ' + r.opened);
  assert(r.none, 'a hymn fold shows on Genesis 1:1');
  assert(r.back.book === 'Isaiah' && r.back.ch === 5, 'Back from the hymn left ' + JSON.stringify(r.back));
});

check('the trail back: verse → card → Strong\'s → another chapter, then Back, Back lands where you started', async p => {
  const r = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), at = () => ({screen: S.screen, sub: S._subView ? S._subView.sub + ':' + S._subView.key : '', book: S.book, ch: S.ch + 1});
    await jumpToRef('John 3:16'); await wait(1500);
    openVPop('John 3:16', 'For God so loved the world'); await wait(800);
    leaveVPopThen(() => openStrongs('G26')); await wait(1800);
    const strongs = at();
    await jumpToRef('Matthew 24:12'); await wait(1500);
    const away = at();
    history.back(); await wait(1200); const back1 = at();
    history.back(); await wait(1200); const back2 = at();
    // and from a person page: a verse, then Back returns to the person
    showScreen('search'); switchSearchMode('names'); await wait(1200);
    await openPerson('Adam_1'); await wait(1500);
    await jumpToRef('1 Corinthians 15:45'); await wait(1500);
    history.back(); await wait(1200); const person = at();
    return {strongs, away, back1, back2, person};
  });
  assert(r.strongs.sub === 'strongs:G26', 'the Strong\'s page did not open: ' + JSON.stringify(r.strongs));
  assert(r.away.screen === 'reader' && r.away.book === 'Matthew', 'the verse did not open Matthew 24');
  assert(r.back1.screen === 'search' && r.back1.sub === 'strongs:G26', 'Back from the verse should return to the Strong\'s page: ' + JSON.stringify(r.back1));
  assert(r.back2.screen === 'reader' && r.back2.book === 'John' && r.back2.ch === 3, 'Back again should land in John 3, where it started: ' + JSON.stringify(r.back2));
  assert(r.person.screen === 'search' && r.person.sub === 'person:Adam_1', 'Back from a verse should return to the person page: ' + JSON.stringify(r.person));
});

check('verse card: 🧭 When & where opens the timeline or a journey, Back returns to the chapter', async p => {
  const r = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), at = () => ({screen: S.screen, book: S.book, ch: S.ch + 1, vpop: document.getElementById('vpop').classList.contains('on')});
    LS.set('kjv_when_open', true);
    const card = async (ref, txt) => { await jumpToRef(ref); await wait(1500); openVPop(ref, txt); await wait(1800); const el = document.getElementById('vpop-when'); return {shown: el.style.display !== 'none', text: el.textContent, row: el.querySelector('.hy-row')}; };
    const flood = await card('Genesis 6:8', 'But Noah found grace in the eyes of the LORD.');
    flood.row.click(); await wait(2000);
    const tl = {screen: S.screen, sub: (document.querySelector('.tl-ev.here, #tl-panel .here') || {}).id || '', url: location.href.length > 0};
    history.back(); await wait(1500); const afterTl = at();
    const bethel = await card('Genesis 28:19', 'And he called the name of that place Bethel');
    const jrow = [...document.querySelectorAll('#vpop-when .hy-row')].find(x => /🧭/.test(x.textContent)); jrow.click(); await wait(2500);
    const jr = {overlay: document.getElementById('wm-overlay').classList.contains('on'), jr: !!(S._jr && S._jr.j), title: S._jr && S._jr.j && S._jr.j.t};
    history.back(); await wait(1500); const afterJr = at();
    const none = await card('Genesis 1:2', 'And the earth was without form, and void;');
    LS.set('kjv_when_open', false);
    return {flood: {shown: flood.shown, text: flood.text}, tl, afterTl, bethel: {shown: bethel.shown, text: bethel.text}, jr, afterJr, none: none.shown};
  });
  assert(r.flood.shown && /The Flood/.test(r.flood.text), 'Genesis 6:8 has no timeline row: ' + r.flood.text);
  assert(r.afterTl.screen === 'reader' && r.afterTl.book === 'Genesis' && r.afterTl.ch === 6, 'Back from the timeline left ' + JSON.stringify(r.afterTl));
  assert(r.bethel.shown && /Bethel/.test(r.bethel.text), 'Genesis 28:19 has no journey row: ' + r.bethel.text);
  assert(r.jr.overlay && r.jr.jr, 'the journey did not open: ' + JSON.stringify(r.jr));
  assert(r.afterJr.screen === 'reader' && r.afterJr.book === 'Genesis' && r.afterJr.ch === 28, 'Back from the journey left ' + JSON.stringify(r.afterJr));
  assert(!r.none, 'a fold shows on Genesis 1:2');
});

check('person, place and journey stop lead to one another; Back returns each time', async p => {
  const r = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), sub = () => S._subView ? S._subView.sub + ':' + S._subView.key : S.screen;
    const chips = id => [...document.querySelectorAll('#' + id + ' .pp-chip')].map(b => b.getAttribute('onclick'));
    showScreen('search'); switchSearchMode('names'); await wait(1200);
    await openPerson('David_1'); await wait(2500);
    const david = chips('pp-story'), sg = !!document.querySelector('#person-view .pp-chip[onclick^="strongsSearchFor"]');
    document.querySelector('#pp-story .pp-chip[onclick^="openPlace"]').click(); await wait(2000);
    const toPlace = sub(); history.back(); await wait(1500); const backPerson = sub();
    const bethelId = Object.keys(S._places).find(k => S._places[k].n === 'Bethel');
    await openPlace(bethelId); await wait(2500);
    const bethel = chips('pl-story');
    document.querySelector('#pl-story .pp-chip[onclick^="openPerson"]').click(); await wait(2000);
    const toPerson = sub(); history.back(); await wait(1500); const backPlace = sub();
    await openJourney('jacob', 1); await wait(2500);
    const btn = document.querySelector('#wm-list .jr-pl'); const stop = btn && btn.textContent;
    if(btn) btn.click(); await wait(2500); const fromStop = sub();
    return {david, sg, toPlace, backPerson, bethel, toPerson, backPlace, stop, fromStop, bethelId};
  });
  assert(r.sg, 'no Hebrew & Greek button on David');
  assert(r.david.some(c => /openTimelineAt/.test(c)) && r.david.some(c => /openJourney/.test(c)) && r.david.some(c => /openPlace/.test(c)), 'David\'s story lacks timeline, journeys or places: ' + r.david.join(' '));
  assert(/^place:/.test(r.toPlace) && r.backPerson === 'person:David_1', `place chip went to ${r.toPlace}, Back to ${r.backPerson}`);
  assert(r.bethel.some(c => /openPerson\('Jacob_1'\)/.test(c)), 'Bethel does not list Jacob: ' + r.bethel.join(' '));
  assert(/^person:/.test(r.toPerson) && r.backPlace === 'place:' + r.bethelId, `person chip went to ${r.toPerson}, Back to ${r.backPlace}`);
  assert(r.stop && /^place:/.test(r.fromStop), `the journey stop (${r.stop}) did not open its place: ${r.fromStop}`);
});

check('a journey stop\'s verse opens its chapter; Back returns to the same stop, then closes the journey', async p => {
  const r = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    await openJourney('david', 0); await wait(2500);
    const st = S._jr.j.s[S._jr.i], v = document.querySelector('#wm-list .jr-v');
    if(v) v.click(); await wait(2500);
    const el = document.querySelector(`#verses .vblock[data-ref="${st.r}"]`);
    const wmOn = () => document.getElementById('wm-overlay').classList.contains('on');
    const atRead = S.screen;
    history.back(); await wait(2500); const back1 = {on: wmOn(), id: S._jr.j.id, i: S._jr.i};
    jrPlace(); await wait(2500); const toPlace = !wmOn() && S._subView && S._subView.sub;
    history.back(); await wait(2500); const back2 = {on: wmOn(), i: S._jr.i};
    history.back(); await wait(1500); const back3 = wmOn();
    return {atRead, back1, toPlace, back2, back3, ref: st.r, tappable: !!v && v.getAttribute('role') === 'button', screen: atRead, book: S.book, ch: S.ch + 1, found: !!el,
            overlay: document.getElementById('wm-overlay').classList.contains('on')};
  });
  assert(r.tappable, 'the stop\'s verse is not tappable');
  assert(r.screen === 'reader' && r.found && r.ref.startsWith(r.book + ' ' + r.ch + ':'), 'tapping the stop\'s verse left ' + JSON.stringify(r));
  assert(r.back1.on && r.back1.id === 'david' && r.back1.i === 0, 'Back from the chapter did not bring the journey back at its stop: ' + JSON.stringify(r.back1));
  assert(r.toPlace === 'place' && r.back2.on && r.back2.i === 0, 'Back from the stop\'s place did not bring the journey back: ' + JSON.stringify(r));
  assert(!r.back3, 'Back again did not close the journey');
});

check('verse card scenes: the Morning devotion photo loads in both orientations', async p => {
  const r = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    await wait(1500);
    return ['morning', 'morning_land'].map(k => [k, _bgImgs[k] && _bgImgs[k].naturalWidth]).concat([['swatch', !!document.querySelector('.ct-swatch[data-s="morning"]')], ['scene', typeof CARD_SCENES.morning]]);
  });
  assert(r[0][1] > 0 && r[1][1] > 0 && r[2][1] && r[3][1] === 'function', 'morning scene missing: ' + JSON.stringify(r));
});

check('classic maps: every passage is real; verses, journeys and places open, Back closes the map first', async p => {
  const r = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), bad = [];
    for(const [f, L] of Object.entries(MAP_LINKS)){
      if(!MAPS.some(m => m.f === f)) bad.push('no map ' + f);
      for(const ref of L.refs) for(const v of mapRefVerses(ref)){
        const m = v.match(/^(.+) (\d+):(\d+)$/), d = await fetchBook(m[1]), ch = d && d.chapters[+m[2] - 1];
        if(!ch || !ch.verses.some(x => +x.verse === +m[3])) bad.push(v);
      }
      const J = await loadJourneys(); for(const id of L.jr) if(!J.some(j => j.id === id)) bad.push('no journey ' + id);
    }
    LS.set('kjv_mapmore_open', true);
    showScreen('search'); switchSearchMode('maps'); await wait(800);
    const i = MAPS.findIndex(m => m.f === 'exodus-sinai');
    openMap(i); await wait(2500);
    const chips = [...document.querySelectorAll('#mm-body .mm-chip')].map(b => b.textContent);
    const hasPlace = chips.some(c => /📍/.test(c)), hasJr = chips.some(c => /🧭/.test(c));
    document.querySelector('#mm-body .mm-chip').click(); await wait(2000);
    const verse = {screen: S.screen, book: S.book, ch: S.ch + 1, map: document.getElementById('map-overlay').classList.contains('on')};
    openMap(i); await wait(2500);
    [...document.querySelectorAll('#mm-body .mm-chip')].find(b => /📍/.test(b.textContent)).click(); await wait(2500);
    const place = {sub: S._subView && S._subView.sub, map: document.getElementById('map-overlay').classList.contains('on')};
    history.back(); await wait(1500);
    LS.set('kjv_mapmore_open', false);
    return {bad, chips, hasPlace, hasJr, verse, place, after: {screen: S.screen, map: document.getElementById('map-overlay').classList.contains('on')}};
  });
  assert(!r.bad.length, 'map links that do not exist: ' + r.bad.join(', '));
  assert(r.hasPlace && r.hasJr, 'the Exodus map lacks places or journeys: ' + r.chips.join(' | '));
  assert(r.verse.screen === 'reader' && r.verse.book === 'Exodus' && r.verse.ch === 12 && !r.verse.map, 'the first passage did not open Exodus 12: ' + JSON.stringify(r.verse));
  assert(r.place.sub === 'place' && !r.place.map, 'a place chip did not open the place page: ' + JSON.stringify(r.place));
});

check('the churches journey: pins with no line, its classic map from the top; the plate only where a chapter names places', async p => {
  const r = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), btn = id => getComputedStyle(document.getElementById(id)).display !== 'none';
    showScreen('search'); switchSearchMode('maps'); await wait(800);
    await openJourney('churches'); await wait(1500);
    const lines = document.querySelectorAll('#wm-map .wm-route path').length, stops = S._jr.j.s.length;
    jrGo(5); await wait(500);
    const after = document.querySelectorAll('#wm-map .wm-route path').length;
    const chip = [...document.querySelectorAll('#wm-sub .vl-chip')].find(b => /Classic map/.test(b.textContent));
    if(chip) chip.click(); await wait(1500);
    const plate = document.getElementById('map-overlay').classList.contains('on') && S._mapOpen === MAPS.findIndex(m => m.f === 'local-churches');
    history.back(); await wait(1200);
    await openJourney('paul2'); await wait(1500);
    const paulLines = document.querySelectorAll('#wm-map .wm-route path').length;
    history.back(); await wait(1200);
    jumpToRef('Romans 8:1'); await wait(2500);
    const romans8 = btn('ch-map-btn') || btn('ch-where-btn');
    jumpToRef('Revelation 2:1'); await wait(2500);
    const rev2 = {where: btn('ch-where-btn'), plate: btn('ch-map-btn'), jr: document.getElementById('ch-jr').textContent};
    return {lines, after, stops, chip: !!chip, plate, paulLines, romans8, rev2};
  });
  assert(r.stops === 33 && r.lines === 0 && r.after === 0, `the churches journey drew a line or lost stops: ${JSON.stringify(r)}`);
  assert(r.paulLines > 0, "Paul's second journey lost its route line");
  assert(r.chip && r.plate, `the journey's 📜 Classic map did not open the churches plate: ${JSON.stringify(r)}`);
  assert(!r.romans8, 'Romans 8 names no place yet shows a map button');
  assert(r.rev2.where && !r.rev2.plate && /churches of the New Testament/.test(r.rev2.jr), `Revelation 2 should show 📍 Where and the 🧭 churches journey: ${JSON.stringify(r.rev2)}`);
});

check('hymns and the study tools: a word offers its hymns, a hymn its doctrines, a doctrine its hymns', async p => {
  const r = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), txt = id => (document.getElementById(id) || {}).textContent || '';
    showScreen('search'); switchSearchMode('dict'); await wait(800);
    await openWord('grace'); await wait(3000);
    const word = txt('wd-hymns');
    document.querySelector('#wd-hymns button').click(); await wait(2000);
    const list = document.querySelectorAll('#hymns-list .hy-row').length, mode = (document.querySelector('.smode.on') || {}).id;
    history.back(); await wait(1500);
    const back = {sub: S._subView && S._subView.sub + ':' + S._subView.key, shown: getComputedStyle(document.getElementById('word-view')).display};
    // whole words: "art" must not count "heart"
    const H = await loadHymns(), art = hyHas(hyNorm('art'), true);
    const artWrong = H.some(h => [...h[5].flat(), ...h[6]].some(l => art(l) && !/\bart\b/i.test(l.replace(/[’']/g, ''))));
    const ag = H.findIndex(h => h[0] === 'Amazing Grace');
    showScreen('search'); switchSearchMode('hymns'); await wait(800);
    await openHymn(ag); await wait(1500);
    const docs = [...document.querySelectorAll('#hymn-view .hy-docs button')].map(b => b.textContent);
    document.querySelector('#hymn-view .hy-docs button').click(); await wait(3000);
    const dvHymns = txt('dv-hymns');
    return {word, list, mode, back, artWrong, docs, dvHymns};
  });
  assert(/🎵 “grace” in \d+ hymns/.test(r.word), 'the Dictionary’s grace offers no hymns: ' + r.word);
  const n = +r.word.match(/in (\d+) hymns/)[1];
  assert(r.mode === 'smode-hymns' && r.list === n, `the hymns list shows ${r.list} rows for ${n} (${r.mode})`);
  assert(r.back.sub === 'word:grace' && r.back.shown === 'block', 'Back did not return to the word: ' + JSON.stringify(r.back));
  assert(!r.artWrong, 'a whole-word search matched inside a word');
  assert(r.docs.some(d => /Grace/.test(d)), 'Amazing Grace names no doctrine: ' + r.docs.join(' | '));
  assert(/Amazing Grace/.test(r.dvHymns), 'the doctrine does not list Amazing Grace: ' + r.dvHymns);
});

check('hymns: 🎧 Listen opens the Hymns app', async p => {
  await p.evaluate(() => { showScreen('search'); switchSearchMode('hymns'); }); await sleep(1500);
  const r = await p.evaluate(async () => {
    const H = await loadHymns();
    const withSong = H.findIndex(h => h[7]), without = H.findIndex(h => !h[7]);
    const marked = [...document.querySelectorAll('#hymns-list .hy-row')].filter(b => b.textContent.includes('🎧')).length;
    await openHymn(withSong);
    const a = document.querySelector('#hymn-view .hy-listen');
    const href = a ? a.href : '', song = H[withSong][7];
    await openHymn(without);
    return {href, song, marked, count: H.filter(h => h[7]).length, none: !document.querySelector('#hymn-view .hy-listen')};
  });
  assert(r.href === 'https://fbckjv.app/Hymns/?song=' + r.song, `Listen link is ${r.href}`);
  assert(r.marked === r.count && r.count > 30, `${r.marked} rows marked 🎧, ${r.count} hymns have a recording`);
  assert(r.none, 'a hymn without a recording shows 🎧 Listen');
});

check('psalms: 🎧 Sung opens the Psalm in the Hymns app', async p => {
  const r = await p.evaluate(async () => {
    await jumpToRef('Psalms 23:1'); await new Promise(r => setTimeout(r, 1500));
    const a = document.getElementById('ch-sung-btn');
    const psalm = {shown: a.style.display !== 'none', href: a.href};
    await jumpToRef('John 3:16'); await new Promise(r => setTimeout(r, 1500));
    return {psalm, john: document.getElementById('ch-sung-btn').style.display};
  });
  assert(r.psalm.shown && r.psalm.href === 'https://fbckjv.app/Hymns/?psalm=23', `Psalm 23 button: ${JSON.stringify(r.psalm)}`);
  assert(r.john === 'none', 'John 3 shows 🎧 Sung');
});

check('hints: Hebrew & Greek, calendar, a My Verses list', async p => {
  const hint = () => p.evaluate(() => document.getElementById('hint-card').classList.contains('on') ? document.getElementById('hint-card').innerText : '');
  await p.evaluate(() => { showScreen('search'); switchSearchMode('strongs'); }); await sleep(2500);
  assert(/Hebrew & Greek/.test(await hint()), 'no first-use hint on the Hebrew & Greek tool');
  await p.evaluate(() => { hintClose && hintClose(); S._hintAt = 0; history.back(); showStreakInfo(); }); await sleep(2200);
  assert(/days in the Word/.test(await hint()), 'no first-use hint on the reading calendar');
  await p.evaluate(() => { hintClose && hintClose(); S._hintAt = 0; closePopover('streak-panel');
    const d = colData(); d.list.unshift({id: 'c1', n: 'Comfort', items: [{a: 'John 14:1', r: 'John 14:1', t: 'Let not your heart be troubled'}], u: 1}); colSave(d);
    showScreen('saved'); colOpen('c1'); });
  await sleep(2000);
  assert(/Your list/.test(await hint()), 'no first-use hint on a My Verses list');
}, {hints: true});

check('backup: studies sync between phones in their own records', async p => {
  await p.evaluate(FIRESTORE_STANDIN);
  const r = await p.evaluate(async () => {
    const out = {};
    useDevice('A'); mkStudies(['s1', 's2', 's3']); await fbSync(); out.a = cloudOf('TESTAA');
    useDevice('B'); await fbSync(); out.b = studiesHere();
    const d = LS.get('kjv_studies'); d.list = d.list.filter(x => x.id !== 's3'); d.list.find(x => x.id === 's2').h = '<p>EDITED</p>'; LS.set('kjv_studies', d); await fbSync();
    useDevice('A'); await fbSync(); out.a2 = studiesHere(); out.cloud = cloudOf('TESTAA');
    useDevice('C'); const ref = _db.collection('users').doc('TESTAA'); applySyncData(await withCloudStudies(ref, (await ref.get()).data())); S._nb = null; out.c = studiesHere();
    return out; });
  assert(r.a.ix === 's1,s2,s3' && !r.a.legacy && r.a.subs === 's1,s2,s3', `studies not in their own records: ${JSON.stringify(r.a)}`);
  assert(r.b.split(' | ').length === 3, `second phone did not get the studies: ${r.b}`);
  assert(r.a2 === 's1:<p>body of s1</p> | s2:<p>EDITED</p>', `edit / deletion did not come back: ${r.a2}`);
  assert(r.cloud.subs === 's1,s2', `deleted study still in the cloud: ${r.cloud.subs}`);
  assert(r.c === r.a2, `restore by code differs: ${r.c}`);
});

check('backup: old layout moves over; an older copy still works', async p => {
  await p.evaluate(FIRESTORE_STANDIN);
  const r = await p.evaluate(async () => {
    const out = {};
    useDevice('L', 'TESTLG'); LS.set(ST_OFF, Date.now()); mkStudies(['x1', 'x2']); await fbSync(); out.old = cloudOf('TESTLG');
    useDevice('N', 'TESTLG'); await fbSync(); out.moved = cloudOf('TESTLG'); out.n = studiesHere();
    useDevice('L'); const d = LS.get('kjv_studies'); d.list.find(x => x.id === 'x1').h = '<p>OLD COPY EDIT</p>'; LS.set('kjv_studies', d); await fbSync();
    useDevice('N'); await fbSync(); out.n2 = studiesHere(); out.after = cloudOf('TESTLG');
    return out; });
  assert(r.old.legacy && !r.old.ix, 'the old layout was not written');
  assert(r.moved.ix === 'x1,x2' && !r.moved.legacy, `did not move to own records: ${JSON.stringify(r.moved)}`);
  assert(/OLD COPY EDIT/.test(r.n2) && !r.after.legacy, `older copy's edit lost: ${r.n2}`);
});

check('backup: refused rules, too large, offline, phone full', async p => {
  await p.evaluate(FIRESTORE_STANDIN);
  const r = await p.evaluate(async () => {
    const out = {};
    useDevice('R', 'TESTRR'); __denySub = true; mkStudies(['r1']); await fbSync(); __denySub = false;
    out.refused = {cloud: cloudOf('TESTRR'), off: !!LS.get(ST_OFF, 0), err: S._syncErr, card: careShown()};
    careClose(); useDevice('Z', 'TESTZZ'); LS.set(ST_OFF, Date.now()); __limit = 3000; LS.set('kjv_notes', {'John 3:16': 'x'.repeat(4000)}); await fbSync(); __limit = 0;
    out.big = {err: S._syncErr && S._syncErr.kind, card: careShown()};
    careClose(); useDevice('A'); __offline = true; await fbSync(); __offline = false;
    out.offline = {err: S._syncErr && S._syncErr.kind, card: careShown()};
    await fbSync(); out.back = S._syncErr;
    const o = Storage.prototype.setItem; Storage.prototype.setItem = function(){ throw new DOMException('quota', 'QuotaExceededError'); };
    LS.set('kjv_notes', {a: 1}); Storage.prototype.setItem = o; out.full = careShown();
    return out; });
  assert(r.refused.cloud.legacy && r.refused.off && !r.refused.err && !r.refused.card, `refused rules should fall back quietly: ${JSON.stringify(r.refused)}`);
  assert(r.big.err === 'size' && /too large/.test(r.big.card), `too large should say so: ${JSON.stringify(r.big)}`);
  assert(r.offline.err === 'offline' && !r.offline.card, `offline should stay quiet: ${JSON.stringify(r.offline)}`);
  assert(r.back === null, 'back online did not clear the error');
  assert(/no room left/.test(r.full), 'a full phone did not say so');
});

check('backup file: save on one phone, restore on another', async (p, ctx, browser, base) => {
  await p.evaluate(() => { LS.set('kjv_studies', {active: 's1', list: [{id: 's1', t: 'Grace', h: '<p>by grace</p>', u: 1}]}); LS.set('kjv_hl', {'John 3:16': 'y'}); syncStamp(); });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => saveBackupFile())]);
  const file = path.join(require('os').tmpdir(), 'kjv-check-' + dl.suggestedFilename());
  await dl.saveAs(file);
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert(json.kind === 'backup' && json.count.studies === 1, 'the file is not a backup of one study');
  const ctx2 = await browser.newContext({viewport: {width: 390, height: 844}});
  const q = await openApp(ctx2, base, {rc: 'BBBBBB'});
  await q.evaluate(() => { LS.set('kjv_studies', {active: 'b1', list: [{id: 'b1', t: 'Mine', h: '<p>b</p>', u: 2}]}); syncStamp(); openSettings(); });
  await sleep(400);
  await q.setInputFiles('#bk-input', file); await sleep(800);
  assert(/holds 1 study, 1 highlight/.test(await q.evaluate(() => document.getElementById('ask-msg').textContent)), 'restore did not say what the file holds');
  await Promise.all([q.waitForNavigation({timeout: 8000}).catch(() => null), q.evaluate(() => askPick(0))]);
  await sleep(2500);
  const r = await q.evaluate(() => ({studies: LS.get('kjv_studies').list.map(x => x.t).sort().join(','), hl: Object.keys(LS.get('kjv_hl', {})).join(','), code: localStorage.getItem('kjv_rc')}));
  fs.unlinkSync(file);
  await ctx2.close();
  assert(r.studies === 'Grace,Mine' && r.hl === 'John 3:16' && r.code === 'BBBBBB', `restore from a file: ${JSON.stringify(r)}`);
});

check('plans: make a plan at any pace (chapters a day or days to finish)', async p => {
  const r = await p.evaluate(() => {
    mkOpen(); mkPick(MK_PICKS.findIndex(x => x[0] === 'New Testament'));
    mkDaysN('31'); const days = document.getElementById('mk-sum').textContent;
    mkPerN('9'); const per = document.getElementById('mk-sum').textContent;
    mkDaysN('31'); mkCreate();
    const def = plansData().list[0].def, ds = customPlanDays(def);
    return {days, per, d: def.days, n: ds.length, total: ds.reduce((t, x) => t + x.length, 0), most: Math.max(...ds.map(x => x.length)), least: Math.min(...ds.map(x => x.length)), first: getPlanDayReadings(def.id, 0).length};
  });
  assert(/260 chapters · 31 days at 8–9 a day/.test(r.days), `31 days: ${r.days}`);
  assert(/260 chapters · 29 days at 9 a day/.test(r.per), `9 a day: ${r.per}`);
  assert(r.d === 31 && r.n === 31 && r.total === 260 && r.most === 9 && r.least === 8 && r.first === 9, `plan days ${JSON.stringify(r)}`);
});

check('listening: a chapter heard through counts in plans, books and the calendar', async p => {
  const r = await p.evaluate(() => {
    mkOpen(); mkBook(48); mkCreate();
    const ts = SCOURBY_TS.Ephesians, play = (a, b) => { for(let t = a; t <= b; t += 0.25) scourbyHeard(ts, t); };
    SA.book = 'Ephesians'; SA.rate = 1; SA.heard = null; SA.resumed = null;
    play(ts.c[0], ts.c[0] + 1);
    play(ts.c[0] + 1, ts.c[1] + 1);              // chapter 1 heard through
    scourbyHeard(ts, ts.c[2] - 5); play(ts.c[2] - 5, ts.c[2] + 1); // chapter 2: jumped near its end
    const log = readLog()[todayStr()] || [], plan = plansData().list[0];
    return {one: log.includes('48:0'), two: log.includes('48:1'), plan: '48:0' in plan.chs, streak: S.streak};
  });
  assert(r.one, 'Ephesians 1 heard through was not logged as read');
  assert(r.plan, 'Ephesians 1 heard through did not count in the plan');
  assert(!r.two, 'Ephesians 2 skipped to its end should not count');
  // the streak may first ask the cloud (when Firebase can be reached), so give it a moment
  let streak = r.streak;
  for(let i = 0; i < 20 && streak < 1; i++){ await sleep(250); streak = await p.evaluate(() => S.streak); }
  assert(streak >= 1, 'listening should keep the streak');
});

check('share: links open a chapter or verses; a newcomer sees them first; Home', async (p, ctx, browser, base) => {
  const links = await p.evaluate(() => ({one: passageLink('1 John', 3, [16]), some: passageLink('John', 3, [5, 3, 4, 8]), ch: passageLink('Song of Solomon', 2), span: verseSpan([1, 2, 3, 7, 9, 10], '–')}));
  assert(links.one.endsWith('#1+John+3:16') && links.some.endsWith('#John+3:3-5,8') && links.ch.endsWith('#Song+of+Solomon+2') && links.span === '1–3,7,9–10', JSON.stringify(links));
  // Several verses chosen on the card are shared with their link
  // as a phone (its share menu)
  await p.evaluate(() => { window.__shared = null; navigator.share = d => { window.__shared = d; return Promise.resolve(); };
    const mm = window.__mm = window.matchMedia.bind(window); window.matchMedia = q => /pointer:fine/.test(q) ? {matches: false} : mm(q); jumpToRef('John 3:16'); });
  await sleep(1200);
  const sh = await p.evaluate(() => {
    const vs = [...document.querySelectorAll('#verses .vblock')];
    S.selectedData = new Set([2, 3, 4, 7].map(i => ({ref: 'John 3:' + (i + 1), vnum: '' + (i + 1), txt: 'x'}))); multiShare();
    const a = window.__shared;
    S.selectedData = new Set(vs.map((v, i) => ({ref: 'John 3:' + (i + 1), vnum: '' + (i + 1), txt: 'x'}))); multiShare();
    return {some: a, all: window.__shared, home: document.getElementById('btn-back').textContent.trim()};
  });
  assert(sh.some && sh.some.url.endsWith('#John+3:3-5,8') && sh.some.title === 'John 3:3–5,8', `several verses: ${JSON.stringify(sh.some)}`);
  assert(sh.all && sh.all.url.endsWith('#John+3') && sh.all.title === 'John 3', `whole chapter: ${JSON.stringify(sh.all)}`);
  assert(sh.home === 'Home', `the button at the top should say Home, says ${sh.home}`);
  // on a computer the text and link are copied instead, with a note
  const pc = await p.evaluate(async () => { window.matchMedia = window.__mm; let got = null;
    navigator.clipboard.writeText = t => { got = t; return Promise.resolve(); }; window.__shared = null;
    S.selectedData = new Set([{ref: 'John 3:16', vnum: '16', txt: 'For God so loved the world'}]); multiShare();
    await new Promise(r => setTimeout(r, 50)); return {got, shared: window.__shared, toast: document.getElementById('toast')?.textContent || ''}; });
  assert(!pc.shared && pc.got && pc.got.includes('For God so loved') && pc.got.endsWith('#John+3:16'), `on a computer Share should copy the text and link: ${JSON.stringify(pc)}`);
  await p.click('#btn-back'); await sleep(300);
  assert(await p.evaluate(() => S.screen) === 'books', 'Home should go to Home');
  // Someone new opens a shared link
  const fresh = await browser.newContext({viewport: {width: 390, height: 844}}), q = await fresh.newPage(); q._errors = []; q.on('pageerror', e => q._errors.push(e.message));
  await q.goto(base + '/index.html#Ephesians+2:8-9'); await sleep(2600);
  const n = await q.evaluate(() => ({screen: S.screen, book: S.book, ch: S.ch, lit: [...document.querySelectorAll('.vblock.vlink')].map(x => x.dataset.ref), welcome: document.getElementById('onboard-modal').style.display}));
  assert(n.screen === 'reader' && n.book === 'Ephesians' && n.ch === 1, `link opened ${n.screen} ${n.book} ${n.ch}`);
  assert(n.lit.join() === 'Ephesians 2:8,Ephesians 2:9', `verses lit: ${n.lit.join()}`);
  assert(n.welcome !== 'flex', 'the welcome should wait while the shared chapter is open');
  await q.evaluate(() => showScreen('books')); await sleep(800);
  assert(await q.evaluate(() => document.getElementById('onboard-modal').style.display) === 'flex', 'the welcome should come once they leave the chapter');
  const errs = q._errors; await fresh.close();
  assert(!errs.length, 'page errors: ' + errs.join(' / '));
});

check('notebook open on a wide screen: the select bar stays beside it', async (p, ctx, browser, base) => {
  const w = await browser.newContext({viewport: {width: 1600, height: 900}}), q = await openApp(w, base);
  await q.evaluate(() => jumpToRef('John 3:16')); await sleep(1200);
  await q.evaluate(() => { nbOpen(); }); await sleep(600);
  await q.evaluate(() => { toggleSelectMode(); document.querySelectorAll('#verses .vblock')[2].click(); }); await sleep(500);
  const r = await q.evaluate(() => { const nb = document.getElementById('nb-panel').getBoundingClientRect().left; return {nb, bar: document.getElementById('multibar').getBoundingClientRect().right, btn: Math.max(...[...document.querySelectorAll('.mbar-btns .mb')].map(b => b.getBoundingClientRect().right))}; });
  await w.close();
  assert(r.nb < 1600 && r.bar <= r.nb + 1 && r.btn <= r.nb, `select bar reaches ${r.bar} (buttons ${r.btn}) under the notebook at ${r.nb}`);
});

check('cross-reference: Open lands on the verse; the top shows the chapter', async p => {
  await p.evaluate(() => jumpToRef('Zechariah 14:8')); await sleep(1200);
  assert(await p.evaluate(() => document.getElementById('logo').textContent) === 'Zechariah 14', 'the top should say Zechariah 14');
  await p.evaluate(() => { showXRef([{book: 'John', ch: 7, v: 38, ref: 'John 7:38'}]); }); await sleep(600);
  await p.evaluate(() => openXRefFull()); await sleep(1500);
  const r = await p.evaluate(() => { const el = document.querySelector('[data-ref="John 7:38"]'), b = el.getBoundingClientRect();
    return {top: document.getElementById('logo').textContent, lit: el.classList.contains('vlink'), seen: b.top > 0 && b.bottom < innerHeight}; });
  assert(r.top === 'John 7', `the top should say John 7, says ${r.top}`);
  assert(r.lit && r.seen, `John 7:38 should be on screen and outlined (${JSON.stringify(r)})`);
  await p.evaluate(() => nextCh()); await sleep(800);
  assert(await p.evaluate(() => document.getElementById('logo').textContent) === 'John 8', 'Next should move the top to John 8');
});

check('📖 at the top returns from Search to the chapter and place you left', async p => {
  await p.evaluate(() => jumpToRef('John 7:38')); await sleep(1500);
  const y = await p.evaluate(() => document.getElementById('screen-reader').scrollTop);
  await p.evaluate(() => openSearchTab()); await sleep(600);
  const btn = await p.evaluate(() => { const b = document.getElementById('btn-return'); return {shown: b.style.display !== 'none', text: b.textContent}; });
  assert(btn.shown && btn.text === '📖 John 7', `Search should show 📖 John 7 at the top, shows ${JSON.stringify(btn)}`);
  await p.click('#btn-return'); await sleep(800);
  const r = await p.evaluate(() => ({screen: S.screen, book: S.book, ch: S.ch, y: document.getElementById('screen-reader').scrollTop, ret: document.getElementById('btn-return').style.display}));
  assert(r.screen === 'reader' && r.book === 'John' && r.ch === 6, `should be back in John 7, is ${r.screen} ${r.book} ${r.ch}`);
  assert(y > 200 && Math.abs(r.y - y) < 40, `should be back at the same place (${y}), is at ${r.y}`);
  assert(r.ret === 'none', 'in the chapter the 📖 button gives way to Home');
});

check('notebook: Copy carries bold, italics and headings; verses as bold reference + italic words', async p => {
  const r = await p.evaluate(async () => {
    nbOpen(); await new Promise(r => setTimeout(r, 300));
    const st = nbActive();
    document.getElementById('nb-ed').innerHTML = '<h3>God our refuge</h3><p>We are <b>safe</b> in <i>Christ</i>.</p>'; nbStore();
    nbAddVerse('1 Thessalonians 5:9', 'For God hath not appointed us to wrath');
    nbAppend('<blockquote class="nb-v">' + nbRefSpan('Zechariah 14:3', 'Zechariah 14:3–4') + '<b>3</b> Then shall the LORD go forth <b>4</b> And his feet shall stand</blockquote>', 'x');
    let items = null; navigator.clipboard.write = async it => { items = it; };
    nbCopy(); await new Promise(r => setTimeout(r, 100));
    const html = items && await (await items[0].getType('text/html')).text(), text = items && await (await items[0].getType('text/plain')).text();
    return {html, text};
  });
  assert(r.html, 'Copy did not put formatted text on the clipboard');
  for(const want of ['<p><b>God our refuge</b></p>', '<b>safe</b>', '<i>Christ</i>', '<b>1 Thessalonians 5:9</b> <i>For God hath not appointed us to wrath</i>', '<b>Zechariah 14:3–4</b> <b>3</b><i> Then shall the LORD go forth </i><b>4</b><i> And his feet shall stand</i>'])
    assert(r.html.includes(want), `formatted copy is missing ${want}: ${r.html}`);
  assert(!/blockquote|contenteditable|class=|<h\d|>>|\*\*/.test(r.html), `formatted copy should be clean, with no heading styles (Telegram Premium): ${r.html}`);
  assert(r.text && r.text.includes('God our refuge'.toUpperCase()), 'the plain-text copy should still be there');
  assert(/GOD OUR REFUGE\n\nWe are safe in Christ\.\n\n    “For God hath/.test(r.text), `shared text should keep a blank line between paragraphs: ${JSON.stringify(r.text)}`);
  assert(!/Faith Baptist Church/.test(r.html + r.text), 'a copied study should end with the study, no signature line');
});

check('Sword Drill: a verse just mastered rests a month before review', async p => {
  const r = await p.evaluate(() => {
    memRecordComplete('Psalm 119:11', 'challenge', 30);
    const rec = memGetMastery().refs['Psalm 119:11'], day = 86400000, t = rec.lastReview;
    const out = {tomorrow: memIsDue(rec, t + day), week: memIsDue(rec, t + 7*day), month: memIsDue(rec, t + 30*day)};
    // Clearing that review climbs to a longer rest
    rec.srsStage = 1; out.next = memReviewIntervalDays(rec);
    return out;
  });
  assert(!r.tomorrow && !r.week, 'a verse just mastered should not be due the next day or week');
  assert(r.month, 'a mastered verse should be due for review after a month');
  assert(r.next > 30, `the second review should wait longer than a month, got ${r.next} days`);
});

check('hymn cards: tap verses of a hymn, 📸 Card, its lines kept and centred', async p => {
  const i = await p.evaluate(async () => { const H = await loadHymns(); return H.findIndex(h => h[6].length); });
  await p.evaluate(async i => { showScreen('search'); await openHymn(i); }, i); await sleep(500);
  const bar = () => p.evaluate(() => ({on: document.getElementById('hybar').classList.contains('on'), txt: document.getElementById('hybar-count').textContent}));
  assert(!(await bar()).on, 'the hymn bar should be hidden until a verse is tapped');
  await p.click('#hymn-view .hy-st'); await p.click('#hymn-view .hy-ch'); await sleep(200);
  let b = await bar();
  assert(b.on && b.txt === '1 verse and the refrain', `tapping a verse and the refrain should show the bar (${b.txt})`);
  const r = await p.evaluate(async () => {
    const drawn = [], C = CanvasRenderingContext2D.prototype, orig = C.fillText;
    C.fillText = function(txt, x){ drawn.push({txt: String(txt), x, w: this.measureText(txt).width, align: this.textAlign}); return orig.apply(this, arguments); };
    S.cardOrientation = 'landscape'; S.cardBg = null;
    hyCard();
    drawn.length = 0; renderCanvas(S.cardTheme);
    C.fillText = orig;
    const h = S._hymns[+S._subView.key], W = S._cw;
    const body = drawn.filter(d => d.align === 'center' && d.x === W / 2);
    return {open: document.getElementById('scr-overlay').classList.contains('on'), ref: S.scrRef, title: h[0],
      by: drawn.some(d => d.txt === `${h[1]}, ${h[2]}`), label: drawn.some(d => d.txt === 'REFRAIN'),
      lines: [...h[5][0], ...h[6]].every(l => body.some(d => d.txt === l)),
      over: body.filter(d => d.x + d.w / 2 > W - 60 + 0.5 || d.x - d.w / 2 < 60 - 0.5).map(d => d.txt)};
  });
  assert(r.open && r.ref === r.title, '📸 Card should open the card maker with the hymn title at the top');
  assert(r.by, 'the card should carry the author and year under the title');
  assert(r.label && r.lines, 'the verse and the refrain should be drawn line for line, the refrain under its label');
  assert(!r.over.length, `hymn lines run outside the margins: ${r.over.join(' | ')}`);
  await p.evaluate(() => history.back()); await sleep(400);
  await p.evaluate(() => hyClear()); await sleep(150);
  assert(!(await bar()).on, '✕ Clear should put the bar away');
});

check('Back in Sword Drill: a verse → the list → closed, never out of the app', async p => {
  // Android's Back skips a step a page pushes by itself, so nothing may be pushed
  // while Back is being handled: every step must come from a tap
  await p.evaluate(() => {
    window.__inPop = false; window.__pushedInPop = 0;
    window.addEventListener('popstate', () => { window.__inPop = true; setTimeout(() => window.__inPop = false, 0); }, {capture: true});
    const push = history.pushState.bind(history);
    history.pushState = (...a) => { if(window.__inPop) window.__pushedInPop++; return push(...a); };
  });
  const state = () => p.evaluate(() => ({
    open: document.getElementById('mem-overlay').classList.contains('on'),
    verse: document.getElementById('mem-game').style.display === 'flex',
    len: history.length, st: JSON.stringify(history.state)
  }));
  const home = await state();
  const back = async () => { await p.evaluate(() => history.back()); await sleep(450); return state(); };

  await p.evaluate(() => openMemorize()); await sleep(300);
  await p.evaluate(() => startMem('Romans 3:23')); await sleep(700);
  let s = await back();
  assert(s.open && !s.verse, 'Back from a verse should show the list of verses');
  s = await back();
  assert(!s.open, 'Back from the list should close Sword Drill');
  assert(s.st === home.st, `Back should land on the page Sword Drill opened from (${s.st} vs ${home.st})`);

  // The buttons use up the same steps: ‹ Verses, then ✕ Close, leave nothing behind
  await p.evaluate(() => openMemorize()); await sleep(300);
  await p.evaluate(() => startMem('Romans 6:23')); await sleep(700);
  await p.evaluate(() => memBackTap()); await sleep(450);
  s = await state();
  assert(s.open && !s.verse, '‹ Verses should show the list');
  await p.evaluate(() => memCloseTap()); await sleep(450);
  s = await state();
  assert(!s.open && s.st === home.st, '✕ Close should close Sword Drill and use up its step');

  // The certificate opened over Sword Drill closes first
  await p.evaluate(() => openMemorize()); await sleep(300);
  await p.evaluate(() => openSwordCertificate()); await sleep(400);
  await back();
  const cert = await p.evaluate(() => ({scr: document.getElementById('scr-overlay').classList.contains('on'), mem: document.getElementById('mem-overlay').classList.contains('on')}));
  assert(!cert.scr && cert.mem, 'Back should close the certificate and leave Sword Drill open');
  s = await back();
  assert(!s.open, 'and Back again closes Sword Drill');

  const pushed = await p.evaluate(() => window.__pushedInPop);
  assert(!pushed, `${pushed} history step(s) were pushed while handling Back; Android skips those`);
});

check('Back closes the verse card maker and keeps the chapter', async p => {
  await p.evaluate(() => jumpToRef('John 3:16')); await sleep(1200);
  const before = await p.evaluate(() => S.book + ' ' + S.ch);
  await p.evaluate(() => { const d = S.bookData.chapters[2].verses[15]; openVPop('John 3:16', d.text); }); await sleep(300);
  await p.evaluate(() => singleScreenshot()); await sleep(600);
  const shown = await p.evaluate(() => document.getElementById('scr-overlay').classList.contains('on') && !document.getElementById('vpop').classList.contains('on'));
  assert(shown, '📸 from the verse card should open the card maker (and close the verse card)');
  await p.evaluate(() => history.back()); await sleep(500);
  const after = await p.evaluate(() => ({scr: document.getElementById('scr-overlay').classList.contains('on'), screen: S.screen, at: S.book + ' ' + S.ch}));
  assert(!after.scr, 'Back should close the card maker');
  assert(after.screen === 'reader' && after.at === before, `Back should stay in the chapter (${after.screen} ${after.at})`);
  // ✕ Close uses up the same step
  await p.evaluate(() => { const d = S.bookData.chapters[2].verses[15]; openVPop('John 3:16', d.text); }); await sleep(300);
  await p.evaluate(() => singleScreenshot()); await sleep(600);
  const st0 = await p.evaluate(() => history.state && history.state.modal);
  await p.evaluate(() => closeScrOverlay()); await sleep(500);
  const st1 = await p.evaluate(() => ({on: document.getElementById('scr-overlay').classList.contains('on'), modal: history.state && history.state.modal}));
  assert(st0 === 'scr' && !st1.on && st1.modal !== 'scr', '✕ Close should close the card maker and use up its step');
});

check('verse card: ✕ Close at the top right; a tap on blank page puts the long-press bar away', async p => {
  await p.evaluate(() => jumpToRef('John 3:16')); await sleep(1200);
  await p.evaluate(() => { const d = S.bookData.chapters[2].verses[15]; openVPop('John 3:16', d.text); }); await sleep(400);
  const x = await p.evaluate(() => { const b = document.getElementById('vpop-x').getBoundingClientRect(), c = document.getElementById('vpop-inner').getBoundingClientRect(); return {top: b.top - c.top, right: c.right - b.right}; });
  assert(x.top < 60 && x.right < 40, `✕ Close should sit at the card's top right (${JSON.stringify(x)})`);
  await p.evaluate(() => document.getElementById('vpop-x').click()); await sleep(500);
  assert(await p.evaluate(() => !document.getElementById('vpop').classList.contains('on')), '✕ Close should close the verse card');
  await p.evaluate(() => { enterSelectMode(); }); await sleep(200);
  await p.evaluate(() => document.getElementById('ch-title').click()); await sleep(200);
  assert(await p.evaluate(() => !S.selectMode), 'a tap on blank page should put the long-press bar away');
  await p.evaluate(() => { enterSelectMode(); document.querySelector('#verses .vblock').click(); }); await sleep(200);
  assert(await p.evaluate(() => S.selectMode), 'a tap on a verse should keep the long-press bar');
  await p.evaluate(() => exitSelectMode());
});

check('Add to Screenshot: tray badge, chip in the long-press bar', async p => {
  await p.evaluate(() => { LS.set('kjv_clip_hint', false); S.clipboard = []; updateClipBadge(); jumpToRef('John 3:16'); }); await sleep(1200);
  await p.evaluate(() => { const d = S.bookData.chapters[2].verses[15]; openVPop('John 3:16', d.text); }); await sleep(300);
  assert(await p.evaluate(() => /Add to Screenshot/.test(document.querySelector('.pop-actions').textContent)), 'the verse card should say Add to Screenshot');
  await p.evaluate(() => addToClipboard(S.popRef, S.popTxt)); await sleep(400);
  const st = await p.evaluate(() => { enterSelectMode(); const c = document.getElementById('mb-clip'); return {chip: c.style.display !== 'none' && c.textContent, badge: document.getElementById('clip-badge-n').textContent, title: document.getElementById('clip-hdr-title').textContent}; });
  assert(st.chip && /1 waiting/.test(st.chip) && st.badge === '1', `the long-press bar should show 1 waiting (${JSON.stringify(st)})`);
  await p.evaluate(() => { exitSelectMode(); S.clipboard = []; updateClipBadge(); });
  assert(await p.evaluate(() => document.getElementById('mb-clip').style.display === 'none'), 'the chip should hide when nothing is waiting');
});

check('screenshot: gaps read 16, 36 and join with …; dragging picks nothing; a list picks up to 3', async p => {
  await p.evaluate(() => jumpToRef('John 3:16')); await sleep(1200);
  const lab = await p.evaluate(() => [passageLabel([{ref:'John 3:16'},{ref:'John 3:17'},{ref:'John 3:36'}]), passageLabel([{ref:'John 3:16'},{ref:'Romans 5:8'}]), joinVerseText([{ref:'John 3:16',txt:'A'},{ref:'John 3:17',txt:'B'},{ref:'John 3:36',txt:'C'}])]);
  assert(lab[0] === 'John 3:16–17, 36', 'gaps should read as chosen: ' + lab[0]);
  assert(lab[1] === 'John 3:16; Romans 5:8', 'other books follow a semicolon: ' + lab[1]);
  assert(lab[2] === 'A B … C', 'non-adjacent verses join with an ellipsis: ' + lab[2]);
  // a finger that drags over a verse picks none; a still tap picks it when the finger lifts
  const fire = (n, type, x, y) => p.evaluate(([n, type, x, y]) => { const el = document.querySelector('#verses .vblock:nth-child(' + n + ')'), t = new Touch({identifier: 1, target: el, clientX: x, clientY: y});
    el.dispatchEvent(new TouchEvent(type, {bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [t], changedTouches: [t]})); }, [n, type, x, y]);
  await p.evaluate(() => enterSelectMode()); await sleep(100);
  await fire(2, 'touchstart', 100, 300); await fire(2, 'touchmove', 100, 360); await fire(2, 'touchend', 100, 360);
  assert(await p.evaluate(() => S.selected.size) === 0, 'dragging over a verse should not pick it');
  await fire(3, 'touchstart', 100, 300); await fire(3, 'touchend', 100, 300); await sleep(100);
  assert(await p.evaluate(() => S.selected.size) === 1, 'a still tap should pick the verse when the finger lifts');
  await p.evaluate(() => exitSelectMode());
  // My Verses: tap up to 3 verses of a list, one screenshot
  await p.evaluate(() => { LS.set('kjv_hints_off', true);
    const it = (r, t) => ({r, a: r, t}); colSave({list: [{id: 'cx', n: 'Comfort', u: 1, items: [it('John 3:16', 'For God so loved the world'), it('Romans 5:8', 'But God commendeth his love'), it('Psalms 23:1', 'The LORD is my shepherd'), it('Isaiah 41:10', 'Fear thou not')]}]});
    showScreen('saved'); colOpen('cx'); });
  await sleep(500);
  assert(await p.evaluate(() => !!document.querySelector('.col-pickgo')), 'a list should offer 📸 Screenshot');
  await p.evaluate(() => colPickStart()); await sleep(200);
  for(let i = 0; i < 4; i++) await p.evaluate(i => colPickToggle(i), i);
  assert(await p.evaluate(() => S._colShot.length) === 3, 'a list screenshot should hold at most 3 verses');
  await p.evaluate(() => colPickMake('cx')); await sleep(900);
  const made = await p.evaluate(() => ({on: document.getElementById('scr-overlay').classList.contains('on'), ref: S.scrRef, n: S.scrVerses.length}));
  assert(made.on && made.n === 3 && made.ref === 'John 3:16; Romans 5:8; Psalm 23:1', 'the screenshot should carry the 3 picked verses: ' + JSON.stringify(made));
});

check('verse card: one Names row — a person under the verse\'s name, a place, each with its meaning and way on', async p => {
  await p.evaluate(() => jumpToRef('Mark 9:2')); await sleep(1200);
  await p.evaluate(() => { const el = document.querySelector('.vblock[data-ref="Mark 9:2"]'); openVPop('Mark 9:2', el.dataset.txt); }); await sleep(1800);
  const a = await p.evaluate(() => ({names: [...document.querySelectorAll('#vpop-names .vd-word')].map(x => x.textContent), links: document.getElementById('vpop-links').textContent}));
  assert(a.names.join() === 'Jesus,Peter,James,John', 'names in the order the verse gives them: ' + a.names.join());
  assert(!/People in this verse/.test(a.links), 'no separate People row');
  await p.evaluate(() => [...document.querySelectorAll('#vpop-names .vd-word')].find(x => x.textContent === 'Peter').click()); await sleep(300);
  const d = await p.evaluate(() => ({mean: document.getElementById('vpop-nm-text').textContent, go: document.getElementById('vpop-nm-go').textContent}));
  assert(d.mean && /👤 Simon/.test(d.go), 'Peter shows his meaning and leads to Simon Peter: ' + JSON.stringify(d));
  await p.evaluate(() => history.back()); await sleep(400);
  await p.evaluate(() => jumpToRef('Genesis 28:19')); await sleep(1200);
  await p.evaluate(() => { const el = document.querySelector('.vblock[data-ref="Genesis 28:19"]'); openVPop('Genesis 28:19', el.dataset.txt); }); await sleep(1800);
  await p.evaluate(() => document.querySelector('#vpop-names .vd-word').click()); await sleep(300);
  const b = await p.evaluate(() => ({word: document.getElementById('vpop-nm-word').textContent, go: document.getElementById('vpop-nm-go').textContent, map: !!document.querySelector('#vpop-names .wm-show')}));
  assert(b.word === 'Bethel' && /📍 Where Bethel was/.test(b.go) && b.map, 'a place leads to its site, with the map below: ' + JSON.stringify(b));
  await p.evaluate(() => history.back()); await sleep(400);
});

check('verse card: Cross-references fold, open at first, remembers being shut', async p => {
  const open = async () => { await p.evaluate(() => { const el = document.querySelector('.vblock[data-ref="Mark 9:2"]'); openVPop('Mark 9:2', el.dataset.txt); }); await sleep(1500); };
  const shown = () => p.evaluate(() => { const b = document.getElementById('xr-body'); return !!b && b.style.display !== 'none' && !!b.querySelector('.xr-row'); });
  await p.evaluate(() => jumpToRef('Mark 9:2')); await sleep(1200);
  await open();
  assert(await shown(), 'cross-references should be open the first time');
  await p.evaluate(() => document.querySelector('#vpop-tsk .sg-fold').click()); await sleep(200);
  assert(!(await shown()), 'a tap on the heading should fold them away');
  await p.evaluate(() => history.back()); await sleep(400);
  await open();
  assert(!(await shown()), 'the next card should stay folded');
  await p.evaluate(() => document.querySelector('#vpop-tsk .sg-fold').click()); await sleep(200);
  assert(await shown(), 'a second tap opens them again');
  await p.evaluate(() => history.back()); await sleep(400);
});

check('verse card: tap a word of the verse for its meaning; KJV note on top; root word for a thin form', async p => {
  const card = async ref => { await p.evaluate(r => jumpToRef(r), ref); await sleep(1200); await p.evaluate(r => { const el = document.querySelector(`.vblock[data-ref="${r}"]`); openVPop(r, el.dataset.txt); }, ref); await sleep(1200); };
  const tap = async w => { await p.evaluate(w => [...document.querySelectorAll('#vpop-txt .vw')].find(x => x.textContent === w).click(), w); await sleep(1500); };
  const def = () => p.evaluate(() => ({on: document.getElementById('vpop-dict-def').style.display === 'block', note: document.getElementById('vpop-def-text').textContent, web: document.getElementById('vpop-def-webster').textContent}));
  await card('Romans 11:5');
  assert(await p.evaluate(() => !document.querySelector('#vpop-txt .vw') || ![...document.querySelectorAll('#vpop-txt .vw')].some(x => x.textContent === 'the')), 'small words should not be tappable');
  await tap('election');
  let d = await def();
  assert(d.on && /singled out by God/.test(d.note) && /Webster 1828/.test(d.web), 'election: the KJV note on top of Webster: ' + JSON.stringify(d));
  await tap('election');
  assert(!(await def()).on, 'a second tap puts the meaning away');
  await tap('election'); await p.evaluate(() => document.getElementById('vpop-def-x').click()); await sleep(200);
  assert(!(await def()).on && !(await p.evaluate(() => document.querySelector('#vpop-txt .vw.on'))), '✕ closes the meaning');
  await p.evaluate(() => history.back()); await sleep(400);
  await card('Mark 9:2'); await tap('transfigured');
  d = await def();
  assert(/transfigure\)/.test(d.web) && /outward form/.test(d.web), 'a thin form gives the root word: ' + d.web);
  await tap('Peter');
  assert(await p.evaluate(() => document.getElementById('vpop-name-def').style.display === 'block' && document.getElementById('vpop-nm-word').textContent === 'Peter'), 'a name opens its place in the Names row');
  await p.evaluate(() => history.back()); await sleep(400);
});

check('privacy: Settings → Privacy opens, says what is kept, and Back closes it alone', async p => {
  await p.evaluate(() => openSettings()); await sleep(400);
  await p.evaluate(() => [...document.querySelectorAll('.set-link')].find(x => /Privacy/.test(x.textContent)).click()); await sleep(300);
  const t = await p.evaluate(() => document.getElementById('privacy-sheet').classList.contains('on') && document.getElementById('privacy-inner').textContent);
  assert(t && /restore code/.test(t) && /no advertising/.test(t), 'the Privacy page should open and explain the backup');
  await p.evaluate(() => history.back()); await sleep(400);
  const st = await p.evaluate(() => ({priv: document.getElementById('privacy-sheet').classList.contains('on'), set: document.getElementById('settings-sheet').classList.contains('on')}));
  assert(!st.priv && st.set, 'Back should close Privacy and leave Settings open: ' + JSON.stringify(st));
  // the church's email is shown in the app but never written whole in the page's source
  const src = require('fs').readFileSync(require('path').join(ROOT, 'index.html'), 'utf8');
  const shown = await p.evaluate(() => document.querySelector('.church-mail-at').textContent);
  assert(/^[a-z0-9]+@gmail\.com$/.test(shown) && !src.includes(shown) && !/[a-z0-9._-]+@gmail\.com/i.test(src), 'the address should appear in Settings but not in the page source');
});

check('Back: picking verses, the copy sheet, Tips ✕, the list picker each take one step', async p => {
  await p.evaluate(() => jumpToRef('John 3:16')); await sleep(1200);
  const at = () => p.evaluate(() => ({screen: S.screen, sel: S.selectMode, ch: S.book + ' ' + S.ch}));
  // Back while picking puts the bar away and stays in the chapter
  await p.evaluate(() => { enterSelectMode(); toggleVerseSelect(document.querySelectorAll('#verses .vblock')[1]); }); await sleep(200);
  await p.evaluate(() => history.back()); await sleep(500);
  let a = await at();
  assert(a.screen === 'reader' && !a.sel && a.ch === 'John 2', 'Back while picking should keep the chapter: ' + JSON.stringify(a));
  // ✕ Cancel uses up its step: the next Back leaves the chapter as it would have
  const before = await p.evaluate(() => history.length);
  await p.evaluate(() => { enterSelectMode(); }); await sleep(200);
  await p.evaluate(() => exitSelectMode(true)); await sleep(500);
  a = await at();
  assert(a.screen === 'reader' && !a.sel && (await p.evaluate(() => !(history.state && history.state.modal === 'select'))), 'Cancel should leave no picking step behind');
  // the Copy Format sheet closes on Back
  await p.evaluate(() => { enterSelectMode(); const v = document.querySelectorAll('#verses .vblock'); toggleVerseSelect(v[1]); toggleVerseSelect(v[2]); multiCopy(); }); await sleep(300);
  assert(await p.evaluate(() => !!document.getElementById('copy-fmt-sheet')), 'the copy sheet should open');
  await p.evaluate(() => history.back()); await sleep(500);
  a = await at();
  assert(await p.evaluate(() => !document.getElementById('copy-fmt-sheet')) && a.screen === 'reader' && a.sel, 'Back should close the copy sheet and keep the picking: ' + JSON.stringify(a));
  await p.evaluate(() => exitSelectMode(true)); await sleep(400);
  // Tips ✕ uses up its step
  await p.evaluate(() => showTips()); await sleep(300);
  await p.evaluate(() => closeTips()); await sleep(400);
  assert(await p.evaluate(() => !(history.state && history.state.modal === 'tips') && !document.getElementById('tips-sheet').classList.contains('on')), 'Tips ✕ should leave no step behind');
  // Back while picking list verses returns to the list, not all lists
  await p.evaluate(() => { const it = (r, t) => ({r, a: r, t}); colSave({list: [{id: 'cx', n: 'Comfort', u: 1, items: [it('John 3:16', 'For God so loved the world')]}]}); showScreen('saved'); colOpen('cx'); }); await sleep(400);
  await p.evaluate(() => colPickStart()); await sleep(200);
  await p.evaluate(() => history.back()); await sleep(500);
  const l = await p.evaluate(() => ({open: S._colOpen, pick: S._colShot, list: !!document.querySelector('.col-pickgo')}));
  assert(l.open === 'cx' && !l.pick && l.list, 'Back from picking should show the list again: ' + JSON.stringify(l));
});

check('backup: Sword Drill progress, own verses and books read merge; a full phone keeps the newer edit', async p => {
  const r = await p.evaluate(() => {
    const st = MERGE_STORES.kjv_mem_mastery, now = Date.now();
    const A = {refs: {'John 3:16': {mastered: true, timesCompleted: 3, bestTimeChallenge: 40}}, streak: 2, streakLast: '', badges: []};
    const B = {refs: {'Psalms 23:1': {mastered: true, timesCompleted: 1}, 'John 3:16': {mastered: false, timesCompleted: 5, bestTimeChallenge: 30}}, streak: 1, streakLast: '', badges: []};
    const m = syncMergeStore(st, A, {'John 3:16': [now, 0]}, B, {'Psalms 23:1': [now, 0], 'John 3:16': [now, 0]}).value;
    const c = syncMergeStore(MERGE_STORES.kjv_books_read, ['Ruth', 'John'], {Ruth: [now, 0], John: [now, 0]}, ['Mark'], {Mark: [now, 0]}).value;
    // a full phone: the merged copy cannot be written, so nothing is marked merged
    localStorage.setItem('kjv_studies', JSON.stringify({active: 'a', list: [{id: 'a', t: 'Old', h: 'old', u: 1}]}));
    syncStamp();
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v){ if(k === 'kjv_studies') throw new DOMException('full', 'QuotaExceededError'); return set.call(this, k, v); };
    syncAdopt({kjv_studies: {active: 'a', list: [{id: 'a', t: 'New', h: 'new', u: 2}]}}, {st: {a: [now - 1000, 0]}});
    Storage.prototype.setItem = set;
    const meta = syncStamp().st.a;
    return {refs: Object.keys(m.refs).sort(), j: m.refs['John 3:16'], books: c.slice().sort(), staleNewer: meta[0] > now - 1000};
  });
  assert(r.refs.join() === 'John 3:16,Psalms 23:1', 'both phones\' verses should be kept: ' + r.refs);
  assert(r.j.mastered && r.j.timesCompleted === 5 && r.j.bestTimeChallenge === 30, 'one verse on two phones keeps the better of each: ' + JSON.stringify(r.j));
  assert(r.books.join() === 'John,Mark,Ruth', 'books read from both phones: ' + r.books);
  assert(!r.staleNewer, 'a copy that could not be written must not later count as a newer edit');
});

check('Present: a reference not in the Bible says so; Sword Drill streak shows only while alive', async p => {
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.evaluate(() => presOpen('John 3:16')); await sleep(1200);
  const before = await p.evaluate(() => [PRES.book, PRES.ch, PRES.v].join());
  for(const ref of ['Jude 2:1', 'John 22', 'John 3:99']){
    await p.evaluate(r => { presGotoOpen(); document.getElementById('pres-goto-in').value = r; return presGoto(); }, ref); await sleep(500);
  }
  const after = await p.evaluate(() => [PRES.book, PRES.ch, PRES.v].join());
  assert(!errs.length && before === after, 'a reference that is not there should leave the slide as it was: ' + JSON.stringify({errs, before, after}));
  await p.evaluate(() => presGotoOpen()); await sleep(200);
  await p.evaluate(() => history.back()); await sleep(400);
  const pg = await p.evaluate(() => ({box: document.getElementById('pres-goto').classList.contains('on'), pres: document.getElementById('pres-overlay').classList.contains('on')}));
  assert(!pg.box && pg.pres, 'Back should close the Go to box and keep Present: ' + JSON.stringify(pg));
  await p.evaluate(() => history.back()); await sleep(400);
  const n = await p.evaluate(() => { memUpdateStreakDisplay({streak: 9, streakLast: '2020-01-01'}); const a = document.getElementById('mgs-num'); return a ? a.textContent : '0'; });
  assert(n === '0', 'an old Sword Drill streak should show 0, not ' + n);
});

check('names only when the verse says them (3 John 1:1); one Psalm reads "Psalm 47"', async p => {
  await p.evaluate(() => jumpToRef('3 John 1:1')); await sleep(1200);
  await p.evaluate(() => { const el = document.querySelector('.vblock[data-ref="3 John 1:1"]'); openVPop('3 John 1:1', el.dataset.txt); }); await sleep(1800);
  const names = await p.evaluate(() => [...document.querySelectorAll('#vpop-names .vd-word')].map(x => x.textContent));
  assert(!names.includes('John') && names.includes('Gaius'), '3 John 1:1 names Gaius, not John: ' + names.join());
  await p.evaluate(() => history.back()); await sleep(400);
  await p.evaluate(() => jumpToRef('Psalms 47:1')); await sleep(1200);
  const r = await p.evaluate(() => ({loc: document.getElementById('reader-loc').textContent, sub: document.getElementById('ch-sub-text').textContent,
    one: refShow('Psalms 23:1'), many: refShow('Psalms 23–24'), lbl: passageLabel([{ref: 'Psalms 47:1'}, {ref: 'Psalms 47:2'}])}));
  assert(r.loc === 'Psalm 47' && r.sub === 'Psalm 47' && r.one === 'Psalm 23:1' && r.many === 'Psalms 23–24' && r.lbl === 'Psalm 47:1–2', 'Psalm labels: ' + JSON.stringify(r));
  await p.evaluate(() => { const el = document.querySelector('.vblock[data-ref="Psalms 47:1"]'); openVPop('Psalms 47:1', el.dataset.txt); setHL('y'); }); await sleep(400);
  const k = await p.evaluate(() => ({card: document.getElementById('vpop-ref').textContent, key: Object.keys(S.highlights).includes('Psalms 47:1')}));
  assert(k.card === 'Psalm 47:1' && k.key, 'the card shows Psalm 47:1 while the highlight is kept under Psalms 47:1: ' + JSON.stringify(k));
  await p.evaluate(() => { setHL(null); history.back(); }); await sleep(400);
});

check('Psalm titles: above verse 1 but not a verse; search, names, places, the timeline and journeys lead to them', async p => {
  await p.evaluate(() => jumpToRef('Psalms 52:1')); await sleep(1500);
  const r = await p.evaluate(() => ({
    title: document.querySelector('#ch-ps-title .ps-title')?.textContent || '',
    before: !!(document.getElementById('ch-ps-title').compareDocumentPosition(document.querySelector('#verses .vblock')) & Node.DOCUMENT_POSITION_FOLLOWING),
    first: document.querySelector('#verses .vblock')?.dataset.vnum, n: document.querySelectorAll('#verses .vblock').length,
    when: document.querySelector('#ch-ps-title .ps-when')?.textContent || '',
    time: document.getElementById('ch-time-btn').style.display !== 'none' && document.getElementById('ch-time-btn').textContent,
    jr: document.getElementById('ch-jr').textContent, where: document.getElementById('ch-where-btn').textContent}));
  assert(/^To the chief Musician, Maschil, A Psalm of David, when Doeg the Edomite came and told Saul/.test(r.title), 'Psalm 52 shows no title: ' + r.title);
  assert(r.before && r.first === '1' && r.n === 9, 'the title should sit above verse 1, the verses 1–9 as before: ' + JSON.stringify(r));
  assert(/Doeg/.test(r.when) && /1062/.test(r.time) && /David fleeing Saul/.test(r.jr) && /2 places/.test(r.where), 'Psalm 52 should lead to its history (📜, 📅 1062, 🧭, 📍 Nob and Gibeah): ' + JSON.stringify(r));
  // Select All and copy take the verses only, starting at verse 1
  await p.evaluate(() => selectAllVerses());
  const sel = await p.evaluate(() => ({n: S.selectedData.length, txt: joinVerseText(getSelectedSorted()), lbl: passageLabel(getSelectedSorted())}));
  assert(sel.n === 9 && !/Musician|Doeg/.test(sel.txt) && /^Why boastest thou/.test(sel.txt) && sel.lbl === 'Psalm 52:1–9', 'Select All should copy verses 1–9 alone: ' + JSON.stringify(sel).slice(0, 160));
  await p.evaluate(() => exitSelectMode(true)); await sleep(300);
  // The fold: the passages in 1 Samuel and the people; a passage opens its chapter
  await p.evaluate(() => { LS.set('kjv_ps_when', false); renderPsalmTitle(); psWhenToggle(); }); await sleep(1500);
  const f = await p.evaluate(() => ({refs: [...document.querySelectorAll('#ps-when-body .rc-ref')].map(x => x.textContent), pp: [...document.querySelectorAll('#ps-when-body .pp-chip')].map(x => x.textContent)}));
  assert(f.refs.join('|') === '1 Samuel 21:1–9|1 Samuel 22:6–10|1 Samuel 22:11–19|1 Samuel 22:20–23' && f.pp.some(x => /Doeg/.test(x)) && f.pp.some(x => /Abiathar/.test(x)), 'the fold: ' + JSON.stringify(f));
  await p.evaluate(() => document.querySelectorAll('#ps-when-body .rc')[1].click()); await sleep(1200);
  assert(await p.evaluate(() => S.book === '1 Samuel' && S.ch === 21), 'a passage should open 1 Samuel 22');
  await p.evaluate(() => LS.set('kjv_ps_when', false));
  // A Psalm with no title shows none; Psalm 119's letters stand over their verses, not as verses
  await p.evaluate(() => jumpToRef('Psalms 1:1')); await sleep(800);
  assert(await p.evaluate(() => document.getElementById('ch-ps-title').innerHTML === ''), 'Psalm 1 has no title');
  await p.evaluate(() => jumpToRef('Psalms 119:9')); await sleep(1000);
  const h = await p.evaluate(() => ({heads: [...document.querySelectorAll('#verses .ps-head')].map(x => x.textContent), n: document.querySelectorAll('#verses .vblock').length,
    next: document.querySelectorAll('#verses .ps-head')[1]?.nextElementSibling?.dataset.vnum}));
  assert(h.heads.length === 22 && h.heads[0] === 'א ALEPH.' && h.heads[21] === 'ת TAU.' && h.n === 176 && h.next === '9', 'Psalm 119: ' + JSON.stringify(h).slice(0, 160));
  // Search finds Doeg in the title of Psalm 52, and the title card opens it
  await p.evaluate(() => { showScreen('search'); switchSearchMode('search'); doSearch('Doeg'); }); await sleep(3500);
  const s = await p.evaluate(() => [...document.querySelectorAll('#s-results .rc .rc-ref')].map(x => x.textContent.replace('📝＋', '')));
  assert(s.includes('Psalm 52 · the title') && s.includes('1 Samuel 21:7'), 'searching Doeg: ' + s.join(' | '));
  assert(await p.evaluate(() => [...document.querySelectorAll('#s-results .rc')].find(x => /the title/.test(x.textContent)).dataset.nb === 'Psalms 52:1'), 'the title result should have 📝＋ Add to study, under Psalm 52');
  await p.evaluate(() => [...document.querySelectorAll('#s-results .rc')].find(x => /the title/.test(x.textContent)).click()); await sleep(1200);
  assert(await p.evaluate(() => S.screen === 'reader' && S.book === 'Psalms' && S.ch === 51), 'the title result should open Psalm 52');
  // Doeg's page lists the title with 1 Samuel; Nob's page too; a description reads "the title of Psalm 7"
  await p.evaluate(() => openPerson('Doeg_1')); await sleep(1800);
  const pp = await p.evaluate(() => [...document.querySelectorAll('#ppv-body .rc-ref')].map(x => x.textContent.replace('📝＋', '')));
  assert(pp.includes('Psalm 52 · the title') && pp.some(x => /^1 Samuel 21:7/.test(x)), 'Doeg\'s verses: ' + pp.join(' | '));
  await p.evaluate(() => openPlace('afdda14')); await sleep(1500);
  await p.evaluate(() => { const b = document.getElementById('plv-body'); if(b && !b.innerHTML) fillPlaceVerses(); }); await sleep(1200);
  assert(await p.evaluate(() => [...document.querySelectorAll('#plv-body .rc-ref')].some(x => x.textContent.replace('📝＋', '') === 'Psalm 52 · the title')), 'Nob\'s page should list the title of Psalm 52');
  assert(await p.evaluate(async () => (await loadPeople(), S._people.Cush_2.d)) === 'a Benjamite (the title of Psalm 7)', 'Cush\'s description');
  // The Timeline shows the Psalms of David's flight; Absalom's rebellion is there with Psalm 3
  await p.evaluate(() => openTimelineAt('tl-4-2')); await sleep(1500);
  const tl = await p.evaluate(() => [...document.querySelectorAll('#timeline-list .tl-ev')].map(e => [e.querySelector('.tl-t').textContent, [...e.querySelectorAll('.tl-ps button')].map(b => b.textContent.replace(/\D/g, '')).join(',')]).filter(x => x[1]));
  assert(tl.some(([t, ps]) => t === 'David flees from Saul' && ps === '34,52,54,56,57,59,142') && tl.some(([t, ps]) => t === "Absalom's rebellion" && ps === '3'), 'Timeline Psalms: ' + JSON.stringify(tl));
  // A journey's stop: Psalm 52 written at Nob; tapping it opens the Psalm and leaves the map
  await p.evaluate(() => openJourney('david', 2)); await sleep(2000);
  const jr = await p.evaluate(() => document.querySelector('#wm-list .jr-ps')?.textContent || '');
  assert(/Psalm 52/.test(jr), 'the Nob stop should show Psalm 52: ' + jr);
  await p.evaluate(() => document.querySelector('#wm-list .jr-ps button').click()); await sleep(1500);
  const end = await p.evaluate(() => ({book: S.book, ch: S.ch, map: document.getElementById('wm-overlay').classList.contains('on')}));
  assert(end.book === 'Psalms' && end.ch === 51 && !end.map, 'the Psalm should open with the map put away: ' + JSON.stringify(end));
});

check('verse card: photo controls show only for a photo you add', async p => {
  const shown = () => p.evaluate(() => { const r = document.getElementById('card-photo-row'); return !!r && getComputedStyle(r).display !== 'none'; });
  await p.evaluate(() => { S.cardOrientation = 'portrait'; S.cardBg = 'mountain'; openScrOverlay([{vnum: '20', txt: 'Whoso curseth his father or his mother, his lamp shall be put out in obscure darkness.'}], 'Proverbs 20:20'); });
  assert(!(await shown()), 'Top / Middle / Bottom and L / C / R should be hidden for a bundled scene');
  await p.evaluate(() => { S.cardBg = null; renderCanvas(S.cardTheme); });
  assert(!(await shown()), 'photo controls should be hidden on a plain colour card');
  await p.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 40; S.uploadImg = c; S.cardBg = 'upload'; renderCanvas(S.cardTheme); });
  assert(await shown(), 'photo controls should show once a photo is added');
});

check('verse card: no quote marks, every line inside the margins, the church footer', async p => {
  for(const orient of ['landscape', 'portrait']){
    const r = await p.evaluate(async orient => {
      const drawn = [], C = CanvasRenderingContext2D.prototype, orig = C.fillText;
      C.fillText = function(txt, x, y){ drawn.push({txt: String(txt), w: this.measureText(txt).width, x, align: this.textAlign, ctx: this, font: this.font}); return orig.apply(this, arguments); };
      S.cardOrientation = orient; S.cardBg = null; S.cardTheme = 'light';
      openScrOverlay([{vnum: '3', txt: 'So he carried me away in the spirit into the wilderness: and I saw a woman sit upon a scarlet coloured beast, full of names of blasphemy, having seven heads and ten horns.'}], 'Revelation 17:3');
      drawn.length = 0;   // only the render below
      renderCanvas('light');
      C.fillText = orig;
      const W = S._cw, PAD = orient === 'portrait' ? 52 : 60;
      const body = drawn.filter(d => d.align === 'left' && d.x === PAD);
      // Each line but the last should be full: in the font it is drawn in, the next
      // word would not have fitted (lines measured in another face fail this)
      const loose = body.slice(0, -1).filter((d, i) => {
        d.ctx.font = d.font;
        return d.ctx.measureText(d.txt + ' ' + body[i + 1].txt.split(' ')[0]).width <= W - 2 * PAD;
      }).map(d => d.txt);
      return {
        loose,
        quotes: drawn.some(d => /[“”"]/.test(d.txt)),
        over: body.filter(d => d.x + d.w > W - PAD + 0.5).map(d => d.txt),
        lines: body.length,
        footer: drawn.map(d => d.txt).filter(t => /fbckjv\.app|Faith Baptist|King James Version|KJV/.test(t))
      };
    }, orient);
    assert(r.lines > 1, `${orient}: the verse should be drawn in lines`);
    assert(!r.quotes, `${orient}: the card should have no quote marks`);
    assert(!r.loose.length, `${orient}: lines were broken in a different face than they are drawn in: ${r.loose.join(' | ')}`);
    assert(!r.over.length, `${orient}: lines run past the right margin: ${r.over.join(' | ')}`);
    assert(r.footer.includes('fbckjv.app/KJVBible') && r.footer.includes('Faith Baptist Church of Plymouth County'), `${orient}: the footer should carry the church's name and fbckjv.app/KJVBible`);
    assert(!r.footer.some(t => /^KJV$|King James Version/.test(t)), `${orient}: the address names the KJV; the card needn't say it again`);
  }
});

check('readable in every theme: verse numbers, small print and the Romans Road', async p => {
  // Text against what is behind it, as WCAG measures it: 4.5 to 1 for ordinary text
  const measure = () => {
    const parse = s => { const a = s.match(/[\d.]+/g).map(Number); return {r: a[0], g: a[1], b: a[2], a: a.length > 3 ? a[3] : 1}; };
    const over = (f, b) => ({r: f.r*f.a + b.r*(1-f.a), g: f.g*f.a + b.g*(1-f.a), b: f.b*f.a + b.b*(1-f.a), a: 1});
    const lum = c => [c.r, c.g, c.b].map(v => (v /= 255) <= .03928 ? v/12.92 : ((v+.055)/1.055) ** 2.4).reduce((s, v, i) => s + v*[.2126, .7152, .0722][i], 0);
    const bgOf = el => { const st = [];
      for(let e = el; e; e = e.parentElement){ const cs = getComputedStyle(e); let c = parse(cs.backgroundColor);
        const g = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(parse);
        if(g.length){ const m = {r:0, g:0, b:0, a:0}; g.forEach(k => { for(const x in m) m[x] += k[x]/g.length; }); c = c.a ? over(m, c) : m; }
        if(c.a){ st.push(c); if(c.a >= 1) break; } }
      return st.reduceRight((b, c) => over(c, b), {r:255, g:255, b:255, a:1}); };
    const bad = [];
    for(const sel of ['#screen-reader .vnum', '.rr-ref', '.rr-theme', '.rr-preview', '#rr-title', '.book-meta', '#vod-ref', '.bn']){
      const el = [...document.querySelectorAll(sel)].find(e => e.getClientRects().length);
      if(!el) continue;
      const bg = bgOf(el), fg = over(parse(getComputedStyle(el).color), bg);
      const [x, y] = [lum(fg), lum(bg)], ratio = (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
      if(ratio < 4.5) bad.push(`${sel} ${ratio.toFixed(2)}`);
    }
    return bad;
  };
  for(const theme of ['dark', 'light', 'sepia']){
    await p.evaluate(t => { setTheme(t); showScreen('books'); document.getElementById('rr-steps')?.classList.add('open'); }, theme);
    await sleep(500);
    const home = await p.evaluate(measure);
    await p.evaluate(() => jumpToRef('John 3:16')); await sleep(1200);
    const reader = await p.evaluate(measure);
    const bad = [...home, ...reader];
    assert(!bad.length, `${theme}: too faint to read: ${bad.join(', ')}`);
  }
});

check('screenshots (light and dark)', async (p, ctx, browser, base) => {
  fs.mkdirSync(SHOT_DIR, {recursive: true});
  for(const theme of ['dark', 'light']){
    const c = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2});
    const q = await openApp(c, base);
    if(theme === 'light') await q.evaluate(() => document.body.classList.add('light'));
    const shot = async n => { await sleep(700); await q.screenshot({path: path.join(SHOT_DIR, `${theme}-${n}.png`)}); };
    await shot('1-home');
    await q.evaluate(() => jumpToRef('John 3:16')); await sleep(1200); await shot('2-reader');
    await q.evaluate(() => { const d = S.bookData.chapters[2].verses[15]; openVPop('John 3:16', d.text); }); await shot('3-verse-card');
    await q.evaluate(() => history.back()); await q.evaluate(() => openStrongs('H2617')); await sleep(2000); await shot('4-strongs');
    await q.evaluate(() => { showScreen('search'); goSearchHome(); }); await sleep(800); await shot('5-search');
    await q.evaluate(() => openSettings()); await shot('6-settings');
    await c.close();
  }
}, {only: SHOTS});

/* ── Run ── */
// What's New is for people updating: each check starts with this version's seen
const WN = (fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/WHATS_NEW_VERSION = '([^']+)'/) || [])[1] || '';
async function openApp(ctx, base, {rc = 'TEST01', hints = false, clock = false} = {}){
  const p = await ctx.newPage();
  p._errors = [];
  p.on('pageerror', e => p._errors.push(e.message));
  if(clock) await p.clock.install();
  await p.addInitScript(([rc, hints, wn]) => {
    if(sessionStorage.getItem('__set')) return; // a reload keeps what the check changed
    sessionStorage.setItem('__set', '1');
    localStorage.setItem('kjv_rc', rc);
    localStorage.setItem('kjv_whatsnew', wn);
    if(!hints) localStorage.setItem('kjv_hints_off', 'true');
    else localStorage.setItem('kjv_hints_seen', JSON.stringify(['home', 'reader', 'verse', 'search', 'notes', 'plans']));
  }, [rc, hints, WN]);
  await p.goto(base + '/index.html');
  if(clock) await p.clock.runFor(2500); else await sleep(2200);
  return p;
}

(async () => {
  const {chromium} = loadPlaywright();
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const launch = {};
  if(process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  else if(fs.existsSync('/opt/pw-browsers/chromium')) launch.executablePath = '/opt/pw-browsers/chromium';
  const browser = await chromium.launch(launch);
  const todo = CHECKS.filter(c => (c.opts.only === undefined || c.opts.only) && (!ONLY.length || ONLY.some(o => c.name.toLowerCase().includes(o.toLowerCase()))));
  let failed = 0;
  for(const c of todo){
    const t0 = Date.now();
    let ctx = null, p = null;
    try{
      if(!c.opts.noPage){
        ctx = await browser.newContext({viewport: {width: 390, height: 844}, acceptDownloads: true});
        p = await openApp(ctx, base, {hints: !!c.opts.hints, clock: !!c.opts.clock});
      }
      await c.fn(p, ctx, browser, base);
      if(p && p._errors.length) throw new Error('page errors: ' + p._errors.join(' / '));
      console.log(`✓ ${c.name}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    }catch(e){
      failed++;
      console.log(`✗ ${c.name}\n    ${String(e.message || e).split('\n')[0]}`);
    }finally{
      if(ctx) await ctx.close().catch(() => {});
    }
  }
  await browser.close();
  server.close();
  console.log(failed ? `\n${failed} of ${todo.length} checks failed` : `\nAll ${todo.length} checks passed`);
  if(SHOTS) console.log(`Screenshots in ${path.relative(ROOT, SHOT_DIR)}/`);
  process.exit(failed ? 1 : 0);
})();
