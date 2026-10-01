import React, { useState } from 'react';
import { useSwim } from '../context/SwimContext';
import type { StrokeType, ZoneCode } from '../types/swim';
import {
  STROKES,
  STROKE_DISTANCES,
  ZONES_CONFIG,
  calculatePacesForDistance,
  formatTime,
} from '../utils/swimCalculations';
import {
  Plus,
  Trash2,
  Share2,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SwimmerAvatar } from '../components/SwimmerAvatar';

export const WorkoutBuilderView: React.FC = () => {
  const { selectedSwimmer, workouts, addWorkoutSet, removeWorkoutSet, clearWorkout } = useSwim();

  // Builder form state
  const [stroke, setStroke] = useState<StrokeType>('LIBRE');
  const [distance, setDistance] = useState<number>(100);
  const [reps, setReps] = useState<number>(8);
  const [zone, setZone] = useState<ZoneCode>('A2_80');
  const [customRest, setCustomRest] = useState<number>(30);

  // Available distances for selected stroke
  const distances = STROKE_DISTANCES[stroke];
  const currentDistance = distances.includes(distance) ? distance : distances[0];

  const handleStrokeChange = (newStroke: StrokeType) => {
    setStroke(newStroke);
    const newDistances = STROKE_DISTANCES[newStroke];
    if (!newDistances.includes(distance)) {
      setDistance(newDistances[0]);
    }
  };

  const handleAddSet = (e: React.FormEvent) => {
    e.preventDefault();
    addWorkoutSet({
      swimmerId: selectedSwimmer.id,
      stroke,
      distance: currentDistance,
      reps,
      zone,
      customRestSecs: customRest,
    });
  };

  // Calculate total meters
  const totalMeters = workouts.reduce((acc, curr) => acc + curr.reps * curr.distance, 0);

  const handleShareWorkout = () => {
    if (workouts.length === 0) return;
    let msg = `📋 *SESIÓN DE ENTRENAMIENTO - ${selectedSwimmer.name.toUpperCase()}*\n`;
    msg += `Volumen Total: *${totalMeters}m*\n\n`;

    workouts.forEach((w, idx) => {
      const pb = selectedSwimmer.pbs[w.stroke]?.[w.distance];
      let paceStr = 'Sin marca PB';
      let rest = w.customRestSecs || 30;
      let cycle = '';

      if (pb) {
        const p = calculatePacesForDistance(pb, w.distance, w.stroke, selectedSwimmer.age);
        const zData = p.zones.find((z) => z.config.code === w.zone);
        if (zData) {
          paceStr = formatTime(zData.paceTime);
          rest = w.customRestSecs ?? zData.restSecs;
          const cycleTotal = Math.ceil((zData.paceTime + rest) / 5) * 5;
          cycle = ` (Salida c/${formatTime(cycleTotal)})`;
        }
      }

      msg += `${idx + 1}. *${w.reps} x ${w.distance}m ${w.stroke}* @ *${w.zone.replace('_', ' ')}*\n`;
      msg += `   ⏱️ Ritmo objetivo: *${paceStr}* | Pausa: *${rest}s*${cycle}\n\n`;
    });

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* Header with Volume and Share */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <SwimmerAvatar
            name={selectedSwimmer.name}
            photoUrl={selectedSwimmer.photoUrl}
            size="sm"
            shape="rounded-xl"
          />
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
              Plan para {selectedSwimmer.name.split(' ')[0]}
            </span>
            <h2 className="text-base font-black text-white leading-tight">Pizarrón del Entrenador</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-right">
            <span className="text-[9px] text-slate-400 block font-medium uppercase">Volumen</span>
            <span className="text-xs font-black font-mono text-cyan-300">{totalMeters}m</span>
          </div>

          {workouts.length > 0 && (
            <button
              onClick={handleShareWorkout}
              className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 active:scale-95 transition-all"
              title="Compartir entrenamiento por WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Builder Form Card */}
      <form
        onSubmit={handleAddSet}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3"
      >
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Diseñar Nueva Serie
          </span>
          <span className="text-[11px] text-slate-400">
            {reps} x {currentDistance}m = <strong className="text-cyan-400 font-mono">{reps * currentDistance}m</strong>
          </span>
        </div>

        {/* Reps and Distance */}
        <div className="grid grid-cols-2 gap-2">
          {/* Repeticiones */}
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Repeticiones
            </label>
            <div className="flex items-center gap-1.5">
              {[4, 6, 8, 10, 12, 16].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setReps(r)}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    reps === r
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Distancia */}
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Distancia
            </label>
            <div className="flex items-center gap-1.5">
              {distances.slice(0, 4).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDistance(d)}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    currentDistance === d
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stroke Selection */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Estilo
          </label>
          <div className="grid grid-cols-5 gap-1">
            {STROKES.map((s) => (
              <button
                type="button"
                key={s.type}
                onClick={() => handleStrokeChange(s.type)}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  stroke === s.type
                    ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800/80 hover:text-white'
                }`}
              >
                <div className="text-sm">{s.icon}</div>
                <div className="text-[9px] mt-0.5 truncate">{s.type.slice(0, 4)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Zone Selection */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Zona de Intensidad
          </label>
          <div className="grid grid-cols-4 gap-1">
            {ZONES_CONFIG.map((z) => (
              <button
                type="button"
                key={z.code}
                onClick={() => {
                  setZone(z.code);
                  setCustomRest(z.defaultRestSecs(currentDistance));
                }}
                className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                  zone === z.code
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <div className="text-[11px] font-mono font-bold">{z.code.replace('_', ' ')}</div>
                <div className="text-[9px] text-slate-300">{Math.round(z.vmPercent * 100)}%</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rest seconds selector */}
        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Pausa de Descanso
            </span>
            <span className="text-xs text-slate-400">
              Entre cada repetición
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[15, 20, 30, 45, 60].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setCustomRest(s)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold ${
                  customRest === s
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>

        {/* Add Button */}
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Añadir Serie al Entrenamiento
        </button>
      </form>

      {/* Active Workout List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Series Programadas ({workouts.length})
          </h3>
          {workouts.length > 0 && (
            <button
              onClick={clearWorkout}
              className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
            >
              Borrar todas
            </button>
          )}
        </div>

        {workouts.length === 0 ? (
          <div className="text-center py-8 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 p-4">
            <Zap className="w-7 h-7 text-slate-600 mx-auto mb-1.5" />
            <p className="text-xs text-slate-400 font-medium">
              No hay series cargadas en la sesión de hoy.
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Utiliza el formulario de arriba o añade desde la pestaña "Ritmos".
            </p>
          </div>
        ) : (
          workouts.map((w, idx) => {
            const pb = selectedSwimmer.pbs[w.stroke]?.[w.distance];
            let paceTime: number | null = null;
            let pulse5s: number | null = null;
            let cycleSecs: number | null = null;

            if (pb) {
              const p = calculatePacesForDistance(pb, w.distance, w.stroke, selectedSwimmer.age);
              const zData = p.zones.find((z) => z.config.code === w.zone);
              if (zData) {
                paceTime = zData.paceTime;
                pulse5s = zData.pulse5s;
                const rest = w.customRestSecs ?? zData.restSecs;
                cycleSecs = Math.ceil((zData.paceTime + rest) / 5) * 5;
              }
            }

            return (
              <div
                key={w.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-black text-sm flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">
                        {w.reps} x {w.distance}m {w.stroke}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-800 text-cyan-300 rounded border border-slate-700">
                        {w.zone.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs mt-1 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        Paso: <strong className="text-white font-mono">{formatTime(paceTime)}</strong>
                      </span>
                      <span>
                        Pausa: <strong className="text-amber-400 font-mono">{w.customRestSecs || 30}s</strong>
                      </span>
                      {cycleSecs && (
                        <span className="text-slate-500 text-[10px]">
                          (c/{formatTime(cycleSecs)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pulse5s && (
                    <div className="text-right bg-red-950/30 px-2 py-1 rounded-lg border border-red-500/20">
                      <span className="text-[8px] text-red-400 block font-bold">5s PULSO</span>
                      <span className="text-xs font-black text-white font-mono">{pulse5s}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeWorkoutSet(w.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
