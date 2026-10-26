"""Natation 6e — original vector motion design, native UHD, deterministic 30 fps.
Render: PYTHONPATH=/tmp/natation-render python3 video-production/render_parcours_v28.py
Dependency: skia-python 144.1, numpy, scipy, ffmpeg. No external generation service.
"""
from pathlib import Path
import argparse, math, subprocess, json, functools, time, wave
import numpy as np
import skia
ROOT=Path(__file__).resolve().parent.parent
MEDIA=ROOT/'media'; MEDIA.mkdir(exist_ok=True)
W,H=1280,720; FPS=30; DURATION=108
NAVY='#10334d'; INK='#143c55'; TEAL='#009db7'; CYAN='#4ed7e7'; SKIN='#f5b07c'; FAR='#ce8b63'; BLUE='#235ad2'; RED='#f45663'; WHITE='#ffffff'
STEPS=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{AQUATIC_STEPS}from './aquatic-model-v27.js';console.log(JSON.stringify(AQUATIC_STEPS))"],cwd=ROOT))
TITLES=['Le saut arrière','L’immersion aller','La flottaison debout','La nage ventrale','Le demi-tour','La nage dorsale','L’étoile de mer dorsale','L’immersion retour','Je récupère l’anneau','Je m’accroche au bord']
CUES=[
 'Je saute en arrière, bras le long du corps, pieds en premier.',
 'Je franchis un seul obstacle : sous le tapis OU dans le cerceau.',
 'Je garde le cou hors de l’eau et je respire librement pendant 15 secondes.',
 'Je repars sur le ventre jusqu’au demi-tour.',
 'Je fais demi-tour sans toucher le fond, puis je m’oriente sur le dos.',
 'Je nage sur le dos jusqu’à la zone de flottaison.',
 'Je reste à plat pendant 15 secondes, bouche et orteils hors de l’eau.',
 'Je repars sur le dos, puis je franchis le tapis OU le cerceau.',
 'Je récupère et je remonte l’anneau, sans prendre appui.',
 'Je rejoins le bord et je m’y accroche.'
]
@functools.lru_cache(None)
def color(s):
 if isinstance(s,int):return s
 s=s.lstrip('#');return skia.Color(int(s[0:2],16),int(s[2:4],16),int(s[4:6],16),255)
def paint(s=INK,alpha=1,width=None):
 p=skia.Paint(AntiAlias=True,Color=color(s));p.setAlphaf(alpha)
 if width is not None:p.setStyle(skia.Paint.kStroke_Style);p.setStrokeWidth(width);p.setStrokeCap(skia.Paint.kRound_Cap);p.setStrokeJoin(skia.Paint.kRound_Join)
 return p
@functools.lru_cache(None)
def font(n,b=False):
 f=skia.Font(skia.Typeface.MakeFromFile(str(ROOT/('vendor/poppins/Poppins-Bold.ttf' if b else 'vendor/poppins/Poppins-Regular.ttf'))),n)
 f.setSubpixel(True);return f
def txt(c,s,x,y,n=20,col=INK,b=False,align='left',alpha=1):
 f=font(n,b);w=f.measureText(str(s));x-=w/2 if align=='center' else w if align=='right' else 0
 c.drawSimpleText(str(s),x,y,f,paint(col,alpha));return w
def lines(s,width,n,b=False):
 out=[];line=''
 for word in s.split():
  test=(line+' '+word).strip()
  if line and font(n,b).measureText(test)>width:out.append(line);line=word
  else:line=test
 if line:out.append(line)
 return out
def para(c,s,x,y,width,n=22,col=INK,b=False,align='left',leading=1.38):
 for i,line in enumerate(lines(s,width,n,b)):txt(c,line,x,y+i*n*leading,n,col,b,align)
def rr(c,x,y,w,h,r=16,col=WHITE,alpha=1,stroke=None,width=1):
 rect=skia.Rect.MakeXYWH(x,y,w,h);c.drawRoundRect(rect,r,r,paint(col,alpha))
 if stroke:c.drawRoundRect(rect,r,r,paint(stroke,1,width))
def ellipse(c,x,y,rx,ry,col,alpha=1,stroke=None,width=1):
 rect=skia.Rect.MakeLTRB(x-rx,y-ry,x+rx,y+ry);c.drawOval(rect,paint(col,alpha))
 if stroke:c.drawOval(rect,paint(stroke,1,width))
def path(c,pts,col=INK,width=3,alpha=1,close=False):
 p=skia.Path();p.moveTo(*pts[0])
 for q in pts[1:]:p.lineTo(*q)
 if close:p.close()
 c.drawPath(p,paint(col,alpha,None if close else width))
