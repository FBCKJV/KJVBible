#!/usr/bin/env node
// Put the titles of the Psalms (their superscriptions) and the Hebrew
// letters of Psalm 119 into bible/Psalms.json.
//
//   node tools/build-psalm-titles.js
//   node tools/build-psalm-titles.js --check   (only says whether bible/Psalms.json is up to date)
//
// Source: tools/psalms/titles.json — the 1769 text (see its "source").
// Each titled chapter gets  "title": "To the chief Musician, Maschil, …"
// beside "chapter", and Psalm 119 gets  "heads": {"1": "א ALEPH.", "9": …}
// (the verse each letter stands over). The verses are not touched, so
// every verse keeps its number and its text; an older copy of the app
// simply ignores the two new fields. The translators' italic words, in
// [brackets] in the source, are shown as plain text like the verses.
//
// The file is edited in place (only those chapters' opening lines change),
// so the diff shows just the titles. Run it again after editing titles.json;
// it replaces what it wrote before. Then raise BOOK_FIXES in index.html so
// phones that saved Psalms fetch it again, and run tools/build-chapters.js.

const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const SRC = JSON.parse(fs.readFileSync(path.join(__dirname, 'psalms', 'titles.json'), 'utf8'));
const dest = path.join(root, 'bible', 'Psalms.json');
const before = fs.readFileSync(dest, 'utf8');

const plain = s => s.replace(/[\[\]]/g, '');
// Take out what an earlier run wrote, then write it afresh
let txt = before.replace(/\{"chapter": "(\d+)", "title": (?:"(?:[^"\\]|\\.)*"), /g, '{"chapter": "$1", ')
  .replace(/\{"chapter": "(\d+)", "heads": \{[^}]*\}, /g, '{"chapter": "$1", ');
let n = 0;
for(const [c, t] of Object.entries(SRC.titles)){
  const from = `{"chapter": "${c}", "verses"`;
  if(!txt.includes(from)) throw new Error(`Psalm ${c}: chapter not found`);
  txt = txt.replace(from, `{"chapter": "${c}", "title": ${JSON.stringify(plain(t))}, "verses"`);
  n++;
}
let h = 0;
for(const [c, heads] of Object.entries(SRC.heads)){
  const from = `{"chapter": "${c}", "verses"`;
  if(!txt.includes(from)) throw new Error(`Psalm ${c}: chapter not found`);
  txt = txt.replace(from, `{"chapter": "${c}", "heads": ${JSON.stringify(heads)}, "verses"`);
  h += Object.keys(heads).length;
}

// The verses must be exactly as they were
const strip = d => d.chapters.map(ch => ({chapter: ch.chapter, verses: ch.verses}));
const a = JSON.parse(before), b = JSON.parse(txt);
if(JSON.stringify(strip(a)) !== JSON.stringify(strip(b))) throw new Error('the verses changed — nothing written');
for(const ch of b.chapters) if(ch.heads) for(const v of Object.keys(ch.heads))
  if(!ch.verses.some(x => x.verse === v)) throw new Error(`Psalm ${ch.chapter}: no verse ${v} for its heading`);

if(process.argv.includes('--check')){
  const same = txt === before;
  console.log(same ? 'bible/Psalms.json is up to date' : 'bible/Psalms.json is out of date: run node tools/build-psalm-titles.js');
  process.exit(same ? 0 : 1);
}
fs.writeFileSync(dest, txt);
console.log(`bible/Psalms.json: ${n} titles, ${h} headings in Psalm 119`);
