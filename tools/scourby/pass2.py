# Second pass for chapters the first pass missed: listen continuously between
# the neighbouring breaks that were found, nearest the word-count estimate first.
import json, os, re, subprocess, sys, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
from clip import words
from scan import D, OUT, num, find_ann
AUD = os.path.join(os.path.dirname(__file__), '..', 'audio', os.environ.get('LANE','a') + '2')
os.makedirs(AUD, exist_ok=True)
BIB = '/home/user/KJVBible/bible/'
def wc(name, i):
    d = json.load(open(BIB + name.replace(' ', '') + '.json'))
    return sum(len(v['text'].split()) for v in d['chapters'][i]['verses'])
def chapter_words(ws):
    out = []
    for i, (a, b, w) in enumerate(ws):
        if re.sub(r'[^a-z]', '', w.lower()) in ('chapter', 'psalm', 'psalms'):
            v, k = num([x[2] for x in ws[i+1:i+6]])
            out.append((a, ws[i+k][1] if k else b, v))
    return out
def book(name):
    fj = os.path.join(OUT, name + '.json'); R = json.load(open(fj))
    miss = [int(n) for n, x in R['ch'].items() if x.get('miss')]
    if not miss or R.get('pass2'): return
    f = os.path.join(AUD, 'b.mp3')
    subprocess.run(['curl','-sS','-o',f, D['R2'] + '/' + urllib.parse.quote(D['F'][name])], check=True)
    T = D['T'][name]; nch = len(T['c'])
    def start(n):  # where chapter n starts, if known
        if n == 1: return 0.0
        x = R['ch'].get(str(n)); return x['ann'] if x and 'ann' in x else None
    for n in miss:
        lo_n = n - 1
        while start(lo_n) is None: lo_n -= 1
        hi_n = n + 1
        while hi_n <= nch and start(hi_n) is None: hi_n += 1
        lo = start(lo_n); hi = start(hi_n) if hi_n <= nch else R['dur']
        w = [wc(name, i - 1) for i in range(lo_n, hi_n)]          # chapters lo_n .. hi_n-1
        est = lo + (hi - lo) * sum(w[:n - lo_n]) / sum(w)
        # 30-second windows, nearest the estimate first, within (lo, hi)
        wins = sorted({max(lo + 2, min(hi - 30, est - 15 + k * 25)) for k in range(-12, 13)}, key=lambda s: abs(s + 15 - est))
        best = None; heard = []
        for s0 in wins:
            if s0 < lo or s0 > hi: continue
            for a, e, v in chapter_words(words(f, s0, 32)):
                heard.append((round(a, 1), v))
                if v == n: best = (a, e); break
            if best: break
        if best: R['ch'][str(n)] = {'ann': round(best[0], 2), 'start': round(best[1] + 0.15, 2), 'was': R['ch'][str(n)]['was'], 'pass': 2}
        else: R['ch'][str(n)]['heard'] = heard[:8]; R['ch'][str(n)]['est'] = round(est, 1)
        print(name, n, R['ch'][str(n)], flush=True)
    R['pass2'] = True; json.dump(R, open(fj, 'w')); os.remove(f)
for name in sys.argv[1:]: book(name)
