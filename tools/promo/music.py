# A mellow bed: soft pad, sparse felt-piano arpeggios and a low root, in D major, ~64 bpm
#   music.py <seconds> <out.wav>
import sys, numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile
SR = 44100
dur = float(sys.argv[1]); out = sys.argv[2]
rng = np.random.default_rng(7)
N = int(SR * (dur + 6))
L = np.zeros(N); R = np.zeros(N)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
beat = 60 / 64
bar = 4 * beat
# chords (midi): each lasts two bars
D, A, Bm, G, Fs, Em = 62, 57, 59, 55, 54, 52
prog = [
  [38, 50, 57, 62, 66, 69],   # D
  [37, 49, 57, 61, 64, 69],   # A/C#
  [35, 47, 54, 59, 62, 66],   # Bm
  [31, 43, 55, 59, 62, 67],   # G
  [30, 42, 54, 57, 62, 66],   # D/F#
  [31, 43, 55, 59, 62, 71],   # G (add 9 on top)
  [33, 45, 57, 62, 64, 69],   # Asus4
  [33, 45, 57, 61, 64, 69],   # A
]
chord_len = 2 * bar
t_all = np.arange(N) / SR
def env_adsr(n, a, r):
    e = np.ones(n); ai = int(a * SR); ri = int(r * SR)
    e[:ai] = np.linspace(0, 1, ai) ** 2
    e[-ri:] *= np.linspace(1, 0, ri) ** 2
    return e
k = 0; t = 0.0
while t < dur + 2:
    ch = prog[k % len(prog)]
    s0 = int(t * SR); n = int((chord_len + 2.5) * SR); n = min(n, N - s0)
    if n <= 0: break
    tt = np.arange(n) / SR
    e = env_adsr(n, 2.2, 2.6)
    # pad: chord tones above the bass, two detuned sines per side, a touch of 2nd harmonic
    for m in ch[1:]:
        f = hz(m)
        for side, det in ((L, -0.12), (R, 0.12)):
            ph = rng.uniform(0, 2 * np.pi)
            v = np.sin(2 * np.pi * (f + det) * tt + ph) + 0.18 * np.sin(2 * np.pi * 2 * (f + det) * tt + ph)
            v *= 1 + 0.08 * np.sin(2 * np.pi * 0.17 * tt + ph)  # slow breathing
            side[s0:s0 + n] += 0.035 * e * v
    # low root
    fb = hz(ch[0] + 12)
    vb = np.sin(2 * np.pi * fb * tt) * env_adsr(n, 1.5, 2.5)
    L[s0:s0 + n] += 0.07 * vb; R[s0:s0 + n] += 0.07 * vb
    # felt piano: a gentle broken chord, one note per beat with rests
    tones = [m + 12 for m in ch[2:]]
    for b in range(8):
        if rng.random() < 0.28 and b not in (0, 4): continue
        m = tones[(b * 2 + k) % len(tones)] if b else tones[0]
        f = hz(m)
        st = t + b * beat + rng.uniform(-0.02, 0.03)
        i0 = max(0, int(st * SR)); ln = int(3.2 * SR); ln = min(ln, N - i0)
        if ln <= 0: continue
        x = np.arange(ln) / SR
        vel = rng.uniform(0.55, 0.85) * (1.0 if b in (0, 4) else 0.8)
        tone = (np.sin(2*np.pi*f*x) + 0.35*np.sin(2*np.pi*2*f*x)*np.exp(-x*3) + 0.12*np.sin(2*np.pi*3*f*x)*np.exp(-x*5))
        env = np.exp(-x * 1.3) * np.minimum(1, x / 0.008)
        pan = rng.uniform(0.35, 0.65)
        v = 0.06 * vel * tone * env
        L[i0:i0 + ln] += v * (1 - pan) * 1.4; R[i0:i0 + ln] += v * pan * 1.4
    t += chord_len; k += 1
# soften the top
sos = butter(2, 3800, 'low', fs=SR, output='sos')
L = sosfilt(sos, L); R = sosfilt(sos, R)
# hall reverb: decaying noise
irn = int(3.4 * SR); x = np.arange(irn) / SR
irL = rng.standard_normal(irn) * np.exp(-x * 2.0); irR = rng.standard_normal(irn) * np.exp(-x * 2.0)
irL /= np.sqrt((irL**2).sum()); irR /= np.sqrt((irR**2).sum())
wet = 0.42
L2 = (1 - wet) * L + wet * fftconvolve(L, irL)[:N]
R2 = (1 - wet) * R + wet * fftconvolve(R, irR)[:N]
st = np.stack([L2, R2], 1)[:int(SR * dur)]
# fade in and out
fi = int(2.5 * SR); fo = int(5 * SR)
st[:fi] *= np.linspace(0, 1, fi)[:, None]
st[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
st /= np.abs(st).max() / 0.8
wavfile.write(out, SR, (st * 32767).astype(np.int16))
print('ok', dur)
