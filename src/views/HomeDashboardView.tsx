import React, { useMemo } from 'react';
import { useSwim } from '../context/SwimContext';
import type { NavTab } from '../components/BottomNav';
import {
  calculateMaxHR,
  formatTime,
  calculatePacesForDistance,
  zoneName,
} from '../utils/swimCalculations';
import { SwimmerAvatar } from '../components/SwimmerAvatar';
import { ArrowRightLeft, ChevronRight, Info, Play, Repeat, ShieldCheck } from 'lucide-react';

interface HomeDashboardViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenConverter: () => void;
  onOpenBackup: () => void;
  onOpenProfile: () => void;
  onOpenInfo?: () => void;
}

// Zonas que se muestran en el resumen de ritmos del nadador en foco
const SUMMARY_ZONES = ['A1', 'A2_80', 'MVO2_90', 'TL'];

const mmss = (secs: number) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

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
    switchRole,
    zones,
  } = useSwim();

  const isCoach = currentUser?.role === 'coach';
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : isCoach ? 'Coach' : 'Nadador';

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const dateLabel = useMemo(() => {
    const str = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, []);

  const totalWorkoutMeters = useMemo(
    () => workouts.reduce((acc, curr) => acc + curr.reps * curr.distance, 0),
    [workouts]
  );

  // Salida de cada serie para el nadador en foco (mismo cálculo que el reloj de salidas)
  const boardRows = useMemo(
    () =>
      workouts.slice(0, 4).map((w) => {
        const pb = selectedSwimmer.pbs[w.stroke]?.[w.distance];
        const z = pb
          ? calculatePacesForDistance(pb, w.distance, w.stroke, selectedSwimmer.age, zones).zones.find(
              (x) => x.config.code === w.zone
            )
          : undefined;
        const cycle = z ? Math.ceil((z.paceTime + (w.customRestSecs ?? z.restSecs)) / 5) * 5 : null;
        return { w, cycle };
      }),
    [workouts, selectedSwimmer, zones]
  );

  const pb100Free = selectedSwimmer.pbs['LIBRE']?.[100];
  const pb50Free = selectedSwimmer.pbs['LIBRE']?.[50];

  const summaryZones = useMemo(() => {
    if (!pb100Free || pb100Free <= 0) return null;
    return calculatePacesForDistance(pb100Free, 100, 'LIBRE', selectedSwimmer.age, zones).zones.filter((z) =>
      SUMMARY_ZONES.includes(z.config.code)
    );
  }, [pb100Free, selectedSwimmer.age, zones]);

  const sedeCount = useMemo(
    () => new Set(swimmers.map((s) => s.sede?.trim() || 'Sede Central')).size,
    [swimmers]
  );

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-7">
      {/* Saludo */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-400">{dateLabel}</p>
          <h2 className="font-display text-3xl font-bold text-white leading-tight truncate">
            {greeting}, {firstName}
          </h2>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {currentUser?.clubName || 'Club Natación Competitiva'}
            {currentUser?.sede ? ` — ${currentUser.sede}` : ''}
          </p>
          <button
            onClick={() => (isCoach ? switchRole('swimmer', selectedSwimmer.id) : switchRole('coach'))}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 active:scale-95 transition-transform"
          >
            <Repeat className="w-3.5 h-3.5" />
            {isCoach ? 'Ver como nadador' : 'Volver a entrenador'}
          </button>
        </div>
        <button
          onClick={onOpenProfile}
          className="flex-shrink-0 rounded-2xl border border-slate-700 hover:border-cyan-500/60 active:scale-95 transition-all"
          title="Editar perfil y club"
        >
          <SwimmerAvatar name={currentUser?.name || 'Usuario'} photoUrl={currentUser?.avatarUrl} size="md" />
        </button>
      </header>

      {/* Pizarra del día */}
      <section
        aria-labelledby="board-title"
        className="rounded-2xl bg-[#EEF3F1] text-[#0B1F2A] p-4 shadow-xl"
      >
        <div className="flex items-baseline justify-between gap-2">
          <h3 id="board-title" className="font-display text-xl font-bold">
            {isCoach ? 'Pizarra de hoy' : 'Tu entrenamiento de hoy'}
          </h3>
          <span className="font-display text-2xl font-bold tabular-nums">{totalWorkoutMeters} m</span>
        </div>

        {boardRows.length > 0 ? (
          <>
            <ul className="mt-2 divide-y divide-[#0B1F2A]/15">
              {boardRows.map(({ w, cycle }) => (
                <li key={w.id} className="flex items-baseline justify-between gap-3 py-2">
                  <span className="font-display text-2xl font-bold tabular-nums whitespace-nowrap">
                    {w.reps} × {w.distance}
                  </span>
                  <span className="flex-1 min-w-0 text-sm truncate">
                    <span className="font-semibold">{w.stroke}</span>{' '}
                    <span className="text-[#0E7C9B] font-bold">{zoneName(w.zone)}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                    {cycle ? `c/${mmss(cycle)}` : 'sin marca'}
                  </span>
                </li>
              ))}
            </ul>
            {workouts.length > boardRows.length && (
              <p className="text-xs text-[#0B1F2A]/70 pt-1">+ {workouts.length - boardRows.length} series más</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('poolside')}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1F2A] text-white font-bold text-sm py-3 active:scale-95 transition-transform"
              >
                <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                Iniciar en pileta
              </button>
              <button
                onClick={() => onNavigateTab('workout')}
                className="rounded-xl border border-[#0B1F2A]/30 text-sm font-semibold px-4 py-3 active:scale-95 transition-transform"
              >
                Editar
              </button>
            </div>
          </>
        ) : (
          <div className="mt-3">
            <p className="text-sm">Todavía no hay series en la pizarra.</p>
            <button
              onClick={() => onNavigateTab('workout')}
              className="mt-3 w-full rounded-xl bg-[#0B1F2A] text-white font-bold text-sm py-3 active:scale-95 transition-transform"
            >
              Armar el entrenamiento
            </button>
          </div>
        )}
      </section>

      {/* Nadador en foco */}
      <section aria-labelledby="focus-title" className="space-y-3">
        <div className="flex items-center gap-3">
          <SwimmerAvatar name={selectedSwimmer.name} photoUrl={selectedSwimmer.photoUrl} size="lg" shape="rounded-2xl" />
          <div className="min-w-0 flex-1">
            <h3 id="focus-title" className="font-display text-2xl font-bold text-white leading-tight truncate">
              {selectedSwimmer.name}
            </h3>
            <p className="text-xs text-slate-400 truncate">
              {selectedSwimmer.age} años
              {selectedSwimmer.sede ? ` — ${selectedSwimmer.sede}` : selectedSwimmer.club ? ` — ${selectedSwimmer.club}` : ''}
            </p>
            <p className="text-xs text-slate-300 mt-0.5 tabular-nums">
              50 libre {pb50Free ? formatTime(pb50Free) : 'sin marca'} · 100 libre{' '}
              {pb100Free ? formatTime(pb100Free) : 'sin marca'} · FC máx {calculateMaxHR(selectedSwimmer.age)}
            </p>
          </div>
        </div>

        {summaryZones ? (
          <div>
            <table className="w-full text-sm tabular-nums">
              <caption className="sr-only">Ritmos de 100 m libre por zona</caption>
              <thead>
                <tr className="text-xs text-slate-400 text-left">
                  <th className="font-medium pb-1">Zona (100 libre)</th>
                  <th className="font-medium pb-1 text-right">Entrada</th>
                  <th className="font-medium pb-1 text-right">Salida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {summaryZones.map((z) => (
                  <tr key={z.config.code}>
                    <td className="py-1.5">
                      <span className="font-semibold text-white">{z.config.name}</span>{' '}
                      <span className="text-xs text-slate-400">
                        {z.config.minPct}–{z.config.maxPct}%
                      </span>
                    </td>
                    <td className="py-1.5 text-right text-slate-300">{formatTime(z.paceSlow)}</td>
                    <td className="py-1.5 text-right font-display text-lg font-bold text-white">
                      {formatTime(z.paceTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => onNavigateTab('paces')}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Ver las 8 zonas
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Carga la marca de 100 libre para ver sus ritmos.{' '}
            <button onClick={() => onNavigateTab('paces')} className="font-semibold text-cyan-300 hover:underline">
              Cargar marca
            </button>
          </p>
        )}

        {isCoach && swimmers.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none" role="group" aria-label="Cambiar nadador">
            {swimmers.map((s) => {
              const isSelected = s.id === selectedSwimmer.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSwimmerId(s.id)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border flex-shrink-0 active:scale-95 transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200'
                      : 'bg-transparent border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <SwimmerAvatar name={s.name} photoUrl={s.photoUrl} size="xs" />
                  <span className="text-xs font-semibold whitespace-nowrap">{s.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Equipo y herramientas */}
      <section className="space-y-1 border-t border-slate-800 pt-4">
        <button
          onClick={() => onNavigateTab('swimmers')}
          className="w-full flex items-center justify-between py-2 text-left active:opacity-70"
        >
          <span className="text-sm text-white">
            <span className="font-display text-xl font-bold tabular-nums">{swimmers.length}</span>{' '}
            {swimmers.length === 1 ? 'nadador' : 'nadadores'} en {sedeCount} {sedeCount === 1 ? 'sede' : 'sedes'}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
          <button onClick={onOpenConverter} className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white">
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
            Conversor de piscina
          </button>
          <button onClick={onOpenBackup} className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Copia de seguridad
          </button>
          <button onClick={onOpenInfo} className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white">
            <Info className="w-4 h-4 text-amber-400" />
            Zonas e info
          </button>
        </div>
      </section>
    </div>
  );
};
