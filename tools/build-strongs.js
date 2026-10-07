#!/usr/bin/env node
// Build Strong's Hebrew & Greek: strongs/v/0.json … 65.json, strongs/H0.json …,
// strongs/G0.json …, strongs/H.json and strongs/G.json
//
//   node tools/build-strongs.js
//
// Sources (tools/strongs/):
//   kjv-tags.jsonl.gz      — the CrossWire Bible Society's KJV, each word with
//                            its Strong's number(s) ("General public license
//                            for distribution for any purpose"); made by
//                            tools/strongs/extract-crosswire.js
//   StrongHebrewG.xml.gz   — James Strong, A Concise Dictionary of the Words in
//                            the Hebrew Bible (1890), XML by David Troidl and
//                            David Instone-Brewer — Public Domain. Only Strong's
//                            own text is used (its TWOT numbers and the outline
//                            of meanings are left out).
//   strongsgreek.xml.gz    — Strong's Dictionary of the Greek Words (1890), XML
//                            by Ulrik Petersen — Public Domain
//
// The tags are lined up with the app's own text (bible/*.json): word by word
// by their letters, which agree in all but ~180 verses; those (spellings such
// as Adonizedec / Adoni–zedek) are matched word by word.
//
// Output
//   strongs/v/<book>.json   { "c:v": "3H8034 3H376 _ H458 …" } — runs over the
//                           verse's words (text.split(' ')): a count (1 left
//                           out), then the number(s) joined by "+", or "_" for
//                           a word with none (most of them the italic words)
//   strongs/H.json, G.json  { "8034": [lemma, xlit, pron, gloss, verses, renderings] }
//                           — the list, search and the verse card; renderings
//                           are the commonest few, "name 729|names 80|renown 7"
//   strongs/H<k>.json …     { "8034": {l, x, p, t, d, s, k, r, v} } — the full
//                           entry, 500 numbers a file: l lemma, x xlit, p pron,
//                           t kind, d derivation, s definition, k KJV renderings
//                           (Strong's), r [[rendering, times], …] counted in the
//                           text, v the verses ("b.c:v,v;b.c:v")
// Links between entries: <a class="sg-ref" data-s="H1961">H1961</a>

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(__dirname, 'strongs');
const OUT = path.join(ROOT, 'strongs');
const BOOKS = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
const OSIS = 'Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev'.split(' ');
const SHARD = 500;

