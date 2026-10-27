import * as T from '../v29/three.module.js';
const data=await(await fetch('../v29/swimmer-model.json')).json(),V=a=>new T.Vector3(...a),Q=()=>new T.Quaternion(),AX=V([1,0,0]),AY=V([0,1,0]),AZ=V([0,0,1]);
const renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(1536,1024);renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.98;document.body.append(renderer.domElement);
const scene=new T.Scene(),actor=new T.Group();scene.add(actor);
scene.add(new T.HemisphereLight(0xe6faff,0x8c674f,1.15));
for(const [pos,col,power]of[[[1,3,4],0xffedd6,2.1], [[-2,1,-3],0xb9eeff,.85], [[-3,.5,3],0xffffff,.6]]){const l=new T.DirectionalLight(col,power);l.position.copy(V(pos));scene.add(l)}
const camera=new T.OrthographicCamera(-1.35,1.35,.90,-.90,.1,50);
const bodyMaterial=new T.MeshPhysicalMaterial({color:0xffffff,roughness:.38,clearcoat:.36,clearcoatRoughness:.35});
bodyMaterial.onBeforeCompile=shader=>{
 shader.uniforms.skinTone={value:new T.Color(0xe6a16e)};shader.uniforms.trunkTone={value:new T.Color(0x1356d8)};shader.uniforms.panelTone={value:new T.Color(0x1bbde9)};shader.uniforms.capTone={value:new T.Color(0xf44539)};
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 restPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nrestPosition=position;');
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 restPosition;uniform vec3 skinTone,trunkTone,panelTone,capTone;').replace('#include <color_fragment>',`#include <color_fragment>
 float edge=.0015;
 float trunks=smoothstep(-.272,-.268,restPosition.y)*(1.-smoothstep(.103,.107,restPosition.y))*(1.-smoothstep(.23,.245,abs(restPosition.x)));
 float panel=smoothstep(.115,.121,abs(restPosition.x))*(1.-smoothstep(.055,.065,restPosition.y));
 vec3 cloth=mix(trunkTone,panelTone,panel);vec3 skin=mix(skinTone,cloth,trunks);
 float capHeight=.652+.027*smoothstep(.025,.145,restPosition.z);
 float cap=smoothstep(capHeight-edge,capHeight+edge,restPosition.y);
 float pore=sin(restPosition.x*5300.)*sin(restPosition.y*4900.)*sin(restPosition.z*5100.);
 float stripe=smoothstep(.095,.105,abs(restPosition.x))*(1.-smoothstep(.13,.14,abs(restPosition.x)));
 cloth=mix(cloth,panelTone,stripe*.8);skin=mix(skinTone*(1.+pore*.018),cloth,trunks);
 diffuseColor.rgb*=mix(skin,capTone*(1.+.025*pore),cap);`);
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
// Map the whole anatomical bending plane, not only the bone direction.
// This preserves humeral/forearm roll and prevents the elbow from twisting.
function frame(direction,normal){
 const y=direction.clone().normalize(),z=normal.clone().addScaledVector(y,-normal.dot(y)).normalize(),x=new T.Vector3().crossVectors(y,z).normalize();
 return Q().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z));
}
function orientPlane(name,restDirection,poseDirection,restNormal,poseNormal){
 const absolute=frame(poseDirection,poseNormal).multiply(frame(restDirection,restNormal).invert());
 by[name].quaternion.copy(by[name].parent.getWorldQuaternion(Q()).invert().multiply(absolute));mesh.updateMatrixWorld(true);
}
const armDiagnostics=[];
function arm(side,hand,pole){
 const u='upperarm01.'+side,f='lowerarm01.'+side,w='wrist.'+side,a=current(u),ru=rest[f].head.clone().sub(rest[u].head),rf=rest[w].head.clone().sub(rest[f].head),L1=ru.length(),L2=rf.length(),d=hand.clone().sub(a);
 if(d.length()>L1+L2-.002)hand=a.clone().add(d.setLength(L1+L2-.002));
 const e=ik(a,hand,L1,L2,pole),pu=e.clone().sub(a),pf=hand.clone().sub(e),rn=new T.Vector3().crossVectors(ru,rf).normalize(),pn=new T.Vector3().crossVectors(pu,pf).normalize();
 orientPlane(u,ru,pu,rn,pn);orientPlane(f,rf,pf,rn,pn);
 // Preserve neutral wrist/metacarpal/finger rotations. The previous solver
 // independently realigned every finger and introduced visible kinks.
 by[w].quaternion.identity();
 const elbowAngle=Math.acos(T.MathUtils.clamp(pu.clone().normalize().dot(pf.clone().normalize()),-1,1))*180/Math.PI;
 armDiagnostics.push({side,elbowAngle,wristError:current(w).distanceTo(hand)});
}
function curve(keys,u){
 // Periodic, time-parametrised cubic Hermite interpolation.
 u=((u%1)+1)%1;let k=0;while(k<keys.length-2&&u>keys[k+1][0])k++;
 const a=keys[k],b=keys[k+1],before=k?keys[k-1]:[keys[keys.length-2][0]-1,...keys[keys.length-2].slice(1)],after=k+2<keys.length?keys[k+2]:[keys[1][0]+1,...keys[1].slice(1)];
 const t=(u-a[0])/(b[0]-a[0]),h=b[0]-a[0],v=[];
 for(let j=1;j<4;j++){const m0=(b[j]-before[j])/(b[0]-before[0]),m1=(after[j]-a[j])/(after[0]-a[0]);v.push((2*t**3-3*t*t+1)*a[j]+(t**3-2*t*t+t)*h*m0+(-2*t**3+3*t*t)*b[j]+(t**3-t*t)*h*m1)}return V(v);
}
const crawlHand=[[0,.185,.845,.025],[.13,.19,.77,.18],[.30,.19,.47,.35],[.47,.19,.16,.28],[.59,.20,-.008,.06],[.67,.27,.015,-.08],[.80,.30,.30,-.16],[.91,.235,.62,-.10],[1,.185,.845,.025]];
const crawlPole=[[0,.45,.65,.02],[.3,.45,.56,.025],[.55,.43,.2,-.04],[.72,.34,.30,-.65],[.86,.36,.55,-.58],[1,.45,.65,.02]];
const backHand=[[0,.170302,.867995,.01979],[.16,.29,.73,-.17],[.32,.31,.44,-.27],[.48,.24,.08,-.15],[.58,.170302,-.032005,.01979],[.75,.170302,.417995,.46979],[1,.170302,.867995,.01979]];
const backPole=[[0,.44,.64,-.02],[.25,.50,.63,-.02],[.50,.45,.20,.0],[.65,.34,.35,.35],[.85,.32,.66,.4],[1,.44,.64,-.02]];
function leg(side,phase,spread=0,still=false,tuck=0){const u='upperleg01.'+side,f='lowerleg01.'+side,w='foot.'+side,a=current(u),sign=side==='L'?1:-1,L1=rest[f].head.distanceTo(rest[u].head),L2=rest[w].head.distanceTo(rest[f].head),kick=still?0:Math.sin(phase)*.035,target=spread>0?a.clone().add(V([sign*.34,-.94,0]).normalize().multiplyScalar(L1+L2-.0002)):V([sign*.105,-.75+Math.abs(kick)*.2+.37*tuck,.02+kick+.25*tuck]),k=ik(a,target,L1,L2,V([sign*.11,-.38,.35]));orient(u,k.sub(a));orient(f,target.clone().sub(current(f)));orient(w,spread>0?V([sign*.34,-.94,0]):V([sign*.05,-1,.015]));}
const baseQ=Q().setFromRotationMatrix(new T.Matrix4().set(0,1,0,0,0,0,-1,0,-1,0,0,0,0,0,0,1));
function pose(mode,phase=0,p=0){
 armDiagnostics.length=0;actor.quaternion.identity();actor.position.set(0,0,0);bones.forEach(b=>b.quaternion.identity());by.head.scale.setScalar(1.13);actor.updateMatrixWorld(true);mesh.updateMatrixWorld(true);ring.visible=false;
 const back=mode==='back'||mode==='star'||mode==='turn'&&p>.7,upright=mode==='upright'||mode==='entry'||mode==='anchor';
 for(const[side,j]of[['L',0],['R',1]]){
  const sign=side==='L'?1:-1,a=rest['upperarm01.'+side].head,ph=(phase+j*Math.PI)%(2*Math.PI),u=ph/(2*Math.PI);let hand,pole;
  if(mode==='entry'){hand=V([sign*.19,-.025,.055]);pole=V([sign*.25,.20,.12]);}
  else if(mode==='roll'||mode==='turn'){hand=V([sign*.35,.20,.12]);pole=V([sign*.22,.10,.16]);}
  else if(mode==='star'){hand=a.clone().add(V([sign*.447,-.08,.02]));pole=a.clone().add(V([sign*.25,-.15,.04]));}
  else if(mode==='upright'){hand=V([sign*(.36+.025*Math.sin(phase)),.15,.12+.03*Math.cos(phase)]);pole=V([sign*.20,.10,.16]);}
  else if(mode==='finish'){hand=V([sign*.15,.90-.30*p,.03+.37*p]);pole=V([sign*.3,.6,.14]);}
  else if(mode==='anchor'){hand=V([sign*.15,.60,.4]);pole=V([sign*.3,.6,.14]);}
  else if(mode==='duck'||mode==='glide'){
   hand=V([sign*.15,.86,.035]);pole=V([sign*.29,.63,-.06]);
  }else if(back){if(u>=.58){const q=(u-.58)/.42,theta=Math.PI*(1-q);hand=a.clone().add(V([0,.450*Math.cos(theta),.450*Math.sin(theta)]));pole=V([sign*.38,.5,.4]);}else{hand=curve(backHand,u);pole=curve(backPole,u);hand.x*=sign;pole.x*=sign;}
  }else{hand=curve(crawlHand,u);pole=curve(crawlPole,u);hand.x*=sign;pole.x*=sign;
  }
  arm(side,hand,pole);leg(side,phase*3+j*Math.PI,mode==='star'?.19:0,mode==='entry'||mode==='star'||mode==='duck'||mode==='roll'||mode==='turn'&&p>.2&&p<.8,mode==='duck'&&p>.5&&p<.8?.30*Math.sin(Math.PI*(p-.5)/.3):0);
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
  const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x)};
  const vertical=Q().setFromAxisAngle(AY,-Math.PI/2),out=Q().setFromAxisAngle(AY,Math.PI).multiply(baseQ).multiply(Q().setFromAxisAngle(AY,Math.PI));
  // Prone -> vertical scull -> turn upright -> recline onto the back.
  if(p<.34)actor.quaternion.copy(baseQ).slerp(vertical,smooth(p/.34));
  else if(p<.66)actor.quaternion.copy(vertical).premultiply(Q().setFromAxisAngle(AY,Math.PI*smooth((p-.34)/.32)));
  else actor.quaternion.copy(Q().setFromAxisAngle(AY,Math.PI).multiply(vertical)).slerp(out,smooth((p-.66)/.34));
 }
 if(mode==='duck'){
  const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x)};let pitch=p<.32?1.25*smooth(p/.32):p<.50?1.25:p<.72?1.25-1.69*smooth((p-.50)/.22):p<.9?-.44:-.44+.44*smooth((p-.9)/.1);
  actor.quaternion.premultiply(Q().setFromAxisAngle(AZ,-pitch));
 }
 actor.updateMatrixWorld(true);
}
window.renderPose=({mode='front',phase=0,p=0,view='side',width=1536,height=1024}={})=>{
 renderer.setSize(width,height,false);camera.left=-1.7;camera.right=1.7;camera.top=1.7*height/width;camera.bottom=-camera.top;
 camera.up.set(0,1,0);camera.position.set(.1,.75,4.5);
 if(view==='top'){camera.position.set(.0,5,.05);camera.up.set(0,0,-1)}
 if(mode==='entry'||mode==='upright'||mode==='anchor')camera.position.set(1.5,.5,4.5);
 camera.lookAt(0,.0,0);camera.updateProjectionMatrix();
 if(mode==='immersion'){
  const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x)},blend=p<.28?smooth((p-.10)/.18):1-smooth((p-.72)/.20);
  pose('front',phase,p);const from=bones.map(b=>b.quaternion.clone()),aq=actor.quaternion.clone();
  pose('glide',phase,p);bones.forEach((b,i)=>{const to=b.quaternion.clone();b.quaternion.copy(from[i]).slerp(to,blend)});actor.quaternion.copy(aq).slerp(baseQ,blend);actor.updateMatrixWorld(true);
 }else if(mode==='turn'){
  pose('turn',phase,p);const target=bones.map(b=>b.quaternion.clone()),aq=actor.quaternion.clone();
  const k=p<.25?p/.25:p>.75?(1-p)/.25:1,blend=k*k*(3-2*k);
  pose(p<.5?'front':'back',phase,p);bones.forEach((b,i)=>b.quaternion.slerp(target[i],blend));actor.quaternion.copy(aq);actor.updateMatrixWorld(true);
 }else pose(mode,phase,p);
 renderer.render(scene,camera);
 const diagnostics=['L','R'].map(side=>{const a=current('upperarm01.'+side),e=current('lowerarm01.'+side),w=current('wrist.'+side),u=e.clone().sub(a),f=w.clone().sub(e),ru=rest['lowerarm01.'+side].head.distanceTo(rest['upperarm01.'+side].head),rf=rest['wrist.'+side].head.distanceTo(rest['lowerarm01.'+side].head);return {side,elbowAngle:Math.acos(T.MathUtils.clamp(u.clone().normalize().dot(f.clone().normalize()),-1,1))*180/Math.PI,wristError:Math.max(Math.abs(u.length()-ru),Math.abs(f.length()-rf))}});const hand=by['wrist.L'].localToWorld(ring.position.clone()).project(camera);return {image:renderer.domElement.toDataURL('image/png'),hand:[(hand.x+1)*width/2,(1-hand.y)*height/2],diagnostics};
};
window.ready=true;window.renderPose();
