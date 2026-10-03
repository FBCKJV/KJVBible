#!/usr/bin/env node
// Build the Dictionary's Webster data: dictionary/a.json … dictionary/z.json
//
//   node tools/build-webster.js
//
// Source: Noah Webster, "An American Dictionary of the English Language"
// (1828, public domain), as transcribed by akaitsurugi/webster1828
// (CC BY-SA 4.0 — tools/webster1828/LICENSE; the files in dictionary/ are
// shared under the same license), plus 21 entries it lacks from
// DataWar/1828-dictionary (MIT; tools/webster1828/datawar-extras.json).
// DataWar's copy was not used as the base: ~800 of its entries are scraped
// website error pages and menu text.
//
// Scripture references: the transcription dropped or garbled digits in some
// references (Hebrews 2:18 → "Hebrews 2:1", Psalm 139:12 → "Psalms 13:1",
// often writing "1" for the verse). Every reference is checked against
// bible/*.json (checkRef, below):
//   1. Confirmed when the verse holds the quotation before it, or the headword.
//   2. Otherwise repaired: the quotation (or the headword) in another verse of
//      the same chapter or of a chapter differing by one digit, then the
//      quotation anywhere in the KJV. A repair must agree with the quotation
//      and, where possible, contain the headword — Webster's own prose is
//      never "matched" to a verse.
//   3. When the verse can't be recovered but the chapter is certain, the
//      reference shows the chapter ("Psalms 118") — never a wrong verse.
//   4. Valid references that can't be confirmed are kept (mostly ones that
//      illustrate the idea without the word, e.g. Psalm 2:12 for ADORE);
//      "references" to chapters that don't exist are unlinked.
// Each repair is listed in tools/webster1828/repairs.txt. References become
// links in the output: <a class="wd-ref" data-r="Book c:v">.
//
// Output shard per first letter: { "word": [[headword, partOfSpeech, html], …] }
// html keeps only <p>, <b>, <i>, <br> and those links.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BOOKS = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];

function parseCSV(text){
  const rows=[]; let row=[], f='', q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){ f+='"'; i++; } else q=false; } else f+=c; continue; }
    if(c==='"') q=true; else if(c===','){ row.push(f); f=''; } else if(c==='\n'){ row.push(f); rows.push(row); row=[]; f=''; } else if(c!=='\r') f+=c;
  }
  if(f || row.length){ row.push(f); rows.push(row); }
  return rows;
}

// ── KJV text, tokenised; Webster's American spellings compared on a common form
const canon = w => w.replace(/([a-z])our(able|ably|ed|er|ers|ing|s|est|eth|ite|ites)?$/, '$1or$2').replace(/fence(s)?$/, 'fense$1')
  .replace(/^fulfil+/, 'fulfil').replace(/ellous$/, 'elous').replace(/([^aeiou])re$/, '$1er').replace(/ise(d|s)?$/, 'ize$1').replace(/^shew/, 'show').replace(/^enquir/, 'inquir').replace(/^intreat/, 'entreat')
  .replace(/full+ness/, 'fulness').replace(/llor(s)?$/, 'lor$1').replace(/^asswag/, 'assuag');
const toks = s => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z ]/g, ' ').split(/\s+/).filter(Boolean).map(canon);
const V = [], at = {}, chapters = {};
BOOKS.forEach(b => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'bible', b.replace(/ /g, '') + '.json'), 'utf8')).chapters.forEach((c, ci) => {
  chapters[`${b} ${ci + 1}`] = [];
  c.verses.forEach((v, vi) => {
    const t = toks(v.text), x = { b, c: ci + 1, v: vi + 1, t, set: new Set(t) };
    at[`${b} ${ci + 1}:${vi + 1}`] = V.length; chapters[`${b} ${ci + 1}`].push(V.length); V.push(x);
  });
}));
const STOPQ = new Set('that this with from have hath unto upon they them their there which shall will what when were been into your thou thee thy thine also than then come came made make said saith even more such some like only very much hast doth the and for not but his her him who all ye are was be is of to in a an it as at by or my me we us he she so no do if on up our one'.split(' '));
const inv = new Map();
V.forEach((x, i) => { for(const w of x.set){ if(STOPQ.has(w) || w.length < 3) continue; if(!inv.has(w)) inv.set(w, []); inv.get(w).push(i); } });
const refName = x => `${x.b} ${x.c}:${x.v}`;

