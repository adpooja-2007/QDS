import React from 'react';
import { LayoutDashboard, GitFork, ShieldCheck, Activity } from 'lucide-react';

export type NavigationTab = 'overview' | 'protocol' | 'security' | 'telemetry';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'protocol', label: 'Protocol', icon: <GitFork className="w-4 h-4" /> },
    { id: 'security', label: 'Security Verification', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'telemetry', label: 'Telemetry & Timeline', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <nav className="border-b border-brand-border bg-surface px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto flex gap-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-3 text-xs font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-brand-indigo text-brand-indigo'
                  : 'border-transparent text-brand-muted hover:text-brand-dark hover:border-slate-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
