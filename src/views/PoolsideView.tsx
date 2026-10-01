import React, { useState, useEffect } from 'react';
import { useSwim } from '../context/SwimContext';
import { calculatePacesForDistance, formatTime, STROKES, STROKE_DISTANCES, ZONES_CONFIG } from '../utils/swimCalculations';
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  Maximize,
  Minimize,
  Users,
  Timer,
  Plus,
  Trash2,
  Clock,
} from 'lucide-react';
import { SwimmerAvatar } from '../components/SwimmerAvatar';
import type { StrokeType, ZoneCode, MultiLaneSlot } from '../types/swim';

export const PoolsideView: React.FC = () => {
  const { swimmers, selectedSwimmer, workouts } = useSwim();

  // Mode: 'single' (traditional) | 'multi' (multiple lanes simultaneously)
  const [timerMode, setTimerMode] = useState<'single' | 'multi'>('single');

  // Shared Stopwatch state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [singleLaps, setSingleLaps] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Multi-Lane slots state
  const [lanes, setLanes] = useState<MultiLaneSlot[]>(() => {
    return swimmers.slice(0, 2).map((s, idx) => ({
      id: `lane-${idx + 1}`,
      laneNumber: idx + 1,
      swimmerId: s.id,
      stroke: 'LIBRE',
      distance: 100,
      zone: 'A2_80',
      laps: [],
    }));
  });

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
    setSingleLaps([]);
  };

  const handleResetAllMultiLaps = () => {
    setLanes((prev) => prev.map((l) => ({ ...l, laps: [] })));
  };

  const handleSingleLap = () => {
    if (timerSeconds > 0) {
      setSingleLaps((prev) => [timerSeconds, ...prev]);
    }
  };

  const handleLaneLap = (laneId: string) => {
    if (timerSeconds > 0) {
      setLanes((prev) =>
        prev.map((l) =>
          l.id === laneId ? { ...l, laps: [timerSeconds, ...l.laps] } : l
        )
      );
    }
  };

  const handleClearLaneLaps = (laneId: string) => {
    setLanes((prev) =>
      prev.map((l) => (l.id === laneId ? { ...l, laps: [] } : l))
    );
  };

  const handleAddLane = () => {
    if (lanes.length >= 6) return;
    const nextNum = lanes.length + 1;
    const nextSwimmer = swimmers[lanes.length % swimmers.length] || swimmers[0];
    setLanes((prev) => [
      ...prev,
      {
        id: `lane-${Date.now()}`,
        laneNumber: nextNum,
        swimmerId: nextSwimmer.id,
        stroke: 'LIBRE',
        distance: 100,
        zone: 'A2_80',
        laps: [],
      },
    ]);
  };

  const handleRemoveLane = (laneId: string) => {
    if (lanes.length <= 1) return;
    setLanes((prev) =>
      prev
        .filter((l) => l.id !== laneId)
        .map((l, idx) => ({ ...l, laneNumber: idx + 1 }))
    );
  };

  const handleUpdateLane = (laneId: string, updates: Partial<MultiLaneSlot>) => {
    setLanes((prev) =>
      prev.map((l) => (l.id === laneId ? { ...l, ...updates } : l))
    );
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

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setTimerMode('single')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            timerMode === 'single'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Timer className="w-4 h-4" />
          Individual
        </button>

        <button
          onClick={() => setTimerMode('multi')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            timerMode === 'multi'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Multi-Andarivel ({lanes.length})
        </button>
      </div>

      {/* Main Stopwatch Clock Display (Shared) */}
      <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-3xl p-5 shadow-2xl text-center">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">
          {timerMode === 'single' ? 'Cronómetro Principal' : 'Largada Conjunta / Master'}
        </span>
        <div className="text-5xl font-black font-mono text-white tracking-tight my-2">
          {formatTime(timerSeconds)}
        </div>

        {/* Stopwatch Controls */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => {
              handleResetTimer();
              if (timerMode === 'multi') handleResetAllMultiLaps();
            }}
            className="p-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white active:scale-95 transition-all"
            title="Reiniciar cronómetro a 00:00"
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
                LARGADA
              </>
            )}
          </button>

          {timerMode === 'single' && (
            <button
              onClick={handleSingleLap}
              disabled={!timerRunning}
              className="px-5 py-3 rounded-2xl bg-slate-800 disabled:opacity-40 text-cyan-300 font-bold text-xs hover:bg-slate-700 active:scale-95 transition-all"
            >
              LAP
            </button>
          )}
        </div>

        {/* Recent Laps for Single Mode */}
        {timerMode === 'single' && singleLaps.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-900 flex gap-2 overflow-x-auto text-xs justify-center">
            {singleLaps.slice(0, 4).map((lap, i) => (
              <span key={i} className="bg-slate-900 px-2 py-1 rounded font-mono text-slate-300">
                L{singleLaps.length - i}: <strong>{formatTime(lap)}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* MODE 1: SINGLE SWIMMER PACE CARDS */}
      {timerMode === 'single' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <SwimmerAvatar
                name={selectedSwimmer.name}
                photoUrl={selectedSwimmer.photoUrl}
                size="sm"
                shape="rounded-xl"
              />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Tiempos Clave de {selectedSwimmer.name.split(' ')[0]}
                </h3>
                <span className="text-[10px] text-cyan-400 font-bold block">
                  FCM: {220 - selectedSwimmer.age} bpm
                </span>
              </div>
            </div>
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
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-cyan-400 font-mono">
                        #{idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-white">
                        {w.reps} x {w.distance}m {w.stroke}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {w.zone.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Pausa: <strong className="text-amber-400">{w.customRestSecs || 30}s</strong></span>
                      {bpm && <span>FC: <strong className="text-red-400">{bpm} bpm</strong></span>}
                      {pulse5s && <span>5s: <strong className="text-white font-mono">{pulse5s}</strong></span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Ritmo
                    </span>
                    <div className="text-2xl font-black font-mono text-cyan-300">
                      {formatTime(paceTime)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODE 2: MULTI-LANE STOPWATCH */}
      {timerMode === 'multi' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Andariveles en Pista ({lanes.length})
            </h3>
            {lanes.length < 6 && (
              <button
                onClick={handleAddLane}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir Andarivel
              </button>
            )}
          </div>

          {lanes.map((lane) => {
            const laneSwimmer = swimmers.find((s) => s.id === lane.swimmerId) || swimmers[0];
            const pb = laneSwimmer.pbs[lane.stroke]?.[lane.distance];
            let targetPace: number | null = null;

            if (pb) {
              const p = calculatePacesForDistance(pb, lane.distance, lane.stroke, laneSwimmer.age);
              const zData = p.zones.find((z) => z.config.code === lane.zone);
              if (zData) targetPace = zData.paceTime;
            }

            const lastLap = lane.laps[0] || null;
            let diff: number | null = null;
            if (lastLap && targetPace) {
              diff = lastLap - targetPace;
            }

            return (
              <div
                key={lane.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3"
              >
                {/* Lane Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-black text-xs flex items-center justify-center font-mono">
                      C{lane.laneNumber}
                    </span>
                    <SwimmerAvatar
                      name={laneSwimmer.name}
                      photoUrl={laneSwimmer.photoUrl}
                      size="xs"
                      shape="rounded-md"
                    />
                    <select
                      value={lane.swimmerId}
                      onChange={(e) => handleUpdateLane(lane.id, { swimmerId: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white px-2 py-1 max-w-[130px] truncate"
                    >
                      {swimmers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {lanes.length > 1 && (
                    <button
                      onClick={() => handleRemoveLane(lane.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-red-400"
                      title="Quitar andarivel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Target Configuration for Lane */}
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">
                      Estilo
                    </label>
                    <select
                      value={lane.stroke}
                      onChange={(e) => handleUpdateLane(lane.id, { stroke: e.target.value as StrokeType })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-[11px] font-semibold text-cyan-300"
                    >
                      {STROKES.map((s) => (
                        <option key={s.type} value={s.type}>
                          {s.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">
                      Distancia
                    </label>
                    <select
                      value={lane.distance}
                      onChange={(e) => handleUpdateLane(lane.id, { distance: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-[11px] font-semibold text-white font-mono"
                    >
                      {STROKE_DISTANCES[lane.stroke].map((d) => (
                        <option key={d} value={d}>
                          {d}m
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">
                      Zona
                    </label>
                    <select
                      value={lane.zone}
                      onChange={(e) => handleUpdateLane(lane.id, { zone: e.target.value as ZoneCode })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-[11px] font-semibold text-amber-300"
                    >
                      {ZONES_CONFIG.map((z) => (
                        <option key={z.code} value={z.code}>
                          {z.code.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Pace Banner & Split Button */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">
                      Ritmo Objetivo
                    </span>
                    <div className="text-lg font-black font-mono text-cyan-300">
                      {formatTime(targetPace)}
                    </div>
                    {diff !== null && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                          diff <= 0.4
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {diff > 0 ? `+${diff.toFixed(1)}s` : `${diff.toFixed(1)}s`}
                      </span>
                    )}
                  </div>

                  {/* Big Lap Button */}
                  <button
                    onClick={() => handleLaneLap(lane.id)}
                    disabled={!timerRunning}
                    className="flex-1 py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-black text-sm shadow-md shadow-cyan-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" />
                    LLEGADA C{lane.laneNumber}
                  </button>
                </div>

                {/* Laps List and comparison */}
                {lane.laps.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Últimos Parciales
                      </span>
                      <button
                        onClick={() => handleClearLaneLaps(lane.id)}
                        className="text-[10px] text-slate-500 hover:text-rose-400"
                      >
                        Limpiar
                      </button>
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                      {lane.laps.slice(0, 5).map((lap, idx) => {
                        const lapNum = lane.laps.length - idx;
                        const lapDiff = targetPace ? lap - targetPace : null;

                        return (
                          <div
                            key={idx}
                            className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 font-mono flex items-center gap-1.5 flex-shrink-0"
                          >
                            <span className="text-slate-500 text-[10px]">#{lapNum}</span>
                            <strong className="text-white">{formatTime(lap)}</strong>
                            {lapDiff !== null && (
                              <span
                                className={`text-[10px] font-bold px-1 rounded ${
                                  lapDiff <= 0.4
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {lapDiff > 0 ? `+${lapDiff.toFixed(1)}s` : `${lapDiff.toFixed(1)}s`}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
