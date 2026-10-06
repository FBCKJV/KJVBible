#!/usr/bin/env node
// Build pronounce.json — how to say the harder names and old words.
//
//   node tools/build-pronounce.js
//
// Source: tools/pronounce/names.txt and words.txt, written for the app.
// One per line, "Name: syllables" — split by hyphens, the strong syllable
// in CAPITALS (Mephibosheth: meh-FIB-oh-sheth). When the phone's voice
// would misread the spelling, a second form after "|" is what it is given
// to say instead (Job: JOHB | jobe). Keys are matched without capitals,
// hyphens or spaces, so "Beth-el" finds Bethel. Plurals are their own line.
//
// Names are kept apart from words so the man Job and the word job, or a
// place and a word spelt alike, never borrow each other's sound.
//
// Bump SAY_URL's ?v= in index.html whenever this is re-run.

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'pronounce');
const norm = s => s.toLowerCase().replace(/[^a-z]/g, '');

function load(file){
  const out = {};
  fs.readFileSync(path.join(dir, file), 'utf8').split('\n').forEach((ln, i) => {
    ln = ln.trim();
    if(!ln || ln.startsWith('#')) return;
    const at = `${file}:${i + 1}`;
    const m = ln.match(/^([^:]+):\s*(.+)$/);
    if(!m) throw new Error(`${at}: expected "Name: syllables"`);
    const parts = m[2].split('|').map(s => s.trim());
    if(!/^[A-Za-z]+(-[A-Za-z]+)*$/.test(parts[0])) throw new Error(`${at}: syllables are letters split by hyphens`);
    if(parts[0].split('-').filter(s => s === s.toUpperCase()).length !== 1) throw new Error(`${at}: one syllable in CAPITALS`);
    const k = norm(m[1]);
    if(out[k]) throw new Error(`${at}: ${m[1]} is listed twice`);
    out[k] = parts.length > 1 ? [parts[0], parts[1]] : parts[0];
  });
  return out;
}

const names = load('names.txt'), words = load('words.txt');
const data = {
  note: "How to say the harder names and old words of the King James Bible: syllables split by hyphens, the strong syllable in CAPITALS — the traditional English way of saying them. A second form, when there is one, is what the phone's voice is given to say.",
  generated: new Date().toISOString().slice(0, 10),
  names, words,
};
fs.writeFileSync(path.join(__dirname, '..', 'pronounce.json'), JSON.stringify(data));
console.log(`pronounce.json: ${Object.keys(names).length} names, ${Object.keys(words).length} words`);
