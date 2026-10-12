#!/usr/bin/env node
// Build verse-index.json: for each verse, the timeline event that has it as its key verse and the
// journey stops that are in it, so the verse card can offer "📅 When & where ›" without loading the
// whole timeline and every journey. Run after changing timeline.json or journeys.json:
//
//   node tools/build-verse-index.js
//
// Emits ../verse-index.json: { "Genesis 28:19": { t: [[event id, title, year]], j: [[journey id, journey title, stop number, stop name, place id]] } }
// (an event id is "tl-<era>-<event>", as in the Timeline; a stop number counts from 0, as openJourney(id, stop) takes it).

const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const T = JSON.parse(fs.readFileSync(path.join(root, 'timeline.json'), 'utf8')).eras;
const J = JSON.parse(fs.readFileSync(path.join(root, 'journeys.json'), 'utf8')).j;
const out = {};
const at = ref => out[ref] || (out[ref] = {});
T.forEach((era, i) => era.e.forEach((e, k) => { (at(e[5]).t = at(e[5]).t || []).push([`tl-${i}-${k}`, e[1], e[0]]); }));
J.forEach(j => j.s.forEach((s, k) => { (at(s.r).j = at(s.r).j || []).push([j.id, j.t, k, s.n, s.p || '']); }));
fs.writeFileSync(path.join(root, 'verse-index.json'), JSON.stringify(out));
const refs = Object.keys(out);
console.log(`${refs.length} verses: ${refs.filter(r => out[r].t).length} timeline events, ${refs.filter(r => out[r].j).length} with journey stops`);
