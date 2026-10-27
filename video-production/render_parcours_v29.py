"""V29: articulated 3D character over a legible pedagogical film.
First render the mesh poses with v29/render_assets.cjs. Then run this script.
The two assessed holds remain 15 s; only their demonstration is accelerated x3.
"""
from pathlib import Path
import sys,os,math,json,functools,subprocess,time,wave
import numpy as np
import skia
sys.path.insert(0,str(Path(__file__).parent))
import render_parcours_v28 as b
ROOT=b.ROOT;WORK=Path(os.environ.get('V29_WORK',str(ROOT.parent/'v29-work')));MEDIA=ROOT/'media';FPS=30;DURATION=69
STEPS=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{AQUATIC_STEPS}from './aquatic-model-v29.js';console.log(JSON.stringify(AQUATIC_STEPS))"],cwd=ROOT))
META=json.loads((WORK/'sprite-meta.json').read_text())
for name in ['STEPS','DURATION']:setattr(b,name,globals()[name])
b.CUES[7]='Je franchis le tapis OU le cerceau, puis je ressors en crawl.'
b.CUES[8]='Crawl – plongeon canard – je remonte avec l’anneau – crawl.'
b.CUES[9]='Je rejoins le bord en crawl et je m’y accroche avec les mains.'
COUNTS={m:len(a) for m,a in META.items()}
@functools.lru_cache(100)
def image(mode,index):return skia.Image.MakeFromEncoded(skia.Data.MakeWithCopy((WORK/'sprites'/f'{mode}-{index:03}.png').read_bytes()))
def sprite(c,mode,index,x,y,s=1,mirror=False,angle=0):
 index=max(0,min(COUNTS[mode]-1,int(index)));ratio=160/(1536/3.4)*s;w=1536*ratio;h=1024*ratio
 c.save();c.translate(x,y);c.rotate(angle);c.scale(-1 if mirror else 1,1)
 c.drawImageRect(image(mode,index),skia.Rect.MakeXYWH(-w/2,-h/2,w,h),skia.SamplingOptions(skia.FilterMode.kLinear));c.restore()
 hand=META[mode][index]['hand'];return ((hand[0]-768)*ratio*(-1 if mirror else 1),(hand[1]-512)*ratio)
def cycle(mode,t):return int((t%2)/2*COUNTS[mode])%COUNTS[mode]
def swimmer(c,x,y,s=1,angle=0,mode='front',phase=0,hand=None,has_ring=False,mirror=False):
 m='carry' if has_ring else mode;return sprite(c,m,cycle(m,phase/(math.pi)),x,y,s,mirror,angle)
def upright(c,x,y,s=1,t=0,arms='scull',side=False,bend=0,grip=None,has_ring=False):
 m='entry' if arms=='down' else 'anchor' if grip is not None else 'upright';return sprite(c,m,cycle(m,t) if COUNTS[m]>1 else 0,x,y,s)
def star(c,x,y,t=0,s=1):return sprite(c,'star',cycle('star',t),x,y,s,angle=-90)
def entry(c,t):
 b.pool(c,t,water=360);b.panel_clip(c);b.rr(c,32,360,237,221,0,'#c3dce6');b.rr(c,32,350,243,13,4,'#f9fdff');b.path(c,[(269,363),(269,581)],'#98c6d7',3)
 for yy in [400,447,494,541]:b.path(c,[(32,yy),(268,yy)],'#dcecf2',1)
 for xx in [80,146,212]:b.path(c,[(xx,364),(xx,581)],'#dcecf2',1)
 if t<1:x,y=255,259
 elif t<2.3:
  p=(t-1)/1.3;x=b.lerp(255,355,p);y=259-13*math.sin(math.pi*p)+100*p*p
 elif t<3:p=b.ease((t-2.3)/.7);x=355;y=b.lerp(359,430,p)
 else:x=355;y=b.lerp(430,398,b.ease((t-3)/1.6))
 m='entry' if t<3 else 'upright';sprite(c,m,0 if m=='entry' else cycle(m,t),x,y,.60)
 if t>1.5:b.ripple(c,355,360,t,50)
 b.submerge_tint(c,360);b.wave_line(c,t,276,1248,360);c.restore();b.tag(c,'SAUT VERS L’ARRIÈRE',53,195,242);b.callout(c,'Je pousse avec mes jambes','Bras le long du corps. Entrée pieds en premier.',850,220,348)

