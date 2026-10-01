import React, { useState } from 'react';
import { useSwim } from '../context/SwimContext';
import type { StrokeType, ZoneCode, WorkoutCategory } from '../types/swim';
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
  BookOpen,
  BookmarkPlus,
  FolderOpen,
  X,
  Check,
  Calendar,
} from 'lucide-react';
import { SwimmerAvatar } from '../components/SwimmerAvatar';

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
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          {toastMessage}
        </div>
      )}

      {/* Header with Swimmer, Library & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SwimmerAvatar
            name={selectedSwimmer.name}
            photoUrl={selectedSwimmer.photoUrl}
            size="sm"
            shape="rounded-xl"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block truncate">
              Plan para {selectedSwimmer.name.split(' ')[0]}
            </span>
            <h2 className="text-base font-black text-white leading-tight truncate">Pizarrón</h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Library Button */}
          <button
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 font-semibold text-xs border border-slate-700 active:scale-95 transition-all"
            title="Abrir biblioteca de entrenamientos"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Biblioteca</span>
            <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-1 rounded-full">
              {savedWorkouts.length}
            </span>
          </button>

          {/* Volume Indicator */}
          <div className="bg-slate-800 border border-slate-700 px-2 py-1 rounded-xl text-right">
            <span className="text-[8px] text-slate-400 block font-medium uppercase leading-none">Vol.</span>
            <span className="text-xs font-black font-mono text-cyan-300 leading-none">{totalMeters}m</span>
          </div>

          {workouts.length > 0 && (
            <button
              onClick={handleShareWorkout}
              className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 active:scale-95 transition-all"
              title="Compartir por WhatsApp"
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
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Nueva Serie
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Subtotal: <strong className="text-cyan-400">{reps * currentDistance}m</strong>
          </span>
        </div>

        {/* Stroke Selection Tabs */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Estilo
          </label>
          <div className="grid grid-cols-5 gap-1">
            {STROKES.map((s) => (
              <button
                key={s.type}
                type="button"
                onClick={() => handleStrokeChange(s.type)}
                className={`py-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center transition-all ${
                  stroke === s.type
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <span>{s.icon}</span>
                <span className="text-[9px] mt-0.5">{s.type.slice(0, 4)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reps and Distance */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Repeticiones
            </label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setReps(Math.max(1, reps - 1))}
                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-sm"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={50}
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                className="w-full text-center bg-transparent text-white font-mono font-bold text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setReps(reps + 1)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Distancia
            </label>
            <select
              value={currentDistance}
              onChange={(e) => setDistance(parseInt(e.target.value))}
              className="w-full h-[38px] bg-slate-950 border border-slate-800 rounded-xl px-2.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {distances.map((d) => (
                <option key={d} value={d}>
                  {d} metros
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zone and Rest */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Zona de Intensidad
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value as ZoneCode)}
              className="w-full h-[38px] bg-slate-950 border border-slate-800 rounded-xl px-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
            >
              {ZONES_CONFIG.map((z) => (
                <option key={z.code} value={z.code}>
                  {z.code.replace('_', ' ')} ({z.label})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Pausa (Segundos)
            </label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setCustomRest(Math.max(5, customRest - 5))}
                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-sm"
              >
                -
              </button>
              <input
                type="number"
                step={5}
                min={5}
                max={300}
                value={customRest}
                onChange={(e) => setCustomRest(parseInt(e.target.value) || 30)}
                className="w-full text-center bg-transparent text-white font-mono font-bold text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCustomRest(customRest + 5)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Submit Add */}
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all mt-1"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Añadir Serie al Pizarrón
        </button>
      </form>

      {/* Board Workout Sets List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Series en el Pizarrón ({workouts.length})
          </h3>
          <div className="flex items-center gap-2">
            {workouts.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleOpenSaveModal}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  Guardar Sesión
                </button>
                <button
                  type="button"
                  onClick={clearWorkout}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Vaciar
                </button>
              </>
            )}
          </div>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
            <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">El pizarrón está vacío</p>
            <p className="text-xs text-slate-400 mt-1">
              Arma series arriba o cargá una sesión predefinida desde la{' '}
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="text-cyan-400 underline font-bold"
              >
                Biblioteca
              </button>
              .
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
