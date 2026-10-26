#!/usr/bin/env node
// Apply the KJV text corrections in tools/text-review/corrections.json to bible/*.json.
//
//   node tools/apply-text-corrections.js
//   node tools/apply-text-corrections.js --check   (only says whether every correction is in)
//
// Each correction names a verse, the text it had ("was") and the corrected text ("now"); a verse
// is changed only when it still reads exactly "was" (a verse already corrected is left alone, and
// anything else stops the run, so nothing is changed by mistake). Only the verse's text inside the
// file is replaced — the rest of each book's file stays byte for byte as it was, titles included.
// After running it: rebuild what copies the text (build-concordance, build-strongs, build-timeline,
// build-places, build-chapters …) and raise BOOK_FIXES in index.html for the books listed.

const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const {corrections} = JSON.parse(fs.readFileSync(path.join(__dirname, 'text-review', 'corrections.json'), 'utf8'));
const check = process.argv.includes('--check');
// as the book files write it: JSON, with anything beyond ASCII as \uXXXX (’ is \u2019)
const jsonAscii = s => JSON.stringify(s).replace(/[\u007f-\uffff]/g, ch => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'));

const byBook = new Map();
for(const c of corrections){
  const m = c.ref.match(/^(.+) (\d+):(\d+)$/);
  if(!byBook.has(m[1])) byBook.set(m[1], []);
  byBook.get(m[1]).push({...c, ch: m[2], v: m[3]});
}
let done = 0, todo = 0;
const changed = [];
for(const [book, list] of byBook){
  const file = path.join(root, 'bible', book.replace(/ /g, '') + '.json');
  const before = fs.readFileSync(file, 'utf8');
  let txt = before, mine = 0;
  const data = JSON.parse(txt);
  for(const c of list){
    const verse = data.chapters[c.ch - 1].verses[c.v - 1];
    if(!verse || verse.verse !== c.v) throw new Error(`${c.ref}: no such verse`);
    if(verse.text === c.now){ done++; continue; }
    if(verse.text !== c.was) throw new Error(`${c.ref} reads neither the old nor the corrected text:\n  ${verse.text}`);
    todo++; mine++;
    // the verse as it is written in the file
    const from = `{"verse": "${c.v}", "text": ${jsonAscii(c.was)}}`;
    if(txt.split(from).length !== 2) throw new Error(`${c.ref}: the verse is not found once in ${path.basename(file)}`);
    txt = txt.replace(from, `{"verse": "${c.v}", "text": ${jsonAscii(c.now)}}`);
  }
  if(!check && txt !== before){
    // only the corrected verses may differ; every verse keeps its number
    const a = JSON.parse(before), b = JSON.parse(txt);
    let n = 0;
    a.chapters.forEach((ch, i) => ch.verses.forEach((v, k) => { const w = b.chapters[i].verses[k]; if(w.verse !== v.verse) n = -1e9; else if(v.text !== w.text) n++; }));
    if(n !== mine) throw new Error(`${book}: ${n} verses changed, ${mine} expected`);
    fs.writeFileSync(file, txt);
    changed.push(book);
  }
}
if(check){
  console.log(todo ? `${todo} of ${corrections.length} corrections are not in bible/: run node tools/apply-text-corrections.js` : `all ${corrections.length} corrections are in bible/`);
  process.exit(todo ? 1 : 0);
}
console.log(`${todo} verses corrected in ${changed.length} books (${done} already were): ${changed.join(', ')}`);
