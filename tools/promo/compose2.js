// screens + captions + frames + narration + music → the finished video
//   node compose2.js <phone-rec> <laptop-rec> <vo-dir> <out>
const fs=require('fs');const {execFileSync}=require('child_process');
const [phone,laptop,vo,out]=process.argv.slice(2);const D=__dirname;
const run=(a,bin='ffmpeg')=>execFileSync(bin,bin==='ffmpeg'?['-loglevel','error','-y',...a]:a,{cwd:D,stdio:'inherit'});
const durOf=f=>parseFloat(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',`${D}/${f}`]).toString());
const LENS=JSON.parse(fs.readFileSync(`${D}/${vo}/lens.json`));
const SKIP=process.argv.includes('--audio-only');
function segment(name,bezel,scale,pos,outName){
  const marks=JSON.parse(fs.readFileSync(`${D}/${name}.marks.json`)).filter(m=>m[0]!=='end');
  const dur=durOf(name+'.mp4');
  if(SKIP) return {dur,marks};
  const inp=['-i',`${name}.mp4`,'-loop','1','-t',String(dur),'-i',`st-${bezel}.png`];
  marks.forEach(([id])=>inp.push('-loop','1','-t',String(dur),'-i',`st-${id}.png`));
  let f=`[2:v]format=rgba[base0];`;let last='base0';
  marks.forEach(([id,t],i)=>{if(i===0)return;const k=i+2;
    f+=`[${k}:v]format=rgba,fade=t=in:st=${Math.max(0,t-0.25).toFixed(2)}:d=0.5:alpha=1[c${i}];[${last}][c${i}]overlay=0:0[b${i}];`;last=`b${i}`;});
  f+=`[0:v]scale=${scale}:flags=lanczos[ph];[${last}][ph]overlay=${pos}[w];[w][1:v]overlay=0:0,format=yuv420p,fps=30[v]`;
  run([...inp,'-filter_complex',f,'-map','[v]','-t',String(dur),'-c:v','libx264','-crf','16','-preset','veryfast',outName]);
  return {dur,marks};
}
const P=segment(phone,'bezel','406:880','1180:100','seg-phone.mp4');
const Lp=segment(laptop,'lbezel','1248:780','336:236','seg-laptop.mp4');
const X=0.9, I=+(LENS.intro+2.0).toFixed(2), O=+(LENS.outro+4.5).toFixed(2);
const o1=I-X, o2=o1+P.dur-X, o3=o2+Lp.dur-X, total=o3+O;
if(!SKIP){
  run(['-loop','1','-t',String(I),'-i','st-intro.png','-vf','format=yuv420p,fps=30','-c:v','libx264','-crf','16','-preset','veryfast','intro.mp4']);
  run(['-loop','1','-t',String(O),'-i','st-outro.png','-vf','format=yuv420p,fps=30,fade=t=out:st='+(O-1.5)+':d=1.5','-c:v','libx264','-crf','16','-preset','veryfast','outro.mp4']);
  run(['-i','intro.mp4','-i','seg-phone.mp4','-i','seg-laptop.mp4','-i','outro.mp4','-filter_complex',
    `[0:v]fade=t=in:st=0:d=1.2[i];[i][1:v]xfade=transition=fade:duration=${X}:offset=${o1.toFixed(2)}[a];[a][2:v]xfade=transition=fade:duration=${X}:offset=${o2.toFixed(2)}[b];[b][3:v]xfade=transition=fade:duration=${X}:offset=${o3.toFixed(2)},format=yuv420p[v]`,
    '-map','[v]','-c:v','libx264','-crf','18','-preset','medium','video-only.mp4']);
}
// narration cues
const cues=[['intro',0.9]];
P.marks.forEach(([k,t])=>cues.push([k,o1+t+0.5]));
Lp.marks.forEach(([k,t])=>cues.push([k,o2+t+0.6]));
cues.push(['outro',o3+0.9]);
const ai=[],fl=[];
cues.forEach(([k,t],i)=>{ai.push('-i',`${vo}/${k}.wav`);fl.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${Math.round(t*1000)}:all=1[n${i}]`);});
const n=cues.length;
run([...ai,'-filter_complex',fl.join(';')+';'+cues.map((_,i)=>`[n${i}]`).join('')+`amix=inputs=${n}:normalize=0:duration=longest,apad=whole_dur=${total.toFixed(2)},atrim=0:${total.toFixed(2)}[v]`,'-map','[v]','-c:a','pcm_s16le','voice.wav']);
// music bed, ducked under the voice
run([D+'/music.py',String(total.toFixed(2)),D+'/music.wav'],process.env.PROMO_PY||'python3');
run(['-i','music.wav','-i','voice.wav','-filter_complex',
  `[0:a]volume=-15dB[m];[1:a]asplit=2[v1][sc];[m][sc]sidechaincompress=threshold=0.02:ratio=4:attack=120:release=900:makeup=1[md];[md][v1]amix=inputs=2:normalize=0:weights=1 1.15,loudnorm=I=-15:TP=-1.5:LRA=11[a]`,
  '-map','[a]','-ar','48000','-c:a','pcm_s16le','mix.wav']);
run(['-i','video-only.mp4','-i','mix.wav','-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',out+'.mp4']);
console.log('done total',total.toFixed(1),'s');
fs.writeFileSync(D+'/'+out+'.cues.json',JSON.stringify({cues,total}));