def counter(c,t,x=1030,y=420):
 elapsed=min(15,max(0,t*3));remaining=max(0,round(15-elapsed));b.ellipse(c,x,y,79,79,b.WHITE,.97)
 rect=skia.Rect.MakeLTRB(x-66,y-66,x+66,y+66);c.drawArc(rect,-90,360,False,b.paint('#e0f0f4',1,7));c.drawArc(rect,-90,360*elapsed/15,False,b.paint(b.TEAL,1,7))
 b.txt(c,remaining,x,y+12,50,b.INK,True,'center');b.txt(c,'secondes à tenir',x,y+36,12,'#40657a',False,'center')
 b.tag(c,'DÉMONSTRATION ×3',x-108,y+96,216);b.txt(c,'15 s montrées en 5 s',x,y+147,13,b.INK,True,'center')
def upright_hold(c,t):
 b.pool(c,t,water=330);b.panel_clip(c);sprite(c,'upright',cycle('upright',t),539,390,1);b.submerge_tint(c,330);b.wave_line(c,t,32,1248,330);b.ripple(c,539,330,t,55);c.restore();b.tag(c,'FLOTTAISON DEBOUT',53,195);b.callout(c,'Je respire librement','Cou hors de l’eau. Aucun appui au fond.',889,205,312);counter(c,t,1044,424)
def swim_scene(c,t,duration,back=False):
 b.pool(c,t,water=350);b.panel_clip(c);p=b.ease(t/duration);x=b.lerp(310,920,p) if not back else b.lerp(920,310,p)
 m='back' if back else 'front';sprite(c,m,cycle(m,t),x,359,1.35,back);b.submerge_tint(c,350);b.wave_line(c,t,32,1248,350);b.ripple(c,x,351,t,110);c.restore()
 b.tag(c,'DOS CRAWLÉ' if back else 'CRAWL',53,195);b.callout(c,'Bras alternés, corps allongé','Je poursuis mon trajet.',861,190,340)
def obstacle(c,t,duration,returning=False):
 for which,rect in enumerate([(32,174,592,407),(656,174,592,407)]):
  x,y,w,h=rect;water=311;b.pool(c,t,water=water,rect=rect);c.save();c.clipRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(*rect),22,22),True)
  p=b.clamp(t/duration);travel=b.ease(p);sx=x+75+(w-150)*travel
  if returning:sx=x+w-75-(w-150)*travel
  depth=math.sin(math.pi*b.clamp((p-.12)/.78))**1.3 if .12<p<.9 else 0;sy=water+7+83*depth;matx=x+w/2
  if which==0:
   b.rr(c,matx-72,water-14,144,20,7,'#f6c348');b.rr(c,matx-72,water-16,144,12,5,b.BLUE);b.path(c,[(matx-60,water-14),(matx+60,water-14)],'#71c5ee',2)
  else:
   b.ellipse(c,matx,water+88,24,68,b.WHITE,0,'#ffdb66',8);b.rr(c,matx-27,water+158,54,14,6,'#246986')
  if returning and t<1.2:sprite(c,'roll',round(t/1.2*35),sx,sy,.62,True)
  else:sprite(c,'front',cycle('front',t),sx,sy,.62,returning)
  if depth>.2:b.bubbles(c,sx+(55 if not returning else -55),sy+8,t,4)
  if which==1:c.drawArc(skia.Rect.MakeLTRB(matx-24,water+20,matx+24,water+156),-90,180,False,b.paint('#ffd45d',1,8))
  b.submerge_tint(c,water,rect);b.wave_line(c,t,x,x+w,water);c.restore();b.tag(c,'SOUS LE TAPIS' if which==0 else 'DANS LE CERCEAU',x+20,196)
  b.txt(c,'Je ressors sur le ventre, en crawl.' if returning else 'Je passe entièrement l’obstacle.',x+w/2,552,14,b.INK,True,'center')
 b.ellipse(c,640,379,25,25,b.NAVY);b.txt(c,'OU',640,385,15,b.WHITE,True,'center')
