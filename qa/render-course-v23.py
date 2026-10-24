"""108-second 16:9 course capsule; deterministic motion, original 3D assets, real-time holds."""
from pathlib import Path
import os,subprocess,json,math,textwrap
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parent.parent
DATA=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{AQUATIC_STEPS}from './aquatic-model-v23.js';console.log(JSON.stringify(AQUATIC_STEPS))"],cwd=ROOT))
W,H,FPS=1280,720,20
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
fonts={}
def font(size,bold=False):
 k=(size,bold)
 if k not in fonts:fonts[k]=ImageFont.truetype(BOLD if bold else FONT,size)
 return fonts[k]
def txt(d,xy,s,size=20,fill='#123e59',bold=False,anchor=None):d.text(xy,str(s),font=font(size,bold),fill=fill,anchor=anchor)
def wrap(d,text,width,size,bold=False):
 lines=[];line=''
 for word in str(text).split():
  if line and d.textlength(line+' '+word,font=font(size,bold))>width:lines.append(line);line=word
  else:line+=((' ' if line else '')+word)
 if line:lines.append(line)
 return lines
def paragraph(d,text,xy,width,size=21,fill='#194c68',bold=False,leading=None):
 x,y=xy
 for line in wrap(d,text,width,size,bold):txt(d,(x,y),line,size,fill,bold);y+=leading or size*1.3
 return y
sprites={}
def sprite(path,w,h):
 key=(path,w,h)
 if key not in sprites:
  im=Image.open(ROOT/path.removeprefix('./')).convert('RGBA');box=im.getbbox()
  if box:im=im.crop(box)
  im.thumbnail((int(w),int(h)),Image.Resampling.LANCZOS);sprites[key]=im
 return sprites[key]
def art(im,path,box,bob=0):
 x,y,w,h=box;sp=sprite(path,w,h);im.paste(sp,(int(x+(w-sp.width)/2),int(y+(h-sp.height)/2+bob)),sp)
def turn_art(im,box):
 x,y,w,h=box;art(im,'./action-04-ventrale.png',(x,y,w*.75,h*.48));art(im,'./action-07-dorsale.png',(x,y+h*.5,w*.75,h*.48));d=ImageDraw.Draw(im);d.arc((x+w*.61,y+h*.15,x+w*.97,y+h*.87),-90,90,fill='#164d70',width=5);d.polygon([(x+w*.76,y+h*.8),(x+w*.94,y+h*.78),(x+w*.87,y+h*.63)],fill='#164d70')
base=Image.new('RGB',(W,H));d=ImageDraw.Draw(base)
for y in range(H):
 ratio=y/H;d.line((0,y,W,y),fill=(round(231+ratio*9),round(246+ratio*4),round(251+ratio*2)))
d.rounded_rectangle((18,18,1262,133),radius=24,fill='#0d3554')
txt(d,(42,36),'NATATION 6e  /  LE TUTORIEL',14,'#77e0f2',True)
txt(d,(40,65),'LE PARCOURS AQUATIQUE',37,'white',True)
d.rounded_rectangle((1086,43,1238,107),radius=17,fill='#1b6284');txt(d,(1162,76),'1 min 48',23,'white',True,'mm')
# Horizontal assessment-course layout, consistent with Savoir-nager (the plan view uses vertical lanes).
POOL=(24,160,796,639);x0,y0,x1,y1=POOL
for y in range(y0,y1):
 r=(y-y0)/(y1-y0);d.line((x0,y,x1,y),fill=(int(72-r*39),int(210-r*47),int(238-r*11)))
for y in range(y0+27,y1,32):d.line((x0,y,x1,y),fill='#82e2f2',width=2)
d.rounded_rectangle(POOL,radius=22,outline='#d0e5ed',width=8)
for y in [y0+7,y1-15]:
 for x in range(x0+14,x1-16,48):
  d.rectangle((x,y,min(x+20,x1-12),y+8),fill='#ff647b');d.rectangle((x+21,y,min(x+25,x1-12),y+8),fill='white');d.rectangle((x+26,y,min(x+45,x1-12),y+8),fill='#2855bc')