const norm = w => w.toLowerCase().replace(/[^a-z]/g, '');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unesc = s => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/* ── The tags, lined up with the app's text ── */
// Each app word gets the number(s) of the CrossWire words its letters came from
function alignByLetters(appWords, cw){
  const owner = [];
  cw.forEach(([w, tag]) => { for(const ch of norm(w)) owner.push(tag); });
  let i = 0;
  return appWords.map(w => {
    const tags = [];
    for(const ch of norm(w)){ const t = owner[i++]; if(t && !tags.includes(t)) tags.push(t); }
    return tags.join(' ');
  });
}
// The few verses spelled differently: match whole words (longest common
// subsequence), then pair the words left between two matches in order
function alignByWords(appWords, cw){
  const A = appWords.map(norm), C = cw.map(([w]) => norm(w));
  const n = A.length, m = C.length;
  const L = Array.from({length: n + 1}, () => new Int16Array(m + 1));
  for(let i = n - 1; i >= 0; i--) for(let j = m - 1; j >= 0; j--)
    L[i][j] = A[i] && A[i] === C[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = new Array(n).fill('');
  let i = 0, j = 0, gi = 0, gj = 0;
  const fillGap = (i0, i1, j0, j1) => {
    // the same letters split differently ("Beersheba" / "Beer–sheba") → by letters
    const a = appWords.slice(i0, i1), c = cw.slice(j0, j1);
    if(a.map(norm).join('') === c.map(([w]) => norm(w)).join('')){ alignByLetters(a, c).forEach((t, k) => out[i0 + k] = t); return; }
    for(let k = 0; k < Math.min(a.length, c.length); k++) out[i0 + k] = c[k][1];
  };
  while(i < n && j < m){
    if(A[i] && A[i] === C[j]){ fillGap(gi, i, gj, j); out[i] = cw[j][1]; i++; j++; gi = i; gj = j; }
    else if(L[i + 1][j] >= L[i][j + 1]) i++;
    else j++;
  }
  fillGap(gi, n, gj, m);
  return out;
}
function encodeRuns(tags){
  const runs = [];
  for(const t of tags){
    const key = t ? t.split(' ').join('+') : '_';
    if(runs.length && runs[runs.length - 1][1] === key) runs[runs.length - 1][0]++;
    else runs.push([1, key]);
  }
  return runs.map(([n, k]) => (n > 1 ? n : '') + k).join(' ');
}

// How the KJV renders a number in a verse: its words, without the small
// words a phrase starts with ("and the name" → "name", "shall go" → "go")
const LEAD = new Set(('and the a an of to in for with by from unto upon on at into that which who whom whose his her their my thy thine our your its own '
  + 'they he she it i we ye you thou thee him them me us shall will should would shalt wilt may might let be is was were are been hath have had hast '
  + 'did do doth not nor but or so as also even when then there therefore now behold because against according after before all every no yet if '
  + 'how what why where whither wherefore wherewith whereby moreover seeing yea only any more above lest since till until about over under through among this these those o').split(' '));
function rendering(words){
  const w = words.map(x => x.toLowerCase().replace(/[^a-z’'-]/g, '').replace(/[’']s?$/, '')).filter(Boolean);
  while(w.length > 1 && LEAD.has(w[0])) w.shift();
  while(w.length > 1 && LEAD.has(w[w.length - 1])) w.pop();
  return w.join(' ');
}

const versesFor = {}; // "H8034" → [[b, c, v], …]
const renders = {};   // "H8034" → Map(rendering → times)
let letterOK = 0, byWords = 0, untaggedWords = 0, totalWords = 0;
const tagLines = zlib.gunzipSync(fs.readFileSync(path.join(SRC, 'kjv-tags.jsonl.gz'))).toString('utf8').trim().split('\n').map(l => JSON.parse(l));
const tagMap = new Map(tagLines.map(([b, c, v, w]) => [`${b} ${c}:${v}`, w]));
fs.mkdirSync(path.join(OUT, 'v'), {recursive: true});
BOOKS.forEach((book, bi) => {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'bible', book.replace(/ /g, '') + '.json'), 'utf8'));
  const out = {};
  for(const ch of data.chapters) for(const vs of ch.verses){
    const cw = tagMap.get(`${OSIS[bi]} ${ch.chapter}:${vs.verse}`);
    if(!cw) continue;
    const words = vs.text.trim().split(/\s+/);
    let tags;
    if(words.map(norm).join('') === cw.map(([w]) => norm(w)).join('')){ tags = alignByLetters(words, cw); letterOK++; }
    else { tags = alignByWords(words, cw); byWords++; }
    out[`${ch.chapter}:${vs.verse}`] = encodeRuns(tags);
    totalWords += words.length; untaggedWords += tags.filter(t => !t).length;
    // where each number is found, and the words it is rendered by
    const seen = new Map();
    tags.forEach((t, k) => { if(t) for(const s of t.split(' ')){ if(!seen.has(s)) seen.set(s, []); seen.get(s).push(k); } });
    for(const [s, idx] of seen){
      (versesFor[s] || (versesFor[s] = [])).push([bi, +ch.chapter, +vs.verse]);
      // each run of words is one rendering ("should … perish" counts once, as "perish")
      const runs = []; idx.forEach(k => { const r = runs[runs.length - 1]; if(r && r[r.length - 1] === k - 1) r.push(k); else runs.push([k]); });
      // each run is one occurrence; a lone small word beside a fuller run is part of it
      const ws = runs.map(r => rendering(r.map(k => words[k]))).filter(Boolean);
      const meaningful = ws.filter(x => !LEAD.has(x));
      const m = renders[s] || (renders[s] = new Map());
      for(const r of meaningful.length ? meaningful : ws) m.set(r, (m.get(r) || 0) + 1);
    }
  }
  fs.writeFileSync(path.join(OUT, 'v', bi + '.json'), JSON.stringify(out));
});
console.log(`aligned: ${letterOK} by letters, ${byWords} word by word; ${untaggedWords} of ${totalWords} words without a number`);