def turn(c,t):
 b.pool(c,t,top=True);p=b.clamp(t/5);a=-math.pi/2+math.pi*b.ease(p);x=850+135*math.cos(a);y=365+85*math.sin(a)
 route=skia.Path();route.moveTo(350,270);route.lineTo(850,270);route.cubicTo(1090,270,1090,480,850,480);route.lineTo(350,480);c.drawPath(route,b.paint(b.WHITE,.65,6));b.path(c,[(370,466),(350,480),(370,494)],b.WHITE,5,.8)
 sprite(c,'turn',round(p*149),x,y,1.25)
 b.tag(c,'DEMI-TOUR SANS APPUI',53,195);b.tag(c,'ARRIVÉE EN CRAWL',320,219);b.tag(c,'DÉPART EN DOS CRAWLÉ',320,514,240)
 b.callout(c,'180° : ventre – dos','Je change de direction sans toucher le fond.',84,330,345)
def ring_scene(c,t):
 b.pool(c,t,water=330);b.panel_clip(c);ringpos=(618,548)
 if t<2:
  sprite(c,'front',cycle('front',t),b.lerp(1000,760,b.ease(t/2)),340,1.1,True);b.ring(c,*ringpos,13)
 elif t<8:
  p=(t-2)/6;idx=min(179,round(p*179));meta=META['duck'][90]['hand'];ratio=160/(1536/3.4)*.95
  gripx=ringpos[0]+(meta[0]-768)*ratio;gripy=ringpos[1]-(meta[1]-512)*ratio
  if p<.5:
   q=b.ease(p/.5);x=b.lerp(760,gripx,q);y=b.lerp(340,gripy,q);b.ring(c,*ringpos,13)
  else:q=b.ease((p-.5)/.5);x=b.lerp(gripx,645,q);y=b.lerp(gripy,340,q)
  sprite(c,'duck',idx,x,y,.95,True);b.bubbles(c,x,y+35,t,5)
 else:sprite(c,'carry',cycle('carry',t-8),b.lerp(645,350,b.ease((t-8)/3)),340,1.1,True)
 b.submerge_tint(c,330);b.wave_line(c,t,32,1248,330);c.restore();b.tag(c,'CRAWL – PLONGEON CANARD – CRAWL',53,195,408)
 b.callout(c,'Je remonte avec l’anneau' if t>5 else 'Je bascule vers le fond','Sans appui au fond. Je repars en crawl.',860,211,340)
def anchor(c,t):
 b.pool(c,t,water=315);b.panel_clip(c);b.rr(c,32,315,177,266,0,'#aed4e2');b.rr(c,32,305,186,14,4,b.WHITE);b.path(c,[(209,319),(209,581)],'#80b8cb',3)
 if t<2.2:sprite(c,'carry',cycle('carry',t),b.lerp(860,420,b.ease(t/2.2)),324,1.1,True)
 else:
  p=b.clamp((t-2.2)/2);idx=round(p*59);hd=META['finish'][idx]['hand'];size=b.lerp(1.1,.9,b.ease(p));ratio=160/(1536/3.4)*.9
  end=META['finish'][-1]['hand'];ex=218+(end[0]-768)*ratio;ey=309-(end[1]-512)*ratio
  sprite(c,'finish',idx,b.lerp(420,ex,b.ease(p)),b.lerp(324,ey,b.ease(p)),size,True)
 b.submerge_tint(c,315);b.wave_line(c,t,218,1248,315);c.restore();b.tag(c,'DERNIERS MÈTRES EN CRAWL',53,195,310);b.callout(c,'Je tiens le bord avec les mains','Le parcours est terminé.',850,215,350)
for name in ['swimmer','upright','star','counter','swim_scene','obstacle','turn','ring_scene','anchor']:setattr(b,name,globals()[name])
def frame(t,width=3840,height=2160):
 surf=skia.Surface.MakeRasterN32Premul(width,height);c=surf.getCanvas();c.scale(width/1280,height/720);c.clear(b.color('#f1f7fa'));st=next((s for s in STEPS if s['start']<=t<s['end']),None);outro=t>=66;vt=103+t-66 if outro else t;b.header(c,st,vt)
 if st is None:b.overview(c,t*5/3 if not outro else t,outro)
 else:
  local=t-st['start'];sid=st['id'];duration=st['end']-st['start']
  if sid=='entry':entry(c,local)
  elif sid in ['outward','return']:obstacle(c,local,duration,sid=='return')
  elif sid=='upright':upright_hold(c,local)
  elif sid in ['front','back']:swim_scene(c,local,duration,sid=='back')
  elif sid=='turn':turn(c,local)
  elif sid=='star':b.star_hold(c,local)
  elif sid=='ring':ring_scene(c,local)
  elif sid=='anchor':anchor(c,local)
 b.footer(c,st,vt);return surf.makeImageSnapshot()