txt(d,(48,187),'ALLER',12,'#0c5a78',True);txt(d,(48,607),'RETOUR',12,'#0c5a78',True)
# Fixed route; all ten stages stay visible throughout the video.
coords=[(96,287),(248,287),(403,287),(557,287),(701,401),(639,514),(506,514),(365,514),(226,514),(89,514)]
d.line([(96,287),(626,287)],fill='#d8fcff',width=7);d.arc((605,286,744,515),-90,90,fill='#d8fcff',width=7);d.line([(674,514),(69,514)],fill='#d8fcff',width=7)
d.polygon([(75,514),(91,503),(91,525)],fill='#e1fdff')
for s,(x,y) in zip(DATA,coords):
 d.ellipse((x-54,y-42,x+54,y+42),fill='#8ae4ed',outline='#c0f7f4',width=3)
 if s['id']=='turn':turn_art(base,(x-47,y-36,94,72))
 else:art(base,s['image'],(x-47,y-36,94,72))
 d=ImageDraw.Draw(base);d.ellipse((x-56,y-48,x-29,y-21),fill='#113d5b',outline='white',width=2);txt(d,(x-42,y-34),s['number'],13,'white',True,'mm')
 label=s['short'].replace(' · ','\n')
 lines=wrap(d,label,124,12,True)
 for j,line in enumerate(lines):txt(d,(x,y+49+j*15),line,12,'#093f5b',True,'mt')
