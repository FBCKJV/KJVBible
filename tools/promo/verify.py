import json, os, sys, subprocess, numpy as np
from faster_whisper import WhisperModel
here=os.path.dirname(os.path.abspath(__file__)); d=sys.argv[1]
m=WhisperModel('small.en',device='cpu',compute_type='int8')
for k,t in json.load(open(os.path.join(here,'script.json'))):
    pcm=subprocess.run(['ffmpeg','-loglevel','error','-i',os.path.join(d,k+'.wav'),'-f','s16le','-ac','1','-ar','16000','-'],capture_output=True).stdout
    s,_=m.transcribe(np.frombuffer(pcm,np.int16).astype(np.float32)/32768,condition_on_previous_text=False)
    h=' '.join(x.text.strip() for x in s)
    print(f'{k:9s}| {h}')
