// Pure data helpers shared by the register, pool plan, rubric and regression checks.
export const CAP_COLORS = ['#ff657f','#ffb34f','#f4da59','#46bfa2','#35bde4','#536bde','#a26fe0','#f7f8fc'];
export const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
export function cycleDates(cl,today) {
  const dates = [...(Array.isArray(cl?.cycleDates)?cl.cycleDates:[]),...(cl?.students||[]).flatMap(p=>Object.keys(p.attendance||{}))].filter(validDate);
  return [...new Set(dates.length?dates:validDate(today)?[today]:[])].sort();
}
export function weeklyDates(start,count,interval=7) {
  if(!validDate(start)||!Number.isInteger(count)||count<1||count>40||!Number.isInteger(interval)||interval<1||interval>60)return [];
  return Array.from({length:count},(_,i)=>{const date=new Date(start+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+i*interval);return date.toISOString().slice(0,10)});
}
export function attendanceCell(student,date,today) {
  const entry=student.attendance?.[date]||{};
  return {status:['present','absent','exempt'].includes(entry.status)?entry.status:'present',forgotKit:entry.forgotKit===true};
}
export function automaticDiploma(student,eligible,date){
  const previous=student.diploma||{},awarded=eligible===true;
  const diploma={...previous,awarded,automatic:true,...(awarded?{date:previous.awarded&&validDate(previous.date)?previous.date:date}:{})};
  if(previous.awarded===diploma.awarded&&previous.automatic===true&&previous.date===diploma.date)return student;
  return {...student,diploma};
}
export function attendanceIconPreset(cl){
  if(cl.attendanceIconVersion===22)return cl;
  return {...cl,...(cl.attendanceIcons?{attendanceIconsBeforeV22:cl.attendanceIcons}:{}),attendanceIconVersion:22,attendanceIcons:{present:{name:'check'},absent:{name:'cross'},exempt:{name:'medical'},kit:{name:'kit'}}};
}
export function assignedLane(student,date) {
  let lane=null;
  for(const d of Object.keys(student.attendance||{}).filter(d=>d<=date).sort())if(Object.hasOwn(student.attendance[d],'lane'))lane=student.attendance[d].lane;
  return Number.isInteger(lane)&&lane>=1&&lane<=12?lane:null;
}
export function moveInPlan(cl,id,lane,beforeId,date) {
  const known=new Set(cl.students.map(p=>p.id));
  if(!known.has(id)||!(lane===null||Number.isInteger(lane)&&lane>=1&&lane<=12))return cl;
  const order=[...new Set([...(cl.poolOrder||[]),...known])].filter(x=>known.has(x)&&x!==id);
  const before=beforeId&&order.indexOf(beforeId);if(beforeId&&before>=0)order.splice(before,0,id);else order.push(id);
  return {...cl,poolOrder:order,students:cl.students.map(p=>p.id===id?{...p,attendance:{...p.attendance,[date]:{...p.attendance?.[date],lane}}}:p)};
}
export function orderedPupils(cl,students) {
  const positions=new Map((cl.poolOrder||[]).map((id,i)=>[id,i]));
  return [...students].sort((a,b)=>(positions.get(a.id)??1e6)-(positions.get(b.id)??1e6));
}
export function normalizeStudentRecords(p) {
  const pending=p.learning?.['floating-v19-2'];
  return pending?.status==='requested'?{...p,learning:{...p.learning,'floating-v19-2':{...pending,status:'achieved'}}}:p;
}
export function defaultRubric() {
  return {title:'Évaluation démonstration de nage',confirmed:true,points:[1,2,3,4],criteria:[
    {id:'dive',label:'Plongeon',weight:15,descriptions:[
      'Je saute dans l’eau sans appréhension.',
      'Je plonge sans pousser dans mes jambes. Mon plongeon est trop profond, mes bras sont positionnés le long de mon corps pendant la coulée.',
      'Je plonge avec une poussée efficace mais mes bras et mes jambes ne sont pas alignés. Mes bras reviennent le long de mon corps pendant la coulée.',
      'Mon plongeon est efficace, je vais loin avec mes bras tendus devant pour effectuer une reprise de nage à la surface.'
    ]},
    {id:'balance',label:'Équilibre',weight:20,descriptions:[
      'Je nage avec un corps très incliné, ma tête est mobile, elle pivote de gauche à droite.',
      'Je nage avec un corps incliné et une tête fixe. Je regarde vers le fond du bassin.',
      'Mon corps est proche de la surface de l’eau même pendant mon inspiration. Ma tête est fixe, je regarde vers le fond.',
      'Mon corps est à la surface de l’eau. Je suis capable d’avoir un mouvement de roulis pour améliorer ma propulsion.'
    ]},
    {id:'propulsion',label:'Propulsion',weight:20,descriptions:[
      'Je fais des battements de jambes peu efficaces, je tape sur l’eau, mes bras fléchis.',
      'Mes battements de jambes manquent de rythme mais commencent à être propulsifs. L’entrée de mes mains dans l’eau est désaxée. Mon trajet moteur est rectiligne.',
      'Mes battements de jambes sont assez réguliers mais non coordonnés avec mes bras. Mes gestes se dégradent avec la fatigue.',
      'Mes battements de jambes sont rythmés et propulsifs, mon trajet moteur forme un S.'
    ]},
    {id:'breathing',label:'Respiration',weight:20,descriptions:[
      'Je nage la tête hors de l’eau.',
      'Je nage avec la tête dans l’eau mais j’inspire en relevant la tête sur plusieurs cycles.',
      'Mon inspiration est latérale sur quelques cycles mais irrégulière ensuite.',
      'Mon inspiration est latérale et régulière sur 25 m.'
    ]}
  ]};
}
export const ICON_CHOICES=['check','cross','medical','kit','circle','minus','clock','star'];
export function laneLabel(cl,lane){return lane===null?'À répartir':String(cl.poolLaneNames?.[lane]||'Ligne '+lane)}
export function laneBadge(cl,lane){return laneLabel(cl,lane).replace(/^ligne\s*(?:d[’']eau\s*)?/i,'')}
export function registerLayout(width,height,count,sessionCount){
  const columns=count>Math.floor((height-36)/31)&&width>=680?2:1;
  const rows=Math.max(1,Math.ceil(count/columns)),panelWidth=(width-(columns-1)*12)/columns;
  const nameWidth=Math.min(178,Math.max(105,panelWidth*.29));
  const datesPerPage=Math.max(1,Math.min(sessionCount||1,Math.floor((panelWidth-nameWidth)/38)));
  return {columns,rows,nameWidth,datesPerPage,rowHeight:Math.max(18,(height-38)/rows)};
}
export function bestBoard(width,height,count,{minWidth=96,maxColumns=12,header=0}={}){
  if(!count)return{columns:1,rows:1,cardWidth:width,cardHeight:height-header};
  const choices=[];
  for(let columns=1;columns<=Math.min(count,maxColumns,Math.max(1,Math.floor(width/minWidth)));columns++){
    const rows=Math.ceil(count/columns),cardWidth=(width-(columns-1)*7)/columns,cardHeight=(height-header-(rows-1)*7)/rows;
    choices.push({columns,rows,cardWidth,cardHeight,score:Math.min(cardWidth/1.05,cardHeight)});
  }
  return choices.sort((a,b)=>b.score-a.score)[0]||{columns:1,rows:count,cardWidth:width,cardHeight:(height-header)/count};
}
export function remapRubricIds(incoming,previous){
  const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  return {...incoming,title:'Évaluation démonstration de nage',criteria:incoming.criteria.map((c,i)=>({...c,id:previous?.criteria?.find(old=>norm(old.label)===norm(c.label))?.id||'import-'+norm(c.label).replaceAll(' ','-')+'-'+i}))};
}
export function rubricValid(config) {
  return !!config&&Array.isArray(config.points)&&config.points.length===4&&config.points.every(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0)&&Math.max(...config.points)>0&&config.points.every((x,i,a)=>!i||x>=a[i-1])&&Array.isArray(config.criteria)&&config.criteria.length>0&&config.criteria.every(c=>c.id&&c.label?.trim()&&typeof c.weight==='number'&&Number.isFinite(c.weight)&&c.weight>0&&Array.isArray(c.descriptions)&&c.descriptions.length===4&&c.descriptions.every(x=>typeof x==='string'&&x.trim()))&&new Set(config.criteria.map(c=>c.id)).size===config.criteria.length&&new Set(config.criteria.map(c=>c.label.trim().toLocaleLowerCase('fr'))).size===config.criteria.length;
}
export function rubricGrade(student,config,maximum=20) {
  if(!config?.confirmed||!rubricValid(config))return null;
  const selected=student.rubricLevels||{},total=config.criteria.reduce((sum,c)=>sum+c.weight,0);
  if(config.criteria.some(c=>![1,2,3,4].includes(selected[c.id])))return null;
  const value=maximum*config.criteria.reduce((sum,c)=>sum+c.weight*config.points[selected[c.id]-1]/Math.max(...config.points),0)/total;
  return Math.round(value*100)/100;
}
export function rubricRows(students,config,fullName) {
  return students.map(p=>({'Nom Prénom':fullName(p.name),...Object.fromEntries(config.criteria.map(c=>[c.label,p.rubricLevels?.[c.id]||''])),'Note / 20':rubricGrade(p,config)??'',État:!config.confirmed?'Barème à valider':rubricGrade(p,config)===null?'À terminer':'Complet'}));
}
