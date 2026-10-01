from pathlib import Path
import subprocess,json,io
import fitz
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader,simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
root=Path(__file__).resolve().parent.parent
x=(root/'natation-cycle-v15.js').read_text();literal=x[x.index('const WORKSHOPS=')+len('const WORKSHOPS='):x.index('const LEARNING_STATES=')].strip().rstrip(';');m=json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify('+literal+'))']))[0]
for name,f in [('D','DejaVuSans.ttf'),('DB','DejaVuSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+f))
W,H=841.89,595.28
c=canvas.Canvas(str(root/'fiches/floating.pdf'),pagesize=(W,H));c.setTitle('Flottaison • 5 niveaux');c.setAuthor('L. Rigaux • Natation 6e')
c.setFillColor(HexColor('#edf8fc'));c.rect(0,0,W,H,fill=1,stroke=0);c.setFillColor(HexColor('#103954'));c.roundRect(18,H-90,W-36,72,17,fill=1,stroke=0);c.setFillColor(HexColor('#7ce5ef'));c.setFont('DB',9);c.drawString(36,H-39,'NATATION 6e / POUVOIRS AQUATIQUES');c.setFillColor(HexColor('#ffffff'));c.setFont('DB',24);c.drawString(36,H-70,'Flottaison');c.setFont('D',10);c.drawRightString(W-36,H-43,'5 NIVEAUX • DEUX ROUGES, UN ORANGE, DEUX VERTS');c.setFont('D',9);c.drawRightString(W-36,H-65,'Validation professeur aux niveaux 3 et 5')
cw=(W-36-4*10)/5;top=H-103;bottom=62
for i,level in enumerate(m['levels']):
 left=18+i*(cw+10);tone=['#e84368','#e84368','#d89216','#14a472','#14a472'][i];bg=['#fff0f4','#fff0f4','#fff6e2','#e8fbf3','#e8fbf3'][i]
 c.setFillColor(HexColor('#c9e0e9'));c.roundRect(left,bottom-4,cw,top-bottom,12,fill=1,stroke=0);c.setFillColor(HexColor('#ffffff'));c.setStrokeColor(HexColor(tone));c.setLineWidth(1.4);c.roundRect(left,bottom,cw,top-bottom,12,fill=1,stroke=1)
 c.setFillColor(HexColor(tone));c.circle(left+22,top-23,13,fill=1,stroke=0);c.setFillColor(HexColor('#ffffff'));c.setFont('DB',12);c.drawCentredString(left+22,top-27,str(i+1));c.setFillColor(HexColor('#103954'));c.setFont('DB',9);c.drawString(left+42,top-19,'NIVEAU '+str(i+1));c.setFont('D',7);c.drawString(left+42,top-32,['Découverte','Découverte','Progression','Maîtrise','Maîtrise'][i])
 svg=fitz.open(str(root/m['levelImages'][i].removeprefix('./')));pix=svg.get_page_pixmap(0,matrix=fitz.Matrix(2,2));c.drawImage(ImageReader(io.BytesIO(pix.tobytes('png'))),left+5,top-151,cw-10,105,preserveAspectRatio=True,anchor='c',mask='auto');svg.close()
 yy=top-171;c.setFont('DB',10)
 for line in simpleSplit(level[0],'DB',10,cw-18):c.drawString(left+9,yy,line);yy-=12
 yy=top-208;c.setFont('DB',7);c.setFillColor(HexColor('#557286'));c.drawString(left+9,yy,'MA CONSIGNE');yy-=13;c.setFillColor(HexColor('#163c54'));c.setFont('D',7.6)
 lines=simpleSplit(level[1],'D',7.6,cw-18)
 for line in lines:c.drawString(left+9,yy,line);yy-=10.3
 assert yy>bottom+105,(i,yy)
 c.setFillColor(HexColor(bg));c.roundRect(left+7,bottom+26,cw-14,86,9,fill=1,stroke=0);c.setFillColor(HexColor('#103954'));c.setFont('DB',9);c.drawString(left+14,bottom+92,'Je réussis si…');yy=bottom+76;c.setFont('D',7.8)
 for line in simpleSplit(level[2],'D',7.8,cw-28):c.drawString(left+14,yy,line);yy-=11
 assert yy>bottom+29,(i,yy)
 c.setFont('DB',6.5);c.setFillColor(HexColor(tone));c.drawCentredString(left+cw/2,bottom+11,'VALIDATION PROFESSEUR' if i in [2,4] else 'BILAN ÉLÈVE')
c.setFillColor(HexColor('#365d74'));c.setFont('D',7.5);c.drawString(20,42,'Zone, matériel et signal : suis les indications du professeur. Les appuis et le redressement font partie des exercices.');c.setFont('DB',7);c.drawString(20,23,'APPLICATION EPS • LE BON SAUVEUR');c.drawRightString(W-20,23,'L. RIGAUX / FICHE FLOTTAISON');c.save()
print('Fiche flottaison A4 paysage : 5 niveaux illustrés')
