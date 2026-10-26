# Second step of the text review: see compare.py.
import json,re,sys,difflib,collections
rows=json.load(open(sys.argv[1]))
def loose(t):
    t=t.replace('Æ','AE').replace('æ','ae').replace('(','').replace(')','')
    t=re.sub(r'(?<=[A-Za-z])-(?=[a-z])','',t)   # Beth-el → Bethel, Adoni-zedek → Adonizedek
    return t
def wd(a,b):
    aw,bw=a.split(),b.split(); sm=difflib.SequenceMatcher(None,aw,bw)
    return [(' '.join(aw[i1:i2]),' '.join(bw[j1:j2])) for t,i1,i2,j1,j2 in sm.get_opcodes() if t!='equal']
W=['PCE','eBible-1769','thiagobodruk','Gutenberg']
out=collections.defaultdict(list)
for r in rows:
    rd={}
    for t,os_ in r['readings']:
        for o in os_: rd[o]=t
    if r['ref'].startswith('Psalms 119'): rd['PCE']=re.sub(r'^[A-Z]{1,7}\. ','',rd['PCE'])
    L={o:loose(rd[o]) for o in W}; a=loose(r['app'])
    if a==L['PCE']: continue
    agree=[o for o in W if L[o]==a]
    pce_with=[o for o in W[1:] if L[o]==L['PCE']]
    r['agree']=agree; r['pce_with']=pce_with; r['d']=wd(r['app'],rd['PCE']); r['pce']=rd['PCE']
    if not agree or agree==['Gutenberg']:
        k='fix' if set(pce_with)&{'eBible-1769','thiagobodruk'} else 'look'
    else: k='edition' if not pce_with else 'look'
    out[k].append(r)
for k,v in out.items(): print(k,len(v))
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False,indent=0)
for r in out['look']: print('LOOK',r['ref'],r['d'],'ours with',r['agree'],'PCE with',r['pce_with'])
