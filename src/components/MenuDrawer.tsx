import React from 'react';
import { useSwim } from '../context/SwimContext';
import type { NavTab } from './BottomNav';
import {
  X,
  Home,
  Users,
  Gauge,
  ClipboardList,
  Flame,
  ArrowRightLeft,
  ShieldCheck,
  Info,
  User,
  LogOut,
  RefreshCw,
  Repeat,
  CheckCircle2,
} from 'lucide-react';
import { SwimmerAvatar } from './SwimmerAvatar';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenProfile: () => void;
  onOpenBackup: () => void;
  onOpenConverter: () => void;
  onOpenInfo: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  onOpenProfile,
  onOpenBackup,
  onOpenConverter,
  onOpenInfo,
}) => {
  const {
    currentUser,
    switchRole,
    logout,
    resetToDefaults,
    swimmers,
    selectedSwimmer,
    setSelectedSwimmerId,
  } = useSwim();

  if (!isOpen) return null;

  const handleSelectTab = (tab: NavTab) => {
    onChangeTab(tab);
    onClose();
  };

  const isCoach = currentUser?.role === 'coach';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xs bg-slate-900 border-r border-slate-800 h-full flex flex-col shadow-2xl z-10 overflow-hidden animate-in slide-in-from-left duration-200">
        {/* Top Header / Profile Card */}
        <div className="p-4 bg-gradient-to-b from-slate-850 to-slate-900 border-b border-slate-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <SwimmerAvatar
                  name={currentUser?.name || 'Entrenador'}
                  photoUrl={currentUser?.avatarUrl}
                  size="md"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    isCoach ? 'bg-cyan-400' : 'bg-emerald-400'
                  }`}
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate leading-tight">
                  {currentUser?.name || 'Coach Joaquín'}
                </h3>
                <p className="text-[11px] text-cyan-300/90 truncate font-medium">
                  {currentUser?.clubName || 'Club Natación'}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isCoach
                        ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    {isCoach ? 'Entrenador' : 'Nadador'}
                  </span>
                  <button
                    onClick={() => {
                      onOpenProfile();
                      onClose();
                    }}
                    className="text-[10px] text-slate-400 hover:text-white underline underline-offset-2"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Quick Toggle */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => {
                if (isCoach) {
                  switchRole('swimmer', selectedSwimmer?.id);
                } else {
                  switchRole('coach');
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 transition-all active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-cyan-400" />
                {isCoach ? 'Ver como Nadador' : 'Volver a Modo Entrenador'}
              </span>
              <span className="text-[10px] bg-slate-700/70 text-slate-300 px-1.5 py-0.5 rounded">
                {isCoach ? 'Atleta' : 'Coach'}
              </span>
            </button>
          </div>

          {/* Quick Swimmer Switcher inside Drawer */}
          <div className="mt-3">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Nadador Activo
            </label>
            <select
              value={selectedSwimmer.id}
              onChange={(e) => setSelectedSwimmerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-cyan-500"
            >
              {swimmers.map((s) => (
                <option key={s.id} value={s.id}>
                  🏊 {s.name} ({s.age} años)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Navegación Principal
            </p>
            <div className="space-y-1">
              <button
                onClick={() => handleSelectTab('home')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'home'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4 text-cyan-400" />
                  <span>Inicio / Tablero</span>
                </div>
                {activeTab === 'home' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              <button
                onClick={() => handleSelectTab('swimmers')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'swimmers'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Plantel de Nadadores</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                  {swimmers.length}
                </span>
              </button>

              <button
                onClick={() => handleSelectTab('paces')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'paces'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span>Ritmos y Zonas</span>
                </div>
                {activeTab === 'paces' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              <button
                onClick={() => handleSelectTab('workout')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'workout'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4 text-cyan-400" />
                  <span>Pizarrón de Entrenamiento</span>
                </div>
                {activeTab === 'workout' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              <button
                onClick={() => handleSelectTab('poolside')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'poolside'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Borde Pileta & Salidas</span>
                </div>
                <span className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  LIVE
                </span>
              </button>
            </div>
          </div>

          {/* Tools & Utilities */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Herramientas de Entrenamiento
            </p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenConverter();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all text-left"
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                <span>Conversor de Piletas (25m / 50m / SCY)</span>
              </button>

              <button
                onClick={() => {
                  onOpenBackup();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all text-left"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Copia de Seguridad y Datos</span>
              </button>

              <button
                onClick={() => {
                  onOpenInfo();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all text-left"
              >
                <Info className="w-4 h-4 text-blue-400" />
                <span>Metodología Fisiológica</span>
              </button>

              <button
                onClick={() => {
                  onOpenProfile();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all text-left"
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>Perfil y Club</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/95 space-y-2">
          <button
            onClick={() => {
              onClose();
              resetToDefaults();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-medium text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer datos originales</span>
          </button>

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 text-xs font-bold text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión / Cambiar de Usuario</span>
          </button>
        </div>
      </div>
    </div>
  );
};
