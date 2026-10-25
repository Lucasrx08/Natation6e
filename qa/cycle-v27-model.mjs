import assert from 'node:assert/strict';
import {gradeQuarter} from '../grading-v27.js';
import {defaultRubric,rubricGrade} from '../cycle-model-v27.js';
import {defaultAquaticRubric,aquaticValue,aquaticGrade,aquaticGroups,aquaticRows} from '../aquatic-model-v27.js';
import {evaluationSummary,evaluationRows} from '../evaluation-v27.js';
for(const [value,expected] of [[7.08,7.25],[7.25,7.25],[7.26,7.5],[7.5,7.5],[7.51,7.75],[7.75,7.75],[7.76,8],[0,0],[20,20],[7.250000000000001,7.25],[7.250001,7.5]])assert.equal(gradeQuarter(value),expected);
for(const bad of [null,undefined,NaN,Infinity])assert.equal(gradeQuarter(bad),null);
const cl={},aquatic=defaultAquaticRubric(),rubric=defaultRubric(),p={name:'FICTIF Camille',rubricLevels:{dive:3,balance:3,propulsion:3,breathing:4},aquaticLevels:{'aq-entry':2,'aq-outward':3,'aq-upright':4,'aq-star':3,'aq-return':2,'aq-ring':3}};
assert.equal(aquaticGrade(p,aquatic),7.25);assert.ok(Math.abs(aquaticValue(p,aquatic)-7.083333333333333)<1e-10);assert.equal(aquaticGroups(p,aquatic)[1].level,8/3);
const summary=evaluationSummary(p,cl);assert.deepEqual([summary.demo,summary.aquatic,summary.total],[8.25,7.25,15.25]);assert.notEqual(summary.total,summary.demo+summary.aquatic,'Do not compound upward rounding when calculating the final grade');assert.equal(rubricGrade(p,rubric,10),8.25);
assert.equal(evaluationRows([p],cl,x=>x)[0]['Note / 20'],15.25);assert.equal(aquaticRows([p],aquatic,x=>x)[0]['Parcours / 10'],7.25);
for(let entry=1;entry<=4;entry++)for(let outward=1;outward<=4;outward++)for(let star=1;star<=4;star++){const pupil={...p,aquaticLevels:{...p.aquaticLevels,'aq-entry':entry,'aq-outward':outward,'aq-star':star}};const result=evaluationSummary(pupil,{evaluationSettings:{demoMax:8,aquaticMax:12}});for(const value of [result.demo,result.aquatic,result.total])assert.equal((value*4)%1,0);assert.ok(result.total<=20)}
const partial={...p,aquaticLevels:{...p.aquaticLevels,'aq-ring':null}};assert.equal(evaluationSummary(partial,cl).total,null);assert.equal(aquaticGrade(partial,aquatic),null);
console.log('PASS upward quarter-point grades, exact level means, no double rounding, configurable budgets, missing results and export values');
