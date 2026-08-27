import React from 'react';
import { Layers, Activity, ShieldCheck, ShieldAlert, Cpu, Terminal, Zap, Hash } from 'lucide-react';

export const StatsCards = ({ stats }) => {
  const metrics = stats?.metrics || {};
  const totalSessions = metrics.total_sessions || 0;
  const totalQubits = metrics.total_qubits_processed || 0;
  const attacksLogged = metrics.total_attacks_logged || 0;
  const totalLogs = metrics.total_telemetry_logs || 0;
  const verdictCounts = metrics.verdict_distribution || { ACCEPT: 0, REJECT: 0, PENDING: 0 };
  const statusCounts = metrics.status_distribution || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Stored Quantum Sessions */}
      <div className="db-card p-4">
        <div className="flex items-center justify-between text-[#94A3B8] mb-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
            STORED SESSIONS
          </span>
          <Layers size={16} className="text-[#38BDF8]" />
        </div>
        <div className="text-[26px] font-bold font-mono text-white">
          {totalSessions}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#64748B] mt-2">
          <span className="text-[#38BDF8]">quantum_sessions</span>
          <span>•</span>
          <span>{statusCounts.AUDITED || 0} Audited</span>
        </div>
      </div>

      {/* 2. Total Simulated Qubits */}
      <div className="db-card p-4">
        <div className="flex items-center justify-between text-[#94A3B8] mb-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
            QUBITS IN DATABASE
          </span>
          <Cpu size={16} className="text-[#00E599]" />
        </div>
        <div className="text-[26px] font-bold font-mono text-white">
          {totalQubits.toLocaleString()}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#64748B] mt-2">
          <span className="text-[#00E599]">EPR Pairs</span>
          <span>•</span>
          <span>Statevector Sim</span>
        </div>
      </div>

      {/* 3. Verdict Distribution */}
      <div className="db-card p-4">
        <div className="flex items-center justify-between text-[#94A3B8] mb-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
            VERDICTS (ACCEPT / REJECT)
          </span>
          <ShieldCheck size={16} className="text-[#A855F7]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[26px] font-bold font-mono text-[#00E599]">
            {verdictCounts.ACCEPT || 0}
          </div>
          <span className="text-[#64748B] text-[20px] font-mono">/</span>
          <div className="text-[26px] font-bold font-mono text-[#FB7185]">
            {verdictCounts.REJECT || 0}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#64748B] mt-2">
          <span>{verdictCounts.PENDING || 0} In-Flight / Un-audited</span>
        </div>
      </div>

      {/* 4. Threat & Attacks Logged */}
      <div className="db-card p-4">
        <div className="flex items-center justify-between text-[#94A3B8] mb-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
            RED TEAM INJECTIONS
          </span>
          <ShieldAlert size={16} className={attacksLogged > 0 ? "text-[#FB7185]" : "text-[#94A3B8]"} />
        </div>
        <div className="text-[26px] font-bold font-mono text-white">
          {attacksLogged}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#64748B] mt-2">
          <span>{totalLogs} Telemetry Events</span>
        </div>
      </div>
    </div>
  );
};