d.rounded_rectangle((816,160,1256,639),radius=22,fill='white',outline='#c7e2ec',width=2)
txt(d,(36,662),'Un tapis OU un cerceau : je choisis un passage à chaque immersion.',16,'#285c77',True)
# Captions as a separate accessible track as well as on-screen explanations.
def stamp(s):return f'00:{int(s)//60:02d}:{int(s)%60:02d}.000'
captions=[(0,5,'Dix étapes pour découvrir le parcours aquatique.')]+[(s['start'],s['end'],s['cue']) for s in DATA]+[(103,108,'Parcours terminé. À toi de jouer !')]
(ROOT/'media/parcours-aquatique-v23.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(f'{stamp(a)} --> {stamp(b)}\n{text}' for a,b,text in captions)+'\n')
def render(t):
 im=base.copy();d=ImageDraw.Draw(im)
 active=next((i for i,s in enumerate(DATA) if s['start']<=t<s['end']),None)
 intro=t<5;outro=t>=103
 # Soft moving highlights make the water alive without obscuring the route.
 for j in range(5):
  yy=216+j*75+math.sin(t*.8+j)*3
  d.line((38,yy,781,yy),fill='#a0e8f2',width=1)
 if active is None:
  txt(d,(844,191),'LE DÉFI' if intro else 'BRAVO !',15,'#0985a8',True)
  paragraph(d,'10 étapes, un seul parcours' if intro else 'Parcours terminé !',(844,224),380,31,'#113a57',True)
  art(im,'./action-04-ventrale.png' if intro else './action-11-ancrage.png',(845,316,380,170),math.sin(t*2)*2)
  d=ImageDraw.Draw(im)
  paragraph(d,'Je repère le trajet et les deux flottaisons de 15 secondes.' if intro else 'Je suis revenu au bord et je m’accroche.',(845,498),373,21,'#1c5574',True)
  paragraph(d,'Tapis ou cerceau : deux possibilités, un seul passage.' if intro else 'À toi de jouer !',(845,589),373,16)
  if outro:
   for x,y in coords:d.ellipse((x-59,y-47,x+59,y+47),outline='#edfff7',width=4)
 else:
  s=DATA[active];elapsed=t-s['start'];local=elapsed/(s['end']-s['start']);x,y=coords[active]
  pulse=int(3+math.sin(t*4)*2);d.ellipse((x-59-pulse,y-47-pulse,x+59+pulse,y+47+pulse),outline='white',width=3)
  # A moving progress marker follows the course; hold stages remain stationary.
  if active and not s.get('hold'):
   px,py=coords[active-1]
   if s['id']=='turn':
    a=-math.pi/2+math.pi*local;mx=674+64*math.cos(a);my=401+114*math.sin(a)
   else:mx=px+(x-px)*local;my=py+(y-py)*local
  else:mx,my=x,y
  d.ellipse((mx-8,my-8,mx+8,my+8),fill='#fff',outline='#07577f',width=3)
  if s['id'] in ['outward','front','back','return','ring','anchor']:
   travel='./action-04-ventrale.png' if active<4 else './action-07-dorsale.png'
   art(im,travel,(mx-47,my-21,94,44),math.sin(t*3)*2)
   d=ImageDraw.Draw(im)
  txt(d,(844,186),f'ÉTAPE {s["number"]} / 10',15,'#0784a8',True)
  title={'upright':'Flottaison debout','star':'Étoile de mer dorsale','ring':'Je récupère l’anneau','anchor':'Je m’accroche au bord','return':'Immersion retour'}.get(s['id'],s['title'])
  paragraph(d,title,(843,217),384,29,'#123e59',True)
  if s['id'] in ['outward','return']:
   txt(d,(1035,300),'JE CHOISIS 1 PASSAGE',15,'#087e9e',True,'mm')
   for xx,label in [(843,'TAPIS'),(1057,'CERCEAU')]:
    d.rounded_rectangle((xx,322,xx+170,470),radius=13,fill='#eafaFD')
    txt(d,(xx+85,455),label,13,'#14516d',True,'mm')
   art(im,'./action-03-obstacle.png',(846,335,164,110))
   hoop='./assets/v23/weighted-hoop.png'
   if (ROOT/hoop.removeprefix('./')).exists():art(im,hoop,(1060,328,164,120))
   d=ImageDraw.Draw(im);txt(d,(1035,394),'OU',18,'#176986',True,'mm')
  elif s['id']=='turn':turn_art(im,(864,315,322,169))
  elif s.get('hold'):
   art(im,s['image'],(844,299,229,184),math.sin(t*1.6)*1.5)
   d=ImageDraw.Draw(im);remaining=max(0,15-int(elapsed));cx,cy=1163,382
   d.ellipse((cx-57,cy-57,cx+57,cy+57),fill='#eaf9fc',outline='#d6edf2',width=8)
   d.arc((cx-57,cy-57,cx+57,cy+57),-90,-90+360*local,fill='#0baac9',width=8)
   txt(d,(cx,cy-4),f'{remaining}',37,'#104e6c',True,'mm');txt(d,(cx,cy+29),'secondes',12,'#4b7e94',False,'mm')
   txt(d,(1035,487),'15 SECONDES EN TEMPS RÉEL',13,'#11849f',True,'mm')
  else:
   bob=math.sin(t*2)*3
   art(im,s['image'],(849,304,375,194),bob)
  d=ImageDraw.Draw(im)
  cue=s['cue']
  if s['id']=='upright':cue='Je garde le cou hors de l’eau et ma respiration libre, sans toucher le fond.'
  if s['id']=='star':cue='Mon corps reste à plat. Mes orteils et ma bouche sortent de l’eau ; je respire calmement.'
  paragraph(d,cue,(844,514),380,21,'#214f6c',True,28)
 # Real elapsed time and continuous global progress.
 d=ImageDraw.Draw(im);d.rounded_rectangle((36,698,1244,705),radius=3,fill='#c7e3ed');d.rounded_rectangle((36,698,36+max(1,1208*t/108),705),radius=3,fill='#0c9ec6')
 txt(d,(1241,664),f'{int(t)//60}:{int(t)%60:02d} / 1:48',14,'#406d84',True,'ra')
 return im
if __name__=='__main__':
 import argparse
 ap=argparse.ArgumentParser();ap.add_argument('--preview',action='store_true');args=ap.parse_args()
 if args.preview:
  for t in [0,7,18,31,46,64,79,91,101,106]:render(t).save('/tmp/v23-video-'+str(t)+'.png')
  render(0).save(ROOT/'media/parcours-aquatique-v23.jpg',quality=94)
 else:
  render(0).save(ROOT/'media/parcours-aquatique-v23.jpg',quality=94)
  command=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(ROOT/'media/parcours-aquatique-v23.mp4')]
  p=subprocess.Popen(command,stdin=subprocess.PIPE)
  for frame in range(108*FPS):
   p.stdin.write(render(frame/FPS).tobytes())
   if frame%(FPS*12)==0:print(f'{frame//FPS}/108 s',flush=True)
  p.stdin.close();code=p.wait()
  if code:raise SystemExit(code)
  print('Rendered 108 seconds, 1280×720, 20 fps',flush=True)
