import React, { useState } from 'react';
import { useSwim } from '../context/SwimContext';
import type { StrokeType, ZoneCode, WorkoutCategory } from '../types/swim';
import {
  STROKES,
  STROKE_DISTANCES,
  zoneName,
  calculatePacesForDistance,
  formatTime,
} from '../utils/swimCalculations';
import {
  Plus,
  Trash2,
  Share2,
  BookOpen,
  BookmarkPlus,
  X,
  Check,
  Calendar,
} from 'lucide-react';

const mmss = (secs: number) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

export const WorkoutBuilderView: React.FC = () => {
  const {
    selectedSwimmer,
    workouts,
    addWorkoutSet,
    removeWorkoutSet,
    clearWorkout,
    savedWorkouts,
    saveCurrentWorkout,
    loadSavedWorkout,
    deleteSavedWorkout,
    zones,
  } = useSwim();

  // Builder form state
  const [stroke, setStroke] = useState<StrokeType>('LIBRE');
  const [distance, setDistance] = useState<number>(100);
  const [reps, setReps] = useState<number>(8);
  const [zone, setZone] = useState<ZoneCode>('A2_80');
  const [customRest, setCustomRest] = useState<number>(30);

  // Modals state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save form state
  const [saveTitle, setSaveTitle] = useState('');
  const [saveCategory, setSaveCategory] = useState<WorkoutCategory>('Aeróbico A1/A2');
  const [saveDesc, setSaveDesc] = useState('');

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
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
    showToast('¡Serie añadida al pizarrón!');
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
        const p = calculatePacesForDistance(pb, w.distance, w.stroke, selectedSwimmer.age, zones);
        const zData = p.zones.find((z) => z.config.code === w.zone);
        if (zData) {
          paceStr = formatTime(zData.paceTime);
          rest = w.customRestSecs ?? zData.restSecs;
          const cycleTotal = Math.ceil((zData.paceTime + rest) / 5) * 5;
          cycle = ` (Salida c/${formatTime(cycleTotal)})`;
        }
      }

      msg += `${idx + 1}. *${w.reps} x ${w.distance}m ${w.stroke}* @ *${zoneName(w.zone)}*\n`;
      msg += `   ⏱️ Ritmo objetivo: *${paceStr}* | Pausa: *${rest}s*${cycle}\n\n`;
    });

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleOpenSaveModal = () => {
    if (workouts.length === 0) {
      alert('Agrega al menos una serie al pizarrón antes de guardarla.');
      return;
    }
    setSaveTitle(`Sesión ${new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} (${totalMeters}m)`);
    setSaveDesc('');
    setIsSaveModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;

    saveCurrentWorkout(saveTitle.trim(), saveDesc.trim(), saveCategory);
    setIsSaveModalOpen(false);
    showToast('¡Sesión guardada en la biblioteca!');
  };

  const handleLoadWorkout = (id: string, title: string) => {
    loadSavedWorkout(id);
    setIsLibraryOpen(false);
    showToast(`¡Sesión "${title}" cargada en el pizarrón!`);
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-6">
      {toastMessage && (
        <div role="status" className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#EEF3F1] text-[#0B1F2A] font-semibold text-xs px-4 py-2 rounded-full shadow-xl">
          {toastMessage}
        </div>
      )}

      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-400 truncate">Plan para {selectedSwimmer.name.split(' ')[0]}</p>
          <h2 className="font-display text-3xl font-bold text-white leading-tight">Pizarra</h2>
        </div>
        <button
          onClick={() => setIsLibraryOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:text-cyan-200 pb-1"
        >
          <BookOpen className="w-4 h-4" />
          Biblioteca ({savedWorkouts.length})
        </button>
      </header>

      {/* Pizarra: series cargadas */}
      <section aria-labelledby="sets-title" className="rounded-2xl bg-[#EEF3F1] text-[#0B1F2A] p-4 shadow-xl">
        <div className="flex items-baseline justify-between gap-2">
          <h3 id="sets-title" className="font-display text-xl font-bold">
            {workouts.length} {workouts.length === 1 ? 'serie' : 'series'}
          </h3>
          <span className="font-display text-2xl font-bold tabular-nums">{totalMeters} m</span>
        </div>

        {workouts.length === 0 ? (
          <p className="text-sm mt-2">
            La pizarra está vacía. Agrega series abajo o carga una sesión desde la{' '}
            <button onClick={() => setIsLibraryOpen(true)} className="font-semibold text-[#0E7C9B] underline">
              biblioteca
            </button>
            .
          </p>
        ) : (
          <>
            <ul className="mt-2 divide-y divide-[#0B1F2A]/15">
              {workouts.map((w) => {
                const pb = selectedSwimmer.pbs[w.stroke]?.[w.distance];
                let paceTime: number | null = null;
                let pulse5s: number | null = null;
                let cycleSecs: number | null = null;

                if (pb) {
                  const p = calculatePacesForDistance(pb, w.distance, w.stroke, selectedSwimmer.age, zones);
                  const zData = p.zones.find((z) => z.config.code === w.zone);
                  if (zData) {
                    paceTime = zData.paceTime;
                    pulse5s = zData.pulse5s;
                    const rest = w.customRestSecs ?? zData.restSecs;
                    cycleSecs = Math.ceil((zData.paceTime + rest) / 5) * 5;
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
                      <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                        {cycleSecs ? `c/${mmss(cycleSecs)}` : 'sin marca'}
                      </span>
                      <button
                        onClick={() => removeWorkoutSet(w.id)}
                        aria-label="Quitar serie"
                        className="self-center p-1 text-[#0B1F2A]/50 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-[#0B1F2A]/70 tabular-nums">
                      {paceTime ? `ritmo ${formatTime(paceTime)}` : 'carga la marca para ver el ritmo'} · pausa{' '}
                      {w.customRestSecs || 30} s{pulse5s ? ` · ${pulse5s} pulsos en 5 s` : ''}
                    </p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex items-center gap-4 text-sm font-semibold text-[#0E7C9B]">
              <button onClick={handleOpenSaveModal} className="inline-flex items-center gap-1">
                <BookmarkPlus className="w-4 h-4" />
                Guardar sesión
              </button>
              <button onClick={handleShareWorkout} className="inline-flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                WhatsApp
              </button>
              <button onClick={clearWorkout} className="ml-auto text-rose-700">
                Vaciar
              </button>
            </div>
          </>
        )}
      </section>

      {/* Agregar una serie */}
      <form onSubmit={handleAddSet} className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-slate-800 pb-1">
          <h3 className="font-display text-xl font-bold text-white">Agregar serie</h3>
          <span className="text-xs text-slate-400 tabular-nums">{reps * currentDistance} m</span>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-none border-b border-slate-800" role="group" aria-label="Estilo">
          {STROKES.map((s) => (
            <button
              key={s.type}
              type="button"
              onClick={() => handleStrokeChange(s.type)}
              aria-pressed={stroke === s.type}
              className={`pb-2 -mb-px border-b-2 text-sm font-semibold whitespace-nowrap ${
                stroke === s.type ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {s.label.split('/')[0].trim()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Repeticiones</label>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button type="button" aria-label="Menos repeticiones" onClick={() => setReps(Math.max(1, reps - 1))} className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-base">−</button>
              <input
                type="number"
                min={1}
                max={50}
                value={reps}
                aria-label="Repeticiones"
                onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                className="w-full text-center bg-transparent text-white font-display text-xl font-bold tabular-nums focus:outline-none"
              />
              <button type="button" aria-label="Más repeticiones" onClick={() => setReps(reps + 1)} className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-base">+</button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Distancia</label>
            <select
              value={currentDistance}
              onChange={(e) => setDistance(parseInt(e.target.value))}
              className="w-full h-[42px] bg-slate-900 border border-slate-800 rounded-xl px-3 text-sm font-semibold tabular-nums text-white focus:outline-none focus:border-cyan-500"
            >
              {distances.map((d) => (
                <option key={d} value={d}>{d} m</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Zona de intensidad</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value as ZoneCode)}
              className="w-full h-[42px] bg-slate-900 border border-slate-800 rounded-xl px-2 text-sm font-semibold text-white focus:outline-none focus:border-cyan-500"
            >
              {zones.map((z) => (
                <option key={z.code} value={z.code}>{z.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Pausa (segundos)</label>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button type="button" aria-label="Menos pausa" onClick={() => setCustomRest(Math.max(5, customRest - 5))} className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-base">−</button>
              <input
                type="number"
                step={5}
                min={5}
                max={300}
                value={customRest}
                aria-label="Pausa en segundos"
                onChange={(e) => setCustomRest(parseInt(e.target.value) || 30)}
                className="w-full text-center bg-transparent text-white font-display text-xl font-bold tabular-nums focus:outline-none"
              />
              <button type="button" aria-label="Más pausa" onClick={() => setCustomRest(customRest + 5)} className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-base">+</button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#EEF3F1] text-[#0B1F2A] font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Agregar a la pizarra
        </button>
      </form>

      {/* Save Workout Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-white text-base">Guardar Sesión en Biblioteca</h3>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                  Nombre de la Sesión
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lunes - Fondo A2 y MVO2"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                  Categoría / Enfoque
                </label>
                <select
                  value={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.value as WorkoutCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Aeróbico A1/A2">Aeróbico A1/A2 (Resistencia)</option>
                  <option value="MVO2">MVO2 (Potencia Aeróbica)</option>
                  <option value="Láctico / Tolerancia">Láctico / Tolerancia (TL/RL)</option>
                  <option value="Velocidad">Velocidad y Ritmo de Prueba</option>
                  <option value="Mixto">Mixto</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                  Descripción u observaciones (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Trabajar la frecuencia de brazada en los últimos 200m..."
                  value={saveDesc}
                  onChange={(e) => setSaveDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs flex justify-between">
                <span className="text-slate-400">Total Series: <strong>{workouts.length}</strong></span>
                <span className="text-cyan-400 font-bold font-mono">Volumen: {totalMeters}m</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <Check className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workout Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Biblioteca de Entrenamientos</h3>
              </div>
              <button
                onClick={() => setIsLibraryOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {savedWorkouts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No tienes sesiones guardadas todavía.
                </p>
              ) : (
                savedWorkouts.map((sw) => (
                  <div
                    key={sw.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                          {sw.category || 'Mixto'}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1">{sw.title}</h4>
                      </div>
                      <span className="text-cyan-400 font-mono font-bold text-xs">
                        {sw.totalMeters}m
                      </span>
                    </div>

                    {sw.description && (
                      <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-2">
                        "{sw.description}"
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {sw.sets.length} series
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleLoadWorkout(sw.id, sw.title)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 active:scale-95 transition-all shadow-sm"
                        >
                          Cargar al Pizarrón
                        </button>
                        {savedWorkouts.length > 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar la sesión "${sw.title}"?`)) {
                                deleteSavedWorkout(sw.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800"
                            title="Eliminar sesión"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <button
                onClick={() => setIsLibraryOpen(false)}
                className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-750"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
