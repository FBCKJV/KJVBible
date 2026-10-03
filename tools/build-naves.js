#!/usr/bin/env node
// Build naves.json from Nave's Topical Bible.
//
//   node tools/build-naves.js
//
// Source: Nave's Topical Bible (Orville J. Nave, 1896) — a public-domain
// topical index of ~5,300 subjects with their Scripture references. The CSV
// in tools/naves-topical-dictionary.csv was retrieved from the BibleData
// project (Brady Stephenson, CC BY 4.0, https://github.com/BradyStephenson/bible-data);
// the app credits Nave and BibleData where the topics are shown.
//
// Each CSV row is one subject; its entry is a list of lines like
//   "-OF ENEMIES EXO 23:4,5; PRO 19:11; 24:17,29"
//   "     -Esau forgives Jacob GEN 33:4,11"      (indent = sub-topic depth)
//   "-See ENEMY"                                  (cross-reference)
//
// Emits ../naves.json:
//   { source, generated, count, topics: { SUBJECT: [line, …] } }
// where each line is [depth, label, refs] or [depth, label, refs, seeSubject].
// refs is a compact string "bookIndex.chapter:verses;…" (bookIndex 0 = Genesis,
// verses omitted for a whole chapter), e.g. "39.5:7,39-41;39.6:12".
// Every reference is checked against bible/*.json: chapters past the end of
// a book are dropped and verse lists are trimmed to verses that exist.

const fs = require('fs');
const path = require('path');

const BOOKS = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
// Nave's book codes (as used in this CSV) in canonical order
const CODES = ['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','So','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','Jude','REV'];
const CODE_IDX = Object.fromEntries(CODES.map((c, i) => [c, i]));
CODE_IDX['1JHN'] = CODES.indexOf('1JN');

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

// Verse counts per chapter, for validating references
const bibleDir = path.join(__dirname, '..', 'bible');
const VCOUNT = BOOKS.map(b => {
  const d = JSON.parse(fs.readFileSync(path.join(bibleDir, b.replace(/ /g,'') + '.json'), 'utf8'));
  return d.chapters.map(ch => ch.verses.length);
});

const codeAlt = Object.keys(CODE_IDX).sort((a,b) => b.length - a.length).join('|');
// The first book code followed by a chapter number starts the reference list
const REF_START = new RegExp(`(?:^|\\s)(?:${codeAlt})\\s+\\d`);
const stats = { refs: 0, droppedChapters: 0, trimmedVerses: 0 };

// "EXO 23:4,5; PRO 19:11; 24:17,29" → "1.23:4,5;19.19:11;19.24:17,29"
function parseRefs(text){
  const out = [];
  let book = null;
  for(let tok of text.split(';')){
    tok = tok.trim().replace(/\.$/, '');
    if(!tok) continue;
    const m = tok.match(new RegExp(`^(?:(${codeAlt})\\s+)?(\\d+)(?::([\\d,\\-\\s]+))?`));
    if(!m) continue;
    if(m[1]) book = CODE_IDX[m[1]];
    if(book === null || book === undefined) continue;
    const ch = parseInt(m[2]);
    const nV = VCOUNT[book][ch - 1];
    if(!nV){ stats.droppedChapters++; continue; }
    if(!m[3]){ out.push(`${book}.${ch}`); stats.refs++; continue; }
    // Keep only verse numbers / ranges that exist in this chapter
    const parts = [];
    for(const p of m[3].replace(/\s+/g,'').split(',')){
      const r = p.split('-').map(Number);
      if(!r[0] || isNaN(r[0])) continue;
      const a = r[0], b = r[1] && r[1] > a ? Math.min(r[1], nV) : a;
      if(a > nV){ stats.trimmedVerses++; continue; }
      parts.push(b > a ? `${a}-${b}` : `${a}`);
    }
    if(parts.length){ out.push(`${book}.${ch}:${parts.join(',')}`); stats.refs++; }
  }
  return out.join(';');
}

const rows = parseCSV(fs.readFileSync(path.join(__dirname, 'naves-topical-dictionary.csv'), 'utf8'));
const header = rows.shift();
if(header[1] !== 'subject' || header[2] !== 'entry') throw new Error('Unexpected CSV header: ' + header);

const raw = {};
for(const r of rows){
  const subject = (r[1] || '').trim();
  if(subject && r[2]) raw[subject] = r[2];
}
const subjects = new Set(Object.keys(raw));
// "SPEAKING, EVIL" may be its own subject or a sub-topic of SPEAKING
function resolveSee(name){
  name = name.replace(/\[\d+\]/g, '').replace(/[",.;]+$/,'').trim().toUpperCase();
  if(subjects.has(name)) return name;
  const head = name.split(',')[0].trim();
  return subjects.has(head) ? head : null;
}

const topics = {};
for(const [subject, entry] of Object.entries(raw)){
  const lines = [];
  for(const rawLine of entry.split('\n')){
    if(!rawLine.trim()) continue;
    const indent = rawLine.match(/^\s*/)[0].length;
    const depth = Math.min(3, Math.round(indent / 5));
    let text = rawLine.trim().replace(/^-+\s*/, '').replace(/^0F\b/, 'OF');
    // "[2601]GOD, LOVE OF" marks a link to another subject in the source
    const link = text.match(/\[\d+\]([^;]+?)\s*$/);
    text = text.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
    if(!text) continue;
    const see = text.match(/^(?:Also\s+)?see\s+(.+?)(?:,?\s+below)?$/i);
    if(see){
      const target = resolveSee(see[1]);
      lines.push(target ? [depth, 'See ' + see[1].replace(/[",]+$/,'').trim(), '', target] : [depth, 'See ' + see[1].trim(), '']);
      continue;
    }
    const m = text.match(REF_START);
    let label = text, refs = '';
    if(m){
      const at = m.index + (m[0].startsWith(' ') ? 1 : 0);
      label = text.slice(0, at).trim();
      refs = parseRefs(text.slice(at));
    }
    label = label.replace(/[,:;]+$/, '').trim();
    if(!label && !refs) continue;
    const target = !refs && link ? resolveSee(link[1]) : null;
    lines.push(target && target !== subject ? [depth, label, '', target] : [depth, label, refs]);
  }
  if(lines.length) topics[subject] = lines;
}

const out = {
  source: "Nave's Topical Bible (Orville J. Nave, 1896 — public domain), via BibleData (Brady Stephenson, CC BY 4.0)",
  generated: new Date().toISOString().slice(0, 10),
  count: Object.keys(topics).length,
  topics,
};
const dest = path.join(__dirname, '..', 'naves.json');
fs.writeFileSync(dest, JSON.stringify(out));
console.log(`Wrote ${dest}: ${out.count} topics, ${stats.refs} references` +
  ` (${stats.droppedChapters} references to missing chapters dropped, ${stats.trimmedVerses} out-of-range verses trimmed)` +
  `, ${(fs.statSync(dest).size / 1024).toFixed(0)} KB`);
