# Scourby chapter timings: see README.md. Run with LANE=a python3 scan.py "John" (needs ts.json: {F: SCOURBY_FILES, T: SCOURBY_TS, R2: SCOURBY_R2}).
# For each book: find where the reader says "Chapter N" (or "Psalm N").
import json, os, re, subprocess, sys, urllib.parse, time
sys.path.insert(0, os.path.dirname(__file__))
from clip import words
D = json.load(open(os.path.join(os.path.dirname(__file__), 'ts.json')))
OUT = os.path.join(os.path.dirname(__file__), 'found')
AUD = os.path.join(os.path.dirname(__file__), '..', 'audio', os.environ.get('LANE','a'))
os.makedirs(OUT, exist_ok=True); os.makedirs(AUD, exist_ok=True)
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = {'twenty':20,'thirty':30,'forty':40,'fifty':50,'sixty':60,'seventy':70,'eighty':80,'ninety':90}
def num(tokens):
    """Parse a number from the start of tokens; return (value, tokens used)."""
    toks = [re.sub(r'[^a-z0-9-]', '', t.lower()) for t in tokens]
    if toks and re.fullmatch(r'\d+', toks[0] or ''): return int(toks[0]), 1
    total, cur, used = 0, 0, 0
    for t in toks:
        parts = t.split('-') if t else ['']
        ok = False
        for p in parts:
            if p in ONES: cur += ONES.index(p); ok = True
            elif p in TENS: cur += TENS[p]; ok = True
            elif p == 'hundred': cur = (cur or 1) * 100; ok = True
            elif p == 'and' and used: ok = True
        if not ok: break
        used += 1
    return (total + cur, used) if used else (None, 0)
def find_ann(ws, n):
    for i, (a, b, w) in enumerate(ws):
        if re.sub(r'[^a-z]', '', w.lower()) in ('chapter', 'psalm', 'psalms'):
            v, k = num([x[2] for x in ws[i+1:i+6]])
            if v == n and k: return a, ws[i+k][1]   # announcement start, end of the number
    return None
def silences(f):
    r = subprocess.run(['ffmpeg','-v','info','-i',f,'-af','silencedetect=noise=-40dB:d=0.6','-f','null','-'], capture_output=True, text=True)
    return [float(x) for x in re.findall(r'silence_end: ([\d.]+)', r.stderr)]
def book(name):
    outf = os.path.join(OUT, name + '.json')
    if os.path.exists(outf): return
    T = D['T'][name]; f = os.path.join(AUD, 'b.mp3')
    url = D['R2'] + '/' + urllib.parse.quote(D['F'][name])
    subprocess.run(['curl','-sS','-o',f,url], check=True)
    dur = float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f], capture_output=True, text=True).stdout)
    res = {'dur': dur, 'ch': {}}; sil = None; prev = 0.0
    for i in range(1, len(T['c'])):
        n = i + 1; est = T['c'][i]; hit = None
        ws = words(f, max(0, est - 7), 10)
        hit = find_ann(ws, n)
        if not hit:
            if sil is None: sil = silences(f)
            cands = sorted([t for t in sil if prev + 3 < t < dur and abs(t - est) < 400], key=lambda t: abs(t - est))[:16]
            for t in cands:
                ws = words(f, max(0, t - 1.0), 5)
                hit = find_ann(ws, n)
                if hit: break
        if hit:
            res['ch'][n] = {'ann': round(hit[0], 2), 'start': round(hit[1] + 0.15, 2), 'was': est}
            prev = hit[1]
        else:
            res['ch'][n] = {'miss': True, 'was': est}
        print(name, n, res['ch'][n], flush=True)
    # what follows the last chapter's expected end (an outro, or more text)
    res['tail'] = ' '.join(w for _, _, w in words(f, max(0, T['e'][-1] - 2), 12)) if dur - T['e'][-1] > 20 else ''
    json.dump(res, open(outf, 'w'))
    os.remove(f)
for name in (sys.argv[1:] or list(D['T'].keys())):
    t0 = time.time(); book(name); print('DONE', name, round(time.time() - t0), 's', flush=True)
