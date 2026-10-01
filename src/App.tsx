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

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('paces');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'paces' && <PacesView />}
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
