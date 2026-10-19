import React, { useState } from 'react';
import { useSwim } from '../context/SwimContext';
import type { StrokeType, ZoneCode } from '../types/swim';
import {
  STROKES,
  STROKE_DISTANCES,
  calculatePacesForDistance,
  formatTime,
  zoneName,
} from '../utils/swimCalculations';
import { historyFor } from '../utils/history';
import { TimeInputModal } from '../components/TimeInputModal';
import { ZoneSettingsModal } from '../components/ZoneSettingsModal';
import { PlusCircle, Share2, Clock, ArrowRightLeft } from 'lucide-react';
import { SwimmerAvatar } from '../components/SwimmerAvatar';

interface PacesViewProps {
  onOpenConverter?: () => void;
}

export const PacesView: React.FC<PacesViewProps> = ({ onOpenConverter }) => {
  const { selectedSwimmer, updatePB, addWorkoutSet, zones } = useSwim();
  const [selectedStroke, setSelectedStroke] = useState<StrokeType>('LIBRE');
  const [selectedDistance, setSelectedDistance] = useState<number>(100);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isZonesOpen, setIsZonesOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Available distances for the current stroke
  const availableDistances = STROKE_DISTANCES[selectedStroke];

  // If distance not available in new stroke, pick first
  const currentDistance = availableDistances.includes(selectedDistance)
    ? selectedDistance
    : availableDistances[0];

  const currentPB = selectedSwimmer.pbs[selectedStroke]?.[currentDistance] || null;

  const history = historyFor(selectedSwimmer.history, selectedStroke, currentDistance);

  const paces = currentPB
    ? calculatePacesForDistance(
        currentPB,
        currentDistance,
        selectedStroke,
        selectedSwimmer.age,
        zones
      )
    : null;


  const handleShareWhatsApp = () => {
    if (!paces) return;
    let text = `🏊 *TABLA DE RITMOS - ${selectedSwimmer.name.toUpperCase()}*\n`;
    text += `Estilo: ${selectedStroke} | Distancia: ${currentDistance}m\n`;
    text += `⏱️ *Marca Personal:* ${formatTime(paces.competitionTime)}\n`;
    text += `🎯 *Objetivo (-3%):* ${formatTime(paces.objectiveTime)}\n`;
    text += `⚡ *Base Entrenamiento (+3%):* ${formatTime(paces.trainingBaseTime)}\n\n`;
    text += `*ZONAS FISIOLÓGICAS:*\n`;

    paces.zones.forEach((z) => {
      text += `▫️ *${zoneName(z.config.code)}* (${z.config.minPct}–${z.config.maxPct}%): *${formatTime(z.paceSlow)} – ${formatTime(z.paceTime)}* | FC: ${z.bpm}bpm (5s: *${z.pulse5s}*)\n`;
    });

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleQuickAddToWorkout = (zoneCode: ZoneCode) => {
    addWorkoutSet({
      swimmerId: selectedSwimmer.id,
      stroke: selectedStroke,
      distance: currentDistance,
      reps: currentDistance <= 100 ? 8 : 4,
      zone: zoneCode,
    });
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-6">
      {copiedNotification && (
        <div role="status" className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#EEF3F1] text-[#0B1F2A] font-semibold text-xs px-4 py-2 rounded-full shadow-lg">
          Serie añadida a la pizarra
        </div>
      )}

      {/* Estilo y distancia */}
      <div className="space-y-2">
        <div className="flex gap-4 overflow-x-auto scrollbar-none border-b border-slate-800" role="group" aria-label="Estilo">
          {STROKES.map((s) => {
            const isSelected = selectedStroke === s.type;
            return (
              <button
                key={s.type}
                onClick={() => {
                  setSelectedStroke(s.type);
                  const distances = STROKE_DISTANCES[s.type];
                  if (!distances.includes(selectedDistance)) setSelectedDistance(distances[0]);
                }}
                aria-pressed={isSelected}
                className={`pb-2 -mb-px border-b-2 text-sm font-semibold whitespace-nowrap ${
                  isSelected ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {s.label.split('/')[0].trim()}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none" role="group" aria-label="Distancia">
          {availableDistances.map((d) => {
            const isSelected = currentDistance === d;
            const hasTime = !!selectedSwimmer.pbs[selectedStroke]?.[d];
            return (
              <button
                key={d}
                onClick={() => setSelectedDistance(d)}
                aria-pressed={isSelected}
                className={`flex-1 min-w-[58px] py-1.5 rounded-lg text-sm font-semibold tabular-nums ${
                  isSelected ? 'bg-[#EEF3F1] text-[#0B1F2A]' : hasTime ? 'text-white bg-slate-800' : 'text-slate-500 bg-slate-900'
                }`}
              >
                {d} m
              </button>
            );
          })}
        </div>
      </div>

      {/* Marca vigente */}
      <section aria-labelledby="pb-title" className="space-y-3">
        <div className="flex items-center gap-3">
          <SwimmerAvatar name={selectedSwimmer.name} photoUrl={selectedSwimmer.photoUrl} size="md" shape="rounded-2xl" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-400 truncate">{selectedSwimmer.name}</p>
            <h2 id="pb-title" className="font-display text-2xl font-bold text-white leading-tight">
              {currentDistance} m {selectedStroke}
            </h2>
          </div>
          {onOpenConverter && (
            <button onClick={onOpenConverter} className="flex-shrink-0 text-slate-400 hover:text-amber-300 p-2" title="Convertir entre 25 m, 50 m y yardas" aria-label="Conversor de piscina">
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {currentPB ? (
          <>
            <button onClick={() => setIsModalOpen(true)} className="w-full flex items-baseline justify-between text-left active:opacity-70">
              <span className="text-xs text-slate-400">Marca personal</span>
              <span className="font-display text-5xl font-bold text-white tabular-nums">{formatTime(currentPB)}</span>
            </button>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3 tabular-nums">
              <div>
                <p className="text-xs text-slate-400">Objetivo (−3%)</p>
                <p className="font-display text-2xl font-bold text-emerald-300">{formatTime(paces?.objectiveTime)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Base de entreno (+3%)</p>
                <p className="font-display text-2xl font-bold text-white">{formatTime(paces?.trainingBaseTime)}</p>
              </div>
            </div>

            {history.length > 1 && (
              <table className="w-full text-xs tabular-nums">
                <caption className="sr-only">Historial de marcas</caption>
                <tbody className="divide-y divide-slate-800">
                  {history.map((h, i) => {
                    const diff = i < history.length - 1 ? h.time - history[i + 1].time : null;
                    return (
                      <tr key={h.date}>
                        <td className="py-1 text-slate-400">{h.date}</td>
                        <td className="py-1 text-right text-white">{formatTime(h.time)}</td>
                        <td className={`py-1 text-right w-16 ${diff === null ? 'text-slate-500' : diff <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {diff === null ? '—' : `${diff <= 0 ? '' : '+'}${diff.toFixed(2)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200">
              <Clock className="w-3.5 h-3.5" />
              Editar marca
            </button>
          </>
        ) : (
          <div>
            <p className="text-sm text-slate-400">Sin marca cargada para {currentDistance} m {selectedStroke}.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-3 w-full rounded-xl bg-[#EEF3F1] text-[#0B1F2A] font-bold text-sm py-3 active:scale-95 transition-transform">
              Cargar marca
            </button>
          </div>
        )}
      </section>

      {/* Zonas */}
      {paces && (
        <section aria-labelledby="zones-title" className="rounded-2xl bg-[#EEF3F1] text-[#0B1F2A] p-4 shadow-xl">
          <div className="flex items-baseline justify-between gap-2">
            <h3 id="zones-title" className="font-display text-xl font-bold">Ritmos por zona</h3>
            <div className="flex gap-4 text-xs font-semibold text-[#0E7C9B]">
              <button onClick={() => setIsZonesOpen(true)}>Ajustar zonas</button>
              <button onClick={handleShareWhatsApp} className="inline-flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </button>
            </div>
          </div>

          <ul className="mt-2 divide-y divide-[#0B1F2A]/15">
            {paces.zones.map((z) => (
              <li key={z.config.code} className="py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate">
                    <span className="font-display text-xl font-bold text-[#0E7C9B]">{z.config.name}</span>{' '}
                    <span className="text-xs text-[#0B1F2A]/70 tabular-nums">{z.config.minPct}–{z.config.maxPct}%</span>
                  </span>
                  <span className="whitespace-nowrap tabular-nums">
                    <span className="text-sm text-[#0B1F2A]/70">{formatTime(z.paceSlow)} → </span>
                    <span className="font-display text-2xl font-bold">{formatTime(z.paceTime)}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-[#0B1F2A]/70 tabular-nums min-w-0 truncate">
                    {z.bpm} lpm · <strong>{z.pulse5s}</strong> en 5 s · descanso {z.config.restDescription}
                  </p>
                  <button
                    onClick={() => handleQuickAddToWorkout(z.config.code)}
                    title="Agregar serie de esta zona a la pizarra"
                    aria-label={`Agregar serie ${z.config.name} a la pizarra`}
                    className="flex-shrink-0 p-1 text-[#0E7C9B] active:scale-90"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[#0B1F2A]/60 pt-1">Entrada → salida de cada intensidad.</p>
        </section>
      )}

      <ZoneSettingsModal isOpen={isZonesOpen} onClose={() => setIsZonesOpen(false)} />

      {/* Time Input Modal */}
      <TimeInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stroke={selectedStroke}
        distance={currentDistance}
        currentTimeSecs={currentPB}
        onSave={(secs) => updatePB(selectedSwimmer.id, selectedStroke, currentDistance, secs)}
      />
    </div>
  );
};
