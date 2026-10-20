import React from 'react';
import { Volume2, VolumeX, Trophy, BookOpen, Calculator, Sun, Moon, Home, PenTool } from 'lucide-react';
import { sounds } from '../utils/audio.ts';
import { AvatarOption } from '../game/types.ts';

interface HeaderProps {
  activeTab: 'home' | 'play' | 'learn' | 'stats' | 'autodictee';
  setActiveTab: (tab: 'home' | 'play' | 'learn' | 'stats' | 'autodictee') => void;
  playerAvatar: AvatarOption;
  onOpenAvatarModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  playerAvatar,
  onOpenAvatarModal,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('home');
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 cursor-pointer"
          aria-label="MentaloMath Accueil"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-xl tracking-tighter">×</span>
          </div>
          <div>
            <div className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <span>Mentalo<span className="text-amber-400">Math</span></span>
              <span className="text-slate-500 font-normal hidden sm:inline">&</span>
              <span className="text-emerald-400 text-xs sm:text-sm font-bold hidden sm:inline">Auto-Dictée</span>
            </div>
            <div className="text-[11px] font-medium text-amber-300/90 leading-none mt-0.5">
              <span className="font-bold text-amber-400">CM1.2</span> · Vacances de la Toussaint
            </div>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('home');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'home'
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>Accueil</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('play');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'play'
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Calcul Mental</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('autodictee');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'autodictee'
                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PenTool className="w-4 h-4 text-emerald-400" />
            <span>Auto-Dictée</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('learn');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'learn'
                ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Tableau & Astuces</span>
            <span className="md:hidden">Astuces</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('stats');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Trophées & Progrès</span>
            <span className="md:hidden">Trophées</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Theme, Sound & Profile Avatar) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
            aria-label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-400" />
            )}
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={soundEnabled ? 'Couper le son' : 'Activer le son'}
            aria-label={soundEnabled ? 'Couper le son' : 'Activer le son'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-slate-300" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>

          <button
            onClick={onOpenAvatarModal}
            className="flex items-center gap-1.5 pl-2 pr-3 py-1 bg-slate-800 hover:bg-slate-700/80 rounded-full transition-colors border border-slate-700 cursor-pointer"
            title="Changer d'avatar"
            aria-label="Profil et avatar"
          >
            <span className="text-xl leading-none" role="img" aria-label={playerAvatar.name}>
              {playerAvatar.emoji}
            </span>
            <span className="text-xs font-semibold text-slate-200 hidden md:inline">
              {playerAvatar.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
