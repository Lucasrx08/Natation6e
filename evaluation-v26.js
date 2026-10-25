import {defaultRubric,rubricValid} from './cycle-model-v26.js';
import {aquaticRubric,aquaticGroups,aquaticValue} from './aquatic-model-v26.js';
const round=x=>x===null?null:Math.round((x+Number.EPSILON)*100)/100;
export function evaluationSettings(cl){
 const valid=n=>Number.isFinite(n)&&n>0&&n<=1000;
 const saved=cl?.evaluationSettings||{},demoMax=valid(saved.demoMax)?saved.demoMax:10,aquaticMax=valid(saved.aquaticMax)?saved.aquaticMax:10;
 return {demoMax,aquaticMax,total:round(demoMax+aquaticMax)};
}
export function demoRubric(cl){
 const config=cl?.rubric||defaultRubric(),preset=defaultRubric();
 // The original preset's 75 coefficients are relative weights, not missing points.
 const original=!config.source&&JSON.stringify(config.points)===JSON.stringify(preset.points)&&JSON.stringify(config.criteria)===JSON.stringify(preset.criteria);
 return original&&!config.confirmed?{...config,confirmed:true}:config;
}
export function combinedCriteria(cl){
 const course=aquaticRubric(cl);
 return [
  {id:'entry',label:'Saut arrière',descriptions:course.criteria.find(c=>c.id==='aq-entry').descriptions},
  {id:'immersion',label:'Immersion',descriptions:[
   'Je ne franchis pas l’obstacle et je n’atteins pas l’anneau.',
   'Je passe sous le tapis en le touchant ou j’atteins l’anneau sans le remonter.',
   'Je passe complètement sous le tapis ou je remonte l’anneau avec appui.',
   'Je passe dans le cerceau lesté et je remonte l’anneau sans appui.'
  ]},
  {id:'floating',label:'Flottaison',descriptions:[
   'Je ne tiens pas encore les 15 secondes.',
   'Mon nez touche l’eau debout ; sur le dos, mes jambes se replient et s’enfoncent.',
   'Je tiens 15 secondes, mais mon visage touche l’eau debout ou mes orteils restent immergés sur le dos.',
   'Je tiens 15 secondes en respirant calmement : cou hors de l’eau debout, corps à plat et orteils émergés sur le dos.'
  ]}
 ];
}
export const displayedLevel=level=>level===null?null:Math.max(1,Math.min(4,Math.round(level)));
export function evaluationSummary(p,cl){
 const config=demoRubric(cl),course=aquaticRubric(cl),settings=evaluationSettings(cl),levels=p?.rubricLevels||{},complete=config.confirmed&&rubricValid(config)&&config.criteria.every(c=>[1,2,3,4].includes(levels[c.id]));
 const demo=complete?settings.demoMax*config.criteria.reduce((sum,c)=>sum+c.weight*config.points[levels[c.id]-1]/Math.max(...config.points),0)/config.criteria.reduce((sum,c)=>sum+c.weight,0):null;
 const aquatic=aquaticValue(p,course,settings.aquaticMax),groups=aquaticGroups(p,course);
 return {demo:round(demo),aquatic:round(aquatic),total:demo===null||aquatic===null?null:round(round(demo)+round(aquatic)),groups,settings};
}
export function evaluationRows(students,cl,fullName){const config=demoRubric(cl),settings=evaluationSettings(cl);return students.map(p=>{const result=evaluationSummary(p,cl);return {'Nom Prénom':fullName(p.name),...Object.fromEntries(config.criteria.map(c=>[c.label,p.rubricLevels?.[c.id]||''])),...Object.fromEntries(result.groups.map(g=>[g.label+' · niveau moyen',g.level??''])),['Démonstration / '+settings.demoMax]:result.demo??'',['Parcours / '+settings.aquaticMax]:result.aquatic??'',['Note / '+settings.total]:result.total??'',État:result.total===null?'À terminer':'Complet'}})}
