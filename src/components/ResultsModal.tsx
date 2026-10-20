import React, { useState, useEffect } from 'react';
import {
  Trophy,
  RotateCcw,
  Sliders,
  CheckCircle2,
  XCircle,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnswerRecord, GameMode } from '../game/types.ts';
import { ALL_BADGES } from '../game/engine.ts';
import { sounds } from '../utils/audio.ts';

interface ResultsModalProps {
  answers: AnswerRecord[];
  finalScore: number;
  elapsedMs: number;
  gameMode: GameMode;
  newlyUnlockedBadgeIds: string[];
  onPlayAgain: () => void;
  onChangeSettings: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  answers,
  finalScore,
  elapsedMs,
  gameMode,
  newlyUnlockedBadgeIds,
  onPlayAgain,
  onChangeSettings,
}) => {
  const [filter, setFilter] = useState<'all' | 'mistakes'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const totalQuestions = answers.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const mistakes = answers.filter((a) => !a.isCorrect);

  let stars = 1;
  if (accuracy >= 90 && totalQuestions >= 5) stars = 3;
  else if (accuracy >= 70 && totalQuestions >= 3) stars = 2;

  useEffect(() => {
    sounds.playFanfare();
    if (stars >= 2) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  }, [stars]);

  const displayedAnswers = filter === 'mistakes' ? mistakes : answers;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl text-center">
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-300 ${
                s <= stars
                  ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-md'
                  : 'fill-slate-800 text-slate-700'
              }`}
            />
          ))}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          {stars === 3 ? '🎉 Exceptionnel, quel champion !' : stars === 2 ? '👏 Bravo, très beau score !' : '💪 Bien joué, continue à t’entraîner !'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {gameMode === 'CHRONO_SPRINT' && 'Défi 60s terminé avec brio !'}
          {gameMode === 'TARGET_QUESTIONS' && `Série de calculs terminée en ${(elapsedMs / 1000).toFixed(1)} secondes.`}
          {gameMode === 'SURVIVAL' && `Tu as survécu à ${correctCount} calculs !`}
          {gameMode === 'PRACTICE' && 'Session d’entraînement zen accomplie.'}
        </p>

        {/* Score and Stats KPI cards */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Score Total</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums font-mono mt-0.5">
              {finalScore}
            </div>
          </div>

          <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Réussite</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 tabular-nums font-mono mt-0.5">
              {accuracy}%
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">{correctCount}/{totalQuestions} justes</div>
          </div>

          <div className="p-3.5 bg-sky-500/10 rounded-2xl border border-sky-500/20">
            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Temps Moyen</div>
            <div className="text-2xl sm:text-3xl font-black text-sky-300 tabular-nums font-mono mt-0.5">
              {totalQuestions > 0 ? ((elapsedMs / totalQuestions) / 1000).toFixed(1) : 0}s
            </div>
            <div className="text-[11px] text-sky-400 font-medium">par calcul</div>
          </div>
        </div>

        {/* Unlocked Badges announcement */}
        {newlyUnlockedBadgeIds.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-2xl shadow-md text-left flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black/15 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7 text-amber-100 fill-amber-100" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-950">
                Nouveau Trophée Débloqué !
              </div>
              <div className="font-black text-base text-slate-950">
                {newlyUnlockedBadgeIds.map((id) => {
                  const b = ALL_BADGES.find((x) => x.id === id);
                  return b ? `🏆 ${b.name}` : '';
                }).join(', ')}
              </div>
            </div>
          </div>
        )}

        {/* Play Again and Config buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={() => {
              sounds.playClick();
              onPlayAgain();
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Rejouer ce défi</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onChangeSettings();
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer border border-slate-700"
          >
            <Sliders className="w-5 h-5 text-slate-400" />
            <span>Changer de défi ou de tables</span>
          </button>
        </div>
      </div>

      {/* Questions Review Section */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-lg">Revue des calculs</h3>
          <div className="inline-flex p-1 bg-slate-800 rounded-lg border border-slate-700">
            <button
              onClick={() => {
                sounds.playClick();
                setFilter('all');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-400'
              }`}
            >
              Tous ({answers.length})
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setFilter('mistakes');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filter === 'mistakes' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-400'
              }`}
            >
              Erreurs ({mistakes.length})
            </button>
          </div>
        </div>

        {displayedAnswers.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-500">
            {filter === 'mistakes' ? '🎉 Aucune erreur à réviser, félicitations !' : 'Aucun calcul enregistré.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto pr-1">
            {displayedAnswers.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div key={idx} className="py-2.5">
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-800/60 p-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                      <span className="font-bold text-white text-base">
                        {item.question.factorA} {item.question.operator === 'x' ? '×' : item.question.operator} {item.question.factorB} = {item.question.correctAnswer}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      {!item.isCorrect && (
                        <span className="text-rose-400 font-semibold">
                          Ta réponse : {item.userAnswer === -1 ? 'Temps écoulé' : item.userAnswer}
                        </span>
                      )}
                      <span className="text-slate-400 font-mono">{(item.timeSpentMs / 1000).toFixed(1)}s</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-slate-200 space-y-1">
                      <div className="font-bold text-amber-300">
                        Rappel : {item.question.factorA} {item.question.operator === 'x' ? '×' : item.question.operator} {item.question.factorB} = {item.question.correctAnswer}
                      </div>
                      <div className="text-slate-400">
                        {item.question.operator === 'x' && `${item.question.factorA} fois ${item.question.factorB} = ${item.question.correctAnswer}`}
                        {item.question.operator === '+' && `${item.question.factorA} plus ${item.question.factorB} = ${item.question.correctAnswer}`}
                        {item.question.operator === '-' && `${item.question.factorA} moins ${item.question.factorB} = ${item.question.correctAnswer}`}
                        {item.question.operator === '÷' && `${item.question.factorA} divisé par ${item.question.factorB} = ${item.question.correctAnswer}`}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
