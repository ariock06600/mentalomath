import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
  ArrowRight,
  ArrowLeft,
  Award,
  PenTool,
  Trophy,
  Check,
  Layers,
  Edit3,
  Users,
  Settings,
  Sliders,
  Play,
  RotateCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio.ts';
import {
  DEFAULT_AUTODICTEE,
  OTHER_PRESET_DICTEES,
  AutodicteeLesson,
} from '../game/autodicteeData.ts';
import { ExerciseChrono } from './ExerciseChrono.tsx';

interface AutoDicteeScreenProps {
  onBackToHome: () => void;
  onGoToMath: () => void;
  onUnlockBadges?: (badgeIds: string[]) => void;
}

// 4 Progressive steps:
// 1: Recopier (le modèle sous les yeux)
// 2: Dictée à trous (configurée par les parents puis lancée pour l'enfant)
// 3: Avec tirets (nombre de lettres indiqué par tirets _ _ _)
// 4: Sans aide (de mémoire, dictée complète)
type ExerciseStep = 1 | 2 | 3 | 4;

// Helper to tokenize text into words and punctuation
function tokenizeText(text: string) {
  // Matches words (including accents, apostrophes, typographic apostrophes, hyphens) or punctuation
  const regex = /([a-zA-ZÀ-ÿ0-9'’-]+)|([^\s\wÀ-ÿ0-9'’-]+)|\s+/g;
  const tokens: { type: 'word' | 'punct' | 'space'; value: string }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      tokens.push({ type: 'word', value: match[1] });
    } else if (match[2]) {
      tokens.push({ type: 'punct', value: match[2] });
    } else {
      tokens.push({ type: 'space', value: match[0] });
    }
  }
  return tokens;
}

// Convert a word to dashed representation: e.g. "cailloux" -> "_ _ _ _ _ _ _ _"
function wordToDashes(word: string, revealedLettersCount = 0): string {
  const letters = word.split('');
  return letters
    .map((char, index) => {
      if (char === "'" || char === '’' || char === '-') return char;
      if (index < revealedLettersCount) return char;
      return '_';
    })
    .join(' ');
}

// Normalize for gentle comparison (strip accents, punctuation, case)
function cleanWord(str: string) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?]/g, '')
    .replace(/’/g, "'");
}

