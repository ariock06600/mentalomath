import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { AVATAR_LIST } from '../game/engine.ts';
import { AvatarOption } from '../game/types.ts';
import { sounds } from '../utils/audio.ts';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: AvatarOption;
  playerName: string;
  onSave: (avatar: AvatarOption, name: string) => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  playerName,
  onSave,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption>(currentAvatar);
  const [nameInput, setNameInput] = useState<string>(playerName);

  if (!isOpen) return null;

  const handleSave = () => {
    sounds.playClick();
    onSave(selectedAvatar, nameInput.trim() || 'Champion');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">Ton Profil de Champion</h3>
            <p className="text-xs text-slate-400">Choisis ta mascotte et ton prénom</p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="student-name-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Ton prénom ou pseudo
            </label>
            <input
              id="student-name-input"
              type="text"
              value={nameInput}
              maxLength={15}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ex: Emma, Léo, Maxime..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold placeholder:text-slate-500"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Choisis ta mascotte
            </span>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_LIST.map((avatar) => {
                const isSelected = selectedAvatar.id === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedAvatar(avatar);
                    }}
                    className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/20 shadow-md scale-102 ring-1 ring-amber-400/50'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                    }`}
                  >
                    <span className="text-4xl mb-1" role="img" aria-label={avatar.name}>
                      {avatar.emoji}
                    </span>
                    <span className="text-xs font-bold text-slate-200 text-center leading-tight">
                      {avatar.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
