from pathlib import Path
import subprocess,json,io,html
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader,simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
root=Path(__file__).resolve().parent.parent
source=(root/'natation-cycle-v18.js').read_text()
def literal(start,end):return source[source.index(start)+len(start):source.index(end,source.index(start))].strip().rstrip(';')
mods=json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify('+literal('const WORKSHOPS=','const LEARNING_STATES=')+'))']))
criteria=json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify('+literal('const MISSION_CRITERIA=','function MissionCriteria')+'))']))
meta=json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify('+literal('const AQUATIC_MISSIONS=','function AquaticPassport')+'))']))
directions={
 'floating':['Une main au mur, l’autre sur une frite. Souffle dans l’eau puis redresse-toi.','Une main au mur, l’autre sur une frite. Allonge-toi sur le dos, regard au plafond.','Avec deux frites, allonge-toi sur le dos puis redresse-toi en ramenant le menton.','À portée du bord, utilise tes mains et le rétropédalage pour te stabiliser.','Sans matériel, allonge-toi sur le dos puis ramène le menton pour te redresser.'],
 'immersion':['Au bord, immerge le visage et souffle des bulles, puis relève la tête.','Avec un appui autorisé, immerge toute la tête puis ressors tranquillement.','Au signal du professeur, repère la sortie et passe sous l’obstacle court.','Après autorisation, franchis l’obstacle de 1,5 m en immersion, puis ressors dans la zone prévue.'],
 'entry':['Descends par l’échelle face aux barreaux, puis rejoins le point d’attente.','Au signal, dans une zone libre, saute pieds en premier et rejoins le point prévu.','Au signal et près du professeur, pars assis et laisse-toi basculer vers l’arrière.','Au signal, depuis la position indiquée, entre en chute arrière puis rejoins le point prévu.']}