def audio(path):
 rate=48000;n=DURATION*rate;data=np.zeros((n,2),np.float32)
 def tone(at,f,d=.25,amp=.025):
  k=int(d*rate);tt=np.arange(k)/rate;sig=np.sin(2*np.pi*f*tt)*np.sin(np.pi*tt/d)**2*amp;i=int(at*rate);m=min(k,n-i)
  if m>0:data[i:i+m]+=sig[:m,None]
 for at in [0,*[s['start'] for s in STEPS],66]:tone(at+.06,587,.45);tone(at+.22,880,.35,.018)
 for at in [16,37]:
  for i in range(1,15):tone(at+i/3,1108,.055,.009)
  tone(at+4.96,1174,.3,.018)
 for f in [293,370,440]:tone(67,f,1.7,.017)
 with wave.open(str(path),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(rate);w.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())
def metadata():
 out=';FFMETADATA1\ntitle=Le parcours aquatique — Natation 6e\nartist=Le Bon Sauveur — Saint-Lô\n'
 for a,z,title in [(0,3,'Présentation')]+[(s['start'],s['end'],b.TITLES[s['number']-1]) for s in STEPS]+[(66,69,'Parcours terminé')]:out+=f'[CHAPTER]\nTIMEBASE=1/1000\nSTART={a*1000}\nEND={z*1000}\ntitle={title}\n'
 return out
def subtitles():
 def tc(t):return f'00:{t//60:02d}:{t%60:02d}.000'
 return 'WEBVTT\n\n'+'\n\n'.join(f'{tc(s["start"])} --> {tc(s["end"])}\n'+(b.CUES[s['number']-1]+(' Démonstration accélérée ×3 : 15 secondes à réaliser.' if s.get('hold') else '')) for s in STEPS)+'\n'
def render():
 if '--preview' in sys.argv:
  for t in [4,6,11,17,20,23,27,28.5,30.5,33,38,41,45,49,51,53,54.95,55.05,57,59,62,64,65.8]:frame(t,1280,720).save(str(WORK/f'scene-{t:g}.png'),skia.kPNG)
  return
 intro='--intro-only' in sys.argv
 target=WORK/('intro-v29.mp4' if intro else 'film-final-4k.mp4');audio(WORK/'sound-v29.wav');(WORK/'chapters-v29.txt').write_text(metadata());(MEDIA/'parcours-aquatique-v29.vtt').write_text(subtitles());frame(4).save(str(MEDIA/'parcours-aquatique-v29.png'),skia.kPNG)
 command=['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgra','-s','3840x2160','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','22','-maxrate','1100k','-bufsize','2200k','-threads','6','-pix_fmt','yuv420p','-g','60','-movflags','+faststart',str(target)]
 pipe=subprocess.Popen(command,stdin=subprocess.PIPE);start=time.monotonic()
 try:
  for i in range((8 if intro else DURATION)*FPS):
   pipe.stdin.write(frame(i/FPS).tobytes())
   if i%90==0:print(f'{i/FPS:g}/{DURATION}s · {i/(time.monotonic()-start+.001):.1f} fps',flush=True)
 finally:pipe.stdin.close()
 if pipe.wait():raise RuntimeError('Video encoding failed')
 if intro:print('INTRO DONE',flush=True);return
 master=MEDIA/'parcours-aquatique-v29-4k.mp4';subprocess.run(['ffmpeg','-v','error','-y','-i',str(target),'-i',str(WORK/'sound-v29.wav'),'-i',str(WORK/'chapters-v29.txt'),'-map','0:v:0','-map','1:a:0','-map_metadata','2','-map_chapters','2','-c:v','copy','-c:a','aac','-b:a','80k','-ar','48000','-t',str(DURATION),'-movflags','+faststart',str(master)],check=True)
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(master),'-map','0:v:0','-map','0:a:0','-map_metadata','0','-map_chapters','0','-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','fast','-crf','20','-maxrate','850k','-bufsize','1700k','-threads','6','-c:a','copy','-movflags','+faststart',str(MEDIA/'parcours-aquatique-v29.mp4')],check=True)
 print('DONE V29',flush=True)
if __name__=='__main__':render()