def curve(c,commands,col,width=None,alpha=1):
 p=skia.Path()
 for op,v in commands:
  getattr(p,{'M':'moveTo','L':'lineTo','C':'cubicTo','Q':'quadTo','Z':'close'}[op])(*v)
 c.drawPath(p,paint(col,alpha,width))
def grad(c,x,y,w,h,colors,vertical=True):
 p=skia.Paint(AntiAlias=True);p.setShader(skia.GradientShader.MakeLinear([(x,y),(x if vertical else x+w,y+h if vertical else y)],[color(a) for a in colors]));c.drawRect(skia.Rect.MakeXYWH(x,y,w,h),p)
def clamp(x,a=0,b=1):return max(a,min(b,x))
def ease(x):x=clamp(x);return x*x*(3-2*x)
def lerp(a,b,p):return a+(b-a)*p
def point(a,b,p):return (lerp(a[0],b[0],p),lerp(a[1],b[1],p))
def capsule(c,a,b,w,col,alpha=1):path(c,[a,b],col,w,alpha)
def limb(c,pts,w,col):
 path(c,pts,col,w)
 for p in pts[1:-1]:ellipse(c,*p,w*.48,w*.48,col)
def ik(a,b,l1,l2,sign=-1):
 dx,dy=b[0]-a[0],b[1]-a[1];d=max(.01,min(math.hypot(dx,dy),l1+l2-.01));theta=math.atan2(dy,dx);a1=math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1))
 return a[0]+l1*math.cos(theta+sign*a1),a[1]+l1*math.sin(theta+sign*a1)
def ring(c,x,y,r=13):
 ellipse(c,x,y,r,r,WHITE,0, '#d39e22',5);ellipse(c,x,y-1,r-1,r-1,WHITE,0,'#ffde62',3)
def head_profile(c,x,y,back=False):
 c.save();c.translate(x,y)
 if back:c.scale(1,-1)
 ellipse(c,0,0,23,23,SKIN)
 curve(c,[('M',[-22,3]),('C',[-30,-30,24,-35,22,-5]),('C',[9,-8,-5,-5,-22,3]),('Z',[])],RED)
 curve(c,[('M',[-17,-14]),('C',[-8,-23,7,-25,14,-16])],'#ff9da2',2.5,.65)
 path(c,[(-15,4),(18,8)],'#103b69',5)
 rr(c,1,1,22,13,5,'#194e91');rr(c,6,3,13,7,3,'#78e3ee')
 curve(c,[('M',[21,10]),('L',[29,15]),('L',[20,18]),('Z',[])],SKIN)
 path(c,[(16,23),(22,22)],'#97603f',1.6)
 c.restore()
def swimmer(c,x,y,s=1,angle=0,mode='front',phase=0,hand=None,has_ring=False,mirror=False):
 """Articulated side-view swimmer. Coordinates / bone angles are animated, not a sliding still."""
 c.save();c.translate(x,y);c.rotate(angle);c.scale(-s if mirror else s,s)
 back=mode=='back';ph=phase
 arms=[]
 for j in [1,0]:
  a=(42,-4+j*8);p=ph+j*math.pi
  target=(a[0]+77*math.cos(p),a[1]+(48 if math.sin(p)<0 else 29)*math.sin(p))
  if j==0 and hand is not None:target=hand
  elbow=ik(a,target,43,43,-1)
  arms.append((j,a,elbow,target))
 # Far arm and leg, then the body, then near limbs.
 j,a,e,b=arms[0];limb(c,[a,e,b],11,FAR);ellipse(c,*b,8,5,FAR)
 for j in [1,0]:
  kick=math.sin(ph*2+j*math.pi);a=(-25,j*6-2);k=(-68,4+7*kick);ank=(-111,4+12*kick);toe=(-132,1+14*kick)
  limb(c,[a,k],18,FAR if j else SKIN);limb(c,[k,ank,toe],11,FAR if j else SKIN)
 curve(c,[('M',[-31,-16]),('C',[-11,-22,25,-29,52,-18]),('Q',[66,-11,72,-3]),('L',[69,10]),('C',[39,27,1,20,-29,18]),('Z',[])],SKIN)
 curve(c,[('M',[-34,-17]),('L',[-9,-19]),('L',[-4,22]),('L',[-31,21]),('Z',[])],BLUE)
 curve(c,[('M',[-26,-16]),('L',[-14,-18]),('L',[-11,19]),('L',[-23,21]),('Z',[])],'#34c9e9')
 path(c,[(0,-15),(41,-18)],'#ffd2a5',3,.6)
 capsule(c,(56,-3),(79,-4),22,SKIN)
 head_profile(c,95,-5,back)
 j,a,e,b=arms[1];limb(c,[a,e,b],12,SKIN);path(c,[a,e],'#ffd1a4',2,.4);ellipse(c,*b,8,5,SKIN)
 if has_ring:ring(c,b[0]+5,b[1]+10,12)
 c.restore()
 return b

