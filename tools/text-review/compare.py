# Compare the app's KJV text (bible/*.json) with independent electronic KJVs, verse by verse.
#
#   python3 tools/text-review/compare.py <sources dir> bible <out.json>
#   python3 tools/text-review/vote.py <out.json> <vote.json>
#
# The sources dir holds (downloaded by hand; none are kept in the repository):
#   pce.txt       Pure Cambridge Edition, tab-separated: https://www.bibleprotector.com/TEXT-PCE-127-TAB.txt
#   ekjv/*.usfm   eBible.org KJV (1769): https://ebible.org/Scriptures/eng-kjv_usfm.zip
#   ../usfm/*.usfm eBible.org KJV 2006 (same publisher; shown, not counted as a separate witness):
#                 https://ebible.org/Scriptures/eng-kjv2006_usfm.zip
#   gut.txt       Project Gutenberg #10: https://www.gutenberg.org/cache/epub/10/pg10.txt
#   thiago.json   https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json
#   aj/*.json     aruljohn/Bible-kjv, the files this app's text began from
#
# Only what is not text is evened out before comparing: italic brackets, quote shapes, spaces
# before punctuation, the Pure Cambridge's Psalm titles (<<…>>). compare.py lists every verse
# where ours differs from the Pure Cambridge Edition; vote.py then also evens out hyphens in names
# (Beth-el / Bethel) and Æ / AE, and sorts them into
#   fix      ours is shared by no witness but Gutenberg, and the Pure Cambridge has another beside it
#   edition  ours agrees with the Oxford-printed texts and only the Pure Cambridge differs
#   look     anything else
# corrections.json and edition-differences.json were made from vote.py's result (October 2026).
import json,re,glob,os,sys
S=sys.argv[1]; APP=sys.argv[2]; OUT=sys.argv[3]
BOOKS=["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"]
USFM=['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV']
def norm(t):
    t=t.replace('\u2019',"'").replace('\u2018',"'").replace('\u201c','"').replace('\u201d','"').replace('¶','')
    t=re.sub(r'<<.*?>>','',t); t=re.sub(r'[\[\]{}]','',t); t=re.sub(r'\s+',' ',t); t=re.sub(r' ([,;:.?!)])',r'\1',t); t=t.replace('( ','(')
    return t.strip()
def jsonbooks(d):
    out={}
    for b,name in enumerate(BOOKS):
        f=os.path.join(d,name.replace(' ','')+'.json')
        for ch in json.load(open(f,encoding='utf-8-sig'))['chapters']:
            for v in ch['verses']: out[(b,int(ch['chapter']),int(v['verse']))]=norm(v['text'])
    return out
src={}
src['app']=jsonbooks(APP)
src['aruljohn']=jsonbooks(S+'/aj')
# PCE
d={}
for line in open(S+'/pce.txt',encoding='latin-1'):
    p=line.rstrip('\r\n').split('\t')
    if len(p)>=6: d[(int(p[0])-1,int(p[3]),int(p[4]))]=norm(p[5])
src['PCE']=d
# USFM
def clean(s):
    s=re.sub(r'\\f .*?\\f\*','',s,flags=re.S); s=re.sub(r'\\x .*?\\x\*','',s,flags=re.S)
    s=re.sub(r'\\\+?w ([^|\\]*)\|[^\\]*?\\\+?w\*',r'\1',s)
    s=re.sub(r'\\\+?w ([^\\]*)\\\+?w\*',r'\1',s)
    s=re.sub(r'\\[a-z0-9+]+\*?','',s)
    return norm(s)
def usfm(dirn):
    out={}
    for f in glob.glob(dirn+'/*.usfm'):
        t=open(f,encoding='utf-8').read(); m=re.match(r'\\id (\w+)',t)
        if not m or m.group(1) not in USFM: continue
        b=USFM.index(m.group(1))
        for cm in re.finditer(r'\\c (\d+)(.*?)(?=\\c \d+|\Z)',t,re.S):
            body=re.sub(r'\\(d|s\d?|ms\d?|mr|r|qa) .*?(?=\n)','',cm.group(2))
            for vm in re.finditer(r'\\v (\d+) (.*?)(?=\\v \d+|\Z)',body,re.S): out[(b,int(cm.group(1)),int(vm.group(1)))]=clean(vm.group(2))
    return out
src['eBible-1769']=usfm(S+'/ekjv')
src['eBible-2006']=usfm(S+'/../usfm')
# Gutenberg
d={}; b=-1; cur=None
txt=open(S+'/gut.txt',encoding='utf-8-sig').read()
txt=txt[txt.find('1:1 In the beginning'):txt.find('*** END')]
for para in re.split(r'\n\s*\n',txt):
    para=' '.join(para.split())
    for m in re.finditer(r'(\d+):(\d+) (.*?)(?= \d+:\d+ |$)',para):
        c,v=int(m.group(1)),int(m.group(2))
        if c==1 and v==1: b+=1
        if 0<=b<66: d[(b,c,v)]=norm(m.group(3))
src['Gutenberg']=d
d={}
for b,bk in enumerate(json.load(open(S+'/thiago.json',encoding='utf-8-sig'))):
    for c,ch in enumerate(bk['chapters']):
        for v,t in enumerate(ch): d[(b,c+1,v+1)]=norm(t)
src['thiagobodruk']=d
for k,v in src.items(): print(k,len(v))
others=['PCE','eBible-1769','eBible-2006','Gutenberg','thiagobodruk']
rows=[]
for key,a in src['app'].items():
    vals={o:src[o].get(key) for o in others}
    agree=[o for o in others if vals[o]==a]
    if len(agree)>=1 and vals['PCE']==a: continue   # PCE agrees: keep
    # tally readings
    tally={}
    for o in others:
        if vals[o] is not None: tally.setdefault(vals[o],[]).append(o)
    rows.append({'ref':f"{BOOKS[key[0]]} {key[1]}:{key[2]}",'k':key,'app':a,'aj':src['aruljohn'].get(key),'readings':[[t,os_] for t,os_ in sorted(tally.items(),key=lambda x:-len(x[1]))]})
json.dump(rows,open(OUT,'w'),indent=0,ensure_ascii=False)
print('verses where ours differs from the Pure Cambridge Edition:',len(rows))
