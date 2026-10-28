"""Illustrated aquatic-course film using the application's original artwork.
No deforming character or simulated stroke: original illustrations, camera moves,
route arrows, sequential cards and accelerated hold countdowns. 3840x2160/30.
Requires Skia-Python, NumPy, Pillow and FFmpeg.
"""
from pathlib import Path
import functools,math,os,sys,json,subprocess,time,wave
import numpy as np
from PIL import Image
import skia
ROOT=Path(__file__).resolve().parent.parent
WORK=Path(os.environ.get('V31_WORK',ROOT.parent/'v31-work'));WORK.mkdir(exist_ok=True)
MEDIA=ROOT/'media';FPS=30;DURATION=69
NAVY='#0b2944';INK='#143f58';TEAL='#009fb9';CYAN='#31cce1';WHITE='#ffffff';MUTED='#53758a';BG='#eef7fb';PALE='#ddf8fc';GREEN='#218a70'
TIMES=[(3,8),(8,16),(16,21),(21,26),(26,31),(31,37),(37,42),(42,50),(50,61),(61,66)]
TITLES=['Le saut arrière','L’immersion aller','La flottaison debout','La nage ventrale','Le demi-tour','Le dos crawlé','L’étoile dorsale','L’immersion retour','Je récupère l’anneau','Je m’accroche au bord']
SHORT=['Saut arrière','Immersion aller','Debout · 15 s','Crawl','Demi-tour','Dos crawlé','Étoile · 15 s','Immersion retour','Anneau','Au bord']
ART=['assets/v23/backward-jump.png','action-03-obstacle.png','ateliers/flottaison-3d-4.png','action-04-ventrale.png','action-05-surplace.png','action-07-dorsale.png','ateliers/flottaison-3d-5.png','action-09-obstacle-retour.png','ateliers/immersion-object-v19.png','action-11-ancrage.png']
CUES=[
 'Je saute vers l’arrière, bras le long du corps, pieds en premier.',
 'Je passe sous le tapis OU dans le cerceau lesté. Un seul obstacle à franchir.',
 'Je tiens 15 secondes, le cou hors de l’eau, sans toucher le fond.',
 'Je repars en crawl jusqu’au demi-tour.',
 'Je me redresse, je change de direction sans appui et je repars sur le dos.',
 'Je nage en dos crawlé jusqu’à la zone de flottaison.',
 'Je tiens 15 secondes sur le dos, bouche et orteils hors de l’eau.',
 'Je passe sous le tapis OU dans le cerceau, puis je ressors sur le ventre.',
 'Crawl, plongeon canard, récupération de l’anneau, remontée puis reprise du crawl.',
 'Je rejoins le bord en crawl et je m’y accroche avec les mains.'
]
HEADS=['Bras le long du corps','Un obstacle au choix','Je respire librement','Je nage sur le ventre','Je change de nage','Je nage sur le dos','Je reste à plat','Je ressors en crawl','Je ramène l’anneau','Le parcours est terminé']
DETAILS=[
 ['Je pousse avec mes jambes.','J’entre pieds en premier.','Je reprends ma respiration calmement.'],
 ['Je franchis entièrement l’obstacle.','Le tapis et le cerceau sont deux possibilités alternatives.'],
 ['Je garde le cou hors de l’eau.','Je ne prends aucun appui au fond.'],
 ['Mes bras travaillent en alternance.','Je souffle dans l’eau et j’inspire sur le côté.'],
 ['Je me redresse.','Je tourne sans toucher le fond.','Je m’allonge sur le dos.'],
 ['Mes bras travaillent en alternance.','Je garde le visage hors de l’eau.'],
 ['Je garde la bouche et les orteils hors de l’eau.','Je respire calmement.'],
 ['Je franchis un seul obstacle.','Après l’obstacle, je reprends le crawl pour aller chercher l’anneau.'],
 ['Je plonge tête la première.','Je récupère l’anneau et je remonte.','Je repars en crawl vers le bord.'],
 ['Je termine mon trajet en crawl.','Je tiens le bord avec les mains.']
]
@functools.lru_cache(None)
def col(s):
 s=s.lstrip('#');return skia.Color(int(s[:2],16),int(s[2:4],16),int(s[4:6],16))