def upright(c,x,y,s=1,t=0,arms='scull',side=False,bend=0,grip=None,has_ring=False):
 c.save();c.translate(x,y);c.scale(s,s)
 # Far leg then near leg; knees stay well above the floor in all pool shots.
 for j in [-1,1]:
  motion=math.sin(t*4+j)*5 if arms=='scull' else 0
  hip=(j*13,2);knee=(j*(17+bend*11)+motion,53-bend*12);ank=(j*20-motion,110-bend*19)
  limb(c,[hip,knee],21,FAR if j==-1 else SKIN);limb(c,[knee,ank,(ank[0]+j*11,ank[1]+5)],14,FAR if j==-1 else SKIN)
 curve(c,[('M',[-24,-84]),('Q',[0,-99,24,-84]),('L',[19,-15]),('Q',[0,-7,-19,-15]),('Z',[])],SKIN)
 rr(c,-23,-19,46,39,7,BLUE);path(c,[(1,-13),(1,17)],'#143f9b',2);path(c,[(-17,-14),(-17,14)],'#35c9e5',7)
 capsule(c,(0,-87),(0,-101),21,SKIN)
 for j in [-1,1]:
  shoulder=(j*24,-79)
  if arms=='down':elbow=(j*25,-37);hand=(j*24,4)
  elif grip is not None and j==-1:hand=grip;elbow=ik(shoulder,hand,42,43,-1)
  elif has_ring and j==1:elbow=(48,-109);hand=(55,-148)
  else:
   elbow=(j*47,-58+4*math.sin(t*4));hand=(j*(62+6*math.cos(t*4)),-42+7*math.sin(t*4+j))
  limb(c,[shoulder,elbow,hand],12,SKIN);ellipse(c,*hand,6,8,SKIN)
  if has_ring and j==1:ring(c,hand[0],hand[1]-11,13)
 ellipse(c,0,-123,25,28,SKIN)
 if side:
  curve(c,[('M',[-26,-124]),('C',[-28,-161,29,-158,25,-121]),('L',[5,-132]),('Z',[])],RED)
  path(c,[(-20,-126),(18,-124)],'#123e70',5);rr(c,-26,-131,20,13,5,'#164e88');rr(c,-23,-129,13,7,3,'#8debf0')
  curve(c,[('M',[-23,-119]),('L',[-33,-111]),('L',[-23,-107]),('Z',[])],SKIN);path(c,[(-20,-102),(-11,-102)],'#92573c',1.5)
 else:
  curve(c,[('M',[-25,-127]),('C',[-31,-163,31,-163,25,-127]),('Q',[0,-137,-25,-127]),('Z',[])],RED)
  curve(c,[('M',[-17,-141]),('Q',[-7,-150,9,-145])],'#ffa5ac',2.5,.8)
  path(c,[(-24,-126),(24,-126)],'#133b66',5)
  for ex in [-12,12]:rr(c,ex-10,-132,20,14,5,'#154983');rr(c,ex-6,-129,12,8,3,'#91eaf0')
  path(c,[(-3,-115),(0,-112),(3,-115)],'#d48b61',1.5)
  curve(c,[('M',[-9,-105]),('Q',[0,-99,9,-105])],'#995d43',2)
 c.restore()

def star(c,x,y,t=0,s=1):
 c.save();c.translate(x,y);c.scale(s,s)
 # Plan view: symmetrical extended limbs, calm natural breathing.
 breathe=math.sin(t*1.5)*1.1
 for j in [-1,1]:
  limb(c,[(j*15,7),(j*37,52),(j*62,100)],18,SKIN)
  capsule(c,(j*62,100),(j*69,108),12,SKIN)
  limb(c,[(j*24,-66),(j*61,-56+breathe),(j*93,-84+breathe)],12,SKIN)
  ellipse(c,j*93,-84+breathe,7,9,SKIN)
 curve(c,[('M',[-26,-70]),('Q',[0,-82,26,-70]),('L',[19,-3]),('Q',[0,7,-19,-3]),('Z',[])],SKIN)
 rr(c,-22,-9,44,34,7,BLUE);path(c,[(-15,-5),(-15,20)],'#35c9e5',6)
 capsule(c,(0,-73),(0,-91),20,SKIN);ellipse(c,0,-110,23,28,SKIN)
 curve(c,[('M',[-24,-114]),('C',[-28,-148,28,-148,24,-114]),('Q',[0,-122,-24,-114]),('Z',[])],RED)
 path(c,[(-24,-114),(24,-114)],'#153e6b',4)
 for ex in [-11,11]:rr(c,ex-9,-120,18,13,5,'#154983');rr(c,ex-6,-117,12,7,3,'#91eaf0')
 curve(c,[('M',[-7,-96]),('Q',[0,-90,7,-96])],'#955b3e',2)
 c.restore()

