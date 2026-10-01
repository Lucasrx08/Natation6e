(() => {
  'use strict';

  const STORAGE_KEY = 'natation-6e:data:v14';
  const LEGACY_KEYS = ['natation-6e:data:v2', 'natation-6e:data:v1'];
  const APP_VERSION = '14.0.0';

  const STAGES = [
    { id: 1, short: 'Chute arrière', label: 'Entrer en chute arrière', detail: 'Dos à l’eau, dans l’axe', criterion: 'entry', image: './action-01-chute.png' },
    { id: 2, short: 'Obstacle aller', label: 'Franchir l’obstacle', detail: '1,5 m en immersion complète', criterion: 'immersion', image: './action-03-obstacle.png' },
    { id: 3, short: 'Nage ventrale', label: 'Se déplacer sur le ventre', detail: '15 m sans appui', criterion: 'frontstroke', image: './action-04-ventrale.png' },
    { id: 4, short: 'Surplace', label: 'Réaliser un surplace vertical', detail: '15 s puis poursuivre', criterion: 'floating', image: './action-05-surplace.png' },
    { id: 5, short: 'Demi-tour', label: 'Réaliser un demi-tour', detail: 'Changer de sens sans reprise d’appui', criterion: 'turn', image: './action-06-demitour.svg' },
    { id: 6, short: 'Nage dorsale', label: 'Se déplacer sur le dos', detail: '20 m sans appui', criterion: 'backstroke', image: './action-07-dorsale.png' },
    { id: 7, short: 'Flottaison dos', label: 'Se maintenir à l’horizontale', detail: '15 s, voies respiratoires émergées', criterion: 'floating', image: './action-08-flottaison.png' },
    { id: 8, short: 'Obstacle retour', label: 'Franchir à nouveau l’obstacle', detail: 'Immersion complète', criterion: 'immersion', image: './action-09-obstacle-retour.png' },
    { id: 9, short: 'Ancrage', label: 'S’ancrer en sécurité', detail: 'Pouvoir attendre les secours', criterion: 'floating', image: './action-11-ancrage.png' },
  ];

  const CRITERIA = [
    { id: 'entry', label: 'Entrée dans l’eau', short: 'Entrée' },
    { id: 'floating', label: 'Flottaisons', short: 'Flottaison' },
    { id: 'backstroke', label: 'Nage dorsale', short: 'Dos' },
    { id: 'frontstroke', label: 'Nage ventrale', short: 'Ventre' },
    { id: 'immersion', label: 'Immersions', short: 'Immersion' },
    { id: 'turn', label: 'Demi-tour', short: 'Demi-tour' },
  ];

  const LEVELS = {
    unassessed: { label: 'À évaluer', compact: '—', score: 0 },
    mastered: { label: 'Acquis', compact: 'A', score: 2 },
    fragile: { label: 'À consolider', compact: 'C', score: 1 },
    failed: { label: 'Non acquis', compact: 'N', score: 0 },
  };

  const LEARNING_MODULES = [
    {
      id: 'entry',
      title: 'Entrée dans l’eau',
      icon: '↘',
      intro: 'Entrer dans l’eau de différentes façons en restant relâché et en contrôlant sa respiration.',
      workshops: [
        { id: 'entry-1', level: 1, title: 'Je me laisse glisser', instruction: 'Assis au bord, entre dans l’eau sans te retenir avec les mains puis remonte calmement.' },
        { id: 'entry-2', level: 2, title: 'Je saute droit', instruction: 'Saute en grande profondeur, corps gainé, puis reviens à la surface sans t’accrocher au bord.' },
        { id: 'entry-3', level: 3, title: 'Je chute en arrière', instruction: 'Dos à l’eau, laisse-toi tomber en arrière sans tourner la tête ni chercher le bord.' },
      ],
    },
    {
      id: 'immersion',
      title: 'Immersion',
      icon: '◉',
      intro: 'Mettre la tête sous l’eau, souffler et se déplacer sous un obstacle sans précipitation.',
      workshops: [
        { id: 'immersion-1', level: 1, title: 'Je souffle sous l’eau', instruction: 'Mets entièrement le visage dans l’eau et réalise une expiration longue et continue.' },
        { id: 'immersion-2', level: 2, title: 'Je vais chercher un objet', instruction: 'Descends récupérer un objet au fond et remonte sans t’aider du mur.' },
        { id: 'immersion-3', level: 3, title: 'Je passe sous un obstacle', instruction: 'Passe entièrement sous une frite ou une ligne d’eau sans toucher l’obstacle.' },
        { id: 'immersion-4', level: 4, title: 'Je franchis 1,5 m', instruction: 'Réalise le franchissement complet de l’obstacle sur environ 1,5 m en immersion.' },
      ],
    },
    {
      id: 'floating',
      title: 'Flottaison',
      icon: '≈',
      intro: 'Trouver un équilibre stable, relâché et respirable sur le ventre, sur le dos et à la verticale.',
      workshops: [
        { id: 'floating-1', level: 1, title: 'Étoile ventrale', instruction: 'Allonge-toi à plat ventre, bras et jambes écartés, visage dans l’eau, sans bouger.' },
        { id: 'floating-2', level: 2, title: 'Étoile dorsale', instruction: 'Allonge-toi sur le dos, oreilles dans l’eau, bassin haut et regard vers le plafond.' },
        { id: 'floating-3', level: 3, title: 'Surplace vertical', instruction: 'Reste 15 secondes à la verticale sans toucher le fond ni le bord.' },
        { id: 'floating-4', level: 4, title: 'J’enchaîne', instruction: 'Passe d’une flottaison à l’autre puis repars en nage sans reprise d’appui.' },
      ],
    },
  ];

  const DEMO_NAMES = ['ALBERT Zoé', 'BERNARD Hugo', 'COLIN Inès', 'DUBOIS Jules', 'FAURE Lina', 'GARNIER Malo', 'HENRY Maya', 'LEGRAND Adam', 'MARTIN Lou', 'MOREAU Noah', 'PETIT Rose', 'ROBERT Sacha'];

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const uid = (prefix) => `${prefix}-${crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
  const normalizeText = (value) => String(value ?? '').trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const sortStudents = (students) => [...students].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  function titleCaseFirstname(value) {
    const lower = String(value ?? '').trim().toLocaleLowerCase('fr');
    return lower.replace(/(^|[-'’\s])([a-zà-ÿ])/g, (_, sep, letter) => `${sep}${letter.toLocaleUpperCase('fr')}`);
  }

  function splitName(name) {
    const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return { surname: '', givenName: '' };
    return { surname: parts[0].toLocaleUpperCase('fr'), givenName: titleCaseFirstname(parts.slice(1).join(' ')) };
  }

  function formatFullName(name) {
    const { surname, givenName } = splitName(name);
    return [surname, givenName].filter(Boolean).join(' ');
  }

  function blankAssessments(value = 'mastered') {
    return Object.fromEntries(STAGES.map((stage) => [stage.id, value]));
  }

  function blankLearning() {
    const all = {};
    LEARNING_MODULES.forEach((module) => module.workshops.forEach((workshop) => { all[workshop.id] = 'todo'; }));
    return all;
  }

  function createStudent(name, assessments = blankAssessments()) {
    return { id: uid('student'), name: formatFullName(name), assessments, manualGroup: null, learning: blankLearning() };
  }

  function demoData() {
    const students = DEMO_NAMES.map((name, index) => {
      const assessments = blankAssessments();
      if (index === 4) assessments[4] = 'fragile';
      if (index === 5) assessments[2] = 'fragile';
      if (index === 6) assessments[3] = 'fragile';
      if (index === 8) assessments[1] = 'failed';
      if (index === 9) assessments[2] = 'failed';
      if (index === 10) assessments[6] = 'failed';
      assessments[5] = index % 4 === 0 ? 'unassessed' : 'mastered';
      return { id: `demo-${index + 1}`, name, assessments, manualGroup: null, learning: blankLearning() };
    });
    return { classes: [{ id: 'demo-6e', name: '6e Démo', demo: true, students }], activeClassId: 'demo-6e', tab: 'classes', laneStudents: ['demo-1', 'demo-2'], learningStudentId: 'demo-1' };
  }

  function migrateLegacyStudent(student) {
    const old = student.assessments || {};
    const map = { 1: 1, 2: 3, 3: 4, 4: 5, 6: 6, 7: 7, 8: 8, 9: 10 };
    const assessments = blankAssessments('unassessed');
    Object.entries(map).forEach(([newId, oldId]) => { assessments[newId] = ['mastered', 'fragile', 'failed', 'unassessed'].includes(old[oldId]) ? old[oldId] : 'mastered'; });
    assessments[5] = 'unassessed';
    return {
      id: student.id || uid('student'),
      name: formatFullName(student.name),
      assessments,
      manualGroup: Number(student.manualGroup) >= 1 && Number(student.manualGroup) <= 3 ? Number(student.manualGroup) : null,
      learning: { ...blankLearning(), ...(student.learning || {}) },
    };
  }

  function migrateClass(classItem) {
    return { id: classItem.id || uid('class'), name: classItem.name || 'Classe', demo: !!classItem.demo, students: sortStudents((classItem.students || []).map(migrateLegacyStudent)) };
  }

  function loadState() {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current) return sanitizeState(JSON.parse(current));
      for (const key of LEGACY_KEYS) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.classes)) {
          const classes = parsed.classes.map(migrateClass);
          return sanitizeState({ classes, activeClassId: parsed.activeClassId || classes[0]?.id, tab: 'classes', laneStudents: [classes[0]?.students[0]?.id || '', classes[0]?.students[1]?.id || ''], learningStudentId: classes[0]?.students[0]?.id || '' });
        }
      }
    } catch (error) {
      console.warn('Lecture des données impossible', error);
    }
    return demoData();
  }

  function sanitizeState(input) {
    const classes = Array.isArray(input.classes) ? input.classes.map((classItem) => ({
      ...classItem,
      students: sortStudents((classItem.students || []).map((student) => ({
        ...student,
        name: formatFullName(student.name),
        assessments: { ...blankAssessments('unassessed'), ...(student.assessments || {}) },
        manualGroup: Number(student.manualGroup) >= 1 && Number(student.manualGroup) <= 3 ? Number(student.manualGroup) : null,
        learning: { ...blankLearning(), ...(student.learning || {}) },
      }))),
    })) : [];
    const fallback = classes[0]?.id || '';
    const activeClassId = classes.some((item) => item.id === input.activeClassId) ? input.activeClassId : fallback;
    const active = classes.find((item) => item.id === activeClassId);
    return {
      classes,
      activeClassId,
      tab: ['classes', 'test', 'learning', 'summary'].includes(input.tab) ? input.tab : 'classes',
      laneStudents: Array.isArray(input.laneStudents) ? input.laneStudents.slice(0, 2) : [active?.students[0]?.id || '', active?.students[1]?.id || ''],
      learningStudentId: active?.students.some((student) => student.id === input.learningStudentId) ? input.learningStudentId : active?.students[0]?.id || '',
    };
  }

  let state = loadState();
  let search = '';
  let activeLearningModule = 'entry';
  let toastTimer = null;

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function activeClass() {
    return state.classes.find((item) => item.id === state.activeClassId) || state.classes[0] || null;
  }

  function updateActiveClass(updater) {
    const current = activeClass();
    if (!current) return;
    state.classes = state.classes.map((item) => item.id === current.id ? updater(item) : item);
    saveState();
  }

  function updateStudent(studentId, updater) {
    updateActiveClass((classItem) => ({ ...classItem, demo: false, students: sortStudents(classItem.students.map((student) => student.id === studentId ? updater(student) : student)) }));
  }

  function completed(student) {
    return STAGES.every((stage) => student.assessments[stage.id] !== 'unassessed');
  }

  function failed(student) {
    return STAGES.some((stage) => student.assessments[stage.id] === 'failed');
  }

  function score(student) {
    return STAGES.reduce((total, stage) => total + (LEVELS[student.assessments[stage.id]]?.score || 0), 0);
  }

  function criterionStatus(student, criterion) {
    const statuses = STAGES.filter((stage) => stage.criterion === criterion).map((stage) => student.assessments[stage.id]);
    if (!statuses.length || statuses.every((value) => value === 'unassessed')) return 'unassessed';
    if (statuses.some((value) => value === 'failed')) return 'failed';
    if (statuses.some((value) => value === 'unassessed')) return 'unassessed';
    if (statuses.every((value) => value === 'mastered')) return 'mastered';
    return 'fragile';
  }

  function criterionLevel(student, criterion) {
    const status = criterionStatus(student, criterion);
    return status === 'failed' || status === 'unassessed' ? 1 : status === 'fragile' ? 2 : 3;
  }

  function automaticGroups(students) {
    const assessed = students.filter(completed);
    const group1 = assessed.filter(failed).sort((a, b) => score(a) - score(b));
    const green = assessed.filter((student) => !failed(student) && STAGES.every((stage) => student.assessments[stage.id] === 'mastered')).sort((a, b) => score(b) - score(a));
    const middle = assessed.filter((student) => !group1.includes(student) && !green.includes(student)).sort((a, b) => score(a) - score(b));
    const target1 = Math.ceil(assessed.length / 3);
    const target3 = Math.floor(assessed.length / 3);
    while (group1.length < target1 && middle.length) group1.push(middle.shift());
    while (green.length < target3 && middle.length) green.unshift(middle.pop());
    return { 1: group1, 2: middle, 3: green, incomplete: students.filter((student) => !completed(student)) };
  }

  function groupsWithManual(students) {
    const auto = automaticGroups(students);
    const result = { 1: [], 2: [], 3: [], incomplete: auto.incomplete };
    const autoMap = new Map();
    [1, 2, 3].forEach((number) => auto[number].forEach((student) => autoMap.set(student.id, number)));
    students.filter(completed).forEach((student) => {
      const groupNumber = student.manualGroup || autoMap.get(student.id) || 2;
      result[groupNumber].push(student);
    });
    [1, 2, 3].forEach((number) => result[number].sort((a, b) => a.name.localeCompare(b.name, 'fr')));
    return result;
  }

  function toast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  function render() {
    const root = document.getElementById('app');
    if (!root) return;
    const current = activeClass();
    root.innerHTML = `
      <header class="app-header">
        <button class="brand" data-tab="classes" aria-label="Retour aux classes"><span class="brand-mark">≈</span><span><strong>NATATION <em>6e</em></strong><small>Cycle savoir nager</small></span></button>
        <nav class="main-tabs" aria-label="Navigation principale">
          ${tabButton('classes', '👥', 'Classes')}
          ${tabButton('test', '≈', 'Savoir-nager')}
          ${tabButton('learning', '◎', 'Apprentissage')}
          ${tabButton('summary', '▥', 'Résumé')}
        </nav>
        <div class="save-status"><span class="save-dot"></span><span><strong>Enregistré</strong><small>sur cet appareil</small></span></div>
      </header>
      <main class="app-content">
        ${state.tab === 'classes' ? renderClasses(current) : ''}
        ${state.tab === 'test' ? renderTest(current) : ''}
        ${state.tab === 'learning' ? renderLearning(current) : ''}
        ${state.tab === 'summary' ? renderSummary(current) : ''}
      </main>
      <footer class="app-footer"><span>Application EPS · Le Bon Sauveur</span><span>v${APP_VERSION}</span></footer>
      <div id="toast" class="toast" role="status"></div>
    `;
    bindGlobalEvents();
  }

  function tabButton(id, icon, label) {
    return `<button class="${state.tab === id ? 'active' : ''}" data-tab="${id}"><span class="tab-icon">${icon}</span><span>${label}</span></button>`;
  }

  function renderClasses(current) {
    const students = current?.students || [];
    const filtered = students.filter((student) => normalizeText(student.name).includes(normalizeText(search)));
    return `
      <section class="hero panel navy-hero">
        <div><span class="eyebrow light">Vestiaire enseignant</span><h1>${escapeHtml(current?.name || 'Aucune classe')}</h1><p>Importez la classe, préparez vos élèves puis utilisez le diagnostic, les ateliers et les groupes depuis la même application.</p></div>
        <div class="hero-count"><strong>${students.length}</strong><span>nageurs</span></div>
      </section>
      <section class="class-switcher panel">
        <div class="section-heading"><div><span class="eyebrow">Mes classes</span><h2>Choisir une classe</h2></div><button class="btn secondary" data-action="new-class">+ Nouvelle classe</button></div>
        <div class="class-pills">${state.classes.map((item) => `<button class="class-pill ${item.id === current?.id ? 'active' : ''}" data-class-id="${item.id}"><strong>${escapeHtml(item.name)}</strong><small>${item.students.length} élèves</small></button>`).join('')}</div>
      </section>
      <section class="panel roster-panel">
        <div class="section-heading"><div><span class="eyebrow">Feuille de départ</span><h2>Élèves de ${escapeHtml(current?.name || '')}</h2></div><div class="heading-actions"><label class="btn secondary file-btn">Importer CSV / Excel<input id="class-import" type="file" accept=".csv,.tsv,.txt,.xls,.xlsx" /></label><button class="btn primary" data-action="new-student">+ Ajouter un élève</button></div></div>
        <div class="student-toolbar"><input id="student-search" type="search" placeholder="Rechercher un élève" value="${escapeHtml(search)}" /><button class="btn aqua" data-tab="test">Aller au bassin</button></div>
        <div class="student-cards">
          ${filtered.map((student) => {
            const done = completed(student); const isFailed = failed(student);
            return `<article class="student-row">
              <div class="student-name-wrap"><span class="avatar">${initials(student.name)}</span><strong class="full-name">${escapeHtml(student.name)}</strong></div>
              <div class="progress-dots">${STAGES.map((stage) => `<i class="${student.assessments[stage.id]}"></i>`).join('')}</div>
              <span class="result-chip ${done ? (isFailed ? 'failed' : 'passed') : 'pending'}">${done ? (isFailed ? 'Non validé' : 'Validé') : 'À terminer'}</span>
              <button class="icon-btn danger" data-remove-student="${student.id}" aria-label="Supprimer ${escapeHtml(student.name)}">×</button>
            </article>`;
          }).join('') || '<div class="empty-state">Aucun élève à afficher.</div>'}
        </div>
      </section>
    `;
  }

  function renderTest(current) {
    const students = current?.students || [];
    return `
      <section class="hero panel aqua-hero"><div><span class="eyebrow light">Évaluation diagnostique</span><h1>Le parcours en direct</h1><p>Approche et retour ventral ont été supprimés. Le demi-tour est désormais évalué comme une étape à part entière.</p></div><span class="class-badge">${escapeHtml(current?.name || '')}</span></section>
      <div class="orientation-note">Pour le meilleur confort au bord du bassin, utilisez l’iPad en paysage.</div>
      <section class="lanes-grid">${[0, 1].map((lane) => renderLane(lane, students)).join('')}</section>
    `;
  }

  function renderLane(index, students) {
    const selectedId = state.laneStudents[index] || '';
    const student = students.find((item) => item.id === selectedId);
    const acquired = student ? STAGES.filter((stage) => student.assessments[stage.id] === 'mastered').length : 0;
    return `<article class="lane panel">
      <div class="lane-head"><div><span class="eyebrow">Ligne d’eau ${index + 1}</span><select class="lane-select" data-lane="${index}"><option value="">Choisir un élève</option>${students.map((item) => `<option value="${item.id}" ${item.id === selectedId ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></div><div class="lane-score"><strong>${acquired}/${STAGES.length}</strong><span>acquis</span></div></div>
      <div class="pool-track">
        ${STAGES.map((stage) => {
          const status = student?.assessments?.[stage.id] || 'unassessed';
          return `<button class="stage ${status}" data-stage="${stage.id}" data-student="${student?.id || ''}" ${student ? '' : 'disabled'}>
            <img src="${stage.image}" alt="" draggable="false" />
            <span class="stage-number">${stage.id}</span>
            <strong>${escapeHtml(stage.short)}</strong>
            <small>${escapeHtml(stage.detail)}</small>
            <em>${LEVELS[status].label}</em>
          </button>`;
        }).join('')}
      </div>
      <div class="lane-actions"><button class="btn secondary" data-reset-student="${student?.id || ''}" ${student ? '' : 'disabled'}>Tout remettre en vert</button><span class="legend"><i class="mastered"></i> Acquis <i class="fragile"></i> À consolider <i class="failed"></i> Non acquis <i class="unassessed"></i> À évaluer</span></div>
    </article>`;
  }

  function renderLearning(current) {
    const students = current?.students || [];
    const student = students.find((item) => item.id === state.learningStudentId) || students[0];
    const module = LEARNING_MODULES.find((item) => item.id === activeLearningModule) || LEARNING_MODULES[0];
    return `
      <section class="hero panel learning-hero"><div><span class="eyebrow light">Apprentissage autonome</span><h1>Mes ateliers</h1><p>L’élève choisit son profil, lit la consigne, s’entraîne puis demande une validation à l’enseignant.</p></div><div class="learning-student-picker"><label>Élève<select id="learning-student">${students.map((item) => `<option value="${item.id}" ${item.id === student?.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></label></div></section>
      ${!student ? '<section class="panel empty-state">Ajoutez des élèves pour utiliser les ateliers.</section>' : `
      <section class="module-tabs panel">${LEARNING_MODULES.map((item) => `<button class="module-tab ${item.id === module.id ? 'active' : ''}" data-learning-module="${item.id}"><span>${item.icon}</span><strong>${item.title}</strong></button>`).join('')}</section>
      <section class="panel workshop-panel">
        <div class="section-heading"><div><span class="eyebrow">${escapeHtml(student.name)}</span><h2>${module.title}</h2><p>${module.intro}</p></div><div class="module-progress">${module.workshops.filter((workshop) => student.learning[workshop.id] === 'validated').length}/${module.workshops.length}<small>validés</small></div></div>
        <div class="workshop-grid">
          ${module.workshops.map((workshop) => renderWorkshop(student, workshop)).join('')}
        </div>
      </section>`}
    `;
  }

  function renderWorkshop(student, workshop) {
    const status = student.learning[workshop.id] || 'todo';
    const labels = { todo: 'À découvrir', training: 'En entraînement', requested: 'Validation demandée', validated: 'Validé', retry: 'À retravailler' };
    return `<article class="workshop-card ${status}">
      <div class="workshop-level">Niveau ${workshop.level}</div>
      <h3>${escapeHtml(workshop.title)}</h3>
      <p>${escapeHtml(workshop.instruction)}</p>
      <span class="learning-status ${status}">${labels[status]}</span>
      <div class="workshop-actions">
        ${status === 'todo' || status === 'retry' ? `<button class="btn secondary" data-learning-action="training" data-workshop="${workshop.id}" data-student="${student.id}">Je m’entraîne</button>` : ''}
        ${status === 'training' ? `<button class="btn aqua" data-learning-action="requested" data-workshop="${workshop.id}" data-student="${student.id}">Demander la validation</button>` : ''}
        ${status === 'requested' ? `<button class="btn success" data-learning-action="validated" data-workshop="${workshop.id}" data-student="${student.id}">Prof : valider</button><button class="btn secondary" data-learning-action="retry" data-workshop="${workshop.id}" data-student="${student.id}">À retravailler</button>` : ''}
        ${status === 'validated' ? `<button class="btn secondary" data-learning-action="training" data-workshop="${workshop.id}" data-student="${student.id}">Recommencer</button>` : ''}
      </div>
    </article>`;
  }

  function renderSummary(current) {
    const students = current?.students || [];
    const groups = groupsWithManual(students);
    const assessed = students.filter(completed);
    const validated = assessed.filter((student) => !failed(student));
    return `
      <section class="hero panel summary-hero"><div><span class="eyebrow light">Synthèse diagnostique</span><h1>${escapeHtml(current?.name || '')}</h1><p>La répartition reste automatique, mais chaque élève peut maintenant être déplacé manuellement. Les modifications sont mémorisées.</p></div><div class="hero-count"><strong>${students.length ? Math.round(validated.length / students.length * 100) : 0}%</strong><span>ASNS validé</span></div></section>
      <section class="stats-grid"><article><strong>${students.length}</strong><span>élèves</span></article><article><strong>${validated.length}</strong><span>validés</span></article><article><strong>${assessed.length - validated.length}</strong><span>non validés</span></article><article><strong>${groups.incomplete.length}</strong><span>à terminer</span></article></section>
      <section class="panel export-panel">
        <div class="section-heading"><div><span class="eyebrow">Exports iDoceo</span><h2>Exporter la classe ou uniquement un groupe</h2><p>Le nom et le prénom sont regroupés dans une seule colonne au format « NOM Prénom ».</p></div></div>
        <div class="export-buttons"><button class="btn primary" data-export="all">Toute la classe</button><button class="btn group-red" data-export="1">Groupe 1</button><button class="btn group-orange" data-export="2">Groupe 2</button><button class="btn group-green" data-export="3">Groupe 3</button></div>
      </section>
      <section class="panel criteria-panel">
        <div class="section-heading"><div><span class="eyebrow">Lecture par compétence</span><h2>Les 6 critères du diagnostic</h2></div></div>
        <div class="criteria-grid">${CRITERIA.map((criterion) => {
          const statuses = assessed.map((student) => criterionStatus(student, criterion.id));
          const ok = statuses.filter((status) => status === 'mastered' || status === 'fragile').length;
          const rate = statuses.length ? Math.round(ok / statuses.length * 100) : 0;
          return `<article><strong>${rate}%</strong><span>${criterion.label}</span><small>${ok}/${statuses.length} réussites</small></article>`;
        }).join('')}</div>
      </section>
      <section class="groups-wrap">
        ${[1, 2, 3].map((number) => renderGroup(number, groups[number])).join('')}
      </section>
      ${groups.incomplete.length ? `<section class="panel incomplete-panel"><div class="section-heading"><div><span class="eyebrow">À terminer</span><h2>${groups.incomplete.length} élève(s) sans diagnostic complet</h2></div></div><div class="name-list">${groups.incomplete.map((student) => `<span>${escapeHtml(student.name)}</span>`).join('')}</div></section>` : ''}
    `;
  }

  function renderGroup(number, students) {
    const meta = {
      1: { title: 'Prioritaire', subtitle: 'Élèves les plus en difficulté', tone: 'red' },
      2: { title: 'Consolidation', subtitle: 'Acquis à stabiliser', tone: 'orange' },
      3: { title: 'Maîtrise', subtitle: 'Parcours très solide', tone: 'green' },
    }[number];
    return `<section class="panel group-card ${meta.tone}" data-group-drop="${number}">
      <div class="group-card-head"><div><span class="group-number">G${number}</span><h2>${meta.title}</h2><p>${meta.subtitle}</p></div><span class="group-count">${students.length} élève${students.length > 1 ? 's' : ''}</span></div>
      <div class="group-students">${students.length ? students.map((student) => `<article class="group-student" draggable="true" data-drag-student="${student.id}"><div><span class="avatar small">${initials(student.name)}</span><strong class="full-name">${escapeHtml(student.name)}</strong></div><select data-manual-group="${student.id}" aria-label="Changer ${escapeHtml(student.name)} de groupe"><option value="auto" ${!student.manualGroup ? 'selected' : ''}>Auto</option><option value="1" ${student.manualGroup === 1 ? 'selected' : ''}>Groupe 1</option><option value="2" ${student.manualGroup === 2 ? 'selected' : ''}>Groupe 2</option><option value="3" ${student.manualGroup === 3 ? 'selected' : ''}>Groupe 3</option></select></article>`).join('') : '<div class="empty-group">Aucun élève</div>'}</div>
      <button class="btn secondary group-export-inline" data-export="${number}">Exporter uniquement G${number}</button>
    </section>`;
  }

  function bindGlobalEvents() {
    document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => { state.tab = button.dataset.tab; saveState(); render(); }));
    document.querySelectorAll('[data-class-id]').forEach((button) => button.addEventListener('click', () => {
      state.activeClassId = button.dataset.classId;
      const current = activeClass();
      state.laneStudents = [current?.students[0]?.id || '', current?.students[1]?.id || ''];
      state.learningStudentId = current?.students[0]?.id || '';
      saveState(); render();
    }));

    document.querySelector('[data-action="new-class"]')?.addEventListener('click', () => {
      const name = prompt('Nom de la classe (ex. 6e Avignon) :');
      if (!name?.trim()) return;
      const classItem = { id: uid('class'), name: name.trim(), demo: false, students: [] };
      state.classes.push(classItem); state.activeClassId = classItem.id; state.laneStudents = ['', '']; state.learningStudentId = ''; saveState(); render(); toast(`${classItem.name} créée.`);
    });

    document.querySelector('[data-action="new-student"]')?.addEventListener('click', () => {
      const current = activeClass(); if (!current) return;
      const name = prompt('Nom et prénom de l’élève :');
      if (!name?.trim()) return;
      const student = createStudent(name);
      updateActiveClass((classItem) => ({ ...classItem, demo: false, students: sortStudents([...classItem.students, student]) }));
      if (!state.learningStudentId) state.learningStudentId = student.id;
      saveState(); render(); toast(`${student.name} ajouté.`);
    });

    document.getElementById('student-search')?.addEventListener('input', (event) => { search = event.target.value; render(); const input = document.getElementById('student-search'); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } });
    document.getElementById('class-import')?.addEventListener('change', handleImport);
    document.querySelectorAll('[data-remove-student]').forEach((button) => button.addEventListener('click', () => removeStudent(button.dataset.removeStudent)));
    document.querySelectorAll('[data-lane]').forEach((select) => select.addEventListener('change', () => { state.laneStudents[Number(select.dataset.lane)] = select.value; saveState(); render(); }));
    document.querySelectorAll('[data-stage]').forEach((button) => button.addEventListener('click', () => cycleStage(button.dataset.student, Number(button.dataset.stage))));
    document.querySelectorAll('[data-reset-student]').forEach((button) => button.addEventListener('click', () => resetStudent(button.dataset.resetStudent)));
    document.getElementById('learning-student')?.addEventListener('change', (event) => { state.learningStudentId = event.target.value; saveState(); render(); });
    document.querySelectorAll('[data-learning-module]').forEach((button) => button.addEventListener('click', () => { activeLearningModule = button.dataset.learningModule; render(); }));
    document.querySelectorAll('[data-learning-action]').forEach((button) => button.addEventListener('click', () => setLearningStatus(button.dataset.student, button.dataset.workshop, button.dataset.learningAction)));
    document.querySelectorAll('[data-manual-group]').forEach((select) => select.addEventListener('change', () => moveStudentToGroup(select.dataset.manualGroup, select.value)));
    document.querySelectorAll('[data-export]').forEach((button) => button.addEventListener('click', () => exportIDoceo(button.dataset.export)));
    bindDragAndDrop();
  }

  function removeStudent(id) {
    const current = activeClass(); const student = current?.students.find((item) => item.id === id); if (!student) return;
    if (!confirm(`Supprimer ${student.name} et toutes ses données ?`)) return;
    updateActiveClass((classItem) => ({ ...classItem, students: classItem.students.filter((item) => item.id !== id) }));
    state.laneStudents = state.laneStudents.map((value) => value === id ? '' : value);
    if (state.learningStudentId === id) state.learningStudentId = activeClass()?.students[0]?.id || '';
    saveState(); render();
  }

  function cycleStage(studentId, stageId) {
    if (!studentId) return;
    const order = ['mastered', 'fragile', 'failed', 'unassessed'];
    updateStudent(studentId, (student) => {
      const current = student.assessments[stageId] || 'unassessed';
      const next = order[(order.indexOf(current) + 1) % order.length];
      return { ...student, assessments: { ...student.assessments, [stageId]: next } };
    });
    render();
  }

  function resetStudent(studentId) {
    if (!studentId) return;
    updateStudent(studentId, (student) => ({ ...student, assessments: blankAssessments('mastered') }));
    render(); toast('Parcours remis en vert.');
  }

  function setLearningStatus(studentId, workshopId, status) {
    updateStudent(studentId, (student) => ({ ...student, learning: { ...student.learning, [workshopId]: status } }));
    render();
    if (status === 'requested') toast('Demande de validation enregistrée.');
    if (status === 'validated') toast('Atelier validé.');
  }

  function moveStudentToGroup(studentId, groupValue) {
    updateStudent(studentId, (student) => ({ ...student, manualGroup: groupValue === 'auto' ? null : Number(groupValue) }));
    render(); toast(groupValue === 'auto' ? 'Répartition automatique rétablie.' : `Élève déplacé vers le groupe ${groupValue}.`);
  }

  function bindDragAndDrop() {
    let draggedId = '';
    document.querySelectorAll('[data-drag-student]').forEach((item) => {
      item.addEventListener('dragstart', () => { draggedId = item.dataset.dragStudent; item.classList.add('dragging'); });
      item.addEventListener('dragend', () => item.classList.remove('dragging'));
    });
    document.querySelectorAll('[data-group-drop]').forEach((group) => {
      group.addEventListener('dragover', (event) => { event.preventDefault(); group.classList.add('drop-ready'); });
      group.addEventListener('dragleave', () => group.classList.remove('drop-ready'));
      group.addEventListener('drop', (event) => { event.preventDefault(); group.classList.remove('drop-ready'); if (draggedId) moveStudentToGroup(draggedId, group.dataset.groupDrop); draggedId = ''; });
    });
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      let rows = [];
      const extension = file.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls'].includes(extension)) {
        if (!window.XLSX) throw new Error('xlsx-library');
        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
      } else {
        const text = await file.text();
        const separator = text.includes('\t') ? '\t' : text.includes(';') ? ';' : ',';
        rows = text.split(/\r?\n/).map((line) => line.split(separator).map((cell) => cell.replace(/^"|"$/g, '').trim()));
      }
      const names = extractNames(rows);
      if (!names.length) throw new Error('empty');
      const current = activeClass();
      if (!current || current.demo) {
        const className = file.name.replace(/\.(csv|tsv|txt|xlsx?|xls)$/i, '') || 'Nouvelle classe';
        const classItem = { id: uid('class'), name: className, demo: false, students: sortStudents(names.map((name) => createStudent(name))) };
        state.classes = current?.demo ? [...state.classes.filter((item) => item.id !== current.id), classItem] : [...state.classes, classItem];
        state.activeClassId = classItem.id;
        state.laneStudents = [classItem.students[0]?.id || '', classItem.students[1]?.id || ''];
        state.learningStudentId = classItem.students[0]?.id || '';
      } else {
        const existing = new Set(current.students.map((student) => normalizeText(student.name)));
        const added = names.filter((name) => !existing.has(normalizeText(name))).map((name) => createStudent(name));
        updateActiveClass((classItem) => ({ ...classItem, students: sortStudents([...classItem.students, ...added]) }));
      }
      saveState(); render(); toast(`${names.length} élève${names.length > 1 ? 's' : ''} lu${names.length > 1 ? 's' : ''} dans le fichier.`);
    } catch (error) {
      console.error(error); toast('Import impossible : utilisez un CSV ou Excel avec Nom et Prénom.');
    }
  }

  function extractNames(rows) {
    const table = rows.map((row) => row.map((cell) => String(cell ?? '').trim()));
    const headerIndex = table.slice(0, 10).findIndex((row) => row.some((cell) => ['nom', 'prenom', 'prénom', 'eleve', 'élève', 'nom prenom', 'nom prénom'].includes(normalizeText(cell))));
    const names = [];
    if (headerIndex >= 0) {
      const header = table[headerIndex].map(normalizeText);
      const surnameIndex = header.findIndex((cell) => cell === 'nom' || cell.includes('nom de famille') || cell.includes('nom usuel'));
      const givenIndex = header.findIndex((cell) => cell === 'prenom' || cell === 'prenoms' || cell.includes('prenom usuel'));
      const combinedIndex = header.findIndex((cell) => cell === 'eleve' || cell.includes('nom prenom') || cell.includes('nom eleve'));
      table.slice(headerIndex + 1).forEach((row) => {
        if (surnameIndex >= 0) names.push(formatFullName([row[surnameIndex], givenIndex >= 0 ? row[givenIndex] : ''].filter(Boolean).join(' ')));
        else if (combinedIndex >= 0) names.push(formatFullName(row[combinedIndex]));
      });
    } else {
      table.forEach((row) => {
        const values = row.filter(Boolean);
        if (values.length) names.push(formatFullName(values.length > 1 ? `${values[0]} ${values[1]}` : values[0]));
      });
    }
    return [...new Map(names.filter((name) => name.length > 1).map((name) => [normalizeText(name), name])).values()];
  }

  function exportIDoceo(scope) {
    const current = activeClass(); if (!current?.students.length) { toast('Aucun élève à exporter.'); return; }
    const groups = groupsWithManual(current.students);
    const students = scope === 'all' ? current.students : groups[Number(scope)] || [];
    if (!students.length) { toast(`Le groupe ${scope} est vide.`); return; }
    const rows = students.map((student) => ({
      'Nom Prénom': formatFullName(student.name),
      'Entrée dans l’eau': criterionLevel(student, 'entry'),
      'Flottaisons': criterionLevel(student, 'floating'),
      'Nage dorsale': criterionLevel(student, 'backstroke'),
      'Nage ventrale': criterionLevel(student, 'frontstroke'),
      'Immersions': criterionLevel(student, 'immersion'),
      'Demi-tour': criterionLevel(student, 'turn'),
      'Résultat ASNS': completed(student) ? (failed(student) ? 'Non validé' : 'Validé') : 'À terminer',
      'Groupe': student.manualGroup || findStudentGroup(student.id, groups),
    }));
    const suffix = scope === 'all' ? 'classe' : `groupe-${scope}`;
    const fileName = `Natation-6e-${slug(current.name)}-${suffix}.xlsx`;
    if (window.XLSX) {
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.json_to_sheet(rows);
      sheet['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 14 }, { wch: 15 }, { wch: 16 }, { wch: 13 }, { wch: 12 }, { wch: 16 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(workbook, sheet, scope === 'all' ? 'Résultats' : `Groupe ${scope}`);
      const scale = XLSX.utils.aoa_to_sheet([[ 'Niveau', 'Interprétation' ], [1, 'Non acquis / non évalué'], [2, 'À consolider'], [3, 'Maîtrisé au diagnostic'], [4, 'Réservé à la fin du cycle']]);
      XLSX.utils.book_append_sheet(workbook, scale, 'Barème diagnostic');
      XLSX.writeFile(workbook, fileName, { compression: true });
    } else {
      downloadCsv(rows, fileName.replace(/\.xlsx$/, '.csv'));
    }
    toast(scope === 'all' ? 'Export iDoceo de la classe créé.' : `Export iDoceo du groupe ${scope} créé.`);
  }

  function findStudentGroup(studentId, groups) {
    for (const number of [1, 2, 3]) if (groups[number].some((student) => student.id === studentId)) return number;
    return '';
  }

  function slug(value) {
    return normalizeText(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'classe';
  }

  function downloadCsv(rows, fileName) {
    const headers = Object.keys(rows[0]);
    const csv = [headers, ...rows.map((row) => headers.map((header) => row[header]))].map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = fileName; link.click(); URL.revokeObjectURL(url);
  }

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  window.addEventListener('DOMContentLoaded', render);
})();
