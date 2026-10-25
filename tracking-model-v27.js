import {cycleDates} from './cycle-model-v27.js';

export const TRACKING_TYPES=[['icons','Banque d’icônes'],['level','Évaluation · 4 niveaux'],['equipment','Matériel de nage'],['emoji','Émoticônes'],['text','Observation'],['number','Nombre']];
export const TRACKING_SYMBOLS=[
  {id:'level-1',label:'À travailler',color:'#ed5a69',level:1},
  {id:'level-2',label:'En progrès',color:'#f6a845',level:2},
  {id:'level-3',label:'Presque acquis',color:'#f2d64b',level:3},
  {id:'level-4',label:'Acquis',color:'#64bf65',level:4},
  {id:'board',image:'./assets/v26/board-3d.png',label:'Planche'},{id:'noodle',image:'./assets/v26/noodle-3d.png',label:'Frite'},
  {id:'belt',image:'./assets/v26/belt-3d.png',label:'Ceinture'},{id:'pullbuoy',image:'./assets/v26/pullbuoy-3d.png',label:'Pull-buoy'}
];
export const trackingColumns=cl=>(Array.isArray(cl?.trackingColumns)?cl.trackingColumns:[]).filter(c=>c&&typeof c.id==='string'&&TRACKING_TYPES.some(([type])=>type===c.type));
export const trackingIcons=cl=>[...(cl?.trackingIconLibrary||[]),...trackingColumns(cl).flatMap(c=>c.options||[])].filter((o,i,all)=>all.findIndex(x=>x.id===o.id)===i);
export function cycleColumns(cl,today){
  const dates=cycleDates(cl,today),custom=trackingColumns(cl),result=[];
  for(const date of dates){result.push({id:'session:'+date,type:'session',date});result.push(...custom.filter(c=>c.afterDate===date))}
  return [...result,...custom.filter(c=>!dates.includes(c.afterDate))];
}
export function trackingLabel(value,column){
  if(value===null||value===undefined||value==='')return '';
  const symbol=id=>TRACKING_SYMBOLS.find(x=>x.id===id)?.label||column.options?.find(x=>x.id===id)?.label||String(id);
  if(column.type==='level')return 'Niveau '+value+' · '+symbol('level-'+value);
  return Array.isArray(value)?value.map(symbol).join(', '):['emoji','icons','equipment'].includes(column.type)?symbol(value):String(value);
}
export function trackingRows(students,cl,today,fullName){
  const columns=cycleColumns(cl,today),counts=new Map();
  const keys=columns.map(c=>{const base=c.type==='session'?'Présence '+c.date:c.label;const n=(counts.get(base)||0)+1;counts.set(base,n);return n===1?base:base+' ('+n+')'});
  return students.map(p=>({'Nom Prénom':fullName(p.name),...Object.fromEntries(columns.flatMap((c,i)=>c.type==='session'?[[keys[i],({absent:'Absent',exempt:'Dispensé'}[p.attendance?.[c.date]?.status]||'Présent')],[('Matériel oublié '+c.date),p.attendance?.[c.date]?.forgotKit?'Oui':'']]:[[keys[i],c.type==='number'?(p.trackingValues?.[c.id]??''):trackingLabel(p.trackingValues?.[c.id],{...c,options:trackingIcons(cl)})]]))}));
}