def paint(s=INK,alpha=1,stroke=None):
 p=skia.Paint(AntiAlias=True,Color=col(s));p.setAlphaf(alpha)
 if stroke is not None:p.setStyle(skia.Paint.kStroke_Style);p.setStrokeWidth(stroke);p.setStrokeCap(skia.Paint.kRound_Cap);p.setStrokeJoin(skia.Paint.kRound_Join)
 return p
@functools.lru_cache(None)
def font(n,b=False):
 f=skia.Font(skia.Typeface.MakeFromFile(str(ROOT/'vendor/poppins'/('Poppins-Bold.ttf' if b else 'Poppins-Regular.ttf'))),n);f.setSubpixel(True);return f
def text(c,s,x,y,n=18,color=INK,b=False,align='left',alpha=1):
 f=font(n,b);w=f.measureText(str(s));x-=w/2 if align=='center' else w if align=='right' else 0;c.drawSimpleText(str(s),x,y,f,paint(color,alpha));return w
def lines(s,w,n,b=False):
 out=[];line=''
 for word in s.split():
  test=(line+' '+word).strip()
  if line and font(n,b).measureText(test)>w:out.append(line);line=word
  else:line=test
 if line:out.append(line)
 return out
def para(c,s,x,y,w,n=18,color=INK,b=False,leading=1.35):
 ls=lines(s,w,n,b)
 for i,l in enumerate(ls):text(c,l,x,y+i*n*leading,n,color,b)
 return len(ls)*n*leading
def rr(c,x,y,w,h,r=20,color=WHITE,alpha=1,border=None):
 rect=skia.Rect.MakeXYWH(x,y,w,h);c.drawRoundRect(rect,r,r,paint(color,alpha))
 if border:c.drawRoundRect(rect,r,r,paint(border,1,2))
def ellipse(c,x,y,rx,ry,color=WHITE,alpha=1):c.drawOval(skia.Rect.MakeLTRB(x-rx,y-ry,x+rx,y+ry),paint(color,alpha))
def line(c,pts,color=TEAL,width=3,alpha=1):
 p=skia.Path();p.moveTo(*pts[0])
 for v in pts[1:]:p.lineTo(*v)
 c.drawPath(p,paint(color,alpha,width))
def arrow(c,x1,y1,x2,y2,color=TEAL,width=4,alpha=1):
 line(c,[(x1,y1),(x2,y2)],color,width,alpha);a=math.atan2(y2-y1,x2-x1)
 line(c,[(x2-11*math.cos(a-.5),y2-11*math.sin(a-.5)),(x2,y2),(x2-11*math.cos(a+.5),y2-11*math.sin(a+.5))],color,width,alpha)
def gradient(c,x,y,w,h,colors,vertical=False):
 p=skia.Paint(AntiAlias=True);p.setShader(skia.GradientShader.MakeLinear([(x,y),(x if vertical else x+w,y+h if vertical else y)],[col(a) for a in colors]));c.drawRect(skia.Rect.MakeXYWH(x,y,w,h),p)
def ease(v):v=max(0,min(1,v));return v*v*(3-2*v)
def clamp(v):return max(0,min(1,v))
@functools.lru_cache(None)
def asset(name):
 im=Image.open(ROOT/name).convert('RGBA');box=im.getchannel('A').getbbox()
 if box:im=im.crop(box)
 buf=im.tobytes();return skia.Image.frombytes(buf,im.size,skia.ColorType.kRGBA_8888_ColorType)
def art(c,name,x,y,w,h,zoom=1,alpha=1,mirror=False):
 im=asset(name);ratio=min(w/im.width(),h/im.height())*zoom;iw,ih=im.width()*ratio,im.height()*ratio
 c.save();c.translate(x+w/2,y+h/2);c.scale(-1 if mirror else 1,1)
 c.drawImageRect(im,skia.Rect.MakeXYWH(-iw/2,-ih/2,iw,ih),skia.SamplingOptions(skia.CubicResampler.Mitchell()),paint(WHITE,alpha));c.restore()
def tag(c,s,x,y,w=None,active=False):
 w=w or font(13,True).measureText(s)+26;rr(c,x,y,w,32,16,TEAL if active else WHITE);text(c,s,x+w/2,y+22,13,WHITE if active else TEAL,True,'center')
