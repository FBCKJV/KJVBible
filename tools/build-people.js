#!/usr/bin/env node
// Build people.json — a who's-who of the ~3,000 named people in the Bible.
//
//   node tools/build-people.js
//
// Source: BibleData (Brady Stephenson, CC BY 4.0,
// https://github.com/BradyStephenson/bible-data) — the Person, PersonLabel,
// PersonVerse and PersonRelationship tables, copied into tools/bibledata/.
// The app credits BibleData wherever people are shown.
//
// Editorial changes made here, so the app matches KJV usage and the church's
// teaching:
//   • The dataset models God as "people" (YHVH_1, which also carries the
//     names Jesus and Messiah, and YHVH_2, the Father). Those entries and
//     every link to them are left out; the app points "Jesus" to the Nave's
//     topic "Jesus, the Christ" instead.
//   • "G-d" → "God", "L-rd" → "Lord", and the tetragrammaton written
//     "y-h-v-h"/"YHVH" → "the LORD" in meanings and notes ("Jehovah" in
//     transliterations), as the KJV renders it.
//   • Book codes in descriptions ("(2KI 14:29)") become readable references
//     ("(2 Kings 14:29)") the app can turn into links.
//
// Emits ../people.json:
//   { source, generated, count, people: { id: {
//       n: name, d: description, s: "m"|"f", t: tribe, x: notes,
//       a: [other proper names], l: [[label, hebrew, translit, meaning,
//       greek, greekTranslit, greekMeaning]], r: [[relationship, otherId]],
//       v: "bookIndex.chapter:verses;…" (verses naming the person) } } }
// Relationships read "<relationship>: <other>" from this person's side,
// e.g. Abram_1 has ["father","Terah_1"].

const fs = require('fs');
const path = require('path');

const BOOKS = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
const CODES = ['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV'];
const CODE_IDX = Object.fromEntries(CODES.map((c, i) => [c, i]));

function parseCSV(text){
  const rows=[]; let row=[], field='', i=0, inQ=false;
  text = text.replace(/^﻿/, '');
  while(i < text.length){
    const c = text[i];
    if(inQ){
      if(c === '"'){ if(text[i+1] === '"'){ field+='"'; i+=2; continue; } inQ=false; i++; continue; }
      field+=c; i++; continue;
    }
    if(c === '"'){ inQ=true; i++; continue; }
    if(c === ','){ row.push(field); field=''; i++; continue; }
    if(c === '\r'){ i++; continue; }
    if(c === '\n'){ row.push(field); rows.push(row); row=[]; field=''; i++; continue; }
    field+=c; i++;
  }
  if(field || row.length){ row.push(field); rows.push(row); }
  return rows;
}
function table(file){
  const rows = parseCSV(fs.readFileSync(path.join(__dirname, 'bibledata', file), 'utf8'));
  const head = rows.shift().map(h => h.replace(/^﻿/, '').trim());
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
}

const bibleDir = path.join(__dirname, '..', 'bible');
const VCOUNT = BOOKS.map(b => JSON.parse(fs.readFileSync(path.join(bibleDir, b.replace(/ /g,'') + '.json'), 'utf8')).chapters.map(ch => ch.verses.length));

const codeAlt = CODES.join('|');
// Text clean-up shared by every displayed field
function tidy(s, translit){
  if(!s) return '';
  s = s.replace(/G-d/g, 'God').replace(/L-rd/g, 'Lord');
  s = translit ? s.replace(/y-h-v-h|Y-H-V-H|YHVH/g, 'Jehovah')
               : s.replace(/\by-h-v-h\b|\bY-H-V-H\b|\bYHVH\b/g, 'the LORD');
  // "(2KI 14:29, 1CH 3:2)" → "(2 Kings 14:29, 1 Chronicles 3:2)"
  s = s.replace(new RegExp(`\\b(${codeAlt}) (\\d+(?::\\d+(?:-\\d+)?)?)`, 'g'), (_, c, r) => `${BOOKS[CODE_IDX[c]]} ${r}`);
  return s.replace(/\s+/g, ' ').trim();
}
const isDivine = id => /^YHVH_/.test(id);

