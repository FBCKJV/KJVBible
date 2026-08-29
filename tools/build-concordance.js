#!/usr/bin/env node
// Regenerate concordance.json from the bundled KJV data in bible/*.json.
//
//   node tools/build-concordance.js
//
// The concordance is a vocabulary-only index: every meaningful word (≥3
// letters, common function words excluded) grouped by first letter with a
// count of the DISTINCT VERSES it appears in. The app hands each word off to
// its keyword search in exact whole-word mode, which lists exactly those
// verses — so the stored count always equals the number of results shown.
// (Counting verses, not raw occurrences, is what keeps the two in step: a
// verse containing a word twice still shows up once in the results.)
// The STOP set below is kept in sync with the one in index.html.

const fs = require('fs');
const path = require('path');

const BOOKS = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1Samuel","2Samuel","1Kings","2Kings","1Chronicles","2Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","SongofSolomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1Corinthians","2Corinthians","Galatians","Ephesians","Philippians","Colossians","1Thessalonians","2Thessalonians","1Timothy","2Timothy","Titus","Philemon","Hebrews","James","1Peter","2Peter","1John","2John","3John","Jude","Revelation"];

const STOP = new Set(["the","a","an","and","or","but","in","on","of","to","for","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should","may","might","shall","that","this","with","by","from","at","he","she","they","we","you","i","my","his","her","their","our","it","its","not","so","as","if","no","up","out","me","him","us","them","all","now","who","what","when","where","how","one","also","then","here","there","which","into","upon","unto","thy","thee","thou","ye"]);

const bibleDir = path.join(__dirname, '..', 'bible');
const counts = new Map();

for (const b of BOOKS) {
  const d = JSON.parse(fs.readFileSync(path.join(bibleDir, b + '.json'), 'utf8'));
  for (const ch of d.chapters) for (const v of ch.verses) {
    const words = v.text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/);
    // Count each qualifying word once per verse (distinct-verse count).
    const seen = new Set();
    for (const w of words) {
      if (w.length < 3 || STOP.has(w) || seen.has(w)) continue;
      seen.add(w);
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }
}

const byLetter = {};
[...counts.keys()].sort().forEach(w => {
  const L = w[0].toUpperCase();
  (byLetter[L] = byLetter[L] || []).push([w, counts.get(w)]);
});

const out = { generated: new Date().toISOString().slice(0, 10), letters: byLetter };
const outPath = path.join(__dirname, '..', 'concordance.json');
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(`Wrote ${outPath} — ${counts.size} words, ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB`);
