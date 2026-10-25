import {defaultRubric,rubricValid} from './cycle-model-v25.js';
import {aquaticRubric,aquaticGroups,aquaticValue} from './aquatic-model-v25.js';
const round=x=>x===null?null:Math.round((x+Number.EPSILON)*100)/100;
export function evaluationSummary(p,cl){
 const config=cl.rubric||defaultRubric(),course=aquaticRubric(cl),levels=p?.rubricLevels||{},complete=config.confirmed&&rubricValid(config)&&config.criteria.every(c=>[1,2,3,4].includes(levels[c.id]));
 const demo=complete?10*config.criteria.reduce((sum,c)=>sum+c.weight*config.points[levels[c.id]-1]/Math.max(...config.points),0)/config.criteria.reduce((sum,c)=>sum+c.weight,0):null;
 const aquatic=aquaticValue(p,course),groups=aquaticGroups(p,course);
 return {demo:round(demo),aquatic:round(aquatic),total:demo===null||aquatic===null?null:round(round(demo)+round(aquatic)),groups};
}
export function evaluationRows(students,cl,fullName){const config=cl.rubric||defaultRubric();return students.map(p=>{const result=evaluationSummary(p,cl);return {'Nom Prénom':fullName(p.name),...Object.fromEntries(config.criteria.map(c=>[c.label,p.rubricLevels?.[c.id]||''])),...Object.fromEntries(result.groups.map(g=>[g.label+' · niveau moyen',g.level??''])),'Démonstration / 10':result.demo??'','Parcours / 10':result.aquatic??'','Note / 20':result.total??'',État:result.total===null?'À terminer':'Complet'}})}
