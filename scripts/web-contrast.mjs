// Sample the actual composited background under representative text in Edge.
// Python/Pillow are development-only; screenshots are never product assets.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';

export async function checkContrast(page,output,name,selectors){
 if(process.env.WORKMEMO_CONTRAST!=='1')return;
 await page.waitForTimeout(450);
 const samples=await page.evaluate(selectors=>{
  window.contrastStyles=[];
  const nodes=new Set();
  const samples=selectors.flatMap(selector=>[...document.querySelectorAll(selector)].flatMap(el=>{
   const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
   if(el.closest('[inert]')||!rect.width||!rect.height||rect.top<0||rect.bottom>innerHeight||rect.left<0||rect.right>innerWidth)return [];
   const atCenter=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
   if(atCenter!==el&&!el.contains(atCenter))return [];
   const color=style.color.match(/[\d.]+/g)?.map(Number);
   if(!color||!el.textContent?.trim())return [];
   const sample={selector,text:el.textContent.trim().slice(0,80),color,x:Math.floor(rect.left+rect.width/2),y:Math.floor(rect.top+rect.height/2)};
   for(const node of [el,...el.querySelectorAll('*')])nodes.add(node);
   return [sample];
  }));
  for(const node of nodes){
   window.contrastStyles.push([node,node.getAttribute('style')]);
   node.style.setProperty('color','transparent','important');
  }
  return samples;
 },selectors);
 const path=fileURLToPath(new URL(`contrast-${name}.png`,output));
 try{await page.screenshot({path,animations:'disabled'});}
 finally{await page.evaluate(()=>{for(const [el,style] of window.contrastStyles.reverse())if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);delete window.contrastStyles;});}
 const measured=spawnSync('python',['-c',`
import json,sys
from PIL import Image
image=Image.open(sys.argv[1]).convert('RGB')
def luminance(rgb):
 c=[v/255 for v in rgb]
 c=[v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4 for v in c]
 return sum(a*b for a,b in zip(c,[.2126,.7152,.0722]))
samples=json.load(sys.stdin)
for row in samples:
 bg=image.getpixel((row['x'],row['y']))
 alpha=row['color'][3] if len(row['color'])>3 else 1
 fg=[row['color'][i]*alpha+bg[i]*(1-alpha) for i in range(3)]
 a,b=sorted([luminance(fg),luminance(bg)])
 row['background']=bg
 row['ratio']=round((b+.05)/(a+.05),3)
print(json.dumps(samples,ensure_ascii=False))
 `,path],{input:JSON.stringify(samples),encoding:'utf8'});
 assert.equal(measured.status,0,measured.stderr);
 const report=JSON.parse(measured.stdout);
 await writeFile(new URL(`contrast-${name}.json`,output),JSON.stringify(report,null,2));
 assert.ok(report.length>0,`No contrast samples for ${name}`);
 for(const sample of report)assert.ok(sample.ratio>=4.5,`${name}: ${sample.selector} ${sample.text} contrast ${sample.ratio}`);
 return {samples:report.length,minimum:Math.min(...report.map(s=>s.ratio))};
}
