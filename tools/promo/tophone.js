// frames + times → a 30fps phone clip; prints the scene marks in clip seconds
const fs=require('fs');const {execFileSync}=require('child_process');
const name=process.argv[2];const [W,H]=(process.argv[3]||'780x1688').split('x');const j=JSON.parse(fs.readFileSync(__dirname+'/'+name+'.json'));
const f=j.frames;const t0=f[0][1];
const wall0=j.marks[0][1]; // marks are wall-clock; screencast timestamps are wall-clock seconds too
let s='';for(let i=0;i<f.length;i++){const d=(i+1<f.length?f[i+1][1]:j.end)-f[i][1];s+=`file '${f[i][0]}'\nduration ${Math.max(d,0.001).toFixed(4)}\n`;}
s+=`file '${f.at(-1)[0]}'\n`;
fs.writeFileSync(__dirname+'/'+name+'.txt',s);
execFileSync('ffmpeg',['-loglevel','error','-y','-f','concat','-safe','0','-i',name+'.txt','-vf',`fps=30,scale=${W}:${H}:flags=lanczos:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black,format=yuv420p`,'-c:v','libx264','-crf','14','-preset','medium',name+'.mp4'],{cwd:__dirname,stdio:'inherit'});
const marks=j.marks.map(([id,t])=>[id,+(t-t0).toFixed(2)]);
fs.writeFileSync(__dirname+'/'+name+'.marks.json',JSON.stringify(marks));
console.log(marks, 'clock offset first frame vs first mark', (t0-wall0).toFixed(2));
