import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './services/api';

const SCENARIO_DATA = {
  clean: {
    id: 'clean',
    label: 'Clean Signature',
    name: 'Clean Quantum Handshake',
    qber: 0.016,
    chsh: 2.81,
    status: 'VERIFIED AUTHENTIC',
    isThreat: false,
    arbitrator: [
      '> initialize_protocol(BB84_EXT)',
      '> awaiting_node_registration...',
      '> ACK: Alice connected (ID: 0x9F3A · Node Alpha)',
      '> ACK: Bob connected (ID: 0x1C4B · Node Beta)',
      '> quantum channel established: fiber_link_01 (λ=1550nm)',
      '> enforcing Tsirelson & Bell-CHSH non-locality bounds...',
      '> Hoeffding bound audit: QBER 1.6% < 5.5% cutoff [PASS]',
      '> CHSH Bell test: S = 2.81 > 2.00 classical limit [PASS]',
      '> VERDICT: ACCEPT (Quantum Signature Sealed & Authentic)'
    ],
    alice: [
      '> seq_gen_start(mode: EPR_TELEPORTATION)',
      '> basis selection: [+, x, +, +, x, x, +, x, +, x...]',
      '> bitstream state: [1, 0, 1, 1, 0, 1, 0, 0, 1, 0...]',
      '> transmitting photons over dark fiber (n=1024)',
      '> BSM joint Bell measurement complete',
      '> classical feed-forward bits published (b1, b2)',
      '> signature dispatch finalized (SHA-256 integrity OK)'
    ],
    bob: [
      '> transceiver active(port: 9091, λ=1550nm)',
      '> measuring incoming single-photon pulse train...',
      '> rand bases: [x, x, +, x, +, x, +, +, x, +...]',
      '> 1024 photons captured with 99.4% optical fidelity',
      '> applied Pauli unitary corrections [I, X, Z, XZ]',
      '> basis reconciliation: 512 sifted bits matched',
      '> quantum signature validated: ZERO TAMPERING'
    ],
    eve: [
      '> probe_state: PASSIVE_MONITOR (link: quantum_link_01)',
      '> sniffing dark optical fiber core...',
      '> zero polarization collapse detected',
      '> photon flux nominal · signal below ambient noise floor',
      '> no intercept vector available',
      '> probe idle: 0 bytes exfiltrated'
    ]
  },
  mitm: {
    id: 'mitm',
    label: 'MitM (35% Intercept)',
    name: 'Intercept-Resend Eavesdropping',
    qber: 0.142,
    chsh: 1.88,
    status: 'COMPROMISED',
    isThreat: true,
    arbitrator: [
      '> initialize_protocol(BB84_EXT)',
      '> channel established: quantum_link_01',
      '> CRITICAL ALARM: QBER spike detected across sifted bits!',
      '> Observed QBER: 14.2% > Hoeffding Threshold: 5.5%',
      '> Bell correlation collapsed: S = 1.88 < 2.00 classical limit',
      '> ABORT: Intercept-resend adversary (Eve) detected!',
      '> VERDICT: REJECT (Session Quarantined, PQC Fallback Engaged)'
    ],
    alice: [
      '> seq_gen_start()',
      '> transmitting entangled photons (n=1024)',
      '> stream tx: 100% complete',
      '> awaiting basis reconciliation...',
      '> ERR: Sift parity breach reported by Arbitrator',
      '> Channel quarantine signaled: PURGING RAW KEY MATERIAL'
    ],
    bob: [
      '> listener_active(port: 9091)',
      '> measuring incoming stream...',
      '> capture: 1024 photons received',
      '> sending basis log to arbitrator()',
      '> ERR: Sifted key invalid (Phase collapse delta 14.2%)',
      '> Handshake rejected: Pauli alignment failed'
    ],
    eve: [
      '> inject_probe(target: quantum_link_01)',
      '> intercept-resend mode active (35% interception rate)',
      '> WARN: State collapse detected on entangled pulses',
      '> copying sifted fragments...',
      '> injecting forged replacement photons (n=145)',
      '> ERR: Arbitrator Hoeffding alarm tripped!'
    ]
  },
  forgery: {
    id: 'forgery',
    label: 'Forgery Attack',
    name: 'Quantum Signature Forgery',
    qber: 0.185,
    chsh: 1.76,
    status: 'COMPROMISED',
    isThreat: true,
    arbitrator: [
      '> initialize_protocol(BB84_EXT)',
      '> validating one-time-pad signature token...',
      '> TAMPER ALARM: Classical feed-forward hash mismatch!',
      '> QBER spike: 18.5% across test bit subset',
      '> CHSH Bell violation collapsed: S = 1.76 (Classical)',
      '> VERDICT: REJECT (Signature Forgery Blocked & Blacklisted)'
    ],
    alice: [
      '> seq_gen_start()',
      '> generating ephemeral signature tag...',
      '> state polarization: 45-DEG DIAGONAL',
      '> transmitting photons (n=1024)',
      '> stream tx: complete',
      '> ERR: Foreign basis replacement detected on wire'
    ],
    bob: [
      '> listener active(port: 9091)',
      '> measuring incoming stream...',
      '> testing MAC integrity with Alice public key...',
      '> ERR: Signature verification failed (Bit-flip delta 18.5%)',
      '> Channel quarantine requested: Bob rejected token'
    ],
    eve: [
      '> signature injection mode: ACTIVE',
      '> intercepting Alice classical document hash...',
      '> forging entangled Bell state polarization...',
      '> injecting synthetic MAC tag(len=256 bits)',
      '> WARN: Arbitrator Bell test failed forgery verification'
    ]
  },
  replay: {
    id: 'replay',
    label: 'Replay Attack',
    name: 'Stale Nonce Replay Attack',
    qber: 0.084,
    chsh: 1.96,
    status: 'COMPROMISED',
    isThreat: true,
    arbitrator: [
      '> initialize_protocol(BB84_EXT)',
      '> checking session nonce cache...',
      '> ERR: Nonce 0x77E120A previously consumed in Session QDS-8812',
      '> Timestamp skew: +4.82s (Tolerance: 0.10s)',
      '> Bell correlation: S = 1.96 (Stale entanglement)',
      '> VERDICT: REJECT (Stale Payload Replay Blocked)'
    ],
    alice: [
      '> seq_gen_start()',
      '> fresh nonce generated: 0x99482A1B',
      '> transmitting photons (n=1024)',
      '> WARN: Duplicate session handshake acknowledged from wire'
    ],
    bob: [
      '> listener active(port: 9091)',
      '> received replayed quantum packet signature',
      '> ERR: Epoch timestamp outside validity window',
      '> Aborting transaction'
    ],
    eve: [
      '> replay buffer tap: ACTIVE',
      '> retransmitting captured ciphertext from QDS-8812',
      '> ERR: Arbitrator nonce deduplication caught replayed stream'
    ]
  },
  noise: {
    id: 'noise',
    label: 'Channel Noise',
    name: 'Depolarizing Fiber Noise',
    qber: 0.095,
    chsh: 1.94,
    status: 'DEGRADED',
    isThreat: true,
    arbitrator: [
      '> initialize_protocol(BB84_EXT)',
      '> monitoring optical fiber dispersion...',
      '> WARN: Thermal drift on BBO crystal Peltier core',
      '> Observed QBER: 9.5% (Exceeds Hoeffding 5.5%)',
      '> Bell parameter S = 1.94 < 2.00',
      '> VERDICT: REJECT (Optical Auto-Alignment Triggered)'
    ],
    alice: [
      '> seq_gen_start()',
      '> polarization drift detected on output collimator',
      '> recalibrating polarization rotator...'
    ],
    bob: [
      '> listener active(port: 9091)',
      '> high fiber dispersion observed on dark fiber link',
      '> Phase shift +0.14 rad'
    ],
    eve: [
      '> probe standby(target: quantum_link_01)',
      '> measuring ambient thermal fluctuations...',
      '> high fiber dispersion detected · zero intentional eavesdropping'
    ]
  },
  pns: {
    id: 'pns',
    label: 'PNS Attack',
    name: 'Photon Number Splitting Attack',
    qber: 0.062,
    chsh: 2.05,
    status: 'COMPROMISED',
    isThreat: true,
    arbitrator: [
      '> initialize_protocol(BB84_EXT + Decoy)',
      '> analyzing decoy state yields (Y_signal vs Y_decoy)...',
      '> ERR: Decoy statistic discrepancy detected',
      '> Multi-photon pulse splitting detected on fiber link',
      '> VERDICT: REJECT (PNS Attack Neutralized by Decoy States)'
    ],
    alice: [
      '> interleaving decoy states (μ=0.5, ν=0.1)',
      '> transmitting photons (n=1024)',
      '> awaiting decoy yield estimation...'
    ],
    bob: [
      '> measuring decoy counts and gain...',
      '> sending statistics to arbitrator',
      '> Decoy yield anomaly confirmed'
    ],
    eve: [
      '> beam splitter tap: ACTIVE',
      '> splitting multi-photon pulses into quantum memory',
      '> transmitting single photons to Bob',
      '> ERR: Decoy state verification caught yield anomaly'
    ]
  }
};

