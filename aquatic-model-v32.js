// Assessment levels are unchanged. Video chapters have their own shorter timing.
import {AQUATIC_STEPS as prior} from './aquatic-model-v27.js';
export * from './aquatic-model-v27.js';
const times=[[3,8],[8,16],[16,21],[21,26],[26,31],[31,37],[37,42],[42,50],[50,64],[64,69]];
const cues={turn:'Je me redresse, je change de direction sans toucher le fond, puis je m’allonge sur le dos et je repars en dos crawlé.',return:'Je reprends sur le dos, je franchis le tapis OU le cerceau, puis je ressors en crawl.',ring:'Je récupère l’anneau en plongeon canard, je remonte et je le montre hors de l’eau. Je le lâche au signal, puis je repars en crawl vers le bord.',anchor:'Je rejoins le bord en crawl et je m’y accroche avec les mains.'};
export const AQUATIC_STEPS=prior.map((s,i)=>({...s,start:times[i][0],end:times[i][1],cue:cues[s.id]||s.cue,...(s.hold?{videoHold:5,hold:15}: {})}));
export const AQUATIC_DURATION=72;
