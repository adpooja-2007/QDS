import React from 'react';
import { Database, RefreshCw, Radio, HardDrive, Trash2, CheckCircle2, Clock } from 'lucide-react';

export const Header = ({
  stats,
  autoRefreshInterval,
  setAutoRefreshInterval,
  onManualRefresh,
  onClearDb,
  isRefreshing,
  lastUpdated,
}) => {
  const isPostgres = stats?.database?.engine_type === 'PostgreSQL';

  return (
    <header className="border-b border-[#1F293D] bg-[#0E1524]/90 backdrop-blur px-6 py-3.5 sticky top-0 z-30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Left: Branding & Status */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-[#00E599]/10 border border-[#00E599]/30 flex items-center justify-center text-[#00E599] shadow-[0_0_15px_rgba(0,229,153,0.15)]">
          <Database size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[16px] font-bold text-white tracking-tight">
              QDS Database Live Inspector
            </h1>
            <span className="db-badge db-badge-info text-[10px]">
              MODULE 6
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#94A3B8] mt-0.5">
            <span className="flex items-center gap-1.5 text-[#00E599]">
              <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse-fast"></span>
              {stats?.database?.driver_name || 'Connecting...'}
            </span>
            <span>•</span>
            <span className="text-[#64748B]">Port 3001 Sync</span>
          </div>
        </div>
      </div>

      {/* Right: Controls & Polling */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Polling Interval Selector */}
        <div className="flex items-center gap-1 bg-[#162032] border border-[#27354A] rounded-lg p-1 text-[11px] font-mono">
          <span className="px-2 text-[#94A3B8] flex items-center gap-1">
            <Radio size={12} className={autoRefreshInterval > 0 ? "text-[#00E599]" : "text-[#64748B]"} />
            Auto-Sync:
          </span>
          {[
            { label: '2s', val: 2000 },
            { label: '5s', val: 5000 },
            { label: '10s', val: 10000 },
            { label: 'Off', val: 0 },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setAutoRefreshInterval(opt.val)}
              className={`px-2 py-1 rounded transition-all ${
                autoRefreshInterval === opt.val
                  ? 'bg-[#00E599] text-[#0B0F17] font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={onManualRefresh}
          disabled={isRefreshing}
          className="db-btn db-btn-secondary text-[11px]"
          title="Sync now"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#00E599]' : ''} />
          <span>Sync Now</span>
        </button>

        {/* Clear Test Data */}
        <button
          onClick={onClearDb}
          className="db-btn db-btn-secondary text-[11px] text-[#FB7185] hover:bg-[#FB7185]/10 hover:border-[#FB7185]/30"
          title="Reset database store"
        >
          <Trash2 size={13} />
          <span>Clear DB</span>
        </button>

        {/* Timestamp */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-[#64748B] bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1E293B]">
          <Clock size={12} />
          <span>{lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--:--:--'}</span>
        </div>
      </div>
    </header>
  );
};
