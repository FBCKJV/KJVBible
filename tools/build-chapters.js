#!/usr/bin/env node
// Build kjv/ — the King James Bible as plain web pages, one per chapter.
//
//   node tools/build-chapters.js
//
// So that someone who searches "John 3 KJV" or "Psalm 23 King James" can
// find the app: each chapter is a light, readable page search engines can
// read (the app itself fills its pages in with JavaScript, which they see as
// one page). Every page leads into the app at that chapter — "Read John 3 in
// the app" — where it can be highlighted, saved, heard, drilled and shared.
//
//   kjv/index.html          the 66 books
//   kjv/<book>.html         a book's chapters        (kjv/1-samuel.html)
//   kjv/<book>-<n>.html     a chapter                (kjv/john-3.html)
//   kjv/style.css           shared look (follows the app's day / night / sepia)
//   sitemap.xml             the app and every page above
//
// Source: bible/*.json (the app's own text). Re-run whenever it changes.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://fbckjv.app/KJVBible/';
const OUT = path.join(ROOT, 'kjv');

const BOOKS = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];

const slug = b => b.toLowerCase().replace(/ /g, '-');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// "Psalm 23", not "Psalms 23", is how people search for one psalm
const chName = (b, n) => (b === 'Psalms' ? 'Psalm' : b) + ' ' + n;
// The app opens at a verse from its address: #John+3:1
const appLink = (b, c, v = 1) => `../#${b.replace(/ /g, '+')}+${c}:${v}`;

function load(b){
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'bible', b.replace(/ /g, '') + '.json'), 'utf8'));
  return d.chapters.map(ch => ch.verses.map(v => [+v.verse, v.text]));
}

// Follow the theme chosen in the app (same site, same storage)
const THEME_JS = `<script>try{var t=localStorage.getItem('kjv_theme');t=t&&t.replace(/"/g,'');if(t==='light'||t==='sepia'||t==='dark')document.documentElement.className=t;}catch(e){}</script>`;

