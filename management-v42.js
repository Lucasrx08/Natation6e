// Reversible changes: records remain in the existing class payload and keep their IDs.
const list=value=>Array.isArray(value)?value:[];
export function renamePupil(cl,id,surname,givenName){
 const name=[String(surname).trim().toLocaleUpperCase('fr'),String(givenName).trim()].filter(Boolean).join(' ');
 if(!String(surname).trim()||!String(givenName).trim()||name.length>160)return cl;
 return {...cl,students:cl.students.map(p=>p.id===id?{...p,name}:p)};
}
export function retirePupil(cl,id){
 const student=cl.students.find(p=>p.id===id);if(!student)return cl;
 return {...cl,students:cl.students.filter(p=>p.id!==id),archivedStudents:[...list(cl.archivedStudents).filter(p=>p.id!==id),student]};
}
export function restorePupil(cl,id){
 const student=list(cl.archivedStudents).find(p=>p.id===id);if(!student||cl.students.some(p=>p.id===id))return cl;
 return {...cl,students:[...cl.students,student].sort((a,b)=>a.name.localeCompare(b.name,'fr',{sensitivity:'base'})),archivedStudents:list(cl.archivedStudents).filter(p=>p.id!==id)};
}
export function retireColumn(cl,id){
 const columns=list(cl.trackingColumns),column=columns.find(c=>c.id===id);if(!column)return cl;
 return {...cl,trackingColumns:columns.filter(c=>c.id!==id),archivedTrackingColumns:[...list(cl.archivedTrackingColumns).filter(x=>x.column.id!==id),{column,index:columns.indexOf(column)}]};
}
export function restoreColumn(cl,id){
 const entry=list(cl.archivedTrackingColumns).find(x=>x.column.id===id),columns=[...list(cl.trackingColumns)];
 if(!entry||columns.some(c=>c.id===id))return cl;
 columns.splice(Math.max(0,Math.min(entry.index,columns.length)),0,entry.column);
 return {...cl,trackingColumns:columns,archivedTrackingColumns:list(cl.archivedTrackingColumns).filter(x=>x.column.id!==id)};
}
export function setSessionVisible(cl,date,visible){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return cl;
 return {...cl,cycleDates:[...new Set([...list(cl.cycleDates),date])].sort(),hiddenCycleDates:visible?list(cl.hiddenCycleDates).filter(d=>d!==date):[...new Set([...list(cl.hiddenCycleDates),date])]};
}
