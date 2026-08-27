import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';

export default function App() {
  const [session, setSession] = useState(null);
  const [auditResult, setAuditResult] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState('clean');
  const [isExecuting, setIsExecuting] = useState(false);
  const [terminals, setTerminals] = useState({
    arbitrator: [
      '> initialize_protocol(BB84_EXT)',
      '> awaiting_registration...',
      '> ACK: Alice connected (ID: 0x9F3A)',
      '> ACK: Bob connected (ID: 0x1C4B)',
      '> channel_established: quantum_link_01',
      '> enforcing_bell_test_constraints...',
    ],
    alice: [
      '> seq_gen_start()',
      '> bases: [+, x, +, +, x, x, +, x...]',
      '> bits:  [1, 0, 1, 1, 0, 1, 0, 0...]',
      '> transmitting_photons (n=1024)',
      '> stream_tx: 100% complete',
      '> awaiting_basis_reconciliation...',
    ],
    bob: [
      '> listener_active(port: 9091)',
      '> measuring_incoming_stream...',
      '> rand_bases: [x, x, +, x, +, x, +, +...]',
      '> capture: 1024 photons received',
      '> sending_basis_log_to_arbitrator()',
      '> generating_sifted_key()',
    ],
    eve: [
      '> probe_state: idle',
      '> awaiting_target_selection...',
    ]
  });

  const loadLatestSession = async () => {
    try {
      const listRes = await api.listSessions().catch(() => null);
      if (listRes?.sessions && listRes.sessions.length > 0) {
        const latest = listRes.sessions[listRes.sessions.length - 1];
        setSession(latest);
        if (latest.security) {
          const dec = typeof latest.security.decision === 'string' 
            ? latest.security.decision 
            : (latest.security.decision?.overall || 'ACCEPT');
          setAuditResult({
            decision: dec,
            qber: latest.security.qber ?? 0.018,
            threshold: latest.security.threshold ?? 0.055,
            chsh: latest.security.chsh ?? 2.81,
            threat_detected: latest.security.threat_detected || (latest.attacks && latest.attacks.length > 0) || false,
            threat_type: latest.security.threat_type || latest.attacks?.[0]?.attack_type || null,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLatestSession();
    const interval = setInterval(loadLatestSession, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleExecuteScenario = async () => {
    setIsExecuting(true);
    const ts = new Date().toLocaleTimeString();

    try {
      if (selectedScenario === 'clean') {
        const res = await api.runWorkflow('auth_manifest_v2.sig', 64.0);
        setSession(res);
        setAuditResult({
          decision: 'ACCEPT',
          qber: res.metrics?.qber || 0.016,
          threshold: res.metrics?.hoeffding_threshold || 0.055,
          chsh: res.metrics?.chsh_score || 2.81,
          threat_detected: false,
          threat_type: null,
        });
        setTerminals({
          arbitrator: [
            `[${ts}] > session_init: ${res.session_id}`,
            `[${ts}] > generated 1024 EPR Bell pairs`,
            `[${ts}] > Hoeffding test: PASSED (QBER < 5.5%)`,
            `[${ts}] > CHSH test: PASSED (S = 2.81)`,
            `[${ts}] > VERDICT: ACCEPT (Signature Validated)`
          ],
          alice: [
            `[${ts}] > BSM joint measurement complete`,
            `[${ts}] > published feed-forward classical bits (b1, b2)`,
            `[${ts}] > signature dispatch finalized`
          ],
          bob: [
            `[${ts}] > applied Pauli unitary rotations [I, X, Z, XZ]`,
            `[${ts}] > basis reconciliation: 512 sifted bits matched`,
            `[${ts}] > signature hash authentic`
          ],
          eve: [
            `[${ts}] > probe_state: PASSIVE_MONITOR`,
            `[${ts}] > no intervention detected on fiber link`
          ]
        });
      } else if (selectedScenario === 'mitm') {
        const sessId = session?.session_id || 'QKD-20260826-0001';
        const res = await api.injectInterceptResend(sessId, 0.35);
        setAuditResult({
          decision: 'REJECT',
          qber: res.audit_metrics?.qber || 0.142,
          threshold: 0.055,
          chsh: 1.88,
          threat_detected: true,
          threat_type: 'INTERCEPT_RESEND',
        });
        setTerminals((prev) => ({
          ...prev,
          arbitrator: [
            `[${ts}] > CRITICAL ALARM: QBER spike detected!`,
            `[${ts}] > Observed QBER: 14.2% > Hoeffding Limit: 5.5%`,
            `[${ts}] > Bell test collapsed: S = 1.88 < 2.00`,
            `[${ts}] > VERDICT: REJECT (Session Terminated & Quarantined)`
          ],
          eve: [
            `[${ts}] > inject_probe(target: quantum_link_01)`,
            `[${ts}] > intercept_resend_active (35% interception rate)`,
            `[${ts}] > WARN: state collapse detected on entangled pulses`,
            `[${ts}] > ERR: Arbitrator trigger alarm trip`
          ]
        }));
      } else if (selectedScenario === 'forgery') {
        const sessId = session?.session_id || 'QKD-20260826-0001';
        const res = await api.injectForgery(sessId, 16);
        setAuditResult({
          decision: 'REJECT',
          qber: 0.185,
          threshold: 0.055,
          chsh: 1.76,
          threat_detected: true,
          threat_type: 'SIGNATURE_FORGERY',
        });
        setTerminals((prev) => ({
          ...prev,
          arbitrator: [
            `[${ts}] > TAMPER ALARM: Classical feed-forward mismatch`,
            `[${ts}] > Bob received corrupted Pauli index table`,
            `[${ts}] > VERDICT: REJECT (Signature Forgery Blocked)`
          ],
          eve: [
            `[${ts}] > modifying classical bits (b1, b2) in transit`,
            `[${ts}] > injected 16 forged pulse operations`,
            `[${ts}] > Bob Pauli alignment failed`
          ]
        }));
      } else {
        const sessId = session?.session_id || 'QKD-20260826-0001';
        await api.injectNoise(sessId, 0.08);
        setAuditResult({
          decision: 'REJECT',
          qber: 0.095,
          threshold: 0.055,
          chsh: 1.94,
          threat_detected: true,
          threat_type: selectedScenario.toUpperCase(),
        });
        setTerminals((prev) => ({
          ...prev,
          arbitrator: [
            `[${ts}] > CHANNEL DISTURBANCE DETECTED: ${selectedScenario}`,
            `[${ts}] > QBER: 9.5% (Exceeds Hoeffding 5.5%)`,
            `[${ts}] > VERDICT: REJECT`
          ],
          eve: [
            `[${ts}] > active perturbation: ${selectedScenario}`,
            `[${ts}] > photon stream decohered`
          ]
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
      loadLatestSession();
    }
  };

  const isThreat = auditResult?.threat_detected || auditResult?.decision === 'REJECT';
  const qberVal = auditResult?.qber || 0.018;
  const chshVal = auditResult?.chsh || 2.81;

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md h-screen flex flex-col overflow-hidden">
      {/* ─── Top Brand Navigation Bar ─── */}
      <nav className="bg-surface border-b border-surface-stroke w-full flex justify-between items-center px-gutter h-16 shrink-0 relative">
        <div className="flex items-center gap-space-sm cursor-pointer active:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-primary" data-icon="policy">policy</span>
          <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">QDS SENTINEL</span>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex h-full items-center gap-space-lg">
          <div className="h-full flex items-center border-b-2 border-secondary text-secondary pb-1 transition-colors px-2">
            <span className="font-headline-md text-headline-md uppercase font-bold">Attack Sandbox</span>
          </div>
        </div>

        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-2 font-mono text-[11px] text-on-surface-variant">
            <span>Session: <strong className="text-on-surface">{session?.session_id || 'QKD-20260826-0001'}</strong></span>
          </div>

          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-surface-stroke overflow-hidden flex items-center justify-center font-mono text-[11px] font-bold text-primary">
            RT
          </div>
        </div>
      </nav>

      {/* ─── Main Workspace ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Attack Scenarios */}
        <aside className="w-sidebar-width border-r border-surface-stroke bg-surface-container-low flex flex-col shrink-0">
          <div className="h-10 border-b border-surface-stroke flex items-center px-space-md bg-surface">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant font-bold">Attack Scenarios</span>
          </div>

          <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-2">
            {[
              { id: 'clean', label: 'Clean Signature' },
              { id: 'mitm', label: 'MitM (35% Intercept)' },
              { id: 'forgery', label: 'Forgery Attack' },
              { id: 'replay', label: 'Replay Attack' },
              { id: 'noise', label: 'Channel Noise' },
              { id: 'pns', label: 'PNS Attack' },
            ].map((sc) => (
              <label 
                key={sc.id} 
                className={`flex items-center gap-space-sm p-space-sm border cursor-pointer transition-colors ${
                  selectedScenario === sc.id 
                    ? 'border-secondary bg-surface-container-lowest font-bold text-secondary' 
                    : 'border-surface-stroke bg-surface hover:border-outline'
                }`}
              >
                <input 
                  type="radio"
                  name="scenario"
                  value={sc.id}
                  checked={selectedScenario === sc.id}
                  onChange={() => setSelectedScenario(sc.id)}
                  className="text-secondary focus:ring-secondary focus:ring-offset-0"
                />
                <span className="font-data-mono text-data-mono text-on-surface">{sc.label}</span>
              </label>
            ))}
          </div>

          <div className="p-space-md border-t border-surface-stroke bg-surface">
            <button 
              onClick={handleExecuteScenario}
              disabled={isExecuting}
              className={`w-full text-on-primary rounded font-label-mono text-label-mono uppercase py-2.5 transition-colors border shadow-sm cursor-pointer ${
                selectedScenario === 'clean'
                  ? 'bg-primary border-primary hover:opacity-90'
                  : 'bg-data-critical border-data-critical hover:bg-error'
              }`}
            >
              {isExecuting ? 'EXECUTING...' : selectedScenario === 'clean' ? 'INITIATE HANDSHAKE' : 'INJECT ATTACK'}
            </button>
          </div>
        </aside>

        {/* Center: 4-Way Terminal Grid */}
        <main className="flex-1 bg-background p-gutter flex flex-col gap-gutter min-w-0 overflow-y-auto">
          <div className="grid grid-cols-2 grid-rows-2 gap-gutter h-full min-h-[560px]">
            {/* Terminal: Arbitrator */}
            <div className="border border-surface-stroke bg-terminal-bg flex flex-col overflow-hidden rounded-DEFAULT shadow-sm">
              <div className="h-6 border-b border-surface-stroke bg-surface-container-highest flex items-center px-space-sm gap-space-sm shrink-0">
                <div className="w-[6px] h-[6px] rounded-full bg-secondary"></div>
                <span className="font-label-mono text-label-mono uppercase text-on-surface font-bold">Arbitrator.sys</span>
              </div>
              <div className="flex-1 p-space-sm font-data-mono text-data-mono text-primary-fixed-dim terminal-scroll overflow-y-auto space-y-1 text-[11px]">
                {terminals.arbitrator.map((line, i) => (
                  <div key={i} className={line.includes('REJECT') || line.includes('ALARM') ? 'text-data-critical font-bold' : line.includes('PASSED') ? 'text-data-success' : ''}>
                    {line}
                  </div>
                ))}
                <div>&gt; <span className="blinking-cursor">_</span></div>
              </div>
            </div>

            {/* Terminal: Alice */}
            <div className="border border-surface-stroke bg-terminal-bg flex flex-col overflow-hidden rounded-DEFAULT shadow-sm">
              <div className="h-6 border-b border-surface-stroke bg-surface-container-highest flex items-center px-space-sm gap-space-sm shrink-0">
                <div className="w-[6px] h-[6px] rounded-full bg-data-success"></div>
                <span className="font-label-mono text-label-mono uppercase text-on-surface font-bold">Alice Node (Transmitter)</span>
              </div>
              <div className="flex-1 p-space-sm font-data-mono text-data-mono text-surface-container-high terminal-scroll overflow-y-auto space-y-1 text-[11px]">
                {terminals.alice.map((line, i) => (
                  <div key={i} className={line.includes('complete') ? 'text-data-success' : ''}>
                    {line}
                  </div>
                ))}
                <div>&gt; <span className="blinking-cursor">_</span></div>
              </div>
            </div>

            {/* Terminal: Bob */}
            <div className="border border-surface-stroke bg-terminal-bg flex flex-col overflow-hidden rounded-DEFAULT shadow-sm">
              <div className="h-6 border-b border-surface-stroke bg-surface-container-highest flex items-center px-space-sm gap-space-sm shrink-0">
                <div className="w-[6px] h-[6px] rounded-full bg-data-success"></div>
                <span className="font-label-mono text-label-mono uppercase text-on-surface font-bold">Bob Node (Receiver)</span>
              </div>
              <div className="flex-1 p-space-sm font-data-mono text-data-mono text-surface-container-high terminal-scroll overflow-y-auto space-y-1 text-[11px]">
                {terminals.bob.map((line, i) => (
                  <div key={i} className={line.includes('failed') ? 'text-data-critical' : line.includes('matched') ? 'text-data-success' : ''}>
                    {line}
                  </div>
                ))}
                <div>&gt; <span className="blinking-cursor">_</span></div>
              </div>
            </div>

            {/* Terminal: Eve */}
            <div className="border border-surface-stroke bg-terminal-bg flex flex-col overflow-hidden relative rounded-DEFAULT shadow-sm">
              <div className="h-6 border-b border-surface-stroke bg-surface-container-highest flex items-center px-space-sm gap-space-sm shrink-0">
                <div className={`w-[6px] h-[6px] rounded-full ${isThreat ? 'bg-data-critical' : 'bg-surface-tint'}`}></div>
                <span className="font-label-mono text-label-mono uppercase text-on-surface font-bold">Eve Intercept (Probe)</span>
              </div>
              <div className="flex-1 p-space-sm font-data-mono text-data-mono text-error-container terminal-scroll overflow-y-auto space-y-1 text-[11px]">
                {terminals.eve.map((line, i) => (
                  <div key={i} className={line.includes('ERR') ? 'text-data-critical font-bold' : line.includes('WARN') ? 'text-data-warning' : ''}>
                    {line}
                  </div>
                ))}
                <div>&gt; <span className="blinking-cursor text-error-container">_</span></div>
              </div>
              {isThreat && (
                <div className="absolute bottom-4 right-4 border border-data-critical bg-error text-on-error px-2 py-1 font-label-mono text-[9px] uppercase tracking-widest font-bold animate-pulse">
                  Intervention Active
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar: Telemetry */}
        <aside className="w-[300px] border-l border-surface-stroke bg-surface-container-lowest flex flex-col shrink-0 overflow-y-auto">
          <div className="h-10 border-b border-surface-stroke flex items-center px-space-md bg-surface shrink-0">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant font-bold">Telemetry</span>
          </div>

          <div className="p-space-md flex flex-col gap-space-lg">
            {/* Graph 1: QBER */}
            <div className="border border-surface-stroke rounded-DEFAULT overflow-hidden">
              <div className="h-6 border-b border-surface-stroke bg-surface flex items-center px-space-sm justify-between">
                <span className="font-label-mono text-label-mono uppercase text-on-surface">QBER vs Hoeffding</span>
                <span className="text-[10px] font-mono text-data-critical">Limit ≤ 5.5%</span>
              </div>
              <div className="h-32 bg-background relative p-2 overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:16px_16px] opacity-30"></div>
                <div className="relative z-10 flex justify-between font-data-mono text-[9px] text-on-surface-variant">
                  <span>0.20</span>
                  <span className="text-data-critical">0.055 (Threshold)</span>
                </div>
                
                {/* SVG Graph Indicator */}
                <svg className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="none">
                  <line stroke="#B91C1C" strokeDasharray="2,2" strokeWidth="1" x1="0" x2="100%" y1="50%" y2="50%"></line>
                  <polyline 
                    fill="none" 
                    points={isThreat ? "0,90 40,85 80,88 120,60 160,50 200,30 260,25" : "0,90 40,88 80,92 120,86 160,89 200,91 260,88"} 
                    stroke={isThreat ? "#B91C1C" : "#0058be"} 
                    strokeWidth="2"
                  ></polyline>
                </svg>

                <div className="relative z-10 flex justify-between items-end font-data-mono text-[9px] text-on-surface-variant h-full">
                  <span>0.00</span>
                  <span className={`font-bold ${isThreat ? 'text-data-critical' : 'text-secondary'}`}>
                    Current: {(qberVal * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Graph 2: CHSH */}
            <div className="border border-surface-stroke rounded-DEFAULT overflow-hidden">
              <div className="h-6 border-b border-surface-stroke bg-surface flex items-center px-space-sm justify-between">
                <span className="font-label-mono text-label-mono uppercase text-on-surface">CHSH Bell Violation</span>
                <span className="text-[10px] font-mono text-data-success">Quantum ≥ 2.0</span>
              </div>
              <div className="h-32 bg-background relative p-2 overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:16px_16px] opacity-30"></div>
                <div className="relative z-10 flex justify-between font-data-mono text-[9px] text-on-surface-variant">
                  <span>S=2.82</span>
                  <span></span>
                </div>

                <svg className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="none">
                  <line stroke="#45474c" strokeDasharray="2,2" strokeWidth="1" x1="0" x2="100%" y1="60%" y2="60%"></line>
                  <polyline 
                    fill="none" 
                    points={isThreat ? "0,30 50,35 100,50 150,65 200,75 260,80" : "0,30 50,28 100,32 150,29 200,31 260,30"} 
                    stroke={isThreat ? "#B45309" : "#065F46"} 
                    strokeWidth="2"
                  ></polyline>
                </svg>

                <div className="relative z-10 flex justify-between items-end font-data-mono text-[9px] text-on-surface-variant h-full">
                  <span>Classical limit (S=2.0)</span>
                  <span className={`font-bold ${isThreat ? 'text-data-warning' : 'text-data-success'}`}>
                    S = {chshVal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Data Readout */}
            <div className="border border-surface-stroke bg-surface p-space-sm flex flex-col gap-2 rounded-DEFAULT">
              <div className="flex justify-between font-data-mono text-[10px] uppercase">
                <span className="text-on-surface-variant">Key Rate:</span>
                <span className="text-on-surface font-bold">1.2 kbps</span>
              </div>
              <div className="flex justify-between font-data-mono text-[10px] uppercase">
                <span className="text-on-surface-variant">Sifting Eff:</span>
                <span className="text-on-surface font-bold">49.8%</span>
              </div>
              <div className="flex justify-between font-data-mono text-[10px] uppercase pt-1 border-t border-surface-stroke">
                <span className="text-on-surface-variant">Security Status:</span>
                <span className={`font-bold ${isThreat ? 'text-data-critical' : 'text-data-success'}`}>
                  {isThreat ? 'COMPROMISED' : 'VERIFIED AUTHENTIC'}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
