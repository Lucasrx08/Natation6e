// Attendance is a dated observation; never carry yesterday's absence forward.
export function parisDay(now=new Date()){
 const parts=new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 return ['year','month','day'].map(type=>parts.find(p=>p.type===type).value).join('-');
}
export const presentForDay=(student,day)=>!['absent','exempt'].includes(student?.attendance?.[day]?.status);
export const availablePupils=(students,day)=>students.filter(p=>presentForDay(p,day));
export function reconcilePair(ids,students){
 const known=new Set(students.map(p=>p.id)),first=known.has(ids?.[0])?ids[0]:students.find(p=>p.id!==ids?.[1])?.id||students[0]?.id||'';
 const second=known.has(ids?.[1])&&ids[1]!==first?ids[1]:students.find(p=>p.id!==first)?.id||'';
 return [first,second];
}
export function useParisDay(React){
 const[day,setDay]=React.useState(parisDay);
 React.useEffect(()=>{const update=()=>setDay(parisDay()),timer=setInterval(update,30000);window.addEventListener('focus',update);document.addEventListener('visibilitychange',update);update();return()=>{clearInterval(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update)}},[]);
 return day;
}
