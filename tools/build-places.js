#!/usr/bin/env node
// Build places.json — where the places of the Bible were.
//
//   node tools/build-places.js
//
// Source: OpenBible.info Bible Geocoding Data (CC BY 4.0,
// https://github.com/openbibleinfo/Bible-Geocoding-Data), ancient.jsonl and
// modern.jsonl gzipped in tools/openbible/ with the license. It is plain
// geography — modern sites, coordinates and how confident scholarship is in
// each identification — with no commentary. The app credits OpenBible.info
// wherever places are shown.
//
// For each place:
//   • only the verses where the KJV names it are kept, each checked against
//     bible/*.json;
//   • its name is the spelling the KJV text actually uses there ("Beth-el"
//     or "Bethel"), with other KJV spellings kept as alternates;
//   • the best identification (highest current confidence, 0–1000) gives
//     the modern site and coordinates; up to three others are kept as
//     "other suggested sites". Places of unknown location keep their verses.
//
// Emits ../places.json:
//   { source, generated, count, places: { id: {
//       n: name, a: [other KJV spellings], t: type, s: modern site,
//       d: description ("near Gibeah", "along the Wadi el Esh"),
//       ll: [lat, lon], c: confidence 0–1000, o: [[site, confidence, lat, lon]],
//       v: "bookIndex.chapter:verses;…", u: openbible url slug } } }

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BOOKS = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
// OSIS book codes, in canonical order
const OSIS = ['Gen','Exod','Lev','Num','Deut','Josh','Judg','Ruth','1Sam','2Sam','1Kgs','2Kgs','1Chr','2Chr','Ezra','Neh','Esth','Job','Ps','Prov','Eccl','Song','Isa','Jer','Lam','Ezek','Dan','Hos','Joel','Amos','Obad','Jonah','Mic','Nah','Hab','Zeph','Hag','Zech','Mal','Matt','Mark','Luke','John','Acts','Rom','1Cor','2Cor','Gal','Eph','Phil','Col','1Thess','2Thess','1Tim','2Tim','Titus','Phlm','Heb','Jas','1Pet','2Pet','1John','2John','3John','Jude','Rev'];
const OSIS_IDX = Object.fromEntries(OSIS.map((c, i) => [c, i]));

const readJsonl = f => zlib.gunzipSync(fs.readFileSync(path.join(__dirname, 'openbible', f))).toString('utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l));
const ancient = readJsonl('ancient.jsonl.gz');
const modern = Object.fromEntries(readJsonl('modern.jsonl.gz').map(m => [m.id, m]));

const bible = BOOKS.map(b => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'bible', b.replace(/ /g, '') + '.json'), 'utf8')).chapters);
const verseText = (b, c, v) => { const ch = bible[b][c - 1]; const x = ch && ch.verses[v - 1]; return x ? x.text : null; };
const tags = s => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const lonlat = s => { if(!s) return null; const [lon, lat] = s.split(',').map(Number); return isFinite(lat) && isFinite(lon) ? [+lat.toFixed(5), +lon.toFixed(5)] : null; };
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function editDistance(a, b){
  const d = Array.from({length: b.length + 1}, (_, j) => j);
  for(let i = 1; i <= a.length; i++){ let prev = d[0]; d[0] = i;
    for(let j = 1; j <= b.length; j++){ const t = d[j]; d[j] = Math.min(d[j] + 1, d[j-1] + 1, prev + (a[i-1] === b[j-1] ? 0 : 1)); prev = t; } }
  return d[b.length];
}
const letters = s => s.toLowerCase().replace(/[^a-z]/g, '');
const similar = (x, y) => { const a = letters(x), b = letters(y); return a === b || editDistance(a, b) <= Math.max(1, Math.floor(Math.min(a.length, b.length) / 3)); };
// "another name for Ai 1" → "another name for Ai" (the dataset numbers same-named places)
const tidyDesc = s => tags(s).replace(/\b([A-Z][\w'’-]*(?: [A-Z][\w'’-]*)*) \d+\b/g, '$1');

