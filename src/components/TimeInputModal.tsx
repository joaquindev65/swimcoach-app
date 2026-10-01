import React, { useState, useEffect } from 'react';
import type { StrokeType } from '../types/swim';
import { formatTime, STROKES } from '../utils/swimCalculations';
import { X, Check, Trash2, Clock } from 'lucide-react';

interface TimeInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  stroke: StrokeType;
  distance: number;
  currentTimeSecs: number | null | undefined;
  onSave: (seconds: number | null) => void;
}

export const TimeInputModal: React.FC<TimeInputModalProps> = ({
  isOpen,
  onClose,
  stroke,
  distance,
  currentTimeSecs,
  onSave,
}) => {
  const [mins, setMins] = useState<number>(0);
  const [secs, setSecs] = useState<number>(0);
  const [hundredths, setHundredths] = useState<number>(0);

  useEffect(() => {
    if (currentTimeSecs && currentTimeSecs > 0) {
      const m = Math.floor(currentTimeSecs / 60);
      const sTotal = currentTimeSecs % 60;
      const s = Math.floor(sTotal);
      const h = Math.round((sTotal - s) * 100);
      setMins(m);
      setSecs(s);
      setHundredths(h);
    } else {
      setMins(0);
      setSecs(30);
      setHundredths(0);
    }
  }, [currentTimeSecs, isOpen]);

  if (!isOpen) return null;

  const currentTotal = mins * 60 + secs + hundredths / 100;
  const strokeObj = STROKES.find((s) => s.type === stroke);

  const handleSave = () => {
    if (currentTotal <= 0) {
      onSave(null);
    } else {
      onSave(currentTotal);
    }
    onClose();
  };

  const handleClear = () => {
    onSave(null);
    onClose();
  };

  const adjustSecs = (delta: number) => {
    const next = Math.max(0, currentTotal + delta);
    const m = Math.floor(next / 60);
    const sTotal = next % 60;
    const s = Math.floor(sTotal);
    const h = Math.round((sTotal - s) * 100);
    setMins(m);
    setSecs(s);
    setHundredths(h);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{strokeObj?.icon}</span>
            <div>
              <h3 className="font-bold text-base text-white">
                {distance}m {strokeObj?.label}
              </h3>
              <p className="text-xs text-slate-400">Marca Personal (PB / Competencia)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live formatted display */}
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 text-center mb-5 shadow-inner">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest block mb-1">
            Tiempo de Competencia
          </span>
          <div className="text-4xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-1">
            <Clock className="w-6 h-6 text-cyan-400/80" />
            {formatTime(currentTotal)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            ({currentTotal.toFixed(2)} segundos totales)
          </p>
        </div>

        {/* Quick Fine-Tuning Chips */}
        <div className="flex items-center justify-center gap-1.5 mb-5 flex-wrap">
          <button
            onClick={() => adjustSecs(-1)}
            className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg active:scale-95"
          >
            -1.0s
          </button>
          <button
            onClick={() => adjustSecs(-0.1)}
            className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg active:scale-95"
          >
            -0.10s
          </button>
          <button
            onClick={() => adjustSecs(+0.1)}
            className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg active:scale-95"
          >
            +0.10s
          </button>
          <button
            onClick={() => adjustSecs(+1)}
            className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg active:scale-95"
          >
            +1.0s
          </button>
        </div>

        {/* Three Dial Wheels / Selectors */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Minutos */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
            <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Minutos</label>
            <input
              type="number"
              min={0}
              max={59}
              value={mins}
              onChange={(e) => setMins(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xl font-bold font-mono text-center text-white py-1.5 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Segundos */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
            <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Segundos</label>
            <input
              type="number"
              min={0}
              max={59}
              value={secs}
              onChange={(e) => setSecs(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xl font-bold font-mono text-center text-white py-1.5 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Centésimas */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
            <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Centésimas</label>
            <input
              type="number"
              min={0}
              max={99}
              value={hundredths}
              onChange={(e) => setHundredths(Math.min(99, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xl font-bold font-mono text-center text-white py-1.5 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {currentTimeSecs && (
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl border border-red-500/30 text-red-400 bg-red-950/20 hover:bg-red-950/40 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 active:scale-98 transition-all"
          >
            <Check className="w-4 h-4" />
            Guardar Marca
          </button>
        </div>
      </div>
    </div>
  );
};
