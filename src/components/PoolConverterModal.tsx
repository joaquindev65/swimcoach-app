import React, { useState, useEffect } from 'react';
import { useSwim } from '../context/SwimContext';
import type { StrokeType } from '../types/swim';
import {
  STROKES,
  STROKE_DISTANCES,
  formatTime,
} from '../utils/swimCalculations';
import {
  type PoolCourse,
  POOL_TYPES,
  calculateAllPoolTimes,
} from '../utils/poolConversion';
import { X, ArrowRightLeft, Check } from 'lucide-react';
import { SwimmerAvatar } from './SwimmerAvatar';

interface PoolConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStroke?: StrokeType;
  initialDistance?: number;
  initialTimeSeconds?: number | null;
}

export const PoolConverterModal: React.FC<PoolConverterModalProps> = ({
  isOpen,
  onClose,
  initialStroke = 'LIBRE',
  initialDistance = 100,
  initialTimeSeconds = null,
}) => {
  const { selectedSwimmer, updatePB } = useSwim();

  const [stroke, setStroke] = useState<StrokeType>(initialStroke);
  const [distance, setDistance] = useState<number>(initialDistance);
  const [fromCourse, setFromCourse] = useState<PoolCourse>('SCM');

  // Time input states
  const [mins, setMins] = useState(1);
  const [secs, setSecs] = useState(1);
  const [hundredths, setHundredths] = useState(7);
  const [appliedToast, setAppliedToast] = useState(false);

  useEffect(() => {
    if (initialTimeSeconds && initialTimeSeconds > 0) {
      const m = Math.floor(initialTimeSeconds / 60);
      const sTotal = initialTimeSeconds % 60;
      const s = Math.floor(sTotal);
      const h = Math.round((sTotal - s) * 100);
      setMins(m);
      setSecs(s);
      setHundredths(h);
    }
  }, [initialTimeSeconds, isOpen]);

  if (!isOpen) return null;

  const totalInputSeconds = mins * 60 + secs + hundredths / 100;
  const converted = calculateAllPoolTimes(totalInputSeconds, fromCourse, stroke, distance);

  const availableDistances = STROKE_DISTANCES[stroke];
  const currentDistance = availableDistances.includes(distance)
    ? distance
    : availableDistances[0];

  const handleApplyToSwimmer = () => {
    // La app almacena PBs en base 25m (SCM)
    updatePB(selectedSwimmer.id, stroke, currentDistance, converted.scm);
    setAppliedToast(true);
    setTimeout(() => {
      setAppliedToast(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Conversor de Piletas</h3>
              <p className="text-[11px] text-slate-400">25m Corta ↔ 50m Olímpica ↔ 25yd</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="space-y-3">
          {/* Estilo y Distancia */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Estilo
              </label>
              <select
                value={stroke}
                onChange={(e) => {
                  const newStroke = e.target.value as StrokeType;
                  setStroke(newStroke);
                  const dists = STROKE_DISTANCES[newStroke];
                  if (!dists.includes(distance)) {
                    setDistance(dists[0]);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
              >
                {STROKES.map((s) => (
                  <option key={s.type} value={s.type}>
                    {s.label.split('/')[0].trim()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Distancia
              </label>
              <select
                value={currentDistance}
                onChange={(e) => setDistance(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
              >
                {availableDistances.map((d) => (
                  <option key={d} value={d}>
                    {d} metros
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pileta de Origen */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Piscina de la Marca Original
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['SCM', 'LCM', 'SCY'] as PoolCourse[]).map((course) => (
                <button
                  key={course}
                  type="button"
                  onClick={() => setFromCourse(course)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                    fromCourse === course
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {course === 'SCM' && '25 Metros'}
                  {course === 'LCM' && '50 Metros'}
                  {course === 'SCY' && '25 Yardas'}
                </button>
              ))}
            </div>
          </div>

          {/* Input de Tiempo */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Tiempo a Convertir ({POOL_TYPES[fromCourse].code})
            </label>
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-2xl p-2 justify-center">
              <div className="text-center">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={mins}
                  onChange={(e) => setMins(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 text-center bg-slate-900 border border-slate-800 text-white font-mono font-bold text-base rounded-lg py-1 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[9px] text-slate-500 block mt-0.5">MIN</span>
              </div>
              <span className="text-white font-mono font-bold text-base mb-3">:</span>
              <div className="text-center">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={secs}
                  onChange={(e) => setSecs(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-12 text-center bg-slate-900 border border-slate-800 text-white font-mono font-bold text-base rounded-lg py-1 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[9px] text-slate-500 block mt-0.5">SEG</span>
              </div>
              <span className="text-white font-mono font-bold text-base mb-3">.</span>
              <div className="text-center">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={hundredths}
                  onChange={(e) => setHundredths(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                  className="w-12 text-center bg-slate-900 border border-slate-800 text-cyan-300 font-mono font-bold text-base rounded-lg py-1 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[9px] text-slate-500 block mt-0.5">CENT</span>
              </div>
            </div>
          </div>

          {/* Resultados de Conversión en 3 tarjetas */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
              Tiempos Equivalentes (Fórmula FINA)
            </span>

            {/* SCM 25m */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                fromCourse === 'SCM'
                  ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🏊</span>
                  <span className="text-xs font-bold text-white">25m Pileta Corta (SCM)</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Base oficial de la planilla de ritmos
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black font-mono text-cyan-300">
                  {formatTime(converted.scm)}
                </span>
              </div>
            </div>

            {/* LCM 50m */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                fromCourse === 'LCM'
                  ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🏟️</span>
                  <span className="text-xs font-bold text-white">50m Pileta Olímpica (LCM)</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Menor cantidad de virajes / empujes
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black font-mono text-amber-300">
                  {formatTime(converted.lcm)}
                </span>
              </div>
            </div>

            {/* SCY 25yd */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                fromCourse === 'SCY'
                  ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🇺🇸</span>
                  <span className="text-xs font-bold text-white">25 Yardas (SCY)</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Circuito universitario / USA
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black font-mono text-emerald-300">
                  {formatTime(converted.scy)}
                </span>
              </div>
            </div>
          </div>

          {/* Action button to apply to selected swimmer */}
          <div className="pt-2">
            <button
              onClick={handleApplyToSwimmer}
              disabled={appliedToast || totalInputSeconds <= 0}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              {appliedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
                  ¡Marca guardada en la ficha!
                </>
              ) : (
                <>
                  <SwimmerAvatar
                    name={selectedSwimmer.name}
                    photoUrl={selectedSwimmer.photoUrl}
                    size="xs"
                    shape="rounded-md"
                  />
                  <span>Guardar {formatTime(converted.scm)} en {selectedSwimmer.name.split(' ')[0]}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-3 pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
