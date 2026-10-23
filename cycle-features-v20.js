import {CAP_COLORS,cycleDates,weeklyDates,attendanceCell,assignedLane,moveInPlan,orderedPupils,defaultRubric,rubricValid,rubricGrade} from './cycle-model-v20.js';

export function createCycleFeatures({React,el,updateSession,todayParis,fullName,eligibleDiploma,printCertificate}) {
  const {useState,useRef,useEffect}=React;
  const shortDate=d=>new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'});
  const longDate=d=>new Date(d+'T12:00:00').toLocaleDateString('fr-FR');
  function KitIcon({missing=false}) {return el('svg',{viewBox:'0 0 32 32',width:26,height:26,fill:'none','aria-hidden':true},el('path',{d:'M10 4h4v7h4V4h4l-2 9 5 14h-7l-2-7-2 7H7l5-14z',stroke:'currentColor',strokeWidth:2,strokeLinejoin:'round'}),missing&&el('path',{d:'M4 4l24 24',stroke:'currentColor',strokeWidth:3,strokeLinecap:'round'}))}
  function SwimmerAvatar({profile={}}) {
    const female=profile.style==='female',cap=CAP_COLORS.includes(profile.cap)?profile.cap:CAP_COLORS[4];
    return el('svg',{viewBox:'0 0 100 106',className:'plan-avatar','aria-hidden':true},
      el('circle',{cx:50,cy:51,r:45,fill:'#dff8fc'}),
      el('path',{d:'M17 103c0-24 15-38 33-38s33 14 33 38',fill:female?'#8666d9':'#237ca9'}),
      female&&el('path',{d:'M22 99L32 72M78 99L68 72',stroke:'#fbe4d0',strokeWidth:10}),
      el('rect',{x:43,y:61,width:14,height:16,rx:6,fill:'#f1bc94'}),
      el('ellipse',{cx:50,cy:43,rx:25,ry:29,fill:'#f7cfa9'}),
      el('path',{d:'M24 37C22 3 78 3 76 37L63 32H37Z',fill:cap,stroke:'#173c55',strokeWidth:2}),
      el('path',{d:'M25 38h50',stroke:'#173c55',strokeWidth:3}),
      el('rect',{x:29,y:34,width:17,height:14,rx:6,fill:'#aeeefa',stroke:'#173c55',strokeWidth:3}),
      el('rect',{x:54,y:34,width:17,height:14,rx:6,fill:'#aeeefa',stroke:'#173c55',strokeWidth:3}),
      el('path',{d:'M46 39h8M42 56q8 7 16 0',stroke:'#173c55',strokeWidth:2,fill:'none',strokeLinecap:'round'}),
      el('path',{d:'M10 99q10-7 20 0t20 0t20 0t20 0',stroke:'#45d3e5',strokeWidth:5,fill:'none'}));
  }
  function SessionDialog({cl,onClass,onClose}) {
    const [start,setStart]=useState(todayParis),[count,setCount]=useState(10),[interval,setInterval]=useState(7),[error,setError]=useState('');
    const preview=weeklyDates(start,Number(count),Number(interval));
    function submit(event){event.preventDefault();if(!preview.length){setError('Choisis une date et entre 1 et 40 séances.');return}onClass(old=>({...old,cycleDates:[...new Set([...cycleDates(old,''),...preview])].sort()}));onClose()}
    return el('div',{className:'modal-backdrop'},el('section',{className:'modal-card cycle-session-dialog',role:'dialog','aria-modal':true,'aria-labelledby':'cycle-dates-title'},
      el('button',{className:'modal-close',onClick:onClose,'aria-label':'Fermer'},'×'),el('h2',{id:'cycle-dates-title'},'Les séances du cycle'),
      el('p',null,'Ajoute toutes les dates en une fois, ou une seule séance. Les dates et le suivi déjà saisis sont conservés.'),
      el('form',{onSubmit:submit},
        el('label',null,'Première séance',el('input',{type:'date',required:true,value:start,onChange:e=>setStart(e.target.value),'aria-label':'Première séance du cycle'})),
        el('label',null,'Nombre de séances',el('input',{type:'number',min:1,max:40,required:true,value:count,onChange:e=>setCount(e.target.value)})),
        el('label',null,'Intervalle en jours',el('input',{type:'number',min:1,max:60,required:true,value:interval,onChange:e=>setInterval(e.target.value)})),
        el('div',{className:'cycle-date-preview'},preview.map(d=>el('span',{key:d},longDate(d)))),error&&el('p',{role:'alert'},error),
        el('button',{className:'primary-button',type:'submit'},'Ajouter au cycle'))));
  }
  function Register({cl,students,onClass,onUpdate,onOpen,date,onDate}) {
    const [dialog,setDialog]=useState(false),today=todayParis(),dates=cycleDates(cl,today);
    const symbols={present:'✓',absent:'×',exempt:'✚',unmarked:'·'},labels={present:'Présent',absent:'Absent',exempt:'Dispensé',unmarked:'À renseigner'};
    const next={unmarked:'present',present:'absent',absent:'exempt',exempt:'present'};
    return el('section',{className:'cycle-register'},
      el('div',{className:'cycle-toolbar'},el('div',null,el('h3',null,'Mon cycle, séance après séance'),el('p',null,'Touche ✓ pour changer la présence. Le maillot signale un oubli de matériel.')),
        el('button',{className:'secondary-button',onClick:()=>setDialog(true)},'Configurer les séances')),
      el('div',{className:'register-legend'},el('span',null,'✓ Présent'),el('span',null,'× Absent'),el('span',null,'✚ Dispensé'),el('span',null,el(KitIcon,{missing:true}),'Matériel oublié'),el('span',null,'· À renseigner')),
      el('div',{className:'cycle-register-scroll',tabIndex:0,'aria-label':'Suivi des séances du cycle'},el('table',{className:'cycle-register-table'},
        el('thead',null,el('tr',null,el('th',{scope:'col',className:'register-name'},'Élève'),dates.map((d,i)=>el('th',{key:d,scope:'col',className:d===date?'current-session':''},el('button',{className:'session-heading','aria-label':`Choisir la séance du ${longDate(d)}`,onClick:()=>onDate(d)},el('small',null,`S${i+1}`),el('strong',null,shortDate(d)),el('small',null,d.slice(0,4))))))),
        el('tbody',null,students.map(p=>el('tr',{key:p.id,'data-student-id':p.id},
          el('th',{scope:'row',className:'register-name'},el('button',{className:'roster-open-name',onClick:()=>onOpen(p.id)},fullName(p.name))),
          dates.map(d=>{const cell=attendanceCell(p,d,today);return el('td',{key:d,'data-session-date':d,className:d===date?'current-session':''},
            el('div',{className:'register-cell'},el('button',{type:'button',className:'attendance-toggle '+cell.status,'aria-label':`${labels[cell.status]} : ${p.name}, ${longDate(d)}. Changer la présence`,title:`${labels[cell.status]} → ${labels[next[cell.status]]}`,onClick:()=>onUpdate(p.id,x=>updateSession(x,d,{status:next[cell.status]}))},symbols[cell.status]),
              el('button',{type:'button',className:'kit-toggle '+(cell.forgotKit?'missing':'ready'),'aria-pressed':cell.forgotKit,'aria-label':`Oubli de matériel de ${p.name}, ${longDate(d)}`,title:cell.forgotKit?'Matériel oublié':'Matériel présent',onClick:()=>onUpdate(p.id,x=>updateSession(x,d,{forgotKit:!cell.forgotKit}))},el(KitIcon,{missing:cell.forgotKit}))))})
        ))))),
      dialog&&el(SessionDialog,{cl,onClass,onClose:()=>setDialog(false)}));
  }
  function PoolPlan({cl,students,onClass,onUpdate,onOpen,onEvaluate,date,onDate}) {
    const [selected,setSelected]=useState(''),[hover,setHover]=useState(null),[ghost,setGhost]=useState(null),drag=useRef(null),suppress=useRef(false);
    const configured=Math.min(12,Math.max(1,Number(cl.poolLanes)||3)),maxAssigned=Math.max(0,...cl.students.map(p=>assignedLane(p,date)||0)),laneCount=Math.max(configured,maxAssigned),pupil=students.find(p=>p.id===selected),ordered=orderedPupils(cl,students);
    useEffect(()=>()=>{drag.current=null},[]);
    function move(id,lane,beforeId=null){onClass(old=>moveInPlan(old,id,lane,beforeId,date));setHover(null)}
    function targetAt(x,y){const node=document.elementFromPoint(x,y),lane=node?.closest('[data-plan-lane]');return lane?{lane:Number(lane.dataset.planLane)||null,before:node.closest('[data-plan-student]')?.dataset.planStudent}:null}
    function pointerDown(e,p){if(e.button!==0)return;if(e.pointerType!=='touch')e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:p.id,name:p.name,x:e.clientX,y:e.clientY,active:false};setSelected(p.id)}
    function pointerMove(e){const current=drag.current;if(!current)return;if(!current.active&&Math.hypot(e.clientX-current.x,e.clientY-current.y)<8)return;current.active=true;setGhost({name:current.name,x:e.clientX,y:e.clientY});setHover(targetAt(e.clientX,e.clientY)?.lane??0)}
    function pointerUp(e){const current=drag.current;if(!current)return;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);drag.current=null;setGhost(null);setHover(null);if(current.active){suppress.current=true;const target=targetAt(e.clientX,e.clientY);if(target&&target.before!==current.id)move(current.id,target.lane,target.before);setTimeout(()=>suppress.current=false,0)}}
    function person(p){const status=attendanceCell(p,date,todayParis());return el('article',{key:p.id,'data-plan-student':p.id,className:'plan-person '+(p.id===selected?'selected ':'')+(status.status==='absent'||status.status==='exempt'?'unavailable':'')},
      el('button',{className:'plan-drag',type:'button',style:{touchAction:'none'},'aria-label':`Déplacer ${p.name}`,onPointerDown:e=>pointerDown(e,p),onPointerMove:pointerMove,onPointerUp:pointerUp,onPointerCancel:()=>{drag.current=null;setGhost(null);setHover(null)},onKeyDown:e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const current=assignedLane(p,date)||0;move(p.id,Math.min(laneCount,Math.max(0,current+(e.key==='ArrowRight'?1:-1)))||null)}}},'⠿'),
      el('button',{type:'button',className:'plan-select',onClick:()=>{if(!suppress.current)setSelected(p.id)},onDoubleClick:()=>onEvaluate(p.id),'aria-label':`Sélectionner ${p.name}`},el(SwimmerAvatar,{profile:p.swimmer}),el('strong',null,fullName(p.name)),status.status!=='present'&&el('small',null,{absent:'Absent',exempt:'Dispensé',unmarked:'À renseigner'}[status.status])),
      el('button',{className:'plan-evaluate',onPointerUp:e=>{if(e.pointerType==='touch')onEvaluate(p.id)},onClick:()=>onEvaluate(p.id),'aria-label':`Évaluer ${p.name}`},'Évaluer'));}
    function lane(number){const members=ordered.filter(p=>assignedLane(p,date)===number);return el('section',{key:number||0,'data-plan-lane':number||0,className:'plan-lane '+(hover===(number||0)?'drop-hover':'')},
      el('button',{className:'plan-lane-heading',onClick:()=>{if(selected)move(selected,number)},'aria-label':selected?`Placer l’élève dans ${number?'la ligne '+number:'le vestiaire'}`:number?'Ligne '+number:'À répartir'},el('strong',null,number?'LIGNE '+number:'À RÉPARTIR'),el('span',null,`${members.length} élève${members.length>1?'s':''}`)),
      el('div',{className:'plan-people'},members.map(person)),!members.length&&el('p',{className:'plan-empty'},selected?'Touche ici pour le placer':'Prends un nageur et déplace-le.'))}
    return el('section',{className:'pool-plan-panel'},
      el('div',{className:'cycle-toolbar'},el('div',null,el('h3',null,'Le plan de mon bassin'),el('p',null,'Glisse un nageur par sa poignée ⠿, ou touche son nom puis une ligne.')),
        el('label',null,'Séance',el('input',{type:'date',value:date,'aria-label':'Séance du plan',onChange:e=>e.target.value&&onDate(e.target.value)})),
        el('label',null,'Lignes d’eau',el('select',{value:laneCount,'aria-label':'Nombre de lignes d’eau',onChange:e=>onClass(old=>({...old,poolLanes:Number(e.target.value)}))},Array.from({length:12},(_,i)=>el('option',{key:i,value:i+1},i+1))))),
      pupil&&el('aside',{className:'plan-selection','aria-label':'Nageur sélectionné'},el(SwimmerAvatar,{profile:pupil.swimmer}),el('strong',null,fullName(pupil.name)),
        el('label',null,'Personnage',el('select',{'aria-label':'Personnage du nageur',value:pupil.swimmer?.style||'male',onChange:e=>onUpdate(pupil.id,p=>({...p,swimmer:{...p.swimmer,style:e.target.value}}))},el('option',{value:'male'},'Garçon'),el('option',{value:'female'},'Fille'))),
        el('div',{className:'cap-palette','aria-label':'Couleur du bonnet'},CAP_COLORS.map((color,i)=>el('button',{key:color,className:(pupil.swimmer?.cap||CAP_COLORS[4])===color?'selected':'',style:{backgroundColor:color},'aria-label':'Bonnet '+['rouge','orange','jaune','vert','bleu','indigo','violet','blanc'][i],'aria-pressed':(pupil.swimmer?.cap||CAP_COLORS[4])===color,onClick:()=>onUpdate(pupil.id,p=>({...p,swimmer:{...p.swimmer,cap:color}}))}))),
        el('label',null,'Déplacer vers',el('select',{'aria-label':'Déplacer le nageur sélectionné',value:assignedLane(pupil,date)||0,onChange:e=>move(pupil.id,Number(e.target.value)||null)},el('option',{value:0},'À répartir'),Array.from({length:laneCount},(_,i)=>el('option',{key:i,value:i+1},'Ligne '+(i+1))))),
        el('button',{className:'primary-button',onClick:()=>onEvaluate(pupil.id)},'Ouvrir la grille'),el('button',{className:'secondary-button',onClick:()=>onOpen(pupil.id)},'Test savoir-nager')),
      el('div',{className:'plan-scroll'},el('div',{className:'pool-plan',style:{gridTemplateColumns:`repeat(${laneCount+1},minmax(155px,1fr))`}},lane(null),Array.from({length:laneCount},(_,i)=>lane(i+1)))),
      ghost&&el('div',{className:'plan-drag-ghost',style:{left:ghost.x+10,top:ghost.y+10}},ghost.name));
  }
  function RubricSettings({config,onSave,onClose}) {
    const [draft,setDraft]=useState(()=>JSON.parse(JSON.stringify(config))),[error,setError]=useState('');
    function criterion(id,patch){setDraft(old=>({...old,criteria:old.criteria.map(c=>c.id===id?{...c,...patch}:c)}))}
    const total=draft.criteria.reduce((n,c)=>n+(Number(c.weight)||0),0);
    function save(e){e.preventDefault();if(!rubricValid(draft)){setError('Renseigne chaque critère, ses quatre descriptions et un coefficient positif. Les points doivent augmenter du niveau 1 au niveau 4.');return}onSave({...draft,confirmed:true});onClose()}
    return el('div',{className:'modal-backdrop'},el('section',{className:'modal-card rubric-settings',role:'dialog','aria-modal':true,'aria-labelledby':'rubric-settings-title'},
      el('button',{className:'modal-close',onClick:onClose,'aria-label':'Fermer'},'×'),el('h2',{id:'rubric-settings-title'},'Mon barème sur 20'),
      el('p',null,'Les quatre critères de ta capture totalisent 75 %. Complète la grille ou utilise uniquement ces quatre critères : leurs coefficients seront ramenés au total. Aucune part manquante n’est ajoutée.'),
      el('form',{onSubmit:save},el('label',null,'Titre de l’évaluation',el('input',{required:true,value:draft.title,onChange:e=>setDraft(x=>({...x,title:e.target.value}))})),
        el('fieldset',{className:'rubric-points'},el('legend',null,'Points par niveau'),draft.points.map((point,i)=>el('label',{key:i},'Niveau '+(i+1),el('input',{type:'number',min:0,step:.1,required:true,value:point,'aria-label':'Points du niveau '+(i+1),onChange:e=>setDraft(x=>({...x,points:x.points.map((v,j)=>j===i?Number(e.target.value):v)}))})))),
        el('p',{className:'rubric-formula'},'Note = 20 × somme (coefficient × points du niveau / points maximum) ÷ somme des coefficients.'),
        draft.criteria.map(c=>el('fieldset',{key:c.id,className:'rubric-criterion-editor'},el('legend',null,c.label||'Nouveau critère'),
          el('div',{className:'criterion-editor-heading'},el('label',null,'Critère',el('input',{required:true,value:c.label,onChange:e=>criterion(c.id,{label:e.target.value})})),el('label',null,'Coefficient',el('input',{type:'number',min:.1,step:.1,required:true,value:c.weight,onChange:e=>criterion(c.id,{weight:Number(e.target.value)})})),
            el('button',{type:'button',className:'secondary-button',disabled:draft.criteria.length<2,onClick:()=>setDraft(x=>({...x,criteria:x.criteria.filter(v=>v.id!==c.id)})),'aria-label':'Retirer le critère '+c.label},'Retirer')),
          el('div',{className:'criterion-descriptions'},c.descriptions.map((description,i)=>el('label',{key:i},'Niveau '+(i+1),el('textarea',{required:true,rows:3,value:description,'aria-label':`${c.label}, description niveau ${i+1}`,onChange:e=>criterion(c.id,{descriptions:c.descriptions.map((v,j)=>j===i?e.target.value:v)})})))))),
        el('button',{type:'button',className:'secondary-button',onClick:()=>setDraft(x=>({...x,criteria:[...x.criteria,{id:'criterion-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),label:'',weight:25,descriptions:['','','','']}]}))},'Ajouter un critère'),
        el('p',null,`Total des coefficients : ${total}. Une note ne sera calculée que lorsque tous les critères seront évalués.`),error&&el('p',{role:'alert'},error),
        el('div',{className:'modal-actions'},el('button',{type:'button',className:'secondary-button',onClick:onClose},'Annuler'),el('button',{type:'submit',className:'primary-button'},'Utiliser ce barème')))));
  }
  function RubricPanel({cl,students,onClass,onUpdate,onExport,selectedId,onSelected}) {
    const [settings,setSettings]=useState(false),config=cl.rubric||defaultRubric(),student=students.find(p=>p.id===selectedId)||students[0],grade=student?rubricGrade(student,config):null,tones=['red','orange','yellow','green'];
    function select(id,level){onUpdate(student.id,p=>({...p,rubricLevels:{...p.rubricLevels,[id]:p.rubricLevels?.[id]===level?null:level}}))}
    return el('section',{className:'rubric-panel'},
      el('div',{className:'cycle-toolbar'},el('div',null,el('h3',null,config.title),el('p',null,'Touche le niveau observé pour chaque critère. Retouche une case pour l’effacer.')),
        el('button',{className:'secondary-button',onClick:()=>setSettings(true)},'Modifier le barème'),el('button',{className:'primary-button',disabled:!config.confirmed||!students.length,onClick:onExport},'Exporter les notes vers iDoceo')),
      !config.confirmed&&el('div',{className:'rubric-unconfirmed',role:'status'},el('strong',null,'Barème à vérifier avant de calculer les notes'),el('span',null,'Les 4 critères fournis totalisent 75 %. Valide les coefficients et les points par niveau dans « Modifier le barème ».')),
      el('div',{className:'rubric-pupil-bar'},el('label',null,'Élève',el('select',{'aria-label':'Élève de la grille',value:student?.id||'',onChange:e=>onSelected(e.target.value)},students.map(p=>el('option',{key:p.id,value:p.id},fullName(p.name))))),
        student&&el('strong',{className:'rubric-pupil-name'},fullName(student.name)),el('output',{className:'rubric-score','aria-label':'Note sur 20'},grade===null?'— / 20':grade.toLocaleString('fr-FR',{maximumFractionDigits:2})+' / 20'),
        student&&el('small',null,`${config.criteria.filter(c=>[1,2,3,4].includes(student.rubricLevels?.[c.id])).length}/${config.criteria.length} critères évalués`)),
      student?el('div',{className:'rubric-table-scroll'},el('table',{className:'rubric-table'},el('thead',null,el('tr',null,el('th',{scope:'col'},'Critère'),[1,2,3,4].map((n,i)=>el('th',{key:n,scope:'col',className:tones[i]},el('strong',null,'NIVEAU '+n),el('small',null,config.points[i]+' point'+(config.points[i]>1?'s':'')))))),
        el('tbody',null,config.criteria.map(c=>el('tr',{key:c.id,'data-rubric-criterion':c.id},el('th',{scope:'row'},c.label,el('small',null,'Coef. '+c.weight)),c.descriptions.map((text,i)=>el('td',{key:i,className:tones[i]},el('button',{className:'rubric-level '+(student.rubricLevels?.[c.id]===i+1?'selected':''),'aria-pressed':student.rubricLevels?.[c.id]===i+1,'aria-label':`${c.label} : niveau ${i+1}`,onClick:()=>select(c.id,i+1)},el('span',{className:'rubric-selected-mark','aria-hidden':true},student.rubricLevels?.[c.id]===i+1?'✓':i+1),el('span',null,text))))))))):el('p',null,'Ajoute un élève pour utiliser la grille.'),
      el('p',{className:'rubric-separation'},'Cette évaluation est indépendante du test savoir-nager et des validations des ateliers.'),
      settings&&el(RubricSettings,{config,onSave:rubric=>onClass(old=>({...old,rubric})),onClose:()=>setSettings(false)}));
  }
  function Diplomas({cl,students,onUpdate,onOpen,onDelete}) {return el('section',{className:'cycle-diplomas'},el('h3',null,'Les diplômes de la classe'),el('div',{className:'diploma-grid'},students.map(p=>{const awarded=p.diploma?.awarded,eligible=eligibleDiploma(p);return el('article',{key:p.id,'data-student-id':p.id},el('button',{className:'roster-open-name',onClick:()=>onOpen(p.id)},fullName(p.name)),
    awarded?el('div',{className:'diploma-actions'},el('strong',null,'Attribué le '+longDate(p.diploma.date)),!eligible&&el('small',null,'Test actuel à revoir'),el('button',{onClick:()=>printCertificate(p,cl.name),'aria-label':'Imprimer le diplôme de '+p.name},'Imprimer'),el('button',{onClick:()=>onUpdate(p.id,x=>({...x,diploma:{...x.diploma,awarded:false}})),'aria-label':'Retirer le diplôme de '+p.name},'Retirer')):el('button',{className:'award-diploma',disabled:!eligible,onClick:()=>onUpdate(p.id,x=>({...x,diploma:{awarded:true,date:todayParis()}})),'aria-label':'Attribuer le diplôme à '+p.name},'Attribuer le diplôme'),
    el('button',{className:'delete-roster',onClick:()=>onDelete(p),'aria-label':'Supprimer '+p.name},'Supprimer l’élève'))})));}
  function ClassHub(props) {
    const [view,setView]=useState('register'),[pupil,setPupil]=useState('');
    useEffect(()=>{props.onView('register')},[props.cl.id]);
    const switchView=id=>{setView(id);props.onView(id)};
    const evaluate=id=>{setPupil(id);switchView('rubric')};
    return el('div',{className:'class-hub-v20'},el('nav',{className:'class-view-tabs',role:'tablist','aria-label':'Vues de la classe'},[['register','Suivi du cycle'],['plan','Plan du bassin'],['rubric','Grille d’évaluation'],['diplomas','Diplômes']].map(([id,label])=>el('button',{key:id,role:'tab','aria-selected':view===id,onPointerUp:e=>{if(e.pointerType==='touch')switchView(id)},onClick:()=>switchView(id)},label))),
      view==='register'&&el(Register,props),view==='plan'&&el(PoolPlan,{...props,onEvaluate:evaluate}),view==='rubric'&&el(RubricPanel,{...props,selectedId:pupil,onSelected:setPupil}),view==='diplomas'&&el(Diplomas,props));
  }
  return {ClassHub};
}