def ripple(c,x,y,t,width=80):
 for k in range(2):
  p=(t*.5+k*.5)%1;ellipse(c,x,y,width*(.55+p*.45),4+p*9,WHITE,0,WHITE,1.5)

def bubbles(c,x,y,t,count=6):
 for k in range(count):
  p=(t*.7+k/count)%1
  ellipse(c,x+math.sin(k*4+p*5)*15,y-p*65,1.8+2.5*p,1.8+2.5*p,WHITE,.45*(1-p),WHITE,0.6)

def wave_line(c,t,x1,x2,sy,alpha=1):
 pts=[(x,sy+1.4*math.sin(x*.035+t*1.8)+.8*math.sin(x*.07-t)) for x in np.arange(x1,x2+4,4)]
 path(c,pts,WHITE,2.4,alpha)

def pool(c,t,water=325,top=False,rect=(32,174,1216,407),floor=True):
 x,y,w,h=rect
 rr(c,x,y+5,w,h,23,'#d4e7ee')
 c.save();c.clipRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x,y,w,h),22,22),True)
 grad(c,x,y,w,h,['#f9fdff','#e6f5fa'])
 if top:
  grad(c,x,y,w,h,['#58d9e8','#16a9cd'])
  for k in range(4):
   yy=y+55+k*95
   curve(c,[('M',[x-20,yy]),('C',[x+w*.35,yy-40+5*math.sin(t),x+w*.64,yy+35,x+w+20,yy-3])],WHITE,1.3,.13)
 else:
  grad(c,x,water,w,y+h-water,['#75dfea','#29afd2'])
  if floor:
   rr(c,x,y+h-12,w,12,0,'#b4e8ed')
   path(c,[(x,y+h-12),(x+w,y+h-12)],WHITE,2,.65)
  wave_line(c,t,x,x+w,water)
 c.restore()

def submerge_tint(c,water,rect=(32,174,1216,407)):
 x,y,w,h=rect;c.save();c.clipRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x,y,w,h),22,22),True)
 rr(c,x,water,w,max(0,y+h-water),0,'#20b7d8',.1);c.restore()

def tag(c,label,x,y,width=None):
 width=width or font(12,True).measureText(label)+28;rr(c,x,y,width,29,14,WHITE,.86);txt(c,label,x+width/2,y+20,12,INK,True,'center')

def callout(c,title,body,x=916,y=231,w=286):
 rr(c,x,y,w,94,18,WHITE,.94)
 txt(c,title,x+18,y+30,18,INK,True)
 para(c,body,x+18,y+55,w-36,13,'#40657a',False,leading=1.45)

def counter(c,t,x=1030,y=420):
 elapsed=clamp(t,0,15);remaining=max(0,15-math.floor(elapsed+1e-7))
 ellipse(c,x,y,79,79,WHITE,.94)
 rect=skia.Rect.MakeLTRB(x-66,y-66,x+66,y+66)
 c.drawArc(rect,-90,360,False,paint('#e0f0f4',1,7));c.drawArc(rect,-90,360*elapsed/15,False,paint(TEAL,1,7))
 txt(c,remaining,x,y+12,50,INK,True,'center');txt(c,'secondes',x,y+35,13,'#40657a',False,'center')
 txt(c,'JE TIENS 15 SECONDES',x,y+112,13,INK,True,'center')

def panel_clip(c):c.save();c.clipRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(32,174,1216,407),22,22),True)

def overview(c,t,outro=False):
 pool(c,t,top=True)
 pts=[(106,293),(960,293)];p=skia.Path();p.moveTo(106,293);p.lineTo(1065,293);p.cubicTo(1190,293,1190,472,1065,472);p.lineTo(106,472)
 c.drawPath(p,paint(WHITE,.65,7));path(c,[(125,461),(106,472),(125,483)],WHITE,5,.75)
 positions=[(115,293),(340,293),(560,293),(780,293),(1110,378),(965,472),(755,472),(540,472),(320,472),(115,472)]
 labels=['Saut arrière','Immersion','Debout · 15 s','Nage ventrale','Demi-tour','Nage dorsale','Étoile · 15 s','Immersion','Anneau','Au bord']
 for i,((x,y),label) in enumerate(zip(positions,labels)):
  ellipse(c,x,y,23,23,WHITE,.98)
  if outro:path(c,[(x-9,y),(x-2,y+7),(x+11,y-8)],'#14816e',4)
  else:txt(c,i+1,x,y+7,19,INK,True,'center')
  txt(c,label,x,y+47 if i<5 else y-39,14,INK,True,'center')
 tag(c,'ALLER',68,196);tag(c,'RETOUR',68,529)
 if not outro:
  progress=ease(t/5);swimmer(c,200+600*progress,370,.31,phase=t*4)
 else:
  rr(c,425,342,430,68,20,WHITE,.98);txt(c,'Parcours terminé !',640,386,29,INK,True,'center')

