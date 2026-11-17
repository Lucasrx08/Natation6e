import {reconcilePair} from './session-v37.js';
import {evaluationSettings} from './evaluation-v37.js';
import {AQUATIC_STEPS,AQUATIC_DURATION,aquaticRubric,aquaticGrade} from './aquatic-model-v37.js';

export function createAquaticFeatures({React,h,Modal,ActionButton,Icon,fullName,RubricEditor}){
  const {useState,useRef,useEffect}=React;
  function StepArt({step}){
    return step.id==='turn'?h('div',{className:'v23-turn-art'},h('img',{src:'./action-04-ventrale.png',alt:'',draggable:false}),h('svg',{className:'turn-direction',viewBox:'0 0 40 44',fill:'none','aria-hidden':true},h('path',{d:'M7 6 H21 C37 6 37 36 21 36 H7 M15 28 L7 36 L15 42',stroke:'currentColor',strokeWidth:3,strokeLinecap:'round',strokeLinejoin:'round'})),h('img',{src:'./action-07-dorsale.png',alt:'',draggable:false})):h('img',{src:step.image,alt:'',draggable:false});
  }
  function CourseVideo({start=0,onClose}){
    const ref=useRef(null),restore=useRef({time:start,playing:false});
    const [quality,setQuality]=useState('hd'),[time,setTime]=useState(start),[notice,setNotice]=useState(''),[media,setMedia]=useState(null);
    const chapter=AQUATIC_STEPS.find(s=>time>=s.start&&time<s.end);
    const source=quality==='4k'?'./media/parcours-aquatique-v32-4k.mp4':'./media/parcours-aquatique-v32.mp4';
    // A complete local media URL makes chapter seeking independent of network
    // ranges and of a service-worker update during playback. Revoke on close.
    useEffect(()=>{
      const controller=new AbortController();let objectURL;
      fetch(source,{signal:controller.signal}).then(response=>{if(!response.ok)throw new Error('Video unavailable');return response.blob()}).then(blob=>{
        if(controller.signal.aborted)return;
        objectURL=URL.createObjectURL(blob);setMedia({quality,url:objectURL});
      }).catch(error=>{if(error.name!=='AbortError'&&!controller.signal.aborted)failed()});
      return()=>{controller.abort();if(objectURL)URL.revokeObjectURL(objectURL)};
    },[quality]);
    const mediaURL=media?.quality===quality?media.url:undefined;
    function changeQuality(next){if(next===quality)return;restore.current={time:ref.current?.currentTime||time,playing:!!ref.current&&!ref.current.paused};setNotice('');setMedia(null);setQuality(next)}
    function loaded(){const video=ref.current;if(!video)return;video.currentTime=Math.min(restore.current.time,video.duration||AQUATIC_DURATION);if(restore.current.playing)video.play().catch(()=>{})}
    function failed(){if(quality==='4k'){restore.current={time:ref.current?.currentTime||restore.current.time,playing:false};setMedia(null);setQuality('hd');setNotice('Lecture en Full HD. La version 4K sera disponible avec une connexion.')}else setNotice('La vidéo ne peut pas être chargée. Réessayez une fois la connexion rétablie.')}
    return h(Modal,{title:'Le parcours aquatique',onClose,className:'v23-video-dialog v32-video-dialog',footer:h('div',{className:'v32-video-footer'},
      h('label',{className:'v32-quality'},'Lecture',h('select',{'aria-label':'Qualité de la vidéo',value:quality,onChange:e=>changeQuality(e.target.value)},h('option',{value:'hd'},'Full HD'),h('option',{value:'4k'},'4K'))),
      h('a',{className:'v21-action',href:'./media/parcours-aquatique-v32-4k.mp4',download:'Parcours-aquatique-4K.mp4'},h(Icon,{name:'export'}),'Télécharger en 4K'),
      h(ActionButton,{onClick:onClose},'Revenir à l’évaluation'))},
      h('video',{key:quality,ref,src:mediaURL,controls:true,playsInline:true,preload:'metadata',poster:'./media/parcours-aquatique-v32.png','aria-label':'Capsule illustrée du parcours aquatique en dix étapes',onLoadedMetadata:loaded,onTimeUpdate:e=>setTime(e.currentTarget.currentTime),onError:failed},h('track',{kind:'captions',src:'./media/parcours-aquatique-v32.vtt',srcLang:'fr',label:'Français'})),
      !mediaURL&&!notice&&h('p',{className:'v32-video-notice',role:'status'},'Chargement de la vidéo…'),
      notice&&h('p',{className:'v32-video-notice',role:'status'},notice),
      h('nav',{className:'v23-video-chapters','aria-label':'Étapes de la vidéo'},AQUATIC_STEPS.map(s=>h('button',{key:s.id,'aria-current':chapter?.id===s.id?'step':undefined,onClick:()=>{restore.current={time:s.start,playing:false};if(ref.current?.readyState){ref.current.currentTime=s.start;ref.current.pause()}setTime(s.start)},title:s.title},h('span',null,String(s.number).padStart(2,'0')),s.short))));
  }
  function AquaticPanel({cl,students,selectedId,onSelected,onClass,onUpdate,onMessage}){
    const[laneIds,setLaneIds]=useState([selectedId||'','']),[activeLane,setActiveLane]=useState(0),[steps,setSteps]=useState(['entry','entry']),[video,setVideo]=useState(null),[settings,setSettings]=useState(false),[detailOpen,setDetailOpen]=useState(false);
    const ids=reconcilePair(laneIds,students),pupils=ids.map(id=>students.find(p=>p.id===id)),lane=pupils[activeLane]?activeLane:0,student=pupils[lane],config=aquaticRubric(cl),maximum=evaluationSettings(cl).aquaticMax,step=AQUATIC_STEPS.find(s=>s.id===steps[lane])||AQUATIC_STEPS[0],criterion=config.criteria.find(c=>c.id===step.criterion),level=student?.aquaticLevels?.[step.criterion];
    function choose(index,id){if(id&&id===ids[1-index])return;const next=[...ids];next[index]=id;setLaneIds(next);setActiveLane(index);onSelected(id)}
    function navigate(index,direction){const choices=students.filter(p=>p.id!==ids[1-index]),at=choices.findIndex(p=>p.id===ids[index]),next=choices[at+direction];if(next)choose(index,next.id)}
    function select(next){if(!student||!criterion)return;onUpdate(student.id,p=>({...p,aquaticLevels:{...p.aquaticLevels,[criterion.id]:p.aquaticLevels?.[criterion.id]===next?null:next}}));setDetailOpen(false)}
    function course(index){
      const pupil=pupils[index],choices=students.filter(p=>p.id!==ids[1-index]),at=choices.findIndex(p=>p.id===pupil?.id),grade=pupil?aquaticGrade(pupil,config,maximum):null,done=config.criteria.filter(c=>[1,2,3,4].includes(pupil?.aquaticLevels?.[c.id])).length,marker='aq-arrow-'+index;
      return h('section',{key:index,className:'v37-aquatic-lane'+(lane===index?' active':''),'data-aquatic-lane':index+1,'aria-label':'Ligne d’eau '+(index+1)},
        h('div',{className:'v37-lane-toolbar'},
          h('strong',{className:'v37-lane-number'},'Ligne '+(index+1)),
          h(ActionButton,{'aria-label':'Élève précédent, ligne '+(index+1),disabled:at<=0,onClick:()=>navigate(index,-1)},'‹'),
          h('select',{'aria-label':'Élève du parcours aquatique, ligne '+(index+1),value:pupil?.id||'',disabled:!choices.length,onChange:e=>choose(index,e.target.value)},!pupil&&h('option',{value:''},'Aucun autre élève présent'),choices.map(p=>h('option',{key:p.id,value:p.id},fullName(p.name)))),
          h(ActionButton,{'aria-label':'Élève suivant, ligne '+(index+1),disabled:at<0||at>=choices.length-1,onClick:()=>navigate(index,1)},'›'),
          h('small',null,done+' / '+config.criteria.length),
          h('output',{'aria-label':'Note du parcours, ligne '+(index+1)},(grade===null?'—':grade.toLocaleString('fr-FR',{maximumFractionDigits:2}))+' / '+maximum)),
        h('div',{className:'v23-aquatic-course'},
          AQUATIC_STEPS.map(s=>{const lv=pupil?.aquaticLevels?.[s.criterion];return h('button',{key:s.id,'data-aquatic-step':s.id,className:'v23-course-step '+(s.criterion?'assessed':'journey')+(lane===index&&steps[index]===s.id?' selected':''),'data-level':lv||0,style:{gridColumn:({entry:'1',outward:'2',upright:'3',front:'4 / span 2',turn:'6',back:'5',star:'4',return:'3',ring:'2',anchor:'1'})[s.id],gridRow:s.id==='turn'?'1 / span 2':s.number<=4?'1':'2'},disabled:!pupil,'aria-label':(s.criterion?'Évaluer':'Voir')+' '+s.title+', ligne '+(index+1)+(pupil?' : '+fullName(pupil.name):''),'aria-pressed':lane===index&&steps[index]===s.id,onClick:()=>{setActiveLane(index);setSteps(old=>old.map((value,i)=>i===index?s.id:value));setDetailOpen(true)}},h('span',{className:'v23-step-illustration'},h(StepArt,{step:s}),h('span',{className:'v23-step-number'},s.number),s.criterion&&h('span',{className:'v23-step-level'},lv?'N'+lv:'—')),h('strong',null,s.short))})),
        !pupil&&h('p',{className:'v37-empty-lane'},students.length?'Un seul élève présent : utilisez la première ligne.':'Aucun élève présent aujourd’hui.'));
    }
    return h('section',{className:'v21-pane v37-aquatic-grid v38-aquatic','aria-label':'Évaluation parcours aquatique à deux lignes'},
      h('div',{className:'v21-pane-toolbar v37-aquatic-tools'},h('strong',null,'Parcours aquatique · 2 lignes'),h('span',{className:'v26-toolbar-space'}),h(ActionButton,{onClick:()=>setSettings(true)},'Critères'),h(ActionButton,{primary:true,onClick:()=>setVideo(0)},'▶ Voir le parcours')),
      course(0),course(1),
      detailOpen&&h(Modal,{title:step.number+' · '+step.title,onClose:()=>setDetailOpen(false),className:'v38-level-dialog',footer:h('div',{className:'v38-level-footer'},h(ActionButton,{onClick:()=>{setDetailOpen(false);setVideo(step.start)}},'▶ Voir cette étape'),h(ActionButton,{onClick:()=>setDetailOpen(false)},'Fermer'))},h('p',{className:'v38-evaluated-pupil'},(student?fullName(student.name):'Aucun élève')+' · Ligne '+(lane+1)),
        criterion?h('div',{className:'v23-aquatic-levels'},criterion.descriptions.map((text,i)=>h('button',{key:i,className:'tone-'+i+(level===i+1?' selected':''),'aria-label':criterion.label+' : niveau '+(i+1)+(student?' pour '+fullName(student.name):''),'aria-pressed':level===i+1,disabled:!student,onClick:()=>select(i+1)},h('strong',null,'NIVEAU '+(i+1),level===i+1?' ✓':''),h('span',null,text)))):
        h('div',{className:'v23-course-explanation'},h('p',null,step.cue))),
      settings&&h(RubricEditor,{config,maximum,onSave:rubric=>{onClass(old=>({...old,aquaticRubric:{...rubric,kind:'aquatic',title:'Évaluation parcours aquatique'}}));onMessage('Critères du parcours enregistrés.')},onClose:()=>setSettings(false)}),video!==null&&h(CourseVideo,{start:video,onClose:()=>setVideo(null)}));
  }
  return {AquaticPanel};
}
