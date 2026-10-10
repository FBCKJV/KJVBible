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
  assert(r.streak >= 1, 'listening should keep the streak');
});

check('share: links open a chapter or verses; a newcomer sees them first; Home', async (p, ctx, browser, base) => {
  const links = await p.evaluate(() => ({one: passageLink('1 John', 3, [16]), some: passageLink('John', 3, [5, 3, 4, 8]), ch: passageLink('Song of Solomon', 2), span: verseSpan([1, 2, 3, 7, 9, 10], '–')}));
  assert(links.one.endsWith('#1+John+3:16') && links.some.endsWith('#John+3:3-5,8') && links.ch.endsWith('#Song+of+Solomon+2') && links.span === '1–3,7,9–10', JSON.stringify(links));
  // Several verses chosen on the card are shared with their link
  await p.evaluate(() => { window.__shared = null; navigator.share = d => { window.__shared = d; return Promise.resolve(); }; jumpToRef('John 3:16'); });
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