def entry(c,t):
 pool(c,t,water=360)
 panel_clip(c)
 # Deck is to the left. The swimmer faces away from the water and actively jumps backward.
 rr(c,32,360,237,221,0,'#c3dce6');rr(c,32,350,243,13,4,'#f9fdff');path(c,[(269,363),(269,581)],'#98c6d7',3)
 for yy in [400,447,494,541]:path(c,[(32,yy),(268,yy)],'#dcecf2',1)
 for xx in [80,146,212]:path(c,[(xx,364),(xx,581)],'#dcecf2',1)
 if t<1.2:
  x=222;bend=math.sin(t/1.2*math.pi)*.4;y=278+bend*19*.62
 elif t<2.8:
  p=(t-1.2)/1.6;x=lerp(222,460,p);y=278-45*math.sin(math.pi*p)+112*p*p;bend=0
 elif t<3.8:
  p=ease((t-2.8)/1);x=lerp(460,492,p);y=lerp(390,449,p);bend=0
 else:x=492;y=lerp(449,413,ease((t-3.8)/1.5));bend=0
 upright(c,x,y,.62,t,arms='down' if t<3.4 else 'scull',side=True,bend=bend)
 if t>2.2:
  ripple(c,lerp(375,492,ease((t-2.2)/1.5)),360,t-2.2,61)
  if t<3.1:
   q=(t-2.2)/.9
   for k in range(9):
    a=-math.pi+(k/8)*math.pi;px=385+(25+q*50)*math.cos(a);py=360-65*math.sin(math.pi*q)*abs(math.sin(a));ellipse(c,px,py,2.2*(1-q)+.5,4*(1-q)+.5,WHITE,.85)
 submerge_tint(c,360);wave_line(c,t,276,1248,360)
 c.restore();tag(c,'VUE DE PROFIL',53,194)
 callout(c,'Je pousse avec mes jambes','Bras le long du corps.\nEntrée pieds en premier.',850,220,348)


def obstacle(c,t,duration,returning=False):
 # Alternatives shown simultaneously. Each swimmer traverses ONE obstacle.
 rectangles=[(32,174,592,407),(656,174,592,407)]
 for which,rect in enumerate(rectangles):
  x,y,w,h=rect;water=311;pool(c,t,water=water,rect=rect)
  c.save();c.clipRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(*rect),22,22),True)
  p=clamp(t/duration);travel=ease(p)
  sx=x+75+(w-150)*travel
  if returning:sx=x+w-75-(w-150)*travel
  depth=math.sin(math.pi*clamp((p-.12)/.78))**1.3 if .12<p<.9 else 0
  sy=water+7+83*depth
  direction=180 if returning else 0
  mode='back' if returning and (p<.15 or p>.87) else 'front'
  matx=x+w/2
  if which==0:
   rr(c,matx-72,water-14,144,20,7,'#f6c348');rr(c,matx-72,water-16,144,12,5,BLUE);path(c,[(matx-60,water-14),(matx+60,water-14)],'#71c5ee',2)
  else:
   # Elliptical hoop; the front arc is redrawn after the swimmer for true occlusion.
   ellipse(c,matx,water+88,24,68,WHITE,0,'#ffdb66',8)
   rr(c,matx-27,water+158,54,14,6,'#246986');path(c,[(matx,water+151),(matx,water+158)],'#e4b44d',5)
  swimmer(c,sx,sy,.62,0,mode,t*4.8,mirror=returning)
  if depth>.2:bubbles(c,sx+(55 if not returning else -55),sy+8,t,4)
  if which==1:
   recthoop=skia.Rect.MakeLTRB(matx-24,water+20,matx+24,water+156)
   c.drawArc(recthoop,-90,180,False,paint('#ffd45d',1,8));c.drawArc(recthoop,-90,180,False,paint('#fff4c4',.7,2))
  submerge_tint(c,water,rect);wave_line(c,t,x,x+w,water)
  c.restore();tag(c,'SOUS LE TAPIS' if which==0 else 'DANS LE CERCEAU',x+20,196)
  txt(c,'Je passe entièrement sous le tapis.' if which==0 else 'Je passe entièrement dans le cerceau.',x+w/2,552,14,INK,True,'center')
 ellipse(c,640,379,25,25,NAVY);txt(c,'OU',640,385,15,WHITE,True,'center')


