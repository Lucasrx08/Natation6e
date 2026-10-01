from pathlib import Path
import json,subprocess
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader,simpleSplit
root=Path(__file__).resolve().parent.parent;x=(root/'natation-cycle-v15.js').read_text();literal=x[x.index('const WORKSHOPS=')+len('const WORKSHOPS='):x.index('const LEARNING_STATES=')].strip().rstrip(';');mods=json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify('+literal+'))']))
for name,f in [('D','DejaVuSans.ttf'),('DB','DejaVuSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+f))

def demonstration(c,left,top,cw,kind):
 # Native vector diagrams for poses absent from the original swimmer assets.
 cx=left+cw/2;cy=top-96
 c.setLineCap(1);c.setLineJoin(1)
 def line(points,color='#e6b08a',width=7):
  c.setStrokeColor(HexColor(color));c.setLineWidth(width);path=c.beginPath();path.moveTo(*points[0])
  for point in points[1:]:path.lineTo(*point)
  c.drawPath(path)
 def head(px,py):
  c.setFillColor(HexColor('#e6b08a'));c.circle(px,py,9,fill=1,stroke=0)
  c.setFillColor(HexColor('#f05a65'));c.wedge(px-9,py-9,px+9,py+9,0,180,fill=1,stroke=0)
  line([(px-8,py+1),(px-3,py+1)],'#14537c',3)
 c.setFillColor(HexColor('#abe6f3'));c.roundRect(left+22,top-132,cw-44,22,7,fill=1,stroke=0)
 if kind=='jump':
  head(cx,cy+24);line([(cx,cy+14),(cx,cy-6)],width=11)
  line([(cx-2,cy+9),(cx-18,cy-3)]);line([(cx+2,cy+9),(cx+18,cy-3)])
  line([(cx-4,cy-8),(cx-5,cy-30)]);line([(cx+4,cy-8),(cx+5,cy-30)])
  line([(cx-8,cy-8),(cx+8,cy-8)],'#1d69e5',12)
  line([(cx+34,cy+10),(cx+34,cy-18),(cx+29,cy-12)],'#137b9b',2)
  line([(cx+34,cy-18),(cx+39,cy-12)],'#137b9b',2)
 elif kind=='sit':
  c.setFillColor(HexColor('#b6cbd3'));c.rect(cx-45,cy-20,48,12,fill=1,stroke=0)
  head(cx-8,cy+24);line([(cx-8,cy+14),(cx,cy-7)],width=11)
  line([(cx,cy-8),(cx+22,cy-10),(cx+22,cy-29)])
  line([(cx-8,cy+7),(cx+11,cy+2)])
  line([(cx-3,cy-8),(cx+9,cy-9)],'#1d69e5',12)
  line([(cx-35,cy+14),(cx-42,cy),(cx-37,cy+2)],'#137b9b',2)
 elif kind in ['face','head']:
  head(cx,cy-2 if kind=='head' else cy+8)
  line([(cx,cy-12),(cx,cy-27)],width=11)
  line([(cx,cy-14),(cx-27,cy-16)]);line([(cx,cy-14),(cx+27,cy-16)])
  c.setStrokeColor(HexColor('#109cbe'));c.setLineWidth(2);c.line(left+24,cy+10 if kind=='head' else cy+5,left+cw-24,cy+10 if kind=='head' else cy+5)
  c.setFillColor(HexColor('#65cce2'));c.setFillAlpha(.25);c.roundRect(left+24,top-132,cw-48,44 if kind=='head' else 39,7,fill=1,stroke=0);c.setFillAlpha(1)
  for n in range(3):c.setStrokeColor(HexColor('#219fc0'));c.circle(cx-15-n*4,cy+n*5,2,fill=0,stroke=1)

W,H=841.89,595.28
for m in mods:
 if m["id"]=="floating":continue # Use generate-flottaison.py for the five-level workshop.
 c=canvas.Canvas(str(root/'fiches'/f'{m["id"]}.pdf'),pagesize=(W,H));c.setTitle('Natation • '+m['title']);c.setAuthor('L. Rigaux • Natation 6e');c.setFillColor(HexColor('#edf8fc'));c.rect(0,0,W,H,fill=1,stroke=0)
 c.setFillColor(HexColor('#0d3553'));c.roundRect(20,H-106,W-40,86,19,fill=1,stroke=0);c.setFillColor(HexColor('#74e6f1'));c.setFont('DB',10);c.drawString(40,H-43,'NATATION 6e  /  POUVOIRS AQUATIQUES');c.setFillColor(HexColor('#ffffff'));c.setFont('DB',25);c.drawString(40,H-75,m['title']);c.setFont('D',9);c.drawRightString(W-40,H-47,'DÉCOUVERTE → PROGRESSION → MAÎTRISE');c.drawRightString(W-40,H-68,'4 PALIERS • À TOI DE PROGRESSER')
 for i,level in enumerate(m['levels']):
  cw=190;left=20+i*204;bottom=68;top=H-122;ch=top-bottom;tone=['#e84368','#d89216','#d89216','#14a472'][i];bg=['#fff0f4','#fff6e2','#fff6e2','#e8fbf3'][i]
  c.setFillColor(HexColor('#c9e0e9'));c.roundRect(left,bottom-4,cw,ch,16,fill=1,stroke=0);c.setFillColor(HexColor('#ffffff'));c.setStrokeColor(HexColor(tone));c.setLineWidth(1.5);c.roundRect(left,bottom,cw,ch,16,fill=1,stroke=1)
  c.setFillColor(HexColor(tone));c.circle(left+25,top-25,14,fill=1,stroke=0);c.setFillColor(HexColor('#ffffff'));c.setFont('DB',13);c.drawCentredString(left+25,top-30,str(i+1));c.setFillColor(HexColor('#0d3553'));c.setFont('DB',9);c.drawString(left+46,top-21,['DÉCOUVERTE','PROGRESSION','PROGRESSION','MAÎTRISE'][i]);c.setFont('D',8);c.drawString(left+46,top-35,'Professeur' if i in [1,3] else 'Bilan élève')
  c.setFillColor(HexColor(bg));c.roundRect(left+12,top-139,cw-24,88,13,fill=1,stroke=0)
  image=m['image']
  if m['id']=='entry' and i in [1,2]:
   demonstration(c,left,top,cw,'jump' if i==1 else 'sit')
  elif m['id']=='immersion' and i in [0,1]:
   demonstration(c,left,top,cw,'face' if i==0 else 'head')
  elif m['id']=='floating' and i==3:
   c.drawImage(ImageReader(str(root/'action-04-ventrale.png')),left+22,top-102,145,35,preserveAspectRatio=True,anchor='c',mask='auto');c.drawImage(ImageReader(str(root/'action-07-dorsale.png')),left+22,top-136,145,35,preserveAspectRatio=True,anchor='c',mask='auto');c.setFont('DB',14);c.setFillColor(HexColor('#0d3553'));c.drawString(left+158,top-110,'↻')
  else:
   if m['id']=='entry' and i==0:image='./action-11-ancrage.png'
   c.drawImage(ImageReader(str(root/image.removeprefix('./'))),left+20,top-133,cw-40,75,preserveAspectRatio=True,anchor='c',mask='auto')
  c.setFillColor(HexColor('#0d3553'));yy=top-160;c.setFont('DB',12)
  for line in simpleSplit(level[0],'DB',12,cw-26):c.drawString(left+13,yy,line);yy-=15
  # All cards reserve the same title area.
  yy=top-206;c.setFont('DB',8);c.setFillColor(HexColor('#527285'));c.drawString(left+13,yy,'MA MISSION');yy-=14;c.setFont('D',8.3);c.setFillColor(HexColor('#143b55'))
  for line in simpleSplit(level[1],'D',8.3,cw-26):c.drawString(left+13,yy,line);yy-=11.5
  c.setFillColor(HexColor(bg));c.roundRect(left+10,bottom+26,cw-20,92,11,fill=1,stroke=0);c.setFillColor(HexColor('#0d3553'));c.setFont('DB',10);c.drawString(left+20,bottom+97,'Je réussis si…');yy=bottom+80;c.setFont('D',8.6)
  for line in simpleSplit(level[2],'D',8.6,cw-40):c.drawString(left+20,yy,line);yy-=12
  c.setFont('DB',7);c.setFillColor(HexColor(tone));c.drawCentredString(left+cw/2,bottom+12,'VALIDATION PROFESSEUR' if i in [1,3] else 'JE DÉCLARE MA RÉUSSITE')
 c.setFillColor(HexColor('#365d74'));c.setFont('D',8)
 c.drawString(22,45,'Zone, matériel et signal : suis les indications du professeur. Ne cherche jamais à rester sous l’eau le plus longtemps possible.')
 c.setFont('DB',7);c.drawString(22,25,'APPLICATION EPS • LE BON SAUVEUR');c.drawRightString(W-22,25,'L. RIGAUX  /  FICHE ATELIER')
 c.save()
print('3 PDF paysage illustrés créés')
