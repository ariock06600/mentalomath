import React, { useState } from 'react';
import {
  Trophy,
  Award,
  CheckCircle,
  Lock,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  Zap,
  Flame,
  Crown,
  PenTool,
  Puzzle,
  Hash,
  Clock,
  Timer,
  Calendar,
  CheckCheck,
  Gauge,
  Plus,
  Minus,
  Divide,
  Sparkles,
  Footprints,
  Star,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerStats, Badge } from '../game/types.ts';
import { ALL_BADGES, ALL_TABLES } from '../game/engine.ts';
import { sounds } from '../utils/audio.ts';

interface BadgesStatsViewProps {
  stats: PlayerStats;
  onResetStats: () => void;
  onDrillTable: (tableNum: number) => void;
  onNavigateTo?: (tab: 'play' | 'autodictee' | 'learn') => void;
}

type TrophyCategoryFilter = 'all' | 'math' | 'dictee' | 'chrono' | 'toussaint';

// Helper to render dynamic icon based on iconName
function renderBadgeIcon(iconName: string, isUnlocked: boolean) {
  const props = {
    className: `w-6 h-6 ${isUnlocked ? 'text-amber-300 drop-shadow' : 'text-slate-500'}`,
  };

  switch (iconName) {
    case 'Footprints':
      return <Footprints {...props} />;
    case 'Flame':
      return <Flame {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'Gauge':
      return <Gauge {...props} />;
    case 'Plus':
      return <Plus {...props} />;
    case 'Minus':
      return <Minus {...props} />;
    case 'Divide':
      return <Divide {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Award':
      return <Award {...props} />;
    case 'Crown':
      return <Crown {...props} />;
    case 'PenTool':
      return <PenTool {...props} />;
    case 'Puzzle':
      return <Puzzle {...props} />;
    case 'Hash':
      return <Hash {...props} />;
    case 'Clock':
      return <Clock {...props} />;
    case 'Timer':
      return <Timer {...props} />;
    case 'Calendar':
      return <Calendar {...props} />;
    case 'CheckCheck':
      return <CheckCheck {...props} />;
    case 'Trophy':
    default:
      return <Trophy {...props} />;
  }
}

// Rarity style helper
function getRarityBadge(rarity: Badge['rarity']) {
  switch (rarity) {
    case 'diamant':
      return {
        label: 'Diamant',
        className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 ring-cyan-500/20',
      };
    case 'or':
      return {
        label: 'Or',
        className: 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-amber-500/20',
      };
    case 'argent':
      return {
        label: 'Argent',
        className: 'bg-slate-300/20 text-slate-200 border-slate-400/40 ring-slate-400/20',
      };
    case 'bronze':
    default:
      return {
        label: 'Bronze',
        className: 'bg-orange-800/30 text-orange-300 border-orange-600/40 ring-orange-500/20',
      };
  }
}

export const BadgesStatsView: React.FC<BadgesStatsViewProps> = ({
  stats,
  onResetStats,
  onDrillTable,
  onNavigateTo,
}) => {
  const [activeTab, setActiveTab] = useState<'badges' | 'tables'>('badges');
  const [categoryFilter, setCategoryFilter] = useState<TrophyCategoryFilter>('all');
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<Badge | null>(null);

  const totalCalculs = stats.totalQuestions;
  const overallAccuracy =
    totalCalculs > 0 ? Math.round((stats.totalCorrect / totalCalculs) * 100) : 0;
  const unlockedCount = stats.unlockedBadgeIds.length;
  const totalBadges = ALL_BADGES.length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  // Student Rank Title based on unlocks
  let rankTitle = 'Élève Apprenti CM1.2';
  let rankEmoji = '🌱';
  if (unlockedCount >= 16) {
    rankTitle = 'Légende Absolue de Toussaint';
    rankEmoji = '👑';
  } else if (unlockedCount >= 12) {
    rankTitle = 'Grand Champion des Vacances CM1.2';
    rankEmoji = '🏆';
  } else if (unlockedCount >= 7) {
    rankTitle = 'Maître des Exercices';
    rankEmoji = '⭐';
  } else if (unlockedCount >= 3) {
    rankTitle = 'Explorateur Appliqué';
    rankEmoji = '🚀';
  }

  // Filtered badges
  const filteredBadges = ALL_BADGES.filter((badge) => {
    if (categoryFilter === 'all') return true;
    return badge.category === categoryFilter;
  });

  const countCategory = (cat: TrophyCategoryFilter) => {
    if (cat === 'all') return ALL_BADGES.length;
    return ALL_BADGES.filter((b) => b.category === cat).length;
  };

  const countUnlockedCategory = (cat: TrophyCategoryFilter) => {
    if (cat === 'all') return unlockedCount;
    return ALL_BADGES.filter(
      (b) => b.category === cat && stats.unlockedBadgeIds.includes(b.id)
    ).length;
  };

  const handleCardClick = (badge: Badge) => {
    sounds.playClick();
    setSelectedBadgeModal(badge);
    if (stats.unlockedBadgeIds.includes(badge.id)) {
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#38bdf8', '#10b981'],
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ========================================================
          HERO BANNER: Toussaint CM1.2 Trophy Room
         ======================================================== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Vacances de la Toussaint · CM1.2</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Galerie des Trophées & Progrès
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Retrouve tous tes trophées remportés en calcul mental (MentaloMath), auto-dictée progressive, et défis chronométrés !
            </p>

            {/* Student Rank & Overall Progress Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-semibold text-slate-200">
                <span className="text-base">{rankEmoji}</span>
                <span>Rang : <strong className="text-amber-400 font-bold">{rankTitle}</strong></span>
              </div>

              <div className="flex-1 max-w-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Progression globale</span>
                  <span className="font-bold text-amber-400">{unlockedCount} / {totalBadges} ({progressPercent}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Switcher Tab Buttons: Trophées vs Tables */}
          <div className="inline-flex p-1 bg-slate-800/90 rounded-2xl self-start md:self-auto shrink-0 border border-slate-700/80 shadow-md">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('badges');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'badges'
                  ? 'bg-slate-900 text-amber-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Trophées ({unlockedCount}/{totalBadges})</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('tables');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'tables'
                  ? 'bg-slate-900 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Tables de Multiplication</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          QUICK KPI CARDS
         ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Calculs Réussis</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 tabular-nums">
            {stats.totalCorrect}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">sur {totalCalculs} questions</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Précision Globale</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1 tabular-nums">
            {overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">taux de réussite</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-sky-400" />
            <span>Record Sprint 60s</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1 tabular-nums">
            {stats.bestSprintScore} pts
          </div>
          <div className="text-[11px] text-slate-500 font-medium">{stats.bestSprintAnswers} calculs max</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-purple-400" />
            <span>Trophées Débloqués</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono mt-1 tabular-nums">
            {unlockedCount} / {totalBadges}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">{totalBadges - unlockedCount} encore à conquérir</div>
        </div>
      </div>

      {/* ========================================================
          TAB 1: BADGES GALLERY (with Category Filters)
         ======================================================== */}
      {activeTab === 'badges' ? (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/70 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                sounds.playClick();
                setCategoryFilter('all');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Tous ({countUnlockedCategory('all')}/{countCategory('all')})</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setCategoryFilter('math');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'math'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>➗ Calcul Mental ({countUnlockedCategory('math')}/{countCategory('math')})</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setCategoryFilter('dictee');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'dictee'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Auto-Dictée ({countUnlockedCategory('dictee')}/{countCategory('dictee')})</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setCategoryFilter('chrono');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'chrono'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Chrono Actif ({countUnlockedCategory('chrono')}/{countCategory('chrono')})</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setCategoryFilter('toussaint');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'toussaint'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Spécial Toussaint CM1.2 ({countUnlockedCategory('toussaint')}/{countCategory('toussaint')})</span>
            </button>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => {
              const isUnlocked = stats.unlockedBadgeIds.includes(badge.id);
              const rarity = getRarityBadge(badge.rarity);

              return (
                <div
                  key={badge.id}
                  onClick={() => handleCardClick(badge)}
                  className={`relative p-5 rounded-3xl border-2 transition-all flex flex-col justify-between gap-3 cursor-pointer group hover:-translate-y-0.5 active:translate-y-0 ${
                    isUnlocked
                      ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 shadow-lg shadow-amber-500/5 hover:border-amber-400/70'
                      : 'border-slate-800/90 bg-slate-900/60 opacity-70 hover:opacity-90 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar: Icon & Rarity Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 text-xl transition-transform group-hover:scale-105 ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-orange-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {isUnlocked ? (
                        renderBadgeIcon(badge.iconName, true)
                      ) : (
                        <Lock className="w-5 h-5 text-slate-500" />
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ring-1 ${rarity.className}`}>
                        {rarity.label}
                      </span>
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Débloqué</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500">
                          À débloquer
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Title & Description */}
                  <div className="space-y-1">
                    <h3 className={`font-black text-base ${isUnlocked ? 'text-white group-hover:text-amber-300' : 'text-slate-300'}`}>
                      {badge.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  {/* Bottom: Hint / Category */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[200px]">
                      {isUnlocked ? '🎉 Trophée validé !' : `💡 ${badge.hint || 'Découvre comment l’obtenir'}`}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================
            TAB 2: TABLES BREAKDOWN & DIRECT DRILL
           ======================================================== */
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Précision et Maîtrise par Table (1 à 12)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Clique sur le bouton d’une table pour lancer immédiatement une séance ciblée !
              </p>
            </div>
            {onNavigateTo && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onNavigateTo('learn');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors self-start cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>Voir les Astuces de Tables</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {ALL_TABLES.map((t) => {
              const attempts = stats.tableAttemptsCount[t] || 0;
              const success = stats.tableSuccessCount[t] || 0;
              const rate = attempts > 0 ? Math.round((success / attempts) * 100) : 0;

              let statusLabel = 'Pas encore testée';
              let badgeColor = 'bg-slate-800 text-slate-400 border border-slate-700';
              if (attempts >= 3) {
                if (rate >= 85) {
                  statusLabel = 'Maîtrisée ⭐';
                  badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
                } else if (rate >= 60) {
                  statusLabel = 'En progression 👍';
                  badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
                } else {
                  statusLabel = 'À réviser 🎯';
                  badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
                }
              }

              return (
                <div
                  key={t}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 hover:bg-slate-850/80 transition-all flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-sm">
                      {t}
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-sm">Table de {t}</div>
                      <div className="text-xs text-slate-400">
                        {attempts > 0 ? `${success} / ${attempts} réussis (${rate}%)` : 'Aucun entraînement'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeColor}`}>
                      {statusLabel}
                    </span>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onDrillTable(t);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer shadow-xs"
                      title={`S'entraîner sur la table de ${t}`}
                    >
                      <span>S’entraîner</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          FAST ACTIONS / JUMP TO EXERCISES
         ======================================================== */}
      {onNavigateTo && (
        <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-white text-sm">Envie de débloquer de nouveaux trophées ?</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Choisis ton atelier et active le chronomètre à l’envie pour tester ta vitesse.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                sounds.playClick();
                onNavigateTo('play');
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Calcul Mental</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onNavigateTo('autodictee');
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Auto-Dictée CM1.2</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          RESET SCORES / DANGER ZONE
         ======================================================== */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={() => {
            sounds.playClick();
            if (
              window.confirm(
                'Es-tu sûr de vouloir réinitialiser tes scores et tes trophées ? Cette action est irréversible.'
              )
            ) {
              onResetStats();
            }
          }}
          className="text-xs font-semibold text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1.5 p-2 rounded-lg cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser les scores et trophées</span>
        </button>
      </div>

      {/* ========================================================
          MODAL: TROPHY DETAILS & HOW TO UNLOCK
         ======================================================== */}
      {selectedBadgeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-700 max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Fiche Trophée
              </span>
              <button
                onClick={() => setSelectedBadgeModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-3">
              <div
                className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-3xl shadow-lg ${
                  stats.unlockedBadgeIds.includes(selectedBadgeModal.id)
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-orange-500/30'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {stats.unlockedBadgeIds.includes(selectedBadgeModal.id) ? (
                  renderBadgeIcon(selectedBadgeModal.iconName, true)
                ) : (
                  <Lock className="w-8 h-8 text-slate-500" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-black text-white">{selectedBadgeModal.name}</h3>
                <p className="text-xs text-amber-300 font-bold uppercase tracking-wider mt-0.5">
                  Rang : {selectedBadgeModal.rarity || 'Bronze'}
                </p>
              </div>

              <p className="text-sm text-slate-300 px-4">
                {selectedBadgeModal.description}
              </p>

              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 text-left text-xs space-y-1">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Comment l’obtenir ?</span>
                </div>
                <div className="text-slate-400">
                  {selectedBadgeModal.hint || 'Accomplis les défis correspondants dans ton carnet.'}
                </div>
              </div>

              {stats.unlockedBadgeIds.includes(selectedBadgeModal.id) ? (
                <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-xs px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/30">
                  <CheckCircle className="w-4 h-4" />
                  <span>Tu as déjà débloqué ce trophée ! Félicitations !</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-slate-400 text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Trophée encore verrouillé</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedBadgeModal(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-sm"
              >
                Fermer
              </button>
              {onNavigateTo && (
                <button
                  onClick={() => {
                    const dest =
                      selectedBadgeModal.category === 'dictee'
                        ? 'autodictee'
                        : selectedBadgeModal.category === 'math'
                        ? 'play'
                        : 'play';
                    setSelectedBadgeModal(null);
                    onNavigateTo(dest);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-xl transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5"
                >
                  <span>Relever le Défi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
