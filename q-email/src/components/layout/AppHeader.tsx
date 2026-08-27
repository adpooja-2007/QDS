import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { QuantumSession, MockScenarioType } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface AppHeaderProps {
  session: QuantumSession | null;
  lastUpdated?: string;
  activeScenario?: MockScenarioType;
  onScenarioChange?: (scenario: MockScenarioType) => void;
  onOpenCreateSession?: () => void;
  isMockMode?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  session,
  lastUpdated = '21:14:12',
  activeScenario = 'CLEAN',
  onScenarioChange,
  onOpenCreateSession,
  isMockMode = true
}) => {
  return (
    <header className="bg-surface border-b border-brand-border sticky top-0 z-30 shadow-subtle">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-brand-dark">
                Quantum Security Console
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                SIH 2026 · PS 26141
              </span>
            </div>
            <p className="text-xs text-brand-muted font-normal mt-0.5">
              Quantum-Inspired Cyber Threat Detection for Digital Signature Security · <span className="text-brand-slate font-medium">Egreen Quanta</span>
            </p>
          </div>
        </div>

        {/* Center/Right Session Metadata */}
        <div className="flex flex-wrap items-center gap-3.5 text-xs">
          {/* Mock Scenario Switcher */}
          {isMockMode && onScenarioChange && (
            <div className="flex items-center gap-2 bg-brand-background-secondary px-2.5 py-1.5 rounded-lg border border-brand-border">
              <Sparkles className="w-3.5 h-3.5 text-brand-indigo" />
              <label htmlFor="scenario-select" className="text-[11px] font-medium text-brand-muted uppercase tracking-wider">
                Scenario:
              </label>
              <select
                id="scenario-select"
                value={activeScenario}
                onChange={(e) => onScenarioChange(e.target.value as MockScenarioType)}
                className="bg-surface text-brand-dark font-mono-tech text-xs border border-brand-border rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-indigo cursor-pointer"
              >
                <option value="CLEAN">CLEAN (0% Error · Accept)</option>
                <option value="NORMAL_NOISE">NORMAL NOISE (2.1% · Accept)</option>
                <option value="MITM">MITM (24% QBER · Reject)</option>
                <option value="FORGERY">FORGERY (31% QBER · Reject)</option>
                <option value="REPLAY">REPLAY (Stale Nonce · Reject)</option>
                <option value="PNS">PNS (Decoy Anomaly · Flag)</option>
              </select>
            </div>
          )}

          {/* New Session Button */}
          {onOpenCreateSession && (
            <button
              onClick={onOpenCreateSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors shadow-xs cursor-pointer"
              title="Create new quantum session in Demonstration dashboard"
            >
              <span>+ New Session</span>
            </button>
          )}

          {/* Session ID */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-medium text-brand-muted tracking-wider">Session</span>
            <span className="font-mono-tech font-semibold text-brand-dark text-xs">
              {session?.session_id || 'QSEC-2026-000001'}
            </span>
          </div>

          {/* State */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-medium text-brand-muted tracking-wider">State</span>
            <div>
              <StatusBadge status={session?.status || 'AUDITED'} size="sm" />
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex flex-col border-l border-brand-border pl-3 hidden sm:flex">
            <span className="text-[10px] uppercase font-medium text-brand-muted tracking-wider">Last Updated</span>
            <span className="font-mono-tech text-brand-slate text-xs">{lastUpdated}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
