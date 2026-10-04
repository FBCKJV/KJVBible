#!/usr/bin/env node
// Build bible-lands.json — the outline map for "Where is this?" — from
// Natural Earth (public domain, naturalearthdata.com).
//
//   1. Download into tools/geo/ (they're large and not kept in the repo):
//      https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson
//      …/ne_10m_lakes.geojson  …/ne_10m_rivers_lake_centerlines.geojson
//   2. node tools/build-bible-lands.js
//
// Keeps only the Bible lands (Rome to Persia, the Black Sea to Arabia),
// clipped to that box and simplified to about 1 km so it stays small:
//   { box:[w,s,e,n], land:[[lon,lat,…],…], lakes:[[name,[lon,lat,…]],…],
//     rivers:[[name,[lon,lat,…]],…] }  — flat coordinate lists, 3 decimals.

const fs = require('fs'), path = require('path');
const BOX = [9, 12, 62, 46.5]; // west, south, east, north
const TOL = 0.006;             // simplify tolerance in degrees (~0.6 km)
const read = f => JSON.parse(fs.readFileSync(path.join(__dirname, 'geo', f), 'utf8'));

// Sutherland–Hodgman: clip a closed ring to the box
function clipRing(ring){
  const [w, s, e, n] = BOX;
  const edges = [
    [p => p[0] >= w, (a, b) => [w, a[1] + (b[1]-a[1]) * (w-a[0]) / (b[0]-a[0])]],
    [p => p[0] <= e, (a, b) => [e, a[1] + (b[1]-a[1]) * (e-a[0]) / (b[0]-a[0])]],
    [p => p[1] >= s, (a, b) => [a[0] + (b[0]-a[0]) * (s-a[1]) / (b[1]-a[1]), s]],
    [p => p[1] <= n, (a, b) => [a[0] + (b[0]-a[0]) * (n-a[1]) / (b[1]-a[1]), n]],
  ];
  let out = ring;
  for(const [inside, cut] of edges){
    const pts = out; out = [];
    if(!pts.length) break;
    for(let i = 0; i < pts.length; i++){
      const cur = pts[i], prev = pts[(i + pts.length - 1) % pts.length];
      if(inside(cur)){ if(!inside(prev)) out.push(cut(prev, cur)); out.push(cur); }
      else if(inside(prev)) out.push(cut(prev, cur));
    }
  }
  return out;
}
// Lines: keep the runs of points inside the box
function clipLine(line){
  const [w, s, e, n] = BOX, runs = []; let run = [];
  for(const p of line){
    if(p[0] >= w && p[0] <= e && p[1] >= s && p[1] <= n) run.push(p);
    else { if(run.length > 1) runs.push(run); run = []; }
  }
  if(run.length > 1) runs.push(run);
  return runs;
}
// Douglas–Peucker
function simplify(pts, tol){
  if(pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length-1] = 1;
  const stack = [[0, pts.length - 1]];
  while(stack.length){
    const [a, b] = stack.pop(); let best = 0, bi = -1;
    const [x1, y1] = pts[a], [x2, y2] = pts[b], dx = x2-x1, dy = y2-y1, L = Math.hypot(dx, dy);
    for(let i = a + 1; i < b; i++){
      // (a closed ring starts and ends on the same point: measure from that point)
      const d = L < 1e-9 ? Math.hypot(pts[i][0]-x1, pts[i][1]-y1) : Math.abs(dy*pts[i][0] - dx*pts[i][1] + x2*y1 - y2*x1) / L;
      if(d > best){ best = d; bi = i; }
    }
    if(best > tol){ keep[bi] = 1; stack.push([a, bi], [bi, b]); }
  }
  return pts.filter((p, i) => keep[i]);
}
const area = r => Math.abs(r.reduce((t, p, i) => { const q = r[(i+1) % r.length]; return t + p[0]*q[1] - q[0]*p[1]; }, 0) / 2);
const flat = pts => pts.flatMap(p => [Math.round(p[0]*1000)/1000, Math.round(p[1]*1000)/1000]);
const polys = g => g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
const lines = g => g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];

const land = [];
for(const f of read('ne_10m_land.geojson').features)
  for(const poly of polys(f.geometry)){
    const r = simplify(clipRing(poly[0]), TOL);
    if(r.length >= 4 && area(r) > 0.004) land.push(flat(r));
  }
const lakes = [];
for(const f of read('ne_10m_lakes.geojson').features)
  for(const poly of polys(f.geometry)){
    const r = simplify(clipRing(poly[0]), TOL / 2);
    // Modern dam reservoirs didn't exist in Bible times
    if(/dam|baraj|reservoir|nasser|assad|razazah|habbaniyah|tharthar|qadisiyah|mosul|darbandikhan|dukan|hamrin/i.test(f.properties.name || '')) continue;
    if(r.length >= 4 && area(r) > 0.002) lakes.push([f.properties.name || '', flat(r)]);
  }
const RIVERS = /^(Nile|Jordan|Euphrates|Tigris|Orontes|Litani|Yarmuk|Kura|Halys|Kizil|Karun|Kerkh|Arax|Araks|Aras)/i;
const rivers = [];
for(const f of read('ne_10m_rivers_lake_centerlines.geojson').features){
  const nm = f.properties.name || '';
  if(!RIVERS.test(nm)) continue;
  for(const l of lines(f.geometry)) for(const run of clipLine(l)){
    const s = simplify(run, TOL);
    if(s.length > 1) rivers.push([nm, flat(s)]);
  }
}
const out = {box: BOX, land, lakes, rivers};
fs.writeFileSync(path.join(__dirname, '..', 'bible-lands.json'), JSON.stringify(out));
console.log(`land ${land.length} rings, ${lakes.length} lakes (${[...new Set(lakes.map(l=>l[0]).filter(Boolean))].slice(0,20).join(', ')}), ${rivers.length} river runs (${[...new Set(rivers.map(r=>r[0]))].join(', ')}); ${(JSON.stringify(out).length/1024).toFixed(0)} KB`);
