"""Native UHD capsule: uncluttered pool, one swimmer, continuous horizontal trajectories."""
from pathlib import Path
import subprocess,json,math,os
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parent.parent
STEPS=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{AQUATIC_STEPS}from './aquatic-model-v24.js';console.log(JSON.stringify(AQUATIC_STEPS))"],cwd=ROOT))
S=3;W=1280*S;H=720*S;FPS=24
FRONT='./assets/v24/front-glide.png';BACK='./assets/v24/back-glide.png'
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';fonts={};images={}
def ft(n,b=False):
 k=(n,b)
 if k not in fonts:fonts[k]=ImageFont.truetype(BOLD if b else FONT,round(n*S))
 return fonts[k]
def xy(p):return tuple(round(x*S) for x in p)
def text(d,p,s,n=20,fill='#123f58',b=False,anchor=None):d.text(xy(p),str(s),font=ft(n,b),fill=fill,anchor=anchor)
def rr(d,box,r,fill,outline=None,width=1):d.rounded_rectangle(xy(box),radius=round(r*S),fill=fill,outline=outline,width=round(width*S))
def ln(d,points,fill,width):d.line([xy(p) for p in points],fill=fill,width=round(width*S),joint='curve')
def wrap(d,s,w,n,b=False):
 lines=[];line=''
 for word in s.split():
  if line and d.textlength(line+' '+word,font=ft(n,b))>w*S:lines.append(line);line=word
  else:line+=((' ' if line else '')+word)
 if line:lines.append(line)
 return lines
def para(d,s,p,w,n=21,fill='#1c4f69',b=False,maxheight=None):
 if maxheight:
  while len(wrap(d,s,w,n,b))*n*1.28>maxheight and n>14:n-=.5
 for i,line in enumerate(wrap(d,s,w,n,b)):text(d,(p[0],p[1]+i*n*1.28),line,n,fill,b)
def sprite(path,w,h):
 k=(path,round(w*S),round(h*S))
 if k not in images:
  im=Image.open(ROOT/path.removeprefix('./')).convert('RGBA');box=im.getbbox()
  if box:im=im.crop(box)
  im.thumbnail((k[1],k[2]),Image.Resampling.LANCZOS);images[k]=im
 return images[k]
def art(im,path,box,angle=0,opacity=1):
 x,y,w,h=box;sp=sprite(path,w,h)
 if angle:sp=sp.rotate(angle,Image.Resampling.BICUBIC,expand=True)
 if opacity<1:sp=sp.copy();sp.putalpha(sp.getchannel('A').point(lambda a:round(a*opacity)))
 im.paste(sp,(round((x+w/2)*S-sp.width/2),round((y+h/2)*S-sp.height/2)),sp)
