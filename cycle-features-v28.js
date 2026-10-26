import {createTrackingFeatures} from './tracking-v27.js';
import {evaluationSummary,evaluationSettings,demoRubric,combinedCriteria,displayedLevel} from './evaluation-v27.js';
import {createAquaticFeatures} from './aquatic-v28.js';
import {aquaticRubric,aquaticPDFStudent} from './aquatic-model-v27.js';
import {CAP_COLORS,cycleDates,weeklyDates,attendanceCell,assignedLane,moveInPlan,orderedPupils,defaultRubric,rubricValid,rubricGrade,laneLabel,registerLayout,bestBoard} from './cycle-model-v27.js';
import {inspectPDF,previewPDF,documentStore,rubricFromPDF,rubricFromRows,downloadBytes,evaluationPDF,diplomasPDF,printPDF,defaultDiplomaLayout,diplomaFormFields,diplomaFormPreview,officialAttestationPreview} from './cycle-documents-v27.js';
import {swimmerPortrait} from './swimmer-portraits-v22.js';
import {WORKSHOPS} from './workshops-v23.js';

export function createCycleFeatures({React,el,updateSession,todayParis,fullName,splitName,eligibleDiploma,testStatus,readWorkbook}){
  const {useState,useEffect,useLayoutEffect,useRef}=React;
  const labels={present:'Présent',absent:'Absent',exempt:'Dispensé',kit:'Matériel oublié',unmarked:'À renseigner',emoji:'Émoticône'};
  const statusAssets={check:'present',cross:'absent',medical:'exempt',kit:'kit'};
  const defaultIcons={present:'check',absent:'cross',exempt:'medical',kit:'kit',unmarked:'circle'};
  const shortDate=d=>new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'});
  const longDate=d=>new Date(d+'T12:00:00').toLocaleDateString('fr-FR');
  const [h]=[el];
  function Icon({name='check',className='',image}){
    if(statusAssets[name]&&!image)image='./assets/v22/'+statusAssets[name]+'.svg';
    if(image)return h('img',{className:'v21-icon '+className,src:image,alt:'',draggable:false});
    const paths={check:'M5 12l5 5L20 6',cross:'M6 6l12 12M18 6L6 18',medical:'M12 4v16M4 12h16',kit:'M7 3h4v6h2V3h4l-1 8 4 10h-6l-2-6-2 6H4l4-10zM3 3l18 18',circle:'M12 11v2',minus:'M5 12h14',clock:'M12 6v6l4 3',star:'M12 3l3 6 6 1-5 5 1 6-5-3-5 3 1-6-5-5 6-1z',export:'M12 3v12M7 8l5-5 5 5M5 15v6h14v-6',settings:'M12 3v3M12 18v3M3 12h3M18 12h3M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3',trophy:'M7 3h10v8a5 5 0 01-10 0zM7 5H3v4a5 5 0 005 4M17 5h4v4a5 5 0 01-5 4M12 16v5M8 21h8',edit:'M4 17l-1 4 4-1L20 7l-3-3zM14 7l3 3',search:'M15 15l6 6M17 10a7 7 0 11-14 0 7 7 0 0114 0',print:'M7 8V3h10v5M7 17H4V9h16v8h-3M7 13h10v8H7z',close:'M6 6l12 12M18 6L6 18',certificate:'M4 4h16v12H4zM7 8h10M7 11h6M9 16l-1 5 4-2 4 2-1-5'};
    return h('svg',{viewBox:'0 0 24 24',className:'v21-icon '+className,'aria-hidden':true,fill:'none',stroke:'currentColor',strokeWidth:name==='circle'?5:2.2,strokeLinecap:'round',strokeLinejoin:'round'},name==='settings'&&h('circle',{cx:12,cy:12,r:5}),name==='clock'&&h('circle',{cx:12,cy:12,r:9}),h('path',{d:paths[name]||paths.check}));
  }
  function StatusIcon({cl,status}){const icon=cl.attendanceIcons?.[status];return h(Icon,{name:typeof icon==='string'?icon:icon?.name||defaultIcons[status],image:icon?.image})}
  function Modal({title,onClose,children,footer,className=''}){
    return h('div',{className:'modal-backdrop v21-modal'},h('section',{className:'v21-dialog '+className,role:'dialog','aria-modal':true,'aria-label':title},
      h('header',null,h('h2',null,title),h('button',{className:'v21-icon-button',onClick:onClose,'aria-label':'Fermer'},h(Icon,{name:'close'}))),h('div',{className:'v21-dialog-body'},children),footer&&h('footer',null,footer)));
  }
  function useBox(){
    const ref=useRef(null),[box,setBox]=useState({width:900,height:500});
    useLayoutEffect(()=>{if(!ref.current)return;const measure=()=>{const r=ref.current.getBoundingClientRect();setBox(old=>Math.abs(old.width-r.width)<1&&Math.abs(old.height-r.height)<1?old:{width:r.width,height:r.height})};measure();const observer=new ResizeObserver(measure);observer.observe(ref.current);return()=>observer.disconnect()},[]);
    return[ref,box];
  }
  function ActionButton({children,icon,onClick,disabled=false,primary=false,className='',...props}){return h('button',{...props,type:'button',className:'v21-action'+(primary?' main':'')+' '+className,onClick,disabled},icon&&h(Icon,{name:icon}),children)}
  const labelCanvas=document.createElement('canvas'),labelContext=labelCanvas.getContext('2d');
  function labelFont(text,width,height,max=14){
    let size=max;
    for(;size>7;size-=.25){
      labelContext.font=`700 ${size}px Inter, sans-serif`;
      let line='',lines=1;
      for(const word of text.split(/\s+/)){
        if(line&&labelContext.measureText(line+' '+word).width>width){lines++;line=''}
        for(const letter of word){if(line&&labelContext.measureText(line+letter).width>width){lines++;line=''}line+=letter}
        line+=' ';
      }
      if(lines*size*1.08<=height)break;
    }
    return size;
  }

  function poolNameFont(parts,width,height,max=14){
    function lines(text,size){
      labelContext.font=`850 ${size}px Inter, sans-serif`;
      let line='',count=1;for(const word of String(text).split(/(?<=[ -])/u)){if(line&&labelContext.measureText(line+word).width>width){count++;line=''}for(const letter of word){if(line&&labelContext.measureText(line+letter).width>width){count++;line=''}line+=letter}}return count;
    }
    for(let size=max;size>=7;size-=.25){const long=[parts.surname,parts.givenName].flatMap(t=>t.split(/[ -]+/)).some(w=>{labelContext.font=`850 ${size}px Inter, sans-serif`;return labelContext.measureText(w).width>width});if(long&&size>8)continue;if((lines(parts.surname,size)+lines(parts.givenName,size))*size*1.06<=height)return size}
    return 7;
  }
  function PoolNameButton({parts,size,onClick,label}){
    const ref=useRef(null);
    useLayoutEffect(()=>{let live=true;const fit=()=>{const e=ref.current;if(!e||!live)return;let font=size;e.style.fontSize=font+'px';while(font>6.5&&(e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1)){font-=.25;e.style.fontSize=font+'px'}};fit();document.fonts.ready.then(fit);const observer=new ResizeObserver(fit);if(ref.current)observer.observe(ref.current);return()=>{live=false;observer.disconnect()}},[parts.surname,parts.givenName,size]);
    return h('button',{ref,className:'v21-card-name',style:{fontSize:size+'px'},onClick,'aria-label':'Sélectionner '+label,title:fullName(label)},h('strong',null,parts.surname),h('span',null,parts.givenName));
  }
  function LearningName({parts,size}){
    const ref=useRef(null);
    useLayoutEffect(()=>{let live=true;const fit=()=>{const e=ref.current;if(!e||!live)return;let font=size;e.style.fontSize=font+'px';const over=()=>{const r=e.getBoundingClientRect(),children=[...e.children].map(c=>c.getBoundingClientRect());return e.scrollWidth>e.clientWidth+1||children.some(c=>c.top<r.top-.5||c.bottom>r.bottom+.5)||children.reduce((sum,c)=>sum+c.height,0)>e.clientHeight+1};while(font>6.5&&over()){font-=.25;e.style.fontSize=font+'px'}};fit();document.fonts.ready.then(fit);const observer=new ResizeObserver(fit);if(ref.current)observer.observe(ref.current);return()=>{live=false;observer.disconnect()}},[parts.surname,parts.givenName,size]);
    return h('strong',{ref,style:{fontSize:size+'px'}},h('span',null,parts.surname),h('span',null,parts.givenName));
  }
  function ClassManager({cl,onClose,onAddClass,onAddStudent,onImport,onDeleteClass,onDeleteStudent}){
    const[page,setPage]=useState(0),students=cl?.students||[],size=18;
    return h(Modal,{title:'Gérer la classe',onClose,footer:h(ActionButton,{onClick:onClose},'Terminer')},
      h('div',{className:'v21-management-actions'},h(ActionButton,{onClick:()=>{onClose();onAddClass()}},'Nouvelle classe'),h(ActionButton,{onClick:()=>{onClose();onAddStudent()},disabled:!cl?.id},'Ajouter un élève'),
        h('label',{className:'v21-action'},'Importer une classe',h('input',{className:'v21-file-input',type:'file',accept:'.csv,.tsv,.txt,.xlsx,.xls,.json','aria-label':'Importer une classe ou un groupe',onChange:e=>{onImport(e);onClose()}})),h(ActionButton,{onClick:()=>{onClose();onDeleteClass()},disabled:!cl?.id},'Supprimer la classe')),
      h('div',{className:'v21-manager-pupils'},students.slice(page*size,(page+1)*size).map(p=>h('div',{key:p.id},h('strong',null,fullName(p.name)),h('button',{className:'v21-icon-button','aria-label':'Supprimer '+p.name,onClick:()=>onDeleteStudent(p)},'×')))),
      students.length>size&&h('div',{className:'v21-pager'},h(ActionButton,{disabled:page===0,onClick:()=>setPage(page-1)},'‹'),h('span',null,`${page+1} / ${Math.ceil(students.length/size)}`),h(ActionButton,{disabled:(page+1)*size>=students.length,onClick:()=>setPage(page+1)},'›')));
  }
  function GlobalToolbar({classes,cl,onClass,onExport,filter,onFilter,context,onAddClass,onAddStudent,onImport,onDeleteClass,onDeleteStudent}){
    const[manage,setManage]=useState(false);
    return h('div',{className:'v21-global-toolbar'},h('nav',{className:'v23-class-tiles'+(classes.length<=4?' fit':''),'aria-label':'Choisir une classe'},classes.map((c,index)=>h('button',{key:c.id,className:'v23-class-tile'+(c.id===cl?.id?' active':''),'aria-label':'Ouvrir la classe '+c.name,'aria-current':c.id===cl?.id?'page':undefined,onClick:()=>onClass(c.id),style:{'--class-hue':(220+index*27)%360}},h('span',{className:'v23-class-initial'},c.name.match(/^(?:[1-6][eè]?)/i)?.[0]||'C'),h('span',null,h('strong',null,c.name),h('small',null,c.students.length+' élèves')))),!classes.length&&h(ActionButton,{onClick:onAddClass,primary:true},'Nouvelle classe')),
      context==='classes'&&h('label',{className:'v21-search'},h(Icon,{name:'search'}),h('input',{placeholder:'Rechercher',value:filter,onChange:e=>onFilter(e.target.value),'aria-label':'Rechercher un élève'})),
      h('div',{className:'v21-global-actions'},h(ActionButton,{icon:'settings',onClick:()=>setManage(true),'aria-label':'Gérer les classes'},h('span',null,'Gérer')),h(ActionButton,{icon:'export',primary:true,onClick:onExport,'aria-label':'Exporter ou imprimer'},'Exporter')),
      manage&&h(ClassManager,{cl,onClose:()=>setManage(false),onAddClass,onAddStudent,onImport,onDeleteClass,onDeleteStudent}));
  }
  function ExportDialog({onClose,onChoice,context,view,hasRubric,groups}){
    const[tab,setTab]=useState(context==='learning'?'workshops':context==='summary'?'print':context==='classes'&&['diplomas','rubric','aquatic'].includes(view)?'print':'excel'),[group,setGroup]=useState(0);
    const choose=(type,extra={})=>{onChoice({type,...extra});onClose()};
    return h(Modal,{title:'Exporter / Imprimer',onClose,className:'v21-export-dialog'},
      h('nav',{className:'v21-dialog-tabs'},[['excel','iDoceo'],['print','Impressions'],['workshops','Fiches ateliers']].map(([id,label])=>h('button',{key:id,role:'tab','aria-selected':tab===id,onClick:()=>setTab(id)},label))),
      tab==='excel'&&h('div',{className:'v21-export-list'},h('label',null,'Élèves à exporter',h('select',{'aria-label':'Groupe à exporter',value:group,onChange:e=>setGroup(Number(e.target.value))},h('option',{value:0},'Toute la classe'),[1,2,3].map(n=>h('option',{key:n,value:n},`Groupe ${n} (${groups?.['group'+n]?.length||0})`)))),
        h(ActionButton,{icon:'export',onClick:()=>choose('xlsx-tracking',{group})},'Suivi du cycle · colonnes'),h(ActionButton,{icon:'export',onClick:()=>choose('xlsx-test',{group})},'Résultats du test savoir-nager'),h(ActionButton,{icon:'export',onClick:()=>choose('xlsx-groups',{group})},'Répartition des groupes'),h(ActionButton,{icon:'export',onClick:()=>choose('xlsx-rubric',{group}),disabled:!hasRubric},'Évaluation finale · notes'),h(ActionButton,{icon:'export',onClick:()=>choose('xlsx-aquatic',{group})},'Parcours aquatique · notes')),
      tab==='print'&&h('div',{className:'v21-export-list'},h('h3',null,'Parcours aquatique'),h(ActionButton,{icon:'export',onClick:()=>choose('save-aquatic')},'Télécharger les évaluations du parcours'),h(ActionButton,{icon:'print',onClick:()=>choose('print-aquatic')},'Imprimer les évaluations du parcours'),h(ActionButton,{icon:'print',onClick:()=>choose('print-aquatic-blank')},'Imprimer le parcours vierge'),h('h3',null,'Test savoir-nager'),h(ActionButton,{icon:'certificate',onClick:()=>choose('diploma-model')},'Choisir le modèle de diplôme PDF'),h(ActionButton,{icon:'print',onClick:()=>choose('print-diplomas')},'Imprimer les diplômes attribués'),h(ActionButton,{icon:'export',onClick:()=>choose('save-diplomas')},'Télécharger les diplômes de la classe'),h('h3',null,'Démonstration de nage'),h(ActionButton,{icon:'print',onClick:()=>choose('print-evaluations')},'Imprimer les évaluations de la classe'),h(ActionButton,{icon:'print',onClick:()=>choose('print-blank')},'Imprimer une grille vierge'),h(ActionButton,{icon:'export',onClick:()=>choose('save-evaluations')},'Télécharger les évaluations')),
      tab==='workshops'&&h('div',{className:'v21-export-list'},WORKSHOPS.map(m=>h(ActionButton,{key:m.id,icon:'export',onClick:()=>choose('workshop',{moduleId:m.id})},'Atelier - '+(m.id==='entry'?'Entrée dans l’eau':m.title)))));
  }

  function CropIcon({file,status,onApply,onClose}){
    const[image,setImage]=useState(''),[crop,setCrop]=useState({x:0,y:0,w:1,h:1}),imageRef=useRef(null),drag=useRef(null);
    useEffect(()=>{const url=URL.createObjectURL(file);setImage(url);return()=>URL.revokeObjectURL(url)},[file]);
    function point(e){const r=imageRef.current.getBoundingClientRect();return{x:Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),y:Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))}}
    function start(e){e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);drag.current=point(e);setCrop({x:drag.current.x,y:drag.current.y,w:0,h:0})}
    function move(e){if(!drag.current)return;const p=point(e),d=drag.current;setCrop({x:Math.min(p.x,d.x),y:Math.min(p.y,d.y),w:Math.abs(p.x-d.x),h:Math.abs(p.y-d.y)})}
    function apply(){const im=imageRef.current,c=crop.w>.02&&crop.h>.02?crop:{x:0,y:0,w:1,h:1},canvas=document.createElement('canvas');canvas.width=canvas.height=96;const ctx=canvas.getContext('2d'),cw=c.w*im.naturalWidth,ch=c.h*im.naturalHeight,ratio=Math.min(92/cw,92/ch);ctx.drawImage(im,c.x*im.naturalWidth,c.y*im.naturalHeight,cw,ch,(96-cw*ratio)/2,(96-ch*ratio)/2,cw*ratio,ch*ratio);onApply({image:canvas.toDataURL('image/png')});}
    return h(Modal,{title:'Recadrer l’icône '+labels[status],onClose,className:'v21-crop-dialog',footer:h(ActionButton,{primary:true,onClick:apply},'Utiliser cette icône')},h('p',null,'Trace un cadre autour de l’icône à récupérer.'),h('div',{className:'v21-crop-stage',onPointerDown:start,onPointerMove:move,onPointerUp:()=>{drag.current=null},onPointerCancel:()=>{drag.current=null}},h('img',{ref:imageRef,src:image,alt:'Capture à recadrer',draggable:false}),h('span',{className:'v21-crop-rectangle',style:{left:crop.x*100+'%',top:crop.y*100+'%',width:crop.w*100+'%',height:crop.h*100+'%'}})));
  }
  function SessionConfig({cl,onClass,onClose}){
    const[start,setStart]=useState(todayParis),[count,setCount]=useState(10),[interval,setInterval]=useState(7),[error,setError]=useState('');
    const dates=weeklyDates(start,Number(count),Number(interval));
    function add(){if(!dates.length){setError('Choisis une date, un nombre de séances et un intervalle valides.');return}onClass(old=>({...old,cycleDates:[...new Set([...cycleDates(old,''),...dates])].sort()}));onClose()}
    return h(Modal,{title:'Configurer le cycle',onClose,footer:h(ActionButton,{primary:true,onClick:add},'Ajouter les séances')},
      h('div',{className:'v21-session-form'},h('div',{className:'v21-fields-three'},h('label',null,'Première séance',h('input',{type:'date',value:start,onChange:e=>setStart(e.target.value),'aria-label':'Première séance du cycle'})),h('label',null,'Nombre de séances',h('input',{type:'number',min:1,max:40,value:count,onChange:e=>setCount(e.target.value)})),h('label',null,'Intervalle en jours',h('input',{type:'number',min:1,max:60,value:interval,onChange:e=>setInterval(e.target.value)}))),h('div',{className:'v21-date-preview'},dates.map(d=>h('span',{key:d},longDate(d)))),h('p',{className:'v21-note'},'Les dates et le suivi déjà saisis sont conservés.')),error&&h('p',{role:'alert'},error));
  }
  function AttendanceEditor({student,date,cl,onUpdate,onClose}){
    const cell=attendanceCell(student,date,todayParis());
    return h(Modal,{title:fullName(student.name)+' · '+longDate(date),onClose,className:'v21-attendance-editor',footer:h(ActionButton,{primary:true,onClick:onClose},'Terminer')},
      h('div',{className:'v21-presence-options'},['present','absent','exempt'].map(status=>h('button',{key:status,className:'v21-status-choice '+status,'aria-pressed':cell.status===status,onClick:()=>onUpdate(student.id,p=>updateSession(p,date,{status}))},h(StatusIcon,{cl,status}),labels[status]))),
      h('button',{className:'v21-kit-choice','aria-pressed':cell.forgotKit,onClick:()=>onUpdate(student.id,p=>updateSession(p,date,{forgotKit:!cell.forgotKit}))},h(StatusIcon,{cl,status:'kit'}),cell.forgotKit?'Matériel oublié':'Matériel présent'));
  }
  const {TrackingRegister}=createTrackingFeatures({React,h,Modal,ActionButton,Icon,StatusIcon,SessionConfig,AttendanceEditor,CropIcon,useBox,todayParis,fullName,labelFont});
  function Register(props){return h(TrackingRegister,props)}

  function SwimmerAvatar({profile={},size}){
    const[url,setUrl]=useState('');
    useEffect(()=>{let live=true;swimmerPortrait(profile).then(url=>live&&setUrl(url)).catch(()=>{});return()=>{live=false}},[profile.style,profile.cap,profile.goggles]);
    const style=size?{width:size,height:size}:undefined;
    return url?h('img',{src:url,className:'v21-swimmer v22-swimmer-portrait',style,alt:'',draggable:false,'data-cap':profile.cap||CAP_COLORS[4],'data-goggles':profile.goggles||'#173c55'}):h('span',{className:'v21-swimmer v22-avatar-loading',style,'aria-hidden':true});
  }
  function SwimmerSettings({student,cl,date,onUpdate,onMove,onClose}){
    const profile=student.swimmer||{},colors=[...CAP_COLORS,'#173c55'],names=['rouge','orange','jaune','vert','bleu','indigo','violet','blanc','noir'];
    const set=patch=>onUpdate(student.id,p=>({...p,swimmer:{...p.swimmer,...patch}}));
    return h(Modal,{title:fullName(student.name),onClose,className:'v21-swimmer-settings',footer:h(ActionButton,{primary:true,onClick:onClose},'Terminer')},
      h('div',{className:'v21-swimmer-profile'},h(SwimmerAvatar,{profile,size:210}),h('div',null,h('label',null,'Personnage',h('select',{'aria-label':'Personnage du nageur',value:profile.style||'male',onChange:e=>set({style:e.target.value})},h('option',{value:'male'},'Garçon'),h('option',{value:'female'},'Fille'))),
        [['cap','Bonnet'],['goggles','Lunettes']].map(([key,label])=>h('fieldset',{key},h('legend',null,label),h('div',{className:'v21-color-palette'},colors.map((color,i)=>h('button',{key:color,style:{background:color},'aria-label':label+' '+names[i],'aria-pressed':(profile[key]||(key==='cap'?CAP_COLORS[4]:'#173c55'))===color,onClick:()=>set({[key]:color})}))))),
        h('label',null,'Ligne d’eau',h('select',{'aria-label':'Déplacer le nageur sélectionné',value:assignedLane(student,date)||0,onChange:e=>onMove(student.id,Number(e.target.value)||null)},h('option',{value:0},'À répartir'),Array.from({length:Math.max(Number(cl.poolLanes)||3,...cl.students.map(p=>assignedLane(p,date)||0))},(_,i)=>h('option',{key:i,value:i+1},laneLabel(cl,i+1))))))));
  }
  function LaneSettings({cl,date,onClass,onClose}){
    const maxAssigned=Math.max(1,...cl.students.map(p=>assignedLane(p,date)||0)),[count,setCount]=useState(Math.max(maxAssigned,Number(cl.poolLanes)||3)),[names,setNames]=useState(cl.poolLaneNames||{});
    function save(){onClass(old=>({...old,poolLanes:count,poolLaneNames:Object.fromEntries(Object.entries(names).map(([id,text])=>[id,/^\d+$/.test(text.trim())?'Ligne '+text.trim():text.trim()]).filter(([,text])=>text))}));onClose()}
    return h(Modal,{title:'Mes lignes d’eau',onClose,footer:h(ActionButton,{primary:true,onClick:save},'Enregistrer')},h('label',null,'Nombre de lignes',h('select',{'aria-label':'Nombre de lignes d’eau',value:count,onChange:e=>setCount(Number(e.target.value))},Array.from({length:12},(_,i)=>h('option',{key:i,value:i+1,disabled:i+1<maxAssigned},i+1)))),
      h('div',{className:'v21-lane-names'},Array.from({length:count},(_,i)=>h('label',{key:i},'Emplacement '+(i+1),h('input',{'aria-label':'Nom de la ligne '+(i+1),value:names[i+1]??'Ligne '+(i+1),onChange:e=>setNames(old=>({...old,[i+1]:e.target.value})),maxLength:35})))));
  }
  function PlanLane({number,cl,members,date,selected,onSelect,onMove,onEvaluate,dragHandlers,hover,onFocus,rail=false}){
    const[ref,box]=useBox(),layout=bestBoard(box.width,box.height,members.length,{minWidth:rail?55:86,maxColumns:rail?2:8}),nameHeight=Math.max(25,Math.min(59,layout.cardHeight*.45)),avatar=Math.max(18,Math.min(104,layout.cardWidth*.75,layout.cardHeight-nameHeight-8));
    return h('section',{'data-plan-lane':number||0,className:'v21-plan-lane '+(rail?'rail ':'')+(hover===(number||0)?'drop-hover':'')},
      h('header',null,h('button',{className:'v21-lane-target','aria-label':selected?`Placer l’élève dans ${number?laneLabel(cl,number):'le vestiaire'}`:number?laneLabel(cl,number):'À répartir',onClick:()=>selected&&onMove(selected,number)},h('strong',null,number?laneLabel(cl,number):'À répartir'),h('small',null,members.length)),number&&h('button',{className:'v21-icon-button',onClick:()=>onFocus(number),'aria-label':'Agrandir '+laneLabel(cl,number)},h(Icon,{name:'search'}))),
      h('div',{className:'v21-plan-people',ref,style:{gridTemplateColumns:`repeat(${layout.columns},minmax(0,1fr))`,gridTemplateRows:`repeat(${layout.rows},minmax(0,1fr))`}},members.map(p=>{
        const record=attendanceCell(p,date,todayParis()),nameParts=splitName(p.name),pupilNameHeight=p.name.length>26?Math.min(62,layout.cardHeight*.58):nameHeight,pupilAvatar=Math.max(18,Math.min(104,layout.cardWidth*.75,layout.cardHeight-pupilNameHeight-8)),nameSize=poolNameFont(nameParts,Math.max(30,layout.cardWidth-12),pupilNameHeight-3);return h('article',{key:p.id,'data-plan-student':p.id,style:{'--pool-name-height':pupilNameHeight+'px'},className:'v21-plan-person '+(selected===p.id?'selected ':'')+(record.status==='absent'||record.status==='exempt'?'unavailable':'')},
          h('button',{className:'v21-avatar-drag',type:'button',style:{touchAction:'none'},'aria-label':'Déplacer '+p.name,...dragHandlers(p),onClick:()=>onSelect(p.id),onDoubleClick:()=>onEvaluate(p.id)},h(SwimmerAvatar,{profile:p.swimmer,size:pupilAvatar}),h('span',{className:'v21-grip','aria-hidden':true},'⠿')),
          h(PoolNameButton,{parts:nameParts,size:nameSize,onClick:()=>onSelect(p.id),label:p.name}),
          ['absent','exempt'].includes(record.status)&&h('span',{className:'v21-plan-status '+record.status,title:labels[record.status]},h(StatusIcon,{cl,status:record.status})));
      })),!members.length&&h('div',{className:'v21-empty-lane','aria-hidden':true},'≈'));
  }
  function PoolPlan({cl,students,onClass,onUpdate,onOpen,onEvaluate,date,onDate}){
    const[selected,setSelected]=useState(''),[personalize,setPersonalize]=useState(false),[settings,setSettings]=useState(false),[rail,setRail]=useState(true),[focus,setFocus]=useState(null),[lanePage,setLanePage]=useState(0),[hover,setHover]=useState(null),[ghost,setGhost]=useState(null),[ref,box]=useBox(),drag=useRef(null),suppress=useRef(false);
    const laneCount=Math.max(1,Number(cl.poolLanes)||3,...cl.students.map(p=>assignedLane(p,date)||0)),ordered=orderedPupils(cl,students),unassigned=ordered.filter(p=>!assignedLane(p,date)),pupil=students.find(p=>p.id===selected),perPage=box.width<1000?3:4,pages=Math.ceil(laneCount/perPage),lanes=focus?[focus]:Array.from({length:laneCount},(_,i)=>i+1).slice(lanePage*perPage,(lanePage+1)*perPage);
    function move(id,lane,before=null){onClass(old=>moveInPlan(old,id,lane,before,date));setHover(null)}
    function targetAt(x,y){const node=document.elementFromPoint(x,y),lane=node?.closest('[data-plan-lane]');return lane?{lane:Number(lane.dataset.planLane)||null,before:node.closest('[data-plan-student]')?.dataset.planStudent}:null}
    const dragHandlers=p=>({onPointerDown:e=>{if(e.button!==0)return;if(e.pointerType!=='touch')e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:p.id,name:p.name,x:e.clientX,y:e.clientY,active:false};setSelected(p.id)},
      onPointerMove:e=>{const d=drag.current;if(!d)return;if(!d.active&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<7)return;d.active=true;setGhost({name:d.name,x:e.clientX,y:e.clientY});setHover(targetAt(e.clientX,e.clientY)?.lane??0)},
      onPointerUp:e=>{const d=drag.current;if(!d)return;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);drag.current=null;setGhost(null);setHover(null);if(d.active){suppress.current=true;const target=targetAt(e.clientX,e.clientY);if(target&&target.before!==d.id)move(d.id,target.lane,target.before);setTimeout(()=>suppress.current=false,0)}},
      onPointerCancel:()=>{drag.current=null;setGhost(null);setHover(null)},onKeyDown:e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(p.id,Math.min(laneCount,Math.max(0,(assignedLane(p,date)||0)+(e.key==='ArrowRight'?1:-1)))||null)}}});
    const select=id=>{if(!suppress.current)setSelected(id)};
    return h('section',{className:'v21-plan v21-pane'},h('div',{className:'v21-pane-toolbar'},h('input',{type:'date',value:date,'aria-label':'Séance du plan',onChange:e=>e.target.value&&onDate(e.target.value)}),
      h(ActionButton,{onClick:()=>setRail(!rail),'aria-pressed':rail&&unassigned.length>0},'À répartir · '+unassigned.length),h(ActionButton,{icon:'settings',onClick:()=>setSettings(true)},'Lignes d’eau'),
      focus?h(ActionButton,{onClick:()=>setFocus(null)},'Tout le bassin'):pages>1&&h('div',{className:'v21-pager'},h(ActionButton,{disabled:lanePage===0,onClick:()=>setLanePage(lanePage-1)},'‹'),h('span',null,`${lanePage+1}/${pages}`),h(ActionButton,{disabled:lanePage+1>=pages,onClick:()=>setLanePage(lanePage+1)},'›')),
      pupil&&h('div',{className:'v21-plan-actions'},h('strong',null,fullName(pupil.name)),h(ActionButton,{icon:'edit',onClick:()=>setPersonalize(true),'aria-label':'Personnaliser le nageur'},h('span',null,'Personnaliser')),h(ActionButton,{onClick:()=>onEvaluate(pupil.id)},'Évaluer'),h(ActionButton,{onClick:()=>onOpen(pupil.id)},'Test'))),
      h('div',{className:'v21-plan-body',ref,style:{gridTemplateColumns:(rail&&unassigned.length&&!focus?'clamp(160px,20vw,230px) ':'')+`repeat(${lanes.length},minmax(0,1fr))`}},
        rail&&unassigned.length>0&&!focus&&h(PlanLane,{number:null,cl,members:unassigned,date,selected,onSelect:select,onMove:move,onEvaluate,dragHandlers,hover,rail:true}),
        lanes.map(number=>h(PlanLane,{key:number,number,cl,members:ordered.filter(p=>assignedLane(p,date)===number),date,selected,onSelect:select,onMove:move,onEvaluate,dragHandlers,hover,onFocus:setFocus}))),
      settings&&h(LaneSettings,{cl,date,onClass,onClose:()=>setSettings(false)}),personalize&&pupil&&h(SwimmerSettings,{student:pupil,cl,date,onUpdate,onMove:move,onClose:()=>setPersonalize(false)}),ghost&&h('div',{className:'v21-drag-ghost',style:{left:ghost.x+9,top:ghost.y+9}},ghost.name));
  }

  function RubricEditor({config,onSave,onClose,maximum=10}){
    const[draft,setDraft]=useState(()=>JSON.parse(JSON.stringify(config))),[index,setIndex]=useState(0),[error,setError]=useState(''),criterion=draft.criteria[Math.min(index,draft.criteria.length-1)],total=draft.criteria.reduce((s,c)=>s+c.weight,0);
    function patch(change){setDraft(old=>({...old,criteria:old.criteria.map(c=>c.id===criterion.id?{...c,...change}:c)}))}
    function save(){if(!rubricValid(draft)){setError('Complète les quatre descriptions et utilise des coefficients positifs et des points croissants.');return}onSave({...draft,confirmed:true});onClose()}
    return h(Modal,{title:config.kind==='aquatic'?'Critères · parcours aquatique':'Critères · démonstration de nage',onClose,className:'v21-rubric-editor',footer:h('div',{className:'v21-footer-actions'},config.kind!=='aquatic'&&h(ActionButton,{onClick:()=>{setDraft(old=>({...old,criteria:[...old.criteria,{id:'criterion-'+crypto.randomUUID(),label:'Nouveau critère',weight:1,descriptions:['','','','']}]}));setIndex(draft.criteria.length)}},'Ajouter un critère'),config.kind!=='aquatic'&&h(ActionButton,{disabled:draft.criteria.length<2,onClick:()=>{setDraft(old=>({...old,criteria:old.criteria.filter(c=>c.id!==criterion.id)}));setIndex(Math.max(0,index-1))}},'Retirer ce critère'),h(ActionButton,{primary:true,onClick:save},'Enregistrer les critères'))},
      h('div',{className:'v21-point-inputs'},draft.points.map((point,i)=>h('label',{key:i},'Niveau '+(i+1),h('input',{type:'number',min:0,step:.1,value:point,'aria-label':'Points du niveau '+(i+1),onChange:e=>setDraft(old=>({...old,points:old.points.map((p,j)=>j===i?Number(e.target.value):p)}))}))),h('span',null,'Total des coefficients : '+total)),
      h('div',{className:'v21-criterion-editor'},h('nav',{'aria-label':'Critères du barème'},draft.criteria.map((c,i)=>h('button',{key:c.id,'aria-pressed':c.id===criterion.id,onClick:()=>setIndex(i)},h('strong',null,c.label),h('small',null,(maximum*c.weight/total).toLocaleString('fr-FR',{maximumFractionDigits:2})+' points')))),
        h('section',null,h('div',{className:'v21-criterion-fields'},h('label',null,'Critère',h('input',{value:criterion.label,'aria-label':'Nom du critère',onChange:e=>patch({label:e.target.value})})),h('label',null,'Coefficient',h('input',{type:'number',min:.1,step:.1,value:criterion.weight,onChange:e=>patch({weight:Number(e.target.value)})}))),
          h('div',{className:'v21-description-fields'},criterion.descriptions.map((text,i)=>h('label',{key:i,className:'tone-'+i},'Niveau '+(i+1),h('textarea',{value:text,'aria-label':'Description du niveau '+(i+1),onChange:e=>patch({descriptions:criterion.descriptions.map((v,j)=>j===i?e.target.value:v)})})))))),
      error&&h('p',{role:'alert'},error));
  }
  function RubricImportReview({parsed,onApply,onClose}){
    const[draft,setDraft]=useState(parsed.config),[preview,setPreview]=useState(null),[page,setPage]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState('');
    useEffect(()=>{let live=true;if(parsed.asset)previewPDF(parsed.asset,page,1050).then(p=>live&&setPreview(p)).catch(e=>live&&setError(e.message));return()=>{live=false}},[page]);
    async function apply(){setError('');if(!rubricValid(draft)){setError('Vérifie les points et les coefficients avant d’importer.');return}setBusy(true);try{if(parsed.asset)await documentStore('put',parsed.asset.key,parsed.asset);onApply({...draft,confirmed:true});onClose()}catch{setError('Le document ne peut pas être enregistré sur cet appareil. L’ancien barème est conservé.')}finally{setBusy(false)}}
    return h(Modal,{title:'Vérifier la grille importée',onClose,className:'v21-import-review',footer:h(ActionButton,{primary:true,disabled:busy,onClick:apply},busy?'Enregistrement…':'Utiliser le barème importé')},
      h('div',{className:'v21-import-layout'},parsed.asset&&h('div',{className:'v21-pdf-original'},preview?h('img',{src:preview.url,alt:'PDF original de la grille'}):h('p',null,'Lecture du PDF…'),parsed.asset.pages.length>1&&h('div',{className:'v21-pager'},h(ActionButton,{disabled:page===0,onClick:()=>setPage(page-1)},'‹'),h('span',null,`${page+1}/${parsed.asset.pages.length}`),h(ActionButton,{disabled:page+1>=parsed.asset.pages.length,onClick:()=>setPage(page+1)},'›'))),
        h('div',{className:'v21-import-values'},h('strong',null,draft.criteria.length+' critères reconnus'),h('div',{className:'v21-point-inputs'},draft.points.map((point,i)=>h('label',{key:i},'Niveau '+(i+1),h('input',{type:'number',step:.1,min:0,value:point,'aria-label':'Points importés du niveau '+(i+1),onChange:e=>setDraft(old=>({...old,points:old.points.map((p,j)=>j===i?Number(e.target.value):p)}))})))),
          draft.criteria.map(c=>h('label',{className:'v21-import-coefficient',key:c.id},h('span',null,c.label),h('input',{type:'number',min:.1,step:.1,'aria-label':'Coefficient importé de '+c.label,value:c.weight,onChange:e=>setDraft(old=>({...old,criteria:old.criteria.map(v=>v.id===c.id?{...v,weight:Number(e.target.value)}:v)}))}))),
          h('p',{className:'v21-note'},'Le document d’origine est conservé. Les grilles exportées sont mises en page en paysage avec tous les critères reconnus.'),parsed.notes.map(note=>h('p',{className:'v21-note',key:note},note)))),error&&h('p',{role:'alert'},error));
  }
  function rubricFont(config,width,height){
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),cellWidth=Math.max(60,(width-105)/4-18),cellHeight=(height-31)/config.criteria.length-12;
    let size=13;
    for(;size>8;size-=.25){ctx.font=`${size}px Arial`;let max=0;for(const c of config.criteria)for(const text of c.descriptions){let line='',lines=1;for(const word of text.split(/\s+/)){if(line&&ctx.measureText(line+' '+word).width>cellWidth){lines++;line=word}else line+=(line?' ':'')+word}max=Math.max(max,lines*size*1.16)}if(max<=cellHeight)break}
    return size;
  }
  function EvaluationConfig({cl,onClass,onClose,onImport,busy}){
    const[draft,setDraft]=useState(()=>evaluationSettings(cl)),[editing,setEditing]=useState(''),[error,setError]=useState('');
    const valid=Number.isFinite(draft.demoMax)&&Number.isFinite(draft.aquaticMax)&&draft.demoMax>0&&draft.aquaticMax>0&&draft.demoMax<=1000&&draft.aquaticMax<=1000;
    function save(){if(!valid){setError('Chaque partie doit avoir un nombre de points positif.');return}onClass(old=>({...old,evaluationSettings:{demoMax:draft.demoMax,aquaticMax:draft.aquaticMax}}));onClose()}
    return h(Modal,{title:'Configurer l’évaluation',onClose,className:'v26-evaluation-config',footer:h(ActionButton,{primary:true,onClick:save},'Enregistrer l’évaluation')},
      h('h3',null,'Répartition des points'),h('div',{className:'v26-budget-inputs'},[['demoMax','Démonstration de nage'],['aquaticMax','Parcours aquatique']].map(([id,label])=>h('label',{key:id},label,h('span',null,h('input',{type:'number',min:.1,max:1000,step:.5,value:draft[id],'aria-label':'Points · '+label,onChange:e=>setDraft(old=>({...old,[id]:e.target.value===''?'':Number(e.target.value)}))}),'points'))),h('output',{'aria-label':'Total des points'},'Total : '+(valid?(draft.demoMax+draft.aquaticMax).toLocaleString('fr-FR'):'—')+' points')),
      h('p',{className:'v27-rounding-note'},'Notes arrondies au quart de point supérieur. Le total est calculé sur les valeurs exactes avant son arrondi.'),h('div',{className:'v26-config-criteria'},h(ActionButton,{onClick:()=>setEditing('demo')},'Critères de la démonstration'),h(ActionButton,{onClick:()=>setEditing('aquatic')},'Critères du parcours'),h(ActionButton,{onClick:onImport,disabled:busy},busy?'Lecture…':'Importer une grille PDF / Excel')),
      error&&h('p',{role:'alert'},error),editing&&h(RubricEditor,{config:editing==='demo'?demoRubric(cl):aquaticRubric(cl),maximum:editing==='demo'?Number(draft.demoMax)||10:Number(draft.aquaticMax)||10,onSave:rubric=>onClass(old=>({...old,[editing==='demo'?'rubric':'aquaticRubric']:rubric})),onClose:()=>setEditing('')}));
  }
  function RubricPanel({cl,students,selectedId,onSelected,onClass,onUpdate,onMessage,onAquatic}){
    const[settings,setSettings]=useState(false),[imported,setImported]=useState(null),[busy,setBusy]=useState(false),[detail,setDetail]=useState(null),[groupDetail,setGroupDetail]=useState(null),[ref,box]=useBox(),config=demoRubric(cl),derived=combinedCriteria(cl),student=students.find(p=>p.id===selectedId)||students[0],summary=evaluationSummary(student||{},cl),grade=summary.total,font=rubricFont({criteria:[...config.criteria,...derived]},box.width,box.height),fileRef=useRef(null);
    function select(c,level){if(!student)return;onUpdate(student.id,p=>({...p,rubricLevels:{...p.rubricLevels,[c.id]:p.rubricLevels?.[c.id]===level?null:level}}))}
    async function importFile(e){const file=e.target.files?.[0];e.target.value='';if(!file)return;setBusy(true);try{if(/\.pdf$/i.test(file.name)){const asset=await inspectPDF(file);setImported({...rubricFromPDF(asset,config),asset})}else{const sheets=readWorkbook(await file.arrayBuffer());let result,lastError;for(const sheet of sheets){try{result=rubricFromRows(sheet.rows,file.name,config);break}catch(error){lastError=error}}if(!result)throw lastError||Error('Aucune grille reconnue dans le classeur.');setImported(result)}}catch(error){onMessage(error.message||'Ce document ne peut pas être importé.')}finally{setBusy(false)}}
    return h('section',{className:'v21-rubric v21-pane v26-rubric'},h('div',{className:'v21-pane-toolbar'},h('select',{'aria-label':'Élève de la grille',value:student?.id||'',onChange:e=>onSelected(e.target.value)},students.map(p=>h('option',{key:p.id,value:p.id},fullName(p.name)))),
      h('span',{className:'v26-toolbar-space'}),h(ActionButton,{icon:'settings',onClick:()=>setSettings(true)},'Configurer'),h('input',{ref:fileRef,className:'v21-file-input',type:'file',accept:'.pdf,.xlsx,.xls,.csv,.tsv','aria-label':'Importer une évaluation PDF ou Excel',onChange:importFile}),h('output',{className:'v21-rubric-score','aria-label':'Note sur '+summary.settings.total},(grade===null?'—':grade.toLocaleString('fr-FR',{maximumFractionDigits:2}))+' / '+summary.settings.total)),
      h('div',{ref,className:'v21-rubric-grid',role:'table','aria-label':'Évaluation démonstration de nage',style:{gridTemplateColumns:'minmax(90px,.58fr) repeat(4,minmax(0,1fr))',gridTemplateRows:`31px repeat(${config.criteria.length+3},minmax(0,1fr))`,'--rubric-font':font+'px'}},
        h('div',{className:'v21-rubric-heading',role:'columnheader'},'Critère'),[1,2,3,4].map((level,i)=>h('div',{key:'head'+i,className:'v21-rubric-heading tone-'+i,role:'columnheader'},'NIVEAU '+level)),
        config.criteria.map(c=>h(React.Fragment,{key:c.id},h('button',{className:'v21-rubric-criterion',role:'rowheader',onClick:()=>setDetail(c)},h('strong',null,c.label)),c.descriptions.map((text,i)=>h('button',{key:i,role:'cell',className:'v21-rubric-level tone-'+i+(student?.rubricLevels?.[c.id]===i+1?' selected':''),'aria-label':`${c.label} : niveau ${i+1}`,'aria-pressed':student?.rubricLevels?.[c.id]===i+1,disabled:!student,onClick:()=>select(c,i+1)},h('span',{className:'v21-rubric-check','aria-hidden':true},student?.rubricLevels?.[c.id]===i+1?'✓':''),h('span',{className:'v21-rubric-text'},text))))),
        derived.map(c=>{const g=summary.groups.find(g=>g.id===c.id),selected=displayedLevel(g.level);return h(React.Fragment,{key:c.id},h('button',{className:'v21-rubric-criterion v25-derived-label',role:'rowheader',onClick:()=>setGroupDetail(g)},h('strong',null,c.label),h('small',null,'Parcours · auto')),c.descriptions.map((text,i)=>h('button',{key:i,role:'cell',className:'v21-rubric-level v26-derived-level tone-'+i+(selected===i+1?' selected':''),'data-derived-group':c.id,'data-level':i+1,'aria-label':`${c.label} : niveau ${i+1}, automatique`,'aria-pressed':selected===i+1,title:g.level===null?'Parcours à compléter':'Moyenne exacte : '+g.level.toLocaleString('fr-FR',{maximumFractionDigits:2})+' / 4',onClick:()=>setGroupDetail(g)},h('span',{className:'v21-rubric-check','aria-hidden':true},selected===i+1?'✓':''),h('span',{className:'v21-rubric-text'},text),selected===i+1&&!Number.isInteger(g.level)&&h('small',{className:'v26-fraction'},'Moy. '+g.level.toLocaleString('fr-FR',{maximumFractionDigits:2})))))})),
      groupDetail&&h(Modal,{title:groupDetail.label+' · résultat du parcours',onClose:()=>setGroupDetail(null),className:'v25-group-detail',footer:h(ActionButton,{primary:true,onClick:()=>{setGroupDetail(null);onAquatic()}},'Ouvrir le parcours')},h('div',{className:'v25-group-sources'},groupDetail.sources.map(source=>h('p',{key:source.id},source.label,h('strong',null,source.level?'Niveau '+source.level:'À évaluer')))),h('p',null,groupDetail.level===null?'Tous les ateliers de la ligne doivent être évalués.':'Moyenne exacte : '+groupDetail.level.toLocaleString('fr-FR',{maximumFractionDigits:2})+' / 4. La case la plus proche est mise en évidence ; le calcul de la note conserve cette moyenne exacte.')),
      settings&&h(EvaluationConfig,{cl,onClass,busy,onClose:()=>setSettings(false),onImport:()=>fileRef.current.click()}),
      imported&&h(RubricImportReview,{parsed:imported,onApply:rubric=>{onClass(old=>({...old,rubric}));onMessage('Grille importée. Les évaluations précédentes restent conservées.')},onClose:()=>setImported(null)}),
      detail&&h(Modal,{title:detail.label,onClose:()=>setDetail(null),className:'v21-criterion-detail'},h('div',{className:'v21-detail-levels'},detail.descriptions.map((text,i)=>h('section',{key:i,className:'tone-'+i},h('strong',null,'Niveau '+(i+1)),h('p',null,text))))));
  }

  function DiplomaTemplate({template,cl,onSave,onClose,onMessage}){
    const[asset,setAsset]=useState(template),[layout,setLayout]=useState(()=>JSON.parse(JSON.stringify(template?.layout||defaultDiplomaLayout()))),[preview,setPreview]=useState(null),[forms,setForms]=useState([]),[page,setPage]=useState(0),[active,setActive]=useState(0),[teacher,setTeacher]=useState('Monsieur RIGAUX'),[busy,setBusy]=useState(false),[error,setError]=useState(''),imageRef=useRef(null),drag=useRef(null);
    const roles={surname:'NOM',givenName:'Prénom',className:'Classe'},sample=cl.students[0],parts=sample?splitName(sample.name):{surname:'NOM',givenName:'Prénom'},values={surname:parts.surname,givenName:parts.givenName,className:cl.name},field=layout.fields[active];
    useEffect(()=>{documentStore('get','attestation-settings').then(settings=>{if(settings?.teacher)setTeacher(settings.teacher)}).catch(()=>{})},[]);
    useEffect(()=>{let live=true;if(!asset){setForms([]);officialAttestationPreview({cl,students:[sample||{name:'ÉLÈVE Exemple'}],splitName,teacher}).then(p=>previewPDF(p,page,1100)).then(p=>live&&setPreview(p)).catch(e=>live&&setError(e.message));return()=>{live=false}}diplomaFormFields(asset).then(x=>live&&setForms(x)).catch(()=>live&&setForms([]));diplomaFormPreview(asset,{...values,fullName:sample?fullName(sample.name):'NOM Prénom',date:longDate(todayParis())},layout).then(p=>previewPDF(p,page,1100)).then(p=>live&&setPreview(p)).catch(e=>live&&setError(e.message));return()=>{live=false}},[asset?.key,page,layout.useForm,layout.font,teacher]);
    async function choose(e){const file=e.target.files?.[0];e.target.value='';if(!file)return;setBusy(true);setError('');try{const next=await inspectPDF(file);setAsset(next);setPage(0)}catch(error){setError(error.message)}finally{setBusy(false)}}
    function patchField(patch){setLayout(old=>({...old,fields:old.fields.map((f,i)=>i===active?{...f,...patch}:f)}))}
    function start(e,i){e.preventDefault();setActive(i);e.currentTarget.setPointerCapture(e.pointerId);const r=imageRef.current.getBoundingClientRect(),f=layout.fields[i];drag.current={index:i,dx:(e.clientX-r.left)/r.width-f.x,dy:(e.clientY-r.top)/r.height-f.top}}
    function move(e){const d=drag.current;if(!d)return;const r=imageRef.current.getBoundingClientRect(),x=Math.max(.03,Math.min(.97,(e.clientX-r.left)/r.width-d.dx)),top=Math.max(.02,Math.min(.93,(e.clientY-r.top)/r.height-d.dy));setLayout(old=>({...old,fields:old.fields.map((f,i)=>i===d.index?{...f,x,top}:f)}))}
    async function save(){if(!asset){setBusy(true);try{await documentStore('put','attestation-settings',{teacher:teacher.trim()||'Monsieur RIGAUX'});onSave(null);onMessage('Attestation de l’établissement enregistrée.');onClose()}catch{setError('Les réglages ne peuvent pas être enregistrés.')}finally{setBusy(false)}return}setBusy(true);try{const value={...asset,layout};await documentStore('put','diploma-template',value);onSave(value);onMessage('Modèle de diplôme enregistré.');onClose()}catch{setError('Le modèle ne peut pas être enregistré. L’ancien modèle est conservé.')}finally{setBusy(false)}}
    const matched=new Set(layout.useForm===false?[]:forms.map(f=>f.role));
    return h(Modal,{title:'Mon modèle de diplôme PDF',onClose,className:'v21-diploma-template'+(!asset?' v25-official-model':''),footer:h('div',{className:'v21-footer-actions'},h(ActionButton,{onClick:async()=>{await documentStore('delete','diploma-template');onSave(null);onClose()}},'Utiliser le modèle intégré'),h(ActionButton,{primary:true,disabled:busy,onClick:save},busy?'Lecture…':'Enregistrer le modèle'))},
      h('div',{className:'v21-template-top'},h('label',{className:'v21-action'},'Déposer un PDF',h('input',{className:'v21-file-input',type:'file',accept:'.pdf,application/pdf','aria-label':'Déposer un modèle de diplôme PDF',onChange:choose})),h('span',null,asset?.name||'Attestation de l’établissement · modèle intégré'),(asset?.pages.length||2)>1&&h('div',{className:'v21-pager'},h(ActionButton,{disabled:page===0,onClick:()=>setPage(page-1)},'‹'),h('span',null,`${page+1}/${asset?.pages.length||2}`),h(ActionButton,{disabled:page+1>=(asset?.pages.length||2),onClick:()=>setPage(page+1)},'›'))),
      h('div',{className:'v21-template-layout'},h('div',{className:'v21-template-stage'},preview?h('div',{className:'v21-template-paper'},h('img',{ref:imageRef,src:preview.url,alt:'Aperçu du modèle de diplôme'}),(asset?layout.fields:[]).map((f,i)=>{
        const role=layout.joined&&f.role==='surname'?'fullName':f.role;if(f.page!==page||layout.joined&&f.role==='givenName'||matched.has(role)||matched.has('fullName')&&['surname','givenName'].includes(role))return null;
        return h('button',{key:f.role,className:'v21-template-field '+(active===i?'selected':''),style:{left:f.x*100+'%',top:f.top*100+'%',fontSize:Math.max(10,f.size*(imageRef.current?.getBoundingClientRect().width||600)/preview.width)+'px',color:layout.color,fontFamily:layout.font==='TimesRoman'?'Georgia,serif':'Arial,sans-serif',fontWeight:layout.font==='Helvetica'?'400':'700',touchAction:'none'},onPointerDown:e=>start(e,i),onPointerMove:move,onPointerUp:()=>{drag.current=null},onPointerCancel:()=>{drag.current=null},'aria-label':'Position de '+roles[f.role]},role==='fullName'?(sample?fullName(sample.name):'NOM Prénom'):values[f.role]);
      })):h('div',{className:'v21-template-placeholder'},h(Icon,{name:'certificate'}),h('strong',null,'Le PDF du diplôme apparaîtra ici.'))),
        h('aside',{className:'v21-template-controls'},!asset&&h('div',{className:'v25-official-settings'},h('h3',null,'Ton attestation'),h('p',null,'Le prénom, le nom, la classe et la date sont remplis automatiquement. Les deux pages sont conservées.'),h('label',null,'Enseignant',h('input',{'aria-label':'Enseignant sur l’attestation',value:teacher,maxLength:80,onChange:e=>setTeacher(e.target.value)}))),h('p',null,'Déplace les étiquettes sur les emplacements du PDF.'),forms.length>0&&h('label',{className:'v21-checkbox'},h('input',{type:'checkbox',checked:layout.useForm!==false,onChange:e=>setLayout(old=>({...old,useForm:e.target.checked}))}),'Remplir les champs PDF reconnus'),forms.length>0&&h('small',null,'Champs reconnus : '+forms.map(f=>f.name).join(', ')),
          h('label',{className:'v21-checkbox'},h('input',{type:'checkbox',checked:layout.joined,onChange:e=>setLayout(old=>({...old,joined:e.target.checked}))}),'NOM Prénom sur une ligne'),
          h('label',null,'Étiquette',h('select',{'aria-label':'Étiquette du diplôme',value:active,onChange:e=>setActive(Number(e.target.value))},layout.fields.map((f,i)=>h('option',{key:f.role,value:i},layout.joined&&i===0?'NOM Prénom':roles[f.role])))),
          h('label',null,'Taille',h('input',{type:'number',min:7,max:70,value:field.size,'aria-label':'Taille de l’étiquette',onChange:e=>patchField({size:Math.max(7,Math.min(70,Number(e.target.value)))})})),
          h('label',null,'Typographie',h('select',{value:layout.font,onChange:e=>setLayout(old=>({...old,font:e.target.value}))},h('option',{value:'Helvetica-Bold'},'Sans sérif · gras'),h('option',{value:'Helvetica'},'Sans sérif · normal'),h('option',{value:'TimesRoman'},'Classique'))),h('label',null,'Couleur',h('input',{type:'color',value:layout.color,onChange:e=>setLayout(old=>({...old,color:e.target.value}))})),
          asset?.pages.length>1&&h(ActionButton,{onClick:()=>patchField({page})},'Placer sur cette page'))),error&&h('p',{role:'alert'},error));
  }
  function DiplomaCell({student,cl,onMessage}){
    const[busy,setBusy]=useState(false),eligible=eligibleDiploma(student);
    async function download(e){e.stopPropagation();if(!eligible||busy)return;setBusy(true);try{const template=await documentStore('get','diploma-template'),bytes=await diplomasPDF({cl,students:[student],template,splitName,fullName});downloadBytes(bytes,('Diplome-'+fullName(student.name)+'.pdf').replace(/[\\/:*?"<>|]/g,'-'));onMessage('Diplôme téléchargé.')}catch(error){onMessage(error.message||'Le diplôme ne peut pas être préparé.')}finally{setBusy(false)}}
    return h('button',{className:'v22-diploma-download'+(eligible?' ready':''),disabled:!eligible||busy,'aria-label':'Télécharger le diplôme de '+student.name,title:eligible?'Diplôme attribué automatiquement · Télécharger':testStatus(student)==='failed'?'Une étape rouge : test non validé':'Termine les neuf étapes pour obtenir le diplôme',onClick:download,onDoubleClick:e=>e.stopPropagation(),'data-ready':eligible},h(Icon,{name:busy?'clock':'certificate'}));
  }
  function DiplomaModelButton({cl,onMessage}){
    const[open,setOpen]=useState(false),[template,setTemplate]=useState(null);
    async function edit(){try{setTemplate(await documentStore('get','diploma-template')||null);setOpen(true)}catch{onMessage('Le modèle PDF ne peut pas être ouvert sur cet appareil.')}}
    return h(React.Fragment,null,h(ActionButton,{icon:'certificate',onClick:edit},'Modèle PDF'),open&&h(DiplomaTemplate,{template,cl,onSave:setTemplate,onClose:()=>setOpen(false),onMessage}));
  }
  function ResultProfiles({cl={students:[],name:''},students,criteria,criterionState,criterionLevel,progress,onRetest,onMessage}){
    const[ref,box]=useBox(),layout=registerLayout(box.width,box.height,students.length,1),rows=layout.rows,rowHeight=Math.max(17,Math.floor((box.height-36)/rows*4)/4),namesWidth=Math.max(103,(box.width-(layout.columns-1)*10)/layout.columns*.30),ready=students.filter(eligibleDiploma).length;
    function panel(index){const pupils=students.slice(index*rows,(index+1)*rows);return h('table',{key:index,className:'v22-results-table',style:{'--result-row':rowHeight+'px'},'aria-label':'Résultats du test, partie '+(index+1)},
      h('colgroup',null,h('col',{style:{width:'30%'}}),criteria.map(c=>h('col',{key:c.id,style:{width:'8%'}})),h('col',{style:{width:'22%'}}),h('col',{style:{width:'8%'}})),
      h('thead',null,h('tr',null,h('th',null,'Élève'),criteria.map(c=>h('th',{key:c.id,title:c.label||c.short},({entry:'Entrée',floating:'Flott.',backstroke:'Dos',frontstroke:'Ventr.',immersion:'Imm.'}[c.id]||c.short))),h('th',null,'Résultat'),h('th',null,h(Icon,{name:'certificate'})))),
      h('tbody',null,pupils.map(p=>{const status=testStatus(p),count=progress(p);return h('tr',{key:p.id,'data-result-student':p.id,onDoubleClick:()=>onRetest(p.id)},
        h('th',{scope:'row'},h('button',{className:'v22-result-name',onClick:()=>onRetest(p.id),'aria-label':'Repasser le test de '+p.name},h('strong',{style:{fontSize:labelFont(fullName(p.name),namesWidth-39,rowHeight-5,14)+'px'}},fullName(p.name)),h('span',{className:'v22-result-score',title:`${count.mastered+count.competent} étapes acquises, ${count.fragile} à consolider, ${count.failed} non acquises`},(count.mastered+count.competent)+'/9'))),
        criteria.map(c=>{const state=criterionState(p,c.id);return h('td',{key:c.id},h('span',{className:'criterion-pill '+state,title:c.short+' : '+(criterionLevel(p,c.id)||'à évaluer')},criterionLevel(p,c.id)||'—'))}),
        h('td',null,h('span',{className:'v22-result-chip '+status},h('span',{className:'v22-result-dot','aria-hidden':true}),{failed:'Non validé',pending:'À terminer',mastered:'Maîtrisé',consolidate:'À consolider'}[status])),h('td',null,h(DiplomaCell,{student:p,cl,onMessage})));
      })));
    }
    return h('section',{className:'v22-result-profiles'},h('div',{className:'v22-results-heading'},h('div',null,h('h2',null,'Résultats du test'),h('span',null,`${ready} diplôme${ready>1?'s':''} prêt${ready>1?'s':''}`)),h(DiplomaModelButton,{cl,onMessage})),
      h('div',{className:'v22-results-boards',ref,style:{gridTemplateColumns:`repeat(${layout.columns},minmax(0,1fr))`}},Array.from({length:layout.columns},(_,i)=>panel(i))));
  }
  function DocumentActions({cl,action,onDone,onMessage}){
    const[busy,setBusy]=useState(''),[template,setTemplate]=useState(null),[settings,setSettings]=useState(false);
    useEffect(()=>{
      if(!action||!cl)return;onDone();
      (async()=>{setBusy('Préparation du document…');try{
        if(action.type==='diploma-model'){setTemplate(await documentStore('get','diploma-template')||null);setSettings(true);return}
        let bytes,name;
        if(action.type.includes('diplomas')){const pupils=cl.students.filter(eligibleDiploma),model=await documentStore('get','diploma-template');bytes=await diplomasPDF({cl,students:pupils,template:model,splitName,fullName});name='Diplomes-Savoir-nager-'+cl.name+'.pdf'}
        else if(action.type.includes('aquatic')){bytes=await evaluationPDF({cl,students:cl.students.map(aquaticPDFStudent),config:aquaticRubric(cl),fullName,blank:action.type==='print-aquatic-blank'});name='Evaluation-Parcours-aquatique-'+cl.name+'.pdf'}
        else{bytes=await evaluationPDF({cl,students:cl.students,config:demoRubric(cl),fullName,blank:action.type==='print-blank'});name='Evaluation-Demonstration-de-nage-'+cl.name+'.pdf'}
        if(action.type.startsWith('save-'))downloadBytes(bytes,name.replace(/[\\/:*?"<>|]/g,'-'));else await printPDF(bytes,(done,total)=>setBusy('Préparation de l’impression · '+done+' / '+total));
        onMessage(action.type.startsWith('save-')?'Document téléchargé.':'Document de la classe prêt à imprimer.');
      }catch(error){onMessage(error.message||'Le document ne peut pas être préparé.')}finally{setBusy('')}})();
    },[action?.id]);
    return h(React.Fragment,null,busy&&h('div',{className:'v21-document-busy v22-global-busy',role:'status'},h(Icon,{name:'clock'}),busy),settings&&h(DiplomaTemplate,{template,cl,onSave:setTemplate,onClose:()=>setSettings(false),onMessage}));
  }
  function LearningProfiles({students,module,status,completeLevel,learningKey,levelTone,initials,onSelect,filter,onFilter}){
    const[ref,box]=useBox(),pupils=students.filter(p=>p.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').includes(filter.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr'))),choices=[];
    for(let columns=1;columns<=Math.max(1,Math.floor(box.width/140));columns++){
      const rows=Math.max(1,Math.ceil(pupils.length/columns)),width=(box.width-(columns-1)*8)/columns,height=(box.height-(rows-1)*8)/rows;choices.push({columns,rows,width,height,score:Math.min(width/2.6,height)});
    }
    const layout=choices.sort((a,b)=>b.score-a.score)[0]||{columns:1,rows:1,width:box.width,height:box.height};
    return h('section',{className:'learner-profiles surface-panel v24-learning-profiles'},h('div',{className:'section-heading'},h('h2',null,'Touche ton nom'),h('input',{className:'learning-search',placeholder:'Rechercher mon nom',value:filter,onChange:e=>onFilter(e.target.value),'aria-label':'Rechercher un élève pour les ateliers'})),
      h('div',{className:'learner-grid',ref,style:{gridTemplateColumns:`repeat(${layout.columns},minmax(0,1fr))`,gridTemplateRows:`repeat(${layout.rows},minmax(0,1fr))`,'--profile-height':layout.height+'px'}},pupils.map(p=>{const done=module.levels.filter((_,i)=>completeLevel(status(p,learningKey(module,i)),i,module.levels.length)).length;return h('button',{className:'learner-card','data-learning-student':p.id,key:p.id,onClick:()=>onSelect(p.id)},h('span',{className:'avatar'},initials(p.name)),h(LearningName,{parts:splitName(p.name),size:poolNameFont(splitName(p.name),layout.width-54,Math.max(20,layout.height-30),18)}),h('span',{className:'mini-level-track'},module.levels.map((_,i)=>h('i',{key:i,className:levelTone(i,module)+(completeLevel(status(p,learningKey(module,i)),i,module.levels.length)?' earned':'')},i+1))),h('small',null,`${done}/${module.levels.length}`))})),
      !students.length&&h('p',null,'Ajoute ou importe une classe dans l’onglet Classes.'));
  }
  const {AquaticPanel}=createAquaticFeatures({React,h,Modal,ActionButton,Icon,fullName,RubricEditor});
  function ClassWorkspace(props){
    const[view,setView]=useState('register'),[student,setStudent]=useState('');
    const switchView=id=>{setView(id);props.onView(id)},evaluate=id=>{setStudent(id);switchView('rubric')};
    useEffect(()=>{switchView('register');setStudent('')},[props.cl.id]);
    return h('div',{className:'v21-class-workspace v22-class-workspace'},h('nav',{className:'v21-class-tabs',role:'tablist','aria-label':'Vues de la classe'},[['register','Suivi du cycle'],['plan','Plan du bassin'],['rubric','Évaluation démonstration de nage'],['aquatic','Évaluation parcours aquatique']].map(([id,label])=>h('button',{key:id,role:'tab','aria-selected':view===id,onPointerUp:e=>{if(e.pointerType==='touch')switchView(id)},onClick:()=>switchView(id)},label))),
      view==='register'&&h(Register,props),view==='plan'&&h(PoolPlan,{...props,onEvaluate:evaluate}),view==='rubric'&&h(RubricPanel,{...props,selectedId:student,onSelected:setStudent,onAquatic:()=>switchView('aquatic')}),view==='aquatic'&&h(AquaticPanel,{...props,selectedId:student,onSelected:setStudent}));
  }
  return {ClassWorkspace,GlobalToolbar,ExportDialog,ClassManager,ResultProfiles,DocumentActions,LearningProfiles};
}
