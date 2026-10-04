import json,sys,re; sys.path.insert(0,'tools/journeys'); from draft import J
P=json.load(open('places.json'))['places']
BOOKS=json.loads(re.search(r'const BOOKS=(\[[^\]]*\])',open('index.html').read()).group(1))
byv={}
for id,p in P.items():
  for r in p['v'].split(';'):
    bc,vs=r.split(':');b,c=bc.split('.')
    for part in vs.split(','):
      a,*z=part.split('-')
      for v in range(int(a),int(z[0] if z else a)+1): byv.setdefault(f"{BOOKS[int(b)]} {c}:{v}",[]).append(id)
def resolve(n,ref):
  ids=byv.get(ref,[]); nl=n.lower()
  return [i for i in ids if P[i]['n'].lower()==nl or nl in [a.lower() for a in P[i].get('a',[])]], ids
if __name__=='__main__':
  for k,(t,rng,stops) in J.items():
    print('##',t)
    for st in stops:
      n,ref,note=st[:3]
      if n.startswith('~'): print('   (waypoint)',n); continue
      m,ids=resolve(n,ref)
      if not m:
        allm=[i for i,p in P.items() if p['n'].lower()==n.lower()]
        print('   !!',n,ref,'verse has',[(i,P[i]['n']) for i in ids],'| name ids',[(i,P[i].get('c'),P[i]['v'][:25]) for i in allm][:4]); continue
      p=P[m[0]]; flag='' if p.get('ll') and (p.get('c') or 0)>=450 else ' [dashed c=%s]'%p.get('c') if p.get('ll') else ' [NO SITE]'
      print('   ok',n,ref,flag, '(%d ids)'%len(m) if len(m)>1 else '')
