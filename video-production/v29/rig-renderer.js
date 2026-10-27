import * as T from './three.module.js';
const data=await(await fetch('./swimmer-model.json')).json(),V=a=>new T.Vector3(...a),Q=()=>new T.Quaternion(),AX=V([1,0,0]),AY=V([0,1,0]),AZ=V([0,0,1]);
const renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(1536,1024);renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;document.body.append(renderer.domElement);
const scene=new T.Scene(),actor=new T.Group();scene.add(actor);
scene.add(new T.HemisphereLight(0xe6faff,0xa98265,2));
for(const [pos,col,power]of[[[1,3,4],0xfff2df,3], [[-2,1,-3],0xaeefff,2], [[-3,.5,3],0xffffff,1.1]]){const l=new T.DirectionalLight(col,power);l.position.copy(V(pos));scene.add(l)}
const camera=new T.OrthographicCamera(-1.35,1.35,.90,-.90,.1,50);
const bodyMaterial=new T.MeshPhysicalMaterial({color:0xffffff,roughness:.44,clearcoat:.20,clearcoatRoughness:.35});
bodyMaterial.onBeforeCompile=shader=>{
 shader.uniforms.skinTone={value:new T.Color(0xe9a779)};shader.uniforms.trunkTone={value:new T.Color(0x1356d8)};shader.uniforms.panelTone={value:new T.Color(0x1bbde9)};shader.uniforms.capTone={value:new T.Color(0xf44539)};
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 restPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nrestPosition=position;');
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 restPosition;uniform vec3 skinTone,trunkTone,panelTone,capTone;').replace('#include <color_fragment>',`#include <color_fragment>
 float edge=.0015;
 float trunks=smoothstep(-.272,-.268,restPosition.y)*(1.-smoothstep(.103,.107,restPosition.y))*(1.-smoothstep(.23,.245,abs(restPosition.x)));
 float panel=smoothstep(.115,.121,abs(restPosition.x))*(1.-smoothstep(.055,.065,restPosition.y));
 vec3 cloth=mix(trunkTone,panelTone,panel);vec3 skin=mix(skinTone,cloth,trunks);
 float capHeight=.652+.027*smoothstep(.025,.145,restPosition.z);
 float cap=smoothstep(capHeight-edge,capHeight+edge,restPosition.y);
 diffuseColor.rgb*=mix(skin,capTone,cap);`);
};
const materials=bodyMaterial;
const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(data.positions,3));geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(data.skinIndex,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(data.skinWeight,4));geo.setIndex(data.indices);geo.computeVertexNormals();
const mesh=new T.SkinnedMesh(geo,materials),bones=data.bones.map(d=>{const b=new T.Bone();b.name=d.name;return b}),by=Object.fromEntries(bones.map(b=>[b.name,b]));
data.bones.forEach((d,i)=>{const parent=d.parent<0?null:data.bones[d.parent];bones[i].position.copy(V(d.head).sub(parent?V(parent.head):V([0,0,0])));if(parent)bones[d.parent].add(bones[i]);else mesh.add(bones[i])});const skeleton=new T.Skeleton(bones);mesh.bind(skeleton);mesh.frustumCulled=false;actor.add(mesh);
const rest=Object.fromEntries(data.bones.map(d=>[d.name,{head:V(d.head),tail:V(d.tail)}]));
const accessory=new T.Group(),headRest=rest.head.head;by.head.add(accessory);
const rubber=new T.MeshPhysicalMaterial({color:0x123f7c,roughness:.37,clearcoat:.2}),lens=new T.MeshPhysicalMaterial({color:0x0764c6,metalness:.2,roughness:.16,clearcoat:.8}),strap=new T.MeshStandardMaterial({color:0x124886,roughness:.45});
function obj(geometry,mat,pos,scale,parent=accessory){const o=new T.Mesh(geometry,mat);o.position.copy(pos);if(scale)o.scale.set(...scale);parent.add(o);return o}
for(const side of ['L','R']){const eye=rest['eye.'+side].tail.clone().sub(headRest);eye.z+=.008;obj(new T.TorusGeometry(.026,.006,12,36),rubber,eye,[1.1,.78,1]);obj(new T.SphereGeometry(1,24,16),lens,eye.clone().add(V([0,0,.001])),[.026,.018,.010]);}
const ey=rest['eye.L'].tail.y-headRest.y,ez=rest['eye.L'].tail.z-headRest.z;obj(new T.CapsuleGeometry(.004,.019,4,8),rubber,V([0,ey,ez]),[1,1,1]).rotation.z=Math.PI/2;
const strapPts=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;strapPts.push(V([.082*Math.sin(a),ey,.095*Math.cos(a)+.025]))}obj(new T.TubeGeometry(new T.CatmullRomCurve3(strapPts),64,.005,6,true),strap,V([0,0,0]));
const ring=new T.Mesh(new T.TorusGeometry(.037,.007,12,40),new T.MeshPhysicalMaterial({color:0xffc935,metalness:.25,roughness:.24}));by['wrist.L'].add(ring);ring.position.copy(rest['wrist.L'].tail.clone().sub(rest['wrist.L'].head).multiplyScalar(1.6));ring.position.z+=.028;ring.visible=false;
function current(name){return by[name].getWorldPosition(new T.Vector3())}
function orient(name,direction){const b=by[name],r=(name.startsWith('upperarm01.')?rest[name.replace('upperarm01.','lowerarm01.')].head:name.startsWith('lowerarm01.')?rest[name.replace('lowerarm01.','wrist.')].head:name.startsWith('upperleg01.')?rest[name.replace('upperleg01.','lowerleg01.')].head:name.startsWith('lowerleg01.')?rest[name.replace('lowerleg01.','foot.')].head:rest[name].tail).clone().sub(rest[name].head).normalize(),q=Q().setFromUnitVectors(r,direction.clone().normalize());const pq=b.parent.getWorldQuaternion(Q());b.quaternion.copy(pq.invert().multiply(q));mesh.updateMatrixWorld(true)}
function ik(a,b,l1,l2,pole){const d=b.clone().sub(a),dist=Math.max(.0001,Math.min(d.length(),l1+l2-.0001));d.normalize();const n=pole.clone().sub(a);n.addScaledVector(d,-n.dot(d)).normalize();const along=(l1*l1+dist*dist-l2*l2)/(2*dist),height=Math.sqrt(Math.max(0,l1*l1-along*along));return a.clone().addScaledVector(d,along).addScaledVector(n,height)}
function arm(side,hand,pole){const u='upperarm01.'+side,f='lowerarm01.'+side,w='wrist.'+side,a=current(u),L1=rest[f].head.distanceTo(rest[u].head),L2=rest[w].head.distanceTo(rest[f].head),d=hand.clone().sub(a);if(d.length()>L1+L2-.001)hand=a.clone().add(d.setLength(L1+L2-.001));const elbow=ik(a,hand,L1,L2,pole);orient(u,elbow.sub(a));const e=current(f);if(e.distanceTo(elbow.clone().add(a))>.0001)throw Error('Elbow chain lost continuity');orient(f,hand.clone().sub(e));const fore=hand.clone().sub(e).normalize();orient(w,fore);}
function leg(side,phase,spread=0,still=false,tuck=0){const u='upperleg01.'+side,f='lowerleg01.'+side,w='foot.'+side,a=current(u),sign=side==='L'?1:-1,L1=rest[f].head.distanceTo(rest[u].head),L2=rest[w].head.distanceTo(rest[f].head),kick=still?0:Math.sin(phase)*.035,target=spread>0?a.clone().add(V([sign*.34,-.94,0]).normalize().multiplyScalar(L1+L2-.0002)):V([sign*.105,-.75+Math.abs(kick)*.2+.37*tuck,.02+kick+.25*tuck]),k=ik(a,target,L1,L2,V([sign*.11,-.38,.35]));orient(u,k.sub(a));orient(f,target.clone().sub(current(f)));orient(w,spread>0?V([sign*.34,-.94,0]):V([sign*.05,-1,.015]));}
const baseQ=Q().setFromRotationMatrix(new T.Matrix4().set(0,1,0,0,0,0,-1,0,-1,0,0,0,0,0,0,1));
function pose(mode,phase=0,p=0){
 actor.quaternion.identity();actor.position.set(0,0,0);bones.forEach(b=>b.quaternion.identity());by.head.scale.setScalar(1.08);actor.updateMatrixWorld(true);mesh.updateMatrixWorld(true);ring.visible=false;
 const back=mode==='back'||mode==='star'||mode==='turn'&&p>.7,upright=mode==='upright'||mode==='entry'||mode==='anchor';
 for(const[side,j]of[['L',0],['R',1]]){
  const sign=side==='L'?1:-1,a=rest['upperarm01.'+side].head,ph=(phase+j*Math.PI)%(2*Math.PI),u=ph/(2*Math.PI);let hand,pole;
  if(mode==='entry'){hand=V([sign*.19,-.025,.055]);pole=V([sign*.25,.20,.12]);}
  else if(mode==='roll'||mode==='turn'&&p>.2&&p<.8){hand=V([sign*.32,.43,.06]);pole=V([sign*.4,.55,.02]);}
  else if(mode==='star'){hand=V([sign*.59,.60,.02]);pole=V([sign*.45,.65,.0]);}
  else if(mode==='upright'){hand=V([sign*(.36+.025*Math.sin(phase)),.15,.12+.03*Math.cos(phase)]);pole=V([sign*.4,.29,.13]);}
  else if(mode==='finish'){hand=V([sign*.15,.90-.30*p,.03+.37*p]);pole=V([sign*.3,.6,.14]);}
  else if(mode==='anchor'){hand=V([sign*.15,.60,.4]);pole=V([sign*.3,.6,.14]);}
  else if(mode==='duck'){
   const reach=p<.7?.94:.85;hand=V([sign*.135,reach,.03]);pole=V([sign*.3,.60,-.12]);
  }else if(back){
   if(u<.55){const q=u/.55;hand=V([a.x+sign*.04*Math.sin(q*Math.PI),.86-.90*q,a.z-.27*Math.sin(q*Math.PI)]);pole=V([sign*.46,.5,-.02]);}
   else{const q=(u-.55)/.45,a2=Math.PI*(1-q);hand=V([a.x,a.y+.458*Math.cos(a2),a.z+.458*Math.sin(a2)]);pole=V([sign*.35,.65,.5]);}
  }else{
   if(u<.58){const q=u/.58;hand=V([a.x+sign*.08*Math.sin(q*Math.PI),.86-.88*q,a.z+.25*Math.sin(Math.PI*q)]);pole=V([sign*.44,.48,.02]);}
   else{const q=(u-.58)/.42;hand=V([a.x+sign*.04*Math.sin(q*Math.PI),-.02+.88*q,a.z-.05*Math.sin(q*Math.PI)]);pole=V([sign*.2,.40,-.8]);}
  }
  arm(side,hand,pole);const fore=current('wrist.'+side).sub(current('lowerarm01.'+side)).normalize();for(let finger=2;finger<=5;finger++)for(let segment=1;segment<=3;segment++)orient('finger'+finger+'-'+segment+'.'+side,fore);leg(side,phase*3+j*Math.PI,mode==='star'?.19:0,mode==='entry'||mode==='star'||mode==='duck'||mode==='roll'||mode==='turn'&&p>.2&&p<.8,mode==='duck'&&p>.5&&p<.8?.7*Math.sin(Math.PI*(p-.5)/.3):0);
 }
 if(mode==='duck'){ring.visible=p>=.5;by.head.rotation.x=-.08;}
 if(mode==='front'||mode==='carry'){by.head.rotation.y=-.85*Math.pow(Math.max(0,Math.sin(phase)),5);}
 ring.visible=mode==='carry'||mode==='finish'||mode==='anchor'||mode==='duck'&&p>=.5;
 mesh.updateMatrixWorld(true);
 if(!upright){actor.quaternion.copy(baseQ);let roll=back?Math.PI:mode==='duck'?0:Math.sin(phase)*.13;actor.quaternion.multiply(Q().setFromAxisAngle(AY,roll));}
 if(mode==='entry')actor.quaternion.setFromAxisAngle(AY,-Math.PI/2);
 if(mode==='finish')actor.quaternion.copy(baseQ).slerp(Q().setFromAxisAngle(AY,Math.PI/2),p);
 if(mode==='roll')actor.quaternion.copy(baseQ).multiply(Q().setFromAxisAngle(AY,Math.PI*(1-p)));
 if(mode==='turn'){
  const progress=p*p*(3-2*p);actor.quaternion.copy(Q().setFromAxisAngle(AY,-Math.PI*progress).multiply(baseQ).multiply(Q().setFromAxisAngle(AY,Math.PI*progress)));
 }
 if(mode==='duck'){
  let pitch=p<.36?Math.PI/2*Math.min(1,p/.36):p<.52?Math.PI/2:p<.77?Math.PI/2-Math.PI*((p-.52)/.25):-Math.PI/2+Math.PI/2*Math.min(1,(p-.77)/.23);
  actor.quaternion.premultiply(Q().setFromAxisAngle(AZ,-pitch));
 }
 actor.updateMatrixWorld(true);
}
window.renderPose=({mode='front',phase=0,p=0,view='side',width=1536,height=1024}={})=>{
 renderer.setSize(width,height,false);camera.left=-1.7;camera.right=1.7;camera.top=1.7*height/width;camera.bottom=-camera.top;
 camera.up.set(0,1,0);camera.position.set(.1,.75,4.5);
 if(view==='top'){camera.position.set(.0,5,.05);camera.up.set(0,0,-1)}
 if(mode==='entry'||mode==='upright'||mode==='anchor')camera.position.set(1.5,.5,4.5);
 camera.lookAt(0,.0,0);camera.updateProjectionMatrix();pose(mode,phase,p);renderer.render(scene,camera);
 const hand=by['wrist.L'].localToWorld(ring.position.clone()).project(camera);return {image:renderer.domElement.toDataURL('image/png'),hand:[(hand.x+1)*width/2,(1-hand.y)*height/2]};
};
window.ready=true;window.renderPose();