/* ── The dictionaries ── */
const entries = {}; // "H8034" → {l, x, p, t, d, s, k}
const HEB_KIND = {'n-m':'noun masculine','n-f':'noun feminine','n':'noun','n-m-pl':'noun masculine plural','n-f-pl':'noun feminine plural','v':'verb','a':'adjective','a-m':'adjective masculine','a-f':'adjective feminine','adv':'adverb','prep':'preposition','conj':'conjunction','inj':'interjection','pron':'pronoun','prt':'particle','n-pr-m':'proper name, of a man','n-pr-f':'proper name, of a woman','n-pr-loc':'proper name, of a place','n-pr':'proper name','n-pr-g':'proper name, of a people','a-gent':'gentilic (of a people)','x':'particle'};
const hebLink = (src, attrs) => `<a class="sg-ref" data-s="H${+src}">H${+src}</a>${attrs.lemma ? ` (${esc(unesc(attrs.lemma))})` : ''}`;
const attrsOf = tag => { const a = {}; tag.replace(/([\w:]+)="([^"]*)"/g, (m, k, v) => a[k] = v); return a; };
// Hebrew: inner <w src=…/> are other entries; <hi> is Strong's italics
function hebText(x){
  return (x || '')
    .replace(/<w\b([^>]*?)\/>/g, (m, a) => { const at = attrsOf(a); return at.src ? hebLink(at.src, at) : esc(unesc(at.lemma || '')); })
    .replace(/<w\b([^>]*)>([\s\S]*?)<\/w>/g, (m, a, inner) => { const at = attrsOf(a); return at.src ? hebLink(at.src, at) : inner; })
    .replace(/<hi\b[^>]*>/g, '<i>').replace(/<\/hi>/g, '</i>')
    .replace(/<(?!\/?i>|a\b|\/a>)[^>]+>/g, '')
    .replace(/<\/i>\s*<i>/g, ' ').replace(/\s+/g, ' ').trim();
}
const heb = zlib.gunzipSync(fs.readFileSync(path.join(SRC, 'StrongHebrewG.xml.gz'))).toString('utf8');
for(const m of heb.matchAll(/<div type="entry" n="(\d+)">([\s\S]*?)<\/div>/g)){
  const body = m[2];
  const w = body.match(/<w\b([^>]*ID="H\d+"[^>]*)>/);
  if(!w) continue;
  const at = attrsOf(w[1]);
  const note = t => { const x = body.match(new RegExp(`<note type="${t}">([\\s\\S]*?)</note>`)); return x ? hebText(x[1]) : ''; };
  const lang = at['xml:lang'] === 'arc' ? 'Aramaic' : 'Hebrew';
  const kind = HEB_KIND[at.morph] || '';
  entries['H' + +m[1]] = {l: unesc(at.lemma || ''), x: unesc(at.xlit || ''), p: unesc(at.POS || ''), t: lang + (kind ? ' · ' + kind : ''),
    d: note('exegesis'), s: note('explanation'), k: note('translation')};
}
// Greek: <greek unicode/> is a Greek word, <strongsref/> another entry
const gk = zlib.gunzipSync(fs.readFileSync(path.join(SRC, 'strongsgreek.xml.gz'))).toString('utf8');
function gkText(x){
  return (x || '')
    .replace(/<strongsref\b([^>]*)\/>/g, (m, a) => { const at = attrsOf(a); const L = at.language === 'HEBREW' ? 'H' : 'G'; return `<a class="sg-ref" data-s="${L}${+at.strongs}">${L}${+at.strongs}</a>`; })
    .replace(/<greek\b([^>]*)\/>/g, (m, a) => esc(attrsOf(a).unicode || ''))
    .replace(/<latin>([\s\S]*?)<\/latin>/g, '<i>$1</i>')
    .replace(/<(?!\/?i>|a\b|\/a>)[^>]+>/g, '')
    .replace(/\s+/g, ' ').trim();
}
for(const m of gk.matchAll(/<entry strongs="(\d+)">([\s\S]*?)<\/entry>/g)){
  const body = m[2];
  const g = body.match(/<greek\b([^>]*)\/>/), pr = body.match(/<pronunciation strongs="([^"]*)"/);
  if(!g) continue;
  const at = attrsOf(g[1]);
  const part = t => { const x = body.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)); return x ? gkText(x[1]) : ''; };
  // what follows the KJV renderings ("Compare G5368.") belongs with them
  const after = gkText((body.split('</kjv_def>')[1] || '').replace(/<see\b[^>]*\/>/g, ''));
  entries['G' + +m[1]] = {l: unesc(at.unicode || ''), x: unesc(at.translit || ''), p: pr ? unesc(pr[1]) : '', t: 'Greek',
    d: part('strongs_derivation'), s: part('strongs_def').replace(/^[\s:]+/, ''), k: (part('kjv_def').replace(/^:--/, '') + (after ? ' ' + after : '')).trim()};
}
// Strong's prints the forms first ("fore-) father(-less)"); one line for lists
const plain = h => (h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
function gloss(e){
  let s = plain(e.s).replace(/^\{(.*)\}$/, '$1'); // {braces}: Strong's own repeat of a related word's sense
  if(!s) s = plain(e.k);
  return s.length > 110 ? s.slice(0, s.lastIndexOf(' ', 104)) + '…' : s;
}
// "b.c:v,v;b.c:v"
function packRefs(list){
  const parts = []; let cur = null;
  for(const [b, c, v] of list){
    const k = b + '.' + c;
    if(cur && cur[0] === k) cur[1].push(v); else parts.push(cur = [k, [v]]);
  }
  return parts.map(([k, vs]) => k + ':' + vs.join(',')).join(';');
}

const NO_RENDER = new Set(['H853', 'G3588']);
let missing = 0;
for(const L of ['H', 'G']){
  const idx = {}, shards = {};
  const nums = Object.keys(entries).filter(k => k[0] === L).map(k => +k.slice(1)).sort((a, b) => a - b);
  for(const n of nums){
    const k = L + n, e = entries[k];
    const vs = versesFor[k] || [];
    // the article and the object marker go with every noun: no renderings of their own
    const r = renders[k] && !NO_RENDER.has(k) ? [...renders[k]].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 24) : [];
    // the commonest renderings, for searching by English word: "love 86|charity 27"
    const top = r.filter(([w, c], i) => w.split(' ').length <= 2 && (i < 3 || c >= 2)).slice(0, 6).map(([w, c]) => w + ' ' + c).join('|');
    idx[n] = [e.l, e.x, e.p, gloss(e), vs.length, top];
    (shards[Math.floor(n / SHARD)] || (shards[Math.floor(n / SHARD)] = {}))[n] = {...e, r, v: packRefs(vs)};
  }
  for(const k of Object.keys(versesFor)) if(k[0] === L && !entries[k]) missing++;
  fs.writeFileSync(path.join(OUT, L + '.json'), JSON.stringify(idx));
  for(const [s, obj] of Object.entries(shards)) fs.writeFileSync(path.join(OUT, L + s + '.json'), JSON.stringify(obj));
  console.log(`${L}: ${nums.length} entries, ${Object.keys(shards).length} files`);
}
if(missing) console.log(`${missing} numbers in the text have no dictionary entry`);
