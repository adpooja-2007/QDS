import React, { useState, useEffect } from 'react';
import { SentinelPage } from './Sidebar';
import { QuantumSession } from '../../types/sentinel';
import { ShieldCheck, ShieldAlert, Clock, Radio, ChevronDown } from 'lucide-react';

interface HeaderProps {
  activePage: SentinelPage;
  sessions: QuantumSession[];
  activeSession: QuantumSession;
  onSelectSession: (id: string) => void;
  apiLatencyMs: number;
}

const PAGE_META: Record<SentinelPage, { title: string; subtitle: string }> = {
  'home': {
    title: 'HOME PORTAL',
    subtitle: 'Choose between Quantum Protocol Demonstration and SOC Monitoring',
  },
  'dashboard': {
    title: 'SOC OVERVIEW',
    subtitle: 'Real-time quantum security monitoring and threat analysis',
  },
  'demonstration': {
    title: 'QUANTUM DEMO (ALICE ↔ BOB)',
    subtitle: 'Interactive photon flow, Pauli frame alignment, and Bell verification',
  },
  'monitoring': {
    title: 'SOC MONITOR & ANALYTICS',
    subtitle: 'Real-time telemetry stream, system analytics, and boundary tracking',
  },

  'quantum-signature': {
    title: 'QUANTUM SIGNATURE',
    subtitle: 'Create and verify a quantum-backed digital signature',
  },
  'threat-detection': {
    title: 'THREAT DETECTION',
    subtitle: 'Quantum channel integrity and statistical security analysis',
  },
  'investigations': {
    title: 'INVESTIGATIONS',
    subtitle: 'Security incidents, evidence and detection history',
  },
  'quantum-network': {
    title: 'QUANTUM NETWORK',
    subtitle: 'Quantum node topology and communication status',
  },
  'sessions': {
    title: 'SESSION EXPLORER',
    subtitle: 'Search and inspect QDS protocol sessions',
  },
};


export const Header: React.FC<HeaderProps> = ({
  activePage,
  sessions,
  activeSession,
  onSelectSession,
  apiLatencyMs,
}) => {
  const [time, setTime] = useState<string>('');
  const meta = PAGE_META[activePage];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istTime = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setTime(`${istTime} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);


  const isAccept = activeSession.verdict.verdict === 'ACCEPT';

  return (
    <header className="h-[60px] bg-white border-b border-[#E4E7EC] px-6 flex items-center justify-between sticky top-0 z-10 select-none shadow-[0_1px_2px_rgba(16,24,40,0.02)]">
      {/* Left: Page Title & Subtitle */}
      <div>
        <h1 className="text-[15px] font-bold text-[#182033] tracking-tight leading-none">
          {meta.title}
        </h1>
        <p className="text-[11px] text-[#667085] mt-1 font-normal">
          {meta.subtitle}
        </p>
      </div>

      {/* Right: Controls & Status Indicators */}
      <div className="flex items-center gap-3">
        {/* Session Selector */}
        <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#D0D5DD] rounded-md px-2.5 py-1 text-[12px]">
          <span className="text-[10px] font-mono font-semibold text-[#667085] uppercase">
            Session:
          </span>
          <select
            value={activeSession.session_id}
            onChange={(e) => onSelectSession(e.target.value)}
            className="bg-transparent text-[#182033] font-mono text-[11px] font-medium focus:outline-none cursor-pointer pr-1"
          >
            {sessions.map((s) => (
              <option key={s.session_id} value={s.session_id}>
                {s.session_id} ({s.verdict.verdict})
              </option>
            ))}
          </select>
        </div>

        {/* Verdict Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border ${
            isAccept
              ? 'bg-[#EEF3FF] text-[#4169D8] border-[#D0DCFC]'
              : 'bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]'
          }`}
        >
          {isAccept ? (
            <ShieldCheck size={13} strokeWidth={2.2} />
          ) : (
            <ShieldAlert size={13} strokeWidth={2.2} />
          )}
          <span>{activeSession.verdict.verdict}</span>
        </div>

        {/* Real-time Clock */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F2F4F7] text-[#475467] font-mono text-[11px] border border-[#EAECF0]">
          <Clock size={12} className="text-[#667085]" />
          <span>{time}</span>
        </div>

        {/* Latency Indicator */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono text-[#667085]">
          <Radio size={11} className="text-[#4169D8]" />
          <span>{apiLatencyMs}ms</span>
        </div>
      </div>
    </header>
  );
};