def header(c,index=None,outro=False):
 gradient(c,0,0,1280,146,[NAVY,'#125b7c']);rr(c,0,142,1280,4,0,CYAN)
 text(c,'NATATION',48,37,19,WHITE,True);text(c,'6e',168,37,19,CYAN,True)
 text(c,'LE PARCOURS AQUATIQUE',1232,36,12,'#a4eaf3',True,'right')
 if index is None:
  text(c,'Parcours terminé !' if outro else 'Prêt pour le parcours ?',48,108,42,WHITE,True)
  tag(c,'BRAVO !' if outro else '10 ÉTAPES',1080,79,152)
 else:
  rr(c,48,64,64,60,19,CYAN);text(c,f'{index+1:02}',80,105,30,NAVY,True,'center')
  text(c,TITLES[index],134,108,41,WHITE,True)
  tag(c,'RETOUR' if index>=5 else 'DEMI-TOUR' if index==4 else 'ALLER',1118,84,114)
def stage(c):
 rr(c,48,178,752,407,26,'#cee6ee')
 c.save();c.clipRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(48,172,752,407),26,26),True)
 gradient(c,48,172,752,407,['#e2fbfd','#bceff7'],True)
 ellipse(c,424,404,328,118,WHITE,.35);c.restore();rr(c,824,172,408,407,26,WHITE)
def footer(c,index,t):
 rr(c,48,603,1184,83,22,WHITE)
 for i in range(10):
  x=63+i*117;active=i==index;done=index is not None and i<index
  rr(c,x,614,105,4,2,TEAL if active else GREEN if done else '#e3eef3')
  text(c,f'{i+1:02}',x+52.5,643,15,TEAL if active else GREEN if done else MUTED,True,'center')
  label=lines(SHORT[i],109,11.5,True)
  for j,l in enumerate(label):text(c,l,x+52.5,662+j*14,11.5,INK if active else MUTED,True,'center')
 text(c,'Application EPS · Le Bon Sauveur',48,708,10,MUTED)
 text(c,'Créée par L. RIGAUX',1232,708,10,MUTED,False,'right')
def info(c,i,local):
 text(c,'À RETENIR',852,209,12,TEAL,True)
 n=26;h=para(c,HEADS[i],852,249,350,n,INK,True,1.2);y=249+h+18
 for j,s in enumerate(DETAILS[i]):
  # Progressive emphasis keeps each cue readable without hiding information.
  a=.68+.32*ease(local*.8-j*.3);ellipse(c,858,y-6,3,3,TEAL,a);used=para(c,s,873,y,322,17,INK,False,1.35);y+=used+15
 if i not in (2,6):tag(c,'SANS APPUI' if i in (4,8) else 'RESPIRATION CALME' if i in (0,3,5) else 'UN SEUL OBSTACLE' if i in (1,7) else 'AU BORD',852,523,350)
def countdown(c,local):
 remain=max(0,15-int(local*3+.0001));progress=clamp(local/5)
 # Show zero briefly before transitioning; the exercise itself remains 15 s.
 if local>=4.9:remain=0
 cx,cy=1028,445;r=55
 c.drawArc(skia.Rect.MakeLTRB(cx-r,cy-r,cx+r,cy+r),-90,360,False,paint('#e3f2f6',1,7))
 c.drawArc(skia.Rect.MakeLTRB(cx-r,cy-r,cx+r,cy+r),-90,360*progress,False,paint(TEAL,1,7))
 text(c,remain,cx,cy+12,45,INK,True,'center');text(c,'secondes à tenir',cx,cy+34,11.5,MUTED,False,'center')
 tag(c,'15 s montrées en 5 s · ×3',869,523,318,True)
def transit_cards(c,local):
 active=0 if local<1.5 else 1 if local<3.3 else 2
 names=['action-04-ventrale.png','action-05-surplace.png','action-07-dorsale.png'];labels=['J’arrive en crawl','Je me redresse','Je repars sur le dos']
 for j in range(3):
  x=65+j*242
  rr(c,x,220,226,303,20,WHITE,.96,border=TEAL if j==active else None)
  art(c,names[j],x+15,250,196,205,1.02 if j==active else .96)
  for k,l in enumerate(lines(labels[j],202,14,True)):text(c,l,x+113,486+k*19,14,TEAL if j==active else INK,True,'center')
  if j<2:arrow(c,x+229,373,x+239,373,TEAL,3)
 tag(c,'DEMI-TOUR SANS TOUCHER LE FOND',183,538,478,True)
