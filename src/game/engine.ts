import type {
  GameMode,
  DifficultyPreset,
  GameSettings,
  Question,
  AnswerRecord,
  Badge,
  PlayerStats,
  AvatarOption,
  MathOperator,
} from './types.ts';

export const ALL_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const ALL_OPERATORS: MathOperator[] = ['x', '+', '-', '÷'];

export const OPERATOR_LABELS: Record<MathOperator, { name: string; symbol: string; badge: string }> = {
  'x': { name: 'Multiplication', symbol: '×', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  '+': { name: 'Addition', symbol: '+', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  '-': { name: 'Soustraction', symbol: '−', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  '÷': { name: 'Division', symbol: '÷', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
};

export const PRESET_CONFIGS: Record<DifficultyPreset, Partial<GameSettings>> = {
  facile: {
    selectedTables: [1, 2, 5, 10],
    selectedOperators: ['x'],
    inputMode: 'CHOICES',
    durationSeconds: 60,
    targetQuestionsCount: 15,
    allowMissingFactors: false,
    maxFactor: 10,
  },
  moyen: {
    selectedTables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    selectedOperators: ['x'],
    inputMode: 'NUMPAD',
    durationSeconds: 60,
    targetQuestionsCount: 20,
    allowMissingFactors: false,
    maxFactor: 10,
  },
  difficile: {
    selectedTables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    selectedOperators: ['x', '+', '-', '÷'],
    inputMode: 'NUMPAD',
    durationSeconds: 60,
    targetQuestionsCount: 25,
    allowMissingFactors: true,
    maxFactor: 12,
  },
  personnalise: {
    selectedTables: [2, 3, 4, 5],
    selectedOperators: ['x'],
    inputMode: 'NUMPAD',
    durationSeconds: 60,
    targetQuestionsCount: 20,
    allowMissingFactors: false,
    maxFactor: 10,
  },
};

export const DEFAULT_SETTINGS: GameSettings = {
  selectedTables: [2, 3, 4, 5, 10],
  selectedOperators: ['x'],
  difficulty: 'moyen',
  inputMode: 'NUMPAD',
  durationSeconds: 60,
  targetQuestionsCount: 20,
  allowMissingFactors: false,
  maxFactor: 10,
};

export const AVATAR_LIST: AvatarOption[] = [
  { id: 'fox', name: 'Renard Rusé', emoji: '🦊', color: 'from-amber-400 to-orange-500' },
  { id: 'tiger', name: 'Tigre Éclair', emoji: '🐯', color: 'from-yellow-400 to-amber-600' },
  { id: 'robot', name: 'Robot Malin', emoji: '🤖', color: 'from-sky-400 to-blue-600' },
  { id: 'rocket', name: 'Fusée Turbo', emoji: '🚀', color: 'from-rose-400 to-red-600' },
  { id: 'owl', name: 'Chouette Sage', emoji: '🦉', color: 'from-emerald-400 to-teal-600' },
  { id: 'unicorn', name: 'Licorne Magique', emoji: '🦄', color: 'from-fuchsia-400 to-purple-600' },
];

export const ALL_BADGES: Badge[] = [
  // --- Catégorie : Calcul Mental (MentaloMath) ---
  {
    id: 'first_step',
    name: 'Premier Pas',
    description: 'Complète ta toute première partie de calcul mental !',
    iconName: 'Footprints',
    category: 'math',
    rarity: 'bronze',
    hint: 'Joue une partie en mode Calcul Mental.',
  },
  {
    id: 'streak_5',
    name: 'Combo X5 !',
    description: 'Enchaîne 5 bonnes réponses consécutives sans erreur.',
    iconName: 'Flame',
    category: 'math',
    rarity: 'argent',
    hint: 'Garde ta concentration pendant 5 questions.',
  },
  {
    id: 'streak_10',
    name: 'Champion Inarrêtable',
    description: 'Réalise un combo de 10 bonnes réponses d’affilée.',
    iconName: 'Zap',
    category: 'math',
    rarity: 'or',
    hint: 'Enchaîne 10 calculs justes d’un coup !',
  },
  {
    id: 'speed_demon',
    name: 'Éclair Turbo',
    description: 'Trouve la bonne réponse en moins d’une seconde chrono.',
    iconName: 'Gauge',
    category: 'math',
    rarity: 'or',
    hint: 'Réponds plus vite que ton ombre !',
  },
  {
    id: 'addition_pro',
    name: 'As de l’Addition',
    description: 'Réussis 5 additions d’affilée sans aucune hésitation.',
    iconName: 'Plus',
    category: 'math',
    rarity: 'argent',
    hint: 'Sélectionne l’addition (+) et réussis 5 calculs.',
  },
  {
    id: 'subtraction_pro',
    name: 'Expert Soustraction',
    description: 'Réussis 5 soustractions d’affilée avec brio.',
    iconName: 'Minus',
    category: 'math',
    rarity: 'argent',
    hint: 'Sélectionne la soustraction (−) et réussis 5 calculs.',
  },
  {
    id: 'division_master',
    name: 'Maître de la Division',
    description: 'Trouve le bon quotient 5 fois consécutives.',
    iconName: 'Divide',
    category: 'math',
    rarity: 'argent',
    hint: 'Sélectionne la division (÷) et réussis 5 partages.',
  },
  {
    id: 'polymath_all4',
    name: 'Génie des 4 Opérations',
    description: 'Termine une partie avec les 4 opérations (+, −, ×, ÷) actives !',
    iconName: 'Sparkles',
    category: 'math',
    rarity: 'or',
    hint: 'Coche les 4 symboles mathématiques avant de lancer.',
  },
  {
    id: 'perfect_target',
    name: 'Score Parfait 100%',
    description: 'Termine une série de 15 questions ou plus sans aucune faute.',
    iconName: 'Award',
    category: 'math',
    rarity: 'or',
    hint: 'Défi 15 questions en mode cible avec zéro erreur.',
  },
  {
    id: 'score_300',
    name: 'Maestro des Maths',
    description: 'Marque plus de 300 points dans une partie chronométrée.',
    iconName: 'Trophy',
    category: 'math',
    rarity: 'or',
    hint: 'Combine rapidité et combos en Sprint 60s.',
  },
  {
    id: 'century_club',
    name: 'Club des 100',
    description: 'Résous plus de 100 calculs au total dans ton carnet !',
    iconName: 'Crown',
    category: 'math',
    rarity: 'diamant',
    hint: 'Entraîne-toi régulièrement pour cumuler 100 calculs.',
  },

  // --- Catégorie : Auto-Dictée (CM1.2) ---
  {
    id: 'autodictee_step1',
    name: 'Recopieur Appliqué',
    description: 'Complète l’Exercice 1 en recopiant le modèle sans faute.',
    iconName: 'PenTool',
    category: 'dictee',
    rarity: 'bronze',
    hint: 'Rends-toi dans l’Auto-Dictée > Exercice 1.',
  },
  {
    id: 'autodictee_step2',
    name: 'Détective des Trous',
    description: 'Complète avec succès la dictée à trous préparée par les parents (Exercice 2).',
    iconName: 'Puzzle',
    category: 'dictee',
    rarity: 'argent',
    hint: 'Lance et valide l’Exercice 2 de l’Auto-Dictée.',
  },
  {
    id: 'autodictee_step3',
    name: 'Compteur de Lettres',
    description: 'Réussis l’Exercice 3 en t’aidant des tirets de longueur de mots.',
    iconName: 'Hash',
    category: 'dictee',
    rarity: 'argent',
    hint: 'Complète les mots masqués avec l’aide des tirets.',
  },
  {
    id: 'autodictee_step4',
    name: 'Mémoire d’Or',
    description: 'Réussis la dictée complète de mémoire sans aucune aide (Exercice 4).',
    iconName: 'Award',
    category: 'dictee',
    rarity: 'or',
    hint: 'Écris toute la dictée de mémoire sans modèle.',
  },
  {
    id: 'autodictee_grand_chelem',
    name: 'Grand Chelem de la Dictée',
    description: 'Valide l’ensemble des 4 exercices de l’auto-dictée !',
    iconName: 'Crown',
    category: 'dictee',
    rarity: 'diamant',
    hint: 'Termine les 4 étapes : Recopier, Trous, Tirets et Sans aide.',
  },
  {
    id: 'autodictee_zero_faute',
    name: 'Zéro Faute Magistral',
    description: 'Obtiens 100% de réussite à une auto-dictée sans utiliser le coup d’œil.',
    iconName: 'CheckCheck',
    category: 'dictee',
    rarity: 'or',
    hint: 'Corrige ta dictée avec 0 faute sans aperçu.',
  },

  // --- Catégorie : Chronomètre Activable à l'Envie ---
  {
    id: 'chrono_adepte',
    name: 'Maître du Temps',
    description: 'Active et utilise le chronomètre sur un exercice de ton choix.',
    iconName: 'Clock',
    category: 'chrono',
    rarity: 'bronze',
    hint: 'Active l’interrupteur chrono sur n’importe quel exercice.',
  },
  {
    id: 'chrono_sprinteur',
    name: 'Sprinteur Chrono',
    description: 'Termine une session d’entraînement de maths avec le chrono actif.',
    iconName: 'Zap',
    category: 'chrono',
    rarity: 'argent',
    hint: 'Fais des calculs tout en gardant le chrono en marche.',
  },
  {
    id: 'chrono_eclair_dictée',
    name: 'Plume Rapide',
    description: 'Termine un exercice d’auto-dictée en moins de 2 minutes chrono !',
    iconName: 'Timer',
    category: 'chrono',
    rarity: 'or',
    hint: 'Remplis un exercice d’auto-dictée rapidement avec le chrono.',
  },

  // --- Catégorie : Vacances de la Toussaint CM1.2 ---
  {
    id: 'toussaint_assidu',
    name: 'Élève Modèle de Toussaint',
    description: 'Pratique à la fois le calcul mental et l’auto-dictée pendant les vacances.',
    iconName: 'Calendar',
    category: 'toussaint',
    rarity: 'argent',
    hint: 'Débloque au moins un trophée en Maths et un en Dictée.',
  },
  {
    id: 'toussaint_super_champion',
    name: 'Super Champion CM1.2',
    description: 'Débloque au moins 8 trophées dans ton carnet des vacances de la Toussaint !',
    iconName: 'Trophy',
    category: 'toussaint',
    rarity: 'diamant',
    hint: 'Collecte 8 trophées au total dans l’application.',
  },
];

export const TABLE_TIPS: Record<number, { title: string; tip: string; rule: string }> = {
  1: {
    title: 'La Table Miroir',
    tip: 'Tout nombre multiplié par 1 ne change pas ! C’est son propre reflet.',
    rule: 'n × 1 = n',
  },
  2: {
    title: 'Le Double Magique',
    tip: 'Multiplier par 2, c’est simplement calculer le double. Tous les résultats sont pairs (se terminent par 0, 2, 4, 6, 8).',
    rule: 'n × 2 = n + n',
  },
  3: {
    title: 'Le Pas de Trois',
    tip: 'Pour vérifier si un nombre est dans la table de 3, additionne ses chiffres : la somme est 3, 6 ou 9 (ex: 27 -> 2+7=9).',
    rule: 'Multiples de 3',
  },
  4: {
    title: 'Le Double du Double',
    tip: 'Multiplier par 4, c’est faire le double du double ! Ex: 6 × 4 = le double de 6 (12), puis le double de 12 (24).',
    rule: 'n × 4 = (n × 2) × 2',
  },
  5: {
    title: 'La Main Complète',
    tip: 'Tous les nombres de la table de 5 se terminent obligatoirement par 0 ou 5 ! Si le nombre est pair, il finit par 0.',
    rule: 'Finit par 0 ou 5',
  },
  6: {
    title: 'Le Triple Doublé',
    tip: 'Multiplier par 6, c’est multiplier par 3 puis doubler le résultat (ou faire la table de 5 + une fois le nombre !).',
    rule: 'n × 6 = (n × 5) + n',
  },
  7: {
    title: 'Le Grand Défi du 7',
    tip: 'Astuce pour 7 × 8 : pense à 5, 6, 7, 8 -> 56 = 7 × 8 ! Et 7 × 7 = 49 (le carré magique).',
    rule: '7 × 8 = 56 !',
  },
  8: {
    title: 'Le Triple Double',
    tip: 'Multiplier par 8, c’est doubler 3 fois d’affilée ! Ex: 5 -> 10 -> 20 -> 40.',
    rule: 'n × 8 = ((n × 2) × 2) × 2',
  },
  9: {
    title: 'L’Astuce Secrète des Doigts',
    tip: 'La somme des chiffres donne toujours 9 (18, 27, 36, 45, 54, 63, 72, 81). Pense aussi à n × 10 - n !',
    rule: 'n × 9 = (n × 10) - n',
  },
  10: {
    title: 'Le Zéro Magique',
    tip: 'Pour multiplier par 10, il suffit d’ajouter un zéro à la fin du nombre !',
    rule: 'n × 10 = n0',
  },
  11: {
    title: 'Les Nombres Jumeaux',
    tip: 'De 1 à 9, le résultat répète deux fois le même chiffre : 22, 33, 44, 55, 66, 77, 88, 99 !',
    rule: 'Jumeaux jusqu’à 9',
  },
  12: {
    title: 'La Douzaine Complète',
    tip: 'Multiplier par 12, c’est faire n × 10 + n × 2. Ex: 7 × 12 = 70 + 14 = 84 !',
    rule: 'n × 12 = (n × 10) + (n × 2)',
  },
};

export function getStreakMultiplier(streak: number): number {
  if (streak >= 10) return 4;
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}

export function calculatePoints(
  isCorrect: boolean,
  timeSpentMs: number,
  currentStreak: number
): number {
  if (!isCorrect) return 0;
  const basePoints = 10;
  let speedBonus = 0;
  if (timeSpentMs < 1000) {
    speedBonus = 15;
  } else if (timeSpentMs < 2000) {
    speedBonus = Math.max(0, Math.round((2000 - timeSpentMs) / 100) * 1.5);
  }
  const multiplier = getStreakMultiplier(currentStreak);
  return Math.round((basePoints + speedBonus) * multiplier);
}

export function generateQuestion(
  settings: GameSettings,
  previousQuestionId?: string
): Question {
  const tables = settings.selectedTables.length > 0 ? settings.selectedTables : [2, 3, 5, 10];
  const maxFactor = settings.maxFactor || 10;
  const operators =
    settings.selectedOperators && settings.selectedOperators.length > 0
      ? settings.selectedOperators
      : (['x'] as MathOperator[]);

  let a = 1;
  let b = 1;
  let op: MathOperator = 'x';
  let correctAnswer = 1;
  let displayPrompt = '';
  let missingPart: 'result' | 'factorA' | 'factorB' = 'result';
  let qId = '';
  let attempts = 0;

  do {
    op = operators[Math.floor(Math.random() * operators.length)];
    const tableIndex = Math.floor(Math.random() * tables.length);
    const tableBase = tables[tableIndex];
    const randOperand = Math.floor(Math.random() * maxFactor) + 1;

    if (op === 'x') {
      a = tableBase;
      b = randOperand;
      correctAnswer = a * b;
      displayPrompt = `${a} × ${b} = ?`;
      qId = `${a}x${b}`;

      if (settings.allowMissingFactors && Math.random() < 0.3) {
        if (Math.random() < 0.5) {
          missingPart = 'factorA';
          correctAnswer = a;
          displayPrompt = `? × ${b} = ${a * b}`;
        } else {
          missingPart = 'factorB';
          correctAnswer = b;
          displayPrompt = `${a} × ? = ${a * b}`;
        }
      }
    } else if (op === '+') {
      a = tableBase;
      b = randOperand;
      correctAnswer = a + b;
      displayPrompt = `${a} + ${b} = ?`;
      qId = `${a}+${b}`;

      if (settings.allowMissingFactors && Math.random() < 0.3) {
        missingPart = 'factorB';
        correctAnswer = b;
        displayPrompt = `${a} + ? = ${a + b}`;
      }
    } else if (op === '-') {
      // Subtraction: ensure minuend >= subtrahend, result strictly positive
      const minuend = tableBase + randOperand;
      a = minuend;
      b = randOperand;
      correctAnswer = a - b; // which is tableBase
      displayPrompt = `${a} − ${b} = ?`;
      qId = `${a}-${b}`;

      if (settings.allowMissingFactors && Math.random() < 0.3) {
        missingPart = 'factorB';
        correctAnswer = b;
        displayPrompt = `${a} − ? = ${correctAnswer}`;
      }
    } else {
      // Division: exact division from tables (e.g. 56 ÷ 7 = 8)
      const dividend = tableBase * randOperand;
      a = dividend;
      b = tableBase;
      correctAnswer = randOperand;
      displayPrompt = `${a} ÷ ${b} = ?`;
      qId = `${a}/${b}`;

      if (settings.allowMissingFactors && Math.random() < 0.3) {
        missingPart = 'factorA';
        correctAnswer = a;
        displayPrompt = `? ÷ ${b} = ${randOperand}`;
      }
    }
    attempts++;
  } while (qId === previousQuestionId && attempts < 10);

  // Generate 4 plausible distinct choices
  const choicesSet = new Set<number>();
  choicesSet.add(correctAnswer);

  const candidateDeltas = [-2, -1, 1, 2, -10, 10, -3, 3, -5, 5];
  for (const delta of candidateDeltas) {
    const val = correctAnswer + delta;
    if (val >= 0 && val !== correctAnswer) {
      choicesSet.add(val);
    }
    if (choicesSet.size >= 4) break;
  }

  let fallbackDelta = 4;
  while (choicesSet.size < 4) {
    const candidate = correctAnswer + (fallbackDelta % 2 === 0 ? fallbackDelta : -fallbackDelta);
    if (candidate >= 0 && candidate !== correctAnswer) {
      choicesSet.add(candidate);
    }
    fallbackDelta++;
  }

  const choices = Array.from(choicesSet).slice(0, 4);
  // Shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  return {
    id: `${qId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    factorA: a,
    factorB: b,
    operator: op,
    correctAnswer,
    displayPrompt,
    missingPart,
    choices,
  };
}

export function getDefaultPlayerStats(): PlayerStats {
  const tableSuccessCount: Record<number, number> = {};
  const tableAttemptsCount: Record<number, number> = {};
  for (const t of ALL_TABLES) {
    tableSuccessCount[t] = 0;
    tableAttemptsCount[t] = 0;
  }

  const operatorSuccessCount: Record<MathOperator, number> = {
    '+': 0,
    '-': 0,
    'x': 0,
    '÷': 0,
  };
  const operatorAttemptsCount: Record<MathOperator, number> = {
    '+': 0,
    '-': 0,
    'x': 0,
    '÷': 0,
  };

  return {
    gamesPlayed: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    bestSprintScore: 0,
    bestSprintAnswers: 0,
    bestTargetTimeMs: null,
    bestSurvivalCount: 0,
    tableSuccessCount,
    tableAttemptsCount,
    operatorSuccessCount,
    operatorAttemptsCount,
    unlockedBadgeIds: [],
  };
}

export function checkUnlockedBadges(
  stats: PlayerStats,
  sessionAnswers: AnswerRecord[],
  gameMode: GameMode,
  finalScore: number,
  finalElapsedMs?: number
): string[] {
  const currentBadgeIds = new Set(stats.unlockedBadgeIds);
  const newlyUnlocked: string[] = [];

  function unlock(id: string) {
    if (!currentBadgeIds.has(id)) {
      currentBadgeIds.add(id);
      newlyUnlocked.push(id);
    }
  }

  if (stats.gamesPlayed >= 1 || sessionAnswers.length > 0) {
    unlock('first_step');
  }

  let maxSessionStreak = 0;
  let curStreak = 0;
  for (const a of sessionAnswers) {
    if (a.isCorrect) {
      curStreak++;
      if (curStreak > maxSessionStreak) maxSessionStreak = curStreak;
    } else {
      curStreak = 0;
    }
  }
  if (maxSessionStreak >= 5) unlock('streak_5');
  if (maxSessionStreak >= 10) unlock('streak_10');

  if (sessionAnswers.some((a) => a.isCorrect && a.timeSpentMs < 1000)) {
    unlock('speed_demon');
  }

  // Operation specific streaks
  const additionsCorrect = sessionAnswers.filter((a) => a.isCorrect && a.question.operator === '+').length;
  if (additionsCorrect >= 5) unlock('addition_pro');

  const subtractionsCorrect = sessionAnswers.filter((a) => a.isCorrect && a.question.operator === '-').length;
  if (subtractionsCorrect >= 5) unlock('subtraction_pro');

  const divisionsCorrect = sessionAnswers.filter((a) => a.isCorrect && a.question.operator === '÷').length;
  if (divisionsCorrect >= 5) unlock('division_master');

  // Polymath: answered at least 1 correct of each 4 operators in session
  const distinctOps = new Set(sessionAnswers.filter((a) => a.isCorrect).map((a) => a.question.operator));
  if (distinctOps.size >= 4) {
    unlock('polymath_all4');
  }

  if (sessionAnswers.length >= 15 && sessionAnswers.every((a) => a.isCorrect)) {
    unlock('perfect_target');
  }

  if (finalScore >= 300) {
    unlock('score_300');
  }

  if (stats.totalQuestions + sessionAnswers.length >= 100) {
    unlock('century_club');
  }

  return newlyUnlocked;
}

export function updatePlayerStats(
  prevStats: PlayerStats,
  sessionAnswers: AnswerRecord[],
  gameMode: GameMode,
  finalScore: number,
  finalElapsedMs?: number
): PlayerStats {
  const newTableSuccess = { ...prevStats.tableSuccessCount };
  const newTableAttempts = { ...prevStats.tableAttemptsCount };
  const newOpSuccess = {
    '+': prevStats.operatorSuccessCount?.['+'] || 0,
    '-': prevStats.operatorSuccessCount?.['-'] || 0,
    'x': prevStats.operatorSuccessCount?.['x'] || 0,
    '÷': prevStats.operatorSuccessCount?.['÷'] || 0,
  };
  const newOpAttempts = {
    '+': prevStats.operatorAttemptsCount?.['+'] || 0,
    '-': prevStats.operatorAttemptsCount?.['-'] || 0,
    'x': prevStats.operatorAttemptsCount?.['x'] || 0,
    '÷': prevStats.operatorAttemptsCount?.['÷'] || 0,
  };

  let sessionCorrect = 0;
  for (const ans of sessionAnswers) {
    const table = ans.question.operator === '÷' ? ans.question.factorB : ans.question.factorA;
    if (table >= 1 && table <= 12) {
      newTableAttempts[table] = (newTableAttempts[table] || 0) + 1;
      if (ans.isCorrect) {
        newTableSuccess[table] = (newTableSuccess[table] || 0) + 1;
      }
    }

    const op = ans.question.operator;
    newOpAttempts[op] = (newOpAttempts[op] || 0) + 1;
    if (ans.isCorrect) {
      sessionCorrect++;
      newOpSuccess[op] = (newOpSuccess[op] || 0) + 1;
    }
  }

  const updatedGames = prevStats.gamesPlayed + 1;
  const updatedTotalQuestions = prevStats.totalQuestions + sessionAnswers.length;
  const updatedTotalCorrect = prevStats.totalCorrect + sessionCorrect;

  let bestSprintScore = prevStats.bestSprintScore;
  let bestSprintAnswers = prevStats.bestSprintAnswers;
  let bestTargetTimeMs = prevStats.bestTargetTimeMs;
  let bestSurvivalCount = prevStats.bestSurvivalCount;

  if (gameMode === 'CHRONO_SPRINT') {
    if (finalScore > bestSprintScore) bestSprintScore = finalScore;
    if (sessionCorrect > bestSprintAnswers) bestSprintAnswers = sessionCorrect;
  } else if (gameMode === 'TARGET_QUESTIONS' && finalElapsedMs !== undefined) {
    if (sessionCorrect === sessionAnswers.length && sessionAnswers.length >= 15) {
      if (bestTargetTimeMs === null || finalElapsedMs < bestTargetTimeMs) {
        bestTargetTimeMs = finalElapsedMs;
      }
    }
  } else if (gameMode === 'SURVIVAL') {
    if (sessionCorrect > bestSurvivalCount) {
      bestSurvivalCount = sessionCorrect;
    }
  }

  const newlyUnlocked = checkUnlockedBadges(
    prevStats,
    sessionAnswers,
    gameMode,
    finalScore,
    finalElapsedMs
  );

  const allBadgeIdsSet = new Set([...(prevStats.unlockedBadgeIds || []), ...newlyUnlocked]);

  // Check composite badges: toussaint_assidu & toussaint_super_champion
  const hasMathBadge = [...allBadgeIdsSet].some((b) =>
    ['first_step', 'streak_5', 'addition_pro', 'score_300', 'century_club'].includes(b)
  );
  const hasDicteeBadge = [...allBadgeIdsSet].some((b) =>
    b.startsWith('autodictee_')
  );
  if (hasMathBadge && hasDicteeBadge) {
    allBadgeIdsSet.add('toussaint_assidu');
  }
  if (allBadgeIdsSet.size >= 8) {
    allBadgeIdsSet.add('toussaint_super_champion');
  }

  return {
    ...prevStats,
    gamesPlayed: updatedGames,
    totalQuestions: updatedTotalQuestions,
    totalCorrect: updatedTotalCorrect,
    bestSprintScore,
    bestSprintAnswers,
    bestTargetTimeMs,
    bestSurvivalCount,
    tableSuccessCount: newTableSuccess,
    tableAttemptsCount: newTableAttempts,
    operatorSuccessCount: newOpSuccess,
    operatorAttemptsCount: newOpAttempts,
    unlockedBadgeIds: Array.from(allBadgeIdsSet),
  };
}

export function unlockSpecificBadges(
  prevStats: PlayerStats,
  badgeIdsToUnlock: string[]
): { updatedStats: PlayerStats; newlyUnlocked: string[] } {
  const currentBadgeIds = new Set(prevStats.unlockedBadgeIds || []);
  const newlyUnlocked: string[] = [];

  for (const id of badgeIdsToUnlock) {
    if (!currentBadgeIds.has(id)) {
      currentBadgeIds.add(id);
      newlyUnlocked.push(id);
    }
  }

  // Composite check
  const hasMathBadge = [...currentBadgeIds].some((b) =>
    ['first_step', 'streak_5', 'addition_pro', 'score_300', 'century_club'].includes(b)
  );
  const hasDicteeBadge = [...currentBadgeIds].some((b) =>
    b.startsWith('autodictee_')
  );
  if (hasMathBadge && hasDicteeBadge && !currentBadgeIds.has('toussaint_assidu')) {
    currentBadgeIds.add('toussaint_assidu');
    newlyUnlocked.push('toussaint_assidu');
  }

  if (currentBadgeIds.size >= 8 && !currentBadgeIds.has('toussaint_super_champion')) {
    currentBadgeIds.add('toussaint_super_champion');
    newlyUnlocked.push('toussaint_super_champion');
  }

  const updatedStats: PlayerStats = {
    ...prevStats,
    unlockedBadgeIds: Array.from(currentBadgeIds),
  };

  return { updatedStats, newlyUnlocked };
}

