#!/usr/bin/env node
// Make tools/strongs/kjv-tags.jsonl.gz — the CrossWire KJV's Strong's tags,
// word by word — from the npm package that carries the module as JSON:
//
//   npm pack @metaxia/scriptures-source-crosswire-kjv && tar xzf metaxia-*.tgz
//   node tools/strongs/extract-crosswire.js package/data/crosswire-KJV
//
// The package's own "strongs" field drops some numbers (John 3:16 "loved",
// G25), so the numbers are read from each word's OSIS lemma attribute.
// One line per verse: ["Gen",1,1,[["In","H7225"],["God","H430"],["created","H853 H1254"],["was",""],…]]

const fs = require('fs'), path = require('path'), zlib = require('zlib');
const dir = process.argv[2];
if(!dir){ console.error('usage: extract-crosswire.js <package/data/crosswire-KJV>'); process.exit(1); }
const OSIS = 'Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev'.split(' ');
const lines = [];
for(const b of OSIS){
  const chs = fs.readdirSync(path.join(dir, b)).map(Number).sort((x, y) => x - y);
  for(const c of chs){
    const vs = fs.readdirSync(path.join(dir, b, String(c))).map(f => parseInt(f)).sort((x, y) => x - y);
    for(const v of vs){
      const d = JSON.parse(fs.readFileSync(path.join(dir, b, String(c), v + '.json'), 'utf8'));
      const words = d.words.map(w => [w.text, ((w.lemma || '').match(/strong:[HG]\d+[a-z]?/g) || []).map(s => s.slice(7).replace(/^([HG])0+/, '$1')).join(' ')]);
      lines.push(JSON.stringify([b, c, v, words]));
    }
  }
}
fs.writeFileSync(path.join(__dirname, 'kjv-tags.jsonl.gz'), zlib.gzipSync(lines.join('\n') + '\n', {level: 9}));
console.log(lines.length + ' verses');