def obstacles(c,i,local,duration):
 for j,label in enumerate(['SOUS LE TAPIS','DANS LE CERCEAU']):
  x=65+j*373;rr(c,x,223,346,293,21,WHITE,.82)
  name=ART[i] if j==0 else 'assets/v23/weighted-hoop.png'
  art(c,name,x+18,266,310,192,1+.025*ease(local/duration))
  tag(c,label,x+23,239,300)
 ellipse(c,424,367,25,25,NAVY);text(c,'OU',424,373,15,WHITE,True,'center')
 tag(c,'UN SEUL DES DEUX OBSTACLES',186,538,476,True)
def ring(c,local):
 # A montage of distinct actions: no upside-down figure moving upwards.
 phase=0 if local<2 else 1 if local<6.1 else 2 if local<8.4 else 3
 names=['action-04-ventrale.png','ateliers/immersion-object-v19.png','assets/v24/front-glide.png','action-04-ventrale.png']
 labels=['J’approche en crawl','Je récupère l’anneau','Je remonte vers la surface','Je repars en crawl']
 art(c,names[phase],102,220,644,285,1+.025*math.sin(local*.35),mirror=phase in (0,2,3))
 for j,label in enumerate(['CRAWL','PLONGEON CANARD','REMONTÉE','CRAWL']):
  x=66+j*183;rr(c,x,523,174,36,13,TEAL if j==phase else WHITE);text(c,label,x+87,547,11.5,WHITE if j==phase else INK,True,'center')
 if phase==2:
  arrow(c,637,482,570,435,TEAL,5)
  # Gold ring beside the outstretched hand: an illustration of the object carried.
  c.drawOval(skia.Rect.MakeLTRB(94,378,119,399),paint('#e5ad22',1,4))
 tag(c,labels[phase],146,190,556)
def overview(c,t,outro=False):
 # Snake layout: 1–5 left to right, 6–10 right to left.
 for i in range(10):
  row=0 if i<5 else 1;slot=i if i<5 else 9-i;x=48+slot*240;y=176+row*208
  rr(c,x,y,224,190,21,WHITE)
  rr(c,x+12,y+12,31,31,10,GREEN if outro else TEAL)
  if outro:line(c,[(x+20,y+28),(x+26,y+34),(x+36,y+22)],WHITE,3)
  else:text(c,i+1,x+27.5,y+34,16,WHITE,True,'center')
  art(c,ART[i],x+35,y+30,154,112,1+.02*ease(t/3))
  text(c,SHORT[i],x+112,y+171,14,INK,True,'center')
  if slot<4:arrow(c,x+228,y+96,x+237,y+96,TEAL,3) if row==0 else arrow(c,x+237,y+96,x+228,y+96,TEAL,3)
 arrow(c,1240,338,1240,402,TEAL,3)
 rr(c,48,602,1184,84,22,NAVY)
 text(c,'Je garde une respiration calme et je rejoins le bord.' if outro else 'Deux flottaisons de 15 s · Tapis OU cerceau à chaque immersion',640,652,22,WHITE,True,'center')
 text(c,'Application EPS · Le Bon Sauveur',48,708,10,MUTED);text(c,'Créée par L. RIGAUX',1232,708,10,MUTED,False,'right')
def scene(c,t):
 rr(c,0,0,1280,720,0,BG)
 i=next((i for i,(a,z) in enumerate(TIMES) if a<=t<z),None)
 outro=t>=66;header(c,i,outro)
 if i is None:overview(c,t-66 if outro else t,outro);return
 local=t-TIMES[i][0];duration=TIMES[i][1]-TIMES[i][0];stage(c);info(c,i,local)
 if i in (1,7):obstacles(c,i,local,duration)
 elif i==4:transit_cards(c,local)
 elif i==8:ring(c,local)
 else:
  # Camera zoom changes the framing only; the swimmer's body is untouched.
  art(c,ART[i],94,202,660,315,1+.035*ease(local/duration))
  tag(c,'15 SECONDES À TENIR' if i in (2,6) else 'ENTRÉE PIEDS EN PREMIER' if i==0 else 'BRAS ALTERNÉS' if i in (3,5) else 'JE TIENS LE BORD',155,532,538,True)
  if i in (3,5):
   p=clamp(local/duration);left,right=(184,660) if i==3 else (660,184);end=left+(right-left)*(.4+.6*ease(p));arrow(c,left,493,end,493,TEAL,4,.8)
 if i in (2,6):countdown(c,local)
 footer(c,i,t)
