// The two generated 3D portraits use separate chroma regions for editable equipment.
// Recolor only cap/frame material, preserving skin, blue lenses, highlights and alpha.
const sources=new Map(),portraits=new Map();
function imageFor(style){
  const key=style==='female'?'female':'male';
  if(!sources.has(key))sources.set(key,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{sources.delete(key);reject(Error('Portrait indisponible'))};image.src=new URL('./assets/v22/swimmer-'+key+'.png',import.meta.url).href}));
  return sources.get(key);
}
function hsv(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d)h=max===r?((g-b)/d+6)%6:max===g?(b-r)/d+2:(r-g)/d+4;return[h*60,max?d/max:0,max]}
function rgb(h,s,v){const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c,p=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return p.map(n=>Math.round((n+m)*255))}
function target(hex){const safe=/^#[0-9a-f]{6}$/i.test(hex)?hex:'#35bde4';return hsv(parseInt(safe.slice(1,3),16),parseInt(safe.slice(3,5),16),parseInt(safe.slice(5,7),16))}
export async function swimmerPortrait(profile={}){
  const style=profile.style==='female'?'female':'male',cap=profile.cap||'#35bde4',goggles=profile.goggles||'#173c55',key=[style,cap,goggles].join(':');
  if(portraits.has(key))return portraits.get(key);
  const promise=(async()=>{const image=await imageFor(style),canvas=document.createElement('canvas');canvas.width=384;canvas.height=Math.round(384*image.naturalHeight/image.naturalWidth);const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),data=pixels.data,capTone=target(cap),goggleTone=target(goggles);
    for(let i=0;i<data.length;i+=4){if(data[i+3]===0)continue;const y=Math.floor(i/4/canvas.width)/canvas.height;if(y>.47)continue;const[h,s,v]=hsv(data[i],data[i+1],data[i+2]);let tone;if(h>275&&h<335&&s>.15)tone=capTone;else if(y>.20&&h>65&&h<155&&s>.25)tone=goggleTone;if(!tone)continue;const color=rgb(tone[0],tone[1]*Math.min(1,s/.8),v*Math.max(.20,tone[2]));data[i]=color[0];data[i+1]=color[1];data[i+2]=color[2]}
    ctx.putImageData(pixels,0,0);const url=canvas.toDataURL('image/png');canvas.width=canvas.height=0;return url})();
  portraits.set(key,promise);if(portraits.size>70)portraits.delete(portraits.keys().next().value);
  try{return await promise}catch(error){portraits.delete(key);throw error}
}
