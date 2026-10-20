/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { DifficultyConfig } from './components/DifficultyConfig.tsx';
import { GameScreen } from './components/GameScreen.tsx';
import { ResultsModal } from './components/ResultsModal.tsx';
import { LearningScreen } from './components/LearningScreen.tsx';
import { BadgesStatsView } from './components/BadgesStatsView.tsx';
import { AvatarModal } from './components/AvatarModal.tsx';
import {
  GameMode,
  GameSettings,
  AnswerRecord,
  PlayerStats,
  AvatarOption,
} from './game/types.ts';
import {
  DEFAULT_SETTINGS,
  getDefaultPlayerStats,
  updatePlayerStats,
  AVATAR_LIST,
} from './game/engine.ts';
import { sounds } from './utils/audio.ts';

export default function App() {
  // Navigation tabs: 'play' | 'learn' | 'stats'
  const [activeTab, setActiveTab] = useState<'play' | 'learn' | 'stats'>('play');

  // Play sub-state: 'CONFIG' | 'PLAYING' | 'RESULTS'
  const [playState, setPlayState] = useState<'CONFIG' | 'PLAYING' | 'RESULTS'>('CONFIG');

  // Theme state: default dark as requested
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('mathimulti_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Game configuration
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('mathimulti_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [gameMode, setGameMode] = useState<GameMode>('CHRONO_SPRINT');

  // Completed session records for results screen
  const [sessionAnswers, setSessionAnswers] = useState<AnswerRecord[]>([]);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [sessionElapsedMs, setSessionElapsedMs] = useState<number>(0);
  const [newlyUnlockedBadgeIds, setNewlyUnlockedBadgeIds] = useState<string[]>([]);

  // Player Stats with localStorage persistence
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('mathimulti_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return getDefaultPlayerStats();
  });

  // Profile: Avatar and Name
  const [playerAvatar, setPlayerAvatar] = useState<AvatarOption>(() => {
    const saved = localStorage.getItem('mathimulti_avatar');
    if (saved) {
      const found = AVATAR_LIST.find((a) => a.id === saved);
      if (found) return found;
    }
    return AVATAR_LIST[0]; // Fox
  });

  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('mathimulti_name') || 'Champion';
  });

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(!sounds.getIsMuted());

  useEffect(() => {
    localStorage.setItem('mathimulti_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('mathimulti_settings', JSON.stringify(settings));
  }, [settings]);

  // Save stats when changed
  useEffect(() => {
    localStorage.setItem('mathimulti_stats', JSON.stringify(playerStats));
  }, [playerStats]);

  // Support ?autostart=1 query param to start gameplay immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        setPlayState('PLAYING');
      }
    }
  }, []);

  const handleToggleTheme = () => {
    sounds.playClick();
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleSound = () => {
    const nextMuted = sounds.toggleMute();
    setSoundEnabled(!nextMuted);
    if (!nextMuted) {
      sounds.playClick();
    }
  };

  const handleStartGame = () => {
    setPlayState('PLAYING');
  };

  const handleExitGame = () => {
    setPlayState('CONFIG');
  };

  const handleFinishGame = (
    answers: AnswerRecord[],
    finalScore: number,
    elapsedMs: number
  ) => {
    setSessionAnswers(answers);
    setSessionScore(finalScore);
    setSessionElapsedMs(elapsedMs);

    const prevBadgeIds = new Set(playerStats.unlockedBadgeIds);
    const updated = updatePlayerStats(
      playerStats,
      answers,
      gameMode,
      finalScore,
      elapsedMs
    );
    setPlayerStats(updated);

    const newlyUnlocked = updated.unlockedBadgeIds.filter(
      (id) => !prevBadgeIds.has(id)
    );
    setNewlyUnlockedBadgeIds(newlyUnlocked);

    setPlayState('RESULTS');
  };

  const handlePlayAgain = () => {
    setPlayState('PLAYING');
  };

  const handleChangeSettings = () => {
    setPlayState('CONFIG');
  };

  const handleSaveProfile = (avatar: AvatarOption, name: string) => {
    setPlayerAvatar(avatar);
    setPlayerName(name);
    localStorage.setItem('mathimulti_avatar', avatar.id);
    localStorage.setItem('mathimulti_name', name);
  };

  const handleResetStats = () => {
    const clean = getDefaultPlayerStats();
    setPlayerStats(clean);
    localStorage.setItem('mathimulti_stats', JSON.stringify(clean));
  };

  const handleQuickDrillTable = (tableNum: number) => {
    setSettings((prev) => ({
      ...prev,
      selectedTables: [tableNum],
      selectedOperators: ['x'],
      difficulty: 'personnalise',
    }));
    setGameMode('TARGET_QUESTIONS');
    setActiveTab('play');
    setPlayState('PLAYING');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'}`}>
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'play' && playState === 'RESULTS') {
            setPlayState('CONFIG');
          }
        }}
        playerAvatar={playerAvatar}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'play' && (
          <>
            {playState === 'CONFIG' && (
              <DifficultyConfig
                settings={settings}
                setSettings={setSettings}
                gameMode={gameMode}
                setGameMode={setGameMode}
                onStartGame={handleStartGame}
              />
            )}

            {playState === 'PLAYING' && (
              <GameScreen
                settings={settings}
                gameMode={gameMode}
                onFinishGame={handleFinishGame}
                onExitGame={handleExitGame}
              />
            )}

            {playState === 'RESULTS' && (
              <ResultsModal
                answers={sessionAnswers}
                finalScore={sessionScore}
                elapsedMs={sessionElapsedMs}
                gameMode={gameMode}
                newlyUnlockedBadgeIds={newlyUnlockedBadgeIds}
                onPlayAgain={handlePlayAgain}
                onChangeSettings={handleChangeSettings}
              />
            )}
          </>
        )}

        {activeTab === 'learn' && (
          <LearningScreen onQuickDrillTable={handleQuickDrillTable} />
        )}

        {activeTab === 'stats' && (
          <BadgesStatsView
            stats={playerStats}
            onResetStats={handleResetStats}
            onDrillTable={handleQuickDrillTable}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-900/60 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-medium text-slate-300">
            <span className="font-bold text-amber-400">MentaloMath</span> · Apprendre les tables de multiplication en s’amusant · Pour élèves du CP au CM2 · Créé par <span className="font-semibold text-slate-100">Pierre NDT</span>
          </div>
          <div className="text-slate-500">
            Calcul mental rapide · Sans publicité · 100% éducatif
          </div>
        </div>
      </footer>

      {/* Profile & Avatar Modal */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={playerAvatar}
        playerName={playerName}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
