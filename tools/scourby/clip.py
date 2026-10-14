import sys, subprocess, numpy as np
from faster_whisper import WhisperModel
_m = None
def model():
    global _m
    if _m is None: _m = WhisperModel('base.en', device='cpu', compute_type='int8')
    return _m
def pcm(f, start, dur):
    raw = subprocess.run(['ffmpeg','-v','error','-ss',str(start),'-t',str(dur),'-i',f,'-ac','1','-ar','16000','-f','f32le','-'], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
def words(f, start, dur):
    segs, _ = model().transcribe(pcm(f, start, dur), word_timestamps=True, language='en')
    return [(start+w.start, start+w.end, w.word.strip()) for s in segs for w in (s.words or [])]
if __name__ == '__main__':
    f, start, dur = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
    print(' '.join(f"[{a:.1f}]{w}" for a,b,w in words(f,start,dur)))
