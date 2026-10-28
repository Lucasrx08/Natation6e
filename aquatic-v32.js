import {evaluationSettings} from './evaluation-v27.js';
import {AQUATIC_STEPS,AQUATIC_DURATION,aquaticRubric,aquaticGrade} from './aquatic-model-v32.js';

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
    const [selected,setSelected]=useState('entry'),[video,setVideo]=useState(null),[settings,setSettings]=useState(false),config=aquaticRubric(cl),maximum=evaluationSettings(cl).aquaticMax,student=students.find(p=>p.id===selectedId)||students[0],step=AQUATIC_STEPS.find(s=>s.id===selected)||AQUATIC_STEPS[0],criterion=config.criteria.find(c=>c.id===step.criterion),level=student?.aquaticLevels?.[step.criterion],grade=student?aquaticGrade(student,config,maximum):null,done=config.criteria.filter(c=>[1,2,3,4].includes(student?.aquaticLevels?.[c.id])).length,index=students.indexOf(student);
    function select(next){if(!student||!criterion)return;onUpdate(student.id,p=>({...p,aquaticLevels:{...p.aquaticLevels,[criterion.id]:p.aquaticLevels?.[criterion.id]===next?null:next}}))}
    return h('section',{className:'v23-aquatic v21-pane','aria-label':'Évaluation parcours aquatique'},
      h('div',{className:'v21-pane-toolbar v23-aquatic-toolbar'},h('div',{className:'v23-pupil-picker'},h(ActionButton,{'aria-label':'Élève précédent',disabled:index<=0,onClick:()=>onSelected(students[index-1].id)},'‹'),h('select',{'aria-label':'Élève du parcours aquatique',value:student?.id||'',onChange:e=>onSelected(e.target.value)},students.map(p=>h('option',{key:p.id,value:p.id},fullName(p.name)))),h(ActionButton,{'aria-label':'Élève suivant',disabled:index<0||index===students.length-1,onClick:()=>onSelected(students[index+1].id)},'›')),
        h('span',{className:'v23-aquatic-progress'},done+' / '+config.criteria.length+' ateliers'),h('output',{'aria-label':'Note du parcours sur '+maximum,className:'v21-rubric-score'},(grade===null?'—':grade.toLocaleString('fr-FR',{maximumFractionDigits:2}))+' / '+maximum),h(ActionButton,{onClick:()=>setSettings(true)},'Critères'),h(ActionButton,{primary:true,onClick:()=>setVideo(0)},'▶ Voir le parcours')),
      h('div',{className:'v23-aquatic-course'},
        h('svg',{className:'v23-course-path',viewBox:'0 0 1000 400',preserveAspectRatio:'none','aria-hidden':true},h('defs',null,h('marker',{id:'aq-arrow',viewBox:'0 0 10 10',refX:7,refY:5,markerWidth:4,markerHeight:4,orient:'auto-start-reverse'},h('path',{d:'M0 0L10 5L0 10Z',fill:'#ecfcff'}))),h('path',{d:'M95 108 H795 Q905 108 905 204 Q905 300 790 300 H48',fill:'none',stroke:'#effeff',strokeWidth:7,opacity:.65,markerEnd:'url(#aq-arrow)'})),
        h('span',{className:'v23-course-direction'},'ALLER →'),h('span',{className:'v23-course-direction return'},'← RETOUR'),
        AQUATIC_STEPS.map(s=>{const lv=student?.aquaticLevels?.[s.criterion];return h('button',{key:s.id,'data-aquatic-step':s.id,className:'v23-course-step '+(s.criterion?'assessed':'journey')+(selected===s.id?' selected':''),'data-level':lv||0,style:{left:s.x+'%',top:s.y+'%'},'aria-label':`${s.criterion?'Évaluer':'Voir'} l’étape ${s.number} : ${s.title}`,'aria-pressed':selected===s.id,onClick:()=>setSelected(s.id)},h('span',{className:'v23-step-illustration'},h(StepArt,{step:s}),h('span',{className:'v23-step-number'},s.number),s.criterion&&h('span',{className:'v23-step-level'},lv?'N'+lv:'—')),h('strong',null,s.short))}),
        null),
      h('div',{className:'v23-aquatic-detail'},h('div',{className:'v23-detail-title'},h('span',null,step.number+' · '+step.title),h('button',{onClick:()=>setVideo(step.start),'aria-label':'Voir cette étape en vidéo'},'▶ Voir')),
        criterion?h('div',{className:'v23-aquatic-levels'},criterion.descriptions.map((text,i)=>h('button',{key:i,className:'tone-'+i+(level===i+1?' selected':''),'aria-label':criterion.label+' : niveau '+(i+1),'aria-pressed':level===i+1,disabled:!student,onClick:()=>select(i+1)},h('strong',null,'NIVEAU '+(i+1),level===i+1?' ✓':''),h('span',null,text)))):
          h('div',{className:'v23-course-explanation'},h('p',null,step.cue),null)),
      settings&&h(RubricEditor,{config,maximum,onSave:rubric=>{onClass(old=>({...old,aquaticRubric:{...rubric,kind:'aquatic',title:'Évaluation parcours aquatique'}}));onMessage('Barème du parcours enregistré.')},onClose:()=>setSettings(false)}),video!==null&&h(CourseVideo,{start:video,onClose:()=>setVideo(null)}));
  }
  return {AquaticPanel};
}
