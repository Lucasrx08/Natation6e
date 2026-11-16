import {gradeQuarter} from '../grading-v27.js';
import {weightedValue} from '../score-v37.js';
import {defaultRubric,rubricGrade,cycleDates} from '../cycle-model-v37.js';
import {defaultAquaticRubric,aquaticGrade,aquaticValue} from '../aquatic-base-v37.js';
import {evaluationSummary,evaluationRows,displayedLevel} from '../evaluation-v37.js';
import {trackingRows} from '../tracking-model-v37.js';
import {availablePupils,reconcilePair,parisDay} from '../session-v37.js';

const assert=(ok,message)=>{if(!ok)throw Error(message)};
const make=(level=4)=>({id:'one',name:'ALBERT Zoé',rubricLevels:Object.fromEntries(defaultRubric().criteria.map(c=>[c.id,level])),aquaticLevels:Object.fromEntries(defaultAquaticRubric().criteria.map(c=>[c.id,level])),learning:{one:{status:'achieved'}},assessments:{one:'mastered'}});
const perfect=make(),cl={students:[perfect]},before=JSON.stringify(perfect);
assert(evaluationSummary(perfect,cl).total===20,'All level 4 must be 20/20');
assert(evaluationSummary(perfect,cl).demo===10,'Demo perfect must be 10/10');
assert(evaluationSummary(perfect,cl).aquatic===10,'Aquatic perfect must be 10/10');
assert(rubricGrade(perfect,defaultRubric())===20,'Legacy-compatible helper max');
assert(aquaticGrade(perfect,defaultAquaticRubric())===10,'Aquatic helper max');
const varied={...cl,evaluationSettings:{demoMax:8,aquaticMax:12},rubric:{...defaultRubric(),points:[0,2,4,8],criteria:defaultRubric().criteria.map((c,i)=>({...c,weight:[2,3,7,11][i]}))},aquaticRubric:{...defaultAquaticRubric(),points:[0,1,3,7],criteria:defaultAquaticRubric().criteria.map((c,i)=>({...c,weight:i+1}))}};
assert(evaluationSummary(perfect,varied).total===20,'Custom 8+12 with arbitrary weights must be 20');
assert(evaluationSummary(perfect,{...cl,evaluationSettings:{demoMax:12,aquaticMax:8}}).total===20,'12+8 max');
const partial=make();delete partial.aquaticLevels['aq-ring'];
assert(evaluationSummary(partial,cl).aquatic===null&&evaluationSummary(partial,cl).total===null&&evaluationSummary(partial,cl).demo===10,'Partial must not silently award total');
const unassessed=make();delete unassessed.rubricLevels.breathing;
assert(evaluationSummary(unassessed,cl).demo===null,'Missing demo remains incomplete');
for(let code=0;code<4096;code++){
 const p=make(),levels=defaultAquaticRubric().criteria.map((c,i)=>((code>>(i*2))&3)+1);
 defaultAquaticRubric().criteria.forEach((c,i)=>p.aquaticLevels[c.id]=levels[i]);
 const expected=10*levels.reduce((a,b)=>a+b,0)/24,grade=aquaticGrade(p,defaultAquaticRubric());
 assert(Math.abs(aquaticValue(p,defaultAquaticRubric())-expected)<1e-10,'Exact course mean '+code);
 assert(grade>=expected-1e-9&&grade<expected+.25+1e-9&&Number.isInteger(grade*4),'Quarter rounding '+code);
 assert(evaluationSummary(p,cl).aquatic===grade,'UI/export course consistency '+code);
}
for(let code=0;code<256;code++){
 const p=make(),config=defaultRubric(),levels=config.criteria.map((c,i)=>((code>>(i*2))&3)+1);
 config.criteria.forEach((c,i)=>p.rubricLevels[c.id]=levels[i]);
 const exact=10*config.criteria.reduce((sum,c,i)=>sum+c.weight*levels[i]/4,0)/75,result=evaluationSummary(p,cl);
 assert(Math.abs(weightedValue(p,config,10)-exact)<1e-10,'75 relative coefficients '+code);
 assert(result.demo===rubricGrade(p,config,10),'All grade helpers agree '+code);
 assert(result.total===gradeQuarter(exact+10,20),'Total rounds exact values once '+code);
}
const mixed=make();mixed.aquaticLevels['aq-outward']=2;mixed.aquaticLevels['aq-return']=3;mixed.aquaticLevels['aq-ring']=4;mixed.aquaticLevels['aq-upright']=2;mixed.aquaticLevels['aq-star']=4;
const groups=evaluationSummary(mixed,cl).groups;
assert(groups.find(g=>g.id==='immersion').level===3&&groups.find(g=>g.id==='floating').level===3,'Requested grouped means');
assert(displayedLevel(3.99)===3&&displayedLevel(4)===4,'Intermediate means cannot falsely display attained level 4');
const day='2026-11-16',next='2026-11-23',a={...make(),id:'a',attendance:{[day]:{status:'absent',lane:2}}},b={...make(),id:'b',attendance:{[day]:{status:'exempt'}}},c={...make(),id:'c',attendance:{'2026-11-09':{status:'absent'}}},d={...make(),id:'d',attendance:{[day]:{status:'present',forgotKit:true}}};
const all=[a,b,c,d],original=JSON.stringify(all),active=availablePupils(all,day);
assert(active.map(p=>p.id).join(',')==='c,d','Only today absent/exempt hidden; forgotten equipment stays visible');
assert(availablePupils(all,next).length===4,'Previous week absence never carried forward');
assert(JSON.stringify(all)===original&&JSON.stringify(perfect)===before,'Filtering and scores never mutate progression');
assert(reconcilePair(['a','b'],active).join(',')==='c,d','Hidden current selections replaced');
assert(new Set(reconcilePair(['c','c'],active)).size===2,'No duplicate lane selections');
assert(reconcilePair(['a','b'],[]).join(',')===',','No eligible students');
assert(reconcilePair(['a','b'],[c]).join(',')==='c,','One eligible student');
assert(parisDay(new Date('2026-11-16T23:30:00Z'))==='2026-11-17','Paris date past UTC midnight boundary');
assert(parisDay(new Date('2026-07-16T22:30:00Z'))==='2026-07-17','Paris daylight-saving date');
const exportRows=trackingRows(all,{...cl,students:all},day,x=>x);
assert(exportRows.length===4&&exportRows[0]['Total / 20']===20,'Follow export retains all pupils and the three notes');
assert(evaluationRows([perfect],cl,x=>x)[0]['Note / 20']===20,'Evaluation export maximum');
console.log('PASS V37: 4352 score combinations, 20/20, exports, date-specific attendance, Paris midnight, non-destructive filtering.');
