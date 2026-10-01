import React, { useState } from 'react';
import { useSwim } from '../context/SwimContext';
import type { StrokeType, ZoneCode } from '../types/swim';
import {
  STROKES,
  STROKE_DISTANCES,
  calculatePacesForDistance,
  formatTime,
} from '../utils/swimCalculations';
import { TimeInputModal } from '../components/TimeInputModal';
import {
  Timer,
  Target,
  TrendingUp,
  Heart,
  PlusCircle,
  Share2,
  Clock,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import { SwimmerAvatar } from '../components/SwimmerAvatar';

interface PacesViewProps {
  onOpenConverter?: () => void;
}

export const PacesView: React.FC<PacesViewProps> = ({ onOpenConverter }) => {
  const { selectedSwimmer, updatePB, addWorkoutSet } = useSwim();
  const [selectedStroke, setSelectedStroke] = useState<StrokeType>('LIBRE');
  const [selectedDistance, setSelectedDistance] = useState<number>(100);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Available distances for the current stroke
  const availableDistances = STROKE_DISTANCES[selectedStroke];

  // If distance not available in new stroke, pick first
  const currentDistance = availableDistances.includes(selectedDistance)
    ? selectedDistance
    : availableDistances[0];

  const currentPB = selectedSwimmer.pbs[selectedStroke]?.[currentDistance] || null;

  const paces = currentPB
    ? calculatePacesForDistance(
        currentPB,
        currentDistance,
        selectedStroke,
        selectedSwimmer.age
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
      text += `▫️ *${z.config.code}* (${Math.round(z.config.vmPercent * 100)}%): *${formatTime(z.paceTime)}* | FC: ${z.bpm}bpm (5s: *${z.pulse5s}*)\n`;
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
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          ¡Serie añadida al Pizarrón de Entrenamiento!
        </div>
      )}

      {/* Stroke Selector Tabs (Horizontal Scroll) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none -mx-1 px-1">
        {STROKES.map((s) => {
          const isSelected = selectedStroke === s.type;
          return (
            <button
              key={s.type}
              onClick={() => {
                setSelectedStroke(s.type);
                const distances = STROKE_DISTANCES[s.type];
                if (!distances.includes(selectedDistance)) {
                  setSelectedDistance(distances[0]);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label.split('/')[0].trim()}</span>
            </button>
          );
        })}
      </div>

      {/* Distance Selector Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {availableDistances.map((d) => {
          const isSelected = currentDistance === d;
          const hasTime = !!selectedSwimmer.pbs[selectedStroke]?.[d];
          return (
            <button
              key={d}
              onClick={() => setSelectedDistance(d)}
              className={`flex-1 min-w-[58px] py-1.5 rounded-lg text-xs font-mono font-bold transition-all relative ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {d}m
              {hasTime && (
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute top-1 right-1 ${
                    isSelected ? 'bg-slate-950' : 'bg-cyan-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Metric Card: Personal Best & Targets */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-4 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <SwimmerAvatar
              name={selectedSwimmer.name}
              photoUrl={selectedSwimmer.photoUrl}
              size="sm"
              shape="rounded-xl"
            />
            <div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                {selectedSwimmer.name} • {selectedStroke}
              </span>
              <h2 className="text-xl font-black text-white flex items-center gap-1.5">
                {currentDistance}m {selectedStroke}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenConverter && (
              <button
                onClick={onOpenConverter}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-amber-300 text-xs font-bold active:scale-95 transition-all shadow-sm"
                title="Convertir tiempos entre 25m, 50m y Yardas"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">25m/50m</span>
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/25 active:scale-95 transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              {currentPB ? 'Editar' : 'Cargar'}
            </button>
          </div>
        </div>

        {currentPB ? (
          <div>
            {/* Big PB Display */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 text-center cursor-pointer hover:border-cyan-500/40 transition-colors mb-3"
            >
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                Tiempo Competencia (Marca Personal)
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                {formatTime(currentPB)}
              </div>
              <div className="text-[10px] text-cyan-400 font-medium mt-0.5">
                Toca para modificar
              </div>
            </div>

            {/* Target and Training Base Split */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-2.5">
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px] mb-0.5">
                  <Target className="w-3 h-3" />
                  Objetivo (-3%)
                </div>
                <div className="text-lg font-black font-mono text-emerald-300">
                  {formatTime(paces?.objectiveTime)}
                </div>
                <p className="text-[9px] text-slate-400">Proyección de mejora</p>
              </div>

              <div className="bg-slate-950/60 border border-blue-500/20 rounded-xl p-2.5">
                <div className="flex items-center gap-1 text-blue-400 font-bold text-[11px] mb-0.5">
                  <TrendingUp className="w-3 h-3" />
                  Base Entreno (+3%)
                </div>
                <div className="text-lg font-black font-mono text-blue-300">
                  {formatTime(paces?.trainingBaseTime)}
                </div>
                <p className="text-[9px] text-slate-400">+{formatTime(paces?.incrementTime)} inc.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 px-4 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
            <Timer className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium mb-3">
              No hay tiempo de competencia cargado para {currentDistance}m {selectedStroke}.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95"
            >
              Cargar Marca Ahora
            </button>
          </div>
        )}
      </div>

      {/* Calculated Zones List */}
      {paces && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              Ritmos por Zona Fisiológica
            </h3>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp
            </button>
          </div>

          <div className="space-y-2">
            {paces.zones.map((z) => {
              const percent = Math.round(z.config.vmPercent * 100);
              const isSpeed = z.config.category === 'VEL';
              const isVo2 = z.config.category === 'MVO2';
              const isLactate = z.config.category === 'TL' || z.config.category === 'RL';

              const badgeColor = isSpeed
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : isLactate
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : isVo2
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300';

              return (
                <div
                  key={z.config.code}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-md border ${badgeColor}`}>
                          {z.config.code.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {percent}% vm
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {z.config.description}
                      </p>
                    </div>

                    {/* Quick Add to Workout Button */}
                    <button
                      onClick={() => handleQuickAddToWorkout(z.config.code)}
                      title="Agregar serie de esta zona al Pizarrón"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 active:scale-95 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pace Time and Pulse Counters */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 items-center text-center">
                    {/* Ritmo Tiempo */}
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
                        Ritmo Paso
                      </span>
                      <span className="text-sm font-black font-mono text-cyan-300">
                        {formatTime(z.paceTime)}
                      </span>
                    </div>

                    {/* Pulso BPM */}
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
                        Pulso (BPM)
                      </span>
                      <span className="text-sm font-bold font-mono text-red-400">
                        {z.bpm} <span className="text-[9px] text-slate-500">lpm</span>
                      </span>
                    </div>

                    {/* Pulso 5 segundos (Crucial!) */}
                    <div className="bg-red-950/30 border border-red-500/20 py-1 rounded-lg">
                      <span className="text-[9px] uppercase font-bold text-red-400 block leading-tight">
                        Pulso (5s)
                      </span>
                      <span className="text-sm font-black font-mono text-white">
                        {z.pulse5s}
                      </span>
                    </div>
                  </div>

                  {/* Rest interval note */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
                    <span>⏱️ Descanso: <strong className="text-amber-300 font-semibold">{z.config.restDescription}</strong></span>
                    <span className="text-slate-500">{z.config.energySystem}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
