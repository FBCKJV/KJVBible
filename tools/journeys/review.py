import json,sys,html; sys.path.insert(0,'tools/journeys')
from draft import J
from check import P, resolve
T=json.load(open('timeline.json'))['eras']
def event(book,ch):
  best=None
  for era in T:
    for e in era['e']:
      if e[2]==book and e[3]<=ch<=e[4] and (not best or e[4]-e[3]<best[4]-best[3]): best=e
  return best
yr=lambda y: f"{-y} B.C." if y<0 else f"A.D. {y}"
START={'abraham':-1921}  # Genesis 11 sits under the Tower of Babel on the timeline
OVR={("Hor","Numbers 20:27"):"Drawn at Jebel Harun near Petra, the traditional mount Hor (the data's site is Har Zin)",
     ("Pi-hahiroth","Exodus 14:2"):"Crossing drawn at the head of the Gulf of Suez, as on the traditional maps (the data's site is near Tell Defenneh)"}
NOTE={"jonah":"Tarshish is not drawn — its place is not known, and it lies beyond the map. A dotted arrow from Joppa points west “toward Tarshish”.",
 "captivity":"The line follows the Euphrates (by Carchemish) rather than straight across the desert, as travellers went; Carchemish is a route point only, not a stop.",
 "return":"The line follows the Euphrates, as above.",
 "ministry":"The sermon on the mount and the transfiguration are not stops — the text does not name those mountains.",
 "david":"Not on the timeline yet — I'd add “David flees from Saul”, about 1062 B.C. (Ussher), so this journey has a date like the others.",
 "childhood":"The timeline dates the birth 4 B.C. and the temple visit at twelve A.D. 8; each stop shows its own date.",
 "paul0":"“Arabia” (Galatians 1:17) is a region, drawn as a dashed ring."}
out=[]
total=0
for k,(t,rng,stops) in J.items():
  rows=[];years=set()
  for i,st in enumerate([s for s in stops if not s[0].startswith('~')],1):
    n,ref,note=st[:3]; label=st[3] if len(st)>3 else n
    m,_=resolve(n,ref); p=P[m[0]]
    b,cv=ref.rsplit(' ',1); e=event(b,int(cv.split(':')[0]))
    if e and e[0] >= START.get(k, -9999): years.add(e[0])
    elif k in START: years.add(START[k])
    c=p.get('c') or 0
    site=OVR.get((n,ref)) or (("Confident" if c>=700 else "Likely")+(f" — today {p['s']}" if p.get('s') and p['s']!=p['n'] else "") if c>=450 else f"Uncertain — dashed{(' (suggested: '+p['s']+')') if p.get('s') else ''}")
    rows.append(f"<tr><td>{i}</td><td><b>{html.escape(label)}</b></td><td>{ref}</td><td>{html.escape(note)}</td><td class=s>{html.escape(site)}</td></tr>")
  total+=len(rows)
  ys=sorted(years); when=(yr(ys[0]) if len(ys)==1 else f"{yr(ys[0])} – {yr(ys[-1])}") if ys else "not yet dated"
  out.append(f"<h2>{html.escape(t)}</h2><div class=m>{rng} · {len(rows)} stops · Timeline: about {when}</div>"
    +(f"<div class=n>Note: {NOTE[k]}</div>" if k in NOTE else "")
    +"<table><tr><th>#</th><th>Place</th><th>Verse</th><th>What happened</th><th>Site</th></tr>"+''.join(rows)+"</table>")
doc=f"""<!doctype html><meta charset=utf-8><style>
body{{font-family:Georgia,serif;color:#111;margin:0;font-size:10.5pt}} h1{{font-size:20pt;margin:0 0 4px}} h2{{font-size:13.5pt;margin:18px 0 2px;break-after:avoid}}
.m{{font-size:9.5pt;color:#444;margin-bottom:4px}} .n{{font-size:9.5pt;font-style:italic;margin:2px 0 5px}}
table{{border-collapse:collapse;width:100%;font-size:9.5pt}} th,td{{border-bottom:1px solid #ccc;padding:3px 5px;text-align:left;vertical-align:top}} th{{border-bottom:1.5px solid #333}}
td:first-child{{width:16px;color:#666}} td:nth-child(3){{white-space:nowrap}} .s{{color:#444;width:30%}} tr{{break-inside:avoid}}
.box{{border:1px solid #999;padding:8px 12px;margin:10px 0;font-size:10pt}} .box li{{margin:3px 0}}
</style>
<h1>Bible Journeys — stop list for approval</h1>
<div class=m>FBC KJV Bible app · draft for v41 · {len(J)} journeys, {total} stops · every stop is a verse that names the place</div>
<div class=box><b>How it will work — text, timeline and map in a full circle</b><ul>
<li><b>Text → map:</b> 📍 Where in the reader (built). When the chapter is part of a journey: “🧭 Paul's second journey · stop 6 of 15 ›”.</li>
<li><b>Map → text:</b> each stop shows its verse with Read ›; “Next stop ›” and “‹ Back a stop” walk the route as the line draws on.</li>
<li><b>Text → timeline:</b> 📅 About … in the reader (built).</li>
<li><b>Timeline → map:</b> each timeline event gets 📍 (its places on the map) and 🧭 when a journey belongs to it.</li>
<li><b>Map → timeline:</b> each stop shows “📅 About A.D. 52 ›”, taken from the timeline (Ussher's dates), so the two always agree.</li>
<li><b>Search → Maps:</b> a 🧭 Journeys list above the classic maps; a place's card lists the journeys that pass through it.</li>
<li><b>Sites:</b> conventional sites throughout (Mount Sinai at Jebel Musa; the southern route). Where the site is uncertain the stop and the line to it are dashed.</li>
</ul></div>
{''.join(out)}"""
open(sys.argv[1],'w').write(doc)
