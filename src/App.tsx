import React, { useState } from 'react';
import { SwimProvider } from './context/SwimContext';
import { Header } from './components/Header';
import { BottomNav, type NavTab } from './components/BottomNav';
import { PacesView } from './views/PacesView';
import { SwimmersView } from './views/SwimmersView';
import { WorkoutBuilderView } from './views/WorkoutBuilderView';
import { PoolsideView } from './views/PoolsideView';
import { InfoModal } from './components/InfoModal';
import { BackupModal } from './components/BackupModal';
import { PoolConverterModal } from './components/PoolConverterModal';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('paces');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenConverter={() => setIsConverterOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'paces' && <PacesView onOpenConverter={() => setIsConverterOpen(true)} />}
        {activeTab === 'workout' && <WorkoutBuilderView />}
        {activeTab === 'poolside' && <PoolsideView />}
        {activeTab === 'swimmers' && <SwimmersView />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Info and Methodology Modal */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* Backup and Data Sync Modal */}
      <BackupModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} />

      {/* Pool Course Converter Modal (25m / 50m / SCY) */}
      <PoolConverterModal isOpen={isConverterOpen} onClose={() => setIsConverterOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <SwimProvider>
      <MainApp />
    </SwimProvider>
  );
}

export default App;
