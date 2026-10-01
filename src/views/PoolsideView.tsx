import React, { useState, useEffect, useRef } from 'react';
import { useSwim } from '../context/SwimContext';
import {
  calculatePacesForDistance,
  formatTime,
  STROKES,
  STROKE_DISTANCES,
  ZONES_CONFIG,
} from '../utils/swimCalculations';
import {
  initAudio,
  playCountdownBeep,
  playStartHorn,
  playCompleteFanfare,
} from '../utils/audioUtils';
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
  Volume2,
  VolumeX,
  AlarmClock,
  SkipForward,
  SkipBack,
  Sparkles,
} from 'lucide-react';
import { SwimmerAvatar } from '../components/SwimmerAvatar';
import type { StrokeType, ZoneCode, MultiLaneSlot, WorkoutSet } from '../types/swim';

export const PoolsideView: React.FC = () => {
  const { swimmers, selectedSwimmer, workouts } = useSwim();

  // Mode: 'single' | 'multi' | 'sendoff'
  const [timerMode, setTimerMode] = useState<'single' | 'multi' | 'sendoff'>('single');

  // Shared Stopwatch state for Single and Multi
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

  // SEND-OFF / INTERVAL TIMER STATE
  const [sendoffRunning, setSendoffRunning] = useState(false);
  const [sendoffRepsTotal, setSendoffRepsTotal] = useState(8);
  const [sendoffCurrentRep, setSendoffCurrentRep] = useState(1);
  const [sendoffCycleSecs, setSendoffCycleSecs] = useState(60);
  const [sendoffRemainingSecs, setSendoffRemainingSecs] = useState(60);
  const [sendoffIsPrep, setSendoffIsPrep] = useState(false);
  const [sendoffPrepSecs, setSendoffPrepSecs] = useState(5);
  const [sendoffSound, setSendoffSound] = useState(true);
  const [sendoffCompleted, setSendoffCompleted] = useState(false);

  // Interval reference for stopwatch
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Interval tick for Send-off Timer (1 second accuracy)
  const sendoffTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!sendoffRunning) {
      if (sendoffTimerRef.current) clearInterval(sendoffTimerRef.current);
      return;
    }

    sendoffTimerRef.current = setInterval(() => {
      if (sendoffIsPrep) {
        setSendoffPrepSecs((prev) => {
          const next = prev - 1;
          if (next > 0 && next <= 3 && sendoffSound) {
            playCountdownBeep();
          } else if (next === 0) {
            if (sendoffSound) playStartHorn();
            setSendoffIsPrep(false);
            setSendoffRemainingSecs(sendoffCycleSecs);
            setSendoffCurrentRep(1);
            return 5;
          }
          return next;
        });
      } else {
        setSendoffRemainingSecs((prev) => {
          const next = prev - 1;
          if (next > 0 && next <= 3 && sendoffSound) {
            playCountdownBeep();
          } else if (next <= 0) {
            setSendoffCurrentRep((currRep) => {
              if (currRep >= sendoffRepsTotal) {
                // Completed whole workout!
                setSendoffRunning(false);
                setSendoffCompleted(true);
                if (sendoffSound) playCompleteFanfare();
                return currRep;
              } else {
                if (sendoffSound) playStartHorn();
                setSendoffRemainingSecs(sendoffCycleSecs);
                return currRep + 1;
              }
            });
            return sendoffCycleSecs;
          }
          return next;
        });
      }
    }, 1000);

    return () => {
      if (sendoffTimerRef.current) clearInterval(sendoffTimerRef.current);
    };
  }, [sendoffRunning, sendoffIsPrep, sendoffCycleSecs, sendoffRepsTotal, sendoffSound]);

  // Sendoff Controls
  const handleStartSendoff = () => {
    initAudio();
    if (sendoffCompleted) {
      setSendoffCompleted(false);
      setSendoffCurrentRep(1);
      setSendoffRemainingSecs(sendoffCycleSecs);
    }
    if (!sendoffRunning && sendoffCurrentRep === 1 && sendoffRemainingSecs === sendoffCycleSecs) {
      setSendoffIsPrep(true);
      setSendoffPrepSecs(5);
    }
    setSendoffRunning(!sendoffRunning);
  };

  const handleResetSendoff = () => {
    setSendoffRunning(false);
    setSendoffCompleted(false);
    setSendoffIsPrep(false);
    setSendoffPrepSecs(5);
    setSendoffCurrentRep(1);
    setSendoffRemainingSecs(sendoffCycleSecs);
  };

  const handleSkipNextRep = () => {
    if (sendoffCurrentRep < sendoffRepsTotal) {
      setSendoffCurrentRep((prev) => prev + 1);
      setSendoffRemainingSecs(sendoffCycleSecs);
      if (sendoffSound) playStartHorn();
    }
  };

  const handleSkipPrevRep = () => {
    if (sendoffCurrentRep > 1) {
      setSendoffCurrentRep((prev) => prev - 1);
      setSendoffRemainingSecs(sendoffCycleSecs);
    }
  };

  const handleLoadWorkoutSetIntoSendoff = (w: WorkoutSet) => {
    const pb = selectedSwimmer.pbs[w.stroke]?.[w.distance];
    let cycle = 60;
    if (pb) {
      const p = calculatePacesForDistance(pb, w.distance, w.stroke, selectedSwimmer.age);
      const zData = p.zones.find((z) => z.config.code === w.zone);
      if (zData) {
        const rest = w.customRestSecs ?? zData.restSecs;
        cycle = Math.ceil((zData.paceTime + rest) / 5) * 5;
      }
    }
    setSendoffRepsTotal(w.reps);
    setSendoffCycleSecs(cycle);
    setSendoffRemainingSecs(cycle);
    setSendoffCurrentRep(1);
    setSendoffCompleted(false);
    setSendoffIsPrep(false);
  };

  // Stopwatch handlers
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
            <p className="text-xs text-slate-400">Control visual y sonoro a pie de pileta</p>
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

      {/* Mode Switcher Tabs (3 Modes) */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setTimerMode('single')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            timerMode === 'single'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          Individual
        </button>

        <button
          onClick={() => setTimerMode('multi')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            timerMode === 'multi'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Multi ({lanes.length})
        </button>

        <button
          onClick={() => {
            initAudio();
            setTimerMode('sendoff');
          }}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            timerMode === 'sendoff'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlarmClock className="w-3.5 h-3.5" />
          Reloj Salidas
        </button>
      </div>

      {/* ============================================================== */}
      {/* MODE 1 & 2: TRADITIONAL STOPWATCH CLOCK (Shared by Single & Multi) */}
      {/* ============================================================== */}
      {timerMode !== 'sendoff' && (
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
      )}

      {/* ============================================================== */}
      {/* MODE 3: RELOJ DE SALIDAS (INTERVAL / SEND-OFF TIMER WITH AUDIO) */}
      {/* ============================================================== */}
      {timerMode === 'sendoff' && (
        <div className="space-y-3">
          {/* Main Giant Interval Display Card */}
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl text-center relative overflow-hidden">
            {/* Top Bar inside card: Status & Mute */}
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <AlarmClock className="w-3.5 h-3.5" />
                Reloj de Salidas
              </span>

              <button
                type="button"
                onClick={() => {
                  initAudio();
                  setSendoffSound(!sendoffSound);
                }}
                className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-semibold border transition-all ${
                  sendoffSound
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
                title={sendoffSound ? 'Bip de salida activado' : 'Bip silenciado'}
              >
                {sendoffSound ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{sendoffSound ? 'Bip ON' : 'Mudo'}</span>
              </button>
            </div>

            {/* Repetition Indicator */}
            <div className="my-1">
              {sendoffCompleted ? (
                <div className="text-emerald-400 font-black text-xl flex items-center justify-center gap-2 animate-bounce">
                  <Sparkles className="w-5 h-5" />
                  ¡SERIE COMPLETADA!
                </div>
              ) : sendoffIsPrep ? (
                <div className="text-amber-400 font-bold text-sm tracking-wider animate-pulse">
                  PREPARADOS PARA LARGAR...
                </div>
              ) : (
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Repetición <span className="text-amber-300 font-mono text-base font-black">{sendoffCurrentRep}</span> de{' '}
                  <span className="text-white font-mono text-base">{sendoffRepsTotal}</span>
                </div>
              )}
            </div>

            {/* Giant Countdown Time */}
            <div
              className={`text-6xl font-black font-mono tracking-tight my-2 transition-colors ${
                sendoffCompleted
                  ? 'text-emerald-400'
                  : sendoffIsPrep
                  ? 'text-amber-400 animate-pulse'
                  : sendoffRemainingSecs <= 3 && sendoffRunning
                  ? 'text-rose-400 animate-ping'
                  : 'text-white'
              }`}
            >
              {sendoffIsPrep ? `00:0${sendoffPrepSecs}` : formatTime(sendoffRemainingSecs)}
            </div>

            {/* Progress Bar of Current Cycle */}
            {!sendoffIsPrep && (
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden my-3 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{
                    width: `${((sendoffCycleSecs - sendoffRemainingSecs) / sendoffCycleSecs) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* Cycle info subtext */}
            <div className="text-xs text-slate-400 flex items-center justify-center gap-2 mb-3">
              <span>Salida cada:</span>
              <strong className="text-amber-300 font-mono text-sm">{formatTime(sendoffCycleSecs)}</strong>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleSkipPrevRep}
                disabled={sendoffCurrentRep <= 1 || sendoffIsPrep}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 active:scale-95 transition-all"
                title="Repetición anterior"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetSendoff}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white active:scale-95 transition-all"
                title="Reiniciar serie"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleStartSendoff}
                className={`px-8 py-3.5 rounded-2xl font-black text-base flex items-center gap-2 shadow-lg active:scale-95 transition-all ${
                  sendoffRunning
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/30'
                }`}
              >
                {sendoffRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    PAUSAR
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    {sendoffCompleted ? 'REPETIR' : 'INICIAR'}
                  </>
                )}
              </button>

              <button
                onClick={handleSkipNextRep}
                disabled={sendoffCurrentRep >= sendoffRepsTotal || sendoffIsPrep}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 active:scale-95 transition-all"
                title="Siguiente repetición"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Configurator Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Clock className="w-4 h-4 text-amber-400" />
              Configurar Serie y Salidas
            </h3>

            {/* Reps and Interval Adjusters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Cantidad de Reps
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                  <button
                    type="button"
                    disabled={sendoffRunning}
                    onClick={() => {
                      const n = Math.max(1, sendoffRepsTotal - 1);
                      setSendoffRepsTotal(n);
                    }}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-sm disabled:opacity-40"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    disabled={sendoffRunning}
                    value={sendoffRepsTotal}
                    onChange={(e) => setSendoffRepsTotal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center bg-transparent text-white font-mono font-bold text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={sendoffRunning}
                    onClick={() => setSendoffRepsTotal(sendoffRepsTotal + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-sm disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Ciclo de Salida (Seg)
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                  <button
                    type="button"
                    disabled={sendoffRunning}
                    onClick={() => {
                      const n = Math.max(10, sendoffCycleSecs - 5);
                      setSendoffCycleSecs(n);
                      setSendoffRemainingSecs(n);
                    }}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-sm disabled:opacity-40"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step={5}
                    min={10}
                    max={600}
                    disabled={sendoffRunning}
                    value={sendoffCycleSecs}
                    onChange={(e) => {
                      const n = Math.max(5, parseInt(e.target.value) || 30);
                      setSendoffCycleSecs(n);
                      setSendoffRemainingSecs(n);
                    }}
                    className="w-full text-center bg-transparent text-amber-300 font-mono font-bold text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={sendoffRunning}
                    onClick={() => {
                      const n = sendoffCycleSecs + 5;
                      setSendoffCycleSecs(n);
                      setSendoffRemainingSecs(n);
                    }}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-sm disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick interval buttons */}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Ciclos rápidos habituales:
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[
                  { label: 'c/ 45s', secs: 45 },
                  { label: 'c/ 50s', secs: 50 },
                  { label: 'c/ 1:00', secs: 60 },
                  { label: 'c/ 1:15', secs: 75 },
                  { label: 'c/ 1:30', secs: 90 },
                  { label: 'c/ 1:40', secs: 100 },
                  { label: 'c/ 1:45', secs: 105 },
                  { label: 'c/ 2:00', secs: 120 },
                ].map((item) => (
                  <button
                    key={item.secs}
                    type="button"
                    disabled={sendoffRunning}
                    onClick={() => {
                      setSendoffCycleSecs(item.secs);
                      setSendoffRemainingSecs(item.secs);
                    }}
                    className={`py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
                      sendoffCycleSecs === item.secs
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shortcut: Load from active workout in the board */}
            {workouts.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Cargar desde el Pizarrón de hoy:
                </span>
                <div className="space-y-1.5">
                  {workouts.slice(0, 3).map((w, idx) => (
                    <button
                      key={w.id}
                      type="button"
                      disabled={sendoffRunning}
                      onClick={() => handleLoadWorkoutSetIntoSendoff(w)}
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left text-xs flex items-center justify-between text-slate-300 hover:text-white transition-all"
                    >
                      <span className="font-semibold truncate">
                        #{idx + 1}. {w.reps} x {w.distance}m {w.stroke}
                      </span>
                      <span className="text-cyan-400 font-mono text-[11px] font-bold flex-shrink-0 ml-2">
                        {w.reps} reps
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 1: SINGLE SWIMMER PACE CARDS */}
      {/* ============================================================== */}
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

      {/* ============================================================== */}
      {/* MODE 2: MULTI-LANE STOPWATCH */}
      {/* ============================================================== */}
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
