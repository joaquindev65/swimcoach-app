import React, { useMemo } from 'react';
import { useSwim } from '../context/SwimContext';
import type { NavTab } from '../components/BottomNav';
import {
  calculateMaxHR,
  formatTime,
  calculatePacesForDistance,
} from '../utils/swimCalculations';
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
  Building2,
  MapPin,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HomeDashboardViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenConverter: () => void;
  onOpenBackup: () => void;
  onOpenProfile: () => void;
  onOpenInfo?: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onNavigateTab,
  onOpenConverter,
  onOpenBackup,
  onOpenProfile,
  onOpenInfo,
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

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 20) return '¡Buenas tardes';
    return '¡Buenas noches';
  }, []);

  // Current Date string in Spanish
  const capitalizedDate = useMemo(() => {
    const str = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, []);

  // Total meters planned in current workout
  const totalWorkoutMeters = useMemo(() => {
    return workouts.reduce((acc, curr) => acc + curr.reps * curr.distance, 0);
  }, [workouts]);

  // Best time for 100m & 50m Libre for active swimmer
  const pb100Free = selectedSwimmer.pbs['LIBRE']?.[100];
  const pb50Free = selectedSwimmer.pbs['LIBRE']?.[50];

  // Calculated mini paces for 100m if PB is present
  const paces100Map = useMemo(() => {
    if (!pb100Free || pb100Free <= 0) return null;
    const calc = calculatePacesForDistance(pb100Free, 100, 'LIBRE', selectedSwimmer.age);
    const map: Record<string, number> = {};
    calc.zones.forEach((z) => {
      map[z.config.code] = z.paceTime;
    });
    return map;
  }, [pb100Free, selectedSwimmer.age]);

  // Aggregate Club and Sede statistics
  const { uniqueClubsCount, sedeStats } = useMemo(() => {
    const sedesMap = new Map<string, number>();
    const clubsSet = new Set<string>();

    swimmers.forEach((s) => {
      if (s.club) clubsSet.add(s.club.trim());
      const sede = s.sede?.trim() || 'Sede Central';
      sedesMap.set(sede, (sedesMap.get(sede) || 0) + 1);
    });

    return {
      uniqueClubsCount: clubsSet.size || 1,
      sedeStats: Array.from(sedesMap.entries()).map(([name, count]) => ({ name, count })),
    };
  }, [swimmers]);

  return (
    <div className="pb-24 pt-3 px-3 max-w-md mx-auto space-y-4">
      {/* 1. Welcome & Institution Header Card */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-4 shadow-xl transition-all ${
          isCoach
            ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-slate-800'
            : 'bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-900/50'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                {capitalizedDate}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                100% Offline
              </span>
            </div>

            <h2 className="text-xl font-black text-white truncate tracking-tight flex items-center gap-1.5">
              <span>{greeting}, {currentUser?.name ? currentUser.name.split(' ')[0] : (isCoach ? 'Coach' : 'Nadador')}!</span>
              <span className="text-base">{isCoach ? '⏱️' : '🏊'}</span>
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-400 truncate mt-1">
              <span className="text-cyan-300 font-medium truncate flex items-center gap-1">
                <Building2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                {currentUser?.clubName || 'Club Natación Competitiva'}
              </span>
              {currentUser?.sede && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 truncate flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    {currentUser.sede}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onOpenProfile}
            className="flex-shrink-0 cursor-pointer active:scale-95 transition-transform p-0.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50"
            title="Editar perfil y club"
          >
            <SwimmerAvatar
              name={currentUser?.name || 'Usuario'}
              photoUrl={currentUser?.avatarUrl}
              size="md"
            />
          </button>
        </div>

        {/* Quick Role Toggle Bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isCoach ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-[11px] font-bold text-slate-300">
              {isCoach ? 'Modo Entrenador (Coach)' : 'Modo Nadador (Atleta)'}
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
            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700/80 transition-colors active:scale-95"
          >
            <Repeat className="w-3 h-3" />
            <span>{isCoach ? 'Ver como Nadador' : 'Cambiar a Coach'}</span>
          </button>
        </div>
      </div>

      {/* 2. Four Operational Main Pillars Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Plantel de Nadadores */}
        <button
          onClick={() => onNavigateTab('swimmers')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-left transition-all active:scale-[0.98] group shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white font-mono">{swimmers.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">atletas</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Plantel & Sedes ({sedeStats.length})
          </p>
        </button>

        {/* Pizarrón de Entrenamiento */}
        <button
          onClick={() => onNavigateTab('workout')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition-all active:scale-[0.98] group shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-4 h-4" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-emerald-400 font-mono">
              {totalWorkoutMeters}m
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Pizarrón ({workouts.length} series • {savedWorkouts.length} biblio)
          </p>
        </button>

        {/* Ritmos y Zonas */}
        <button
          onClick={() => onNavigateTab('paces')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-left transition-all active:scale-[0.98] group shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Gauge className="w-4 h-4" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-xl font-black text-white font-mono">7 Zonas</span>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Fórmulas Fisiológicas
          </p>
        </button>

        {/* Borde de Pileta (Live Stopwatch) */}
        <button
          onClick={() => onNavigateTab('poolside')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left transition-all active:scale-[0.98] group shadow-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
              LIVE
            </span>
          </div>
          <span className="text-xl font-black text-amber-400 font-mono">Poolside</span>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Reloj con Bip & Andariveles
          </p>
        </button>
      </div>

      {/* 3. Club & Sede Distribution Panorama */}
      <div className="p-3.5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300">
              Sedes e Instalaciones ({sedeStats.length})
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('swimmers')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5"
          >
            <span>Ver Agrupación</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {sedeStats.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => onNavigateTab('swimmers')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-slate-300 text-xs transition-colors active:scale-95"
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span className="font-semibold">{name}</span>
              <span className="bg-slate-700/80 text-cyan-300 text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold">
                {count}
              </span>
            </button>
          ))}
          {uniqueClubsCount > 1 && (
            <div className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto self-center">
              <span>{uniqueClubsCount} clubes registrados</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Active Swimmer Spotlight & Instant Paces Card */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300">
              Nadador en Foco
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('swimmers')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5"
          >
            <span>Ficha Completa</span>
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
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 flex-wrap">
              <span>{selectedSwimmer.category || 'Categoría Primera'}</span>
              {selectedSwimmer.club && (
                <>
                  <span>•</span>
                  <span className="text-cyan-400 font-medium truncate">{selectedSwimmer.club}</span>
                </>
              )}
              {selectedSwimmer.sede && (
                <span className="text-amber-400 font-medium truncate">📍 {selectedSwimmer.sede}</span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 text-[10px] flex-wrap">
              <span className="text-slate-400">
                50m: <strong className="text-cyan-300">{pb50Free ? formatTime(pb50Free) : '-'}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                100m: <strong className="text-cyan-300">{pb100Free ? formatTime(pb100Free) : '-'}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-red-400 font-mono font-bold" title="FC Máxima estimada">
                <Activity className="w-2.5 h-2.5" />
                {maxHR} bpm
              </span>
            </div>
          </div>
        </div>

        {/* Live Mini-Paces Preview for 100m */}
        {paces100Map ? (
          <div className="bg-slate-950/80 rounded-2xl p-2.5 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-400 uppercase tracking-wider">
                Ritmos calculados 100m Libre:
              </span>
              <button
                onClick={() => onNavigateTab('paces')}
                className="text-cyan-400 hover:text-cyan-300 font-bold"
              >
                Ver todas las zonas →
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="bg-slate-900 p-1.5 rounded-xl border border-blue-500/20">
                <span className="text-[9px] font-bold text-blue-400 block">A1 (75%)</span>
                <span className="text-xs font-mono font-bold text-white">
                  {formatTime(paces100Map['A1'])}
                </span>
              </div>
              <div className="bg-slate-900 p-1.5 rounded-xl border border-cyan-500/20">
                <span className="text-[9px] font-bold text-cyan-400 block">A2 (80%)</span>
                <span className="text-xs font-mono font-bold text-white">
                  {formatTime(paces100Map['A2_80'])}
                </span>
              </div>
              <div className="bg-slate-900 p-1.5 rounded-xl border border-emerald-500/20">
                <span className="text-[9px] font-bold text-emerald-400 block">MVO2 (90%)</span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {formatTime(paces100Map['MVO2_90'])}
                </span>
              </div>
              <div className="bg-slate-900 p-1.5 rounded-xl border border-rose-500/20">
                <span className="text-[9px] font-bold text-rose-400 block">TL (97%)</span>
                <span className="text-xs font-mono font-bold text-rose-300">
                  {formatTime(paces100Map['TL'])}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/40 rounded-2xl p-2.5 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Agrega su mejor marca de 100m para ver sus ritmos calculados automáticos.</span>
            <button
              onClick={() => onNavigateTab('paces')}
              className="text-cyan-400 font-bold ml-2 whitespace-nowrap hover:underline"
            >
              Cargar tiempo
            </button>
          </div>
        )}

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
                  <div className="text-left">
                    <span className="text-xs font-semibold whitespace-nowrap block leading-tight">
                      {s.name}
                    </span>
                    {(s.sede || s.club) && (
                      <span className="text-[9px] text-slate-400 block truncate max-w-[95px]">
                        {s.sede || s.club}
                      </span>
                    )}
                  </div>
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

      {/* 5. Workout of the Day / Pizarrón Spotlight */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300">
              Pizarrón del Día
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {totalWorkoutMeters} metros
          </span>
        </div>

        {workouts.length > 0 ? (
          <div className="space-y-2">
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
              {workouts.slice(0, 3).map((w, idx) => (
                <div
                  key={w.id || idx}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] text-slate-300 flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white">
                      {w.reps} × {w.distance}m
                    </span>
                    <span className="text-slate-400 text-[11px]">{w.stroke}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {w.zone}
                  </span>
                </div>
              ))}
              {workouts.length > 3 && (
                <p className="text-[10px] text-slate-500 text-center pt-1 font-medium">
                  + {workouts.length - 3} series más en el pizarrón
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onNavigateTab('poolside')}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Iniciar en Pileta</span>
              </button>

              <button
                onClick={() => onNavigateTab('workout')}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
              >
                <span>Editar Pizarrón</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-slate-950/40 rounded-2xl border border-slate-800/60 p-4">
            <p className="text-xs text-slate-400 mb-3">
              No hay series cargadas en el pizarrón todavía.
            </p>
            <button
              onClick={() => onNavigateTab('workout')}
              className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <ClipboardList className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Armar Series del Día</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Quick Utilities Bar: Converter, Backup, Info */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
          Herramientas de Apoyo
        </span>

        <div className="grid grid-cols-3 gap-2">
          {/* Conversor */}
          <button
            onClick={onOpenConverter}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-center transition-all active:scale-[0.98] group shadow-sm flex flex-col items-center justify-center"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1.5 group-hover:scale-110 transition-transform">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-white group-hover:text-amber-300">
              Conversor
            </span>
            <span className="text-[9px] text-slate-500">25m • 50m • Yd</span>
          </button>

          {/* Copia de Seguridad */}
          <button
            onClick={onOpenBackup}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-center transition-all active:scale-[0.98] group shadow-sm flex flex-col items-center justify-center"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-white group-hover:text-emerald-300">
              Backup
            </span>
            <span className="text-[9px] text-slate-500">Exportar JSON</span>
          </button>

          {/* Info & Metodología */}
          <button
            onClick={onOpenInfo}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-center transition-all active:scale-[0.98] group shadow-sm flex flex-col items-center justify-center"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform">
              <Info className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-white group-hover:text-cyan-300">
              Zonas & Info
            </span>
            <span className="text-[9px] text-slate-500">Fisiología</span>
          </button>
        </div>
      </div>
    </div>
  );
};
