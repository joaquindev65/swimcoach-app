import React, { useState } from 'react';
import { useSwim } from '../context/SwimContext';
import { RefreshCw, Activity, Camera, Loader2, ShieldCheck } from 'lucide-react';
import { calculateMaxHR } from '../utils/swimCalculations';
import { processProfileImage } from '../utils/imageUtils';
import { SwimmerAvatar } from './SwimmerAvatar';

interface HeaderProps {
  onOpenInfo: () => void;
  onOpenBackup?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInfo, onOpenBackup }) => {
  const {
    swimmers,
    selectedSwimmerId,
    setSelectedSwimmerId,
    selectedSwimmer,
    updateSwimmer,
    resetToDefaults,
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
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 shadow-md">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-black text-lg">
            🏊
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
              SwimCoach <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-cyan-500/30">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Ritmos Fisiológicos</p>
          </div>
        </div>

        {/* Swimmer Quick Switcher & Controls */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center">
            {/* Quick Avatar Upload Button */}
            <label
              htmlFor="header-avatar-input"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 cursor-pointer z-10"
              title="Toca para cambiar la foto del nadador activo"
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
              className="appearance-none bg-slate-800 text-xs font-semibold text-cyan-300 pl-8 pr-6 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 shadow-sm max-w-[125px] truncate"
            >
              {swimmers.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-800 text-white">
                  {s.name} ({s.age}a)
                </option>
              ))}
            </select>
            <span className="text-[9px] text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
          </div>

          {/* Direct Camera Button in Top Bar */}
          <label
            htmlFor="header-camera-input"
            className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 cursor-pointer active:scale-95 transition-all flex items-center justify-center"
            title="Subir foto para el nadador activo"
          >
            {isUploadingPhoto ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            <input
              id="header-camera-input"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleHeaderPhotoChange}
            />
          </label>

          {/* FCM Badge */}
          <div 
            title={`Frecuencia Cardíaca Máxima: ${maxHR} bpm (220 - ${selectedSwimmer.age})`}
            className="flex items-center gap-1 bg-red-950/40 border border-red-500/30 px-1.5 py-1 rounded-lg text-red-400 text-xs font-mono font-bold"
          >
            <Activity className="w-3 h-3 text-red-400 animate-pulse" />
            <span>{maxHR}</span>
          </div>

          {/* Backup Button */}
          {onOpenBackup && (
            <button
              onClick={onOpenBackup}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copia de Seguridad y Sincronización"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}

          {/* Info & Reset */}
          <button
            onClick={onOpenInfo}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Metodología y Zonas"
          >
            ℹ️
          </button>
          <button
            onClick={resetToDefaults}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Reiniciar a planilla original"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
