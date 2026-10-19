import React, { useState } from 'react';
import { useSwim } from '../context/SwimContext';
import { X } from 'lucide-react';

interface ZoneSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZoneSettingsModal: React.FC<ZoneSettingsModalProps> = ({ isOpen, onClose }) => {
  const { zones, setZoneRange, resetZoneRanges } = useSwim();
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Cada cambio se guarda si el rango queda válido; si no, se avisa y no se guarda
  const change = (
    input: HTMLInputElement,
    saved: number,
    code: (typeof zones)[number]['code'],
    min: number,
    max: number
  ) => {
    if (!(min >= 1 && max <= 100 && min <= max)) {
      setError('Cada rango debe cumplir 1 ≤ entrada ≤ salida ≤ 100.');
      input.value = String(saved);
      return;
    }
    setError('');
    setZoneRange(code, min, max);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div>
            <h3 className="font-bold text-white text-base">Ajustar zonas</h3>
            <p className="text-[11px] text-slate-400">% de la velocidad: entrada (menor) y salida (mayor)</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && <p className="text-xs text-rose-300 mb-2">{error}</p>}

        <div className="space-y-2">
          {zones.map((z) => (
            <div key={z.code} className="flex items-center justify-between gap-2 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-white w-20">{z.name}</span>
                            <input
                key={`min-${z.code}-${z.minPct}`}
                type="number"
                inputMode="numeric"
                aria-label={`${z.name} entrada`}
                defaultValue={z.minPct}
                onBlur={(e) => change(e.target, z.minPct, z.code, Number(e.target.value), z.maxPct)}
                className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center"
              />
              <span className="text-slate-500 text-xs">→</span>
              <input
                key={`max-${z.code}-${z.maxPct}`}
                type="number"
                inputMode="numeric"
                aria-label={`${z.name} salida`}
                defaultValue={z.maxPct}
                onBlur={(e) => change(e.target, z.maxPct, z.code, z.minPct, Number(e.target.value))}
                className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center"
              />
              <span className="text-slate-500 text-xs">%</span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setError('');
              resetZoneRanges();
            }}
            className="py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-medium text-xs"
          >
            Restaurar valores
          </button>
          <button onClick={onClose} className="py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
