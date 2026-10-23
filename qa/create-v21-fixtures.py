"""Synthetic QA documents only. These are never shipped as school templates."""
import json,subprocess,textwrap
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import simpleSplit
root=Path(__file__).resolve().parent.parent
out=Path('/tmp/natation-v21-fixtures');out.mkdir(exist_ok=True)
source=(root/'cycle-model-v21.js').read_text().replace('export const','const').replace('export ','')
config=json.loads(subprocess.check_output(['node','-e',source+';process.stdout.write(JSON.stringify(defaultRubric()))']))
for n,f in [('QA','DejaVuSans.ttf'),('QAB','DejaVuSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(n,'/usr/share/fonts/truetype/dejavu/'+f))
w,h=841.89,595.28
c=canvas.Canvas(str(out/'rubric.pdf'),pagesize=(w,h));c.setTitle('Grille iDoceo de contrôle')
left=146;cw=(w-left)/4;top=h-16;rh=(h-65)/4
for j,level in enumerate([4,3,2,1]):
    x=left+j*cw;c.setFillColor(HexColor(['#c8e1b9','#ffe5a6','#f7c695','#f87c94'][j]));c.rect(x,h-60,cw-2,50,fill=1,stroke=0);c.setFillColor(HexColor('#173d55'));c.setFont('QAB',11);c.drawCentredString(x+cw/2,h-30,'NIVEAU '+str(level));c.setFont('QA',9);c.drawCentredString(x+cw/2,h-48,str(level)+' points')
for i,criterion in enumerate(config['criteria']):
    y=h-65-i*rh;c.setFillColor(HexColor('#edf5f9'));c.rect(3,y-rh,left-6,rh-2,fill=1,stroke=0);c.setFillColor(HexColor('#173d55'));c.setFont('QAB',11);c.drawCentredString(left/2,y-rh/2+10,criterion['label'].upper());c.setFont('QA',8);c.drawCentredString(left/2,y-rh/2-8,'CG 2-2 Apprendre et progresser');c.drawRightString(left-12,y-rh+8,str(criterion['weight'])+' %')
    for j,level in enumerate([4,3,2,1]):
        x=left+j*cw;c.setStrokeColor(HexColor('#cddde6'));c.rect(x,y-rh,cw-2,rh-2,fill=0,stroke=1);c.setFont('QA',9)
        for line_no,line in enumerate(simpleSplit(criterion['descriptions'][level-1],'QA',9,cw-17)):c.drawString(x+7,y-18-line_no*11,line)
c.showPage();c.save()
for form in [False,True]:
    c=canvas.Canvas(str(out/('diploma-form.pdf' if form else 'diploma.pdf')),pagesize=(w,h));c.setTitle('Modèle diplôme de contrôle');c.setFillColor(HexColor('#153d56'));c.rect(15,15,w-30,h-30,fill=0,stroke=1);c.setFont('QAB',28);c.drawCentredString(w/2,h-80,'BRAVO !');c.setFont('QA',20);c.drawCentredString(w/2,h-120,'Mon diplôme du savoir-nager')
    if form:
        for name,y in [('Nom',300),('Prenom',250),('Classe',185),('Date',125)]:c.acroForm.textfield(name=name,x=150,y=y,width=540,height=32,fontSize=20,borderWidth=0,fillColor=HexColor('#ffffff'),textColor=HexColor('#153d56'))
    c.showPage();c.save()
c=canvas.Canvas(str(out/'unreadable.pdf'),pagesize=(w,h));c.drawString(30,500,'Document sans grille de niveaux.');c.showPage();c.save()
from pypdf import PdfReader,PdfWriter,Transformation
from pypdf.generic import RectangleObject
for filename in ['rubric','diploma']:
    page=PdfReader(out/(filename+'.pdf')).pages[0]
    page.add_transformation(Transformation().rotate(90).translate(tx=h,ty=0));page.mediabox=RectangleObject([0,0,h,w]);page.rotate(90)
    writer=PdfWriter();writer.add_page(page)
    with (out/(filename+'-rotated.pdf')).open('wb') as stream:writer.write(stream)
print(out)
