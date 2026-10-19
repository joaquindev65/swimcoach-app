import React from 'react';
import { Home, Gauge, Users, ClipboardList, Flame } from 'lucide-react';

export type NavTab = 'home' | 'swimmers' | 'paces' | 'workout' | 'poolside';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: 'Inicio',
      icon: Home,
    },
    {
      id: 'swimmers' as NavTab,
      label: 'Nadadores',
      icon: Users,
    },
    {
      id: 'paces' as NavTab,
      label: 'Ritmos',
      icon: Gauge,
    },
    {
      id: 'workout' as NavTab,
      label: 'Pizarra',
      icon: ClipboardList,
    },
    {
      id: 'poolside' as NavTab,
      label: 'En pileta',
      icon: Flame,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 safe-bottom shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-cyan-500/15' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