def upright_hold(c,t):
 pool(c,t,water=330)
 panel_clip(c);upright(c,539,413+math.sin(t*1.7)*1,1,t);submerge_tint(c,330);wave_line(c,t,32,1248,330);ripple(c,539,330,t,62);c.restore()
 tag(c,'VUE DE PROFIL',53,195);callout(c,'Je respire librement','Cou hors de l’eau.\nAucun appui au fond.',889,205,312);counter(c,t,1044,424)


def swim_scene(c,t,duration,back=False):
 pool(c,t,water=329)
 panel_clip(c);p=ease(t/duration);x=lerp(300,955,p) if not back else lerp(955,300,p)
 swimmer(c,x,337+math.sin(t*5)*1.4,1,0,'back' if back else 'front',t*4.6,mirror=back)
 # Rolling the view, rather than flipping the swimmer upside down: opposite travel uses mirror.
 submerge_tint(c,329);wave_line(c,t,32,1248,329);ripple(c,x,331,t,112);c.restore()
 tag(c,'VUE DE PROFIL',53,195);callout(c,'Je continue sur le dos' if back else 'Je continue sur le ventre','Je rejoins la prochaine étape.',861,218,340)


def turn(c,t):
 pool(c,t,top=True)
 p=ease(t/6);cx,cy,rx,ry=865,375,195,105;a=-math.pi/2+math.pi*p
 x=cx+rx*math.cos(a);y=cy+ry*math.sin(a)
 pathcurve=skia.Path();pathcurve.moveTo(350,270);pathcurve.lineTo(865,270);pathcurve.cubicTo(1125,270,1125,480,865,480);pathcurve.lineTo(350,480)
 c.drawPath(pathcurve,paint(WHITE,.65,6));path(c,[(370,466),(350,480),(370,494)],WHITE,5,.8)
 theta=math.degrees(math.atan2(ry*math.cos(a),-rx*math.sin(a)))
 swimmer(c,x,y,.7,theta,'front' if p<.5 else 'back',t*4.4)
 tag(c,'VUE DE DESSUS',53,195);tag(c,'SUR LE VENTRE',315,219);tag(c,'SUR LE DOS',315,514)
 rr(c,88,326,335,104,20,WHITE,.94);txt(c,'180°',117,370,37,INK,True);para(c,'Je change de direction\nsans toucher le fond.',117,399,280,16)


def star_hold(c,t):
 pool(c,t,top=True)
 for k in range(3):ellipse(c,510,381,155+k*33+math.sin(t*1.5)*2,109+k*25,WHITE,0,WHITE,1.5)
 star(c,510,391,t,1.15)
 tag(c,'VUE DE DESSUS',53,195);callout(c,'Je reste à plat','Bouche et orteils hors de l’eau.\nJe respire calmement.',878,206,323);counter(c,t,1042,426)


def ring_scene(c,t):
 pool(c,t,water=309)
 panel_clip(c)
 # The ring stays on the floor until a visible hand takes it at t=6.2.
 ring_pos=(618,548)
 if t<6.2:ring(c,*ring_pos,13)
 if t<2.4:
  x=lerp(968,714,ease(t/2.4));y=318;angle=180;mode='back';hand=None;has=False
 elif t<5.7:
  p=ease((t-2.4)/3.3);x=lerp(714,616,p);y=lerp(318,442,p);angle=lerp(180,90,p);mode='front';hand=(126,0) if p>.85 else None;has=False
 elif t<6.2:
  x,y,angle=616,442,90;mode='front';hand=(126,0);has=False
 elif t<8.8:
  p=ease((t-6.2)/2.6);x=lerp(616,627,p);y=lerp(442,399,p);angle=lerp(90,270,p);mode='front';hand=(112,8);has=True
 else:
  upright(c,627,392,.88,t,has_ring=True);x=None
 if x is not None:swimmer(c,x,y,.8,0 if t<2.4 else angle,mode,t*3.5,hand,has,mirror=t<2.4)
 if 2.8<t<8.8:bubbles(c,635,410,t,5)
 submerge_tint(c,309);wave_line(c,t,32,1248,309)
 if t>=8.8:ripple(c,627,309,t,70)
 c.restore();tag(c,'VUE DE PROFIL',53,195);callout(c,'Je remonte avec l’anneau','Je le rapporte à la surface,\nsans prendre appui.',870,211,331)


