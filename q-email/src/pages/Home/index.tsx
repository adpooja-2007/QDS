import React, { useState, useRef, useEffect } from 'react';
import { QuantumSession, SystemPerformance, SecurityIncident, TelemetryLog } from '../../types/sentinel';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';

interface HomePageProps {
  onNavigate: (route: string) => void;
  activeSession?: QuantumSession;
  sessions?: QuantumSession[];
  incidents?: SecurityIncident[];
  telemetryLogs?: TelemetryLog[];
  performance?: SystemPerformance;
}

interface QuantumConceptInfo {
  title: string;
  category: string;
  formula?: string;
  description: string;
  route?: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  activeSession,
  sessions = [],
  incidents = [],
  telemetryLogs = [],
  performance,
}) => {
  // Modal / Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [activeConceptModal, setActiveConceptModal] = useState<QuantumConceptInfo | null>(null);
  const [copiedSessionToast, setCopiedSessionToast] = useState(false);
  const [copiedKeyToast, setCopiedKeyToast] = useState(false);
  const [clearedIds, setClearedIds] = useState<string[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userProfileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns and modals on outside click or Escape key press
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userProfileRef.current && !userProfileRef.current.contains(event.target as Node)) {
        setShowUserProfile(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowUserProfile(false);
        setShowApiModal(false);
        setActiveConceptModal(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Aggregate rejected / attack alerts (excluding cleared ones)
  const rejectedSessions = sessions.filter(
    (s) => (s.verdict?.verdict === 'REJECT' || s.verdict?.threat_detected || (s.attacks && s.attacks.length > 0)) && !clearedIds.includes(s.session_id)
  );

  const activeIncidents = incidents.filter(inc => !clearedIds.includes(inc.id));
  const totalAlertsCount = rejectedSessions.length + activeIncidents.length;

  const handleClearAll = () => {
    const allIds = [...sessions.map(s => s.session_id), ...incidents.map(i => i.id)];
    setClearedIds(allIds);
  };

  const handleCopySessionId = () => {
    const sid = activeSession?.session_id || 'QDS-99482A';
    navigator.clipboard.writeText(sid);
    setCopiedSessionToast(true);
    setTimeout(() => setCopiedSessionToast(false), 2000);
  };

  const handleCopyPublicKey = () => {
    navigator.clipboard.writeText('0x8F92A1BC40E7D294B105F838E7902BA49C12879F3A4B29E8473D1A908E');
    setCopiedKeyToast(true);
    setTimeout(() => setCopiedKeyToast(false), 2000);
  };

  // Quantum Concept definitions for pill clicks
  const conceptDetails: Record<string, QuantumConceptInfo> = {
    'EPR PAIRS': {
      title: 'Einstein-Podolsky-Rosen (EPR) Entangled Pairs',
      category: 'Quantum Optical Source',
      formula: '|Φ⁺⟩ = (|00⟩ + |11⟩) / √2',
      description: 'Maximally entangled Bell pairs generated at the Arbitrator optical source (λ=1550nm). Distributed over dark-fiber links to Alice and Bob to establish non-local correlations for unforgeable digital signatures.',
      route: 'demonstration'
    },
    'ALICE JOINT BSM': {
      title: 'Alice Joint Bell State Measurement (BSM)',
      category: 'Signature State Encoding',
      formula: 'BSM(|ψ_doc⟩ ⊗ |ψ_EPR⟩) → (b₁, b₂) ∈ {00, 01, 10, 11}',
      description: 'Alice performs a joint projective measurement on her message qubit and her half of the entangled pair, generating 2 classical feed-forward bits to be transmitted over public channels.',
      route: 'demonstration'
    },
    'BOB PAULI ROTATIONS': {
      title: 'Bob Pauli Unitary Frame Rotations',
      category: 'State Reconstruction & Verification',
      formula: 'σ = σ_I (00) | σ_X (01) | σ_Z (10) | σ_XZ (11)',
      description: 'Bob receives the 2 classical bits from Alice and applies the corresponding local Pauli rotation to his half of the entangled pair, restoring the authentic document state.',
      route: 'demonstration'
    },
    'CHSH BELL TEST': {
      title: 'Clauser-Horne-Shimony-Holt (CHSH) Inequality',
      category: 'Entanglement Forensics',
      formula: 'S = E(a,b) - E(a,b\') + E(a\',b) + E(a\',b\') ≥ 2.0',
      description: 'Tests quantum non-locality. S ≥ 2.0 confirms quantum entanglement (up to Tsirelson bound 2√2 ≈ 2.828). S < 2.0 proves state collapse from eavesdropping (MitM/PNS).',
      route: 'demonstration'
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#FBF8FA] text-[#1B1B1D] font-sans antialiased overflow-y-auto select-none relative">
      {/* ─── 1. TOP BRAND NAVIGATION BAR ─── */}
      <nav className="relative bg-[#FFFFFF] border-b border-[#E2E8F0] h-14 w-full flex items-center justify-between px-6 shrink-0 z-40">
        {/* Left: Brand Logo & Title (Ctrl+Click opens in new tab) */}
        <div 
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) window.open('/home', '_blank');
            else onNavigate('home');
          }}
          className="flex items-center gap-2.5 cursor-pointer z-10 hover:opacity-80 transition-opacity"
          title="QDS Sentinel Home (Ctrl+Click to open in new tab)"
        >
          <svg className="w-5 h-5 text-[#091426]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <circle cx="12" cy="11" r="3"/>
          </svg>
          <span className="font-bold text-[#091426] tracking-tight text-[16px] font-sans">
            QDS SENTINEL
          </span>
        </div>

        {/* Center: Hub Navigation Tab */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) window.open('/home', '_blank');
              else onNavigate('home');
            }}
            className="h-full flex items-center border-b-2 border-[#0058BE] text-[#0058BE] px-6 font-medium text-[15px] pointer-events-auto cursor-pointer"
            title="Hub Overview (Ctrl+Click to open in new tab)"
          >
            Hub
          </div>
        </div>

        {/* Right: Notifications & Profile Avatar */}
        <div className="flex items-center gap-3 z-10 relative">
          {/* Notifications Bell Container */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowUserProfile(false); }}
              className="w-8 h-8 flex items-center justify-center text-[#45474C] hover:text-[#091426] transition-colors relative cursor-pointer rounded hover:bg-[#F6F3F5]"
              title="Threat Notifications & Attack Alerts"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {totalAlertsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 bg-[#BA1A1A] text-[#FFFFFF] rounded-full text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-white shadow-sm pointer-events-none">
                  {totalAlertsCount}
                </span>
              )}
            </button>

            {/* ─── THREAT NOTIFICATION DROPDOWN MENU ─── */}
            {showNotifications && (
              <div className="absolute right-0 top-10 w-96 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in font-sans">
                {/* Dropdown Header */}
                <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#091426]">
                      SECURITY ALERTS & ATTACKS
                    </span>
                    {totalAlertsCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-[#BA1A1A] text-white text-[9px] font-mono font-bold rounded">
                        {totalAlertsCount} ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {totalAlertsCount > 0 && (
                      <button 
                        onClick={handleClearAll}
                        className="text-[#0058BE] hover:underline font-mono text-[10.5px] uppercase font-bold cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-[#75777D] hover:text-[#1B1B1D] text-[12px] font-bold cursor-pointer pl-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Alerts List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0] bg-white">
                  {totalAlertsCount === 0 ? (
                    <div className="p-6 text-center text-[#75777D] text-[12px] font-mono flex flex-col items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-[#F6F3F5] border border-[#E2E8F0] text-[#065F46] flex items-center justify-center font-bold">✓</span>
                      <span>No active security threats detected. All quantum sessions nominal.</span>
                    </div>
                  ) : (
                    <>
                      {rejectedSessions.map((s) => (
                        <div 
                          key={s.session_id} 
                          onClick={() => { setShowNotifications(false); onNavigate('monitoring'); }}
                          className="p-3.5 hover:bg-[#F6F3F5] transition-colors cursor-pointer flex items-start gap-3 group border-b border-[#E2E8F0] last:border-b-0"
                        >
                          <div className="w-6 h-6 rounded bg-[#F6F3F5] border border-[#E2E8F0] text-[#BA1A1A] flex items-center justify-center shrink-0 mt-0.5 font-mono text-[11px] font-bold">
                            !
                          </div>
                          <div className="flex-1 min-w-0 font-mono text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#BA1A1A] truncate">{s.session_id}</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F6F3F5] border border-[#E2E8F0] text-[#BA1A1A] uppercase">
                                {s.verdict?.verdict || 'REJECT'}
                              </span>
                            </div>
                            <p className="text-[#1B1B1D] text-[11px] mt-1 line-clamp-2">
                              {s.verdict?.reason || 'Attack detected: QBER breached Hoeffding threshold (> 5.5%).'}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#75777D]">
                              <span>QBER: <strong className="text-[#BA1A1A]">{((s.metrics?.qber || 0.142) * 100).toFixed(1)}%</strong></span>
                              <span>CHSH: <strong>{s.metrics?.chsh_score?.toFixed(2) || '1.88'}</strong></span>
                              <span className="text-[#0058BE] group-hover:underline ml-auto font-medium">Investigate →</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {incidents.map((inc) => (
                        <div 
                          key={inc.id} 
                          onClick={() => { setShowNotifications(false); onNavigate('monitoring'); }}
                          className="p-3.5 hover:bg-[#F6F3F5] transition-colors cursor-pointer flex items-start gap-3 group border-b border-[#E2E8F0] last:border-b-0"
                        >
                          <div className="w-6 h-6 rounded bg-[#F6F3F5] border border-[#E2E8F0] text-[#BA1A1A] flex items-center justify-center shrink-0 mt-0.5 font-mono text-[11px] font-bold">
                            ⚡
                          </div>
                          <div className="flex-1 min-w-0 font-mono text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#091426]">{inc.event}</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F6F3F5] border border-[#E2E8F0] text-[#BA1A1A] uppercase">
                                {inc.severity}
                              </span>
                            </div>
                            <p className="text-[#75777D] text-[10.5px] mt-1">{inc.summary}</p>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-[#75777D]">
                              <span>Origin: {inc.session_id}</span>
                              <span className="text-[#0058BE] group-hover:underline font-medium">Forensics →</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Dropdown Footer CTA */}
                <div className="p-2.5 bg-[#F6F3F5] border-t border-[#E2E8F0] text-center">
                  <button 
                    onClick={() => { setShowNotifications(false); onNavigate('monitoring'); }}
                    className="w-full py-1.5 bg-[#091426] hover:bg-[#1E293B] text-white rounded-[2px] font-mono text-[10.5px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                  >
                    VIEW ALL THREATS IN MONITORING CENTER
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── Profile Avatar & User Details Dropdown ─── */}
          <div className="relative" ref={userProfileRef}>
            <div 
              onClick={() => { setShowUserProfile(!showUserProfile); setShowNotifications(false); }}
              className="w-7 h-7 rounded-full bg-[#F6F3F5] border border-[#E2E8F0] flex items-center justify-center overflow-hidden cursor-pointer ml-1 hover:ring-1 hover:ring-[#0058BE] transition-all"
              title="Click to view User Profile & Security Credentials"
            >
              <img 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWUKUkX4iAVRyPxnlWNMdHiJG4-IjNkujLi3tD4aL7gH0UcHME5ys0-EMolJR6YZYiXVDeQBAS41uPLQYb_nryde5Uhd5ET9dYyvIQUi39SXjuGakqaOPhMryiTsokjYT50hOpYmT54YzFWAgNneJrtFqGuLprSxKMQ-lEiQPhySi3wkPic8Ahgn_YDjWPbxWzAPIT9_W6p5D0Zi-UpRfrIfnlqu84OpWL5AG5ZAeEe9BdnSnRrS-h"
              />
            </div>

            {/* User Details Dropdown Modal */}
            {showUserProfile && (
              <div className="absolute right-0 top-10 w-84 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in font-sans">
                {/* Header */}
                <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#E2E8F0] text-[#091426] flex items-center justify-center font-mono font-bold text-[12px]">
                      VS
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px] text-[#091426]">Dr. Vikramaditya S.</h3>
                      <p className="font-mono text-[10px] text-[#75777D]">Lead Cryptographer &amp; SOC Lead</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowUserProfile(false)}
                    className="text-[#75777D] hover:text-[#1B1B1D] text-[12px] font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-3 font-mono text-[11px] text-[#1B1B1D] bg-[#FFFFFF]">
                  <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
                    <span className="text-[#75777D]">Security Clearance:</span>
                    <span className="font-bold text-[#065F46] bg-[#F6F3F5] border border-[#E2E8F0] px-2 py-0.5 rounded-[2px] text-[10px]">
                      LEVEL 5 (Q-TOP-SECRET)
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
                    <span className="text-[#75777D]">Problem Statement:</span>
                    <span className="font-bold text-[#0058BE]">SIH 2026 / PS 26141</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
                    <span className="text-[#75777D]">Assigned Node:</span>
                    <span className="text-[#1B1B1D]">Arbitrator (Cluster Master)</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[#75777D] text-[10px]">
                      <span>Quantum Public Key Hash:</span>
                      <button 
                        onClick={handleCopyPublicKey}
                        className="text-[#0058BE] hover:underline font-bold cursor-pointer"
                      >
                        {copiedKeyToast ? '✓ Copied' : 'Copy Key'}
                      </button>
                    </div>
                    <div className="p-2 bg-[#F6F3F5] rounded-[2px] text-[10px] text-[#1B1B1D] truncate select-all border border-[#E2E8F0] font-mono">
                      0x8F92A1BC40E7D294B105F838E7902BA49C12879F
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-3 bg-[#F6F3F5] border-t border-[#E2E8F0] flex gap-2">
                  <button 
                    onClick={() => { setShowUserProfile(false); onNavigate('monitoring'); }}
                    className="flex-1 py-1.5 bg-[#091426] hover:bg-[#1E293B] text-white rounded-[2px] font-mono text-[10.5px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                  >
                    SOC Console
                  </button>
                  <button 
                    onClick={() => setShowUserProfile(false)}
                    className="px-4 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#1B1B1D] rounded-[2px] font-mono text-[10.5px] uppercase transition-colors cursor-pointer font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── 2. MAIN WORKSPACE ─── */}
      <main className="flex-1 flex flex-col px-6 py-4 max-w-[1440px] w-full mx-auto">
        {/* Sub-Header Row */}
        <div className="flex justify-between items-end pb-3 border-b border-[#E2E8F0] shrink-0 mb-4">
          <div>
            <h1 className="text-[22px] font-bold text-[#091426] tracking-tight leading-none font-sans">
              QDS SENTINEL
            </h1>
            <p className="font-mono text-[10px] text-[#45474C] mt-1.5 uppercase tracking-widest font-medium">
              CENTRAL GATEWAY
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* API Status Badge (Clickable to open API Health Modal) */}
            <button 
              onClick={() => setShowApiModal(true)}
              className="flex items-center gap-1.5 bg-[#FFFFFF] hover:bg-[#F6F3F5] border border-[#E2E8F0] px-2.5 py-1 rounded-[2px] text-[11px] text-[#1B1B1D] transition-colors cursor-pointer"
              title="Click to view API Health & Gateway Diagnostics"
            >
              <Badge variant="success" className="px-1.5 py-0 text-[8.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#065F46] animate-pulse mr-1"></span>
                API: 3001 OK
              </Badge>
            </button>

            {/* Network Latency */}
            <div 
              className="flex items-center gap-1 text-[11px] text-[#45474C] cursor-help"
              title="Live REST round-trip ping time to FastAPI core"
            >
              <svg className="w-3.5 h-3.5 text-[#0058BE]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              <span>{performance?.api_latency_ms ? `${performance.api_latency_ms.toFixed(1)}ms` : '12ms'}</span>
            </div>

            {/* Version Badge */}
            <button 
              onClick={() => setActiveConceptModal({
                title: 'Quantum Digital Signature Platform v1.0.0',
                category: 'System Information & Build Specs',
                formula: 'SIH 2026 PS 26141 — Cyber-Physical Quantum Cryptography',
                description: 'Full tri-dashboard stack running FastAPI Gateway (Port 3001), Cyber-SOC Sentinel (Port 3000), Red Team Attack Sandbox (Port 5173), and Database Live Inspector (Port 4000) with PostgreSQL 18.3 persistence and Qiskit quantum circuit simulator.'
              })}
              className="text-[11px] text-[#45474C] hover:text-[#091426] cursor-pointer hover:underline"
              title="Click to view Version Details"
            >
              <Badge variant="secondary">v1.0.0</Badge>
            </button>
          </div>
        </div>

        {/* Dual Bento Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* ─── CARD 1: QUANTUM PROTOCOL DEMONSTRATION ─── */}
          <Card className="flex flex-col justify-between overflow-hidden shadow-none hover:border-[#CBD5E1] transition-all">
            <CardHeader>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#091426]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 2v7.31L4.69 17.5a2 2 0 0 0 1.62 3H17.7a2 2 0 0 0 1.62-3L14 9.31V2"/>
                  <path d="M8.5 2h7"/>
                  <path d="M7 16h10"/>
                </svg>
                <CardTitle className="text-[10.5px] uppercase tracking-widest text-[#091426] font-medium">
                  QUANTUM PROTOCOL DEMONSTRATION
                </CardTitle>
              </div>
              <CardAction>
                <span className="text-[10px] text-[#75777D]">/demonstration</span>
              </CardAction>
            </CardHeader>

            {/* Center Content */}
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 gap-8 pt-6">
              {/* Large Hub Icon */}
              <div 
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) window.open('/demonstration', '_blank');
                  else onNavigate('demonstration');
                }}
                className="text-[#091426] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                title="Launch interactive visualizer (Ctrl+Click to open in new tab)"
              >
                <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <circle cx="12" cy="3" r="2"/>
                  <circle cx="21" cy="9" r="2"/>
                  <circle cx="18" cy="19" r="2"/>
                  <circle cx="6" cy="19" r="2"/>
                  <circle cx="3" cy="9" r="2"/>
                  <line x1="12" y1="5" x2="12" y2="9"/>
                  <line x1="19.5" y1="9.8" x2="14.5" y2="11.2"/>
                  <line x1="16.5" y1="17.5" x2="13.5" y2="14.5"/>
                  <line x1="7.5" y1="17.5" x2="10.5" y2="14.5"/>
                  <line x1="4.5" y1="9.8" x2="9.5" y2="11.2"/>
                </svg>
              </div>

              {/* Interactive Concept Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
                {['EPR PAIRS', 'ALICE JOINT BSM', 'BOB PAULI ROTATIONS', 'CHSH BELL TEST'].map((pill) => (
                  <Button
                    key={pill}
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) window.open('/demonstration', '_blank');
                      else setActiveConceptModal(conceptDetails[pill]);
                    }}
                    className="hover:border-[#0058BE] hover:text-[#0058BE] text-[10.5px]"
                    title="Click to view details • Ctrl+Click to open Demonstration in new tab"
                  >
                    {pill}
                  </Button>
                ))}
              </div>
            </CardContent>

            {/* Bottom Button */}
            <CardFooter className="flex justify-center pb-8 shrink-0">
              <Button 
                variant="default"
                size="lg"
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) window.open('/demonstration', '_blank');
                  else onNavigate('demonstration');
                }}
                className="gap-2.5 px-8"
                title="Launch Simulator (Ctrl+Click to open in new tab)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                </svg>
                <span>LAUNCH SIMULATOR</span>
              </Button>
            </CardFooter>
          </Card>

          {/* ─── CARD 2: SOC SECURITY MONITORING ─── */}
          <Card className="flex flex-col justify-between overflow-hidden shadow-none hover:border-[#CBD5E1] transition-all">
            <CardHeader>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#091426]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </svg>
                <CardTitle className="text-[10.5px] uppercase tracking-widest text-[#091426] font-medium">
                  SOC SECURITY MONITORING
                </CardTitle>
              </div>
              <CardAction>
                <span className="text-[10px] text-[#75777D]">/monitoring</span>
              </CardAction>
            </CardHeader>

            {/* Center Content */}
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 gap-8 pt-6">
              {/* Large Shield Icon */}
              <div 
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) window.open('/monitoring', '_blank');
                  else onNavigate('monitoring');
                }}
                className="text-[#091426] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                title="Enter SOC Monitoring Center (Ctrl+Click to open in new tab)"
              >
                <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 4.14-2.65 7.99-6 9.08V4.18z"/>
                </svg>
              </div>

              {/* Interactive Monitoring Sub-page Pills */}
              <div className="flex flex-col items-center gap-2 max-w-xl">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) window.open('/monitoring', '_blank');
                      else onNavigate('monitoring');
                    }}
                    className="hover:border-[#0058BE] hover:text-[#0058BE] text-[10.5px]"
                    title="Jump to Telemetry Stream in Monitoring (Ctrl+Click to open in new tab)"
                  >
                    TELEMETRY AUDIT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) window.open('/monitoring', '_blank');
                      else onNavigate('monitoring');
                    }}
                    className="hover:border-[#0058BE] hover:text-[#0058BE] text-[10.5px]"
                    title="Jump to Hoeffding & Threat Bounds in Monitoring (Ctrl+Click to open in new tab)"
                  >
                    HOEFFDING THRESHOLDS
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) window.open('/database', '_blank');
                      else onNavigate('database');
                    }}
                    className="hover:border-[#0058BE] hover:text-[#0058BE] text-[10.5px]"
                    title="Open Database Inspector (Ctrl+Click to open in new tab)"
                  >
                    DATABASE INSPECTOR
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) window.open('/attack-sandbox', '_blank');
                      else onNavigate('attack-sandbox');
                    }}
                    className="hover:border-[#BA1A1A] hover:text-[#BA1A1A] text-[10.5px]"
                    title="Open Red-Team Attack Sandbox (Ctrl+Click to open in new tab)"
                  >
                    ATTACK SANDBOX
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) window.open('/monitoring', '_blank');
                      else onNavigate('monitoring');
                    }}
                    className="hover:border-[#0058BE] hover:text-[#0058BE] text-[10.5px]"
                    title="Inspect Quantum SDN Nodes (Ctrl+Click to open in new tab)"
                  >
                    SDN TOPOLOGY
                  </Button>
                </div>
              </div>
            </CardContent>

            {/* Bottom Button */}
            <CardFooter className="flex justify-center pb-8 shrink-0">
              <Button 
                variant="default"
                size="lg"
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) window.open('/monitoring', '_blank');
                  else onNavigate('monitoring');
                }}
                className="gap-2.5 px-8"
                title="Enter Cyber-SOC Center (Ctrl+Click to open in new tab)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>ENTER MONITORING CENTER</span>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Bottom Banner */}
        <div className="mt-4 border border-[#E2E8F0] bg-[#FFFFFF] rounded-[2px] p-3 flex items-center justify-between text-[11px] text-[#45474C] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#065F46]"></span>
            <span>Quantum Key Distribution (QKD) & Digital Signature (QDS) Simulation Protocol active.</span>
          </div>
          <div className="flex items-center gap-4">
            <span>FastAPI: <strong>3001</strong></span>
            <span>Vite UI: <strong>3000</strong></span>
            <span>PostgreSQL: <strong>5432</strong></span>
          </div>
        </div>
      </main>

      {/* ─── 4. QUANTUM CONCEPT DETAILS MODAL (shadcn Dialog) ─── */}
      <Dialog open={Boolean(activeConceptModal)} onOpenChange={(open) => !open && setActiveConceptModal(null)}>
        {activeConceptModal && (
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-5 py-3.5">
              <span className="text-[10px] uppercase tracking-widest text-[#0058BE] font-bold block mb-0.5">
                {activeConceptModal.category}
              </span>
              <DialogTitle className="text-[15px] text-[#091426]">
                {activeConceptModal.title}
              </DialogTitle>
            </div>

            <div className="p-5 space-y-3.5 bg-[#FFFFFF]">
              {activeConceptModal.formula && (
                <div className="p-2.5 bg-[#F6F3F5] text-[#091426] rounded-[2px] text-[11.5px] border border-[#E2E8F0] text-center font-bold tracking-wide">
                  {activeConceptModal.formula}
                </div>
              )}

              <DialogDescription className="text-[#1B1B1D] text-[13px] leading-relaxed">
                {activeConceptModal.description}
              </DialogDescription>
            </div>

            <DialogFooter className="p-3 bg-[#F6F3F5] border-t border-[#E2E8F0]">
              {activeConceptModal.route && (
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const r = activeConceptModal.route;
                    setActiveConceptModal(null);
                    if (r) onNavigate(r);
                  }}
                >
                  Open in Protocol Visualizer →
                </Button>
              )}
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setActiveConceptModal(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ─── 5. API GATEWAY HEALTH MODAL (shadcn Dialog) ─── */}
      <Dialog open={showApiModal} onOpenChange={setShowApiModal}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-5 py-3.5">
            <span className="text-[10px] uppercase tracking-widest text-[#0058BE] font-bold block mb-0.5">
              GATEWAY DIAGNOSTICS
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#065F46] animate-pulse"></span>
              <DialogTitle className="text-[#091426] text-[15px]">
                FastAPI Gateway Engine
              </DialogTitle>
            </div>
          </div>

          <div className="p-5 space-y-3 text-[11.5px] bg-[#FFFFFF]">
            <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
              <span className="text-[#75777D]">Gateway Endpoint:</span>
              <span className="font-bold text-[#091426]">http://127.0.0.1:3001</span>
            </div>
            <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
              <span className="text-[#75777D]">REST Engine Status:</span>
              <Badge variant="success">HEALTHY (200 OK)</Badge>
            </div>
            <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
              <span className="text-[#75777D]">PostgreSQL Persistence:</span>
              <Badge variant="success">CONNECTED (Port 5432)</Badge>
            </div>
            <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
              <span className="text-[#75777D]">Round-Trip Ping Latency:</span>
              <span className="font-bold text-[#0058BE]">{performance?.api_latency_ms ? `${performance.api_latency_ms.toFixed(1)}ms` : '12ms'}</span>
            </div>
            <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
              <span className="text-[#75777D]">Active Sessions Cached:</span>
              <span className="font-bold">{sessions.length} sessions</span>
            </div>
          </div>

          <DialogFooter className="p-3 bg-[#F6F3F5] border-t border-[#E2E8F0]">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowApiModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
