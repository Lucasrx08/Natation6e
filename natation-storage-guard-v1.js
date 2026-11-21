/* Protection hors ligne du stockage des classes, exécutée avant le code de l'application.
 * Aucune donnée nominative ne quitte l'appareil.
 */
(function () {
  'use strict';
  const PRIMARY = 'natation-6e:data:v2';
  const LEGACY = 'natation-6e:data:v1';
  const RECOVERY = 'natation-6e:recovery:last-valid-v2';
  const MINIMUM = (raw) => {
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.classes) ||
          !data.classes.every(c => c && Array.isArray(c.students))) return null;
      return {raw, count: data.classes.reduce((sum, c) => sum + c.students.length, 0)};
    } catch { return null; }
  };
  function download(name, raw) {
    const blob = new Blob([raw], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = name; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 120000);
  }
  function panel(title, message, actions) {
    const overlay = document.createElement('section');
    overlay.setAttribute('role','alertdialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label',title);
    overlay.style.cssText = 'position:fixed;inset:0;background:#071f3b;color:white;display:grid;place-items:center;z-index:2147483647;padding:24px;font-family:system-ui,sans-serif;overflow:auto';
    const card = document.createElement('div');
    card.style.cssText = 'width:min(560px,100%);padding:26px;border-radius:18px;background:#143451;box-shadow:0 20px 60px #0005;line-height:1.5';
    const heading = document.createElement('h1');heading.textContent = title;
    const text = document.createElement('p');text.textContent = message;
    const note = document.createElement('p');
    note.textContent = 'Attention : les fichiers exportés peuvent contenir des données personnelles d’élèves. Conservez-les dans un espace autorisé par votre établissement.';
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px';
    for(const {label,action} of actions){
      const button=document.createElement('button');button.type='button';
      button.textContent=label;button.style.cssText='font:inherit;font-weight:700;padding:11px 16px;background:#eaf5ff;color:#10253e;border:0;border-radius:10px;cursor:pointer';
      button.addEventListener('click', action);controls.append(button);
    }
    card.append(heading,text,note,controls);overlay.append(card);document.body.append(overlay);
    return () => overlay.remove();
  }
  function beforeStart(start) {
    let raw, legacy, last;
    try {
      raw = localStorage.getItem(PRIMARY);
      legacy = localStorage.getItem(LEGACY);
      last = localStorage.getItem(RECOVERY);
    } catch {
      panel('Stockage indisponible','L’accès aux données de natation a échoué. Pour protéger vos évaluations, l’application ne démarre pas. Vérifiez les réglages de stockage puis réessayez.',[
        {label:'Réessayer', action:()=>window.location.reload()}
      ]);
      return;
    }
    const current = MINIMUM(raw);
    const previous = MINIMUM(last);
    // Une sauvegarde locale supplémentaire est créée AVANT l'initialisation.
    // Une version future qui démarre à vide ne peut donc pas écraser cette copie.
    if(current && current.count > 0){
      try {localStorage.setItem(RECOVERY,raw);} catch {
        panel('Sauvegarde de sécurité impossible','Le navigateur refuse de créer la copie de sécurité préalable. Exportez les données avant de poursuivre.',[
          {label:'Exporter les classes',action:()=>download('Natation6e_securite.json',raw)},
          {label:'Continuer sans copie',action:()=>{document.querySelector('[aria-label="Sauvegarde de sécurité impossible"]')?.remove();start()}}
        ]);
        return;
      }
      start();
      return;
    }
    // Le format v1 peut être migré normalement par l'application ; ne pas le
    // recopier directement en v2 car les indices des évaluations ont changé.
    if(raw === null && MINIMUM(legacy)?.count && !previous){start();return;}
    const hasUnusablePrimary = raw !== null && !current;
    const possibleLoss = previous && previous.count > 0 &&
      (!current || current.count === 0);
    if(hasUnusablePrimary || possibleLoss){
      let close=()=>{};
      const actions=[];
      if(possibleLoss) actions.push({label:'Restaurer mes classes', action:()=>{
        try {localStorage.setItem(PRIMARY,previous.raw);close();start();}
        catch {window.alert('Restauration impossible. Exportez la copie de secours.');}
      }});
      if(raw !== null) actions.push({label:'Exporter les données actuelles',action:()=>download('Natation6e_donnees_actuelles.json',raw)});
      if(previous) actions.push({label:'Exporter la copie de secours',action:()=>download('Natation6e_copie_secours.json',previous.raw)});
      if(!hasUnusablePrimary) actions.push({label:'Continuer avec les données actuelles',action:()=>{close();start()}});
      close=panel('Vérification de vos classes','Les données enregistrées ne correspondent pas à la dernière copie de secours. Aucune donnée n’a été supprimée. Choisissez la restauration ou exportez une copie avant de poursuivre.',actions);
      return;
    }
    start();
  }
  window.NatationStorageGuard = {beforeStart};
})();
