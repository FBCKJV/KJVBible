#!/usr/bin/env node
// Find which hymns in the hymnal have a recording in the FBC Hymns app
// (fbckjv.app/Hymns/), so a hymn page can offer 🎧 Listen.
//
//   node tools/build-hymn-recordings.js [path/to/Hymns/index.html]
//   node tools/build-hymns.js
//
// Reads the Hymns app's song list (default: a Hymns checkout beside this one,
// ../Hymns/index.html) and writes tools/hymns/recordings.json:
//   { "Amazing Grace": "o01", … }   hymnal title → the Hymns app's song id
// build-hymns.js adds the id to each hymn in hymns.json. Re-run both when
// either app's list of hymns changes. Titles are matched ignoring capitals,
// punctuation and Saviour/Savior. Where a hymn has several recordings, the
// congregation singing comes first, then the piano, then the specials.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const src = process.argv[2] || path.join(root, '..', 'Hymns', 'index.html');
if(!fs.existsSync(src)){
  console.error('Hymns app not found at ' + src + ' — clone FBCKJV/Hymns beside this repo, or pass the path to its index.html');
  process.exit(1);
}
const html = fs.readFileSync(src, 'utf8');
// The song list sits between the audio base URLs and the alphabetical sort
const start = html.indexOf('const OBC'), end = html.indexOf('// Sort alphabetically');
if(start < 0 || end < 0) throw new Error('could not find the song list in ' + src);
const ctx = {encodeURIComponent};
vm.runInNewContext(html.slice(start, end) + '\nthis.HYMNS = HYMNS;', ctx);

const norm = t => t.toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/saviour/g, 'savior').replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
const RANK = {olmstead: 0, knox: 1, telegram: 2, hammond: 3};
const songs = {};
ctx.HYMNS.forEach(h => {
  const n = norm(h.title), best = songs[n];
  if(!best || (RANK[h.source] ?? 9) < (RANK[best.source] ?? 9)) songs[n] = h;
});

// Same hymn, recorded under a shorter or fuller title
const ALIAS = {
  'Come, Thou Fount of Every Blessing': 'Come Thou Fount',
  'Pass Me Not': 'Pass Me Not, O Gentle Savior',
  'Brighten the Corner Where You Are': 'Brighten the Corner',
};

const LIST = require('./hymns/list.js');
const out = {};
LIST.forEach(([t]) => { const s = songs[norm(t)] || songs[norm(ALIAS[t] || '')]; if(s) out[t] = s.id; });
fs.writeFileSync(path.join(__dirname, 'hymns', 'recordings.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`${Object.keys(out).length} of ${LIST.length} hymns have a recording in the Hymns app`);
