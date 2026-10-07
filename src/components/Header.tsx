import React, { useState } from 'react';
import { useSwim } from '../context/SwimContext';
import { Menu, Activity, ArrowRightLeft } from 'lucide-react';
import { calculateMaxHR } from '../utils/swimCalculations';

import { processProfileImage } from '../utils/imageUtils';
import { SwimmerAvatar } from './SwimmerAvatar';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onOpenInfo: () => void;
  onOpenBackup?: () => void;
  onOpenConverter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  onOpenProfile,
  onOpenConverter,
}) => {
  const {
    currentUser,
    swimmers,
    selectedSwimmerId,
    setSelectedSwimmerId,
    selectedSwimmer,
    updateSwimmer,
  } = useSwim();

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const maxHR = calculateMaxHR(selectedSwimmer.age);

  const handleHeaderPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const dataUrl = await processProfileImage(file, { targetSize: 320, quality: 0.82 });
      updateSwimmer(selectedSwimmer.id, { photoUrl: dataUrl });
    } catch (err: any) {
      alert(err.message || 'No se pudo cargar la imagen.');
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2 shadow-md">
      <div className="max-w-md mx-auto flex items-center justify-between gap-1.5">
        {/* Left: Hamburger Menu + Brand */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onOpenMenu}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 border border-slate-700/60"
            title="Abrir Menú Principal"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
          </button>

          <div className="flex items-center gap-1.5 min-w-0 cursor-pointer" onClick={onOpenMenu}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 font-black text-sm flex-shrink-0">
              🏊
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-bold text-white tracking-tight flex items-center gap-1 leading-none truncate">
                SwimCoach <span className="bg-cyan-500/20 text-cyan-400 text-[9px] font-bold px-1 py-0.2 rounded border border-cyan-500/30">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                {currentUser?.clubName || 'Club Natación'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Controls & Swimmer Switcher */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Swimmer Quick Switcher */}
          <div className="relative flex items-center">
            <label
              htmlFor="header-avatar-input"
              className="absolute left-1 top-1/2 -translate-y-1/2 cursor-pointer z-10"
              title="Cambiar foto del nadador activo"
            >
              <SwimmerAvatar
                name={selectedSwimmer.name}
                photoUrl={selectedSwimmer.photoUrl}
                size="xs"
                shape="rounded-md"
                isUploading={isUploadingPhoto}
              />
              <input
                id="header-avatar-input"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleHeaderPhotoChange}
              />
            </label>

            <select
              value={selectedSwimmerId}
              onChange={(e) => setSelectedSwimmerId(e.target.value)}
              className="appearance-none bg-slate-800 text-xs font-semibold text-cyan-300 pl-7 pr-5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 shadow-sm max-w-[105px] truncate"
            >
              {swimmers.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-800 text-white">
                  {s.name}
                </option>
              ))}
            </select>
            <span className="text-[8px] text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
          </div>

          {/* FCM Badge */}
          <div
            title={`Frecuencia Cardíaca Máxima: ${maxHR} bpm (220 - ${selectedSwimmer.age})`}
            className="flex items-center gap-1 bg-red-950/40 border border-red-500/30 px-1.5 py-1 rounded-lg text-red-400 text-xs font-mono font-bold"
          >
            <Activity className="w-3 h-3 text-red-400 animate-pulse" />
            <span>{maxHR}</span>
          </div>

          {/* Converter Button */}
          {onOpenConverter && (
            <button
              onClick={onOpenConverter}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Conversor de Piletas"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}

          {/* User Profile Button */}
          <button
            onClick={onOpenProfile}
            className="p-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Mi Perfil y Club"
          >
            <SwimmerAvatar
              name={currentUser?.name || 'Coach'}
              photoUrl={currentUser?.avatarUrl}
              size="xs"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

