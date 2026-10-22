from pathlib import Path
import subprocess,json,io,math,os
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader,simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
root=Path(__file__).resolve().parent.parent
source=(root/'workshops-v19.js').read_text()
data=json.loads(subprocess.check_output(['node','-e',source.replace('export const','const')+';process.stdout.write(JSON.stringify({WORKSHOPS,MISSION_CRITERIA,AQUATIC_MISSIONS}));']))
mods=data['WORKSHOPS'];criteria=data['MISSION_CRITERIA'];meta=data['AQUATIC_MISSIONS']
for name,f in [('D','DejaVuSans.ttf'),('DB','DejaVuSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+f))
W,H=841.89,595.28
ink='#123a52';tones={'red':'#f87c94','orange':'#f7c695','green':'#c8e1b9','diamond':'#bcd3f0'}
def fill(c,v):c.setFillColor(HexColor(v))
def write(c,text,x,y,width,font='D',size=8.8,leading=11.4):
 c.setFont(font,size)
 for line in simpleSplit(text,font,size,width):c.drawString(x,y,line);y-=leading
 return y
def sprite(path):
 im=Image.open(path).convert('RGBA');im.thumbnail((720,720),Image.Resampling.LANCZOS);paper=Image.new('RGB',im.size,'#eefafd');paper.paste(im,mask=im.getchannel('A'));data=io.BytesIO();paper.save(data,format='JPEG',quality=94,optimize=True);data.seek(0);return ImageReader(data)
for m in mods:
 if os.environ.get('ONLY_WORKSHOP') and m['id']!=os.environ['ONLY_WORKSHOP']:continue
 n=len(m['levels']);info=meta[m['id']];c=canvas.Canvas(str(root/'fiches'/f'{m["id"]}.pdf'),pagesize=(W,H));c.setTitle('Missions aquatiques - '+m['title']);c.setAuthor('L. Rigaux')
 pages=[list(range(n))] if n<=5 else [list(range(0,4)),list(range(4,n))]
 for page,indices in enumerate(pages):
  fill(c,'#f2f8fb');c.rect(0,0,W,H,fill=1,stroke=0);fill(c,'#103954');c.roundRect(18,H-83,W-36,65,17,fill=1,stroke=0);fill(c,'#92eee0');c.setFont('DB',9);c.drawString(35,H-38,'NATATION 6e / MES MISSIONS AQUATIQUES');fill(c,'#ffffff');c.setFont('DB',25);c.drawString(35,H-68,m['title']);c.setFont('DB',10);c.drawRightString(W-35,H-38,'POUVOIR '+info['power'].upper());c.setFont('D',8.5);c.drawRightString(W-35,H-60,f'Missions {indices[0]+1} à {indices[-1]+1} sur {n}')
  c.setStrokeColor(HexColor('#bddce5'));c.setLineWidth(3);c.line(50,H-103,W-50,H-103)
  for i in range(n):
   xx=50+i*((W-100)/(n-1));fill(c,tones[m['tones'][i]] if i in indices else '#ffffff');c.setStrokeColor(HexColor('#497b92'));c.setLineWidth(1);c.circle(xx,H-103,9,fill=1,stroke=1);fill(c,ink);c.setFont('DB',8);c.drawCentredString(xx,H-106,str(i+1))
  count=len(indices);cw=(W-36-(count-1)*10)/count;top=H-121;bottom=20
  for column,i in enumerate(indices):
   level=m['levels'][i];left=18+column*(cw+10);tone=tones[m['tones'][i]];fill(c,'#cfdee5');c.roundRect(left,bottom-3,cw,top-bottom,14,fill=1,stroke=0);fill(c,'#ffffff');c.setStrokeColor(HexColor(tone));c.setLineWidth(2);c.roundRect(left,bottom,cw,top-bottom,14,fill=1,stroke=1)
   fill(c,tone);c.roundRect(left+7,top-34,cw-14,26,9,fill=1,stroke=0);fill(c,ink);c.setFont('DB',8.5);c.drawCentredString(left+cw/2,top-25,f'MISSION {i+1} / {n}'+(' · DIAMANT' if m['tones'][i]=='diamond' else ''))
   fill(c,'#eefafd');c.roundRect(left+7,top-153,cw-14,110,14,fill=1,stroke=0)
   c.drawImage(sprite(root/m['levelImages'][i].removeprefix('./')),left+12,top-148,cw-24,100,preserveAspectRatio=True,anchor='c',mask='auto')
   fill(c,ink);yy=write(c,info['names'][i],left+12,top-173,cw-24,'DB',10.8,13.5);yy-=5;c.setFont('DB',7.5);c.drawString(left+12,yy,'CE QUE JE FAIS');yy-=13;yy=write(c,level[1],left+12,yy,cw-24)
   boxbottom=bottom+12;boxtop=bottom+184;assert yy>=boxtop+6,(m['id'],i,'instruction',yy,boxtop)
   fill(c,'#f1f7fa');c.roundRect(left+7,boxbottom,cw-14,boxtop-boxbottom,11,fill=1,stroke=0);fill(c,ink);c.setFont('DB',9.5);c.drawString(left+13,boxtop-20,'Je réussis si…');yy=boxtop-38
   for text in criteria[m['id']][i]:
    c.setStrokeColor(HexColor('#2c637b'));c.setLineWidth(.7);c.roundRect(left+13,yy-1,7,7,1.5,fill=0,stroke=1);yy=write(c,text,left+26,yy,cw-38)-7
   assert yy>=boxbottom+2,(m['id'],i,'criteria',yy,boxbottom)
  c.showPage()
 c.save();print(m['id']+f': {len(pages)} page(s) paysage, {n} missions, sans bas de page')
