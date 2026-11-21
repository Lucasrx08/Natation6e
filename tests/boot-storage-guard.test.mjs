import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const script=readFileSync(new URL('../natation-storage-guard-v1.js',import.meta.url),'utf8');
const VALID=JSON.stringify({version:12,classes:[{id:'classe-fictive',students:[{id:'eleve-fictif'}]}]});
function environment(initial={}){
 const storage=new Map(Object.entries(initial)),views=[];
 const node=()=>({
  style:{cssText:''},children:[],handlers:{},
  append(...nodes){this.children.push(...nodes)},
  setAttribute(){},
  addEventListener(event,handler){this.handlers[event]=handler},
  remove(){},
  click(){}
 });
 const context={
  localStorage:{
   getItem:key=>storage.has(key)?storage.get(key):null,
   setItem:(key,value)=>storage.set(key,String(value))
  },
  document:{createElement:()=>node(),body:{append:n=>views.push(n)}},
  window:{setTimeout:()=>{},location:{reload:()=>{}}},
  Blob:class{},URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}}
 };
 runInNewContext(script,context);
 let starts=0;
 context.window.NatationStorageGuard.beforeStart(()=>starts++);
 return {storage,views,starts:()=>starts};
}
test('les évaluations existantes sont copiées avant démarrage',()=>{
 const env=environment({'natation-6e:data:v2':VALID});
 assert.equal(env.starts(),1);
 assert.equal(env.storage.get('natation-6e:recovery:last-valid-v2'),VALID);
});
test('une version vide ne détruit pas la dernière sauvegarde',()=>{
 const env=environment({
  'natation-6e:data:v2':JSON.stringify({version:12,classes:[]}),
  'natation-6e:recovery:last-valid-v2':VALID
 });
 assert.equal(env.starts(),0);
 assert.equal(env.storage.get('natation-6e:recovery:last-valid-v2'),VALID);
 assert.equal(env.views.length,1);
});
test('un stockage illisible arrête le démarrage',()=>{
 const env=environment({'natation-6e:data:v2':'{corrompu'});
 assert.equal(env.starts(),0);
 assert.equal(env.views.length,1);
 assert.equal(env.storage.get('natation-6e:data:v2'),'{corrompu');
});
test('les anciennes données v1 restent disponibles pour la migration officielle',()=>{
 const env=environment({'natation-6e:data:v1':VALID});
 assert.equal(env.starts(),1);
 assert.equal(env.storage.has('natation-6e:data:v2'),false);
});
