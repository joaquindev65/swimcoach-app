import React from 'react';
import { X, Heart, Zap, ShieldAlert, Award } from 'lucide-react';
import { ZONES_CONFIG } from '../utils/swimCalculations';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-base text-white">Metodología y Zonas Fisiológicas</h3>
              <p className="text-xs text-slate-400">Basado en la planilla del entrenador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs text-slate-300">
          {/* Card: Fórmulas Principales */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <h4 className="font-bold text-cyan-400 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Fórmulas Matemáticas de la Planilla
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium">Base de Entrenamiento:</span>
                <span className="font-mono text-cyan-300 font-bold">Tiempo Comp + 3%</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium">Objetivo Competencia:</span>
                <span className="font-mono text-emerald-300 font-bold">Tiempo Comp - 3%</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium">Ritmo por Zona (%vm):</span>
                <span className="font-mono text-amber-300 font-bold">T.Base × (2 - %vm)</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium">Frecuencia Máxima:</span>
                <span className="font-mono text-red-300 font-bold">220 - Edad</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Control de pulso en 5 segundos: (BPM / 12), para conteo táctil inmediato en la pared.
            </p>
          </div>

          {/* Zones Breakdown */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              Zonas de Intensidad (Sheet: INTENSIDADES)
            </h4>

            {ZONES_CONFIG.map((z) => (
              <div key={z.code} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs">{z.label}</span>
                  <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    {Math.round(z.vmPercent * 100)}% vm
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] mb-1.5 leading-snug">{z.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                  <span>⏱️ Pausa: <strong className="text-amber-400">{z.restDescription}</strong></span>
                  <span className="text-slate-500">{z.energySystem}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="bg-blue-950/30 border border-blue-500/20 rounded-2xl p-3 text-[11px] text-blue-200 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              Instala esta app en tu pantalla de inicio en Safari (iOS: Compartir → Añadir a pantalla de inicio) o Chrome (Android: Menú → Instalar aplicación) para acceder de inmediato sin conexión.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 mt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
