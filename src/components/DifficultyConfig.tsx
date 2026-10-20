import React from 'react';
import {
  Timer,
  Target,
  Heart,
  Sparkles,
  Zap,
  Keyboard,
  Layers,
  Plus,
  Minus,
  Divide,
} from 'lucide-react';
import { GameMode, GameSettings, DifficultyPreset, InputMode, MathOperator } from '../game/types.ts';
import { ALL_TABLES, ALL_OPERATORS, PRESET_CONFIGS, OPERATOR_LABELS } from '../game/engine.ts';
import { sounds } from '../utils/audio.ts';

interface DifficultyConfigProps {
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  onStartGame: () => void;
}

export const DifficultyConfig: React.FC<DifficultyConfigProps> = ({
  settings,
  setSettings,
  gameMode,
  setGameMode,
  onStartGame,
}) => {
  const handlePresetSelect = (preset: DifficultyPreset) => {
    sounds.playClick();
    const config = PRESET_CONFIGS[preset];
    setSettings((prev) => ({
      ...prev,
      ...config,
      difficulty: preset,
    }));
  };

  const toggleOperator = (op: MathOperator) => {
    sounds.playClick();
    setSettings((prev) => {
      const current = prev.selectedOperators || ['x'];
      let next: MathOperator[];
      if (current.includes(op)) {
        if (current.length <= 1) return prev; // Keep at least one operator
        next = current.filter((o) => o !== op);
      } else {
        next = [...current, op];
      }
      return {
        ...prev,
        selectedOperators: next,
        difficulty: 'personnalise',
      };
    });
  };

  const selectOperatorsSet = (ops: MathOperator[]) => {
    sounds.playClick();
    setSettings((prev) => ({
      ...prev,
      selectedOperators: ops,
      difficulty: 'personnalise',
    }));
  };

  const toggleTable = (tableNum: number) => {
    sounds.playClick();
    setSettings((prev) => {
      let nextTables: number[];
      if (prev.selectedTables.includes(tableNum)) {
        if (prev.selectedTables.length <= 1) {
          return prev;
        }
        nextTables = prev.selectedTables.filter((t) => t !== tableNum);
      } else {
        nextTables = [...prev.selectedTables, tableNum].sort((a, b) => a - b);
      }
      return {
        ...prev,
        selectedTables: nextTables,
        difficulty: 'personnalise',
      };
    });
  };

  const selectPresetTables = (tables: number[]) => {
    sounds.playClick();
    setSettings((prev) => ({
      ...prev,
      selectedTables: tables,
      difficulty: 'personnalise',
    }));
  };

  const handleInputModeChange = (mode: InputMode) => {
    sounds.playClick();
    setSettings((prev) => ({ ...prev, inputMode: mode }));
  };

  const activeOperators = settings.selectedOperators || ['x'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white p-6 sm:p-8 shadow-xl shadow-orange-500/10">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/25 backdrop-blur-xs rounded-full text-xs font-bold text-amber-200 uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            MentaloMath · Du CP au CM2 · 4 Opérations
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-display">
            Deviens un champion du calcul mental avec MentaloMath !
          </h1>
          <p className="text-sm sm:text-base text-amber-100 leading-relaxed font-medium">
            Multiplication, addition, soustraction et division : entraîne-toi, relève des défis chronométrés et collectionne tous les trophées.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-8 text-9xl opacity-15 select-none pointer-events-none">
          🎯
        </div>
      </div>

      {/* Step 1: Choose Game Mode */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>1. Choisis ton type de défi</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">Quel rythme souhaites-tu adopter aujourd'hui ?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Mode 1: Chrono Sprint */}
          <button
            onClick={() => {
              sounds.playClick();
              setGameMode('CHRONO_SPRINT');
            }}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              gameMode === 'CHRONO_SPRINT'
                ? 'border-amber-500 bg-amber-500/15 shadow-md ring-2 ring-amber-500/30 text-white'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-3 shadow-sm font-bold">
              <Timer className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="font-bold text-white text-base">Sprint Chrono</div>
            <div className="text-xs text-slate-400 mt-1">
              60 secondes pour résoudre un maximum de calculs avec combos !
            </div>
          </button>

          {/* Mode 2: Target Questions */}
          <button
            onClick={() => {
              sounds.playClick();
              setGameMode('TARGET_QUESTIONS');
            }}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              gameMode === 'TARGET_QUESTIONS'
                ? 'border-sky-500 bg-sky-500/15 shadow-md ring-2 ring-sky-500/30 text-white'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center mb-3 shadow-sm font-bold">
              <Target className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="font-bold text-white text-base">Course aux 20</div>
            <div className="text-xs text-slate-400 mt-1">
              Chronomètre ton temps pour compléter 20 calculs sans faute.
            </div>
          </button>

          {/* Mode 3: Survival 3 Lives */}
          <button
            onClick={() => {
              sounds.playClick();
              setGameMode('SURVIVAL');
            }}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              gameMode === 'SURVIVAL'
                ? 'border-rose-500 bg-rose-500/15 shadow-md ring-2 ring-rose-500/30 text-white'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-slate-950 flex items-center justify-center mb-3 shadow-sm font-bold">
              <Heart className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div className="font-bold text-white text-base">Défi 3 Vies</div>
            <div className="text-xs text-slate-400 mt-1">
              Survie extrême : 3 cœurs et le temps s'accélère au fil des réussites !
            </div>
          </button>

          {/* Mode 4: Practice Zen */}
          <button
            onClick={() => {
              sounds.playClick();
              setGameMode('PRACTICE');
            }}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              gameMode === 'PRACTICE'
                ? 'border-emerald-500 bg-emerald-500/15 shadow-md ring-2 ring-emerald-500/30 text-white'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center mb-3 shadow-sm font-bold">
              <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="font-bold text-white text-base">Entraînement Zen</div>
            <div className="text-xs text-slate-400 mt-1">
              Sans stress ni compte à rebours, avec explications visuelles en cas d'erreur.
            </div>
          </button>
        </div>
      </section>

      {/* Step 2: Choose Operations */}
      <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              2. Opérations au choix
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Active les opérations que tu souhaites travailler.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => selectOperatorsSet(['x'])}
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md font-medium cursor-pointer"
            >
              Multiplication seule (×)
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => selectOperatorsSet(['+', '-'])}
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md font-medium cursor-pointer"
            >
              Add. & Soustr. (+, −)
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => selectOperatorsSet(['+', '-', 'x', '÷'])}
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md font-medium cursor-pointer"
            >
              Les 4 opérations (+, −, ×, ÷)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Multiplication */}
          <button
            onClick={() => toggleOperator('x')}
            className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
              activeOperators.includes('x')
                ? 'border-amber-500 bg-amber-500/20 text-white ring-1 ring-amber-400/40 shadow-sm'
                : 'border-slate-800 hover:border-slate-700 bg-slate-800/40 text-slate-400'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0">
              ×
            </div>
            <div className="text-left">
              <div className="font-extrabold text-sm text-white">Multiplication</div>
              <div className="text-[11px] text-slate-400">Tables 1 à 12</div>
            </div>
          </button>

          {/* Addition */}
          <button
            onClick={() => toggleOperator('+')}
            className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
              activeOperators.includes('+')
                ? 'border-emerald-500 bg-emerald-500/20 text-white ring-1 ring-emerald-400/40 shadow-sm'
                : 'border-slate-800 hover:border-slate-700 bg-slate-800/40 text-slate-400'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0">
              +
            </div>
            <div className="text-left">
              <div className="font-extrabold text-sm text-white">Addition</div>
              <div className="text-[11px] text-slate-400">Calcul mental positif</div>
            </div>
          </button>

          {/* Subtraction */}
          <button
            onClick={() => toggleOperator('-')}
            className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
              activeOperators.includes('-')
                ? 'border-rose-500 bg-rose-500/20 text-white ring-1 ring-rose-400/40 shadow-sm'
                : 'border-slate-800 hover:border-slate-700 bg-slate-800/40 text-slate-400'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0">
              −
            </div>
            <div className="text-left">
              <div className="font-extrabold text-sm text-white">Soustraction</div>
              <div className="text-[11px] text-slate-400">Résultats positifs</div>
            </div>
          </button>

          {/* Division */}
          <button
            onClick={() => toggleOperator('÷')}
            className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
              activeOperators.includes('÷')
                ? 'border-sky-500 bg-sky-500/20 text-white ring-1 ring-sky-400/40 shadow-sm'
                : 'border-slate-800 hover:border-slate-700 bg-slate-800/40 text-slate-400'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0">
              ÷
            </div>
            <div className="text-left">
              <div className="font-extrabold text-sm text-white">Division</div>
              <div className="text-[11px] text-slate-400">Partages exacts</div>
            </div>
          </button>
        </div>
      </section>

      {/* Step 3: Choose Difficulty Level & Numbers/Tables */}
      <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            3. Niveau et tables / nombres cibles
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Choisis un niveau clé en main ou personnalise exactement tes nombres d'entraînement.
          </p>
        </div>

        {/* Level presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handlePresetSelect('facile')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              settings.difficulty === 'facile'
                ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold shadow-xs'
                : 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-800/40'
            }`}
          >
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">CP / CE1</div>
            <div className="text-sm font-extrabold text-white">Débutant</div>
            <div className="text-[11px] text-slate-400 mt-1">Tables 1, 2, 5, 10</div>
          </button>

          <button
            onClick={() => handlePresetSelect('moyen')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              settings.difficulty === 'moyen'
                ? 'border-amber-500 bg-amber-500/20 text-white font-bold shadow-xs'
                : 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-800/40'
            }`}
          >
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-0.5">CE2</div>
            <div className="text-sm font-extrabold text-white">Intermédiaire</div>
            <div className="text-[11px] text-slate-400 mt-1">Nombres 1 à 10</div>
          </button>

          <button
            onClick={() => handlePresetSelect('difficile')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              settings.difficulty === 'difficile'
                ? 'border-rose-500 bg-rose-500/20 text-white font-bold shadow-xs'
                : 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-800/40'
            }`}
          >
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-0.5">CM1 / CM2</div>
            <div className="text-sm font-extrabold text-white">Expert (4 Opérations)</div>
            <div className="text-[11px] text-slate-400 mt-1">1 à 12 + trous</div>
          </button>

          <button
            onClick={() => handlePresetSelect('personnalise')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              settings.difficulty === 'personnalise'
                ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold shadow-xs'
                : 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-800/40'
            }`}
          >
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">Sur-mesure</div>
            <div className="text-sm font-extrabold text-white">Personnalisé</div>
            <div className="text-[11px] text-slate-400 mt-1">{settings.selectedTables.length} table(s)</div>
          </button>
        </div>

        {/* 12 Individual Table Selection Pills */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Nombres & tables actives ({settings.selectedTables.length}) :
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => selectPresetTables([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])}
                className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md font-medium cursor-pointer"
              >
                Tous (1-12)
              </button>
              <span className="text-slate-600">·</span>
              <button
                onClick={() => selectPresetTables([2, 5, 10])}
                className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md font-medium cursor-pointer"
              >
                Faciles (2, 5, 10)
              </button>
              <span className="text-slate-600">·</span>
              <button
                onClick={() => selectPresetTables([6, 7, 8, 9])}
                className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md font-medium cursor-pointer"
              >
                Défis (6, 7, 8, 9)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
            {ALL_TABLES.map((t) => {
              const isSelected = settings.selectedTables.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTable(t)}
                  className={`h-13 rounded-xl font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-102 ring-2 ring-amber-400'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Table de ${t}`}
                >
                  <span className="text-xs font-semibold opacity-85 leading-none">Table</span>
                  <span className="text-lg leading-tight font-extrabold">{t}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Mode Preference (QCM vs Numpad) */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Méthode de réponse
            </span>
            <p className="text-xs text-slate-400">
              QCM pour les plus jeunes, ou clavier/touches pour s'entraîner à taper vite.
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-800/80 rounded-xl self-start sm:self-auto border border-slate-700">
            <button
              onClick={() => handleInputModeChange('CHOICES')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                settings.inputMode === 'CHOICES'
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>4 Choix Multiples</span>
            </button>
            <button
              onClick={() => handleInputModeChange('NUMPAD')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                settings.inputMode === 'NUMPAD'
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Pavé Numérique</span>
            </button>
          </div>
        </div>
      </section>

      {/* Start Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => {
            sounds.playClick();
            onStartGame();
          }}
          className="w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
        >
          <Zap className="w-6 h-6 fill-slate-950 text-slate-950" />
          <span>Lancer le Défi !</span>
        </button>
      </div>
    </div>
  );
};
