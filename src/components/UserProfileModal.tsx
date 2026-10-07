import React, { useState, useEffect } from 'react';
import { useSwim } from '../context/SwimContext';
import {
  X,
  User,
  Building,
  Camera,
  Loader2,
  Check,
  LogOut,
  Mail,
} from 'lucide-react';
import { SwimmerAvatar } from './SwimmerAvatar';
import { processProfileImage } from '../utils/imageUtils';
import type { UserRole } from '../types/swim';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUser, logout, swimmers, savedWorkouts, workouts } = useSwim();

  const [name, setName] = useState('');
  const [clubName, setClubName] = useState('');
  const [role, setRole] = useState<UserRole>('coach');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name || '');
      setClubName(currentUser.clubName || '');
      setRole(currentUser.role || 'coach');
      setTitle(currentUser.title || '');
      setEmail(currentUser.email || '');
      setAvatarUrl(currentUser.avatarUrl);
      setSavedSuccess(false);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const dataUrl = await processProfileImage(file, { targetSize: 320, quality: 0.85 });
      setAvatarUrl(dataUrl);
    } catch (err: any) {
      alert(err.message || 'No se pudo cargar la imagen');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateCurrentUser({
      name: name.trim(),
      clubName: clubName.trim() || 'Club Natación',
      role,
      title: title.trim() || (role === 'coach' ? 'Entrenador Principal' : 'Nadador'),
      email: email.trim() || undefined,
      avatarUrl,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Perfil de Usuario & Club</h3>
              <p className="text-[11px] text-slate-400">Configuración de sesión y equipo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
            <div className="relative">
              <SwimmerAvatar
                name={name || 'Usuario'}
                photoUrl={avatarUrl}
                size="lg"
                isUploading={isUploading}
              />
              <label
                htmlFor="profile-avatar-input"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-md transition-all active:scale-90"
                title="Cambiar foto de perfil"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <input
                  id="profile-avatar-input"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{name || 'Sin nombre'}</p>
              <p className="text-[11px] text-cyan-400 truncate">{title || 'Entrenador'}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Toca la cámara para cambiar foto</p>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Coach Joaquín"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Club o Institución Deportiva
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="Ej: Club Natación Competitiva"
                  className="w-full pl-9 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rol</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="coach">👨‍🏫 Entrenador</option>
                  <option value="swimmer">🏊 Nadador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título / Cargo
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Head Coach"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-9 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Summary Info */}
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div className="p-1">
              <span className="text-[10px] text-slate-400 block">Nadadores</span>
              <span className="text-sm font-bold text-cyan-400 font-mono">{swimmers.length}</span>
            </div>
            <div className="p-1 border-x border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">En Pizarrón</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {workouts.reduce((acc, curr) => acc + curr.reps * curr.distance, 0)}m
              </span>
            </div>
            <div className="p-1">
              <span className="text-[10px] text-slate-400 block">Plantillas</span>
              <span className="text-sm font-bold text-amber-400 font-mono">{savedWorkouts.length}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>¡Cambios Guardados!</span>
                </>
              ) : (
                <span>Guardar Perfil</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/40 text-xs font-semibold text-slate-400 hover:text-red-400 flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
