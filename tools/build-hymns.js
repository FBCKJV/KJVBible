#!/usr/bin/env node
// Build hymns.json from tools/hymns/list.js (titles, authors, Scriptures)
// and tools/hymns/texts.json (the words).
//
//   node tools/build-hymns.js
//
// The words are public domain. They were gathered from three open collections
// and then proofread against standard hymnals: marvinjude/gospel-hymns,
// josmithua/song-data (Sacred Songs for Singing Saints; Believers Hymn Book),
// and pathawks/Christmas-Songs (CC0). Edit texts.json directly to correct one.
//
// Emits ../hymns.json:
//   { h: [[title, author, year, category, [[label, jumpRef], …], stanzas, chorus], …] }
// where stanzas is [[line, …], …] and chorus is [line, …] (may be empty).

const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const LIST = require('./hymns/list.js');
const TEXTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'hymns', 'texts.json'), 'utf8'));
const BOOKS = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
const book = b => JSON.parse(fs.readFileSync(path.join(root, 'bible', b.replace(/ /g, '') + '.json'), 'utf8'));

// "Psalm 104:1-5" → ["Psalm 104:1–5", "Psalms 104:1"], checked against the KJV text
function ref(r){
  const m = r.trim().match(/^(.+?) (\d+):(\d+)(?:-(\d+))?(?:, (\d+))?$/);
  if(!m) throw new Error('bad reference ' + r);
  const name = m[1] === 'Psalm' ? 'Psalms' : m[1];
  if(!BOOKS.includes(name)) throw new Error('bad book ' + r);
  const ch = book(name).chapters[+m[2] - 1];
  for(const v of [m[3], m[4], m[5]].filter(Boolean))
    if(!ch || !ch.verses.some(x => +x.verse === +v)) throw new Error('no such verse ' + r);
  return [r.trim().replace('-', '–'), `${name} ${m[2]}:${m[3]}`];
}
// Straight quotes → curly
const curly = l => l.replace(/"([^"]*)"/g, '“$1”').replace(/"(?=\w)/g, '“').replace(/"/g, '”');

const out = { h: LIST.map(([t, a, y, c, refs]) => {
  const tx = TEXTS[t];
  if(!tx) throw new Error('no words for ' + t);
  return [t, a, y, c, refs.split(';').flatMap(r => {
    const m = r.trim().match(/^(.+? \d+:)(\d+(?:-\d+)?), (\d+)$/); // "Psalm 119:11, 105" → two references
    return m ? [ref(m[1] + m[2]), ref(m[1] + m[3])] : [ref(r)];
  }), tx.v.map(s => s.map(curly)), tx.ch.map(curly)];
}) };
fs.writeFileSync(path.join(root, 'hymns.json'), JSON.stringify(out));
console.log(`${out.h.length} hymns in ${new Set(out.h.map(h => h[3])).size} sections`);
