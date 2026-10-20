export type GameMode = 'CHRONO_SPRINT' | 'TARGET_QUESTIONS' | 'SURVIVAL' | 'PRACTICE';

export type DifficultyPreset = 'facile' | 'moyen' | 'difficile' | 'personnalise';

export type InputMode = 'CHOICES' | 'NUMPAD';

export type MathOperator = '+' | '-' | 'x' | '÷';

export interface GameSettings {
  selectedTables: number[]; // e.g. [2, 3, 4, 5]
  selectedOperators: MathOperator[]; // e.g. ['x'], ['+', '-'], or all 4
  difficulty: DifficultyPreset;
  inputMode: InputMode;
  durationSeconds: number; // for Chrono Sprint (e.g. 60)
  targetQuestionsCount: number; // for Target Questions (e.g. 20)
  allowMissingFactors: boolean; // e.g. ? x 6 = 42
  maxFactor: number; // usually 10 or 12
}

export interface Question {
  id: string;
  factorA: number;
  factorB: number;
  operator: MathOperator;
  correctAnswer: number;
  displayPrompt: string; // e.g. "6 × 7 = ?", "15 + 8 = ?", "42 ÷ 6 = ?"
  missingPart: 'result' | 'factorA' | 'factorB';
  choices: number[]; // 4 choices including correct answer
}

export interface AnswerRecord {
  question: Question;
  userAnswer: number;
  isCorrect: boolean;
  timeSpentMs: number;
  pointsEarned: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category?: 'math' | 'dictee' | 'chrono' | 'toussaint';
  rarity?: 'bronze' | 'argent' | 'or' | 'diamant';
  hint?: string;
  unlockedAt?: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  totalQuestions: number;
  totalCorrect: number;
  bestSprintScore: number;
  bestSprintAnswers: number;
  bestTargetTimeMs: number | null;
  bestSurvivalCount: number;
  tableSuccessCount: Record<number, number>;
  tableAttemptsCount: Record<number, number>;
  operatorSuccessCount: Record<MathOperator, number>;
  operatorAttemptsCount: Record<MathOperator, number>;
  unlockedBadgeIds: string[];
  autodicteeCompletedSteps?: number[];
  autodicteeTotalCompleted?: number;
  chronoTotalSessions?: number;
  bestChronoDicteeMs?: number | null;
}

export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  color: string;
}
