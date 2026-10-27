"""Derive the swimmer mesh from the CC0 MakeHuman core assets.
No character-generator source code is embedded. The resulting mesh is CC0.
Inputs are listed in SOURCES.md; this script accepts their directory as argv[1].
"""
import json,sys,pathlib,numpy as np
src=pathlib.Path(sys.argv[1]);out=pathlib.Path(__file__).parent
verts=[];faces=[];group=''
for line in (src/'base.obj').read_text().splitlines():
 a=line.split()
 if not a:continue
 if a[0]=='v':verts.append(list(map(float,a[1:4])))
 elif a[0]=='g':group=a[1]
 elif a[0]=='f' and group=='body':faces.append([int(x.split('/')[0])-1 for x in a[1:]])
v=np.array(verts,float)
for name,weight in [('male-child.target',.6),('male-young.target',.4)]:
 for line in (src/name).read_text().splitlines():
  a=line.split()
  if a and not a[0].startswith('#'):v[int(a[0])]+=np.array(list(map(float,a[1:4])))*weight
rig=json.loads((src/'default.mhskel').read_text());weights=json.loads((src/'default_weights.mhw').read_text())['weights']
joints={k:v[inds].mean(0) for k,inds in rig['joints'].items()}
center=(joints[rig['bones']['upperleg01.L']['head']]+joints[rig['bones']['upperleg01.R']['head']])/2
used=sorted(set(i for f in faces for i in f));scale=1.60/(v[used,1].max()-v[used,1].min());v=(v-center)*scale
bones=[];names=list(rig['bones']);lookup={n:i for i,n in enumerate(names)}
for name in names:
 b=rig['bones'][name];bones.append({'name':name,'parent':lookup.get(b['parent'],-1),'head':((joints[b['head']]-center)*scale).round(6).tolist(),'tail':((joints[b['tail']]-center)*scale).round(6).tolist()})
wv={i:[] for i in used}
for name,entries in weights.items():
 if name in lookup:
  for i,w in entries:
   if i in wv:wv[i].append((lookup[name],w))
indices=[];values=[]
for i in used:
 pairs=sorted(wv[i],key=lambda p:-p[1])[:4] or [(lookup['root'],1)];total=sum(w for _,w in pairs)
 indices.extend([n for n,w in pairs]+[0]*(4-len(pairs)));values.extend([round(w/total,6) for n,w in pairs]+[0]*(4-len(pairs)))
remap={n:i for i,n in enumerate(used)};tris=[];materials=[]
for f in faces:
 for j in range(1,len(f)-1):
  tri=[f[0],f[j],f[j+1]];point=v[tri].mean(0);x,y,z=point
  mat=1 if -.27<y<.105 else 0
  if mat==1 and abs(x)>.105 and y<.055:mat=2
  if y>.70 or y>.62 and z<.045:mat=3
  tris.extend(remap[i] for i in tri);materials.append(mat)
model={'provenance':'MakeHuman core mesh, targets and default weights; CC0; see SOURCES.md','height':1.6,'positions':v[used].round(6).flatten().tolist(),'indices':tris,'material':materials,'skinIndex':indices,'skinWeight':values,'bones':bones}
(out/'swimmer-model.json').write_text(json.dumps(model,separators=(',',':')))
print('Mesh',len(used),'vertices',len(materials),'triangles',len(bones),'bones')
for name in ['head','eye.L','eye.R','upperarm01.L','upperarm02.L','lowerarm01.L','wrist.L','upperleg01.L','lowerleg01.L','foot.L']:print(next(b for b in bones if b['name']==name))