function page({title, desc, canon, crumbs, body, ld}){
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="FBC KJV Bible">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${SITE}icon-512.png">
<meta name="theme-color" content="#0e0800">
<link rel="icon" type="image/png" href="../icon-192.png">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IM+Fell+English&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
${THEME_JS}
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<header class="top"><a class="brand" href="index.html">✝ The King James Bible</a><a class="app" href="../">Open the app</a></header>
<main>
<nav class="crumbs">${crumbs}</nav>
${body}
</main>
<footer>
<p><a href="../">FBC KJV Bible</a> — the King James Bible, free on every device: no download, no account, no ads. From Faith Baptist Church.</p>
<p class="pd">The King James Version (1769 text) is in the public domain.</p>
</footer>
</body>
</html>
`;
}

const crumbLD = items => ({'@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, url], i) => ({'@type': 'ListItem', position: i + 1, name, item: url}))});

fs.rmSync(OUT, {recursive: true, force: true});
fs.mkdirSync(OUT, {recursive: true});
fs.copyFileSync(path.join(__dirname, 'chapters', 'style.css'), path.join(OUT, 'style.css'));

const all = BOOKS.map(b => ({b, chs: load(b)}));
const urls = [SITE, SITE + 'kjv/index.html'];
const flat = all.flatMap(({b, chs}) => chs.map((_, i) => [b, i + 1]));

// The 66 books
const testament = (t, list) => `<h2>${t}</h2><ul class="books">${list.map(({b, chs}) =>
  `<li><a href="${slug(b)}.html">${esc(b)}<span>${chs.length} ch.</span></a></li>`).join('')}</ul>`;
fs.writeFileSync(path.join(OUT, 'index.html'), page({
  title: 'The King James Bible (KJV) — read online free',
  desc: 'Read the whole King James Bible online, free: all 66 books and 1,189 chapters of the Authorized Version, from Genesis to Revelation.',
  canon: SITE + 'kjv/index.html',
  crumbs: '<a href="../">FBC KJV Bible</a> › The King James Bible',
  body: `<h1>The King James Bible</h1>
<p class="lead">All 66 books of the Authorized King James Version. Choose a book to read — or <a href="../">open the app</a> to highlight, save, listen and memorize as you go.</p>
${testament('Old Testament', all.slice(0, 39))}${testament('New Testament', all.slice(39))}`,
  ld: crumbLD([['FBC KJV Bible', SITE], ['The King James Bible', SITE + 'kjv/index.html']]),
}));

let pages = 1;
for(const {b, chs} of all){
  const bookURL = SITE + `kjv/${slug(b)}.html`;
  urls.push(bookURL);
  fs.writeFileSync(path.join(OUT, slug(b) + '.html'), page({
    title: `${b} KJV — King James Bible, ${chs.length === 1 ? 'one chapter' : `all ${chs.length} chapters`}`,
    desc: `Read the book of ${b} in the King James Version (KJV), free online: ${chs.length === 1 ? 'one chapter' : chs.length + ' chapters'}. ${chs[0][0][1].slice(0, 110)}…`,
    canon: bookURL,
    crumbs: `<a href="index.html">The King James Bible</a> › ${esc(b)}`,
    body: `<h1>${esc(b)}</h1>
<p class="lead">King James Version · ${chs.length === 1 ? 'one chapter' : chs.length + ' chapters'}</p>
<ul class="chs">${chs.map((_, i) => `<li><a href="${slug(b)}-${i + 1}.html" aria-label="${esc(chName(b, i + 1))}">${i + 1}</a></li>`).join('')}</ul>
<p class="open"><a class="btn" href="${appLink(b, 1)}">📖 Read ${esc(b)} in the app</a></p>`,
    ld: crumbLD([['The King James Bible', SITE + 'kjv/index.html'], [b, bookURL]]),
  }));
  pages++;

  chs.forEach((verses, ci) => {
    const c = ci + 1, name = chName(b, c), url = SITE + `kjv/${slug(b)}-${c}.html`;
    const k = flat.findIndex(([x, n]) => x === b && n === c);
    const link = ([x, n]) => `<a href="${slug(x)}-${n}.html">${esc(chName(x, n))}</a>`;
    const prev = k > 0 ? flat[k - 1] : null, next = k < flat.length - 1 ? flat[k + 1] : null;
    let lead = '';
    for(const [, t] of verses){ lead += (lead ? ' ' : '') + t; if(lead.length > 140) break; }
    if(lead.length > 150) lead = lead.slice(0, lead.lastIndexOf(' ', 147)) + '…';
    urls.push(url);
    fs.writeFileSync(path.join(OUT, `${slug(b)}-${c}.html`), page({
      title: `${name} KJV — King James Bible`,
      desc: `${name} in the King James Version (KJV): ${lead}`,
      canon: url,
      crumbs: `<a href="index.html">The King James Bible</a> › <a href="${slug(b)}.html">${esc(b)}</a> › ${c}`,
      body: `<h1>${esc(name)}</h1>
<p class="lead">King James Version</p>
<p class="open"><a class="btn" href="${appLink(b, c)}">📖 Read ${esc(name)} in the app</a><span>Highlight it, save it, hear it read, memorize it — free</span></p>
<div class="text">
${verses.map(([v, t]) => `<p id="v${v}"><sup>${v}</sup> ${esc(t)}</p>`).join('\n')}
</div>
<nav class="pager">${prev ? `<span class="prev">‹ ${link(prev)}</span>` : '<span></span>'}<a class="all" href="${slug(b)}.html">${esc(b)}</a>${next ? `<span class="next">${link(next)} ›</span>` : '<span></span>'}</nav>
<p class="open end"><a class="btn" href="${appLink(b, c)}">📖 Keep reading in the app</a></p>`,
      ld: crumbLD([['The King James Bible', SITE + 'kjv/index.html'], [b, SITE + `kjv/${slug(b)}.html`], [name, url]]),
    }));
    pages++;
  });
}

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`);
console.log(`kjv/: ${pages} pages · sitemap.xml: ${urls.length} addresses`);
