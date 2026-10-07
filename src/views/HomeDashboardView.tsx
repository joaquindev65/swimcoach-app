import React, { useMemo } from 'react';
import { useSwim } from '../context/SwimContext';

import type { NavTab } from '../components/BottomNav';
import { calculateMaxHR, formatTime } from '../utils/swimCalculations';
import { SwimmerAvatar } from '../components/SwimmerAvatar';
import {
  Users,
  Gauge,
  ClipboardList,
  Flame,
  ArrowRightLeft,
  ShieldCheck,
  ChevronRight,
  Activity,
  Repeat,
  Play,
} from 'lucide-react';


interface HomeDashboardViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenConverter: () => void;
  onOpenBackup: () => void;
  onOpenProfile: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onNavigateTab,
  onOpenConverter,
  onOpenBackup,
  onOpenProfile,
}) => {
  const {
    currentUser,
    swimmers,
    selectedSwimmer,
    setSelectedSwimmerId,
    workouts,
    savedWorkouts,
    switchRole,
  } = useSwim();

  const isCoach = currentUser?.role === 'coach';
  const maxHR = calculateMaxHR(selectedSwimmer.age);

  // Total meters planned in current workout
  const totalWorkoutMeters = workouts.reduce(
    (acc, curr) => acc + curr.reps * curr.distance,
    0
  );

  // Best time for 100m Libre for active swimmer
  const pb100Free = selectedSwimmer.pbs['LIBRE']?.[100];
  const pb50Free = selectedSwimmer.pbs['LIBRE']?.[50];

  // Current Date string in Spanish
  const capitalizedDate = useMemo(() => {
    const str = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, []);


  return (
    <div className="pb-24 pt-3 px-3 max-w-md mx-auto space-y-4">
      {/* Welcome & Role Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block mb-0.5">
              {capitalizedDate}
            </span>
            <h2 className="text-lg font-black text-white truncate tracking-tight">
              ¡Hola, {currentUser?.name || 'Coach'}! 👋
            </h2>
            <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
              {currentUser?.clubName || 'Club Natación'} • {currentUser?.title || 'Entrenador'}
            </p>
          </div>

          <button
            onClick={onOpenProfile}
            className="flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
            title="Ver o editar perfil"
          >
            <SwimmerAvatar
              name={currentUser?.name || 'Usuario'}
              photoUrl={currentUser?.avatarUrl}
              size="md"
            />
          </button>
        </div>

        {/* Quick Role Badge & Switcher */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isCoach ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-[11px] font-bold text-slate-300">
              {isCoach ? 'Modo Entrenador Activo' : 'Modo Nadador Activo'}
            </span>
          </div>

          <button
            onClick={() => {
              if (isCoach) {
                switchRole('swimmer', selectedSwimmer.id);
              } else {
                switchRole('coach');
              }
            }}
            className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700/80 transition-colors"
          >
            <Repeat className="w-3 h-3" />
            <span>{isCoach ? 'Ver como Nadador' : 'Cambiar a Coach'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Swimmers Counter */}
        <button
          onClick={() => onNavigateTab('swimmers')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-all active:scale-[0.98] group shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
          </div>
          <span className="text-xl font-black text-white font-mono">{swimmers.length}</span>
          <p className="text-[11px] text-slate-400 font-medium">Nadadores en Plantel</p>
        </button>

        {/* Board Volume */}
        <button
          onClick={() => onNavigateTab('workout')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition-all active:scale-[0.98] group shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-4 h-4" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {totalWorkoutMeters}m
          </span>
          <p className="text-[11px] text-slate-400 font-medium">
            Pizarrón ({savedWorkouts.length} en biblio)
          </p>
        </button>
      </div>

      {/* Active Swimmer Spotlight Card */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Nadador Seleccionado
          </span>
          <button
            onClick={() => onNavigateTab('swimmers')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5"
          >
            <span>Ver Plantel</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Swimmer Info Banner */}
        <div className="flex items-center gap-3.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
          <SwimmerAvatar
            name={selectedSwimmer.name}
            photoUrl={selectedSwimmer.photoUrl}
            size="lg"
            shape="rounded-2xl"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white truncate">{selectedSwimmer.name}</h3>
              <span className="bg-slate-800 text-cyan-300 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                {selectedSwimmer.age}a
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {selectedSwimmer.category || 'Categoría Primera'}
            </p>

            <div className="mt-1 flex items-center gap-2 text-[10px] flex-wrap">
              <span className="text-slate-400">
                50m: <strong className="text-cyan-300">{pb50Free ? formatTime(pb50Free) : '-'}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                100m: <strong className="text-cyan-300">{pb100Free ? formatTime(pb100Free) : '-'}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-red-400 font-mono font-bold">
                <Activity className="w-2.5 h-2.5" />
                {maxHR}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Swimmer Switcher Horizontal Carousel */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-medium block">
            Cambiar nadador rápidamente:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none -mx-1 px-1">
            {swimmers.map((s) => {
              const isSelected = s.id === selectedSwimmer.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSwimmerId(s.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all flex-shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <SwimmerAvatar name={s.name} photoUrl={s.photoUrl} size="xs" />
                  <span className="text-xs font-semibold whitespace-nowrap">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons for Active Swimmer */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onNavigateTab('paces')}
            className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Gauge className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Ver Ritmos y Zonas</span>
          </button>

          <button
            onClick={() => onNavigateTab('poolside')}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Cronometrar en Pileta</span>
          </button>
        </div>
      </div>

      {/* Interactive Main Menus & Tools Hub */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
          Módulos y Herramientas del Entrenador
        </span>

        <div className="grid grid-cols-1 gap-2">
          {/* Borde Pileta Live */}
          <button
            onClick={() => onNavigateTab('poolside')}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between text-left transition-all active:scale-[0.98] group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    Borde de Pileta & Reloj de Salidas
                  </span>
                  <span className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cronómetro multi-andarivel con bip acústico de intervalos
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </button>

          {/* Workout Builder */}
          <button
            onClick={() => onNavigateTab('workout')}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-left transition-all active:scale-[0.98] group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Pizarrón de Entrenamiento
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({workouts.length} series)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Armar series por zonas fisiológicas y guardar en biblioteca
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </button>

          {/* Paces & Zones */}
          <button
            onClick={() => onNavigateTab('paces')}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-left transition-all active:scale-[0.98] group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Calculadora de Ritmos Fisiológicos
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  7 zonas: A1, A2, MVO2, Tolerancia y Velocidad
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </button>

          {/* 2-Column secondary tools: Converter & Backup */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onOpenConverter}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition-all active:scale-[0.98] group shadow-sm"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white group-hover:text-amber-300">
                  Conversor Piletas
                </span>
              </div>
              <p className="text-[10px] text-slate-400">25m • 50m • Yardas</p>
            </button>

            <button
              onClick={onOpenBackup}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition-all active:scale-[0.98] group shadow-sm"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                  Copia de Seguridad
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Exportar e Importar JSON</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
