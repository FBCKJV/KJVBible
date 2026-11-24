# narration lines → one wav each, and their lengths
#   tts.py <voice> <outdir> [length_scale]
import json, sys, wave, os
from piper import PiperVoice
try:
    from piper import SynthesisConfig
except ImportError:
    SynthesisConfig = None
here = os.path.dirname(os.path.abspath(__file__))
voice_name, out = sys.argv[1], sys.argv[2]
ls = float(sys.argv[3]) if len(sys.argv) > 3 else 1.1
os.makedirs(out, exist_ok=True)
v = PiperVoice.load(os.path.join(os.environ.get('PIPER_VOICES', os.path.join(here, 'voices')), voice_name + '.onnx'))
lines = json.load(open(os.path.join(here, 'script.json')))
only = set(sys.argv[4].split(',')) if len(sys.argv) > 4 else None
lens = {}
for key, text in lines:
    if only and key not in only: continue
    fn = os.path.join(out, key + '.wav')
    with wave.open(fn, 'wb') as w:
        if SynthesisConfig:
            v.synthesize_wav(text, w, syn_config=SynthesisConfig(length_scale=ls, noise_scale=0.6, noise_w_scale=0.7))
        else:
            v.synthesize(text, w, length_scale=ls, sentence_silence=0.35)
    with wave.open(fn) as w:
        lens[key] = round(w.getnframes() / w.getframerate(), 2)
    print(key, lens[key])
prev = {}
lf = os.path.join(out, 'lens.json')
if os.path.exists(lf): prev = json.load(open(lf))
prev.update(lens)
json.dump(prev, open(lf, 'w'), indent=1)
print('total', round(sum(prev.values()), 1))
