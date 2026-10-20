import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Timer,
  Heart,
  Zap,
  Flame,
  HelpCircle,
  Delete,
  Check,
  ChevronRight,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  GameMode,
  GameSettings,
  Question,
  AnswerRecord,
} from '../game/types.ts';
import {
  generateQuestion,
  calculatePoints,
  getStreakMultiplier,
  TABLE_TIPS,
} from '../game/engine.ts';
import { sounds } from '../utils/audio.ts';
import { ExerciseChrono } from './ExerciseChrono.tsx';

interface GameScreenProps {
  settings: GameSettings;
  gameMode: GameMode;
  onFinishGame: (answers: AnswerRecord[], finalScore: number, elapsedMs: number) => void;
  onExitGame: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  settings,
  gameMode,
  onFinishGame,
  onExitGame,
}) => {
  // Game state
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() =>
    generateQuestion(settings)
  );
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [lives, setLives] = useState<number>(3);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [lastPointsEarned, setLastPointsEarned] = useState<number>(0);
  const [explanationActive, setExplanationActive] = useState<boolean>(false);
  const [lastMistakeRecord, setLastMistakeRecord] = useState<AnswerRecord | null>(null);

  // Timing
  const questionStartTimeRef = useRef<number>(Date.now());
  const gameStartTimeRef = useRef<number>(Date.now());
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(() => {
    return gameMode === 'CHRONO_SPRINT' ? settings.durationSeconds : 0;
  });
  const [survivalQuestionTime, setSurvivalQuestionTime] = useState<number>(8);

  const livesRef = useRef(lives);
  livesRef.current = lives;
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const feedbackRef = useRef(feedback);
  feedbackRef.current = feedback;
  const currentQuestionRef = useRef(currentQuestion);
  currentQuestionRef.current = currentQuestion;
  const explanationActiveRef = useRef(explanationActive);
  explanationActiveRef.current = explanationActive;

  const completeGame = useCallback(() => {
    const elapsed = Date.now() - gameStartTimeRef.current;
    onFinishGame(answersRef.current, scoreRef.current, elapsed);
  }, [onFinishGame]);

  useEffect(() => {
    if (gameMode !== 'CHRONO_SPRINT') return;

    const interval = window.setInterval(() => {
      if (explanationActiveRef.current) return;

      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          completeGame();
          return 0;
        }
        if (prev <= 6) {
          sounds.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameMode, completeGame]);

  useEffect(() => {
    if (gameMode !== 'SURVIVAL') return;
    if (explanationActive) return;

    const timeLimit = Math.max(3.5, 8 - answers.length * 0.25);
    setSurvivalQuestionTime(timeLimit);

    const stepMs = 100;
    const interval = window.setInterval(() => {
      setSurvivalQuestionTime((prev) => {
        if (prev <= 0.1) {
          handleAnswer(-999, true);
          return timeLimit;
        }
        return prev - 0.1;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [gameMode, currentQuestion, explanationActive, answers.length]);

  const handleAnswer = useCallback(
    (userVal: number, isTimeout: boolean = false) => {
      if (feedbackRef.current !== 'idle') return;

      const timeSpent = Date.now() - questionStartTimeRef.current;
      const isCorrect = !isTimeout && userVal === currentQuestionRef.current.correctAnswer;
      const earned = calculatePoints(isCorrect, timeSpent, streak);

      const record: AnswerRecord = {
        question: currentQuestionRef.current,
        userAnswer: isTimeout ? -1 : userVal,
        isCorrect,
        timeSpentMs: timeSpent,
        pointsEarned: earned,
      };

      const nextAnswers = [...answersRef.current, record];
      setAnswers(nextAnswers);
      answersRef.current = nextAnswers;

      if (isCorrect) {
        sounds.playCorrect(streak);
        setFeedback('correct');
        setLastPointsEarned(earned);
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        const nextScore = scoreRef.current + earned;
        setScore(nextScore);
        scoreRef.current = nextScore;

        if (nextStreak === 5 || nextStreak === 10 || nextStreak === 20) {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
          });
        }

        if (
          gameMode === 'TARGET_QUESTIONS' &&
          nextAnswers.length >= settings.targetQuestionsCount
        ) {
          setTimeout(() => {
            completeGame();
          }, 350);
          return;
        }

        setTimeout(() => {
          setFeedback('idle');
          setCurrentInput('');
          const nextQ = generateQuestion(settings, currentQuestionRef.current.id);
          setCurrentQuestion(nextQ);
          questionStartTimeRef.current = Date.now();
        }, 320);
      } else {
        sounds.playIncorrect();
        setFeedback('wrong');
        setStreak(0);
        setLastMistakeRecord(record);

        let remainingLives = livesRef.current;
        if (gameMode === 'SURVIVAL') {
          remainingLives = livesRef.current - 1;
          setLives(remainingLives);
          livesRef.current = remainingLives;
        }

        if (gameMode === 'PRACTICE') {
          setExplanationActive(true);
          return;
        }

        if (gameMode === 'SURVIVAL' && remainingLives <= 0) {
          setTimeout(() => {
            completeGame();
          }, 600);
          return;
        }

        if (
          gameMode === 'TARGET_QUESTIONS' &&
          nextAnswers.length >= settings.targetQuestionsCount
        ) {
          setTimeout(() => {
            completeGame();
          }, 600);
          return;
        }

        setTimeout(() => {
          setFeedback('idle');
          setCurrentInput('');
          const nextQ = generateQuestion(settings, currentQuestionRef.current.id);
          setCurrentQuestion(nextQ);
          questionStartTimeRef.current = Date.now();
        }, 650);
      }
    },
    [streak, settings, gameMode, completeGame]
  );

  const handleDismissExplanation = () => {
    sounds.playClick();
    setExplanationActive(false);
    setFeedback('idle');
    setCurrentInput('');
    const nextQ = generateQuestion(settings, currentQuestion.id);
    setCurrentQuestion(nextQ);
    questionStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (explanationActive) {
        if (e.key === 'Enter' || e.key === ' ') {
          handleDismissExplanation();
        }
        return;
      }

      if (settings.inputMode === 'CHOICES') {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (currentQuestion.choices[idx] !== undefined) {
            handleAnswer(currentQuestion.choices[idx]);
          }
        }
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        sounds.playClick();
        setCurrentInput((prev) => {
          if (prev.length >= 4) return prev;
          return prev + e.key;
        });
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        sounds.playClick();
        setCurrentInput((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentInput.trim().length > 0) {
          const val = parseInt(currentInput.trim(), 10);
          if (!isNaN(val)) {
            handleAnswer(val);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [explanationActive, settings.inputMode, currentQuestion, currentInput, handleAnswer]);

  const handleNumClick = (digit: string) => {
    sounds.playClick();
    setCurrentInput((prev) => {
      if (prev.length >= 4) return prev;
      return prev + digit;
    });
  };

  const handleClear = () => {
    sounds.playClick();
    setCurrentInput('');
  };

  const handleValidate = () => {
    if (currentInput.trim().length > 0) {
      const val = parseInt(currentInput.trim(), 10);
      if (!isNaN(val)) {
        handleAnswer(val);
      }
    }
  };

  const multiplier = getStreakMultiplier(streak);
  const tip = TABLE_TIPS[currentQuestion.factorA];
  const operatorSymbol =
    currentQuestion.operator === 'x'
      ? '×'
      : currentQuestion.operator === '-'
      ? '−'
      : currentQuestion.operator === '+'
      ? '+'
      : '÷';

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-150">
      {/* Top Game HUD */}
      <div className="bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              if (window.confirm('Veux-tu vraiment quitter cette partie ?')) {
                onExitGame();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors cursor-pointer"
            title="Quitter la partie"
            aria-label="Quitter"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {gameMode === 'CHRONO_SPRINT' && 'Sprint Chrono'}
              {gameMode === 'TARGET_QUESTIONS' && 'Course 20 Calculs'}
              {gameMode === 'SURVIVAL' && 'Défi 3 Vies'}
              {gameMode === 'PRACTICE' && 'Entraînement Zen'}
            </div>
            <div className="font-extrabold text-white text-lg sm:text-xl tabular-nums">
              {score} <span className="text-xs font-bold text-amber-400">pts</span>
            </div>
          </div>
        </div>

        {/* Center: Streak / Combo */}
        <div className="flex items-center gap-1.5">
          {streak >= 2 ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-slate-950 rounded-full text-xs font-black shadow-sm animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>x{multiplier} COMBO ({streak})</span>
            </div>
          ) : (
            <div className="text-xs font-semibold text-slate-400">
              {answers.length} calcul{answers.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Right: Timer / Lives / Count */}
        <div className="flex items-center gap-2">
          {gameMode === 'CHRONO_SPRINT' && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold tabular-nums text-sm ${
                timeRemainingSeconds <= 10
                  ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40 animate-pulse'
                  : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
              }`}
            >
              <Timer className="w-4 h-4 text-amber-400" />
              <span>{timeRemainingSeconds}s</span>
            </div>
          )}

          {gameMode === 'TARGET_QUESTIONS' && (
            <div className="px-3 py-1 bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30 rounded-xl font-bold text-sm tabular-nums">
              {answers.length} / {settings.targetQuestionsCount}
            </div>
          )}

          {gameMode === 'SURVIVAL' && (
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-5 h-5 transition-transform ${
                    heartIndex <= lives
                      ? 'fill-rose-500 text-rose-500 scale-100'
                      : 'fill-slate-800 text-slate-700 scale-90'
                  }`}
                />
              ))}
            </div>
          )}

          {gameMode === 'PRACTICE' && (
            <div className="px-3 py-1 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 rounded-xl font-bold text-xs">
              Zen
            </div>
          )}
        </div>
      </div>

      {/* Chronomètre activable à l'envie */}
      <ExerciseChrono
        id="math_game_chrono"
        label="Chronomètre Calcul Mental"
        compact={true}
      />

      {/* Main Question Arena Card */}
      <div
        className={`relative bg-slate-900 rounded-3xl p-6 sm:p-10 border-2 transition-all shadow-lg text-center ${
          feedback === 'correct'
            ? 'border-emerald-500 bg-emerald-500/10 scale-101'
            : feedback === 'wrong'
            ? 'border-rose-500 bg-rose-500/10 shake'
            : 'border-slate-800'
        }`}
      >
        {feedback === 'correct' && (
          <div className="absolute top-4 right-6 text-sm sm:text-base font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full animate-bounce">
            +{lastPointsEarned} pts !
          </div>
        )}

        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          {currentQuestion.operator === 'x' && `Table de ${currentQuestion.factorA} · Multiplication`}
          {currentQuestion.operator === '+' && `Addition`}
          {currentQuestion.operator === '-' && `Soustraction`}
          {currentQuestion.operator === '÷' && `Division`}
        </div>

        {/* Display equation */}
        <div className="text-4xl sm:text-6xl font-black text-white tracking-tight font-display mb-4">
          {settings.inputMode === 'NUMPAD' ? (
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {currentQuestion.missingPart === 'factorA' ? (
                <>
                  <span
                    className={`inline-block min-w-[70px] sm:min-w-[100px] h-14 sm:h-20 rounded-2xl border-2 flex items-center justify-center font-mono ${
                      currentInput
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                        : 'border-dashed border-slate-700 text-slate-600'
                    }`}
                  >
                    {currentInput || '?'}
                  </span>
                  <span>{operatorSymbol}</span>
                  <span>{currentQuestion.factorB}</span>
                  <span>=</span>
                  <span>
                    {currentQuestion.operator === 'x'
                      ? currentQuestion.correctAnswer * currentQuestion.factorB
                      : currentQuestion.operator === '+'
                      ? currentQuestion.correctAnswer + currentQuestion.factorB
                      : currentQuestion.operator === '-'
                      ? currentQuestion.correctAnswer - currentQuestion.factorB
                      : currentQuestion.correctAnswer / currentQuestion.factorB}
                  </span>
                </>
              ) : currentQuestion.missingPart === 'factorB' ? (
                <>
                  <span>{currentQuestion.factorA}</span>
                  <span>{operatorSymbol}</span>
                  <span
                    className={`inline-block min-w-[70px] sm:min-w-[100px] h-14 sm:h-20 rounded-2xl border-2 flex items-center justify-center font-mono ${
                      currentInput
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                        : 'border-dashed border-slate-700 text-slate-600'
                    }`}
                  >
                    {currentInput || '?'}
                  </span>
                  <span>=</span>
                  <span>
                    {currentQuestion.operator === 'x'
                      ? currentQuestion.factorA * currentQuestion.correctAnswer
                      : currentQuestion.operator === '+'
                      ? currentQuestion.factorA + currentQuestion.correctAnswer
                      : currentQuestion.operator === '-'
                      ? currentQuestion.factorA - currentQuestion.correctAnswer
                      : currentQuestion.factorA / currentQuestion.correctAnswer}
                  </span>
                </>
              ) : (
                <>
                  <span>{currentQuestion.factorA}</span>
                  <span className="text-amber-400">{operatorSymbol}</span>
                  <span>{currentQuestion.factorB}</span>
                  <span className="text-slate-500">=</span>
                  <span
                    className={`inline-block min-w-[70px] sm:min-w-[110px] h-14 sm:h-20 rounded-2xl border-2 flex items-center justify-center font-mono ${
                      feedback === 'wrong'
                        ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                        : currentInput
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                        : 'border-dashed border-slate-700 text-slate-600'
                    }`}
                  >
                    {feedback === 'wrong' ? currentQuestion.correctAnswer : currentInput || '?'}
                  </span>
                </>
              )}
            </div>
          ) : (
            <span>{currentQuestion.displayPrompt}</span>
          )}
        </div>

        {feedback === 'wrong' && (
          <div className="text-sm font-bold text-rose-400 animate-in fade-in">
            Oups ! La bonne réponse était{' '}
            <span className="font-extrabold text-base underline text-rose-300">{currentQuestion.correctAnswer}</span>
          </div>
        )}

        {gameMode === 'SURVIVAL' && (
          <div className="w-full bg-slate-800 h-2 rounded-full mt-6 overflow-hidden">
            <div
              className="bg-rose-500 h-full transition-all duration-100 ease-linear"
              style={{ width: `${Math.min(100, (survivalQuestionTime / 8) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Pedagogical Explanation View */}
      {explanationActive && lastMistakeRecord && (
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30 rounded-full text-xs font-bold mb-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Astuce Visuelle & Explication</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                {lastMistakeRecord.question.displayPrompt.replace('?', String(lastMistakeRecord.question.correctAnswer))}
              </h3>
            </div>
          </div>

          {/* Explanation based on operator */}
          {lastMistakeRecord.question.operator === 'x' && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Représentation en grille ({lastMistakeRecord.question.factorA} rangées de {lastMistakeRecord.question.factorB} carrés) :
              </div>
              <div className="flex flex-col gap-1.5 items-center justify-center py-2 max-h-48 overflow-auto">
                {Array.from({ length: lastMistakeRecord.question.factorA }).map((_, rIdx) => (
                  <div key={rIdx} className="flex gap-1.5">
                    {Array.from({ length: lastMistakeRecord.question.factorB }).map((_, cIdx) => (
                      <div
                        key={cIdx}
                        className="w-5 h-5 rounded-md bg-amber-400 border border-amber-300/30 shadow-2xs"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {lastMistakeRecord.question.operator === '÷' && (
            <div className="p-4 bg-sky-950/60 rounded-2xl border border-sky-800/60 text-sm text-sky-200 space-y-2">
              <div className="font-bold text-sky-400 text-base">La division est l'inverse de la multiplication :</div>
              <div>
                Puisque <span className="font-bold text-white">{lastMistakeRecord.question.factorB} × {lastMistakeRecord.question.correctAnswer} = {lastMistakeRecord.question.factorA}</span>,
                alors <span className="font-bold text-white">{lastMistakeRecord.question.factorA} ÷ {lastMistakeRecord.question.factorB} = {lastMistakeRecord.question.correctAnswer}</span> !
              </div>
            </div>
          )}

          {lastMistakeRecord.question.operator === '+' && (
            <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-800/60 text-sm text-emerald-200">
              <div className="font-bold text-emerald-400 mb-1">Addition :</div>
              <div>
                En partant de {lastMistakeRecord.question.factorA}, on ajoute {lastMistakeRecord.question.factorB} pour arriver à {lastMistakeRecord.question.correctAnswer}.
              </div>
            </div>
          )}

          {lastMistakeRecord.question.operator === '-' && (
            <div className="p-4 bg-rose-950/60 rounded-2xl border border-rose-800/60 text-sm text-rose-200">
              <div className="font-bold text-rose-400 mb-1">Soustraction :</div>
              <div>
                En retirant {lastMistakeRecord.question.factorB} de {lastMistakeRecord.question.factorA}, il reste {lastMistakeRecord.question.correctAnswer}.
              </div>
            </div>
          )}
          {lastMistakeRecord.question.operator === 'x' && tip && (
            <div className="p-3 bg-emerald-950/60 text-emerald-200 rounded-xl border border-emerald-800/60">
              <span className="font-bold block text-xs uppercase tracking-wider text-emerald-400 mb-1">
                {tip.title} :
              </span>
              <div className="text-xs text-slate-300">{tip.tip}</div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleDismissExplanation}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <span>J'ai compris, calcul suivant !</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Answer Controls */}
      {!explanationActive && (
        <>
          {settings.inputMode === 'CHOICES' ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {currentQuestion.choices.map((choice, idx) => {
                const colorSchemes = [
                  'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20',
                  'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20',
                  'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20',
                  'bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/20',
                ];
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(choice)}
                    className={`h-20 sm:h-24 rounded-2xl font-black text-2xl sm:text-3xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center cursor-pointer ${colorSchemes[idx % colorSchemes.length]}`}
                  >
                    <span>{choice}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-md max-w-sm mx-auto">
              <div className="grid grid-cols-3 gap-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleNumClick(digit)}
                    className="h-14 sm:h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-amber-500/20 active:text-amber-400 text-white font-black text-2xl transition-all shadow-2xs flex items-center justify-center cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}

                <button
                  onClick={handleClear}
                  className="h-14 sm:h-16 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-sm transition-all shadow-2xs flex items-center justify-center cursor-pointer"
                  title="Effacer"
                  aria-label="Effacer"
                >
                  <Delete className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleNumClick('0')}
                  className="h-14 sm:h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-amber-500/20 active:text-amber-400 text-white font-black text-2xl transition-all shadow-2xs flex items-center justify-center cursor-pointer"
                >
                  0
                </button>

                <button
                  onClick={handleValidate}
                  disabled={currentInput.length === 0}
                  className={`h-14 sm:h-16 rounded-2xl font-black text-base transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                    currentInput.length > 0
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-95'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                  aria-label="Valider"
                >
                  <Check className="w-6 h-6 stroke-[3]" />
                </button>
              </div>

              <div className="mt-3 text-center text-[11px] font-medium text-slate-400">
                Tu peux aussi utiliser les touches de ton clavier et la touche Entrée !
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