// Roughly how many verses use a word (by stem) — rare words make safer clues
const _freq = new Map();
function hwFrequency(stem){
  if(!_freq.has(stem)){ let n = 0; for(const [w, l] of inv) if(w.startsWith(stem)) n += l.length; _freq.set(stem, n); }
  return _freq.get(stem);
}
function editDistance(a, b){
  const d = Array.from({length: b.length + 1}, (_, j) => j);
  for(let i = 1; i <= a.length; i++){
    let prev = d[0]; d[0] = i;
    for(let j = 1; j <= b.length; j++){ const t = d[j]; d[j] = Math.min(d[j] + 1, d[j-1] + 1, prev + (a[i-1] === b[j-1] ? 0 : 1)); prev = t; }
  }
  return d[b.length];
}
// Verse numbers that differ from the cited one by a single dropped digit
function droppedDigit(cited, n){
  const a = String(cited), b = String(n);
  if(b.length !== a.length + 1) return false;
  for(let i = 0; i < b.length; i++) if(b.slice(0, i) + b.slice(i + 1) === a) return true;
  return false;
}

const stats = { refs: 0, confirmed: 0, repairedVerse: 0, repairedElsewhere: 0, toChapter: 0, keptUnconfirmed: 0, unlinked: 0 };
const repairs = [], unconfirmed = [];
// Returns null (keep as cited), a "Book c:v" repair, {chapter:"Book c"} when
// only the chapter is certain, or false (not a real reference — unlink).
function checkRef(book, ch, vs, quote, word){
  stats.refs++;
  // Headword as KJV tokens; hyphenated words ("corner-stone") are two words in the KJV
  const parts = toks(word.replace(/['’]/g, ''));
  const last = parts[parts.length - 1] || '';
  const stem = last.length > 5 ? last.slice(0, last.length - 2) : last.slice(0, Math.max(3, last.length - 1));
  const lead = parts.slice(0, -1).join(' ');
  // (a hyphenated headword also counts by its last part alone when that's a
  // real word of 4+ letters — "scape-goat" → goat, "forhead-bald" → bald)
  const hasHw = x => stem.length >= 3 && (lead
    ? (' ' + x.t.join(' ')).includes(' ' + lead + ' ' + stem) || (last.length >= 4 && x.t.some(w => w.startsWith(stem)))
    : x.t.some(w => w.startsWith(stem)));
  // A quotation in quote marks ('Keep thy heart…') is matched on the quoted words only
  const inQuotes = quote.match(/['"‘“]([^'"’”]{8,})['"’”]?\s*$/);
  if(inQuotes) quote = inQuotes[1];
  const content = list => [...new Set(list.filter(w => w.length >= 3 && !STOPQ.has(w)))];
  // Hyphenated words compared both split ("corner stone") and joined ("firstborn")
  const qSplit = content(toks(quote)), qJoin = content(toks(quote.replace(/(\w)-(\w)/g, '$1$2')));
  const q = qSplit;
  // Phrase compared with spaces removed, so "loving kindness" matches the KJV's "lovingkindness"
  const phraseWords = toks(quote), phrase = phraseWords.join('');  // (hyphens vanish here too)
  const hasPhrase = x => phraseWords.length >= 3 && phrase.length >= 12 && (x.flat || (x.flat = x.t.join(''))).includes(phrase);
  const tiny = stem.length < 3;
  // Does the sentence read like a Scripture quotation (KJV words) rather than
  // Webster's own definition? Most of its words appear in some verse.
  let _iql;
  const quoteLike = () => _iql !== undefined ? _iql : (_iql = q.length >= 3 && (() => { let best = 0; const cnt = new Map();
    for(const w of q){ for(const i of inv.get(w) || []){ const c = (cnt.get(i) || 0) + 1; cnt.set(i, c); if(c > best) best = c; } }
    return best >= Math.ceil(q.length * 0.75); })());
  // hits scaled to the split form's length, taking whichever form matches better
  const qHit = x => {
    const a = qSplit.filter(w => x.set.has(w)).length;
    if(qJoin.length === qSplit.length && qJoin.every((w, i) => w === qSplit[i])) return a;
    const b = qJoin.filter(w => x.set.has(w)).length;
    return Math.max(a, Math.round(b * qSplit.length / Math.max(1, qJoin.length)));
  };
  const quoted = x => q.length >= 2 && qHit(x) >= Math.max(2, Math.ceil(q.length * 0.6)) && (hasHw(x) || qHit(x) >= 3 || (tiny && qHit(x) === q.length));
  const ci = at[`${book} ${ch}:${vs}`], cited = ci !== undefined ? V[ci] : null;
  const log = (to, how) => { repairs.push(`${word}: ${book} ${ch}:${vs} → ${to}${quote ? ` «${quote.slice(-60)}»` : ''}`); stats[how]++; };
  // 1. Cited verse confirmed by the quotation or the headword — for the cited
  //    verse only, a near spelling counts too (Webster "handiwork", KJV "handywork")
  const nearHw = x => last.length >= 6 && x.t.some(w => Math.abs(w.length - last.length) <= 2 && editDistance(w.slice(0, last.length + 1), last) <= (last.length >= 8 ? 2 : 1));
  if(cited && ((q.length >= 2 && qHit(cited) >= Math.max(2, Math.ceil(q.length * 0.6))) || hasHw(cited) || nearHw(cited))){ stats.confirmed++; return null; }
  // 2. Same chapter, any verse (the transcription often wrote "1" for the
  //    verse), then chapters differing by one dropped digit
  const sameCh = (chapters[`${book} ${ch}`] || []).map(i => V[i]);
  const otherCh = [];
  for(const key in chapters){
    const sp = key.lastIndexOf(' '), b2 = key.slice(0, sp), c2 = +key.slice(sp + 1);
    if(b2 === book && c2 !== +ch && droppedDigit(ch, c2)) for(const i of chapters[key]) otherCh.push(V[i]);
  }
  // The quotation found anywhere in the KJV (on a tie prefer the cited book)
  const globalFix = () => {
    if(phraseWords.length >= 4){
      const hits = V.filter(hasPhrase).sort((a, b) => (b.b === book) - (a.b === book));
      if(hits.length && (hits.length === 1 || hits[0].b === book)) return hits[0];
    }
    if(q.length >= 2){
      const cnt = new Map();
      for(const w of q){ const l = inv.get(w); if(!l || l.length > 4000) continue; for(const i of l) cnt.set(i, (cnt.get(i) || 0) + 1); }
      const strong = x => qHit(x) >= Math.max(2, Math.ceil(q.length * 0.75)) && (hasHw(x) || (tiny && qHit(x) >= 3 && qHit(x) >= q.length * 0.8));
      const near2 = x => (x.b === book) * 2;
      const cands = [...cnt].filter(([i]) => strong(V[i])).sort((a, b) => b[1] - a[1] || near2(V[b[0]]) - near2(V[a[0]]) || a[0] - b[0]);
      if(cands.length && (cands.length === 1 || cands[0][1] > cands[1][1] || V[cands[0][0]].b === book)) return V[cands[0][0]];
    }
    return null;
  };
  for(const pool of [sameCh, otherCh]){
    // the exact quoted phrase, in one verse only
    const ph = pool.filter(hasPhrase);
    if(ph.length === 1 && ph[0] !== cited){ log(refName(ph[0]), 'repairedVerse'); return refName(ph[0]); }
    if(q.length >= 2){
      const c = pool.filter(quoted).sort((a, b) => qHit(b) - qHit(a) || a.c - b.c || a.v - b.v);
      if(c.length){ log(refName(c[0]), 'repairedVerse'); return refName(c[0]); }
    }
    if(pool !== sameCh) continue;
    // The word is in this chapter but not in the cited verse: the verse
    // number is corrupt — one verse fits → that verse, several → the chapter
    // (with a real quotation, the verse must also share its words)
    const h = pool.filter(x => hasHw(x) && (q.length < 3 || qHit(x) >= Math.ceil(q.length * 0.5) || !quoteLike()));
    if(h.length === 1){ log(refName(h[0]), 'repairedVerse'); return refName(h[0]); }
    if(h.length > 1){
      // before settling for the chapter, a real quotation may be found elsewhere
      const g = (quoteLike() || phraseWords.length >= 4) && globalFix();
      if(g){ log(refName(g), 'repairedElsewhere'); return refName(g); }
      log(`${book} ${ch} (chapter)`, 'toChapter'); return { chapter: `${book} ${ch}` };
    }
    // a short quotation that isn't in the cited verse: the one verse holding
    // all its words, or the chapter when several do
    if(q.length >= 1 && cited && qHit(cited) === 0){
      const all = pool.filter(x => qHit(x) === q.length && (hasHw(x) || tiny || phraseWords.length >= 4));
      if(all.length === 1){ log(refName(all[0]), 'repairedVerse'); return refName(all[0]); }
      if(all.length > 1){
        const g = (quoteLike() || phraseWords.length >= 4) && globalFix();
        if(g){ log(refName(g), 'repairedElsewhere'); return refName(g); }
        log(`${book} ${ch} (chapter)`, 'toChapter'); return { chapter: `${book} ${ch}` };
      }
    }
  }
  // a chapter number with one digit changed (Job 19:9 for 14:9): same verse
  // number, holding the word, in exactly one such chapter
  if(cited && !hasHw(cited) && !sameCh.some(hasHw) && hwFrequency(stem) <= 150){
    const alt = [];
    for(const key in chapters){
      const sp = key.lastIndexOf(' '), b2 = key.slice(0, sp), c2 = key.slice(sp + 1);
      if(b2 !== book || c2 === ch || c2.length !== ch.length || [...c2].filter((d, i) => d !== ch[i]).length !== 1) continue;
      const x = V[chapters[key][+vs - 1]];
      if(x && hasHw(x) && (!quoteLike() || qHit(x) >= Math.ceil(q.length * 0.6))) alt.push(x);
    }
    if(alt.length === 1){ log(refName(alt[0]), 'repairedVerse'); return refName(alt[0]); }
  }
  // the dropped-digit chapters, by the headword alone, only when unambiguous
  { const h = otherCh.filter(hasHw); if(h.length === 1 && !cited){ log(refName(h[0]), 'repairedVerse'); return refName(h[0]); } }
  // 3. The quotation found elsewhere in the KJV
  { const g = globalFix(); if(g){ log(refName(g), 'repairedElsewhere'); return refName(g); } }
  // 4. Nothing better: a placeholder "…:1" (or a verse that doesn't exist)
  //    in a real chapter points to the chapter; otherwise keep as cited
  if(chapters[`${book} ${ch}`] && (vs === '1' || !cited)){
    log(`${book} ${ch} (chapter)`, 'toChapter'); return { chapter: `${book} ${ch}` };
  }
  if(cited){ stats.keptUnconfirmed++; unconfirmed.push(`${word}: ${book} ${ch}:${vs}${quote ? ` «${quote.slice(-70)}»` : ''}`); return null; }
  stats.unlinked++; unconfirmed.push(`UNLINKED ${word}: ${book} ${ch}:${vs}${quote ? ` «${quote.slice(-70)}»` : ''}`); return false;
}

const BOOK_RE = BOOKS.slice().sort((a, b) => b.length - a.length).join('|');
const REF_RE = new RegExp(`(${BOOK_RE}) (\\d+):(\\d+)`, 'g');
function repairRefs(html, word){
  // Work paragraph by paragraph; the "quotation" is the sentence before a
  // reference, unless another reference sits directly before it (chained)
  return html.replace(/<p([^>]*)>([\s\S]*?)<\/p>/g, (all, attrs, para) => {
    let out = '', last = 0, prevEnd = -1, prevPlainEnd = '';
    const plainUpTo = s => s.replace(/<[^>]+>/g, '');
    for(const m of para.matchAll(REF_RE)){
      const before = plainUpTo(para.slice(0, m.index));
      const gap = plainUpTo(para.slice(prevEnd < 0 ? 0 : prevEnd, m.index));
      const chained = prevEnd >= 0 && /^[\s.,;:]*$/.test(gap);
      const sentence = chained ? '' : (before.replace(/[\s.,;:]+$/, '').split(/(?<=[.?!;])\s+/).pop() || '');
      const r = checkRef(m[1], m[2], m[3], sentence, word);
      const link = (target, text) => `<a class="wd-ref" data-r="${target}">${text}</a>`;
      out += para.slice(last, m.index) + (r === false ? m[0]
        : r && r.chapter ? link(r.chapter + ':1', r.chapter)
        : link(r || m[0], r || m[0]));
      last = m.index + m[0].length; prevEnd = last;
    }
    return '<p' + attrs + '>' + out + para.slice(last) + '</p>';
  });
}

// ── Clean the HTML down to what the app styles
function tidy(html){
  return html.replace(/<\/?(?:div|span|font)[^>]*>/g, '').replace(/&nbsp;/g, ' ')
    .replace(/<(?!\/?(?:p|b|i|br)\b)[^>]+>/g, '').replace(/<p>\s*<\/p>/g, '')
    .replace(/\s+([.,;:])/g, '$1').replace(/[ \t]+/g, ' ').trim();
}
// First paragraph "<b>CHARITY</b>, <i>noun</i> [etymology]" → headword, part of speech
function split(html){
  const m = html.match(/^<p><b>([^<]+)<\/b>\s*'?,?\s*(?:<i>([^<]+)<\/i>)?([^<]*)<\/p>/);
  if(!m) return [null, '', html];
  const rest = html.slice(m[0].length);
  // "[Latin concupiscentia…] Lust; unlawful desire…" — only the bracketed
  // etymology is styled as such; a definition after it stays a definition
  const tail = m[3].replace(/^[\s,]+/, '');
  const em = tail.match(/^(\[[^\]]*\])?\s*([\s\S]*)$/);
  const ety = em[1] ? `<p class="wd-ety">${em[1]}</p>` : '';
  const def = em[2].trim() ? `<p>${em[2].trim()}</p>` : '';
  return [m[1].trim(), (m[2] || '').trim(), ety + def + rest];
}

const rows = parseCSV(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, 'webster1828', 'webster1828.csv.gz'))).toString('utf8'));
const extras = JSON.parse(fs.readFileSync(path.join(__dirname, 'webster1828', 'datawar-extras.json'), 'utf8')).entries;
const shards = {};
let count = 0;
for(const [w, raw] of rows.filter(r => r.length >= 2).concat(extras)){
  const key = w.toLowerCase().replace(/[^a-z]/g, '');
  if(!key || !raw.trim()) continue;
  const [head, pos, body] = split(tidy(raw));
  const html = repairRefs(body, w);
  const L = key[0];
  (shards[L] = shards[L] || {});
  (shards[L][key] = shards[L][key] || []).push([head || w.toUpperCase(), pos, html]);
  count++;
}
const outDir = path.join(__dirname, '..', 'dictionary');
fs.mkdirSync(outDir, { recursive: true });
let bytes = 0;
for(const [L, data] of Object.entries(shards)){
  const f = path.join(outDir, L + '.json');
  fs.writeFileSync(f, JSON.stringify(data));
  bytes += fs.statSync(f).size;
}
fs.writeFileSync(path.join(__dirname, 'webster1828', 'repairs.txt'), repairs.join('\n') + '\n');
console.log(`Wrote ${Object.keys(shards).length} shards to dictionary/: ${count} entries, ${(bytes/1048576).toFixed(1)} MB`);
console.log('Scripture references:', stats, '(each repair listed in tools/webster1828/repairs.txt)');
