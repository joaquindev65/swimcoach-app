import React, { useRef, useState } from 'react';
import { useSwim } from '../context/SwimContext';
import { Download, Upload, ShieldCheck, X, AlertTriangle, FileJson, CheckCircle2 } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { swimmers, savedWorkouts, exportBackup, importBackup } = useSwim();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackup(content);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
      if (e.target) e.target.value = '';
    };

    reader.onerror = () => {
      setFeedback({ type: 'error', message: 'No se pudo leer el archivo seleccionado.' });
      if (e.target) e.target.value = '';
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Copia de Seguridad</h3>
              <p className="text-[11px] text-slate-400">Exportar e importar datos del equipo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current status stats */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 mb-4 text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
            Datos guardados en tu dispositivo
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-mono font-black text-lg">{swimmers.length}</div>
              <div className="text-[10px] text-slate-400">Nadadores con fotos y PBs</div>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-mono font-black text-lg">{savedWorkouts.length}</div>
              <div className="text-[10px] text-slate-400">Sesiones en biblioteca</div>
            </div>
          </div>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl border mb-4 text-xs flex items-start gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
            )}
            <div className="flex-1 font-medium">{feedback.message}</div>
          </div>
        )}

        <div className="space-y-3">
          {/* Card 1: Export */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5 mb-1">
              <Download className="w-4 h-4 text-cyan-400" />
              Descargar copia (Exportar)
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Descarga un archivo <code className="text-cyan-300">.json</code> con todas las fotos, marcas de todos los estilos y entrenamientos.
            </p>
            <button
              onClick={() => {
                exportBackup();
                setFeedback({ type: 'success', message: '¡Archivo descargado a tu dispositivo!' });
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              Descargar Archivo de Respaldo
            </button>
          </div>

          {/* Card 2: Import */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5 mb-1">
              <Upload className="w-4 h-4 text-emerald-400" />
              Restaurar copia (Importar)
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Carga un archivo de respaldo previo para sincronizar tus atletas en otro teléfono o computadora.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <FileJson className="w-4 h-4 text-emerald-400" />
              Seleccionar archivo .json
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white font-medium text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
