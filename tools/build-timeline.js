#!/usr/bin/env node
// Build timeline.json from tools/timeline/events.js.
//
//   node tools/build-timeline.js
//
// Each event's key verse is copied from bible/*.json so the quote is always
// the app's own KJV text. Emits ../timeline.json:
//   { eras: [{ n: eraName, e: [[year, title, book, ch1, ch2, verseRef, verseText], …] }] }

const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const ERAS = require('./timeline/events.js');
const books = {};
const book = b => books[b] || (books[b] = JSON.parse(fs.readFileSync(path.join(root, 'bible', b.replace(/ /g, '') + '.json'), 'utf8')));

let n = 0;
const out = { eras: ERAS.map(era => ({ n: era.era, e: era.events.slice().sort((a, b) => a[0] - b[0]).map(([y, t, b, c1, c2, key]) => {
  const [c, v] = key.split(':').map(Number);
  const ch = book(b).chapters[c - 1];
  if(!ch || c2 > book(b).chapters.length) throw new Error(`${t}: bad chapter ${b} ${c}`);
  const vs = ch.verses.find(x => +x.verse === v);
  if(!vs) throw new Error(`${t}: no verse ${b} ${key}`);
  n++;
  return [y, t, b, c1, c2, `${b} ${key}`, vs.text];
}) })) };
fs.writeFileSync(path.join(root, 'timeline.json'), JSON.stringify(out));
console.log(`${n} events in ${out.eras.length} eras`);
