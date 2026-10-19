import React, { useState } from 'react';
import { SwimProvider, useSwim } from './context/SwimContext';
import { Header } from './components/Header';
import { BottomNav, type NavTab } from './components/BottomNav';
import { MenuDrawer } from './components/MenuDrawer';
import { UserProfileModal } from './components/UserProfileModal';
import { HomeDashboardView } from './views/HomeDashboardView';
import { PacesView } from './views/PacesView';
import { SwimmersView } from './views/SwimmersView';
import { WorkoutBuilderView } from './views/WorkoutBuilderView';
import { PoolsideView } from './views/PoolsideView';
import { LoginView } from './views/LoginView';
import { LandingPageView } from './views/LandingPageView';
import { InfoModal } from './components/InfoModal';
import { BackupModal } from './components/BackupModal';
import { PoolConverterModal } from './components/PoolConverterModal';
import { InstallAppBanner } from './components/InstallAppBanner';

const MainApp: React.FC = () => {
  const { isLoggedIn, currentUser, switchRole, storageError } = useSwim();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  // View mode: 'landing' or 'app' (default to 'app' so users arrive directly at Home)
  const [viewMode, setViewMode] = useState<'app' | 'landing'>(() => {
    if (window.location.hash === '#landing') {
      return 'landing';
    }
    return 'app';
  });

  const handleEnterApp = () => {
    localStorage.setItem('swimcoach_seen_landing_v1', 'true');
    setViewMode('app');
    if (window.location.hash === '#landing') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const handleEnterSwimmerMode = () => {
    switchRole('swimmer');
    handleEnterApp();
  };

  const handleOpenLanding = () => {
    setViewMode('landing');
  };

  // 1. Render Landing Page if active
  if (viewMode === 'landing') {
    return (
      <LandingPageView
        onEnterApp={handleEnterApp}
        onEnterSwimmerMode={handleEnterSwimmerMode}
      />
    );
  }

  // 2. If not logged in and in app mode, render Login & Welcome portal
  if (!isLoggedIn) {
    return <LoginView onOpenLanding={handleOpenLanding} />;
  }

  const isSwimmerMode = currentUser?.role === 'swimmer';

  // 3. Render Full Web App Workspace
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenConverter={() => setIsConverterOpen(true)}
      />

      {storageError && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 px-3 py-1.5 text-center text-xs text-rose-300 max-w-md mx-auto w-full">
          Almacenamiento lleno: los cambios no se guardan. Descarga una copia de seguridad.
        </div>
      )}

      {/* Swimmer Mode Warning / Switcher banner */}
      {isSwimmerMode && (
        <div className="bg-emerald-950/70 border-b border-emerald-500/30 px-3 py-1.5 text-center text-xs text-emerald-300 flex items-center justify-between max-w-md mx-auto w-full">
          <span>
            🏊 <strong>Modo Nadador</strong>: {currentUser.name}
          </span>
          <button
            onClick={() => switchRole('coach')}
            className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded-md font-bold transition-colors"
          >
            Cambiar a Coach
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'home' && (
          <HomeDashboardView
            onNavigateTab={setActiveTab}
            onOpenConverter={() => setIsConverterOpen(true)}
            onOpenBackup={() => setIsBackupOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenInfo={() => setIsInfoOpen(true)}
          />
        )}
        {activeTab === 'swimmers' && <SwimmersView />}
        {activeTab === 'paces' && <PacesView onOpenConverter={() => setIsConverterOpen(true)} />}
        {activeTab === 'workout' && <WorkoutBuilderView />}
        {activeTab === 'poolside' && <PoolsideView />}
      </main>

      {/* Install Mobile PWA Banner */}
      <InstallAppBanner />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Interactive Side Drawer Menu */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenConverter={() => setIsConverterOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenLanding={handleOpenLanding}
      />

      {/* User and Club Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Info and Methodology Modal */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* Backup and Data Sync Modal */}
      <BackupModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} />

      {/* Pool Course Converter Modal (25m / 50m / SCY) */}
      <PoolConverterModal isOpen={isConverterOpen} onClose={() => setIsConverterOpen(false)} />
    </div>
  );
};

// Evita la pantalla en blanco si datos corruptos rompen el render
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  reset = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('swimcoach_'))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm">Los datos guardados están dañados y la app no puede abrirse.</p>
        <button onClick={this.reset} className="px-4 py-2 rounded-xl bg-rose-500 text-slate-950 font-bold text-xs">
          Reiniciar datos
        </button>
      </div>
    );
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <SwimProvider>
        <MainApp />
      </SwimProvider>
    </ErrorBoundary>
  );
}

export default App;
