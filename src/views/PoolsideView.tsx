import React, { useState, useEffect, useRef } from 'react';
import { useSwim } from '../context/SwimContext';
import {
  calculatePacesForDistance,
  formatTime,
  STROKES,
  STROKE_DISTANCES,
  zoneName,
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
  Maximize,
  Minimize,
  Plus,
  Trash2,
  Clock,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
} from 'lucide-react';
import { SwimmerAvatar } from '../components/SwimmerAvatar';
import type { StrokeType, ZoneCode, MultiLaneSlot, WorkoutSet } from '../types/swim';

export const PoolsideView: React.FC = () => {
  const { swimmers, selectedSwimmer, workouts, zones } = useSwim();

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

  // Stopwatch: se calcula con el reloj (performance.now), no sumando ticks,
  // así no pierde tiempo si el navegador frena el intervalo (pantalla bloqueada).
  const timerSecondsRef = useRef(0);

  // Send-off timer: también basado en el reloj. Se rearma (nueva base) al
  // iniciar/pausar, saltar repetición o cambiar ciclo/repeticiones.
  const [sendoffEpoch, setSendoffEpoch] = useState(0);
  const sendoffRef = useRef({
    isPrep: false,
    prepSecs: 5,
    remaining: 60,
    rep: 1,
    cycle: 60,
    total: 8,
    sound: true,
  });

  // Debe ir antes de los efectos de los temporizadores: ellos leen estos refs
  useEffect(() => {
    timerSecondsRef.current = timerSeconds;
    sendoffRef.current = {
      isPrep: sendoffIsPrep,
      prepSecs: sendoffPrepSecs,
      remaining: sendoffRemainingSecs,
      rep: sendoffCurrentRep,
      cycle: sendoffCycleSecs,
      total: sendoffRepsTotal,
      sound: sendoffSound,
    };
  });

  useEffect(() => {
    if (!timerRunning) return;
    const startedAt = performance.now();
    const base = timerSecondsRef.current;
    const interval = setInterval(() => {
      setTimerSeconds(base + (performance.now() - startedAt) / 1000);
    }, 100);
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (!sendoffRunning) return;
    const snap = sendoffRef.current;
    const startedAt = performance.now();
    const lead = snap.isPrep ? snap.prepSecs : 0; // segundos de preparación
    const first = snap.isPrep ? snap.cycle : snap.remaining; // lo que queda de la primera repetición
    const startRep = snap.isPrep ? 1 : snap.rep;
    let lastPrep = snap.isPrep ? snap.prepSecs : 0;
    let lastRep = snap.rep;
    let lastRem = snap.remaining;

    const interval = setInterval(() => {
      const { cycle, total, sound } = sendoffRef.current;
      const e = (performance.now() - startedAt) / 1000;

      if (e < lead) {
        const prepLeft = Math.ceil(lead - e);
        if (prepLeft !== lastPrep) {
          if (sound && prepLeft <= 3) playCountdownBeep();
          lastPrep = prepLeft;
          setSendoffPrepSecs(prepLeft);
        }
        return;
      }

      const e2 = e - lead;
      let rep = startRep;
      let rem: number;
      if (e2 < first) {
        rem = Math.ceil(first - e2);
      } else {
        const e3 = e2 - first;
        rep = startRep + 1 + Math.floor(e3 / cycle);
        rem = Math.ceil(cycle - (e3 % cycle));
      }

      if (rep > total) {
        if (sound) playCompleteFanfare();
        setSendoffRunning(false);
        setSendoffCompleted(true);
        setSendoffIsPrep(false);
        setSendoffPrepSecs(5);
        setSendoffCurrentRep(total);
        setSendoffRemainingSecs(cycle);
        return;
      }

      if (lead > 0 && lastPrep !== 0) {
        // terminó la preparación
        lastPrep = 0;
        setSendoffIsPrep(false);
        setSendoffPrepSecs(5);
        if (sound) playStartHorn();
      } else if (rep !== lastRep) {
        if (sound) playStartHorn();
      } else if (rem !== lastRem && rem <= 3 && sound) {
        playCountdownBeep();
      }

      if (rep !== lastRep) {
        lastRep = rep;
        setSendoffCurrentRep(rep);
      }
      if (rem !== lastRem) {
        lastRem = rem;
        setSendoffRemainingSecs(rem);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [sendoffRunning, sendoffEpoch, sendoffCycleSecs, sendoffRepsTotal]);

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
      setSendoffEpoch((n) => n + 1);
      if (sendoffSound) playStartHorn();
    }
  };

  const handleSkipPrevRep = () => {
    if (sendoffCurrentRep > 1) {
      setSendoffCurrentRep((prev) => prev - 1);
      setSendoffRemainingSecs(sendoffCycleSecs);
      setSendoffEpoch((n) => n + 1);
    }
  };

  const handleLoadWorkoutSetIntoSendoff = (w: WorkoutSet) => {
    const pb = selectedSwimmer.pbs[w.stroke]?.[w.distance];
    let cycle = 60;
    if (pb) {
      const p = calculatePacesForDistance(pb, w.distance, w.stroke, selectedSwimmer.age, zones);
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

  const field = 'w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-sm font-semibold text-white focus:outline-none focus:border-cyan-500';
  const stepBtn = 'w-9 h-9 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-lg disabled:opacity-40';
  const modeTabs = [
    { id: 'single', label: 'Individual' },
    { id: 'multi', label: `Andariveles (${lanes.length})` },
    { id: 'sendoff', label: 'Salidas' },
  ] as const;

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">Cronómetro y salidas</p>
          <h2 className="font-display text-3xl font-bold text-white leading-tight">En pileta</h2>
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-2 text-slate-400 hover:text-white"
          title="Pantalla completa"
          aria-label="Pantalla completa"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex gap-5 border-b border-slate-800" role="group" aria-label="Modo">
        {modeTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              if (t.id === 'sendoff') initAudio();
              setTimerMode(t.id);
            }}
            aria-pressed={timerMode === t.id}
            className={`pb-2 -mb-px border-b-2 text-sm font-semibold whitespace-nowrap ${
              timerMode === t.id ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cronómetro (individual y andariveles) */}
      {timerMode !== 'sendoff' && (
        <section aria-label="Cronómetro" className="text-center">
          <p className="text-xs text-slate-400">
            {timerMode === 'single' ? 'Cronómetro' : 'Largada conjunta'}
          </p>
          <div className="font-display text-7xl font-bold text-white tabular-nums my-1" aria-live="off">
            {formatTime(timerSeconds)}
          </div>

          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              onClick={() => {
                handleResetTimer();
                if (timerMode === 'multi') handleResetAllMultiLaps();
              }}
              className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white active:scale-95 transition-transform"
              title="Reiniciar cronómetro"
              aria-label="Reiniciar cronómetro"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className={`px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 active:scale-95 transition-transform ${
                timerRunning ? 'bg-rose-500 text-white' : 'bg-[#EEF3F1] text-[#0B1F2A]'
              }`}
            >
              {timerRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Largada
                </>
              )}
            </button>

            {timerMode === 'single' && (
              <button
                onClick={handleSingleLap}
                disabled={!timerRunning}
                className="px-5 py-3.5 rounded-2xl bg-slate-800 disabled:opacity-40 text-cyan-300 font-bold text-sm active:scale-95 transition-transform"
              >
                Parcial
              </button>
            )}
          </div>

          {timerMode === 'single' && singleLaps.length > 0 && (
            <ul className="mt-4 flex gap-4 overflow-x-auto justify-center text-sm tabular-nums text-slate-300">
              {singleLaps.slice(0, 4).map((lap, i) => (
                <li key={i} className="whitespace-nowrap">
                  <span className="text-xs text-slate-400">P{singleLaps.length - i}</span>{' '}
                  <strong className="text-white">{formatTime(lap)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Reloj de salidas */}
      {timerMode === 'sendoff' && (
        <div className="space-y-6">
          <section aria-label="Reloj de salidas" className="text-center">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Salida cada <strong className="text-white tabular-nums">{Math.floor(sendoffCycleSecs / 60)}:{String(sendoffCycleSecs % 60).padStart(2, '0')}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  initAudio();
                  setSendoffSound(!sendoffSound);
                }}
                aria-pressed={sendoffSound}
                className={`inline-flex items-center gap-1 font-semibold ${sendoffSound ? 'text-amber-300' : 'text-slate-500'}`}
                title={sendoffSound ? 'Bip activado' : 'Bip silenciado'}
              >
                {sendoffSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {sendoffSound ? 'Bip' : 'Mudo'}
              </button>
            </div>

            <p className="mt-2 text-sm font-semibold h-6">
              {sendoffCompleted ? (
                <span className="text-emerald-400">Serie completada</span>
              ) : sendoffIsPrep ? (
                <span className="text-amber-400">Preparados…</span>
              ) : (
                <span className="text-slate-300">
                  Repetición <span className="font-display text-xl text-amber-300 tabular-nums">{sendoffCurrentRep}</span> de{' '}
                  <span className="font-display text-xl text-white tabular-nums">{sendoffRepsTotal}</span>
                </span>
              )}
            </p>

            <div
              className={`font-display text-8xl font-bold tabular-nums my-1 ${
                sendoffCompleted
                  ? 'text-emerald-400'
                  : sendoffIsPrep
                  ? 'text-amber-400'
                  : sendoffRemainingSecs <= 3 && sendoffRunning
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              {sendoffIsPrep ? `0:0${sendoffPrepSecs}` : formatTime(sendoffRemainingSecs)}
            </div>

            {!sendoffIsPrep && (
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden my-3">
                <div
                  className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
                  style={{ width: `${((sendoffCycleSecs - sendoffRemainingSecs) / sendoffCycleSecs) * 100}%` }}
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                onClick={handleSkipPrevRep}
                disabled={sendoffCurrentRep <= 1 || sendoffIsPrep}
                className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 active:scale-95 transition-transform"
                title="Repetición anterior"
                aria-label="Repetición anterior"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetSendoff}
                className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white active:scale-95 transition-transform"
                title="Reiniciar serie"
                aria-label="Reiniciar serie"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleStartSendoff}
                className={`px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 active:scale-95 transition-transform ${
                  sendoffRunning ? 'bg-rose-500 text-white' : 'bg-[#EEF3F1] text-[#0B1F2A]'
                }`}
              >
                {sendoffRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    {sendoffCompleted ? 'Repetir' : 'Iniciar'}
                  </>
                )}
              </button>

              <button
                onClick={handleSkipNextRep}
                disabled={sendoffCurrentRep >= sendoffRepsTotal || sendoffIsPrep}
                className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 active:scale-95 transition-transform"
                title="Siguiente repetición"
                aria-label="Siguiente repetición"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Configurar la serie */}
          <section className="space-y-4">
            <h3 className="font-display text-xl font-bold text-white border-b border-slate-800 pb-1">Configurar la serie</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Repeticiones</label>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                  <button
                    type="button"
                    aria-label="Menos repeticiones"
                    disabled={sendoffRunning}
                    onClick={() => setSendoffRepsTotal(Math.max(1, sendoffRepsTotal - 1))}
                    className={stepBtn}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    disabled={sendoffRunning}
                    value={sendoffRepsTotal}
                    aria-label="Repeticiones"
                    onChange={(e) => setSendoffRepsTotal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center bg-transparent text-white font-display text-xl font-bold tabular-nums focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Más repeticiones"
                    disabled={sendoffRunning}
                    onClick={() => setSendoffRepsTotal(sendoffRepsTotal + 1)}
                    className={stepBtn}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Salida cada (segundos)</label>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                  <button
                    type="button"
                    aria-label="Menos segundos"
                    disabled={sendoffRunning}
                    onClick={() => {
                      const n = Math.max(10, sendoffCycleSecs - 5);
                      setSendoffCycleSecs(n);
                      setSendoffRemainingSecs(n);
                    }}
                    className={stepBtn}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    step={5}
                    min={10}
                    max={600}
                    disabled={sendoffRunning}
                    value={sendoffCycleSecs}
                    aria-label="Segundos del ciclo"
                    onChange={(e) => {
                      const n = Math.max(5, parseInt(e.target.value) || 30);
                      setSendoffCycleSecs(n);
                      setSendoffRemainingSecs(n);
                    }}
                    className="w-full text-center bg-transparent text-amber-300 font-display text-xl font-bold tabular-nums focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Más segundos"
                    disabled={sendoffRunning}
                    onClick={() => {
                      const n = sendoffCycleSecs + 5;
                      setSendoffCycleSecs(n);
                      setSendoffRemainingSecs(n);
                    }}
                    className={stepBtn}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1.5">Ciclos habituales</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'c/45s', secs: 45 },
                  { label: 'c/50s', secs: 50 },
                  { label: 'c/1:00', secs: 60 },
                  { label: 'c/1:15', secs: 75 },
                  { label: 'c/1:30', secs: 90 },
                  { label: 'c/1:40', secs: 100 },
                  { label: 'c/1:45', secs: 105 },
                  { label: 'c/2:00', secs: 120 },
                ].map((item) => (
                  <button
                    key={item.secs}
                    type="button"
                    disabled={sendoffRunning}
                    onClick={() => {
                      setSendoffCycleSecs(item.secs);
                      setSendoffRemainingSecs(item.secs);
                    }}
                    aria-pressed={sendoffCycleSecs === item.secs}
                    className={`py-2 rounded-lg text-xs font-semibold tabular-nums disabled:opacity-50 ${
                      sendoffCycleSecs === item.secs ? 'bg-[#EEF3F1] text-[#0B1F2A]' : 'bg-slate-900 text-slate-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {workouts.length > 0 && (
              <div className="rounded-2xl bg-[#EEF3F1] text-[#0B1F2A] p-4">
                <h4 className="font-display text-lg font-bold">Cargar desde la pizarra</h4>
                <ul className="mt-1 divide-y divide-[#0B1F2A]/15">
                  {workouts.slice(0, 3).map((w) => (
                    <li key={w.id}>
                      <button
                        type="button"
                        disabled={sendoffRunning}
                        onClick={() => handleLoadWorkoutSetIntoSendoff(w)}
                        className="w-full py-2 text-left flex items-baseline justify-between gap-2 disabled:opacity-50"
                      >
                        <span className="font-display text-xl font-bold tabular-nums whitespace-nowrap">
                          {w.reps} × {w.distance}
                        </span>
                        <span className="flex-1 min-w-0 text-sm truncate">
                          <span className="font-semibold">{w.stroke}</span>{' '}
                          <span className="text-[#0E7C9B] font-bold">{zoneName(w.zone)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Individual: ritmos de las series de hoy */}
      {timerMode === 'single' && (
        <section aria-labelledby="keytimes-title" className="rounded-2xl bg-[#EEF3F1] text-[#0B1F2A] p-4 shadow-xl">
          <div className="flex items-baseline justify-between gap-2">
            <h3 id="keytimes-title" className="font-display text-xl font-bold truncate">
              Ritmos de {selectedSwimmer.name.split(' ')[0]}
            </h3>
            <span className="text-xs text-[#0B1F2A]/70 tabular-nums whitespace-nowrap">FC máx {220 - selectedSwimmer.age}</span>
          </div>

          {workouts.length === 0 ? (
            <p className="text-sm mt-2">
              No hay series en la pizarra. Arma las de hoy en la pestaña Pizarra y aparecen acá.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-[#0B1F2A]/15">
              {workouts.map((w) => {
                const pb = selectedSwimmer.pbs[w.stroke]?.[w.distance];
                let paceTime: number | null = null;
                let bpm: number | null = null;
                let pulse5s: number | null = null;

                if (pb) {
                  const p = calculatePacesForDistance(pb, w.distance, w.stroke, selectedSwimmer.age, zones);
                  const zData = p.zones.find((z) => z.config.code === w.zone);
                  if (zData) {
                    paceTime = zData.paceTime;
                    bpm = zData.bpm;
                    pulse5s = zData.pulse5s;
                  }
                }

                return (
                  <li key={w.id} className="py-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-2xl font-bold tabular-nums whitespace-nowrap">
                        {w.reps} × {w.distance}
                      </span>
                      <span className="flex-1 min-w-0 text-sm truncate">
                        <span className="font-semibold">{w.stroke}</span>{' '}
                        <span className="text-[#0E7C9B] font-bold">{zoneName(w.zone)}</span>
                      </span>
                      <span className="font-display text-2xl font-bold tabular-nums whitespace-nowrap">
                        {paceTime ? formatTime(paceTime) : 'sin marca'}
                      </span>
                    </div>
                    <p className="text-xs text-[#0B1F2A]/70 tabular-nums">
                      pausa {w.customRestSecs || 30} s{bpm ? ` · ${bpm} lpm` : ''}
                      {pulse5s ? ` · ${pulse5s} pulsos en 5 s` : ''}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Andariveles */}
      {timerMode === 'multi' && (
        <section className="space-y-5">
          <div className="flex items-baseline justify-between border-b border-slate-800 pb-1">
            <h3 className="font-display text-xl font-bold text-white">Andariveles en pista</h3>
            {lanes.length < 6 && (
              <button onClick={handleAddLane} className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            )}
          </div>

          {lanes.map((lane) => {
            const laneSwimmer = swimmers.find((s) => s.id === lane.swimmerId) || swimmers[0];
            const pb = laneSwimmer.pbs[lane.stroke]?.[lane.distance];
            let targetPace: number | null = null;

            if (pb) {
              const p = calculatePacesForDistance(pb, lane.distance, lane.stroke, laneSwimmer.age, zones);
              const zData = p.zones.find((z) => z.config.code === lane.zone);
              if (zData) targetPace = zData.paceTime;
            }

            const lastLap = lane.laps[0] || null;
            const diff = lastLap && targetPace ? lastLap - targetPace : null;
            const diffClass = (d: number) => (d <= 0.4 ? 'text-emerald-400' : 'text-rose-400');
            const fmtDiff = (d: number) => (d > 0 ? `+${d.toFixed(1)}s` : `${d.toFixed(1)}s`);

            return (
              <div key={lane.id} className="space-y-3 pb-5 border-b border-slate-800 last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl font-bold text-cyan-300 w-9">C{lane.laneNumber}</span>
                  <SwimmerAvatar name={laneSwimmer.name} photoUrl={laneSwimmer.photoUrl} size="xs" shape="rounded-md" />
                  <select
                    value={lane.swimmerId}
                    onChange={(e) => handleUpdateLane(lane.id, { swimmerId: e.target.value })}
                    aria-label={`Nadador del andarivel ${lane.laneNumber}`}
                    className={`${field} flex-1 min-w-0 truncate`}
                  >
                    {swimmers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.sede ? `(${s.sede})` : s.club ? `(${s.club})` : ''}
                      </option>
                    ))}
                  </select>
                  {lanes.length > 1 && (
                    <button
                      onClick={() => handleRemoveLane(lane.id)}
                      className="p-2 text-slate-500 hover:text-red-400"
                      title="Quitar andarivel"
                      aria-label={`Quitar andarivel ${lane.laneNumber}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={lane.stroke}
                    onChange={(e) => handleUpdateLane(lane.id, { stroke: e.target.value as StrokeType })}
                    aria-label="Estilo"
                    className={field}
                  >
                    {STROKES.map((s) => (
                      <option key={s.type} value={s.type}>{s.type}</option>
                    ))}
                  </select>
                  <select
                    value={lane.distance}
                    onChange={(e) => handleUpdateLane(lane.id, { distance: parseInt(e.target.value) })}
                    aria-label="Distancia"
                    className={`${field} tabular-nums`}
                  >
                    {STROKE_DISTANCES[lane.stroke].map((d) => (
                      <option key={d} value={d}>{d} m</option>
                    ))}
                  </select>
                  <select
                    value={lane.zone}
                    onChange={(e) => handleUpdateLane(lane.id, { zone: e.target.value as ZoneCode })}
                    aria-label="Zona"
                    className={field}
                  >
                    {zones.map((z) => (
                      <option key={z.code} value={z.code}>{z.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Ritmo objetivo</p>
                    <p className="font-display text-3xl font-bold text-white tabular-nums leading-none">{formatTime(targetPace)}</p>
                    {diff !== null && (
                      <span className={`text-xs font-bold tabular-nums ${diffClass(diff)}`}>{fmtDiff(diff)}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleLaneLap(lane.id)}
                    disabled={!timerRunning}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-[#EEF3F1] text-[#0B1F2A] disabled:opacity-40 font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" />
                    Llegada C{lane.laneNumber}
                  </button>
                </div>

                {lane.laps.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Últimos parciales</span>
                      <button onClick={() => handleClearLaneLaps(lane.id)} className="text-xs text-slate-400 hover:text-rose-400">
                        Limpiar
                      </button>
                    </div>
                    <ul className="flex gap-4 overflow-x-auto text-sm tabular-nums">
                      {lane.laps.slice(0, 5).map((lap, idx) => {
                        const lapDiff = targetPace ? lap - targetPace : null;
                        return (
                          <li key={idx} className="flex-shrink-0 whitespace-nowrap">
                            <span className="text-xs text-slate-400">#{lane.laps.length - idx}</span>{' '}
                            <strong className="text-white">{formatTime(lap)}</strong>
                            {lapDiff !== null && (
                              <span className={`ml-1 text-xs font-bold ${diffClass(lapDiff)}`}>{fmtDiff(lapDiff)}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};
