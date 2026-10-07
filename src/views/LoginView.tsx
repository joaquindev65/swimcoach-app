import React, { useState } from 'react';
import { useSwim, DEFAULT_COACH_PROFILE } from '../context/SwimContext';
import {
  Users,
  ArrowRight,
  Flame,
  Gauge,
  ChevronRight,
} from 'lucide-react';

import type { UserRole } from '../types/swim';

interface LoginViewProps {
  onOpenLanding?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onOpenLanding }) => {
  const { login, swimmers } = useSwim();


  const [mode, setMode] = useState<'quick' | 'custom'>('quick');
  const [customName, setCustomName] = useState('');
  const [customClub, setCustomClub] = useState('Club Natación');
  const [customSede, setCustomSede] = useState('Sede Central');
  const [customRole, setCustomRole] = useState<UserRole>('coach');

  const [selectedSwimmerId, setSelectedSwimmerId] = useState<string>(
    swimmers[0]?.id || 'swimmer-1'
  );

  const handleQuickCoach = () => {
    login(DEFAULT_COACH_PROFILE);
  };

  const handleQuickSwimmer = () => {
    const sw = swimmers.find((s) => s.id === selectedSwimmerId) || swimmers[0];
    if (!sw) return;

    login({
      id: `user-${sw.id}`,
      name: sw.name,
      role: 'swimmer',
      clubName: sw.club || 'Club Natación Competitiva',
      sede: sw.sede || 'Sede Central',
      title: 'Nadador Federado',
      avatarUrl: sw.photoUrl,
      swimmerId: sw.id,
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    login({
      name: customName.trim(),
      clubName: customClub.trim() || 'Club Natación',
      sede: customSede.trim() || 'Sede Central',
      role: customRole,
      title: customRole === 'coach' ? 'Entrenador' : 'Nadador',
    });
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      {/* Brand Hero */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/25 mb-3 text-3xl">
          🏊
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          SwimCoach <span className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">PRO</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Plataforma de Ritmos Fisiológicos, Series y Cronómetro de Natación
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-5">
        {/* Tab switch between Quick Access & Custom */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'quick'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Acceso Rápido
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'custom'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👤 Personalizar
          </button>
        </div>

        {mode === 'quick' ? (
          <div className="space-y-3.5">
            {/* Coach Quick Button */}
            <button
              onClick={handleQuickCoach}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-slate-850 to-slate-800 hover:from-slate-800 hover:to-slate-750 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all group active:scale-[0.98] shadow-lg shadow-cyan-950/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-lg group-hover:scale-105 transition-transform">
                    👨‍🏫
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Ingresar como Coach Joaquín
                      </span>
                      <span className="bg-cyan-500/20 text-cyan-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                        Coach
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Acceso completo: {swimmers.length} nadadores, ritmos, cronómetro y pizarrón
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </button>

            {/* Swimmer Quick Section */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏊</span>
                  <span className="text-xs font-bold text-slate-200">
                    O ingresar en Modo Nadador:
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Atleta</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSwimmerId}
                  onChange={(e) => setSelectedSwimmerId(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
                >
                  {swimmers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.sede ? `(${s.sede})` : s.club ? `(${s.club})` : `(${s.age}a)`}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleQuickSwimmer}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all"
                >
                  <span>Entrar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Custom User Form */
          <form onSubmit={handleCustomSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tu Nombre o Alias *
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ej: Entrenador Marcelo / Nadadora Sofía"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Club o Equipo
                </label>
                <input
                  type="text"
                  value={customClub}
                  onChange={(e) => setCustomClub(e.target.value)}
                  placeholder="Ej: Club Natación"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sede / Pileta
                </label>
                <input
                  type="text"
                  value={customSede}
                  onChange={(e) => setCustomSede(e.target.value)}
                  placeholder="Ej: Sede Central"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>


            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rol Principal
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomRole('coach')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    customRole === 'coach'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                >
                  👨‍🏫 Entrenador
                </button>
                <button
                  type="button"
                  onClick={() => setCustomRole('swimmer')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    customRole === 'swimmer'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                >
                  🏊 Nadador
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all"
            >
              <span>Ingresar a la Plataforma</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Feature Highlights Grid */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-800/30 rounded-xl border border-slate-800">
            <Gauge className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 font-medium block">7 Zonas</span>
          </div>
          <div className="p-2 bg-slate-800/30 rounded-xl border border-slate-800">
            <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 font-medium block">Reloj Acústico</span>
          </div>
          <div className="p-2 bg-slate-800/30 rounded-xl border border-slate-800">
            <Users className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 font-medium block">Multi-Andarivel</span>
          </div>
        </div>
      </div>

      {/* Landing page link */}
      {onOpenLanding && (
        <div className="text-center mt-3">
          <button
            type="button"
            onClick={onOpenLanding}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 py-1 px-3 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
          >
            <span>🌐 Ver Página de Presentación (Landing Page)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Footer Info */}
      <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
        SwimCoach PRO • Almacenamiento Seguro Local • 100% Offline
      </p>
    </div>
  );
};