def frame(t,w=3840,h=2160):
 surf=skia.Surface.MakeRasterN32Premul(w,h);c=surf.getCanvas();c.scale(w/1280,h/720)
 starts=[0,3,*[z for _,z in TIMES]];start=max(a for a in starts if a<=t)
 if start>0 and t-start<.25:
  scene(c,start-.001);p=paint(WHITE,ease((t-start)/.25));c.saveLayer(None,p);scene(c,t);c.restore()
 else:scene(c,t)
 return surf.makeImageSnapshot()
def captions():
 def tc(t):return f'00:{t//60:02}:{t%60:02}.000'
 return 'WEBVTT\n\n'+'\n\n'.join(f'{tc(a)} --> {tc(z)}\n{CUES[i]}'+(' Démonstration accélérée ×3 : 15 secondes à réaliser.' if i in (2,6) else '') for i,(a,z) in enumerate(TIMES))+'\n'
def chapters():
 s=';FFMETADATA1\ntitle=Le parcours aquatique — capsule illustrée\nartist=Le Bon Sauveur — Saint-Lô\n'
 for a,z,title in [(0,3,'Le parcours')]+[(a,z,TITLES[i]) for i,(a,z) in enumerate(TIMES)]+[(66,69,'Parcours terminé')]:s+=f'[CHAPTER]\nTIMEBASE=1/1000\nSTART={a*1000}\nEND={z*1000}\ntitle={title}\n'
 return s
def audio(path):
 rate=48000;data=np.zeros((DURATION*rate,2),np.float32)
 def tone(at,f,d=.25,amp=.025):
  tt=np.arange(int(d*rate))/rate;sig=np.sin(2*np.pi*f*tt)*np.sin(np.pi*tt/d)**2*amp;start=int(at*rate);n=min(len(sig),len(data)-start)
  if n>0:data[start:start+n]+=sig[:n,None]
 for at in [0,*[a for a,_ in TIMES],66]:tone(at+.04,587,.35,.018);tone(at+.18,880,.3,.012)
 for at in [16,37]:
  for k in range(1,15):tone(at+k/3,1108,.04,.008)
  tone(at+4.9,1174,.25,.012)
 for f in [293,370,440]:tone(67,f,1.5,.012)
 with wave.open(str(path),'wb')as o:o.setnchannels(2);o.setsampwidth(2);o.setframerate(rate);o.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())
def render():
 if '--preview' in sys.argv:
  for t in [1.5,4.5,11,18,23,27,28.5,30,33.5,38.5,45,51,54,57,59.5,64,67]:frame(t,1280,720).save(str(WORK/f'preview-{t:g}.png'),skia.kPNG)
  return
 audio(WORK/'audio.wav');(WORK/'chapters.txt').write_text(chapters());(MEDIA/'parcours-aquatique-v31.vtt').write_text(captions());frame(4.5).save(str(MEDIA/'parcours-aquatique-v31.png'),skia.kPNG)
 target=WORK/'silent-4k.mp4';cmd=['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgra','-s','3840x2160','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','20','-maxrate','1200k','-bufsize','2400k','-threads','6','-pix_fmt','yuv420p','-g','60','-movflags','+faststart',str(target)]
 proc=subprocess.Popen(cmd,stdin=subprocess.PIPE);started=time.monotonic()
 try:
  for i in range(FPS*DURATION):
   proc.stdin.write(frame(i/FPS).tobytes())
   if i%90==0:print(f'{i/FPS:g}/{DURATION} s · {i/(time.monotonic()-started+.001):.1f} fps',flush=True)
 finally:proc.stdin.close()
 if proc.wait():raise RuntimeError('4K encoding failed')
 master=MEDIA/'parcours-aquatique-v31-4k.mp4'
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(target),'-i',str(WORK/'audio.wav'),'-i',str(WORK/'chapters.txt'),'-map','0:v:0','-map','1:a:0','-map_metadata','2','-map_chapters','2','-c:v','copy','-c:a','aac','-b:a','64k','-ar','48000','-t',str(DURATION),'-movflags','+faststart',str(master)],check=True)
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(master),'-map','0:v:0','-map','0:a:0','-map_metadata','0','-map_chapters','0','-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','fast','-crf','20','-maxrate','900k','-bufsize','1800k','-threads','6','-c:a','copy','-movflags','+faststart',str(MEDIA/'parcours-aquatique-v31.mp4')],check=True)
 print('DONE V31',flush=True)
if __name__=='__main__':render()
