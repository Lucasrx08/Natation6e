// One exact weighted value for every on-screen grade and export.
export function weightedValue(student,config,maximum=20,field='rubricLevels'){
 const levels=student?.[field]||{};
 if(!config?.confirmed||!Array.isArray(config.criteria)||!config.criteria.length||!Array.isArray(config.points)||config.points.length!==4||!Number.isFinite(maximum)||maximum<=0)return null;
 if(config.points.some((p,i,a)=>!Number.isFinite(p)||p<0||(i>0&&p<a[i-1]))||config.points[3]<=0)return null;
 if(config.criteria.some(c=>!Number.isFinite(c.weight)||c.weight<=0||![1,2,3,4].includes(levels[c.id])))return null;
 // Level four always earns the full configured budget, regardless of coefficient sum.
 if(config.criteria.every(c=>levels[c.id]===4))return maximum;
 const total=config.criteria.reduce((sum,c)=>sum+c.weight,0);
 return Math.min(maximum,maximum*config.criteria.reduce((sum,c)=>sum+c.weight*config.points[levels[c.id]-1]/config.points[3],0)/total);
}
