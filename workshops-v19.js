// Canonical student missions, shared by app and print generator.
export const WORKSHOPS = [
  {
    "id": "floating",
    "title": "Flottaison",
    "image": "./action-08-flottaison.png",
    "learningKey": "floating-v19",
    "power": "Équilibre",
    "icon": "✦",
    "tones": [
      "red",
      "red",
      "orange",
      "green",
      "green"
    ],
    "names": [
      "L’Étoile ventrale",
      "L’Étoile dorsale",
      "Le Double appui",
      "L’Étoile libre",
      "La Sentinelle"
    ],
    "skills": [
      "Je flotte sur le ventre avec appuis",
      "Je flotte sur le dos pendant 5 secondes",
      "Je garde mon nez hors de l’eau pendant 10 secondes",
      "Je flotte sans matériel",
      "Je reste en équilibre debout"
    ],
    "levelImages": [
      "./ateliers/flottaison-3d-1.png",
      "./ateliers/flottaison-3d-2.png",
      "./ateliers/flottaison-3d-3.png",
      "./ateliers/flottaison-3d-5.png",
      "./ateliers/flottaison-3d-4.png"
    ],
    "missions": [
      {
        "title": "Je fais l’étoile ventrale avec des appuis",
        "instruction": "Je garde une main au mur et l’autre sur une frite. Je m’allonge sur le ventre et je souffle dans l’eau.",
        "criteria": [
          "Je garde une main au mur et l’autre sur une frite.",
          "Je garde le corps allongé sur le ventre, mes pieds à la surface et je souffle dans l’eau pendant 3 secondes."
        ]
      },
      {
        "title": "Je fais l’étoile dorsale avec des appuis",
        "instruction": "Je garde une main au mur et l’autre sur une frite. Je m’allonge sur le dos et je regarde le plafond.",
        "criteria": [
          "Je garde deux appuis : le mur et une frite.",
          "Je regarde le plafond avec les bras et les jambes écartés.",
          "Je garde mes hanches à la surface pendant 5 secondes."
        ]
      },
      {
        "title": "Je fais l’étoile dorsale avec deux frites",
        "instruction": "Je m’allonge sur le dos avec deux frites et je garde le nez hors de l’eau.",
        "criteria": [
          "Je flotte avec deux frites.",
          "Je garde le corps allongé et les hanches à la surface.",
          "Je garde mon nez hors de l’eau pendant 10 secondes."
        ]
      },
      {
        "title": "Je fais l’étoile dorsale sans matériel",
        "instruction": "Je m’allonge sur le dos sans matériel. Pour me redresser, je ramène le menton vers la poitrine.",
        "criteria": [
          "Je reste sur le dos pendant 15 secondes, sans matériel.",
          "Je garde les bras et les jambes écartés et mes voies respiratoires hors de l’eau.",
          "Je me redresse seul en contrôlant mon équilibre."
        ]
      },
      {
        "title": "Je flotte debout",
        "instruction": "À portée du bord, je bouge mes mains et mes pieds pour rester en équilibre.",
        "criteria": [
          "Je reste en position verticale pendant 15 secondes.",
          "Je garde la tête hors de l’eau et je respire calmement.",
          "Je bouge mes mains et mes pieds pour rester en équilibre."
        ]
      }
    ]
  },
  {
    "id": "immersion",
    "title": "Immersion",
    "image": "./action-03-obstacle.png",
    "learningKey": "immersion-v19",
    "power": "Exploration",
    "icon": "◈",
    "tones": [
      "red",
      "red",
      "red",
      "orange",
      "orange",
      "green",
      "green"
    ],
    "names": [
      "La Fabrique à bulles",
      "Le Masque immergé",
      "La Porte sous-marine",
      "Le Tunnel guidé",
      "La Traversée libre",
      "Le Chercheur de trésors",
      "La Grande traversée"
    ],
    "skills": [
      "Je souffle dans l’eau pendant 3 secondes",
      "J’immerge ma tête et je souffle pendant 5 secondes",
      "Je passe sous la barre avec le mur",
      "Je passe sous le tapis avec le mur",
      "Je passe sous la barre sans appui",
      "Je récupère des objets à 2 m",
      "Je franchis un obstacle de 1,5 m"
    ],
    "levelImages": [
      "./ateliers/immersion-face-v18.png",
      "./ateliers/immersion-head-v18.png",
      "./ateliers/immersion-bar-wall-v19.png",
      "./ateliers/immersion-mat-wall-v19.png",
      "./ateliers/immersion-bar-free-v19.png",
      "./ateliers/immersion-object-v19.png",
      "./action-03-obstacle.png"
    ],
    "missions": [
      {
        "title": "Je mets le visage dans l’eau",
        "instruction": "Au bord, je mets le visage dans l’eau et je souffle des bulles, puis je relève la tête.",
        "criteria": [
          "Je mets le visage dans l’eau 3 fois.",
          "Je souffle des bulles dans l’eau pendant 3 secondes.",
          "Je reprends ma respiration calmement."
        ]
      },
      {
        "title": "Je mets toute la tête sous l’eau",
        "instruction": "Je mets toute la tête sous l’eau, je souffle des bulles puis je ressors calmement.",
        "criteria": [
          "Je mets toute la tête sous l’eau une fois.",
          "Je souffle des bulles dans l’eau pendant 5 secondes.",
          "Je reprends ma respiration calmement."
        ]
      },
      {
        "title": "Je passe sous la barre avec les mains au mur",
        "instruction": "En gardant les mains au mur, je passe sous la barre sans avoir pied.",
        "criteria": [
          "Je passe une fois complètement sous l’obstacle court.",
          "Je ne soulève pas l’obstacle.",
          "Je reprends ma respiration calmement."
        ]
      },
      {
        "title": "Je passe sous le tapis avec les mains au mur",
        "instruction": "En gardant les mains au mur, je passe sous le tapis sans avoir pied.",
        "criteria": [
          "Je passe une fois complètement sous l’obstacle.",
          "Je ne soulève pas l’obstacle.",
          "Je reprends ma respiration calmement."
        ]
      },
      {
        "title": "Je passe sous la barre sans appui",
        "instruction": "Je passe sous la barre sans prendre d’appui.",
        "criteria": [
          "Je passe une fois complètement sous l’obstacle court.",
          "Je prends une grande inspiration avant de passer sous l’obstacle.",
          "Je ne soulève pas l’obstacle."
        ]
      },
      {
        "title": "Je récupère un objet à 2 m de profondeur",
        "instruction": "Je fais un plongeon canard pour récupérer un objet à 2 m de profondeur, sans appui.",
        "criteria": [
          "Je remonte des objets 3 fois.",
          "Je prends une grande inspiration avant mon plongeon canard."
        ]
      },
      {
        "title": "Je franchis un obstacle de 1,5 m",
        "instruction": "Au signal du professeur, je franchis l’obstacle de 1,5 m en immersion, puis je ressors dans la zone prévue.",
        "criteria": [
          "Je franchis 1,5 m en immersion complète.",
          "Je ne déplace pas l’obstacle.",
          "Je reprends ma respiration calmement."
        ]
      }
    ]
  },
  {
    "id": "entry",
    "title": "Entrée dans l’eau",
    "image": "./action-01-chute.png",
    "learningKey": "entry-v19",
    "power": "Confiance",
    "icon": "↯",
    "tones": [
      "red",
      "orange",
      "orange",
      "green",
      "diamond",
      "diamond",
      "diamond"
    ],
    "names": [
      "Le Saut accompagné",
      "Le Saut libre",
      "La Boule arrière",
      "La Bouteille arrière",
      "La Flèche assise",
      "La Flèche du bord",
      "La Flèche du plot"
    ],
    "skills": [
      "Je saute avec du matériel",
      "Je saute sans me pincer le nez",
      "Je bascule en restant groupé",
      "J’entre en arrière, corps droit",
      "Je plonge depuis la position assise",
      "Je plonge depuis le bord",
      "Je plonge du plot et je remonte en battements"
    ],
    "levelImages": [
      "./ateliers/entry-material-v19.png",
      "./ateliers/entry-jump-v18.png",
      "./ateliers/entry-tuck-v19.png",
      "./ateliers/entry-bottle-v19.png",
      "./ateliers/entry-dive-seated-v19.png",
      "./ateliers/entry-dive-standing-v19.png",
      "./ateliers/entry-dive-block-v19.png"
    ],
    "missions": [
      {
        "title": "Je saute dans l’eau avec du matériel",
        "instruction": "Je saute dans l’eau avec le matériel prévu.",
        "criteria": [
          "Je fais une entrée dans l’eau.",
          "Je prends une inspiration avant de sauter.",
          "Je reviens à la surface sans toucher le bord et je respire calmement."
        ]
      },
      {
        "title": "Je saute les pieds en premier",
        "instruction": "Je saute les pieds en premier dans une zone libre.",
        "criteria": [
          "Je fais un saut dans l’eau.",
          "Je ne me pince pas le nez.",
          "Je reviens à la surface sans toucher le bord et je respire calmement."
        ]
      },
      {
        "title": "Je bascule en arrière en restant groupé",
        "instruction": "Je pars accroupi, les bras autour des genoux, et je me laisse basculer vers l’arrière en restant groupé.",
        "criteria": [
          "Je fais une bascule dans l’eau.",
          "Je garde le menton à la poitrine tout le long.",
          "Je reviens à la surface sans toucher le bord et je respire calmement."
        ]
      },
      {
        "title": "Je fais une chute arrière en bouteille",
        "instruction": "Au signal, en étant debout, j’entre en chute arrière pour rejoindre le bord.",
        "criteria": [
          "Je fais une chute arrière.",
          "Je respecte la position, corps droit.",
          "Je reviens à la surface sans toucher le bord et je respire calmement."
        ]
      },
      {
        "title": "Je plonge depuis la position assise",
        "instruction": "Je pars assis du bord du bassin, les bras aux oreilles et la tête entre les bras.",
        "criteria": [
          "Je pousse avec mes jambes.",
          "Mes mains entrent en premier dans l’eau.",
          "Je garde le menton collé à la poitrine."
        ]
      },
      {
        "title": "Je plonge depuis le bord du bassin",
        "instruction": "Je pars debout du bord du bassin, les bras aux oreilles et la tête entre les bras.",
        "criteria": [
          "Je pousse avec mes jambes.",
          "Mes mains entrent en premier dans l’eau.",
          "Je garde le menton collé à la poitrine."
        ]
      },
      {
        "title": "Je plonge depuis le plot",
        "instruction": "Je pars debout du plot, les bras aux oreilles et la tête entre les bras.",
        "criteria": [
          "Je pousse avec mes jambes.",
          "Je garde le menton collé à la poitrine.",
          "Sous l’eau, je garde les bras devant moi et je fais des battements pour revenir à la surface."
        ]
      }
    ]
  }
].map(m=>({...m,levels:m.missions.map(x=>[x.title,x.instruction,x.criteria.join(" ")])}));
export const MISSION_CRITERIA=Object.fromEntries(WORKSHOPS.map(m=>[m.id,m.missions.map(x=>x.criteria)]));
export const AQUATIC_MISSIONS=Object.fromEntries(WORKSHOPS.map(m=>[m.id,{icon:m.icon,power:m.power,names:m.names,skills:m.skills}]));
