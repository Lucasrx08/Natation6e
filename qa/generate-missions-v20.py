"""One A4 landscape page per workshop, with the app's canonical content and art."""
from pathlib import Path
import subprocess,json,io,os
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader,simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root=Path(__file__).resolve().parent.parent
source=(root/'workshops-v19.js').read_text()
mods=json.loads(subprocess.check_output(['node','-e',source.replace('export const','const')+';process.stdout.write(JSON.stringify(WORKSHOPS));']))
for name,file in [('D','DejaVuSans.ttf'),('DB','DejaVuSans-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
W,H=841.89,595.28
ink='#153d56'
tones={'red':'#f87c94','orange':'#f7c695','green':'#c8e1b9','diamond':'#bcd3f0'}
def fill(c,color):c.setFillColor(HexColor(color))
def lines(text,width,font,size):return simpleSplit(text,font,size,width)
def write(c,text,x,y,width,font='D',size=8.5,leading=11):
    c.setFont(font,size)
    for line in lines(text,width,font,size):c.drawString(x,y,line);y-=leading
    return y
def sprite(path):
    im=Image.open(path).convert('RGBA');im.thumbnail((640,640),Image.Resampling.LANCZOS)
    paper=Image.new('RGB',im.size,'#eefafd');paper.paste(im,mask=im.getchannel('A'))
    stream=io.BytesIO();paper.save(stream,format='JPEG',quality=94,optimize=True);stream.seek(0)
    return ImageReader(stream)

for m in mods:
    if os.environ.get('ONLY_WORKSHOP') and m['id']!=os.environ['ONLY_WORKSHOP']:continue
    n=len(m['missions']);cw=(W-36-(n-1)*7)/n;top=H-111;bottom=18
    c=canvas.Canvas(str(root/'fiches'/f'{m["id"]}.pdf'),pagesize=(W,H))
    title='Atelier '+m['title'];c.setTitle(title);c.setAuthor('L. Rigaux')
    fill(c,'#f0f7fa');c.rect(0,0,W,H,fill=1,stroke=0)
    fill(c,'#113c58');c.roundRect(18,H-73,W-36,55,15,fill=1,stroke=0)
    fill(c,'#ffffff');c.setFont('DB',23);c.drawString(34,H-53,title)
    c.setFont('DB',10);c.drawRightString(W-34,H-49,f'{n} NIVEAUX')
    c.setStrokeColor(HexColor('#b2dce5'));c.setLineWidth(2.5);c.line(18+cw/2,H-92,W-18-cw/2,H-92)
    for i in range(n):
        x=18+i*(cw+7)+cw/2;fill(c,tones[m['tones'][i]]);c.setStrokeColor(HexColor('#ffffff'));c.setLineWidth(1.5);c.circle(x,H-92,9,fill=1,stroke=1)
        fill(c,ink);c.setFont('DB',8);c.drawCentredString(x,H-95,str(i+1))
    for i,mission in enumerate(m['missions']):
        x=18+i*(cw+7);color=tones[m['tones'][i]];tw=cw-20
        fill(c,'#d5e3e9');c.roundRect(x,bottom-2,cw,top-bottom,12,fill=1,stroke=0)
        fill(c,'#ffffff');c.setStrokeColor(HexColor(color));c.setLineWidth(1.5);c.roundRect(x,bottom,cw,top-bottom,12,fill=1,stroke=1)
        fill(c,color);c.roundRect(x+5,top-31,cw-10,24,8,fill=1,stroke=0)
        fill(c,ink);c.setFont('DB',8);c.drawCentredString(x+cw/2,top-23,f'NIVEAU {i+1}'+(' · DIAMANT' if m['tones'][i]=='diamond' else ''))
        imageh=108 if n==5 else 94
        size=9 if n==5 else 8.2;leading=size*1.31;title_size=11.2 if n==5 else 10
        def needed():
            titleh=len(lines(m['names'][i],tw,'DB',title_size))*title_size*1.18
            insh=len(lines(mission['instruction'],tw,'D',size))*leading
            crith=sum(len(lines(text,tw-11,'D',size))*leading+7 for text in mission['criteria'])
            return 37+imageh+10+titleh+14+insh+14+23+crith+15
        while needed()>top-bottom and imageh>72:imageh-=4
        assert needed()<=top-bottom,(m['id'],i,needed(),top-bottom)
        img_top=top-39
        fill(c,'#eefafd');c.roundRect(x+5,img_top-imageh,cw-10,imageh,10,fill=1,stroke=0)
        c.drawImage(sprite(root/m['levelImages'][i].removeprefix('./')),x+8,img_top-imageh+4,cw-16,imageh-8,preserveAspectRatio=True,anchor='c')
        fill(c,ink);y=write(c,m['names'][i],x+10,img_top-imageh-16,tw,'DB',title_size,title_size*1.18)-4
        c.setFont('DB',8);c.drawString(x+10,y,'Je fais…');y-=13
        y=write(c,mission['instruction'],x+10,y,tw,size=size,leading=leading)-10
        boxtop=y+3;boxbottom=bottom+8
        fill(c,'#eff6fa');c.roundRect(x+5,boxbottom,cw-10,boxtop-boxbottom,9,fill=1,stroke=0)
        fill(c,ink);c.setFont('DB',9 if n==5 else 8.5);c.drawString(x+10,boxtop-15,'Je réussis si…');y=boxtop-31
        for text in mission['criteria']:
            c.setStrokeColor(HexColor('#3b778b'));c.setLineWidth(.65);c.roundRect(x+10,y-1,5.5,5.5,1.2,fill=0,stroke=1)
            y=write(c,text,x+20,y,tw-10,size=size,leading=leading)-7
        assert y>=boxbottom-1,(m['id'],i,y,boxbottom)
    c.showPage();c.save();print(title+f': 1 page A4 paysage, {n} niveaux')