const persons = table('BibleData-Person.csv');
const labels  = table('BibleData-PersonLabel.csv');
const pverses = table('BibleData-PersonVerse.csv');
const rels    = table('BibleData-PersonRelationship.csv');

const people = {};
for(const p of persons){
  if(!p.person_id || isDivine(p.person_id)) continue;
  const e = { n: tidy(p.person_name), d: tidy(p.unique_attribute) };
  if(p.surname) e.n2 = tidy(p.surname);
  if(p.sex === 'male') e.s = 'm'; else if(p.sex === 'female') e.s = 'f';
  if(p.tribe) e.t = tidy(p.tribe);
  if(p.person_notes) e.x = tidy(p.person_notes);
  people[p.person_id] = e;
}

// Proper names (e.g. Abram → also "Abraham") with their original-language forms
for(const l of labels){
  const e = people[l.person_id];
  if(!e || l.label_type !== 'proper name') continue;
  const name = tidy(l.english_label);
  if(name && name !== e.n) (e.a = e.a || []).includes(name) || e.a.push(name);
  const orig = [name, l.hebrew_label, tidy(l.hebrew_label_transliterated, true), tidy(l.hebrew_label_meaning),
                l.greek_label, tidy(l.greek_label_transliterated, true), tidy(l.greek_label_meaning)]
    .map(x => (x === 'none' || x === '[none]') ? '' : x);
  if(orig.slice(1).some(Boolean) && (e.l = e.l || []).length < 4) e.l.push(orig);
}

// Verses naming each person, grouped by chapter
const stats = { verses: 0, dropped: 0 };
const vmap = {};
for(const pv of pverses){
  if(!people[pv.person_id]) continue;
  const m = pv.reference_id.match(/^([1-3]?[A-Z]{2,3}) (\d+):(\d+)$/);
  if(!m || CODE_IDX[m[1]] === undefined){ stats.dropped++; continue; }
  const b = CODE_IDX[m[1]], c = +m[2], v = +m[3];
  if(!VCOUNT[b][c-1] || v > VCOUNT[b][c-1]){ stats.dropped++; continue; }
  const byCh = (vmap[pv.person_id] = vmap[pv.person_id] || new Map());
  const k = `${b}.${c}`;
  if(!byCh.has(k)) byCh.set(k, new Set());
  byCh.get(k).add(v);
}
for(const [id, byCh] of Object.entries(vmap)){
  const parts = [];
  for(const [k, set] of byCh){
    const vs = [...set].sort((a, b) => a - b);
    stats.verses += vs.length;
    // collapse runs: 3,4,5 → 3-5
    const out = []; let s = vs[0], prev = vs[0];
    for(const v of vs.slice(1).concat([Infinity])){
      if(v === prev + 1){ prev = v; continue; }
      out.push(s === prev ? `${s}` : `${s}-${prev}`); s = prev = v;
    }
    parts.push(`${k}:${out.join(',')}`);
  }
  people[id].v = parts.join(';');
}

// Relationships, from each person's own side: "Terah_1 father Abram_1"
// means Terah is Abram's father → Abram gets ["father","Terah_1"].
// Ancestor/descendant chains are skipped (the parent links already cover them).
let relCount = 0;
for(const r of rels){
  const a = r.person_id_1, b = r.person_id_2, type = r.relationship_type;
  if(!people[a] || !people[b] || !type || type === 'ancestor' || type === 'descendant') continue;
  const e = people[b];
  if(!(e.r = e.r || []).some(x => x[0] === type && x[1] === a)){ e.r.push([type, a]); relCount++; }
}

const out = {
  source: 'BibleData (Brady Stephenson, CC BY 4.0) — https://github.com/BradyStephenson/bible-data',
  generated: new Date().toISOString().slice(0, 10),
  count: Object.keys(people).length,
  people,
};
const dest = path.join(__dirname, '..', 'people.json');
fs.writeFileSync(dest, JSON.stringify(out));
console.log(`Wrote ${dest}: ${out.count} people, ${stats.verses} verse links (${stats.dropped} invalid dropped), ${relCount} relationships, ${(fs.statSync(dest).size/1024).toFixed(0)} KB`);
