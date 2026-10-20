import React, { useState } from 'react';
import {
  Trophy,
  Award,
  CheckCircle,
  Lock,
  RotateCcw,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { PlayerStats } from '../game/types.ts';
import { ALL_BADGES, ALL_TABLES } from '../game/engine.ts';
import { sounds } from '../utils/audio.ts';

interface BadgesStatsViewProps {
  stats: PlayerStats;
  onResetStats: () => void;
  onDrillTable: (tableNum: number) => void;
}

export const BadgesStatsView: React.FC<BadgesStatsViewProps> = ({
  stats,
  onResetStats,
  onDrillTable,
}) => {
  const [activeTab, setActiveTab] = useState<'badges' | 'tables'>('badges');

  const totalCalculs = stats.totalQuestions;
  const overallAccuracy =
    totalCalculs > 0 ? Math.round((stats.totalCorrect / totalCalculs) * 100) : 0;
  const unlockedCount = stats.unlockedBadgeIds.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            Tableau de Bord & Trophées
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Tes Records & Statistiques
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visualise ta progression, tes tables favorites et tes trophées débloqués.
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-800 rounded-xl self-start md:self-auto shrink-0 border border-slate-700">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('badges');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-slate-900 text-amber-400 shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Trophées ({unlockedCount}/{ALL_BADGES.length})</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('tables');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-slate-900 text-emerald-400 shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Maîtrise des Tables</span>
          </button>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calculs Résolus</div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 tabular-nums">
            {stats.totalCorrect}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">sur {totalCalculs} questions</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Précision Globale</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1 tabular-nums">
            {overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">de réussite</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Record Sprint 60s</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1 tabular-nums">
            {stats.bestSprintScore}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">{stats.bestSprintAnswers} calculs max</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Record 3 Vies</div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono mt-1 tabular-nums">
            {stats.bestSurvivalCount}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">calculs consécutifs</div>
        </div>
      </div>

      {/* 4 Operations Accuracy Summary */}
      <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-sm">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Réussite par opération
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(['x', '+', '-', '÷'] as const).map((op) => {
            const label = op === 'x' ? 'Multiplication (×)' : op === '+' ? 'Addition (+)' : op === '-' ? 'Soustraction (−)' : 'Division (÷)';
            const color = op === 'x' ? 'text-amber-400' : op === '+' ? 'text-emerald-400' : op === '-' ? 'text-rose-400' : 'text-sky-400';
            const attempts = stats.operatorAttemptsCount?.[op] || 0;
            const success = stats.operatorSuccessCount?.[op] || 0;
            const rate = attempts > 0 ? Math.round((success / attempts) * 100) : 0;

            return (
              <div key={op} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className={`font-bold text-xs ${color}`}>{label}</div>
                <div className="text-xl font-black text-white font-mono mt-1 tabular-nums">
                  {attempts > 0 ? `${rate}%` : '—'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {attempts > 0 ? `${success}/${attempts} réussis` : 'Pas encore joué'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeTab === 'badges' ? (
        /* Badges Grid */
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Galerie des Trophées ({unlockedCount} débloqués sur {ALL_BADGES.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {ALL_BADGES.map((badge) => {
              const isUnlocked = stats.unlockedBadgeIds.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
                    isUnlocked
                      ? 'border-amber-500/40 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/20'
                      : 'border-slate-800/80 bg-slate-950/60 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl ${
                      isUnlocked
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? <Trophy className="w-6 h-6 fill-slate-950 text-slate-950" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                      <span>{badge.name}</span>
                      {isUnlocked && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="text-xs text-slate-400 leading-snug">
                      {badge.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table Mastery Breakdown */
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Précision et Maîtrise par Table
            </h2>
            <span className="text-xs text-slate-400">Clique pour t'entraîner sur une table</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base shadow-2xs">
                      {t}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Table de {t}</div>
                      <div className="text-xs text-slate-400">
                        {attempts > 0 ? `${success} / ${attempts} réussis (${rate}%)` : 'Aucun essai'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeColor}`}>
                      {statusLabel}
                    </span>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onDrillTable(t);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                      title={`S'entraîner sur la table de ${t}`}
                      aria-label={`S'entraîner sur la table de ${t}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset Stats / Danger Zone */}
      <div className="pt-4 flex justify-end">
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
          <span>Réinitialiser les scores</span>
        </button>
      </div>
    </div>
  );
};
