import React, { useState, useEffect } from 'react';
import { useSwim } from '../context/SwimContext';
import { calculatePacesForDistance, formatTime } from '../utils/swimCalculations';
import { Play, Pause, RotateCcw, Flame, Heart, Maximize, Minimize } from 'lucide-react';

export const PoolsideView: React.FC = () => {
  const { selectedSwimmer, workouts } = useSwim();

  // Stopwatch state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (timerSeconds > 0) {
      setLaps((prev) => [timerSeconds, ...prev]);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* Poolside Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Modo Borde de Pileta</h2>
            <p className="text-xs text-slate-400">Lectura rápida y cronometraje</p>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          title="Pantalla completa"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>

      {/* Built-in Stopwatch Display */}
      <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-3xl p-5 shadow-2xl text-center">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">
          Cronómetro de Salida / Control
        </span>
        <div className="text-5xl font-black font-mono text-white tracking-tight my-2">
          {formatTime(timerSeconds)}
        </div>

        {/* Stopwatch Controls */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={handleResetTimer}
            className="p-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Reiniciar cronómetro"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className={`px-8 py-3.5 rounded-2xl font-black text-base flex items-center gap-2 shadow-lg active:scale-95 transition-all ${
              timerRunning
                ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            {timerRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                PAUSAR
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                INICIAR
              </>
            )}
          </button>

          <button
            onClick={handleLap}
            disabled={!timerRunning}
            className="px-4 py-3 rounded-2xl bg-slate-800 disabled:opacity-40 text-cyan-300 font-bold text-xs hover:bg-slate-700 active:scale-95 transition-all"
          >
            LAP
          </button>
        </div>

        {/* Recent Laps */}
        {laps.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-900 flex gap-2 overflow-x-auto text-xs justify-center">
            {laps.slice(0, 4).map((lap, i) => (
              <span key={i} className="bg-slate-900 px-2 py-1 rounded font-mono text-slate-300">
                L{laps.length - i}: <strong>{formatTime(lap)}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Giant Target Pace Cards for Current Swimmer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tiempos Clave de {selectedSwimmer.name.split(' ')[0]}
          </h3>
          <span className="text-[10px] text-cyan-400 font-bold">
            FCM: {220 - selectedSwimmer.age} bpm
          </span>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center">
            <p className="text-sm font-semibold text-white mb-1">
              No hay series en el pizarrón.
            </p>
            <p className="text-xs text-slate-400">
              Ve a la pestaña "Pizarrón" para armar las series de hoy y verlas aquí en tamaño gigante.
            </p>
          </div>
        ) : (
          workouts.map((w, idx) => {
            const pb = selectedSwimmer.pbs[w.stroke]?.[w.distance];
            let paceTime: number | null = null;
            let bpm: number | null = null;
            let pulse5s: number | null = null;

            if (pb) {
              const p = calculatePacesForDistance(pb, w.distance, w.stroke, selectedSwimmer.age);
              const zData = p.zones.find((z) => z.config.code === w.zone);
              if (zData) {
                paceTime = zData.paceTime;
                bpm = zData.bpm;
                pulse5s = zData.pulse5s;
              }
            }

            return (
              <div
                key={w.id}
                className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-800 rounded-3xl p-4 shadow-xl"
              >
                {/* Series Title */}
                <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <h4 className="text-base font-black text-white">
                      {w.reps} x {w.distance}m {w.stroke}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-black text-xs border border-cyan-500/30">
                    {w.zone.replace('_', ' ')}
                  </span>
                </div>

                {/* Giant Metric Readout */}
                <div className="grid grid-cols-2 gap-3 items-center">
                  {/* Big Target Pace */}
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Tiempo Objetivo
                    </span>
                    <div className="text-3xl font-black font-mono text-cyan-300 tracking-tight">
                      {formatTime(paceTime)}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Pausa: {w.customRestSecs || 30}s
                    </span>
                  </div>

                  {/* Big 5-Sec Pulse Count */}
                  <div className="bg-red-950/30 p-3 rounded-2xl border border-red-500/30 text-center">
                    <span className="text-[10px] uppercase font-bold text-red-400 block mb-0.5 flex items-center justify-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" />
                      Pulso (5 seg)
                    </span>
                    <div className="text-3xl font-black font-mono text-white tracking-tight">
                      {pulse5s ?? '--'}
                    </div>
                    <span className="text-[10px] text-red-300 font-medium">
                      ({bpm ?? '--'} BPM)
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