export default function App() {
  const [session, setSession] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState('clean');
  const [isExecuting, setIsExecuting] = useState(false);
  const [simulationPhase, setSimulationPhase] = useState('');
  const [visibleLinesCount, setVisibleLinesCount] = useState(99);

  const scenarioData = SCENARIO_DATA[selectedScenario] || SCENARIO_DATA.clean;
  const isThreat = scenarioData.isThreat;
  const qberVal = scenarioData.qber;
  const chshVal = scenarioData.chsh;

  const [terminals, setTerminals] = useState({
    arbitrator: scenarioData.arbitrator,
    alice: scenarioData.alice,
    bob: scenarioData.bob,
    eve: scenarioData.eve,
  });

  // Cross-Dashboard Telemetry Broadcaster
  const broadcastTelemetry = useCallback((scKey) => {
    const data = SCENARIO_DATA[scKey] || SCENARIO_DATA.clean;
    const nowIso = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false }) + '.' + Math.floor(100 + Math.random() * 900);
    const qberPercent = Number((data.qber * 100).toFixed(2));
    const sessId = `QDS-2026-${scKey.toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const mainEvent = {
      id: Date.now().toString(),
      timestamp: timeStr,
      subsystem: data.isThreat ? 'EVE PROBE' : 'ARBITRATOR',
      event_type: data.name,
      latency_ms: data.isThreat ? 512 : 128,
      status_code: data.isThreat ? 500 : 200,
      message: data.isThreat 
        ? `[ADVERSARIAL ATTACK: ${data.name.toUpperCase()}] Eavesdropper active on optical fiber link-01`
        : `Quantum signature handshake verified nominal. QBER ${qberPercent}%, S=${data.chsh.toFixed(2)}.`,
      qber: qberPercent,
      chsh_score: data.chsh,
      security_score: data.isThreat ? 'Degraded' : 'Secure',
      is_error: data.isThreat,
      reason: data.isThreat ? `Observed QBER ${qberPercent}% > 5.50% statistical threshold` : undefined
    };

    const newSession = {
      session_id: sessId,
      document_name: data.isThreat ? `${scKey}_attack_flagged.sig` : 'quantum_dispatch_verified.sig',
      document_hash: data.isThreat ? '8f92a1bc40e7d294b105f838e7902ba4' : 'e3b0c44298fc1c149afbf4c8996fb924',
      file_size_kb: 128.0,
      status: data.isThreat ? 'REJECTED' : 'VERIFIED',
      created_at: nowIso,
      updated_at: nowIso,
      sender: 'Alice (ALC-01 · Node Alpha)',
      receiver: 'Bob (BOB-01 · Node Beta)',
      arbitrator: 'Arbitrator (ARB-01 · Core Cluster)',
      metrics: {
        qber: data.qber,
        baseline_qber: 0.020,
        hoeffding_threshold: 0.055,
        chsh_score: data.chsh,
        classical_limit: 2.00,
        tsirelson_bound: 2.828,
      },
      verdict: {
        verdict: data.isThreat ? 'REJECT' : 'ACCEPT',
        threat_detected: data.isThreat,
        threat_type: data.name,
      }
    };

    // 1. BroadcastChannel API for multi-tab sync
    try {
      const bc = new BroadcastChannel('qds_quantum_telemetry');
      bc.postMessage({ type: 'NEW_TELEMETRY_ITEM', payload: mainEvent });
      bc.close();
    } catch {}

    // 2. localStorage updates
    try {
      const savedStream = localStorage.getItem('qds_latest_stream');
      const streamList = savedStream ? JSON.parse(savedStream) : [];
      const updatedStream = [mainEvent, ...streamList.filter(i => i.id !== mainEvent.id)].slice(0, 20);
      localStorage.setItem('qds_latest_stream', JSON.stringify(updatedStream));

      if (data.isThreat) {
        const incidentId = `INC-${Date.now().toString().slice(-4)}`;
        const newIncident = {
          id: incidentId,
          status: 'INVESTIGATING',
          status_color: '#C2540A',
          assigned: 'Dr. Anisha S.',
          impact: 'CRITICAL',
          impact_color: '#BA1A1A',
          title: data.name,
          description: `Quantum intrusion event logged: QBER ${qberPercent}% with collapsed Bell non-locality S=${data.chsh.toFixed(2)}.`,
          timeline: [
            {
              time: `${new Date().toLocaleTimeString()} UTC`,
              title: 'Threat Detected',
              description: `Eavesdropping activity detected on optical channel: ${data.name}.`
            }
          ]
        };
        const savedInc = localStorage.getItem('qds_incidents_list');
        const incList = savedInc ? JSON.parse(savedInc) : [];
        localStorage.setItem('qds_incidents_list', JSON.stringify([newIncident, ...incList]));
        localStorage.setItem('qds_selected_incident_id', incidentId);

        const newThreat = {
          id: `THR-LIVE-${Date.now().toString().slice(-4)}`,
          severity: 'CRITICAL',
          origin_node: 'QN-EVE (Probe)',
          anomaly_type: data.name,
          time: `${new Date().toLocaleTimeString()} IST`,
          title: data.name.toUpperCase(),
          telemetry: {
            node: 'QN-BOB (Receiver)',
            baseline_qber: '1.8%',
            current_qber: `${qberPercent}%`,
          },
          risk_bars: [
            { height: 95, color: '#BA1A1A' },
            { height: 100, color: '#BA1A1A' },
            { height: 85, color: '#BA1A1A' },
            { height: 90, color: '#BA1A1A' },
          ]
        };
        const savedThreats = localStorage.getItem('qds_threat_anomalies');
        const thList = savedThreats ? JSON.parse(savedThreats) : [];
        localStorage.setItem('qds_threat_anomalies', JSON.stringify([newThreat, ...thList]));
        localStorage.setItem('qds_selected_threat_anomaly', JSON.stringify(newThreat));
      }
    } catch {}

    // 3. Window Custom Events
    try {
      window.dispatchEvent(new CustomEvent('qds:telemetry-update', { detail: mainEvent }));
      window.dispatchEvent(new CustomEvent('qds_attack_launched', { 
        detail: { 
          newSession, 
          newItem: mainEvent, 
          qberPercent, 
          chshScore: data.chsh, 
          scenarioKey: scKey 
        } 
      }));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }, []);

  const loadLatestSession = async () => {
    try {
      const listRes = await api.listSessions().catch(() => null);
      if (listRes?.sessions && listRes.sessions.length > 0) {
        const latest = listRes.sessions[listRes.sessions.length - 1];
        setSession(latest);
      }
    } catch {}
  };

  useEffect(() => {
    loadLatestSession();
    const interval = setInterval(loadLatestSession, 3000);
    return () => clearInterval(interval);
  }, []);

  // Trigger staged line streaming terminal animation
  const runTerminalAnimation = useCallback((key) => {
    const chosen = SCENARIO_DATA[key] || SCENARIO_DATA.clean;
    setTerminals({
      arbitrator: chosen.arbitrator,
      alice: chosen.alice,
      bob: chosen.bob,
      eve: chosen.eve,
    });

    setVisibleLinesCount(0);
    setIsExecuting(true);
    setSimulationPhase('INITIALIZING PROTOCOL (BB84 EXT)...');

    // Immediately broadcast to SOC Sentinel
    broadcastTelemetry(key);

    const totalLines = chosen.arbitrator.length;
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setVisibleLinesCount(current);
      if (current === 2) setSimulationPhase('TRANSMITTING PHOTONS (N=1024, λ=1550nm)...');
      if (current === 4) setSimulationPhase('RECONCILING MEASUREMENT BASES & SIFTING...');
      if (current === 6) setSimulationPhase('EVALUATING HOEFFDING & CHSH BELL TEST...');
      if (current >= totalLines) {
        clearInterval(interval);
        setIsExecuting(false);
        setSimulationPhase(
          chosen.isThreat
            ? `SECURITY BREACH · ${chosen.name.toUpperCase()} FLAGGED · PQC ENGAGED`
            : 'PROTOCOL VERIFIED · ACCEPT · QDS NON-LOCALITY SEALED'
        );
      }
    }, 110);
  }, [broadcastTelemetry]);

  const handleSelectScenario = (key) => {
    setSelectedScenario(key);
    runTerminalAnimation(key);

    // Trigger backend injection endpoints asynchronously
    if (key === 'clean') {
      api.createSession(1024, 0.016, 1e-6).catch(() => null);
    } else if (key === 'mitm') {
      api.injectMitm('SESSION_CURRENT', 0.35).catch(() => null);
    } else if (key === 'forgery') {
      api.injectForgery('SESSION_CURRENT', 0.20).catch(() => null);
    } else if (key === 'replay') {
      api.injectReplay('SESSION_CURRENT', 'QDS-PREV').catch(() => null);
    } else if (key === 'noise') {
      api.injectNoise('SESSION_CURRENT', 'DEPOLARIZING', 0.08).catch(() => null);
    } else if (key === 'pns') {
      api.injectPns('SESSION_CURRENT', 0.25).catch(() => null);
    }
  };

  const handleExecuteScenario = () => {
    runTerminalAnimation(selectedScenario);
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md h-screen flex flex-col overflow-hidden font-sans select-none">
      {/* ─── Top Brand Navigation Bar ─── */}
      <nav className="bg-[#FFFFFF] border-b border-[#E2E8F0] w-full flex justify-between items-center px-6 h-14 shrink-0 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[#0058BE]">
            <span className="font-bold text-[16px] tracking-tight text-[#091426]">QDS SENTINEL</span>
            <span className="text-[10px] font-mono font-bold bg-[#EBF3FC] text-[#0058BE] px-2 py-0.5 rounded uppercase">
              Dashboard 2: Red Team Sandbox
            </span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          {simulationPhase ? (
            <div className={`font-mono text-[11px] font-bold px-3 py-1 rounded flex items-center gap-2 border ${
              isThreat ? 'bg-[#FEF2F2] text-[#BA1A1A] border-[#FECACA]' : 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isExecuting ? 'animate-ping' : ''} ${isThreat ? 'bg-[#BA1A1A]' : 'bg-[#065F46]'}`} />
              <span>{simulationPhase}</span>
            </div>
          ) : (
            <div className="font-mono text-[11px] text-[#75777D]">
              Select a scenario or click Inject Attack to simulate quantum adversaries
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#75777D]">
            <span>Session: <strong className="text-[#091426]">{session?.session_id || 'QDS-2026-LIVE'}</strong></span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0058BE] text-white flex items-center justify-center font-mono text-[11px] font-bold">
            RT
          </div>
        </div>
      </nav>

      {/* ─── Main Workspace ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Attack Scenarios */}
        <aside className="w-[260px] border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col shrink-0">
          <div className="h-10 border-b border-[#E2E8F0] flex items-center px-4 bg-[#FFFFFF]">
            <span className="font-mono text-[11px] uppercase text-[#64748B] font-bold tracking-wider">
              Attack Scenarios
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {Object.values(SCENARIO_DATA).map((sc) => (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(sc.id)}
                className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-all ${
                  selectedScenario === sc.id
                    ? sc.isThreat 
                      ? 'border-[#BA1A1A] bg-[#FEF2F2] text-[#BA1A1A] font-bold shadow-sm'
                      : 'border-[#0058BE] bg-[#EBF3FC] text-[#0058BE] font-bold shadow-sm'
                    : 'border-[#E2E8F0] bg-white text-[#334155] hover:border-[#94A3B8] hover:bg-[#F1F5F9]'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-[12px] leading-tight">{sc.label}</span>
                  <span className="text-[10px] font-mono opacity-80">QBER: {(sc.qber * 100).toFixed(1)}% · S={sc.chsh.toFixed(2)}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${sc.isThreat ? 'bg-[#BA1A1A]' : 'bg-[#065F46]'}`} />
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-[#E2E8F0] bg-[#FFFFFF]">
            <button
              onClick={handleExecuteScenario}
              disabled={isExecuting}
              className={`w-full text-white font-mono text-[11px] font-bold uppercase py-2.5 rounded transition-all shadow cursor-pointer ${
                isExecuting 
                  ? 'bg-[#94A3B8] cursor-not-allowed'
                  : selectedScenario === 'clean'
                    ? 'bg-[#0058BE] hover:bg-[#00479E]'
                    : 'bg-[#BA1A1A] hover:bg-[#991B1B]'
              }`}
            >
              {isExecuting ? 'SIMULATING PROTOCOL...' : selectedScenario === 'clean' ? 'INITIATE HANDSHAKE' : 'INJECT ATTACK'}
            </button>
          </div>
        </aside>

        {/* Center: 4-Way Terminal Grid */}
        <main className="flex-1 bg-[#F1F5F9] p-4 flex flex-col gap-4 min-w-0 overflow-y-auto">
          <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full min-h-[540px]">
            {/* Terminal 1: Arbitrator */}
            <div className="border border-[#CBD5E1] bg-[#091426] text-[#E2E8F0] flex flex-col overflow-hidden rounded shadow-sm">
              <div className="h-7 border-b border-[#1E293B] bg-[#0F172A] flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                  <span className="font-mono text-[10.5px] uppercase font-bold text-[#94A3B8]">Arbitrator.sys</span>
                </div>
                <span className="font-mono text-[9px] text-[#64748B]">PORT 9000 · BB84 EXT</span>
              </div>
              <div className="flex-1 p-3 font-mono text-[11px] overflow-y-auto space-y-1 leading-relaxed">
                {terminals.arbitrator.slice(0, visibleLinesCount).map((line, i) => (
                  <div key={i} className={line.includes('REJECT') || line.includes('ALARM') || line.includes('ABORT') ? 'text-[#F87171] font-bold' : line.includes('PASS') || line.includes('ACCEPT') ? 'text-[#34D399] font-bold' : 'text-[#94A3B8]'}>
                    {line}
                  </div>
                ))}
                {isExecuting && <div className="text-[#38BDF8] animate-pulse">&gt; streaming quantum metrics...</div>}
                <div>&gt; <span className="animate-pulse text-[#38BDF8]">_</span></div>
              </div>
            </div>

            {/* Terminal 2: Alice */}
            <div className="border border-[#CBD5E1] bg-[#091426] text-[#E2E8F0] flex flex-col overflow-hidden rounded shadow-sm">
              <div className="h-7 border-b border-[#1E293B] bg-[#0F172A] flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#34D399]" />
                  <span className="font-mono text-[10.5px] uppercase font-bold text-[#94A3B8]">Alice Node (Transmitter)</span>
                </div>
                <span className="font-mono text-[9px] text-[#64748B]">NODE-01 · EPR SOURCE</span>
              </div>
              <div className="flex-1 p-3 font-mono text-[11px] overflow-y-auto space-y-1 leading-relaxed">
                {terminals.alice.slice(0, visibleLinesCount).map((line, i) => (
                  <div key={i} className={line.includes('ERR') || line.includes('breach') ? 'text-[#F87171] font-bold' : line.includes('complete') || line.includes('finalized') ? 'text-[#34D399]' : 'text-[#CBD5E1]'}>
                    {line}
                  </div>
                ))}
                <div>&gt; <span className="animate-pulse text-[#34D399]">_</span></div>
              </div>
            </div>

            {/* Terminal 3: Bob */}
            <div className="border border-[#CBD5E1] bg-[#091426] text-[#E2E8F0] flex flex-col overflow-hidden rounded shadow-sm">
              <div className="h-7 border-b border-[#1E293B] bg-[#0F172A] flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#34D399]" />
                  <span className="font-mono text-[10.5px] uppercase font-bold text-[#94A3B8]">Bob Node (Receiver)</span>
                </div>
                <span className="font-mono text-[9px] text-[#64748B]">PORT 9091 · DETECTOR</span>
              </div>
              <div className="flex-1 p-3 font-mono text-[11px] overflow-y-auto space-y-1 leading-relaxed">
                {terminals.bob.slice(0, visibleLinesCount).map((line, i) => (
                  <div key={i} className={line.includes('ERR') || line.includes('failed') || line.includes('rejected') ? 'text-[#F87171] font-bold' : line.includes('validated') || line.includes('matched') ? 'text-[#34D399]' : 'text-[#CBD5E1]'}>
                    {line}
                  </div>
                ))}
                <div>&gt; <span className="animate-pulse text-[#34D399]">_</span></div>
              </div>
            </div>

            {/* Terminal 4: Eve */}
            <div className="border border-[#CBD5E1] bg-[#091426] text-[#E2E8F0] flex flex-col overflow-hidden relative rounded shadow-sm">
              <div className="h-7 border-b border-[#1E293B] bg-[#0F172A] flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isThreat ? 'bg-[#F87171]' : 'bg-[#64748B]'}`} />
                  <span className="font-mono text-[10.5px] uppercase font-bold text-[#94A3B8]">Eve Intercept (Probe)</span>
                </div>
                <span className="font-mono text-[9px] text-[#64748B]">OPTICAL TAP · 1550nm</span>
              </div>
              <div className="flex-1 p-3 font-mono text-[11px] overflow-y-auto space-y-1 leading-relaxed">
                {terminals.eve.slice(0, visibleLinesCount).map((line, i) => (
                  <div key={i} className={line.includes('ERR') || line.includes('tripped') ? 'text-[#F87171] font-bold' : line.includes('WARN') || line.includes('intercept') || line.includes('forging') ? 'text-[#FBBF24]' : 'text-[#94A3B8]'}>
                    {line}
                  </div>
                ))}
                <div>&gt; <span className="animate-pulse text-[#F87171]">_</span></div>
              </div>
              {isThreat && (
                <div className="absolute bottom-3 right-3 bg-[#BA1A1A] text-white px-2.5 py-1 font-mono text-[9.5px] uppercase font-bold tracking-widest rounded animate-pulse shadow-lg">
                  Intervention Active
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar: Telemetry */}
        <aside className="w-[300px] border-l border-[#E2E8F0] bg-[#FFFFFF] flex flex-col shrink-0 overflow-y-auto">
          <div className="h-10 border-b border-[#E2E8F0] flex items-center px-4 bg-[#FFFFFF] shrink-0">
            <span className="font-mono text-[11px] uppercase text-[#64748B] font-bold tracking-wider">
              Telemetry & Physics Bounds
            </span>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {/* Graph 1: QBER */}
            <div className="border border-[#E2E8F0] rounded overflow-hidden shadow-sm">
              <div className="h-7 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center px-3 justify-between">
                <span className="font-mono text-[10.5px] uppercase text-[#091426] font-bold">QBER vs Hoeffding</span>
                <span className="text-[10px] font-mono text-[#BA1A1A] font-bold">Limit ≤ 5.5%</span>
              </div>
              <div className="h-32 bg-[#FFFFFF] relative p-3 overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#F1F5F9_1px,transparent_1px),linear-gradient(to_bottom,#F1F5F9_1px,transparent_1px)] bg-[size:16px_16px] opacity-60"></div>
                <div className="relative z-10 flex justify-between font-mono text-[9px] text-[#64748B]">
                  <span>0.25</span>
                  <span className="text-[#BA1A1A] font-bold">0.055 Threshold</span>
                </div>
                
                <svg className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="none">
                  <line stroke="#BA1A1A" strokeDasharray="3,3" strokeWidth="1.5" x1="0" x2="100%" y1="55%" y2="55%"></line>
                  <polyline 
                    fill="none" 
                    points={isThreat ? "0,95 40,88 80,90 120,60 160,45 200,30 260,20" : "0,95 40,92 80,94 120,90 160,93 200,91 260,92"} 
                    stroke={isThreat ? "#BA1A1A" : "#0058BE"} 
                    strokeWidth="2.5"
                  ></polyline>
                </svg>

                <div className="relative z-10 flex justify-between items-end font-mono text-[9.5px] h-full">
                  <span className="text-[#64748B]">0.00</span>
                  <span className={`font-bold ${isThreat ? 'text-[#BA1A1A]' : 'text-[#0058BE]'}`}>
                    Current: {(qberVal * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Graph 2: CHSH */}
            <div className="border border-[#E2E8F0] rounded overflow-hidden shadow-sm">
              <div className="h-7 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center px-3 justify-between">
                <span className="font-mono text-[10.5px] uppercase text-[#091426] font-bold">CHSH Bell Violation</span>
                <span className="text-[10px] font-mono text-[#065F46] font-bold">Quantum ≥ 2.0</span>
              </div>
              <div className="h-32 bg-[#FFFFFF] relative p-3 overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#F1F5F9_1px,transparent_1px),linear-gradient(to_bottom,#F1F5F9_1px,transparent_1px)] bg-[size:16px_16px] opacity-60"></div>
                <div className="relative z-10 flex justify-between font-mono text-[9px] text-[#64748B]">
                  <span>S=2.828 Tsirelson</span>
                  <span></span>
                </div>

                <svg className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="none">
                  <line stroke="#64748B" strokeDasharray="3,3" strokeWidth="1.5" x1="0" x2="100%" y1="58%" y2="58%"></line>
                  <polyline 
                    fill="none" 
                    points={isThreat ? "0,25 50,30 100,55 150,70 200,80 260,88" : "0,25 50,22 100,28 150,24 200,26 260,23"} 
                    stroke={isThreat ? "#BA1A1A" : "#065F46"} 
                    strokeWidth="2.5"
                  ></polyline>
                </svg>

                <div className="relative z-10 flex justify-between items-end font-mono text-[9.5px] h-full">
                  <span className="text-[#64748B]">Classical limit (S=2.0)</span>
                  <span className={`font-bold ${isThreat ? 'text-[#BA1A1A]' : 'text-[#065F46]'}`}>
                    S = {chshVal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Data Summary Card */}
            <div className="border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex flex-col gap-2 rounded">
              <div className="flex justify-between font-mono text-[10.5px]">
                <span className="text-[#64748B]">Key Generation Rate:</span>
                <span className="text-[#091426] font-bold">1.2 kbps</span>
              </div>
              <div className="flex justify-between font-mono text-[10.5px]">
                <span className="text-[#64748B]">Sifting Efficiency:</span>
                <span className="text-[#091426] font-bold">49.8%</span>
              </div>
              <div className="flex justify-between font-mono text-[10.5px]">
                <span className="text-[#64748B]">Helstrom Bound:</span>
                <span className="text-[#091426] font-bold">0.082</span>
              </div>
              <div className="flex justify-between font-mono text-[10.5px] pt-2 border-t border-[#E2E8F0]">
                <span className="text-[#64748B]">Security Status:</span>
                <span className={`font-bold ${isThreat ? 'text-[#BA1A1A]' : 'text-[#065F46]'}`}>
                  {scenarioData.status}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
