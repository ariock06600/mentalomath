import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  BookOpen,
  Zap,
  Play,
  Grid,
} from 'lucide-react';
import { ALL_TABLES, TABLE_TIPS } from '../game/engine.ts';
import { sounds } from '../utils/audio.ts';

interface LearningScreenProps {
  onQuickDrillTable: (tableNum: number) => void;
}

export const LearningScreen: React.FC<LearningScreenProps> = ({ onQuickDrillTable }) => {
  const [selectedRow, setSelectedRow] = useState<number>(7);
  const [selectedCol, setSelectedCol] = useState<number>(8);
  const [activeTabTable, setActiveTabTable] = useState<number>(7);
  const [viewMode, setViewMode] = useState<'pythagore' | 'fiches'>('pythagore');

  const product = selectedRow * selectedCol;
  const tipRow = TABLE_TIPS[selectedRow];
  const activeTabTip = TABLE_TIPS[activeTabTable];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            Espace d'Apprentissage & Révision
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Tableau de Pythagore & Astuces Secrètes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Clique sur n’importe quelle case pour voir son calcul en images, son astuce et ses propriétés.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex p-1 bg-slate-800 rounded-xl self-start md:self-auto shrink-0 border border-slate-700">
          <button
            onClick={() => {
              sounds.playClick();
              setViewMode('pythagore');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'pythagore'
                ? 'bg-slate-900 text-sky-400 shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4 text-sky-400" />
            <span>Table de Pythagore</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setViewMode('fiches');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'fiches'
                ? 'bg-slate-900 text-amber-400 shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Fiches & Astuces par Table</span>
          </button>
        </div>
      </div>

      {viewMode === 'pythagore' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main: The Pythagorean Grid */}
          <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-sm overflow-x-auto">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Grille Interactive (1 à 10)</span>
              <span className="text-[11px] text-slate-500 font-normal">Survole ou clique sur un nombre</span>
            </div>

            <div className="inline-block min-w-[340px] sm:min-w-full">
              <div className="grid grid-cols-11 gap-1 text-center font-bold text-xs sm:text-sm">
                {/* Top left corner cell */}
                <div className="h-8 sm:h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
                  ×
                </div>

                {/* Column Headers (1 to 10) */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                  <div
                    key={`col-hdr-${c}`}
                    className={`h-8 sm:h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      c === selectedCol
                        ? 'bg-sky-500 text-slate-950 font-black shadow-xs'
                        : 'bg-sky-950/60 text-sky-300 hover:bg-sky-900/60'
                    }`}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedCol(c);
                    }}
                  >
                    {c}
                  </div>
                ))}

                {/* Rows */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                  <React.Fragment key={`row-group-${r}`}>
                    {/* Row Header */}
                    <div
                      className={`h-8 sm:h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        r === selectedRow
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/60'
                      }`}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedRow(r);
                      }}
                    >
                      {r}
                    </div>

                    {/* Cells */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => {
                      const isIntersection = r === selectedRow && c === selectedCol;
                      const isInRow = r === selectedRow;
                      const isInCol = c === selectedCol;
                      const isDiagonal = r === c;
                      const val = r * c;

                      return (
                        <button
                          key={`cell-${r}-${c}`}
                          onClick={() => {
                            sounds.playClick();
                            setSelectedRow(r);
                            setSelectedCol(c);
                          }}
                          className={`h-8 sm:h-9 rounded-lg flex items-center justify-center font-mono tabular-nums text-xs transition-all cursor-pointer ${
                            isIntersection
                              ? 'bg-rose-500 text-white font-black ring-2 ring-rose-400 scale-105 z-10 shadow-md'
                              : isInRow || isInCol
                              ? 'bg-amber-500/20 text-amber-200 font-bold'
                              : isDiagonal
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800/40 hover:bg-slate-700/60 text-slate-300'
                          }`}
                          title={`${r} × ${c} = ${val}`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Inspector and Visual Array Card */}
          <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
            <div className="text-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                Calcul Sélectionné
              </div>
              <div className="text-3xl font-black text-white font-display">
                {selectedRow} × {selectedCol} = <span className="text-amber-400">{product}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Propriété commutative : {selectedCol} × {selectedRow} = {product}
              </div>
            </div>

            {/* Visual Dot Array (Chocolate Bar) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Grille visuelle ({selectedRow} × {selectedCol})</span>
                <span className="text-amber-400 font-mono font-bold">{product} carrés</span>
              </div>
              <div className="flex flex-col gap-1 items-center justify-center py-2 max-h-40 overflow-auto">
                {Array.from({ length: selectedRow }).map((_, rIdx) => (
                  <div key={rIdx} className="flex gap-1">
                    {Array.from({ length: selectedCol }).map((_, cIdx) => (
                      <div
                        key={cIdx}
                        className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-300/30"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Repeated Addition Card */}
            <div className="p-3 bg-sky-950/60 rounded-xl border border-sky-800/60 text-xs text-sky-300">
              <span className="font-bold block uppercase tracking-wider text-sky-400 mb-0.5">
                Addition répétée :
              </span>
              <div className="font-semibold text-white">
                {Array.from({ length: selectedRow }).fill(selectedCol).join(' + ')} = {product}
              </div>
            </div>

            {/* Mnemonic Tips */}
            {tipRow && (
              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/60 text-xs text-emerald-300">
                <span className="font-bold block uppercase tracking-wider text-emerald-400 mb-0.5">
                  💡 Astuce pour la table de {selectedRow} :
                </span>
                <div className="text-slate-300">{tipRow.tip}</div>
              </div>
            )}

            {/* Quick Drill Button */}
            <button
              onClick={() => onQuickDrillTable(selectedRow)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>S'entraîner sur la table de {selectedRow}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Fiches Mémo View */
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap gap-2">
            {ALL_TABLES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  sounds.playClick();
                  setActiveTabTable(t);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTabTable === t
                    ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Table de {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                <span>Table de {activeTabTable} en détail</span>
                <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full font-bold border border-amber-500/30">
                  {activeTabTip?.rule}
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                  <div
                    key={i}
                    className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between font-bold"
                  >
                    <span className="text-slate-400">
                      {activeTabTable} × {i}
                    </span>
                    <span className="text-amber-400">= {activeTabTable * i}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/25">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="text-base text-white">{activeTabTip?.title}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {activeTabTip?.tip}
                  </p>
                </div>

                <div className="p-5 bg-sky-950/60 rounded-2xl border border-sky-800/60 text-xs text-slate-300 space-y-2">
                  <div className="font-bold text-sky-400 text-sm">💡 Conseil pour bien retenir :</div>
                  <p>
                    Répète la table dans l'ordre, puis à l'envers, puis demande à quelqu'un de te tester au hasard !
                    Chaque fois que tu hésites, rappelle-toi que la multiplication est un raccourci d'addition.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onQuickDrillTable(activeTabTable)}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
                <span>Lancer le Quiz Express sur la table de {activeTabTable} !</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