def anchor(c,t):
 pool(c,t,water=329)
 panel_clip(c)
 rr(c,32,329,177,252,0,'#aed4e2');rr(c,32,319,186,14,4,WHITE);path(c,[(209,333),(209,581)],'#80b8cb',3)
 if t<3.5:
  p=ease(t/3.5);x=lerp(850,385,p);swimmer(c,x,337,.85,0,'back',t*4,mirror=True)
 else:
  p=ease((t-3.5)/1.2);x=lerp(385,279,p);upright(c,x,407,.9,t,grip=(-68,-94),side=True)
 submerge_tint(c,329);wave_line(c,t,218,1248,329)
 if t>3.5:ripple(c,279,329,t,59)
 c.restore();tag(c,'VUE DE PROFIL',53,195);callout(c,'Je termine au bord','Je tiens le bord avec les mains.\nLe parcours est terminé.',854,217,347)


def header(c,st,t):
 # Restrained app identity; no total-duration label competing with the action.
 rr(c,32,25,39,39,12,TEAL)
 for yy in [37,44,51]:curve(c,[('M',[41,yy]),('Q',[46,yy+5,51,yy]),('Q',[56,yy-5,62,yy])],WHITE,2.4)
 txt(c,'NATATION',83,51,19,INK,True);txt(c,'6e',198,51,19,TEAL,True)
 txt(c,'LE PARCOURS AQUATIQUE',1248,49,12,'#54798b',True,'right')
 if st is None:
  txt(c,'À toi de jouer !' if t>=103 else 'Découvre ton parcours',32,123,39,INK,True)
  tag(c,'PARCOURS TERMINÉ' if t>=103 else '10 ÉTAPES',1040,93,208)
 else:
  number=st['number'];rr(c,32,87,61,61,19,NAVY);txt(c,f'{number:02d}',62.5,128,27,WHITE,True,'center')
  txt(c,TITLES[number-1],111,128,35,INK,True)
  direction='RETOUR' if number>=6 else 'DEMI-TOUR' if number==5 else 'ALLER'
  tag(c,direction,1092,104,156)

def footer(c,st,t):
 cue=CUES[st['number']-1] if st else ('Je connais le trajet. À moi de réaliser le parcours !' if t>=103 else 'Je repère le trajet et les deux flottaisons de 15 secondes.')
 para(c,cue,640,627,1180,21,INK,True,'center',1.35)
 # Quiet progress indicator, numbered chapters, current chapter clearly visible.
 for i,s in enumerate(STEPS):
  x=48+i*125.7;active=st and st['id']==s['id'];done=t>=s['end'];base='#d6e6ed'
  rr(c,x,690,115,4,2,base)
  q=clamp((t-s['start'])/(s['end']-s['start']));rr(c,x,690,max(.1,115*q),4,2,TEAL if done else '#2866c9')
  txt(c,f'{i+1:02d}',x,682,10,TEAL if done else INK if active else '#829ca9',True)

def frame(t,width=3840,height=2160):
 surf=skia.Surface.MakeRasterN32Premul(width,height);c=surf.getCanvas();c.scale(width/W,height/H);c.clear(color('#f1f7fa'))
 st=next((s for s in STEPS if s['start']<=t<s['end']),None)
 header(c,st,t)
 if st is None:overview(c,t,t>=103)
 else:
  local=t-st['start'];sid=st['id']
  if sid=='entry':entry(c,local)
  elif sid in ['outward','return']:obstacle(c,local,st['end']-st['start'],sid=='return')
  elif sid=='upright':upright_hold(c,local)
  elif sid in ['front','back']:swim_scene(c,local,st['end']-st['start'],sid=='back')
  elif sid=='turn':turn(c,local)
  elif sid=='star':star_hold(c,local)
  elif sid=='ring':ring_scene(c,local)
  elif sid=='anchor':anchor(c,local)
 footer(c,st,t)
 return surf.makeImageSnapshot()

def save_frame(t,path,w=1280,h=720):
 frame(t,w,h).save(str(path),skia.kPNG)

def audio(path):
 """Original quiet sound design: soft chapter cues and restrained interval ticks. No TTS/music stock."""
 rate=48000;n=DURATION*rate;data=np.zeros((n,2),np.float32);rng=np.random.default_rng(28)
 def tone(at,freq,dur=1,amp=.045,pan=0):
  num=int(dur*rate);tt=np.arange(num)/rate;env=(1-np.exp(-tt*35))*np.exp(-tt*4/dur)*(np.cos(np.pi*tt/(2*dur))**2)
  sig=(np.sin(2*np.pi*freq*tt)+.2*np.sin(2*np.pi*freq*2*tt))*env*amp
  i=int(at*rate);m=min(num,n-i)
  if m>0:data[i:i+m,0]+=sig[:m]*(1-pan*.25);data[i:i+m,1]+=sig[:m]*(1+pan*.25)
 for at in [0,*[s['start'] for s in STEPS],103]:
  tone(at+.1,587.33,.85,.035,-.2);tone(at+.25,880,.7,.023,.2)
 for start in [24,57]:
  for sec in range(1,15):tone(start+sec,1108.73,.09,.014)
  tone(start+15,1174.66,.65,.025)
 for f in [293.66,369.99,440]:tone(104,f,2.8,.021)
 # Extremely low, filtered ambience keeps long holds from sounding abruptly empty.
 from scipy.signal import butter,sosfilt
 noise=rng.normal(size=(n,2)).astype(np.float32)
 sos=butter(2,850,fs=rate,output='sos');noise=sosfilt(sos,noise,axis=0).astype(np.float32)
 env=np.minimum(1,np.arange(n)/(rate*2))*np.minimum(1,(n-np.arange(n))/(rate*3))
 data+=noise*.006*env[:,None]
 out=(np.clip(data,-1,1)*32767).astype('<i2')
 with wave.open(str(path),'wb') as wav:wav.setnchannels(2);wav.setsampwidth(2);wav.setframerate(rate);wav.writeframes(out.tobytes())

