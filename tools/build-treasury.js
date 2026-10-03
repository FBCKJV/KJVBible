#!/usr/bin/env node
// Build treasury/<bookIndex>.json from the Treasury of Scripture Knowledge.
//
//   node tools/build-treasury.js
//
// Source: The Treasury of Scripture Knowledge (R. A. Torrey / Bagster, 1830s —
// public domain): cross-references for nearly every verse, each group tied to
// the KJV words it explains. tools/treasury/crossreferences_kjv.tsv is the KJV
// export from CrossReferences.org (CC BY 4.0,
// https://github.com/CrossReferences-org/bible-cross-references); the app
// credits the Treasury and CrossReferences.org where the references are shown.
//
// TSV columns: book abbrev, chapter, verse, anchor phrase, refs ("Ps 33:6,9|Isa 40:26").
//
// Emits ../treasury/<i>.json (i = 0 for Genesis … 65 for Revelation), one file
// per book so a verse card only downloads the book it needs:
//   { "ch:v": [[anchor, refs], …], … }
// refs use the app's compact form "bookIndex.chapter:verses;…" (see
// refCardsHTML). Every reference is checked against bible/*.json: verses that
// don't exist are dropped, and a group left empty is dropped.

const fs = require('fs');
const path = require('path');

const BOOKS = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
const ABBR = ['Gen','Exod','Lev','Num','Deut','Josh','Judg','Ruth','1 Sam','2 Sam','1 Kgs','2 Kgs','1 Chr','2 Chr','Ezra','Neh','Esth','Job','Ps','Prov','Eccl','Song','Isa','Jer','Lam','Ezek','Dan','Hos','Joel','Amos','Obad','Jonah','Mic','Nah','Hab','Zeph','Hag','Zech','Mal','Matt','Mark','Luke','John','Acts','Rom','1 Cor','2 Cor','Gal','Eph','Phil','Col','1 Thess','2 Thess','1 Tim','2 Tim','Titus','Phlm','Heb','Jas','1 Pet','2 Pet','1 John','2 John','3 John','Jude','Rev'];
const IDX = Object.fromEntries(ABBR.map((a, i) => [a, i]));

const root = path.join(__dirname, '..');
// verses per chapter, from the app's own KJV text
const VCOUNT = BOOKS.map(b => JSON.parse(fs.readFileSync(path.join(root, 'bible', b.replace(/ /g, '') + '.json'), 'utf8'))
  .chapters.map(c => c.verses.length));

const rows = fs.readFileSync(path.join(__dirname, 'treasury', 'crossreferences_kjv.tsv'), 'utf8').split('\n').slice(1).filter(Boolean);
const out = BOOKS.map(() => ({}));
let groups = 0, refsKept = 0, dropped = 0, unknown = new Set();

// "Ps 33:6,9" → "18.33:6,9" (verses checked); null if nothing survives
function compact(ref){
  const m = ref.trim().match(/^(.+?) (\d+):([\d,\-]+)$/);
  if(!m || !(m[1] in IDX)){ unknown.add(ref); return null; }
  const b = IDX[m[1]], c = +m[2], n = VCOUNT[b][c - 1];
  if(!n){ dropped++; return null; }
  const parts = m[3].split(',').map(p => {
    let [a, z] = p.split('-').map(Number);
    if(!a || a > n) return null;
    if(z && z > n) z = n;
    return z && z > a ? `${a}-${z}` : `${a}`;
  }).filter(Boolean);
  if(!parts.length){ dropped++; return null; }
  return `${b}.${c}:${parts.join(',')}`;
}

for(const line of rows){
  const [bk, ch, vs, anchor, refs] = line.split('\t');
  const b = IDX[bk];
  if(b === undefined){ unknown.add(bk); continue; }
  const list = refs.split('|').map(compact).filter(Boolean);
  if(!list.length) continue;
  const key = `${+ch}:${+vs}`;
  (out[b][key] = out[b][key] || []).push([anchor.trim(), list.join(';')]);
  groups++; refsKept += list.length;
}

const dir = path.join(root, 'treasury');
fs.mkdirSync(dir, { recursive: true });
let bytes = 0;
out.forEach((o, i) => { const s = JSON.stringify(o); bytes += s.length; fs.writeFileSync(path.join(dir, i + '.json'), s); });
console.log(`${groups} phrase groups, ${refsKept} references, ${dropped} dropped, ${(bytes / 1048576).toFixed(1)} MB in 66 files`);
if(unknown.size) console.log('unparsed:', [...unknown].slice(0, 20));
