#!/usr/bin/env python3
"""Build journeys.json from tools/journeys/draft.py (the approved stop list).

    python3 tools/journeys/build.py

Each stop is checked against places.json (the verse must name the place) and
given its date and timeline entry from timeline.json, so the map and the
timeline always agree. Re-run after rebuilding places.json or timeline.json.
Emits ../journeys.json:
  {j:[{id,t,r,y:[from,to],s:[{n,r,d,ll,p?,u?,site?,alts?,via?,to?,y,e}]}]}
  n name as the verse spells it, r verse, d what happened, p place id, u uncertain (dashed),
  via route points into this stop, ov drawn at the traditional site, to dotted arrow off the route, y year, e timeline entry id
  vt label of the usual view; v other views [{t label, d why, s stops}] (from VIEWS in draft.py)
"""
import json, os, sys
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(os.path.dirname(here))
sys.path.insert(0, here); os.chdir(root)
from draft import J, VIEWS
from check import P, resolve
T = json.load(open('timeline.json'))['eras']
START = {'abraham': -1921}   # Genesis 11 sits under the Tower of Babel on the timeline
def event(book, ch):
    best = None
    for ei, era in enumerate(T):
        for i, e in enumerate(era['e']):
            if e[2] == book and e[3] <= ch <= e[4] and (not best or e[4]-e[3] < best[0][4]-best[0][3]): best = (e, f'tl-{ei}-{i}')
    return best
def event_at(year=None, title=None):
    for ei, era in enumerate(T):
        for i, e in enumerate(era['e']):
            if e[0] == year or e[1] == title: return (e, f'tl-{ei}-{i}')
def build(k, t, stops):
    S, via = [], []
    for st in stops:
        if st[0] == '~': via.append([st[1], st[2]]); continue
        n, ref, note = st[:3]; label = (st[3] if len(st) > 3 else None) or n; o = st[4] if len(st) > 4 else {}
        s = {'n': label, 'r': ref, 'd': note}
        if n != '@':
            m, _ = resolve(n, ref)
            if not m: sys.exit(f'{t}: {n} is not named in {ref}')
            p = P[m[0]]; s['p'] = m[0]; s['ll'] = p['ll']
            if (p.get('c') or 0) < 450: s['u'] = 1
        if 'll' in o: s['ll'] = o['ll']; s['ov'] = 1  # drawn at the traditional site, not the data's
        if o.get('sure') is False: s['u'] = 1
        if 'site' in o: s['site'] = o['site']
        if 'toward' in o: s['to'] = o['toward']
        if 'alts' in o:
            s['alts'] = [[a, ll] for a, ll in o['alts']]; s['ll'] = [sum(a[1][0] for a in o['alts'])/len(o['alts']), sum(a[1][1] for a in o['alts'])/len(o['alts'])]; s['u'] = 1
        if via: s['via'] = via; via = []
        b, cv = ref.rsplit(' ', 1)
        ev = event(b, int(cv.split(':')[0]))
        if ev and ev[0][0] < START.get(k, -9999): ev = event_at(START[k])
        if 'ev' in o:
            ev = event_at(title=o['ev'])
            if not ev: sys.exit(f"{t}: no timeline entry {o['ev']}")
        if ev: s['y'], s['e'] = ev[0][0], ev[1]
        S.append(s)
    # stops with no timeline entry take their neighbour's
    for i, s in enumerate(S):
        if 'y' not in s:
            nb = next((S[j] for j in list(range(i-1, -1, -1)) + list(range(i+1, len(S))) if 'y' in S[j]), None)
            if nb: s['y'], s['e'] = nb['y'], nb['e']
    return S
out = []
for k, (t, rng, stops) in J.items():
    S = build(k, t, stops)
    ys = [s['y'] for s in S if 'y' in s]
    j = {'id': k, 't': t, 'r': rng, 'y': [min(ys), max(ys)] if ys else None, 's': S}
    if k in VIEWS:
        j['vt'] = VIEWS[k][0]; j['v'] = []
        for vt, vd, vs in VIEWS[k][1]:
            V = build(k, t, vs)
            if [x['r'] for x in V] != [x['r'] for x in S]: sys.exit(f'{t}: the view “{vt}” must keep the same stops')
            j['v'].append({'t': vt, 'd': vd, 's': V})
    out.append(j)
json.dump({'j': out}, open('journeys.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(f"{len(out)} journeys, {sum(len(j['s']) for j in out)} stops → journeys.json ({os.path.getsize('journeys.json')//1024} KB)")
