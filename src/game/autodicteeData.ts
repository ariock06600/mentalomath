export interface AutodicteeSentence {
  id: string;
  text: string;
  keyWords: string[];
}

export interface AutodicteeLesson {
  id: string;
  title: string;
  subtitle: string;
  source: string;
  fullText: string;
  sentences: AutodicteeSentence[];
  grammarNotes: {
    rule: string;
    examples: string[];
  }[];
}

export const DEFAULT_AUTODICTEE: AutodicteeLesson = {
  id: 'rentree-nov',
  title: 'Autodictée pour la rentrée',
  subtitle: 'Lundi 2 novembre · Cycle 3 (CE2, CM1, CM2)',
  source: 'Extrait de « La confiture de Berbéranza » de Florence Médina',
  fullText:
    "Regardez autour de vous, les arbres, le ciel, les cailloux, les rivières, les insectes, vos animaux de compagnie, les astres, ce qu'il y a dans votre assiette, même ! Tout ! Tout ce qui vous procure une sensation, vous émerveille, vous fait rire, vous met des gargouillis dans le ventre ou des fourmis dans les jambes. Cultivez vos petits plaisirs.",
  sentences: [
    {
      id: 'part-1',
      text: "Regardez autour de vous, les arbres, le ciel, les cailloux, les rivières, les insectes, vos animaux de compagnie, les astres, ce qu'il y a dans votre assiette, même !",
      keyWords: ['Regardez', 'arbres', 'cailloux', 'rivières', 'insectes', 'animaux', 'compagnie', 'astres', 'assiette'],
    },
    {
      id: 'part-2',
      text: 'Tout ! Tout ce qui vous procure une sensation, vous émerveille, vous fait rire, vous met des gargouillis dans le ventre ou des fourmis dans les jambes.',
      keyWords: ['procure', 'sensation', 'émerveille', 'gargouillis', 'ventre', 'fourmis', 'jambes'],
    },
    {
      id: 'part-3',
      text: 'Cultivez vos petits plaisirs.',
      keyWords: ['Cultivez', 'petits', 'plaisirs'],
    },
  ],
  grammarNotes: [
    {
      rule: 'Pluriels particuliers en -x',
      examples: ['un caillou → des cailloux (comme bijoux, choux, genoux, hiboux, joujoux, poux).'],
    },
    {
      rule: 'Doubles consonnes et accents',
      examples: [
        'assiette (-ss- et -tt-)',
        'rivières (accent grave sur le e)',
        'gargouillis (-ll- avec s muet)',
      ],
    },
    {
      rule: 'Accord du pluriel',
      examples: [
        'un animal → des animaux (pluriel en -aux)',
        'des fourmis (s muet au pluriel)',
        'vos petits plaisirs (accord au pluriel)',
      ],
    },
    {
      rule: 'Verbes à l’impératif présent (2e personne du pluriel)',
      examples: ['Regardez (terminaison en -ez)', 'Cultivez (terminaison en -ez)'],
    },
  ],
};

export const OTHER_PRESET_DICTEES: AutodicteeLesson[] = [
  DEFAULT_AUTODICTEE,
  {
    id: 'foret-automne',
    title: 'Les secrets de la forêt dorée',
    subtitle: 'Niveau CE2-CM1 · Vocabulaire & Accords',
    source: 'Texte pédagogique MentaloMath',
    fullText:
      "En automne, les feuilles des grands chênes prennent une couleur flamboyante. Les écureuils agiles cachent précieusement des noisettes sous la mousse fraîche.",
    sentences: [
      {
        id: 'foret-1',
        text: 'En automne, les feuilles des grands chênes prennent une couleur flamboyante.',
        keyWords: ['automne', 'feuilles', 'chênes', 'prennent', 'flamboyante'],
      },
      {
        id: 'foret-2',
        text: 'Les écureuils agiles cachent précieusement des noisettes sous la mousse fraîche.',
        keyWords: ['écureuils', 'agiles', 'cachent', 'précieusement', 'noisettes', 'fraîche'],
      },
    ],
    grammarNotes: [
      {
        rule: 'Verbes au pluriel',
        examples: ['les feuilles prennent (-ent)', 'les écureuils cachent (-ent)'],
      },
      {
        rule: 'Accords des adjectifs',
        examples: ['des grands chênes (masculin pluriel)', 'la mousse fraîche (féminin singulier)'],
      },
    ],
  },
  {
    id: 'espace-etoiles',
    title: 'Le voyage vers les étoiles',
    subtitle: 'Niveau CM1-CM2 · Mots savants & Ponctuation',
    source: 'Texte pédagogique MentaloMath',
    fullText:
      "Dans l'immensité de l'univers, des milliards d'étoiles scintillantes éclairent la nuit profonde. Les astronomes observent attentivement les constellations lointaines.",
    sentences: [
      {
        id: 'espace-1',
        text: "Dans l'immensité de l'univers, des milliards d'étoiles scintillantes éclairent la nuit profonde.",
        keyWords: ['immensité', 'univers', 'milliards', 'scintillantes', 'éclairent'],
      },
      {
        id: 'espace-2',
        text: 'Les astronomes observent attentivement les constellations lointaines.',
        keyWords: ['astronomes', 'observent', 'attentivement', 'constellations', 'lointaines'],
      },
    ],
    grammarNotes: [
      {
        rule: 'Adverbes en -ment',
        examples: ['attentivement (formé sur le féminin attentive + ment)'],
      },
      {
        rule: 'Pluriels avec déterminants',
        examples: ["des milliards d'étoiles", 'les constellations lointaines'],
      },
    ],
  },
];
