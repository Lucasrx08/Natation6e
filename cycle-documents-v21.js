import {rubricGrade,remapRubricIds,rubricValid} from './cycle-model-v21.js';

const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const colorHex=['#f87c94','#f7c695','#ffe5a6','#c8e1b9'];
let readerPromise,writerPromise,fontkitPromise;
const fontBytes=new Map();
const pdfCache=new Map();
export async function pdfReader(){
  readerPromise??=import('./vendor/pdfjs-5.6.205.min.mjs').then(m=>{m.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdfjs-worker-5.6.205.min.mjs',import.meta.url).href;return m});
  return readerPromise;
}
export async function pdfWriter(){return writerPromise??=import('./vendor/pdf-lib-1.17.1.min.mjs')}
async function textFont(doc,face='Helvetica-Bold'){
  const kit=await(fontkitPromise??=import('./vendor/fontkit-1.1.1.min.js').then(()=>globalThis.fontkit));doc.registerFontkit(kit);
  const filename=face==='TimesRoman'?'DejaVuSerif.ttf':face==='Helvetica'?'LiberationSans-Regular.ttf':'LiberationSans-Bold.ttf';
  if(!fontBytes.has(filename))fontBytes.set(filename,fetch(new URL('./vendor/standard_fonts/'+filename,import.meta.url)).then(async response=>{if(!response.ok)throw Error('La typographie du PDF n’est pas disponible.');return new Uint8Array(await response.arrayBuffer())}));
  return doc.embedFont(await fontBytes.get(filename),{subset:true});
}
export async function documentStore(action,key,value){
  const db=await new Promise((resolve,reject)=>{const req=indexedDB.open('natation-documents',1);req.onupgradeneeded=()=>req.result.createObjectStore('assets');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
  try{return await new Promise((resolve,reject)=>{const tx=db.transaction('assets',action==='get'?'readonly':'readwrite'),store=tx.objectStore('assets'),req=action==='get'?store.get(key):action==='put'?store.put(value,key):store.delete(key);let result;req.onsuccess=()=>{result=req.result};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}finally{db.close()}
}
export async function pdfDocument(asset){
  const bytes=asset.bytes||asset,key=asset.key||'memory-'+bytes.length+'-'+Array.from(bytes.slice(0,40)).join('.');
  if(pdfCache.has(key))return pdfCache.get(key);
  const promise=pdfReader().then(m=>m.getDocument({data:new Uint8Array(bytes),isEvalSupported:false,useSystemFonts:false,standardFontDataUrl:new URL('./vendor/standard_fonts/',import.meta.url).href,wasmUrl:new URL('./vendor/wasm/',import.meta.url).href}).promise);
  pdfCache.set(key,promise);
  try{const result=await promise;if(pdfCache.size>4){const oldest=pdfCache.keys().next().value;if(oldest!==key){const expired=pdfCache.get(oldest);pdfCache.delete(oldest);expired.then(doc=>doc.destroy()).catch(()=>{})}}return result}catch(error){pdfCache.delete(key);throw error}
}
export async function inspectPDF(file){
  if(file.size>20*1024*1024)throw Error('Choisis un PDF de moins de 20 Mo.');
  if(await file.slice(0,5).text()!=='%PDF-')throw Error('Ce fichier n’est pas un PDF.');
  const asset={key:'pdf-'+crypto.randomUUID(),name:file.name,bytes:new Uint8Array(await file.arrayBuffer())},doc=await pdfDocument(asset),pages=[];
  if(doc.numPages>12)throw Error('Choisis le document de diplôme ou de grille seul (12 pages maximum).');
  for(let i=1;i<=doc.numPages;i++){
    const page=await doc.getPage(i),viewport=page.getViewport({scale:1}),content=await page.getTextContent();
    pages.push({width:viewport.width,height:viewport.height,rotation:page.rotate,items:content.items.filter(x=>x.str?.trim()).map(item=>{
      const[a,b,c,d,x,y]=item.transform,base=Math.hypot(a,b)||1,up=Math.hypot(c,d)||1,height=item.height||up,dx=a/base*item.width,dy=b/base*item.width,ux=c/up*height,uy=d/up*height;
      const corners=[[x,y],[x+dx,y+dy],[x+ux,y+uy],[x+dx+ux,y+dy+uy]].map(([px,py])=>viewport.convertToViewportPoint(px,py)),xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]);
      return{text:item.str.trim(),x:Math.min(...xs),top:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)||10};
    })});
  }
  return {...asset,pages};
}
export async function previewPDF(asset,pageNumber=0,maxWidth=1000){
  const doc=await pdfDocument(asset),page=await doc.getPage(pageNumber+1),original=page.getViewport({scale:1}),scale=maxWidth/original.width,viewport=page.getViewport({scale}),canvas=document.createElement('canvas');
  canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
  await page.render({canvasContext:canvas.getContext('2d'),viewport,background:'rgb(255,255,255)'}).promise;
  const result={url:canvas.toDataURL('image/png'),width:original.width,height:original.height};canvas.width=canvas.height=0;return result;
}
function textLines(items){
  const lines=[];
  for(const item of [...items].sort((a,b)=>a.top-b.top||a.x-b.x)){
    let line=lines.find(l=>Math.abs(l.top-item.top)<Math.max(2.5,Math.min(item.height,l.height)*.35));
    if(!line){line={top:item.top,height:item.height,items:[]};lines.push(line)}line.items.push(item);
  }
  return lines.sort((a,b)=>a.top-b.top).map(l=>({...l,items:l.items.sort((a,b)=>a.x-b.x),text:l.items.sort((a,b)=>a.x-b.x).map(x=>x.text).join(' ')}));
}
function joined(items){return textLines(items).map(l=>l.text).join(' ').replace(/\s+/g,' ').trim()}
function weightValue(value){const m=String(value??'').replace(',','.').match(/\d+(?:\.\d+)?/);return m&&Number(m[0])>0?Number(m[0]):null}
export function rubricFromPDF(asset,previous){
  const criteria=[],notes=[];let points=null;
  for(let pageIndex=0;pageIndex<asset.pages.length;pageIndex++){
    const page=asset.pages[pageIndex],items=page.items,lines=textLines(items),candidates=[];
    for(const line of lines){
      const headers=[];
      for(let i=0;i<line.items.length;i++){
        const item=line.items[i];let match=item.text.match(/^NIVEAU\s*([1-4])\s*$/i),level=match?Number(match[1]):null;
        if(!level&&/^NIVEAU$/i.test(item.text)&&/^[1-4]$/.test(line.items[i+1]?.text||'')){level=Number(line.items[i+1].text);headers.push({level,center:(item.x+line.items[i+1].x+line.items[i+1].width)/2});continue}
        if(level)headers.push({level,center:item.x+item.width/2});
      }
      if(new Set(headers.map(h=>h.level)).size===4)candidates.push({...line,headers});
    }
    if(!candidates.length)continue;
    const header=candidates[0],cols=[...header.headers].sort((a,b)=>a.center-b.center),gap=(cols[3].center-cols[0].center)/3;
    const boundaries=[Math.max(0,cols[0].center-gap/2),...cols.slice(0,3).map((c,i)=>(c.center+cols[i+1].center)/2),Math.min(page.width,cols[3].center+gap/2)];
    let headerBottom=header.top+header.height;
    const pagePoints=Array(4).fill(null);
    for(let col=0;col<4;col++){
      const item=items.find(x=>x.x+x.width/2>=boundaries[col]&&x.x+x.width/2<boundaries[col+1]&&x.top>=header.top+header.height-2&&x.top<header.top+header.height+27&&/^\d+(?:[.,]\d+)?\s*(?:points?|pts?)?$/i.test(x.text));
      if(item){pagePoints[cols[col].level-1]=Number(item.text.match(/^\d+(?:[.,]\d+)?/)[0].replace(',','.'));headerBottom=Math.max(headerBottom,item.top+item.height)}
    }
    if(pagePoints.every(x=>Number.isFinite(x)&&x!==null))points=pagePoints;
    const left=items.filter(x=>x.x+x.width/2<boundaries[0]&&x.top>headerBottom),leftLines=textLines(left);
    const percentLines=leftLines.filter(l=>/^\d+(?:[.,]\d+)?\s*%$/.test(l.text.trim()));
    const labels=leftLines.filter(l=>l.text.length>2&&l.text===l.text.toLocaleUpperCase('fr')&&/[A-ZÀ-ÖØ-Þ]/.test(l.text)&&!/^CG\s*\d|^NIVEAU|^NOM\b|^CLASSE\b/.test(l.text)&&!/%/.test(l.text));
    const grouped=[];
    for(const line of labels){const last=grouped.at(-1);if(last&&line.top-last.bottom<line.height*.7){last.text+=' '+line.text;last.bottom=line.top+line.height}else grouped.push({text:line.text,top:line.top,bottom:line.top+line.height})}
    for(let i=0;i<grouped.length;i++){
      const label=grouped[i],next=grouped[i+1],weight=percentLines.find(l=>l.top>label.top&&(!next||l.top<next.top)),previousWeight=i?percentLines.find(l=>l.top>grouped[i-1].top&&l.top<label.top):null;
      const top=i===0?headerBottom+6:previousWeight?previousWeight.top+previousWeight.height+4:(grouped[i-1].bottom+label.top)/2;
      const bottom=weight?weight.top+weight.height+4:next?(label.bottom+next.top)/2:page.height-12;
      const descriptions=Array(4).fill(''),sourceCells=Array(4);
      for(let col=0;col<4;col++){
        const selected=items.filter(x=>x.x+x.width/2>=boundaries[col]&&x.x+x.width/2<boundaries[col+1]&&x.top>=top-2&&x.top<bottom);
        descriptions[cols[col].level-1]=joined(selected).replace(/^NIVEAU\s*[1-4]\s*[-–—:]?\s*/i,'');
        sourceCells[cols[col].level-1]={page:pageIndex,x:boundaries[col]/page.width,top:top/page.height,width:(boundaries[col+1]-boundaries[col])/page.width,height:(bottom-top)/page.height};
      }
      if(descriptions.some(x=>!x))continue;
      if(!weight)notes.push('Coefficient à vérifier : '+label.text);
      criteria.push({id:'row-'+pageIndex+'-'+i,label:label.text.charAt(0)+label.text.slice(1).toLocaleLowerCase('fr'),weight:weightValue(weight?.text)||1,descriptions,sourceCells});
    }
  }
  if(!criteria.length)throw Error('Je ne retrouve pas les quatre colonnes de niveaux dans ce PDF. Choisis un export PDF avec du texte sélectionnable ou un fichier Excel de la grille.');
  if(!points)notes.push('Points par niveau à vérifier : les valeurs du barème actuel ont été reprises.');
  const config=remapRubricIds({title:'Évaluation démonstration de nage',confirmed:false,points:points||previous?.points||[1,2,3,4],criteria,source:{key:asset.key,name:asset.name,kind:'pdf'}},previous);
  if(!rubricValid({...config,confirmed:true}))throw Error('La grille lue contient un critère vide ou en double. Vérifie le PDF ou utilise son export Excel.');
  return {config,notes};
}
export function rubricFromRows(rows,name,previous){
  let headerIndex=-1,levels=[],bestScore=-1;
  for(let i=0;i<Math.min(rows.length,30);i++){
    const found=rows[i].map((v,col)=>{const m=String(v??'').match(/^(?:NIVEAU\s*|N\s*)?([1-4])\s*$/i);return m?{level:Number(m[1]),col}:null}).filter(Boolean);
    if(new Set(found.map(x=>x.level)).size===4){const score=rows[i].filter(v=>/^(?:niveau|n)\s*[1-4]$/i.test(String(v))).length*20+rows[i].filter(v=>/critere|competence|coef|poids/.test(norm(v))).length*10;if(score>bestScore){headerIndex=i;levels=found;bestScore=score}}
  }
  if(headerIndex<0)throw Error('L’Excel doit contenir une colonne Critère et les colonnes Niveau 1 à Niveau 4.');
  const header=rows[headerIndex],weightCol=header.findIndex(v=>/%/.test(String(v))||/coef|poids|ponderation/.test(norm(v))),labelCol=header.findIndex((v,i)=>!levels.some(l=>l.col===i)&&i!==weightCol&&/critere|competence|atelier|evaluation/.test(norm(v))),nameCol=labelCol>=0?labelCol:header.findIndex((_,i)=>!levels.some(l=>l.col===i)&&i!==weightCol);
  const criteria=[],notes=[];let points=previous?.points||[1,2,3,4];
  for(const row of rows.slice(0,headerIndex)){if(/^(points?|bareme|note)$/.test(norm(row[0]))){const numeric=row.slice(1).filter(v=>v!==''&&v!==null&&v!==undefined).map(v=>Number(String(v).replace(',','.')));if(numeric.length===4&&numeric.every(Number.isFinite))points=numeric}}
  for(const row of rows.slice(headerIndex+1)){
    const label=String(row[nameCol]??'').trim();if(!label)continue;
    if(/^(points?|bareme|note)$/.test(norm(label))){const p=Array(4);for(const l of levels)p[l.level-1]=Number(String(row[l.col]).replace(',','.'));if(p.every(Number.isFinite))points=p;continue}
    const descriptions=Array(4);for(const l of levels)descriptions[l.level-1]=String(row[l.col]??'').trim();if(descriptions.some(x=>!x))continue;
    const weight=weightValue(row[weightCol]);if(!weight)notes.push('Coefficient à vérifier : '+label);
    criteria.push({id:'row-'+criteria.length,label,weight:weight||1,descriptions});
  }
  const config=remapRubricIds({title:'Évaluation démonstration de nage',confirmed:false,points,criteria,source:{name,kind:'excel'}},previous);
  if(!rubricValid(config))throw Error('La grille Excel ne contient pas de critères complets et distincts avec quatre niveaux.');
  return {config,notes};
}
export function downloadBytes(bytes,name,type='application/pdf'){
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'})),link=document.createElement('a');link.href=url;link.download=name;link.target='_blank';link.rel='noopener';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function printPDF(bytes){
  const doc=await pdfDocument({key:'print-'+crypto.randomUUID(),bytes}),images=[];
  for(let i=1;i<=doc.numPages;i++){
    const page=await doc.getPage(i),base=page.getViewport({scale:1}),viewport=page.getViewport({scale:1.4}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    await page.render({canvasContext:canvas.getContext('2d'),viewport,background:'rgb(255,255,255)'}).promise;
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));images.push({url:URL.createObjectURL(blob),width:base.width,height:base.height});canvas.width=canvas.height=0;
  }
  const first=images[0],frame=document.createElement('iframe');frame.title='Impression de la classe';frame.style.cssText='position:fixed;left:-10000px;width:1px;height:1px;border:0';document.body.appendChild(frame);
  const clean=()=>{images.forEach(x=>URL.revokeObjectURL(x.url));frame.remove()};
  return new Promise((resolve,reject)=>{frame.onload=async()=>{try{await Promise.all([...frame.contentDocument.images].map(im=>im.decode()));frame.contentWindow.addEventListener('afterprint',clean,{once:true});frame.contentWindow.focus();frame.contentWindow.print();resolve(images.length);setTimeout(clean,300000)}catch(e){clean();reject(e)}};frame.srcdoc=`<!doctype html><html lang="fr"><meta charset="utf-8"><title>Impressions natation</title><style>@page{size:${first.width}pt ${first.height}pt;margin:0}html,body{padding:0;margin:0}.page{break-after:page;page-break-after:always;line-height:0}.page:last-child{break-after:auto;page-break-after:auto}img{display:block;width:100%;height:auto}*{box-sizing:border-box}</style><body>${images.map(x=>`<section class="page" style="width:${x.width}pt;height:${x.height}pt"><img src="${escapeHTML(x.url)}"></section>`).join('')}</body></html>`});
}
function pdfColor(lib,hex){const v=/^#[0-9a-f]{6}$/i.test(hex)?hex:'#153d56';return lib.rgb(parseInt(v.slice(1,3),16)/255,parseInt(v.slice(3,5),16)/255,parseInt(v.slice(5,7),16)/255)}
function wrapPDF(text,font,size,width){const lines=[];let line='';for(const word of String(text).split(/\s+/)){if(line&&font.widthOfTextAtSize(line+' '+word,size)>width){lines.push(line);line=word}else line+=(line?' ':'')+word}if(line)lines.push(line);return lines}
function drawFit(page,text,x,y,width,size,font,color){while(size>7&&font.widthOfTextAtSize(String(text),size)>width)size-=.5;page.drawText(String(text),{x,y,size,font,color});return size}
function drawParagraph(page,text,{x,y,width,height,font,maxSize=11,color}){let size=maxSize,lines=wrapPDF(text,font,size,width);while(size>6.5&&lines.length*size*1.25>height){size-=.25;lines=wrapPDF(text,font,size,width)}for(let i=0;i<lines.length;i++)page.drawText(lines[i],{x,y:y-i*size*1.25,size,font,color})}
export async function evaluationPDF({cl,students,config,fullName,blank=false}){
  const lib=await pdfWriter(),out=await lib.PDFDocument.create(),font=await textFont(out,'Helvetica'),bold=await textFont(out),ink=pdfColor(lib,'#153d56'),pupils=blank?[{name:'',rubricLevels:{}}]:students;
  const asset=config.source?.kind==='pdf'?await documentStore('get',config.source.key):null;
  const embedded=asset?await out.embedPdf(asset.bytes):null;
  for(const p of pupils){
    const grade=blank?null:rubricGrade(p,config),name=blank?'Nom Prénom : ........................................................':fullName(p.name);
    if(embedded){for(let index=0;index<embedded.length;index++){
      const original=embedded[index],rotation=((asset.pages[index]?.rotation||0)%360+360)%360,w=rotation%180?original.height:original.width,h=rotation%180?original.width:original.height,page=out.addPage([w,h+52]);
      page.drawPage(original,{x:rotation===180||rotation===270?w:0,y:rotation===90||rotation===180?h:0,width:original.width,height:original.height,rotate:lib.degrees(-rotation)});
      drawFit(page,name,18,h+31,w-170,14,bold,ink);drawFit(page,blank?'Classe : .........................':'Classe : '+cl.name,18,h+13,w-170,10,font,ink);page.drawText(grade===null?'— / 20':String(grade).replace('.',',')+' / 20',{x:w-128,y:h+25,size:18,font:bold,color:ink});
      if(!blank)for(const c of config.criteria){const level=p.rubricLevels?.[c.id],r=c.sourceCells?.[level-1];if(!r||r.page!==index)continue;page.drawRectangle({x:r.x*w+1,y:h-(r.top+r.height)*h+1,width:r.width*w-2,height:r.height*h-2,color:pdfColor(lib,colorHex[level-1]),opacity:.16,borderColor:pdfColor(lib,'#077d99'),borderWidth:2});}
    }}else{
      const w=841.89,h=595.28,page=out.addPage([w,h]);page.drawRectangle({x:0,y:0,width:w,height:h,color:pdfColor(lib,'#f2f8fb')});page.drawRectangle({x:18,y:h-76,width:w-36,height:58,color:pdfColor(lib,'#143e5a')});
      page.drawText('ÉVALUATION DÉMONSTRATION DE NAGE',{x:31,y:h-41,size:17,font:bold,color:lib.rgb(1,1,1)});drawFit(page,name+'   ·   '+(blank?'Classe : ...............':cl.name),31,h-62,w-180,11,font,lib.rgb(1,1,1));page.drawText(grade===null?'— / 20':String(grade).replace('.',',')+' / 20',{x:w-125,y:h-61,size:16,font:bold,color:lib.rgb(1,1,1)});
      const left=18,top=h-91,col0=108,cw=(w-36-col0)/4,head=33,rowh=(h-121-28)/config.criteria.length;
      page.drawRectangle({x:left,y:top-head,width:col0,height:head,color:pdfColor(lib,'#dcecf4')});page.drawText('CRITÈRE',{x:left+9,y:top-22,size:9,font:bold,color:ink});
      for(let level=1;level<=4;level++){const x=left+col0+(level-1)*cw;page.drawRectangle({x,y:top-head,width:cw,height:head,color:pdfColor(lib,colorHex[level-1])});page.drawText('NIVEAU '+level+'  ·  '+config.points[level-1]+' pts',{x:x+10,y:top-22,size:9,font:bold,color:ink});}
      for(let i=0;i<config.criteria.length;i++){
        const c=config.criteria[i],y=top-head-i*rowh;page.drawRectangle({x:left,y:y-rowh,width:col0,height:rowh,color:pdfColor(lib,'#e7f1f7'),borderColor:lib.rgb(.78,.86,.9),borderWidth:.5});drawParagraph(page,c.label,{x:left+9,y:y-20,width:col0-18,height:rowh-35,font:bold,maxSize:11,color:ink});page.drawText('Coef. '+c.weight,{x:left+9,y:y-rowh+12,size:8,font,color:ink});
        for(let j=0;j<4;j++){const x=left+col0+j*cw,selected=!blank&&p.rubricLevels?.[c.id]===j+1;page.drawRectangle({x,y:y-rowh,width:cw,height:rowh,color:selected?pdfColor(lib,colorHex[j]):lib.rgb(1,1,1),borderColor:selected?pdfColor(lib,'#077d99'):lib.rgb(.78,.86,.9),borderWidth:selected?2:.5});drawParagraph(page,c.descriptions[j],{x:x+9,y:y-17,width:cw-18,height:rowh-25,font,maxSize:10.5,color:ink});}
      }
    }
  }
  out.setTitle('Évaluation démonstration de nage - '+cl.name);return out.save();
}
export function defaultDiplomaLayout(){return {joined:false,font:'Helvetica-Bold',color:'#153d56',fields:[{role:'surname',x:.5,top:.46,size:28,page:0},{role:'givenName',x:.5,top:.54,size:25,page:0},{role:'className',x:.5,top:.66,size:16,page:0}]}}
export async function diplomaFormFields(asset){const lib=await pdfWriter(),doc=await lib.PDFDocument.load(asset.bytes),form=doc.getForm();return form.getFields().filter(f=>typeof f.setText==='function').map(f=>({name:f.getName(),role:fieldRole(f.getName())})).filter(f=>f.role)}
export async function diplomaFormPreview(asset,values,layout){
  if(layout.useForm===false)return asset;
  const lib=await pdfWriter(),doc=await lib.PDFDocument.load(asset.bytes),form=doc.getForm();let filled=false;
  for(const field of form.getFields()){const role=fieldRole(field.getName());if(role&&typeof field.setText==='function'){field.setText(values[role]||'');filled=true}}
  if(!filled)return asset;
  form.updateFieldAppearances(await textFont(doc,layout.font));form.flatten();
  return {...asset,key:'preview-'+crypto.randomUUID(),bytes:await doc.save()};
}
function fieldRole(name){const n=norm(name);if(/nom.*prenom|prenom.*nom|nom complet|eleve/.test(n))return'fullName';if(/prenom/.test(n))return'givenName';if(/classe/.test(n))return'className';if(/nom/.test(n))return'surname';if(/date/.test(n))return'date';return null}
export async function diplomasPDF({cl,students,template,splitName,fullName}){
  if(!students.length)throw Error('Attribue au moins un diplôme pour lancer l’impression.');
  const lib=await pdfWriter(),out=await lib.PDFDocument.create(),ink=pdfColor(lib,'#143e5a'),gold=pdfColor(lib,'#c99e43');
  const font=await textFont(out,'Helvetica'),bold=await textFont(out);
  for(const p of students){
    const parts=splitName(p.name),values={surname:parts.surname,givenName:parts.givenName,fullName:fullName(p.name),className:cl.name,date:new Date((p.diploma?.date||new Date().toISOString().slice(0,10))+'T12:00:00').toLocaleDateString('fr-FR')};
    if(template?.bytes){
      const source=await lib.PDFDocument.load(template.bytes),form=source.getForm(),matched=new Set(),layout=template.layout||defaultDiplomaLayout(),sourceFont=await textFont(source,layout.font);
      for(const f of form.getFields()){const role=fieldRole(f.getName());if(layout.useForm!==false&&role&&typeof f.setText==='function'){f.setText(values[role]);matched.add(role)}}
      if(form.getFields().length){if(matched.size)form.updateFieldAppearances(sourceFont);form.flatten()}
      for(const field of layout.fields){
        const role=layout.joined&&field.role==='surname'?'fullName':field.role;if(layout.joined&&field.role==='givenName')continue;if(matched.has(role)||matched.has('fullName')&&['surname','givenName'].includes(role))continue;
        const page=source.getPage(Math.min(field.page||0,source.getPageCount()-1)),pw=page.getWidth(),ph=page.getHeight(),rotation=(page.getRotation().angle%360+360)%360,w=rotation%180?ph:pw,h=rotation%180?pw:ph,text=values[role]||'';let size=field.size||20;while(size>7&&sourceFont.widthOfTextAtSize(text,size)>w*.9)size-=.5;
        const tw=sourceFont.widthOfTextAtSize(text,size),u=Math.min(w-tw-4,Math.max(4,field.x*w-tw/2)),v=field.top*h+size,[x,y]=rotation===90?[v,u]:rotation===180?[pw-u,v]:rotation===270?[pw-v,ph-u]:[u,ph-v];
        page.drawText(text,{x,y,rotate:lib.degrees(rotation),size,font:sourceFont,color:pdfColor(lib,layout.color)});
      }
      const copies=await out.copyPages(source,source.getPageIndices());copies.forEach(page=>out.addPage(page));
    }else{
      const w=841.89,h=595.28,page=out.addPage([w,h]);page.drawRectangle({x:0,y:0,width:w,height:h,color:pdfColor(lib,'#f9fcfd')});page.drawRectangle({x:20,y:20,width:w-40,height:h-40,borderColor:ink,borderWidth:3});page.drawRectangle({x:30,y:30,width:w-60,height:h-60,borderColor:gold,borderWidth:1});
      page.drawCircle({x:w/2,y:h-99,size:34,color:ink});page.drawText('BRAVO !',{x:w/2-26,y:h-104,size:12,font:bold,color:lib.rgb(1,1,1)});
      for(const x of [w/2-65,w/2+65])page.drawText('*',{x:x-4,y:h-109,size:30,font:bold,color:gold});
      page.drawText('DIPLÔME DU SAVOIR-NAGER',{x:160,y:h-177,size:28,font:bold,color:ink});page.drawText('Le parcours est réussi !',{x:302,y:h-212,size:18,font,color:ink});
      let size=38;while(size>12&&bold.widthOfTextAtSize(values.fullName,size)>w-110)size-=.5;page.drawText(values.fullName,{x:(w-bold.widthOfTextAtSize(values.fullName,size))/2,y:279,size,font:bold,color:ink});
      const line='Classe '+cl.name;page.drawText(line,{x:(w-font.widthOfTextAtSize(line,17))/2,y:235,size:17,font,color:ink});page.drawText('Attribué le '+values.date,{x:85,y:107,size:12,font,color:ink});page.drawText('Signature de l’enseignant',{x:w-260,y:107,size:12,font,color:ink});page.drawLine({start:{x:w-260,y:78},end:{x:w-90,y:78},thickness:1,color:gold});
    }
  }
  out.setTitle('Diplômes savoir-nager - '+cl.name);return out.save();
}