def timecode(t):return f'00:{int(t)//60:02d}:{int(t)%60:02d}.000'
(ROOT/'media/parcours-aquatique-v24.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(f'{timecode(a)} --> {timecode(b)}\n{c}' for a,b,c in [(0,5,'Je découvre mon parcours aquatique.')]+[(s['start'],s['end'],s['cue']) for s in STEPS]+[(103,108,'Je rejoins le bord. Parcours terminé !')])+'\n')
base=Image.new('RGB',(W,H),'#edf8fc');d=ImageDraw.Draw(base)
rr(d,(22,20,1258,127),23,'#103653');text(d,(43,36),'NATATION 6e  /  LE TUTORIEL',13,'#7ee0f0',True);text(d,(41,67),'LE PARCOURS AQUATIQUE',36,'white',True)
# Clean water: no floor grid or animated stripes. One understated route only.
for y in range(160*S,641*S):
 f=(y-160*S)/(481*S);d.line((24*S,y,798*S,y),fill=(round(65-35*f),round(210-35*f),round(235-5*f)))
rr(d,(24,160,798,641),24,None,'#d0e7ef',6)
for yy in [167,627]:
 for x in range(38,784,48):
  for off,w,col in [(0,20,'#ff6477'),(20,6,'white'),(26,20,'#2856ba'),(46,2,'white')]:
   if x+off<785:d.rectangle(xy((x+off,yy,min(x+off+w,785),yy+7)),fill=col)
route=[(68,310),(620,310)]+[(620+115*math.cos(-math.pi/2+i*math.pi/70),395+85*math.sin(-math.pi/2+i*math.pi/70)) for i in range(71)]+[(60,480)]
ln(d,route,'#9de8f1',2)
# Stage labels sit away from the moving swimmer; no duplicate stationary swimmers on the route.
marks=[(83,231),(240,231),(430,231),(610,231),(747,395),(625,564),(475,564),(324,564),(187,564),(82,564)]
for st,(x,y) in zip(STEPS,marks):
 rr(d,(x-17,y-17,x+17,y+17),17,'#e8fcff','#ffffff',1.5);text(d,(x,y),st['number'],15,'#124662',True,'mm')
 short=st['short'].replace(' · ',' ')
 for j,line in enumerate(wrap(d,short,123,11.5,True)):text(d,(x,y+24+j*14),line,11.5,'#0d4c68',True,'mt')
rr(d,(818,160,1256,641),23,'#fff','#d4e6ee',1.3)
text(d,(39,666),'Tapis OU cerceau : je choisis un passage à chaque immersion.',15,'#306580',True)
# The right panel always reuses the same sharp, aligned title/illustration/instruction zones.
def panel(im,st,t):
 d=ImageDraw.Draw(im)
 if st is None:
  intro=t<5;text(d,(844,190),'LE DÉFI' if intro else 'BRAVO !',14,'#0a88a8',True)
  para(d,'Dix étapes, un seul parcours' if intro else 'Parcours terminé !',(843,224),383,29,'#153f59',True)
  art(im,FRONT if intro else './action-11-ancrage.png',(846,332,380,144))
  d=ImageDraw.Draw(im);para(d,'Je repère le trajet et les deux flottaisons de 15 secondes.' if intro else 'Je suis au bord et je m’accroche.',(844,501),380,22,b=True,maxheight=85)
  para(d,'Tapis ou cerceau : deux possibilités, un seul passage.' if intro else 'À toi de jouer !',(844,593),380,15,maxheight=39)
  return
 text(d,(844,187),f'ÉTAPE {st["number"]} / 10',14,'#0a88a8',True)
 title={'front':'Nage ventrale','star':'Étoile de mer dorsale','ring':'Je récupère l’anneau','anchor':'Je m’accroche au bord'}.get(st['id'],st['title'])
 para(d,title,(843,219),383,28,'#153f59',True,maxheight=75)
 id=st['id']
 if id in ['outward','return']:
  text(d,(1037,307),'JE CHOISIS 1 PASSAGE',14,'#087e9e',True,'mm')
  for x,label in [(844,'TAPIS'),(1057,'CERCEAU')]:rr(d,(x,328,x+170,470),13,'#eaf9fc');text(d,(x+85,455),label,12,'#235b77',True,'mm')
  art(im,'./action-03-obstacle.png',(850,337,157,102));art(im,'./assets/v23/weighted-hoop.png',(1064,330,156,110));d=ImageDraw.Draw(im);text(d,(1036,397),'OU',17,'#1f6c89',True,'mm')
 elif id=='turn':
  art(im,FRONT,(848,321,278,61));art(im,BACK,(848,421,278,61));d=ImageDraw.Draw(im)
  # Same clockwise U-turn and leftward arrowhead as the Savoir-nager arrow.
  pts=[(1132,348),(1173,348)]+[(1173+28*math.sin(i*math.pi/30),398-50*math.cos(i*math.pi/30)) for i in range(31)]+[(1132,448)]
  ln(d,pts,'#174e6e',4);d.polygon([xy(p) for p in [(1146,437),(1132,448),(1146,459)]],fill='#174e6e')
 elif st.get('hold'):
  art(im,st['image'],(842,305,231,175));d=ImageDraw.Draw(im);cx,cy=1162,385;elapsed=t-st['start'];remaining=max(0,15-int(elapsed))
  d.ellipse(xy((cx-56,cy-56,cx+56,cy+56)),fill='#ecf9fc',outline='#deeff4',width=6*S);d.arc(xy((cx-56,cy-56,cx+56,cy+56)),-90,-90+360*min(1,elapsed/15),fill='#14a6bf',width=6*S)
  text(d,(cx,cy-4),remaining,36,'#145675',True,'mm');text(d,(cx,cy+27),'secondes',11,'#628596',False,'mm');text(d,(1037,488),'15 SECONDES EN TEMPS RÉEL',12,'#138ca5',True,'mm')
 else:art(im,FRONT if id=='front' else BACK if id=='back' else st['image'],(845,308,384,180))
 d=ImageDraw.Draw(im);cue=st['cue']
 if id=='upright':cue='Je garde le cou hors de l’eau et ma respiration libre, sans toucher le fond.'
 if id=='star':cue='Mon corps reste à plat. Mes orteils et ma bouche sortent de l’eau ; je respire calmement.'
 para(d,cue,(844,514),381,21,'#234f6b',True,maxheight=108)
def ease(p):p=max(0,min(1,p));return p*p*(3-2*p)
def position(t):
 if t<12:return 85,310,0,FRONT
 if t<24:
  p=ease((t-12)/12);return 85+345*p,310+18*math.sin(math.pi*p)**4,0,FRONT
 if t<39:return 430,310,0,STEPS[2]['image']
 if t<44:return 430+190*ease((t-39)/5),310,0,FRONT
 if t<50:
  p=ease((t-44)/6);a=-math.pi/2+math.pi*p;x=620+115*math.cos(a);y=395+85*math.sin(a);heading=math.degrees(math.atan2(85*math.cos(a),-115*math.sin(a)))
  return x,y,0,FRONT if p<.5 else BACK
 if t<57:return 620-145*ease((t-50)/7),480,0,BACK
 if t<72:return 475,480,0,STEPS[6]['image']
 if t<85:
  p=ease((t-72)/13);return 475-288*p,480+18*math.sin(math.pi*p)**4,0,BACK
 if t<88:return 187-65*ease((t-85)/3),480,0,BACK
 if t<96:return 122,480,0,STEPS[8]['image']
 if t<100:return 122-59*ease((t-96)/4),480,0,BACK
 return 63,480,0,STEPS[9]['image']
def frame(t):
 im=base.copy();st=next((s for s in STEPS if s['start']<=t<s['end']),None);d=ImageDraw.Draw(im)
 if st:
  x,y=marks[st['number']-1];d.ellipse(xy((x-21,y-21,x+21,y+21)),outline='white',width=2*S)
 if t>=5:
  x,y,angle,path=position(t)
  if t<12:
   p=(t-5)/7
   if p<.8:art(im,'./assets/v23/backward-jump.png',(x-54,y-95-19*math.sin(math.pi*p/.8),108,167))
   else:art(im,FRONT,(x-66,y-24,132,48))
  elif path in [FRONT,BACK]:
   opacity=max(0.12,min(1,abs(ease((t-44)/6)-.5)*12)) if 44<=t<50 else 1
   art(im,path,(x-69,y-24,138,48),0,opacity)
   if 44<=t<50 and opacity<.9:
    dd=ImageDraw.Draw(im);dd.ellipse(xy((x-4,y-4,x+4,y+4)),fill='white')
  elif path==STEPS[2]['image']:art(im,path,(x-48,y-54,96,108))
  elif path==STEPS[6]['image']:art(im,path,(x-62,y-39,124,78))
  elif path==STEPS[8]['image']:art(im,path,(x-49,y-75,98,150))
  else:art(im,path,(x-47,y-45,94,100))
 panel(im,st,t);d=ImageDraw.Draw(im);rr(d,(39,700,1241,705),2,'#d2e8f0');rr(d,(39,700,39+max(1,1202*t/108),705),2,'#12a0bc')
 return im
if __name__=='__main__':
 import argparse
 ap=argparse.ArgumentParser();ap.add_argument('--preview',action='store_true');args=ap.parse_args()
 frame(0).save(ROOT/'media/parcours-aquatique-v24.jpg',quality=95,subsampling=0)
 if args.preview:
  for t in [0,7,18,31,41,45.5,47,49,64,79,91,101,106]:frame(t).resize((1280,720),Image.Resampling.LANCZOS).save('/tmp/v24-video-'+str(t)+'.png')
 else:
  p=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','21','-threads','4','-pix_fmt','yuv420p','-profile:v','high','-level:v','5.1','-g',str(FPS*4),'-movflags','+faststart',str(ROOT/'media/parcours-aquatique-v24.mp4')],stdin=subprocess.PIPE)
  try:
   for i in range(108*FPS):
    p.stdin.write(frame(i/FPS).tobytes())
    if i%(FPS*6)==0:print(f'{i//FPS}/108 s — native 3840×2160',flush=True)
  finally:p.stdin.close()
  code=p.wait()
  if code:raise SystemExit(code)
  print('Done: native UHD 3840×2160, 24 fps, 108 seconds',flush=True)
