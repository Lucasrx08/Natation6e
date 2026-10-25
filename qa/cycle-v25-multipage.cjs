// A rubric with two different criteria on each page must keep both pages for each pupil.
const{chromium}=require('playwright'),{spawn,execFileSync}=require('child_process'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');let browser;const root=path.resolve(__dirname,'..'),server=spawn('python3',['-m','http.server','8827','--directory',root],{stdio:'ignore'});
(async()=>{
 const{defaultRubric}=await import('../cycle-model-v25.js');const config=defaultRubric();
 execFileSync('python3',['-c',`import sys,json
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import simpleSplit
cfg=json.loads(sys.argv[1]);pdfmetrics.registerFont(TTFont('QA','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'));pdfmetrics.registerFont(TTFont('QAB','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
w,h=841.89,595.28;c=canvas.Canvas('/tmp/v25-source-two-pages.pdf',pagesize=(w,h));left=146;cw=(w-left)/4;rh=(h-65)/2
for part in range(2):
 c.setFont('QA',8);c.drawString(10,h-12,'PAGE FICTIVE '+str(part+1))
 for j,level in enumerate([1,2,3,4]):
  x=left+j*cw;c.setFont('QAB',11);c.drawCentredString(x+cw/2,h-30,'NIVEAU '+str(level));c.setFont('QA',9);c.drawCentredString(x+cw/2,h-48,str(level)+' points')
 for i,criterion in enumerate(cfg['criteria'][part*2:(part+1)*2]):
  y=h-65-i*rh;c.setFont('QAB',11);c.drawCentredString(left/2,y-rh/2+10,criterion['label'].upper());c.setFont('QA',8);c.drawRightString(left-12,y-rh+8,str(criterion['weight'])+' %')
  for j,level in enumerate([1,2,3,4]):
   x=left+j*cw;c.rect(x,y-rh,cw-2,rh-2,fill=0,stroke=1);c.setFont('QA',9)
   for line_no,line in enumerate(simpleSplit(criterion['descriptions'][level-1],'QA',9,cw-17)):c.drawString(x+7,y-18-line_no*11,line)
 c.showPage()
c.save()`,JSON.stringify(config)]);
 browser=await chromium.launch({executablePath:'/tmp/chromium',args:['--no-sandbox']});const page=await browser.newPage();await page.goto('http://localhost:8827');await page.locator('.app-v25').waitFor();
 const result=await page.evaluate(async({bytes,config})=>{const m=await import('./cycle-documents-v25.js'),asset=await m.inspectPDF(new File([new Uint8Array(bytes)],'Grille deux pages.pdf',{type:'application/pdf'})),parsed=m.rubricFromPDF(asset,config);await m.documentStore('put',asset.key,asset);const rubric={...parsed.config,confirmed:true},cl={name:'6e Fictive',rubric},aq=Object.fromEntries(['aq-entry','aq-outward','aq-return','aq-ring','aq-upright','aq-star'].map(id=>[id,4])),students=[{name:'EXEMPLE Adam',rubricLevels:{dive:4,balance:4,propulsion:4,breathing:4},aquaticLevels:aq},{name:'FICTIF Camille',rubricLevels:{dive:4,balance:4,propulsion:4,breathing:2},aquaticLevels:aq}];return {count:rubric.criteria.length,ids:rubric.criteria.map(c=>c.id),bytes:Array.from(await m.evaluationPDF({cl,students,config:rubric,fullName:s=>s}))}}, {bytes:[...fs.readFileSync('/tmp/v25-source-two-pages.pdf')],config});
 assert.equal(result.count,4);assert.deepEqual(result.ids,['dive','balance','propulsion','breathing']);fs.writeFileSync('/tmp/v25-two-page-evaluations.pdf',Buffer.from(result.bytes));const data=JSON.parse(execFileSync('python3',['-c',"import json;from pypdf import PdfReader;r=PdfReader('/tmp/v25-two-page-evaluations.pdf');print(json.dumps({'count':len(r.pages),'text':[p.extract_text() for p in r.pages]}))"],{encoding:'utf8'}));assert.equal(data.count,4);assert.ok(data.text[0].includes('PAGE FICTIVE 1'));assert.ok(data.text[1].includes('PAGE FICTIVE 2'));assert.ok(data.text[2].includes('PAGE FICTIVE 1'));assert.ok(data.text[3].includes('PAGE FICTIVE 2'));assert.ok(data.text[0].includes('EXEMPLE Adam'));assert.ok(data.text[1].includes('EXEMPLE Adam'));assert.ok(data.text[2].includes('FICTIF Camille'));assert.ok(data.text[3].includes('18,67'));console.log('PASS real two-page rubric import: four criteria/IDs, all source pages and linked scores retained for each pupil');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.kill()});