const stats = { places: 0, skippedNoKjv: 0, verses: 0, badVerses: 0, located: 0, unknown: 0 };
const places = {};
for(const a of ancient){
  // KJV verses only, validated
  const refs = [];
  for(const v of a.verses || []){
    if(!(v.translations || []).includes('kjv')) continue;
    const m = (v.osis || '').match(/^(\w+)\.(\d+)\.(\d+)$/);
    const b = m && OSIS_IDX[m[1]];
    if(b === undefined || !verseText(b, +m[2], +m[3])){ stats.badVerses++; continue; }
    refs.push([b, +m[2], +m[3]]);
  }
  if(!refs.length){ stats.skippedNoKjv++; continue; }

  // The spelling the KJV uses in those verses
  const counts = {};
  for(const name of Object.keys(a.translation_name_counts || {})){
    const re = new RegExp(`(^|[^A-Za-z-])${reEsc(name)}(?![A-Za-z-])`);
    counts[name] = refs.filter(([b, c, v]) => re.test(verseText(b, c, v))).length;
  }
  // (proper names before descriptive phrases like "city of David")
  const used = Object.entries(counts).filter(([, n]) => n > 0)
    .sort((x, y) => (/^[A-Z]/.test(y[0]) - /^[A-Z]/.test(x[0])) || y[1] - x[1]);
  // the dataset's own name for the place wins when the KJV uses it ("City of David")
  const own = a.friendly_id.replace(/\s+\d+$/, '');
  const ownUsed = used.find(([n]) => letters(n) === letters(own));
  let name = ownUsed ? ownUsed[0] : used.length ? used[0][0] : own;
  name = name.charAt(0).toUpperCase() + name.slice(1);
  // Other spellings of the same name only (Ai/Hai, Sinai/Sina) — not other
  // words a verse uses for the place (Jerusalem is not "Judah" or "Zion")
  const alts = used.slice(1).map(([n]) => n).filter(n => /^[A-Z][A-Za-z'’-]*$/.test(n) && n !== name && similar(n, name));

  // Verses, grouped by chapter, runs collapsed
  const byCh = new Map();
  for(const [b, c, v] of refs){ const k = `${b}.${c}`; if(!byCh.has(k)) byCh.set(k, new Set()); byCh.get(k).add(v); }
  const vparts = [];
  for(const [k, set] of byCh){
    const vs = [...set].sort((x, y) => x - y), out = []; let s = vs[0], p = vs[0];
    for(const v of vs.slice(1).concat([Infinity])){ if(v === p + 1){ p = v; continue; } out.push(s === p ? `${s}` : `${s}-${p}`); s = p = v; }
    vparts.push(`${k}:${out.join(',')}`); stats.verses += vs.length;
  }

  const e = { n: name, v: vparts.join(';'), u: `${a.id}/${a.url_slug}` };
  if(alts.length) e.a = alts;
  if(a.types && a.types.length) e.t = a.types[0];

  // Identifications, best first (current confidence, 0–1000)
  const ids = (a.identifications || []).map(idf => {
    const res = (idf.resolutions || []).find(r => r.lonlat) || null;
    const score = idf.score ? (idf.score.time_total ?? idf.score.vote_total ?? 0) : 0;
    const site = res && res.modern_basis_id && modern[res.modern_basis_id] ? modern[res.modern_basis_id].friendly_id : tags(idf.description);
    return { score, res, site: tidyDesc(site), desc: tidyDesc(idf.description), special: idf.id_source === 'special' };
  }).sort((x, y) => y.score - x.score);
  const best = ids.find(x => x.res);
  if(best){
    e.s = best.site; e.ll = lonlat(best.res.lonlat); e.c = Math.max(0, Math.min(1000, Math.round(best.score)));
    if(best.desc && best.desc !== best.site) e.d = best.desc;
    const others = ids.filter(x => x !== best && x.res && x.score >= 50 && x.site !== best.site).slice(0, 3)
      .map(x => { const ll = lonlat(x.res.lonlat); return [x.site, Math.round(x.score), ll[0], ll[1]]; });
    if(others.length) e.o = others;
    stats.located++;
  } else stats.unknown++;
  places[a.id] = e; stats.places++;
}

const out = { source: 'OpenBible.info Bible Geocoding Data (CC BY 4.0) — https://www.openbible.info/geo/', generated: new Date().toISOString().slice(0, 10), count: stats.places, places };
const dest = path.join(__dirname, '..', 'places.json');
fs.writeFileSync(dest, JSON.stringify(out));
console.log(`Wrote ${dest}: ${stats.places} places (${stats.located} located, ${stats.unknown} location unknown; ${stats.skippedNoKjv} not named in the KJV skipped), ${stats.verses} KJV verses (${stats.badVerses} invalid dropped), ${(fs.statSync(dest).size / 1024).toFixed(0)} KB`);
