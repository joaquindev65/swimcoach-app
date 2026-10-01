import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (isStandalone) return;

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem('swimcoach_install_dismissed');
    if (dismissedAt) {
      const days = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (days < 3) return; // Don't show again within 3 days
    }

    // Android / Chrome PWA install event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If on iOS and not standalone, show banner after a small delay
    if (isIOS && !isStandalone) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [isStandalone, isIOS]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem('swimcoach_install_dismissed', Date.now().toString());
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Floating Bottom Install Banner */}
      <div className="fixed bottom-16 left-3 right-3 z-30 max-w-md mx-auto animate-fadeIn">
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-3 shadow-2xl shadow-cyan-500/10 flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                Instalar SwimCoach Pro
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950">App</span>
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                Usala sin conexión a internet y a pantalla completa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Instalar</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-white text-base mb-1">
              Instalar en iPhone o iPad
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Agregá la aplicación a tu pantalla de inicio en dos simples pasos:
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-3 text-left text-xs mb-4">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span className="text-slate-300">
                  Tocá el botón <strong>Compartir</strong> (<Share className="w-3.5 h-3.5 inline text-cyan-400" />) en la barra inferior de Safari.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span className="text-slate-300">
                  Deslizá y seleccioná <strong>"Agregar a inicio"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-cyan-400" />).
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