def metadata():
 out=';FFMETADATA1\ntitle=Le parcours aquatique — Natation 6e\nartist=Le Bon Sauveur — Saint-Lô\ncomment=Animation pédagogique originale — dix étapes\n'
 out+='[CHAPTER]\nTIMEBASE=1/1000\nSTART=0\nEND=5000\ntitle=Présentation\n'
 for st in STEPS:out+=f"[CHAPTER]\nTIMEBASE=1/1000\nSTART={st['start']*1000}\nEND={st['end']*1000}\ntitle={st['number']} · {TITLES[st['number']-1]}\n"
 out+='[CHAPTER]\nTIMEBASE=1/1000\nSTART=103000\nEND=108000\ntitle=Parcours terminé\n'
 return out

def subtitles():
 def tc(t):return f'{int(t)//3600:02d}:{int(t)//60%60:02d}:{int(t)%60:02d}.000'
 cues=[(0,5,'Je découvre mon parcours aquatique.')]+[(st['start'],st['end'],CUES[i]) for i,st in enumerate(STEPS)]+[(103,108,'Parcours terminé. À toi de jouer !')]
 return 'WEBVTT\n\n'+'\n\n'.join(f'{tc(a)} --> {tc(b)}\n{s}' for a,b,s in cues)+'\n'

def render(args):
 work=Path(args.work);work.mkdir(parents=True,exist_ok=True)
 if args.preview:
  moments=[1,6,7.4,9.5,11.5,13,17,21,26,38,41,45,47.2,49,53,62,76,81,87,90.7,91.4,93.4,95,98,101,106]
  for t in moments:save_frame(t,work/f'frame-{t:g}.png')
  print('Previews:',work);return
 if args.clip:
  start,end=map(float,args.clip.split(':'));width,height=(1920,1080);target=work/'motion-review.mp4'
 else:start,end=0,DURATION;width,height=(3840,2160);target=work/'picture-4k.mp4'
 pipe=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','bgra','-s',f'{width}x{height}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','19','-threads','6','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-g',str(FPS*2),'-movflags','+faststart',str(target)],stdin=subprocess.PIPE)
 begin=time.monotonic();count=int(round((end-start)*FPS))
 try:
  for i in range(count):
   img=frame(start+i/FPS,width,height);pipe.stdin.write(img.tobytes())
   if i%(FPS*3)==0:print(f'{start+i/FPS:.1f}/{end}s — {i/(time.monotonic()-begin+0.01):.1f} frames/s',flush=True)
 finally:pipe.stdin.close()
 if pipe.wait():raise RuntimeError('Encoding failed')
 if args.clip:return
 audio(work/'sound.wav');(work/'chapters.txt').write_text(metadata());(MEDIA/'parcours-aquatique-v28.vtt').write_text(subtitles())
 master=MEDIA/'parcours-aquatique-v28-4k.mp4'
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(target),'-i',str(work/'sound.wav'),'-i',str(work/'chapters.txt'),'-map','0:v','-map','1:a','-map_metadata','2','-map_chapters','2','-c:v','libx264','-preset','slow','-crf','23','-threads','6','-c:a','aac','-b:a','80k','-ar','48000','-af','loudnorm=I=-25:TP=-3:LRA=7','-t','108','-movflags','+faststart',str(master)],check=True)
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(master),'-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','slow','-crf','19','-threads','6','-c:a','copy','-movflags','+faststart',str(MEDIA/'parcours-aquatique-v28.mp4')],check=True)
 frame(1).save(str(MEDIA/'parcours-aquatique-v28.png'),skia.kPNG)
 print('Ready:',master,flush=True)
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--preview',action='store_true');ap.add_argument('--clip');ap.add_argument('--work',default='/tmp/natation-v28-render');render(ap.parse_args())
