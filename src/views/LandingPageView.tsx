import React from 'react';
import {
  Gauge,
  Flame,
  ClipboardList,
  Building2,
  MapPin,
  Users,
  Smartphone,
  WifiOff,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Volume2,
  ChevronRight,
  Layers,
} from 'lucide-react';


interface LandingPageViewProps {
  onEnterApp: () => void;
  onEnterSwimmerMode?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onEnterApp,
  onEnterSwimmerMode,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onEnterApp}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 font-black text-lg">
              🏊
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-base text-white tracking-tight">SwimCoach</span>
                <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-cyan-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Plataforma de Alto Rendimiento</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#caracteristicas" className="hover:text-cyan-400 transition-colors">
              Características
            </a>
            <a href="#metodologia" className="hover:text-cyan-400 transition-colors">
              Metodología Fisiológica
            </a>
            <a href="#sedes" className="hover:text-cyan-400 transition-colors">
              Clubes y Sedes
            </a>
            <a href="#pwa" className="hover:text-cyan-400 transition-colors">
              App Móvil Offline
            </a>
          </nav>

          {/* Direct Launch CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={onEnterApp}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <span>Abrir App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Software Especializado para Entrenadores y Clubes</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Planifica, Calcula Ritmos y Cronometra al{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Borde de la Pileta
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Calcula automáticamente las <strong>7 zonas fisiológicas</strong> (A1, A2, MVO2, Tolerancia al Lactato y Velocidad).
              Cronometra en vivo con <strong>bip acústico de salidas</strong>, arma series en el pizarrón y organiza nadadores por <strong>club o sede</strong>.
              100% operativo sin conexión a internet.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
              >
                <span>Ingresar a la Plataforma 🚀</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onEnterSwimmerMode && (
                <button
                  onClick={onEnterSwimmerMode}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <span>Ver Modo Nadador 🏊</span>
                </button>
              )}
            </div>

            {/* Quick Benefits Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                100% Gratuito y Offline
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                PWA Instalable en Móviles
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Multi-Club y Multi-Sede
              </span>
            </div>
          </div>

          {/* Right Column: Interactive App Preview Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 space-y-4 overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Tablero en Vivo
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  Coach Joaquín
                </span>
              </div>

              {/* Swimmer Sample Showcase */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">
                      JP
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">Joaquín (Planilla Coach)</h4>
                      <p className="text-[10px] text-slate-400">33 años • Máster / Primera</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">100m Libre</span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">1:01.07</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                    <Building2 className="w-2.5 h-2.5" />
                    Club Natación Pro
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    <MapPin className="w-2.5 h-2.5" />
                    Sede Central
                  </span>
                </div>
              </div>

              {/* Sample Zones Preview */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Zonas Fisiológicas Calculadas (100m)
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-cyan-300 text-[11px] font-bold">A1 (65%)</span>
                    <strong className="text-white">1:24.9</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-emerald-300 text-[11px] font-bold">A2 (80%)</span>
                    <strong className="text-white">1:15.5</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-amber-300 text-[11px] font-bold">MVO2 (95%)</span>
                    <strong className="text-white">1:06.0</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-red-400 text-[11px] font-bold">TL (Láctico)</span>
                    <strong className="text-white">1:04.8</strong>
                  </div>
                </div>
              </div>

              {/* Sample Poolside Stopwatch Preview */}
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 p-3 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Volume2 className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">Reloj Acústico</span>
                    <span className="text-[10px] text-amber-300">Bip de cuenta regresiva listo</span>
                  </div>
                </div>
                <button
                  onClick={onEnterApp}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  Probar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="caracteristicas" className="py-16 md:py-24 px-4 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Características Principales
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Todo lo que un Entrenador de Natación Necesita
            </h2>
            <p className="text-sm text-slate-400">
              Diseñado pensando en las necesidades reales del borde de la pileta: rapidez, precisión matemática y facilidad de uso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Feature 1 */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 shadow-md">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Gauge className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">7 Zonas Fisiológicas</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calcula tiempos de paso y pulso objetivo para A1, A2 (80% y 85%), MVO2 (90% y 95%), Tolerancia, Resistencia y Velocidad para cualquier estilo y distancia.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 shadow-md">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Cronómetro & Bip Acústico</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reloj de salidas automatizado con bips sonoros de cuenta regresiva (3-2-1) y señal de largada para no tener que mirar la pantalla constantemente.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 shadow-md">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Agrupación por Club y Sede</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organiza y agrupa tus nadadores por institución o pileta (Sede Central, Sede Olímpica, etc.). Filtra con un clic y mantén ordenados múltiples planteles.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 shadow-md">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Pizarrón de Entrenamiento</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Crea series personalizadas, calcula el volumen total en metros y comparte la sesión completa por WhatsApp directamente a tus nadadores.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all space-y-3 shadow-md">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Modo Coach & Modo Atleta</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                El entrenador tiene control total del equipo y los nadadores pueden ingresar con su propio perfil para consultar sus marcas personales y objetivos.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3 shadow-md">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <WifiOff className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">100% Offline & PWA</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tus datos quedan guardados de manera segura en tu celular. No necesitas internet ni señal en el natatorio para usar el cronómetro o los ritmos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="metodologia" className="py-16 md:py-24 px-4 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Ciencia y Fisiología Deportiva
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Basado en Metodología Real de Natación Competitiva
            </h2>
            <p className="text-sm text-slate-400">
              Algoritmos validados con la planilla oficial del entrenador para el cálculo exacto de intensidades y control de carga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 font-mono">Fórmula FCM</span>
              <h4 className="text-base font-bold text-white">220 - Edad</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calcula la Frecuencia Cardíaca Máxima de cada nadador de forma individual para dosificar el pulso exacto según la zona de trabajo.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 font-mono">Control de Pulso</span>
              <h4 className="text-base font-bold text-white">Pulsaciones en 5s (BPM / 12)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Permite al nadador tomarse el pulso inmediato en 5 segundos al terminar la serie para verificar si está dentro del rango fisiológico buscado.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 font-mono">Proyecciones</span>
              <h4 className="text-base font-bold text-white">-3% Objetivo / +3% Base</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ajusta los tiempos de competencia a la base de entrenamiento aeróbica y proyecta los objetivos de superación personal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Club and Sede Showcase */}
      <section id="sedes" className="py-16 md:py-20 px-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
            Ideal para Entrenadores con Múltiples Turnos o Sedes
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            ¿Entrenas en más de una pileta o preparas a atletas de distintos clubes? Con SwimCoach PRO puedes catalogar a cada nadador con su respectivo <strong>club</strong> y <strong>sede</strong>, plegar grupos y filtrar en un instante.
          </p>
          <div className="pt-2">
            <button
              onClick={onEnterApp}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 text-xs font-bold inline-flex items-center gap-2 transition-all"
            >
              <span>Ver Plantel Organizado por Sedes</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* PWA Mobile Installation Section */}
      <section id="pwa" className="py-16 md:py-20 px-4 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalación Directa sin Tiendas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Instálala como App Nativa en tu Celular
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              No tienes que pagar ni buscarla en Google Play ni App Store. Es una Progressive Web App (PWA) de última generación:
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-bold flex-shrink-0 text-[11px]">1</span>
                <span>Abre este enlace en Safari (iOS) o Chrome (Android).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-bold flex-shrink-0 text-[11px]">2</span>
                <span>Toca el botón <strong>Compartir / Menú</strong> de tu navegador.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-bold flex-shrink-0 text-[11px]">3</span>
                <span>Selecciona <strong>"Añadir a la pantalla de inicio"</strong>.</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-cyan-500/30">
              📱
            </div>
            <h3 className="font-black text-white text-base">Acceso Instantáneo</h3>
            <p className="text-xs text-slate-400">
              Tendrás el icono de SwimCoach en la pantalla de tu móvil y abrirá a pantalla completa sin barras de navegador.
            </p>
            <button
              onClick={onEnterApp}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Comenzar Ahora
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 md:py-20 px-4 border-t border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-8 sm:p-12 rounded-3xl border border-cyan-500/30 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
            ¿Listo para llevar los entrenamientos de tu equipo al siguiente nivel?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Únete a la nueva era del entrenamiento de natación con ritmos fisiológicos precisos y cronometraje acústico.
          </p>
          <div className="pt-2">
            <button
              onClick={onEnterApp}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm inline-flex items-center gap-2 shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all"
            >
              <span>Abrir SwimCoach PRO Gratis 🚀</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-400">
          SwimCoach PRO • Plataforma Fisiológica de Natación Competitiva
        </p>
        <p className="text-[11px]">
          Desarrollado con React 19, TypeScript, Tailwind CSS y Vite PWA • Almacenamiento Local Seguro
        </p>
      </footer>
    </div>
  );
};
