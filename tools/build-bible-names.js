#!/usr/bin/env node
// Build bible-names.json from Hitchcock's Bible Names Dictionary.
//
//   node tools/build-bible-names.js
//
// Source: Hitchcock's Bible Names Dictionary (Roswell D. Hitchcock, 1869) — a
// public-domain work giving the meaning of ~2,600 biblical names (people and
// places). The CSV in tools/hitchcock-bible-names.csv was retrieved from the
// BibleData project (Brady Stephenson). The underlying name→meaning text is
// public domain; we credit Hitchcock (and BibleData) as a courtesy.
//
// Emits ../bible-names.json: { source, generated, count, names:{Name:meaning} }
// The app strips hyphens/apostrophes when matching verse words, so "Beth-el"
// (Hitchcock) still matches "Bethel" (KJV text).

const fs = require('fs');
const path = require('path');

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
  if(field.length || row.length){ row.push(field); rows.push(row); }
  return rows;
}

const csv = fs.readFileSync(path.join(__dirname, 'hitchcock-bible-names.csv'), 'utf8');
const rows = parseCSV(csv);
rows.shift(); // header: Name,Meaning
const names = {};
for(const [name, meaning] of rows){
  if(!name || !meaning) continue;
  const n = name.trim(), m = meaning.trim();
  if(n && m) names[n] = m;
}
const out = {
  source: "Hitchcock's Bible Names Dictionary (Roswell D. Hitchcock, 1869; public domain), compiled via the BibleData project by Brady Stephenson.",
  generated: new Date().toISOString().slice(0,10),
  count: Object.keys(names).length,
  names
};
const outPath = path.join(__dirname, '..', 'bible-names.json');
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(`Wrote ${outPath} — ${out.count} names, ${(fs.statSync(outPath).size/1024).toFixed(0)} KB`);
