#!/usr/bin/env node
// Add the ticked verses in tools/hymns/REVIEW-VERSES.md to the hymns' Scriptures in
// tools/hymns/list.js, then rebuild hymns.json and hymn-index.json.
//
//   node tools/hymns/apply-review.js            apply every ticked line ( - [x] )
//   node tools/hymns/apply-review.js --dry-run  only say what it would add
//
// The review sheet lists each hymn as "### <number>. <title> — <author>" and each proposed
// verse as "- [x] **Isaiah 26:4** — …" (ticked: add it) or "- [ ] **…**" (left out).
// A verse already in the hymn's list is skipped, so running it twice changes nothing.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..', '..');
const DRY = process.argv.includes('--dry-run');
const listFile = path.join(__dirname, 'list.js');
const hymns = JSON.parse(fs.readFileSync(path.join(root, 'hymns.json'), 'utf8')).h;

// Read the ticked verses, hymn by hymn
const add = new Map(); // title → [ref, …]
let n = null;
for(const line of fs.readFileSync(path.join(__dirname, 'REVIEW-VERSES.md'), 'utf8').split('\n')){
  const h = line.match(/^### (\d+)\. /);
  if(h){ n = +h[1]; continue; }
  const t = line.match(/^- \[([ xX])\] \*\*(.+?)\*\*/);
  if(!t || n === null || t[1] === ' ') continue;
  const title = hymns[n] && hymns[n][0];
  if(!title) throw new Error('no hymn number ' + n);
  if(!add.has(title)) add.set(title, []);
  add.get(title).push(t[2].trim());
}

// Rewrite only the refs (5th field) of the hymns that gain verses; every other line stays as it was
const lines = fs.readFileSync(listFile, 'utf8').split('\n');
let changed = 0, added = 0;
const quote = s => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
for(let i = 0; i < lines.length; i++){
  const m = lines[i].match(/^(\s*)(\[.*\]),\s*$/);
  if(!m) continue;
  let e; try{ e = vm.runInNewContext(m[2]); }catch(err){ continue; }
  if(!Array.isArray(e) || !add.has(e[0])) continue;
  const have = e[4].split(';').map(s => s.trim()), fresh = add.get(e[0]).filter(r => !have.includes(r));
  add.delete(e[0]);
  if(!fresh.length) continue;
  e[4] = [...have, ...fresh].join('; ');
  // swap only the last string (the Scriptures); the title, author and spacing stay exactly as written
  const next = lines[i].replace(/(['"])((?:\\.|(?!\1).)*)\1\],\s*$/, () => quote(e[4]) + '],');
  if(vm.runInNewContext(next.trim().replace(/,$/, ''))[4] !== e[4]) throw new Error('could not rewrite the line for ' + e[0]);
  lines[i] = next;
  changed++; added += fresh.length;
  console.log(`${e[0]}: + ${fresh.join('; ')}`);
}
if(add.size) throw new Error('not found in list.js: ' + [...add.keys()].join(', '));
console.log(`${added} verses for ${changed} hymns${DRY ? ' (dry run: nothing written)' : ''}`);
if(!DRY && changed){
  fs.writeFileSync(listFile, lines.join('\n'));
  execFileSync(process.execPath, [path.join(root, 'tools', 'build-hymns.js')], {stdio: 'inherit'});
}
