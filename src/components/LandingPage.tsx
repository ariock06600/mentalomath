import React, { useState } from 'react';
import {
  Sparkles,
  Calculator,
  BookOpen,
  Trophy,
  Play,
  ArrowRight,
  Zap,
  Clock,
  Target,
  ShieldCheck,
  Award,
  CheckCircle2,
  Star,
  Brain,
  Layers,
  Sparkle,
  Flame,
  HelpCircle,
  Puzzle,
  Users2,
  Shapes,
  Check,
  ChevronRight,
  GraduationCap,
  PenTool,
} from 'lucide-react';
import { sounds } from '../utils/audio.ts';
import { PlayerStats, AvatarOption, DifficultyPreset, GameMode } from '../game/types.ts';
import confetti from 'canvas-confetti';

interface LandingPageProps {
  onNavigate: (tab: 'play' | 'learn' | 'stats' | 'autodictee') => void;
  onStartPreset?: (preset: DifficultyPreset, mode: GameMode) => void;
  onQuickDrillTable: (tableNum: number) => void;
  playerStats: PlayerStats;
  playerName: string;
  playerAvatar: AvatarOption;
}

interface MiniQuestion {
  prompt: string;
  options: number[];
  correct: number;
}

const MINI_QUESTIONS: MiniQuestion[] = [
  { prompt: '7 × 8', options: [54, 56, 48, 63], correct: 56 },
  { prompt: '9 × 6', options: [54, 45, 63, 56], correct: 54 },
  { prompt: '45 ÷ 5', options: [7, 8, 9, 6], correct: 9 },
  { prompt: '35 + 27', options: [52, 62, 61, 72], correct: 62 },
  { prompt: '80 − 24', options: [54, 66, 56, 46], correct: 56 },
  { prompt: '12 × 4', options: [48, 44, 36, 52], correct: 48 },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onStartPreset,
  onQuickDrillTable,
  playerStats,
  playerName,
  playerAvatar,
}) => {
  // Interactive Mini-Défi State
  const [qIndex, setQIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [miniScore, setMiniScore] = useState<number>(0);

  const currentQ = MINI_QUESTIONS[qIndex % MINI_QUESTIONS.length];

  const handleMiniAnswer = (choice: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choice);
    const correct = choice === currentQ.correct;
    setIsAnswerCorrect(correct);

    if (correct) {
      sounds.playCorrect();
      setMiniScore((s) => s + 1);
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#38bdf8'],
        });
      } catch {
        // confetti fallback
      }
    } else {
      sounds.playIncorrect();
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
      setQIndex((prev) => (prev + 1) % MINI_QUESTIONS.length);
    }, 1200);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* ========================================================
          HERO SECTION
         ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-10 lg:p-12">
        {/* Decorative background glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>🎒 Devoirs & Révisions de Toussaint · Classe de CM1.2</span>
              <span className="text-amber-500/60 hidden sm:inline">•</span>
              <span className="text-slate-300 font-normal hidden sm:inline">Calcul Mental & Auto-Dictée</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Travail pendant les vacances de la Toussaint pour les{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  CM1.2
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Entraîne-toi sur <strong>MentaloMath</strong> pour les tables et les 4 opérations, maîtrise l'<strong>Auto-Dictée en 4 étapes progressives</strong>, et active le <strong>chrono à l'envie</strong> sur tous les exercices pour débloquer de nouveaux trophées !
              </p>
            </div>

            {/* Key Action Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
              {/* Button 1: Calcul Mental (MentaloMath) */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onNavigate('play');
                }}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-base"
              >
                <Calculator className="w-5 h-5 fill-slate-950" />
                <span>MentaloMath (Calcul Mental)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Button 2: Auto-Dictée */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onNavigate('autodictee');
                }}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-base"
              >
                <PenTool className="w-5 h-5 text-slate-950" />
                <span>L'Auto-Dictée (4 Exercices)</span>
                <Sparkles className="w-4 h-4 text-emerald-950" />
              </button>

              {/* Button 3: Mes Trophées */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onNavigate('stats');
                }}
                className="flex items-center gap-2 px-5 py-3.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-bold rounded-xl border border-purple-500/40 hover:border-purple-400 transition-all cursor-pointer text-base"
              >
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Nouveaux Trophées</span>
              </button>

              {/* Button 4: Tables & Astuces */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onNavigate('learn');
                }}
                className="flex items-center gap-2 px-4 py-3.5 bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white font-semibold rounded-xl border border-slate-700 hover:border-slate-600 transition-all cursor-pointer text-sm"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Tables & Astuces</span>
              </button>
            </div>

            {/* Micro Stats & Avatar Greeting */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-xl" role="img" aria-label={playerAvatar.name}>
                  {playerAvatar.emoji}
                </span>
                <span>
                  Bonjour <strong className="text-slate-200">{playerName}</strong> !
                </span>
              </div>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Award className="w-4 h-4 text-amber-400" />
                <span>
                  <strong className="text-white">{playerStats.unlockedBadgeIds.length}</strong> / 12 trophées débloqués
                </span>
              </div>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Zap className="w-4 h-4 text-sky-400" />
                <span>
                  <strong className="text-white">{playerStats.totalQuestions}</strong> calculs résolus
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Mini Interactive Défi Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Mini Défi Éclair</h3>
                    <p className="text-[11px] text-slate-400">Teste tes réflexes immédiatement !</p>
                  </div>
                </div>
                {miniScore > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {miniScore} réusi{miniScore > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Question display */}
              <div className="my-4 py-4 px-3 bg-slate-900/90 rounded-xl border border-slate-800 text-center">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Combien font ?
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 tracking-wider">
                  {currentQ.prompt} = <span className="text-slate-500">?</span>
                </div>
              </div>

              {/* Choices */}
              <div className="grid grid-cols-2 gap-2.5">
                {currentQ.options.map((choice) => {
                  let btnStyle = 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-white';
                  if (selectedAnswer !== null) {
                    if (choice === currentQ.correct) {
                      btnStyle = 'bg-emerald-600 border-emerald-500 text-white ring-2 ring-emerald-400';
                    } else if (choice === selectedAnswer) {
                      btnStyle = 'bg-rose-600 border-rose-500 text-white';
                    } else {
                      btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={choice}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleMiniAnswer(choice)}
                      className={`py-3 px-2 rounded-xl text-lg font-bold border transition-all cursor-pointer ${btnStyle}`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              {/* Feedback note */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {isAnswerCorrect === true
                    ? '🎉 Bravo, excellente réponse !'
                    : isAnswerCorrect === false
                    ? '❌ Pas tout à fait, essaie encore !'
                    : 'Clique sur le bon résultat.'}
                </span>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onNavigate('play');
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Jouer en plein écran</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ESPACES DE JEU & EXTENSIONS (Modulaire & Évolutif)
         ======================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              Espaces & Modules MentaloMath
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tout pour progresser à ton rythme
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Choisis ton mode d'entraînement favori ou découvre les nouveautés et modules à venir.
          </p>
        </div>

        {/* Grid of Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Module 1: Grand Défi Calcul Mental (MentaloMath) */}
          <div className="relative group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-lg ring-1 ring-amber-500/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-orange-500/20">
                  <Calculator className="w-6 h-6 text-slate-950" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Chrono Activable ⏱️</span>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  MentaloMath (Calcul Mental)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  Sprint 60 secondes, Marathon de 20 questions ou Entraînement zen. Choix multiples ou pavé numérique avec chronomètre activable à l'envie.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-amber-300 font-medium">× Multiplications</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-emerald-300 font-medium">+ Additions</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-rose-300 font-medium">− Soustractions</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-sky-300 font-medium">÷ Divisions</span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onNavigate('play');
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-md"
            >
              <Calculator className="w-4 h-4" />
              <span>Lancer MentaloMath</span>
            </button>
          </div>

          {/* Module 2: L'Atelier d'Auto-Dictée CM1.2 (Français) */}
          <div className="relative group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-lg ring-1 ring-emerald-500/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                  <PenTool className="w-6 h-6 text-slate-950" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>4 Exercices · Chrono ⏱️</span>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  L'Auto-Dictée (CM1.2)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  Méthode progressive en 4 étapes : 1. Recopier le modèle · 2. Dictée à trous préparée par les parents · 3. Écrire avec tirets (_ _ _) · 4. Rédiger sans aide de mémoire !
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-emerald-300 font-medium">1. Recopier</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-sky-300 font-medium">2. À trous (Parents)</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-amber-300 font-medium">3. Avec tirets _ _ _</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-purple-300 font-medium">4. Sans aide</span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onNavigate('autodictee');
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-md"
            >
              <PenTool className="w-4 h-4" />
              <span>Ouvrir l'Auto-Dictée</span>
            </button>
          </div>

          {/* Module 3: Le Panthéon des Nouveaux Trophées & Stats */}
          <div className="relative group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-lg ring-1 ring-purple-500/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                  <Trophy className="w-6 h-6 text-amber-300" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {playerStats.unlockedBadgeIds.length} / 22 Débloqués
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  Nouveaux Trophées CM1.2
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  Badges de calcul mental, de dictée progressive, de chrono et trophées exclusifs des vacances de la Toussaint avec rang d'élève !
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-amber-300 font-medium">Trophées Maths</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-emerald-300 font-medium">Trophées Auto-Dictée</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-sky-300 font-medium">Défis Chrono ⏱️</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-purple-300 font-medium">Spécial Toussaint 🎒</span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onNavigate('stats');
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-md"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Voir mes Nouveaux Trophées</span>
            </button>
          </div>

          {/* Module 4: Future addition - Énigmes & Problèmes */}
          <div className="relative group bg-slate-900/40 border border-slate-800/80 border-dashed rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Puzzle className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Bientôt disponible
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">
                  Énigmes & Problèmes Illustrés
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  De petits problèmes concrets de la vie quotidienne pour appliquer le calcul mental en situation réelle.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800 text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Extension en préparation pour MentaloMath</span>
            </div>
          </div>

          {/* Module 5: Future addition - Duels & Tournois */}
          <div className="relative group bg-slate-900/40 border border-slate-800/80 border-dashed rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
                  <Users2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Bientôt disponible
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">
                  Défis de Classe & Tournois
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  Défie un camarade sur le même appareil ou participe aux tournois hebdomadaires de calcul rapide.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800 text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>Extension en préparation pour MentaloMath</span>
            </div>
          </div>

          {/* Module 6: Future addition - Flash Géométrie & Logique */}
          <div className="relative group bg-slate-900/40 border border-slate-800/80 border-dashed rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <Shapes className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  Bientôt disponible
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">
                  Fractions & Géométrie Flash
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  Fractions visuelles, suites logiques de nombres et reconnaissance de figures pour développer la logique spatiale.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800 text-xs text-slate-500 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-teal-400" />
              <span>Extension en préparation pour MentaloMath</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ACCÈS RAPIDE PAR TABLE (1 à 12)
         ======================================================== */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Entraînement Express : Choisis ta table
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Un clic sur un numéro lance immédiatement une série de 15 questions ciblées sur cette table.
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onNavigate('learn');
            }}
            className="text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Voir toutes les tables détaillées</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
            <button
              key={num}
              onClick={() => {
                sounds.playClick();
                onQuickDrillTable(num);
              }}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-slate-800/90 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-700/80 hover:border-amber-400 transition-all font-bold group cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title={`S'entraîner sur la table de ${num}`}
            >
              <span className="text-[10px] text-slate-400 group-hover:text-slate-900 uppercase font-semibold">Table</span>
              <span className="text-xl sm:text-2xl font-extrabold">{num}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================
          PÉDAGOGIE & NIVEAUX SCOLAIRES (CP AU CM2)
         ======================================================== */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-sky-300 uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            Progression pédagogique
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Un apprentissage adapté à chaque classe
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Conforme aux repères de progressivité des programmes officiels de l'Éducation Nationale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Cycle 2 : CP - CE1 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                CP · CE1
              </span>
              <span className="text-xs text-slate-400 font-semibold">Cycle 2</span>
            </div>
            <h3 className="text-lg font-bold text-white">Premiers pas en calcul</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Additions et compléments à 10</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Doubles, moitiés et table de 2</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Table de 10 et zéros magiques</span>
              </li>
            </ul>
            <button
              onClick={() => {
                sounds.playClick();
                if (onStartPreset) {
                  onStartPreset('facile', 'TARGET_QUESTIONS');
                } else {
                  onNavigate('play');
                }
              }}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Mode Débutant (Facile)
            </button>
          </div>

          {/* Cycle 2 : CE2 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                CE2
              </span>
              <span className="text-xs text-slate-400 font-semibold">Consolidation</span>
            </div>
            <h3 className="text-lg font-bold text-white">Automatisation des tables</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Tables de 3, 4 et 5 maîtrisées</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Soustractions de tête et retenues</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Pavé numérique & sprints de 60s</span>
              </li>
            </ul>
            <button
              onClick={() => {
                sounds.playClick();
                if (onStartPreset) {
                  onStartPreset('moyen', 'CHRONO_SPRINT');
                } else {
                  onNavigate('play');
                }
              }}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Mode Intermédiaire (Moyen)
            </button>
          </div>

          {/* Cycle 3 : CM1 - CM2 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                CM1 · CM2
              </span>
              <span className="text-xs text-slate-400 font-semibold">Cycle 3</span>
            </div>
            <h3 className="text-lg font-bold text-white">Maîtrise des 4 opérations</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Tables complètes de 1 à 12</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Divisions exactes & facteurs cachés</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Défis experts & records de vitesse</span>
              </li>
            </ul>
            <button
              onClick={() => {
                sounds.playClick();
                if (onStartPreset) {
                  onStartPreset('difficile', 'CHRONO_SPRINT');
                } else {
                  onNavigate('play');
                }
              }}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Mode Expert (Difficile)
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          POURQUOI MENTALOMATH ? (Atouts & Bienveillance)
         ======================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">Rétroaction immédiate</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Comprends immédiatement tes erreurs grâce aux corrigés bienveillants et aux explications visuelles.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">100% Serein & Sans Pub</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Aucun compte requis, aucune publicité intrusive : une concentration totale sur le plaisir d'apprendre.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
            <Brain className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">Astuces de calcul</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Des fiches pratiques pour mémoriser les tables sans effort grâce à des astuces mnémotechniques simples.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">Système de Trophées</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gagne des badges motivants au fil de tes entraînements pour célébrer chaque étape de ta progression.
          </p>
        </div>
      </section>

      {/* ========================================================
          CALL TO ACTION FINAL
         ======================================================== */}
      <section className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            Prêt à devenir un crack des maths ?
          </h3>
          <p className="text-sm sm:text-base text-slate-300">
            Rejoins les milliers de calculs résolus sur MentaloMath. Choisis ton avatar, relève ton premier sprint et décroche ton premier trophée !
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              sounds.playClick();
              onNavigate('play');
            }}
            className="flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer text-base"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Commencer l'entraînement</span>
          </button>
        </div>
      </section>
    </div>
  );
};
