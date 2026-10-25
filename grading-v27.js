// Round a computed grade up once to the next quarter-point. Keep raw observations exact.
export function gradeQuarter(value,maximum=Infinity){
 if(value===null||value===undefined||!Number.isFinite(value))return null;
 const scaled=value*4,nearest=Math.round(scaled),stable=Math.abs(scaled-nearest)<=1e-9?nearest:scaled;
 return Math.min(maximum,Math.ceil(stable)/4);
}
