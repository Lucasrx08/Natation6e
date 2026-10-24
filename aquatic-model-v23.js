import {rubricGrade,rubricRows} from './cycle-model-v23.js';

// This assessed cycle course is deliberately independent of the nine-step ASNS test.
export const AQUATIC_STEPS = [
  {id:'entry',number:1,title:'Chute arrière',short:'Saut arrière',start:5,end:12,x:10,y:27,image:'./assets/v23/backward-jump.png',criterion:'aq-entry',cue:'Je pousse avec mes jambes et je saute en arrière, bras le long du corps, pieds en premier.'},
  {id:'outward',number:2,title:'Immersion aller',short:'Immersion aller',start:12,end:24,x:30,y:27,image:'./action-03-obstacle.png',criterion:'aq-outward',cue:'Je nage sur le ventre, puis je passe sous le tapis OU dans le cerceau lesté.'},
  {id:'upright',number:3,title:'Flottaison debout',short:'Debout · 15 s',start:24,end:39,x:50,y:27,image:'./ateliers/flottaison-3d-4.png',criterion:'aq-upright',cue:'Je reste debout dans l’eau pendant 15 secondes, sans toucher le fond.',hold:15},
  {id:'front',number:4,title:'Reprise de la nage ventrale',short:'Nage ventrale',start:39,end:44,x:70,y:27,image:'./action-04-ventrale.png',cue:'Je repars sur le ventre jusqu’au demi-tour.'},
  {id:'turn',number:5,title:'Demi-tour de 180°',short:'Demi-tour',start:44,end:50,x:90,y:50,image:'./action-04-ventrale.png',cue:'Je fais demi-tour sans toucher le fond, puis je m’oriente sur le dos.'},
  {id:'back',number:6,title:'Nage dorsale',short:'Nage dorsale',start:50,end:57,x:78,y:75,image:'./action-07-dorsale.png',cue:'Je nage sur le dos jusqu’à la zone de flottaison.'},
  {id:'star',number:7,title:'Étoile de mer dorsale',short:'Étoile · 15 s',start:57,end:72,x:60,y:75,image:'./ateliers/flottaison-3d-5.png',criterion:'aq-star',cue:'Je fais l’étoile sur le dos pendant 15 secondes, avec une respiration calme.',hold:15},
  {id:'return',number:8,title:'Immersion retour',short:'Immersion retour',start:72,end:85,x:42,y:75,image:'./action-09-obstacle-retour.png',criterion:'aq-return',cue:'Je reprends la nage dorsale, puis je passe sous le tapis OU dans le cerceau lesté.'},
  {id:'ring',number:9,title:'Récupération de l’anneau',short:'L’anneau',start:85,end:96,x:25,y:75,image:'./ateliers/immersion-object-v19.png',criterion:'aq-ring',cue:'Je repars sur le dos, puis je m’immerge pour récupérer l’anneau.'},
  {id:'anchor',number:10,title:'Rejoindre le bord',short:'Je m’accroche',start:96,end:103,x:8,y:75,image:'./action-11-ancrage.png',cue:'Je rejoins le bord et je m’y accroche.'}
];
export const AQUATIC_DURATION = 108;
export const AQUATIC_TONES = ['#f87c94','#f7c695','#ffe6a4','#c8e1b9'];
const immersion = [
  'Je ne franchis pas encore l’obstacle.',
  'Je touche le tapis, mais je ne le franchis pas complètement.',
  'Je passe complètement sous le tapis.',
  'Je passe complètement dans le cerceau lesté.'
];
export function defaultAquaticRubric(){
  return {kind:'aquatic',title:'Évaluation parcours aquatique',confirmed:true,points:[1,2,3,4],criteria:[
    {id:'aq-entry',label:'Chute arrière',weight:1,descriptions:[
      'Je ne réalise pas encore l’entrée dans l’eau.',
      'Je réalise une entrée pieds en premier, face à l’eau.',
      'Je saute en arrière, puis j’ai besoin d’une aide pour retrouver une respiration calme.',
      'Je saute en arrière, bras le long du corps, pieds en premier. Je reprends ma respiration calmement.'
    ]},
    {id:'aq-outward',label:'Immersion aller',weight:1,descriptions:[...immersion]},
    {id:'aq-upright',label:'Flottaison debout · 15 s',weight:1,descriptions:[
      'Je ne tiens pas encore les 15 secondes.',
      'Mon nez touche l’eau ; je ne garde pas ma respiration libre.',
      'Je tiens 15 secondes, mais l’eau atteint mon visage par moments.',
      'Je tiens 15 secondes, le cou hors de l’eau et la respiration libre.'
    ]},
    {id:'aq-star',label:'Étoile dorsale · 15 s',weight:1,descriptions:[
      'Je ne tiens pas encore les 15 secondes.',
      'Je tiens 15 secondes, mais mes genoux et mes jambes s’enfoncent ; mes jambes se replient.',
      'Je tiens 15 secondes, mais mes orteils restent sous l’eau.',
      'Je tiens 15 secondes, corps parallèle à l’eau, orteils et bouche émergés. Je respire calmement.'
    ]},
    {id:'aq-return',label:'Immersion retour',weight:1,descriptions:[...immersion]},
    {id:'aq-ring',label:'Récupération de l’anneau',weight:1,descriptions:[
      'Je n’atteins pas encore l’anneau.',
      'J’atteins l’anneau, mais je ne le remonte pas.',
      'Je remonte l’anneau avec une aide.',
      'Je récupère et je remonte l’anneau sans appui.'
    ]}
  ]};
}
export function aquaticRubric(cl){return cl?.aquaticRubric||defaultAquaticRubric()}
export function aquaticPDFStudent(p){return {...p,rubricLevels:{...p.aquaticLevels}}}
export function aquaticGrade(p,config){return rubricGrade(aquaticPDFStudent(p),config)}
export function aquaticRows(students,config,fullName){return rubricRows(students.map(aquaticPDFStudent),config,fullName)}
export function aquaticSegmentAt(time){
  const t=Math.max(0,Math.min(AQUATIC_DURATION,Number(time)||0));
  return AQUATIC_STEPS.find(s=>t>=s.start&&t<s.end)||null;
}