for name,f in [('D','DejaVuSans.ttf'),('DB','DejaVuSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+f))
W,H=841.89,595.28
ink='#123a52';dark='#103954'
def fill(c,v):c.setFillColor(HexColor(v))
def lines(c,text,x,y,width,font='D',size=9,leading=12):
 c.setFont(font,size)
 for line in simpleSplit(text,font,size,width):c.drawString(x,y,line);y-=leading
 return y
def sprite(path):
 im=Image.open(path).convert('RGBA');im.thumbnail((720,720),Image.Resampling.LANCZOS)
 paper=Image.new('RGB',im.size,'#eefafd');paper.paste(im,mask=im.getchannel('A'));data=io.BytesIO();paper.save(data,format='JPEG',quality=94,optimize=True);data.seek(0);return ImageReader(data)
for m in mods:
 n=len(m['levels']);info=meta[m['id']];c=canvas.Canvas(str(root/'fiches'/f'{m["id"]}.pdf'),pagesize=(W,H));c.setTitle('Missions aquatiques - '+m['title']);c.setAuthor('L. Rigaux / Bon Sauveur');fill(c,'#f2f8fb');c.rect(0,0,W,H,fill=1,stroke=0)
 fill(c,dark);c.roundRect(18,H-89,W-36,71,17,fill=1,stroke=0);fill(c,'#92eee0');c.setFont('DB',9);c.drawString(35,H-39,'NATATION 6e / MON PASSEPORT AQUATIQUE');fill(c,'#ffffff');c.setFont('DB',25);c.drawString(35,H-72,m['title']);c.setFont('DB',11);c.drawRightString(W-35,H-40,'POUVOIR '+info['power'].upper());c.setFont('D',9);c.drawRightString(W-35,H-61,'Gagne tes badges, une mission à la fois')
 # The path is a record of acquired skills, separate from the fixed difficulty colors.
 fill(c,ink);c.setFont('D',8);c.drawString(24,H-109,'MON CHEMIN :');c.setStrokeColor(HexColor('#bddce5'));c.setLineWidth(3);c.line(130,H-106,W-38,H-106)
 for i in range(n):
  xx=145+i*((W-190)/(n-1));fill(c,'#ffffff');c.setStrokeColor(HexColor('#2c6b83'));c.setLineWidth(1);c.circle(xx,H-106,9,fill=1,stroke=1);fill(c,ink);c.setFont('DB',8);c.drawCentredString(xx,H-109,str(i+1))
 cw=(W-36-(n-1)*10)/n;top=H-126;bottom=57
 tones=['#f87c94','#f87c94','#f7c695','#c8e1b9','#c8e1b9'] if n==5 else ['#f87c94','#f7c695','#f7c695','#c8e1b9']
 for i,level in enumerate(m['levels']):
  left=18+i*(cw+10);tone=tones[i];fill(c,'#cfdee5');c.roundRect(left,bottom-4,cw,top-bottom,14,fill=1,stroke=0);fill(c,'#ffffff');c.setStrokeColor(HexColor(tone));c.setLineWidth(2);c.roundRect(left,bottom,cw,top-bottom,14,fill=1,stroke=1)
  fill(c,tone);c.roundRect(left+7,top-34,cw-14,26,9,fill=1,stroke=0);fill(c,ink);c.setFont('DB',9);c.drawCentredString(left+cw/2,top-25,'MISSION '+str(i+1)+' / '+str(n))
  fill(c,'#eefafd');c.roundRect(left+7,top-146,cw-14,103,14,fill=1,stroke=0)
  image=m.get('levelImages',[m['image']]*n)[i];c.drawImage(sprite(root/image.removeprefix('./')),left+11,top-142,cw-22,94,preserveAspectRatio=True,anchor='c',mask='auto')
  fill(c,ink);yy=lines(c,info['names'][i],left+12,top-165,cw-24,'DB',11,14)
  yy-=4;c.setFont('DB',7);c.drawString(left+12,yy,'MA CONSIGNE');yy-=12;yy=lines(c,directions[m['id']][i],left+12,yy,cw-24,'D',8.1,10.5)
  # Use the same three measurable/qualitative keys as the active application mission.
  cy=bottom+39;ch=yy-cy-10;assert ch>=105,(m['id'],i,ch)
  fill(c,'#f1f7fa');c.roundRect(left+7,cy,cw-14,ch,11,fill=1,stroke=0);fill(c,ink);c.setFont('DB',9);c.drawString(left+13,cy+ch-18,'Je réussis si…');yy=cy+ch-35
  for text in criteria[m['id']][i]:
   c.setStrokeColor(HexColor('#2c637b'));c.setLineWidth(.7);c.roundRect(left+13,yy-1,7,7,1.5,fill=0,stroke=1)
   yy=lines(c,text,left+26,yy,cw-38,'D',8.3,10.8)-6
  assert yy>=cy+4,(m['id'],i,yy,cy)
  teacher=i in [((n+1)//2)-1,n-1];fill(c,ink);c.setFont('DB',7);c.drawCentredString(left+cw/2,bottom+24,'DÉFI PROFESSEUR' if teacher else 'BADGE EXPLORATION')
  c.setStrokeColor(HexColor('#1b755c'));c.circle(left+16,bottom+11,4.5,fill=0,stroke=1);c.setFont('D',6.7);c.drawString(left+25,bottom+8,'Compétence acquise / date : ______')
 fill(c,'#375e73');c.setFont('D',7.2);c.drawString(20,39,'Zone, matériel et signal : suis les indications du professeur. Entrées et passages sous obstacle : après son autorisation.')
 c.drawString(20,28,'Ne cherche pas à rester sous l’eau le plus longtemps possible. Les couleurs indiquent les paliers ; le badge indique la réussite.')
 c.setFont('DB',6.8);c.drawString(20,15,'APPLICATION EPS / LE BON SAUVEUR');c.drawRightString(W-20,15,'L. RIGAUX / '+m['title'].upper());c.save()
 print(m['id']+': paysage, '+str(n)+' missions, critères identiques à l’application')
