# One narration file → one wav per script paragraph, found by word timings
#   split.py <audio> <outdir>
import json, os, re, sys, subprocess, difflib
from faster_whisper import WhisperModel
here = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
lines = json.load(open(os.path.join(here, 'script.json')))
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
model = WhisperModel('small.en', device='cpu', compute_type='int8')
import numpy as np
pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
segs, _ = model.transcribe(audio, word_timestamps=True, vad_filter=False, condition_on_previous_text=False, beam_size=5)
words = [(norm(w.word), w.start, w.end) for s in segs for w in s.words if norm(w.word)]
print('heard', len(words), 'words'); open(os.path.join(out,'heard.txt'),'w').write(' '.join(f'{w}@{s:.1f}' for w,s,e in words))
# script words, each tagged with its paragraph
sw, tag = [], []
for i, (k, t) in enumerate(lines):
    for w in t.split():
        if norm(w): sw.append(norm(w)); tag.append(i)
sm = difflib.SequenceMatcher(None, sw, [w[0] for w in words], autojunk=False)
s2h = {}
for a, b, n in sm.get_matching_blocks():
    for j in range(n): s2h[a + j] = b + j
print('matched', len(s2h), 'of', len(sw), 'script words')
# first and last heard word of each paragraph
starts, ends = [], []
for i in range(len(lines)):
    idx = [s2h[j] for j in range(len(sw)) if tag[j] == i and j in s2h]
    if not idx: sys.exit(f'paragraph {i} ({lines[i][0]}) not found')
    starts.append(words[min(idx)][1]); ends.append(words[max(idx)][2])
# key=seconds on the command line: where a paragraph starts, when the transcript missed it
keys = [k for k, _ in lines]
for arg in sys.argv[3:]:
    k, v = arg.split('='); i = keys.index(k); v = float(v)
    starts[i] = v
    if i: ends[i-1] = v - 0.3
total = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]))
# loudness in 10 ms frames: word times from the transcript are rough (an "s" runs on
# past them), so each cut goes in the quietest stretch between two paragraphs
FR = 160
nfr = len(audio) // FR
db = 20 * np.log10(np.sqrt((audio[:nfr * FR].reshape(nfr, FR) ** 2).mean(1)) + 1e-9)
quiet = db < -42
def cut_between(e, s):
    lo, hi = sorted((int((e - 0.15) * 100), int((s + 0.15) * 100)))
    if hi - lo < 3: lo, hi = lo - 10, hi + 10
    lo, hi = max(lo, 0), min(hi, nfr - 1)
    best, run, start = (0, (lo + hi) // 2), 0, lo   # (length, middle) of the longest quiet run
    for f in range(lo, hi + 1):
        if quiet[f]:
            if run == 0: start = f
            run += 1
            if run > best[0]: best = (run, (start + f) // 2)
        else: run = 0
    if best[0] == 0: best = (0, lo + int(np.argmin(db[lo:hi + 1])))
    return best[1] / 100
cuts = [0] + [cut_between(ends[i], starts[i + 1]) for i in range(len(lines) - 1)] + [total]
def speech_span(a, b):  # first and last loud frame inside a stretch
    f = [x for x in range(int(a * 100), min(int(b * 100), nfr)) if db[x] > -38]
    return (f[0] / 100, (f[-1] + 1) / 100) if f else (a, b)
lens = {}
for i, (k, _) in enumerate(lines):
    s, e = speech_span(cuts[i], cuts[i + 1])
    a = max(cuts[i], s - 0.12); b = min(cuts[i + 1], e + 0.35)
    fn = os.path.join(out, k + '.wav')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', src,
                    '-af', 'afade=t=in:d=0.03,areverse,afade=t=in:d=0.08,areverse', '-ar', '44100', fn], check=True)
    lens[k] = round(b - a, 2)
    print(f'{k:9s} {a:7.2f} → {b:7.2f}  ({lens[k]}s)')
json.dump(lens, open(os.path.join(out, 'lens.json'), 'w'), indent=1)
print('total', round(sum(lens.values()), 1))
