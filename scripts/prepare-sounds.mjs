// Optional asset-authoring tool; committed WAVs need no decoder at app build/runtime.
// Decode original CC0 OGGs using an existing Chromium/Playwright installation.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const sounds=join(root,'src-tauri','sounds');
const selections={
 soft:{start:'confirmation_002',pause:'minimize_001',resume:'maximize_001',end:'confirmation_001',warning:'question_001'},
 crisp:{start:'glass_001',pause:'back_002',resume:'select_002',end:'confirmation_004',warning:'question_002'},
};
const browser=await chromium.launch({channel:'msedge',headless:true});
const manifest=[];
try{
 const page=await browser.newPage();
 for(const [theme,cues] of Object.entries(selections))for(const [cue,source] of Object.entries(cues)){
  const original=readFileSync(join(sounds,'source',source+'.ogg'));
  const decoded=await page.evaluate(async base64=>{
   const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
   const context=new OfflineAudioContext(1,1,22050);
   const buffer=await context.decodeAudioData(bytes.buffer);
   const mono=new Float32Array(buffer.length);
   for(let channel=0;channel<buffer.numberOfChannels;channel++){
    const samples=buffer.getChannelData(channel);
    for(let i=0;i<samples.length;i++)mono[i]+=samples[i]/buffer.numberOfChannels;
   }
   return Array.from(mono);
  },original.toString('base64'));
  let begin=decoded.findIndex(v=>Math.abs(v)>0.0005);if(begin<0)throw new Error('Silent source');
  let end=decoded.length;while(end>begin&&Math.abs(decoded[end-1])<0.0005)end--;
  let samples=decoded.slice(Math.max(0,begin-110),Math.min(end+220,begin+Math.round(22050*0.85)));
  if(theme==='soft'){
   const alpha=1-Math.exp(-2*Math.PI*2800/22050);let previous=0;
   samples=samples.map(value=>(previous+=alpha*(value-previous)));
  }
  const peak=Math.max(...samples.map(Math.abs));
  const rms=Math.sqrt(samples.reduce((sum,value)=>sum+value*value,0)/samples.length);
  const gain=Math.min((theme==='soft'?0.32:0.45)/peak,(theme==='soft'?0.075:0.1)/rms);
  samples=samples.map((value,i)=>value*gain*Math.min(1,i/110,(samples.length-1-i)/882));
  const wav=Buffer.alloc(44+samples.length*2);
  wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);
  wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(22050,24);wav.writeUInt32LE(44100,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);
  wav.write('data',36);wav.writeUInt32LE(samples.length*2,40);
  samples.forEach((value,i)=>wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,value))*32767),44+i*2));
  const relative=theme==='soft'?`${cue}.wav`:`crisp/${cue}.wav`;
  mkdirSync(join(sounds,theme==='soft'?'.':'crisp'),{recursive:true});writeFileSync(join(sounds,relative),wav);
  manifest.push({theme,cue,source:`source/${source}.ogg`,file:relative,duration_ms:Math.round(samples.length/22.05),sha256:createHash('sha256').update(wav).digest('hex'),source_sha256:createHash('sha256').update(original).digest('hex')});
 }
 writeFileSync(join(sounds,'manifest.json'),JSON.stringify({source:'https://kenney.nl/assets/interface-sounds',license:'CC0-1.0',sample_rate:22050,channels:1,bits:16,processing:'trim silence; resample; soft lowpass 2800Hz; normalize gain; fade in 5ms/out 40ms; cap 850ms',sounds:manifest},null,2)+'\n');
 console.log(JSON.stringify(manifest.map(({theme,cue,duration_ms})=>({theme,cue,duration_ms}))));
}finally{await browser.close();}