export const AutoDicteeScreen: React.FC<AutoDicteeScreenProps> = ({
  onBackToHome,
  onGoToMath,
  onUnlockBadges,
}) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const currentLesson: AutodicteeLesson = OTHER_PRESET_DICTEES[currentLessonIndex] || DEFAULT_AUTODICTEE;

  // Segment selection: 'full' or sentence index 0, 1, 2
  const [selectedSegment, setSelectedSegment] = useState<'full' | number>('full');

  // Exercise step: 1 (recopier), 2 (dictée à trous parents), 3 (tirets), 4 (sans aide)
  const [activeStep, setActiveStep] = useState<ExerciseStep>(1);

  // Active target text based on segment
  const targetText =
    selectedSegment === 'full'
      ? currentLesson.fullText
      : currentLesson.sentences[selectedSegment]?.text || currentLesson.fullText;

  // Audio Speech Synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.85);

  // --- Step 1 State (Recopier) ---
  const [step1Input, setStep1Input] = useState('');
  const [step1Submitted, setStep1Submitted] = useState(false);
  const [step1ShowFeedback, setStep1ShowFeedback] = useState(true);

  // --- Step 2 State (Dictée à trous personnalisée par les parents) ---
  const [step2ParentMode, setStep2ParentMode] = useState<boolean>(true); // true = Configuration parents, false = Mode enfant
  const [step2Holes, setStep2Holes] = useState<Set<number>>(new Set()); // indices of words that are holes
  const [step2ChildInputs, setStep2ChildInputs] = useState<Record<number, string>>({});
  const [step2Submitted, setStep2Submitted] = useState<boolean>(false);
  const [step2RevealedHints, setStep2RevealedHints] = useState<Set<number>>(new Set());

  // --- Step 3 State (Avec tirets - ancien exercice 2) ---
  const wordsList = tokenizeText(targetText).filter((t) => t.type === 'word');
  const [step3CurrentWordIndex, setStep3CurrentWordIndex] = useState(0);
  const [step3WordInput, setStep3WordInput] = useState('');
  const [step3RevealedLetters, setStep3RevealedLetters] = useState<Record<number, number>>({});
  const [step3ValidatedWords, setStep3ValidatedWords] = useState<boolean[]>([]);
  const [step3WordError, setStep3WordError] = useState<string | null>(null);

  // --- Step 4 State (Sans aide - ancien exercice 3) ---
  const [step4Input, setStep4Input] = useState('');
  const [step4Submitted, setStep4Submitted] = useState(false);
  const [step4PeekSeconds, setStep4PeekSeconds] = useState(0);
  const [step4PeekCount, setStep4PeekCount] = useState(0);

  // Stop speech when changing texts or unmounting
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [targetText, activeStep]);

  // Initializing holes for Step 2 whenever targetText or lesson changes
  useEffect(() => {
    const list = tokenizeText(targetText).filter((t) => t.type === 'word');
    const initialHoles = new Set<number>();
    const kwSet = new Set(
      currentLesson.sentences
        .flatMap((s) => s.keyWords || [])
        .map((k) => cleanWord(k))
    );

    list.forEach((w, idx) => {
      if (kwSet.has(cleanWord(w.value))) {
        initialHoles.add(idx);
      }
    });

    // Fallback: if no keywords matched, pick every 3rd word
    if (initialHoles.size === 0) {
      list.forEach((_, idx) => {
        if (idx % 3 === 1) initialHoles.add(idx);
      });
    }

    setStep2Holes(initialHoles);
    setStep2ChildInputs({});
    setStep2Submitted(false);
    setStep2RevealedHints(new Set());
    setStep2ParentMode(true);

    // Reset Step 1
    setStep1Input('');
    setStep1Submitted(false);

    // Reset Step 3 (tirets)
    setStep3CurrentWordIndex(0);
    setStep3WordInput('');
    setStep3RevealedLetters({});
    setStep3ValidatedWords(new Array(list.length).fill(false));
    setStep3WordError(null);

    // Reset Step 4 (sans aide)
    setStep4Input('');
    setStep4Submitted(false);
    setStep4PeekSeconds(0);
  }, [targetText, currentLesson]);

  // Peek timer countdown for Step 4
  useEffect(() => {
    if (step4PeekSeconds > 0) {
      const timer = setTimeout(() => {
        setStep4PeekSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step4PeekSeconds]);

  // Read aloud function
  const handleToggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('La synthèse vocale n’est pas supportée sur ce navigateur.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.lang = 'fr-FR';
    utterance.rate = speechRate;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const frVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('fr') &&
          (v.name.includes('Thomas') ||
            v.name.includes('Amelie') ||
            v.name.includes('Google') ||
            v.name.includes('French'))
      ) || voices.find((v) => v.lang.startsWith('fr'));
    if (frVoice) {
      utterance.voice = frVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // --- Step 1 Validation ---
  const handleValidateStep1 = () => {
    setStep1Submitted(true);
    const isExact = step1Input.trim() === targetText.trim();
    if (isExact) {
      sounds.playCorrect();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      if (onUnlockBadges) {
        onUnlockBadges(['autodictee_step1']);
      }
    } else {
      sounds.playIncorrect();
    }
  };

  // --- Step 2 (Dictée à trous des parents) Handlers ---
  const toggleStep2Hole = (wordIndex: number) => {
    sounds.playClick();
    setStep2Holes((prev) => {
      const next = new Set(prev);
      if (next.has(wordIndex)) {
        next.delete(wordIndex); // was hole -> now displayed
      } else {
        next.add(wordIndex); // was displayed -> now hole
      }
      return next;
    });
  };

  // Preset: Difficult keywords from lesson
  const handleStep2PresetKeywords = () => {
    sounds.playClick();
    const kwSet = new Set(
      currentLesson.sentences
        .flatMap((s) => s.keyWords || [])
        .map((k) => cleanWord(k))
    );
    const newHoles = new Set<number>();
    wordsList.forEach((w, idx) => {
      if (kwSet.has(cleanWord(w.value))) {
        newHoles.add(idx);
      }
    });
    setStep2Holes(newHoles);
  };

  // Preset: 1 word in 3
  const handleStep2PresetOneInThree = () => {
    sounds.playClick();
    const newHoles = new Set<number>();
    wordsList.forEach((_, idx) => {
      if (idx % 3 === 1) newHoles.add(idx);
    });
    setStep2Holes(newHoles);
  };

  // Preset: 1 word in 2
  const handleStep2PresetOneInTwo = () => {
    sounds.playClick();
    const newHoles = new Set<number>();
    wordsList.forEach((_, idx) => {
      if (idx % 2 === 1) newHoles.add(idx);
    });
    setStep2Holes(newHoles);
  };

  // Preset: All displayed (0 holes)
  const handleStep2PresetAllVisible = () => {
    sounds.playClick();
    setStep2Holes(new Set());
  };

  // Preset: All holes (complete fill-in-the-blank)
  const handleStep2PresetAllHoles = () => {
    sounds.playClick();
    const newHoles = new Set<number>();
    wordsList.forEach((_, idx) => newHoles.add(idx));
    setStep2Holes(newHoles);
  };

  // Launch child exercise
  const handleLaunchChildExercise = () => {
    if (step2Holes.size === 0) {
      alert('Veuillez sélectionner au moins 1 mot à faire deviner pour votre enfant.');
      return;
    }
    sounds.playFanfare();
    setStep2ChildInputs({});
    setStep2Submitted(false);
    setStep2RevealedHints(new Set());
    setStep2ParentMode(false);
  };

  // Child changes input for a hole
  const handleStep2ChildInputChange = (wordIndex: number, val: string) => {
    setStep2ChildInputs((prev) => ({
      ...prev,
      [wordIndex]: val,
    }));
    if (step2Submitted) setStep2Submitted(false);
  };

  // Child validates dictée à trous
  const handleStep2Validate = () => {
    setStep2Submitted(true);
    let correctCount = 0;
    step2Holes.forEach((idx) => {
      const typed = cleanWord(step2ChildInputs[idx] || '');
      const expected = cleanWord(wordsList[idx]?.value || '');
      if (typed === expected) {
        correctCount++;
      }
    });

    const totalHoles = step2Holes.size;
    const ratio = totalHoles > 0 ? correctCount / totalHoles : 1;
    if (ratio >= 0.75) {
      sounds.playCorrect();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      if (onUnlockBadges) {
        const badges = ['autodictee_step2'];
        if (ratio === 1) badges.push('chrono_eclair_dictée');
        onUnlockBadges(badges);
      }
    } else {
      sounds.playIncorrect();
    }
  };

  // Retry only mistaken holes
  const handleStep2RetryErrors = () => {
    sounds.playClick();
    const nextInputs = { ...step2ChildInputs };
    step2Holes.forEach((idx) => {
      const typed = cleanWord(step2ChildInputs[idx] || '');
      const expected = cleanWord(wordsList[idx]?.value || '');
      if (typed !== expected) {
        delete nextInputs[idx];
      }
    });
    setStep2ChildInputs(nextInputs);
    setStep2Submitted(false);
  };

  // Child asks for hint (reveals 1st letter of hole)
  const handleStep2RevealHint = (wordIndex: number) => {
    sounds.playClick();
    const targetWord = wordsList[wordIndex]?.value || '';
    if (!targetWord) return;
    setStep2RevealedHints((prev) => new Set(prev).add(wordIndex));
    const currentTyped = step2ChildInputs[wordIndex] || '';
    if (!currentTyped) {
      setStep2ChildInputs((prev) => ({
        ...prev,
        [wordIndex]: targetWord[0],
      }));
    }
  };

  // Compute stats for Step 2 child results
  const step2Stats = (() => {
    let correct = 0;
    step2Holes.forEach((idx) => {
      const typed = cleanWord(step2ChildInputs[idx] || '');
      const expected = cleanWord(wordsList[idx]?.value || '');
      if (typed === expected) correct++;
    });
    const total = step2Holes.size;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 100;
    return { correct, total, pct };
  })();

  // --- Step 3 Word by Word handler (Avec tirets) ---
  const currentTargetWordStep3 = wordsList[step3CurrentWordIndex]?.value || '';
  const isStep3Complete =
    step3ValidatedWords.length > 0 && step3ValidatedWords.every(Boolean);

  const handleStep3SubmitWord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentTargetWordStep3) return;

    const typed = step3WordInput.trim();
    const expected = currentTargetWordStep3.trim();

    const matchesStrict = typed === expected;
    const matchesSoft = cleanWord(typed) === cleanWord(expected);

    if (matchesStrict || matchesSoft) {
      sounds.playCorrect();
      setStep3WordError(null);

      const nextVal = [...step3ValidatedWords];
      nextVal[step3CurrentWordIndex] = true;
      setStep3ValidatedWords(nextVal);

      if (step3CurrentWordIndex < wordsList.length - 1) {
        setStep3CurrentWordIndex((prev) => prev + 1);
        setStep3WordInput('');
      } else {
        setStep3WordInput('');
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
        if (onUnlockBadges) {
          onUnlockBadges(['autodictee_step3']);
        }
      }
    } else {
      sounds.playIncorrect();
      const expectedLen = expected.replace(/['’\-]/g, '').length;
      const typedLen = typed.replace(/['’\-]/g, '').length;
      if (typedLen !== expectedLen) {
        setStep3WordError(
          `Attention au nombre de lettres : ce mot comporte ${expectedLen} lettres (tu en as tapé ${typedLen}).`
        );
      } else {
        setStep3WordError(`Presque ! Regarde bien l’orthographe ou les accents de ce mot.`);
      }
    }
  };

  const handleStep3Hint = () => {
    sounds.playClick();
    const currentRevealed = step3RevealedLetters[step3CurrentWordIndex] || 0;
    if (currentRevealed < currentTargetWordStep3.length) {
      setStep3RevealedLetters({
        ...step3RevealedLetters,
        [step3CurrentWordIndex]: currentRevealed + 1,
      });
    }
  };

  // --- Step 4 Validation (Sans aide) ---
  const handleValidateStep4 = () => {
    setStep4Submitted(true);
    const targetWords = wordsList.map((w) => w.value);
    const studentTokens = tokenizeText(step4Input).filter((t) => t.type === 'word');
    const studentWords = studentTokens.map((w) => w.value);

    let correctCount = 0;
    for (let i = 0; i < targetWords.length; i++) {
      if (studentWords[i] && cleanWord(studentWords[i]) === cleanWord(targetWords[i])) {
        correctCount++;
      }
    }

    const accuracy = Math.round((correctCount / Math.max(1, targetWords.length)) * 100);
    if (accuracy >= 80) {
      sounds.playCorrect();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      if (onUnlockBadges) {
        const badges = ['autodictee_step4', 'autodictee_grand_chelem'];
        if (accuracy === 100 && step4PeekCount === 0) {
          badges.push('autodictee_zero_faute');
        }
        onUnlockBadges(badges);
      }
    } else {
      sounds.playIncorrect();
    }
  };

  const handleTriggerPeekStep4 = () => {
    sounds.playClick();
    setStep4PeekCount((c) => c + 1);
    setStep4PeekSeconds(3);
  };

  // Helper token list with wordIndex assigned
  const tokens = tokenizeText(targetText);
  let wordCounter = 0;
  const tokensWithMeta: Array<{
    type: 'word' | 'punct' | 'space';
    value: string;
    wordIndex: number;
  }> = tokens.map((tok) => {
    if (tok.type === 'word') {
      return { ...tok, wordIndex: wordCounter++ };
    }
    return { ...tok, wordIndex: -1 };
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner & Navigation Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5" />
                Atelier Auto-Dictée
              </span>
              <span className="text-xs text-slate-400 font-medium">Cycle 3 (CE2 · CM1 · CM2)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentLesson.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 italic">
              {currentLesson.source} · {currentLesson.subtitle}
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Audio Dictation Button */}
            <button
              onClick={handleToggleSpeak}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
              }`}
              title="Écouter la dictée lue à voix haute"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Arrêter la lecture' : 'Écouter la dictée'}</span>
            </button>

            {/* Back to Math */}
            <button
              onClick={onGoToMath}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <span>Calcul Mental</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Text Segment Selector */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Découpage du texte :</span>
            <div className="inline-flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60">
              <button
                onClick={() => {
                  sounds.playClick();
                  setSelectedSegment('full');
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  selectedSegment === 'full'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Texte complet
              </button>
              {currentLesson.sentences.map((sent, idx) => (
                <button
                  key={sent.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedSegment(idx);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    selectedSegment === idx
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Partie {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Voice rate selector */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Vitesse audio :</span>
            <button
              onClick={() => setSpeechRate(0.75)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                speechRate === 0.75
                  ? 'bg-slate-700 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lente (0.75x)
            </button>
            <button
              onClick={() => setSpeechRate(0.85)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                speechRate === 0.85
                  ? 'bg-slate-700 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Normale (0.85x)
            </button>
          </div>
        </div>
      </div>

      {/* The 4 Educational Exercise Steps Tab Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Step 1: Recopier */}
        <button
          onClick={() => {
            sounds.playClick();
            setActiveStep(1);
          }}
          className={`flex items-start gap-3 p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeStep === 1
              ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/40'
              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-400'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
              activeStep === 1
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            1
          </div>
          <div>
            <div className={`font-bold text-sm ${activeStep === 1 ? 'text-white' : 'text-slate-200'}`}>
              Exercice 1 : Recopier
            </div>
            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              Modèle sous les yeux · Mémoriser
            </div>
          </div>
        </button>

        {/* Step 2 (NOUVEAU) : Dictée à trous des parents */}
        <button
          onClick={() => {
            sounds.playClick();
            setActiveStep(2);
          }}
          className={`flex items-start gap-3 p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeStep === 2
              ? 'bg-gradient-to-br from-sky-500/20 to-cyan-500/10 border-sky-500/50 shadow-lg shadow-sky-500/10 ring-1 ring-sky-400/40'
              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-400'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
              activeStep === 2
                ? 'bg-sky-400 text-slate-950 font-extrabold shadow-sm'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            2
          </div>
          <div>
            <div className={`font-bold text-sm ${activeStep === 2 ? 'text-white' : 'text-slate-200'}`}>
              Exercice 2 : Dictée à trous
            </div>
            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              Choix des parents · Remplir les trous
            </div>
          </div>
        </button>

        {/* Step 3: Avec tirets */}
        <button
          onClick={() => {
            sounds.playClick();
            setActiveStep(3);
          }}
          className={`flex items-start gap-3 p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeStep === 3
              ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40'
              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-400'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
              activeStep === 3
                ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            3
          </div>
          <div>
            <div className={`font-bold text-sm ${activeStep === 3 ? 'text-white' : 'text-slate-200'}`}>
              Exercice 3 : Avec tirets
            </div>
            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              Gabarit en tirets _ _ _
            </div>
          </div>
        </button>

        {/* Step 4: Sans aide */}
        <button
          onClick={() => {
            sounds.playClick();
            setActiveStep(4);
          }}
          className={`flex items-start gap-3 p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeStep === 4
              ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10 ring-1 ring-purple-400/40'
              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-400'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
              activeStep === 4
                ? 'bg-purple-500 text-white font-extrabold shadow-sm'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            4
          </div>
          <div>
            <div className={`font-bold text-sm ${activeStep === 4 ? 'text-white' : 'text-slate-200'}`}>
              Exercice 4 : Sans aide
            </div>
            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              De mémoire · Exactement comme le jour J
            </div>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* EXERCICE 1 : RECOPIER                                                      */}
      {/* ========================================================================= */}
      {activeStep === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <span>Exercice 1 : Recopie attentivement le texte</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Regarde bien chaque mot, les accents, les virgules et les majuscules pour préparer ta mémoire.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep1ShowFeedback((prev) => !prev)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              >
                {step1ShowFeedback ? 'Aide en direct : Activée' : 'Aide en direct : Masquée'}
              </button>
            </div>
          </div>

          {/* Chronomètre activable à l'envie */}
          <ExerciseChrono
            id="autodictee_step1"
            label="Chronomètre Recopier"
            onChronoToggled={(on) => {
              if (on && onUnlockBadges) onUnlockBadges(['chrono_adepte']);
            }}
          />

          {/* Target Model Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-white shadow-inner">
            <div className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Texte modèle à recopier :</span>
            </div>
            <p className="text-base sm:text-lg leading-relaxed font-serif text-slate-100 selection:bg-emerald-500/30">
              {targetText}
            </p>
          </div>

          {/* Student Copy Input Area */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Ta copie :
            </label>
            <div className="relative">
              <textarea
                value={step1Input}
                onChange={(e) => {
                  setStep1Input(e.target.value);
                  if (step1Submitted) setStep1Submitted(false);
                }}
                rows={4}
                placeholder="Tape ici le texte en observant bien le modèle..."
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-white placeholder-slate-500 text-base leading-relaxed font-serif transition-all resize-y"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Caractères : {step1Input.length} / {targetText.length}
              </span>
              <span>
                Mots : {step1Input.trim() ? step1Input.trim().split(/\s+/).length : 0} / {wordsList.length}
              </span>
            </div>
          </div>

          {/* Live comparison helper if enabled */}
          {step1ShowFeedback && step1Input.length > 0 && !step1Submitted && (
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <div className="font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Contrôle en temps réel :</span>
              </div>
              <div className="font-serif text-sm leading-relaxed">
                {step1Input.split('').map((char, i) => {
                  const targetChar = targetText[i];
                  const isMatch = char === targetChar;
                  return (
                    <span
                      key={i}
                      className={
                        isMatch
                          ? 'text-emerald-400'
                          : 'bg-rose-500/20 text-rose-300 underline font-bold decoration-rose-500'
                      }
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action and feedback */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              onClick={() => {
                setStep1Input('');
                setStep1Submitted(false);
                sounds.playClick();
              }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Effacer pour recommencer</span>
            </button>

            <button
              onClick={handleValidateStep1}
              disabled={step1Input.trim().length === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Valider ma copie</span>
            </button>
          </div>

          {/* Submission Feedback Banner */}
          {step1Submitted && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                step1Input.trim() === targetText.trim()
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              }`}
            >
              {step1Input.trim() === targetText.trim() ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-base text-white">
                      Bravo ! Copie parfaite à 100% ! 🎉
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-200">
                      Tu as respecté toute l'orthographe, les accents et la ponctuation. Tu es prêt pour l’exercice 2 avec la dictée à trous !
                    </p>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setActiveStep(2);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <span>Passer à l'Exercice 2 (Dictée à trous)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-base text-white">
                      Quelques différences détectées
                    </div>
                    <p className="text-xs sm:text-sm text-amber-200">
                      Regarde les caractères soulignés en rouge ou vérifie la ponctuation et les accents (par exemple : « rivières », « cailloux », « assiette »).
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXERCICE 2 : DICTÉE À TROUS PERSONNALISÉE PAR LES PARENTS                 */}
      {/* ========================================================================= */}
      {activeStep === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <span>
                  {step2ParentMode
                    ? 'Exercice 2 : Espace Parents · Préparez la dictée à trous'
                    : 'Exercice 2 : Dictée à trous · À toi de jouer !'}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {step2ParentMode
                  ? 'Cliquez sur les mots à afficher pour l’enfant ou à masquer en trous, puis lancez l’exercice.'
                  : 'Complète les mots manquants préparés par tes parents en respectant l’orthographe et les accords.'}
              </p>
            </div>

            {/* Mode switch button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setStep2ParentMode((prev) => !prev);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  step2ParentMode
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
                title="Basculez entre la configuration par les parents et l’exercice pour l’enfant"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{step2ParentMode ? 'Mode : Préparation Parents' : '⚙️ Modifier les trous (Parents)'}</span>
              </button>
            </div>
          </div>

          {/* PARENT MODE : CONFIGURATION DE LA DICTÉE À TROUS */}
          {step2ParentMode ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Instructions banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/70 to-indigo-950/60 border border-sky-500/30 text-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Sélectionnez les mots en un clic :</span>
                  </div>
                  <p className="text-xs text-sky-300 leading-relaxed">
                    Cliquez sur un mot pour basculer son statut :{' '}
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                      👁️ Affiché
                    </span>{' '}
                    (visible par l'enfant pour le guider) ou{' '}
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                      ✏️ Trou
                    </span>{' '}
                    (l'enfant devra taper ce mot).
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white">
                    🎯 <strong className="text-amber-400">{step2Holes.size}</strong> trous / {wordsList.length} mots
                  </span>
                </div>
              </div>

              {/* Quick Presets Bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  Préréglages rapides :
                </span>
                <button
                  type="button"
                  onClick={handleStep2PresetKeywords}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400/50 transition-colors cursor-pointer font-medium"
                >
                  ⭐ Mots clés difficiles
                </button>
                <button
                  type="button"
                  onClick={handleStep2PresetOneInThree}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 hover:border-sky-400/50 transition-colors cursor-pointer font-medium"
                >
                  1 mot sur 3
                </button>
                <button
                  type="button"
                  onClick={handleStep2PresetOneInTwo}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 hover:border-sky-400/50 transition-colors cursor-pointer font-medium"
                >
                  1 mot sur 2
                </button>
                <button
                  type="button"
                  onClick={handleStep2PresetAllVisible}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer font-medium"
                >
                  Tout afficher (0 trou)
                </button>
                <button
                  type="button"
                  onClick={handleStep2PresetAllHoles}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer font-medium"
                >
                  Tout masquer (100% trous)
                </button>
              </div>

              {/* Interactive Word Cloud with Clickable Chips */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-slate-800">
                  <span className="font-bold uppercase tracking-wider text-slate-300">
                    Cliquez sur les mots pour choisir les trous :
                  </span>
                  <span>
                    {wordsList.length - step2Holes.size} mots affichés · {step2Holes.size} mots à trous
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-2.5 leading-relaxed">
                  {tokensWithMeta.map((tok, idx) => {
                    if (tok.type === 'word') {
                      const isHole = step2Holes.has(tok.wordIndex);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleStep2Hole(tok.wordIndex)}
                          className={`group inline-flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all font-sans text-xs sm:text-sm font-semibold cursor-pointer border select-none ${
                            isHole
                              ? 'bg-amber-500/20 text-amber-200 border-amber-500/60 shadow-sm shadow-amber-500/10 ring-1 ring-amber-400/40 hover:bg-amber-500/30'
                              : 'bg-emerald-950/40 text-emerald-200 border-emerald-500/30 hover:bg-emerald-900/40 hover:border-emerald-400/50'
                          }`}
                          title={
                            isHole
                              ? 'Trou à compléter (cliquez pour afficher le mot)'
                              : 'Mot affiché pour l’enfant (cliquez pour en faire un trou)'
                          }
                        >
                          <span className="font-serif text-sm sm:text-base">{tok.value}</span>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              isHole
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-emerald-500/30 text-emerald-300'
                            }`}
                          >
                            {isHole ? '✏️ Trou' : '👁️ Affiché'}
                          </span>
                        </button>
                      );
                    } else if (tok.type === 'punct') {
                      return (
                        <span key={idx} className="text-white font-bold px-0.5 self-center">
                          {tok.value}
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              {/* Big Launch Exercise Button for Parents */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-slate-400">
                  {step2Holes.size === 0 ? (
                    <span className="text-amber-400 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Cliquez sur au moins 1 mot pour en faire un trou avant de lancer l'exercice.
                    </span>
                  ) : (
                    <span>
                      Prêt ? Votre enfant aura <strong>{step2Holes.size} mots</strong> à trouver et à orthographier.
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLaunchChildExercise}
                  disabled={step2Holes.size === 0}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 disabled:opacity-40 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-cyan-400/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>Lancer l'exercice pour l'enfant ({step2Holes.size} trous)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* CHILD MODE : L'EXERCICE DE DICTÉE À TROUS EN COURS */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              {/* Child Header banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-sky-400" />
                    <span>À toi de jouer : complète les mots manquants !</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Tes parents ont sélectionné <strong>{step2Holes.size} trous</strong>. Utilise la touche [Entrée] ou [Tab] pour passer d'un trou à l'autre.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleSpeak}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Écouter la dictée</span>
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setStep2ParentMode(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Espace Parents</span>
                  </button>
                </div>
              </div>

              {/* Chronomètre activable à l'envie */}
              <ExerciseChrono
                id="autodictee_step2"
                label="Chronomètre Dictée à trous"
                onChronoToggled={(on) => {
                  if (on && onUnlockBadges) onUnlockBadges(['chrono_adepte']);
                }}
              />

              {/* Child School Notebook Text Container */}
              <div className="p-5 sm:p-7 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-3 font-serif text-base sm:text-lg leading-loose text-slate-100">
                  {tokensWithMeta.map((tok, idx) => {
                    if (tok.type === 'word') {
                      const isHole = step2Holes.has(tok.wordIndex);
                      if (isHole) {
                        const typedVal = step2ChildInputs[tok.wordIndex] || '';
                        const isExpected = cleanWord(typedVal) === cleanWord(tok.value);
                        const hasHint = step2RevealedHints.has(tok.wordIndex);
                        const expectedLen = tok.value.replace(/['’\-]/g, '').length;
                        const inputWidth = Math.max(75, Math.min(220, tok.value.length * 16 + 26));

                        return (
                          <span
                            key={idx}
                            className="inline-flex flex-col items-center align-middle mx-1 my-1"
                          >
                            <div className="relative inline-flex items-center">
                              <input
                                id={`step2-hole-${tok.wordIndex}`}
                                type="text"
                                value={typedVal}
                                onChange={(e) =>
                                  handleStep2ChildInputChange(tok.wordIndex, e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const holeIndices = Array.from(step2Holes).sort((a, b) => a - b);
                                    const currentPos = holeIndices.indexOf(tok.wordIndex);
                                    if (currentPos >= 0 && currentPos < holeIndices.length - 1) {
                                      const nextElem = document.getElementById(
                                        `step2-hole-${holeIndices[currentPos + 1]}`
                                      );
                                      nextElem?.focus();
                                    } else {
                                      handleStep2Validate();
                                    }
                                  }
                                }}
                                placeholder={
                                  hasHint ? `${tok.value[0]}... (${expectedLen} l.)` : `...`
                                }
                                style={{ width: `${inputWidth}px` }}
                                className={`px-2.5 py-1 rounded-xl text-center font-serif text-base font-bold border transition-all ${
                                  step2Submitted
                                    ? isExpected
                                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/40'
                                      : 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/40'
                                    : 'bg-slate-900 border-sky-400/60 focus:border-sky-300 focus:ring-2 focus:ring-sky-400/30 text-white placeholder-slate-500'
                                }`}
                                autoComplete="off"
                                autoCapitalize="none"
                                spellCheck="false"
                              />

                              {/* Quick hint button if not submitted */}
                              {!step2Submitted && !hasHint && (
                                <button
                                  type="button"
                                  onClick={() => handleStep2RevealHint(tok.wordIndex)}
                                  className="absolute -top-2.5 -right-2 w-5 h-5 rounded-full bg-slate-800 hover:bg-amber-400 text-slate-400 hover:text-slate-950 border border-slate-700 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                                  title="Indice : dévoiler la 1ère lettre"
                                >
                                  ?
                                </button>
                              )}
                            </div>

                            {/* Correction Badge if submitted and incorrect */}
                            {step2Submitted && !isExpected && (
                              <span className="text-[11px] font-sans font-bold text-rose-300 bg-rose-950/90 px-2 py-0.5 rounded-md mt-1 border border-rose-500/40 flex items-center gap-1 shadow-sm">
                                <span>Attendu :</span>
                                <strong className="text-white underline">{tok.value}</strong>
                              </span>
                            )}
                          </span>
                        );
                      }
                      return (
                        <span key={idx} className="text-slate-100 font-serif">
                          {tok.value}
                        </span>
                      );
                    } else if (tok.type === 'punct') {
                      return (
                        <span key={idx} className="text-white font-serif font-bold -ml-1 mr-1">
                          {tok.value}
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              {/* Child Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setStep2ChildInputs({});
                      setStep2Submitted(false);
                      setStep2RevealedHints(new Set());
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Tout effacer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      // Reveal 1st letter of all holes
                      const allHoles = new Set(step2Holes);
                      setStep2RevealedHints(allHoles);
                      const nextInputs = { ...step2ChildInputs };
                      step2Holes.forEach((idx) => {
                        if (!nextInputs[idx]) {
                          nextInputs[idx] = wordsList[idx]?.value?.[0] || '';
                        }
                      });
                      setStep2ChildInputs(nextInputs);
                    }}
                    className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 cursor-pointer ml-3"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Indice pour tous les trous</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleStep2Validate}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-cyan-400/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Corriger ma dictée à trous</span>
                </button>
              </div>

              {/* Child Results & Score Banner */}
              {step2Submitted && (
                <div
                  className={`p-5 rounded-2xl border space-y-4 animate-in fade-in duration-300 ${
                    step2Stats.pct === 100
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                      : step2Stats.pct >= 70
                      ? 'bg-sky-500/10 border-sky-500/40 text-sky-200'
                      : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {step2Stats.pct === 100 ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                      ) : (
                        <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-lg font-bold text-white">
                          Score : {step2Stats.correct} / {step2Stats.total} mots trouvés ({step2Stats.pct}%) !
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {step2Stats.pct === 100
                            ? 'Félicitations ! Tu as complété toute la dictée sans aucune erreur ! 🌟'
                            : step2Stats.pct >= 70
                            ? 'Très bon travail ! Regarde les mots en rouge pour voir la correction.'
                            : 'Continue tes efforts ! Observe bien les corrections et réessaie.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {step2Stats.correct < step2Stats.total && (
                        <button
                          type="button"
                          onClick={handleStep2RetryErrors}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Réessayer les erreurs</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setActiveStep(3);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Passer à l'Exercice 3 (Tirets)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXERCICE 3 : ÉCRIRE AVEC L'AIDE DES TIRETS                                 */}
      {/* ========================================================================= */}
      {activeStep === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="text-amber-400 font-mono tracking-widest font-extrabold">_ _ _ _</span>
                <span>Exercice 3 : Écrire avec l'aide des tirets</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Chaque tiret correspond à une lettre. Devine et écris chaque mot en respectant son gabarit !
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Trophy className="w-3.5 h-3.5" />
              <span>
                {step3ValidatedWords.filter(Boolean).length} / {wordsList.length} mots trouvés
              </span>
            </div>
          </div>

          {/* Chronomètre activable à l'envie */}
          <ExerciseChrono
            id="autodictee_step3"
            label="Chronomètre Avec tirets"
            onChronoToggled={(on) => {
              if (on && onUnlockBadges) onUnlockBadges(['chrono_adepte']);
            }}
          />

          {/* Full sentence visualization with Dashes for non-validated words */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 shadow-inner">
            <div className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Texte guidé par les tirets :</span>
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-2 text-base sm:text-lg font-mono leading-relaxed">
              {tokens.map((token, idx) => {
                if (token.type === 'word') {
                  const wordIndex = wordsList.findIndex((w) => w.value === token.value);
                  const isValidated = step3ValidatedWords[wordIndex];
                  const isCurrent = wordIndex === step3CurrentWordIndex;
                  const revealedCount = step3RevealedLetters[wordIndex] || 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        sounds.playClick();
                        setStep3CurrentWordIndex(wordIndex);
                        setStep3WordInput('');
                        setStep3WordError(null);
                      }}
                      className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer font-bold ${
                        isValidated
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isCurrent
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-md scale-105'
                          : 'bg-slate-800/80 text-amber-200/90 border border-slate-700/60 hover:bg-slate-700'
                      }`}
                      title={isValidated ? 'Mot validé !' : `Mot ${wordIndex + 1} (${token.value.length} lettres)`}
                    >
                      {isValidated
                        ? token.value
                        : wordToDashes(token.value, revealedCount)}
                    </button>
                  );
                } else if (token.type === 'punct') {
                  return (
                    <span key={idx} className="text-white font-bold self-center px-0.5">
                      {token.value}
                    </span>
                  );
                } else {
                  return null;
                }
              })}
            </div>
          </div>

          {/* Interactive Word Typing Card */}
          {!isStep3Complete ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300 uppercase tracking-wider">
                  Mot actuel ({step3CurrentWordIndex + 1} / {wordsList.length})
                </span>
                <span className="text-slate-400">
                  Longueur attendue : <strong className="text-white font-mono">{currentTargetWordStep3.length} lettres</strong>
                </span>
              </div>

              {/* Big Visual Dash Representation */}
              <div className="text-center py-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-2xl sm:text-4xl font-mono font-extrabold tracking-[0.35em] text-amber-400">
                  {wordToDashes(
                    currentTargetWordStep3,
                    step3RevealedLetters[step3CurrentWordIndex] || 0
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  {currentTargetWordStep3.length} tirets = {currentTargetWordStep3.length} lettres à trouver
                </div>
              </div>

              {/* Typing form */}
              <form onSubmit={handleStep3SubmitWord} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={step3WordInput}
                    onChange={(e) => {
                      setStep3WordInput(e.target.value);
                      if (step3WordError) setStep3WordError(null);
                    }}
                    placeholder={`Tape le mot de ${currentTargetWordStep3.length} lettres...`}
                    autoFocus
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white font-serif text-lg tracking-wide placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={!step3WordInput.trim()}
                    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md shadow-amber-400/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Valider</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Error message if wrong */}
                {step3WordError && (
                  <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{step3WordError}</span>
                  </div>
                )}

                {/* Bottom Helper buttons */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={handleStep3Hint}
                    className="text-amber-300 hover:text-amber-200 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Demander un indice (dévoiler 1 lettre)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={step3CurrentWordIndex === 0}
                      onClick={() => {
                        sounds.playClick();
                        setStep3CurrentWordIndex((prev) => Math.max(0, prev - 1));
                        setStep3WordInput('');
                      }}
                      className="text-slate-400 hover:text-white disabled:opacity-30 px-2 py-1 cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Précédent</span>
                    </button>
                    <button
                      type="button"
                      disabled={step3CurrentWordIndex >= wordsList.length - 1}
                      onClick={() => {
                        sounds.playClick();
                        setStep3CurrentWordIndex((prev) => prev + 1);
                        setStep3WordInput('');
                      }}
                      className="text-slate-400 hover:text-white disabled:opacity-30 px-2 py-1 cursor-pointer flex items-center gap-1"
                    >
                      <span>Suivant</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-extrabold text-white">
                Félicitations ! Tous les mots à tirets ont été complétés ! 🌟
              </h3>
              <p className="text-sm text-emerald-200 max-w-lg mx-auto">
                Tu as mémorisé le gabarit et l’orthographe de chacun des {wordsList.length} mots. Tu es maintenant fin prêt pour l'exercice 4 : écrire toute l'autodictée sans aide !
              </p>
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveStep(4);
                }}
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
              >
                <span>Passer à l'Exercice 4 (Sans aide)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXERCICE 4 : SANS AIDE (AUTODICTÉE DE MÉMOIRE)                            */}
      {/* ========================================================================= */}
      {activeStep === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                <span>Exercice 4 : Écrire sans aide (De mémoire)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Le texte est masqué. Écris l'autodictée de mémoire, exactement comme le jour de l’évaluation en classe !
              </p>
            </div>

            {/* Quick Peek 3s Button */}
            <div className="flex items-center gap-2">
              {step4PeekSeconds > 0 ? (
                <div className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 animate-pulse">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Coup d'œil : encore {step4PeekSeconds}s...</span>
                </div>
              ) : (
                <button
                  onClick={handleTriggerPeekStep4}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Permet de voir le texte pendant 3 secondes si tu es totalement bloqué"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>Coup d'œil rapide (3s)</span>
                  {step4PeekCount > 0 && <span className="text-[10px] text-slate-400">({step4PeekCount})</span>}
                </button>
              )}
            </div>
          </div>

          {/* Chronomètre activable à l'envie */}
          <ExerciseChrono
            id="autodictee_step4"
            label="Chronomètre Sans aide"
            onChronoToggled={(on) => {
              if (on && onUnlockBadges) onUnlockBadges(['chrono_adepte']);
            }}
          />

          {/* Quick Peek Overlay box if active */}
          {step4PeekSeconds > 0 && (
            <div className="p-4 rounded-xl bg-purple-950/80 border border-purple-500/50 text-white shadow-xl animate-in zoom-in-95 duration-200">
              <div className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mémorise vite (fermeture dans {step4PeekSeconds}s) :</span>
              </div>
              <p className="text-base sm:text-lg font-serif italic text-purple-100">
                {targetText}
              </p>
            </div>
          )}

          {/* Writing Area like a clean school notebook */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Ton cahier d'écolier :
              </span>
              <span>
                Mots écrits : {step4Input.trim() ? step4Input.trim().split(/\s+/).length : 0} / {wordsList.length}
              </span>
            </div>

            <textarea
              value={step4Input}
              onChange={(e) => {
                setStep4Input(e.target.value);
                if (step4Submitted) setStep4Submitted(false);
              }}
              rows={6}
              placeholder="Rédige ici l'autodictée de mémoire..."
              className="w-full p-4 sm:p-5 rounded-xl bg-slate-950 border border-purple-500/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white placeholder-slate-500 text-base sm:text-lg leading-relaxed font-serif shadow-inner transition-all resize-y"
            />
          </div>

          {/* Submit button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              onClick={() => {
                setStep4Input('');
                setStep4Submitted(false);
                sounds.playClick();
              }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Effacer pour recommencer</span>
            </button>

            <button
              onClick={handleValidateStep4}
              disabled={step4Input.trim().length === 0}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Corriger mon autodictée</span>
            </button>
          </div>

          {/* Diagnostic & Correction Report */}
          {step4Submitted && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Bilan & Correction détaillée</span>
              </h3>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expected reference */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                    Texte attendu :
                  </div>
                  <p className="text-sm sm:text-base font-serif leading-relaxed text-slate-200">
                    {targetText}
                  </p>
                </div>

                {/* Student's text with word analysis */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                    Ton texte analysé :
                  </div>
                  <div className="text-sm sm:text-base font-serif leading-relaxed text-slate-200 flex flex-wrap gap-1">
                    {tokenizeText(step4Input).map((tok, idx) => {
                      if (tok.type === 'word') {
                        const isInTarget = wordsList.some(
                          (w) => cleanWord(w.value) === cleanWord(tok.value)
                        );
                        return (
                          <span
                            key={idx}
                            className={`px-1 rounded ${
                              isInTarget
                                ? 'text-emerald-400 font-semibold'
                                : 'bg-rose-500/20 text-rose-300 underline font-bold decoration-rose-500'
                            }`}
                            title={isInTarget ? 'Mot correct' : 'Orthographe à vérifier'}
                          >
                            {tok.value}
                          </span>
                        );
                      } else {
                        return <span key={idx}>{tok.value}</span>;
                      }
                    })}
                  </div>
                </div>
              </div>

              {/* Grammar focus recap */}
              {currentLesson.grammarNotes.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Astuces d’orthographe pour cette autodictée :</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {currentLesson.grammarNotes.map((note, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <div className="font-bold text-white mb-0.5">{note.rule}</div>
                        <div className="text-slate-400">{note.examples.join(', ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
