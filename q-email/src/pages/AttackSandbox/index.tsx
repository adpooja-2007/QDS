import React, { useState, useEffect, useRef } from 'react';
import { Shield, Settings, Bell, User, Check, X, Copy, Maximize2, Terminal, Sliders, Info, Activity, RefreshCw } from 'lucide-react';
import { sentinelService } from '../../services/sentinelService';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { Progress } from '../../components/ui/progress';

interface AttackScenario {
  id: string;
  name: string;
  qber: number;
  qberLabel: string;
  chsh: number;
  chshLabel: string;
  keyRate: string;
  siftingEff: string;
  securityStatus: 'SECURE' | 'COMPROMISED' | 'DEGRADED';
  interventionActive: boolean;
  interventionText: string;
  arbitratorLogs: string[];
  aliceLogs: string[];
  bobLogs: string[];
  eveLogs: string[];
  rawPacketDumps?: {
    qubitIndex: number;
    aliceBasis: string;
    aliceBit: number;
    bobBasis: string;
    bobBit: number;
    eveIntercepted: boolean;
    polarizationAngle: string;
    phaseDriftPs: string;
  }[];
}

const generateMockPackets = (isAttack: boolean) => {
  const bases = ['+', 'x'];
  const angles = ['0°', '45°', '90°', '135°'];
  return Array.from({ length: 12 }, (_, i) => {
    const aBasis = bases[Math.floor(Math.random() * 2)];
    const bBasis = isAttack && Math.random() > 0.4 ? (aBasis === '+' ? 'x' : '+') : aBasis;
    const aBit = Math.random() > 0.5 ? 1 : 0;
    const bBit = aBasis === bBasis && !isAttack ? aBit : (Math.random() > 0.5 ? 1 : 0);
    return {
      qubitIndex: i + 1,
      aliceBasis: aBasis,
      aliceBit: aBit,
      bobBasis: bBasis,
      bobBit: bBit,
      eveIntercepted: isAttack && Math.random() > 0.3,
      polarizationAngle: angles[Math.floor(Math.random() * angles.length)],
      phaseDriftPs: (Math.random() * 0.08).toFixed(3)
    };
  });
};

const ATTACK_SCENARIOS: Record<string, AttackScenario> = {
  clean: {
    id: 'clean',
    name: 'Clean Signature',
    qber: 0.012,
    qberLabel: 'Current: 0.012',
    chsh: 2.78,
    chshLabel: 'S = 2.78',
    keyRate: '2.4 KBPS',
    siftingEff: '51.2%',
    securityStatus: 'SECURE',
    interventionActive: false,
    interventionText: 'CHANNEL NOMINAL',
    rawPacketDumps: generateMockPackets(false),
    arbitratorLogs: [
      '> initialize protocol (BB84 EXT)',
      '> awaiting registration...',
      '> ACK: Alice connected (ID: 0x9F3A)',
      '> ACK: Bob connected (ID: 0x1C4B)',
      '> channel established: quantum-link-01',
      '> enforcing bell test constraints...',
      '> bell test: PASS (S=2.78 > 2.0)',
      '> state fidelities: nominal (F=0.998)',
      '> session authorized: QDS SIGN ACCEPT'
    ],
    aliceLogs: [
      '> seq gen start()',
      '> bases: [+, x, +, x, x, +, x, ...]',
      '> bits: [1, 0, 1, 1, 0, 1, 0, ...]',
      '> transmitting photons (n=1024)',
      '> stream tx: 45% complete',
      '> stream tx: 89% complete',
      '> stream tx: complete',
      '> awaiting basis reconciliation...',
      '> basis sift match: 512 bits reconciled'
    ],
    bobLogs: [
      '> listener active(port: 9091)',
      '> measuring incoming stream...',
      '> rand bases: [x, x, +, x, +, x, +, ...]',
      '> capture: 32% complete',
      '> capture: 75% complete',
      '> capture: 1024 photons received',
      '> sending basis log to arbitrator()',
      '> generating sifted key()',
      '> key material ready: 256 bits entropy'
    ],
    eveLogs: [
      '> probe standby(target: quantum-link-01)',
      '> sniffing optical dark fiber...',
      '> zero polarization collapse detected',
      '> signal below ambient noise floor',
      '> no intercept vector available',
      '> probe idle: 0 bytes exfiltrated'
    ]
  },
  mitm: {
    id: 'mitm',
    name: 'MitM Attack',
    qber: 0.142,
    qberLabel: 'Current: 0.14',
    chsh: 1.94,
    chshLabel: 'S = 1.94',
    keyRate: '1.2 KBPS',
    siftingEff: '49.6%',
    securityStatus: 'COMPROMISED',
    interventionActive: true,
    interventionText: 'INTERVENTION ACTIVE',
    rawPacketDumps: generateMockPackets(true),
    arbitratorLogs: [
      '> initialize protocol (BB84 EXT)',
      '> awaiting registration...',
      '> ACK: Alice connected (ID: 0x9F3A)',
      '> ACK: Bob connected (ID: 0x1C4B)',
      '> channel established: quantum-link-01',
      '> enforcing bell test constraints...',
      '> WARN: QBER 14.2% breached Hoeffding bound (0.11)',
      '> ERR: Bell correlation collapsed (S=1.94 < 2.0)',
      '> ABORT: Intercept-resend adversary detected'
    ],
    aliceLogs: [
      '> seq gen start()',
      '> bases: [+, x, +, x, x, +, x, ...]',
      '> bits: [1, 0, 1, 1, 0, 1, 0, ...]',
      '> transmitting photons (n=1024)',
      '> stream tx: 45% complete',
      '> stream tx: 89% complete',
      '> stream tx: complete',
      '> awaiting basis reconciliation...',
      '> ERR: Sift parity breach detected by arbitrator'
    ],
    bobLogs: [
      '> listener active(port: 9091)',
      '> measuring incoming stream...',
      '> rand bases: [x, x, +, x, +, x, +, ...]',
      '> capture: 32% complete',
      '> capture: 75% complete',
      '> capture: 1024 photons received',
      '> sending basis log to arbitrator()',
      '> generating sifted key()',
      '> ERR: Sifted key invalid (Phase collapse 14.2%)'
    ],
    eveLogs: [
      '> inject probe(target: quantum-link-01)',
      '> intercept-resend active',
      '> WARN: state collapse detected on bit 12',
      '> WARN: state collapse detected on bit 18',
      '> copying sifted fragments...',
      '> injecting forged photons(n=45)',
      '> ERR: Arbitrator probing anomaly.'
    ]
  },
  forgery: {
    id: 'forgery',
    name: 'Forgery Attack',
    qber: 0.185,
    qberLabel: 'Current: 0.185',
    chsh: 1.82,
    chshLabel: 'S = 1.82',
    keyRate: '0.8 KBPS',
    siftingEff: '42.1%',
    securityStatus: 'COMPROMISED',
    interventionActive: true,
    interventionText: 'FORGERY ACTIVE',
    rawPacketDumps: generateMockPackets(true),
    arbitratorLogs: [
      '> initialize protocol (BB84 EXT)',
      '> awaiting registration...',
      '> ACK: Alice connected (ID: 0x9F3A)',
      '> ACK: Bob connected (ID: 0x1C4B)',
      '> validating one-time-pad signature...',
      '> ERR: Hash pre-image collision mismatch',
      '> QBER spike: 18.5% across test bits',
      '> CHSH Bell violation S=1.82 (Classical)',
      '> REJECT: Forged signature rejected'
    ],
    aliceLogs: [
      '> seq gen start()',
      '> generating ephemeral signature tag()',
      '> state polarization: 45-DEG DIAGONAL',
      '> transmitting photons (n=1024)',
      '> stream tx: complete',
      '> ERR: Foreign basis replacement detected',
      '> aborting key exchange()'
    ],
    bobLogs: [
      '> listener active(port: 9091)',
      '> measuring incoming stream...',
      '> capture: 1024 photons received',
      '> testing mac integrity...',
      '> ERR: Signature verification failed (Bit-flip delta 18.5%)',
      '> channel quarantine requested()'
    ],
    eveLogs: [
      '> signature injection mode: ACTIVE',
      '> intercepting alice document hash...',
      '> forging entangled bell state polarization...',
      '> injecting synthetic mac tag(len=256)',
      '> WARN: Arbitrator Bell test failed forgery verification',
      '> trace signature: detected by Hoeffding monitor'
    ]
  },
  replay: {
    id: 'replay',
    name: 'Replay Attack',
    qber: 0.084,
    qberLabel: 'Current: 0.084',
    chsh: 1.98,
    chshLabel: 'S = 1.98',
    keyRate: '1.4 KBPS',
    siftingEff: '47.8%',
    securityStatus: 'COMPROMISED',
    interventionActive: true,
    interventionText: 'REPLAY DETECTED',
    rawPacketDumps: generateMockPackets(true),
    arbitratorLogs: [
      '> initialize protocol (BB84 EXT)',
      '> checking session nonce cache...',
      '> ERR: Nonce 0x77E120A previously consumed in Session QDS-8812',
      '> timestamp skew: +4.82s (Tolerance: 0.10s)',
      '> bell test: S=1.98 (Stale entanglement)',
      '> REJECT: Stale payload replay detected'
    ],
    aliceLogs: [
      '> seq gen start()',
      '> nonce generated: 0x99482A1B',
      '> transmitting photons (n=1024)',
      '> stream tx: complete',
      '> WARN: Duplicate session handshake acknowledged from wire'
    ],
    bobLogs: [
      '> listener active(port: 9091)',
      '> checking replay window...',
      '> capture: 1024 photons received',
      '> ERR: Epoch timestamp outside validity window',
      '> discarding replayed sift buffer()'
    ],
    eveLogs: [
      '> replay buffer playback: ACTIVE',
      '> retransmitting cached qubits(session epoch=t-4.8s)',
      '> injecting recorded photons(n=1024)',
      '> ERR: Arbitrator nonce cache rejected duplicated sequence',
      '> replay attempt blocked()'
    ]
  },
  noise: {
    id: 'noise',
    name: 'Channel Noise',
    qber: 0.098,
    qberLabel: 'Current: 0.098',
    chsh: 2.12,
    chshLabel: 'S = 2.12',
    keyRate: '1.6 KBPS',
    siftingEff: '44.3%',
    securityStatus: 'DEGRADED',
    interventionActive: false,
    interventionText: 'THERMAL DRIFT',
    rawPacketDumps: generateMockPackets(false),
    arbitratorLogs: [
      '> initialize protocol (BB84 EXT)',
      '> evaluating dark fiber attenuation...',
      '> fiber loss: 0.48 dB/km (Elevated)',
      '> QBER: 9.8% (Near threshold 11.0%)',
      '> CHSH: 2.12 (Quantum state preserved)',
      '> applying cascade error correction...',
      '> channel status: DEGRADED OPERATIONAL'
    ],
    aliceLogs: [
      '> seq gen start()',
      '> laser phase drift: 0.14 rad',
      '> transmitting photons (n=1024)',
      '> stream tx: complete',
      '> cascade parity exchange: in progress'
    ],
    bobLogs: [
      '> listener active(port: 9091)',
      '> measuring incoming stream...',
      '> detector dark counts: 18 cps (Thermal)',
      '> capture: 1024 photons received',
      '> performing privacy amplification()'
    ],
    eveLogs: [
      '> probe standby(target: quantum-link-01)',
      '> measuring ambient thermal fluctuations...',
      '> high fiber dispersion detected',
      '> zero intentional eavesdropping',
      '> passive noise characterization only'
    ]
  },
  pns: {
    id: 'pns',
    name: 'PNS Attack',
    qber: 0.062,
    qberLabel: 'Current: 0.062',
    chsh: 2.05,
    chshLabel: 'S = 2.05',
    keyRate: '1.1 KBPS',
    siftingEff: '41.2%',
    securityStatus: 'COMPROMISED',
    interventionActive: true,
    interventionText: 'PNS SPLIT ACTIVE',
    rawPacketDumps: generateMockPackets(true),
    arbitratorLogs: [
      '> initialize protocol (BB84 EXT + Decoy)',
      '> analyzing decoy state yields...',
      '> signal pulse yield: Y signal = 0.42',
      '> decoy pulse yield: Y decoy = 0.18',
      '> ERR: Decoy statistic discrepancy detected',
      '> multi photon pulse splitting detected',
      '> ABORT: Photon Number Splitting (PNS) attack'
    ],
    aliceLogs: [
      '> seq gen start()',
      '> interleaving decoy states (μ=0.5, ν=0.1)',
      '> transmitting photons (n=1024)',
      '> stream tx: complete',
      '> awaiting decoy yield estimation...'
    ],
    bobLogs: [
      '> listener active(port: 9091)',
      '> measuring incoming stream...',
      '> capture: 1024 photons received',
      '> sending decoy counts to arbitrator()',
      '> ERR: Arbitrator aborted due to yield mismatch'
    ],
    eveLogs: [
      '> beam splitter tap: ACTIVE',
      '> filtering multi photon pulses(n > 1)...',
      '> splitting second photon into quantum memory',
      '> transmitting single photon to bob',
      '> ERR: Decoy state verification caught yield anomaly'
    ]
  }
};

interface AttackSandboxProps {
  onNavigateHome?: () => void;
  onNavigateDemonstration?: () => void;
  onNavigateMonitoring?: () => void;
}

export const AttackSandboxPage: React.FC<AttackSandboxProps> = ({
  onNavigateHome,
  onNavigateDemonstration,
  onNavigateMonitoring,
}) => {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('clean');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationPhase, setSimulationPhase] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showNotificationsPopover, setShowNotificationsPopover] = useState<boolean>(false);
  const [showUserProfilePopover, setShowUserProfilePopover] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inspector Modals
  const [selectedTerminalModal, setSelectedTerminalModal] = useState<{
    title: string;
    node: string;
    logs: string[];
  } | null>(null);
  const [showHoeffdingModal, setShowHoeffdingModal] = useState<boolean>(false);
  const [showChshModal, setShowChshModal] = useState<boolean>(false);

  // Customizable Sandbox Parameter Settings
  const [hoeffdingAlpha, setHoeffdingAlpha] = useState<number>(0.001);
  const [photonBatchSize, setPhotonBatchSize] = useState<number>(1024);
  const [fiberNoiseDb, setFiberNoiseDb] = useState<number>(0.18);

  const scenario = ATTACK_SCENARIOS[selectedScenarioKey] || ATTACK_SCENARIOS.clean;

  // Real-time line streaming animation for terminals
  const [visibleLinesCount, setVisibleLinesCount] = useState<number>(scenario.arbitratorLogs.length);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectScenario = (key: string) => {
    setSelectedScenarioKey(key);
    setVisibleLinesCount(0);
    setIsSimulating(true);
    setSimulationPhase('INITIALIZING PROTOCOL...');

    const chosen = ATTACK_SCENARIOS[key];
    const totalLines = chosen.arbitratorLogs.length;
    let current = 0;

    // Trigger live FastAPI backend REST API attack injection endpoints (/api/v1/attacks/*)
    apiClient.injectAttack(key).catch(() => null);
    apiClient.runWorkflow({
      attack_type: key,
      is_eve_active: chosen.securityStatus !== 'SECURE',
      document_name: `${key}_attack_probe.sig`,
      file_size_kb: 64.0
    }).catch(() => null);

    const interval = setInterval(() => {
      current += 1;
      setVisibleLinesCount(current);
      if (current === 2) setSimulationPhase('TRANSMITTING PHOTONS...');
      if (current === 5) setSimulationPhase('EVALUATING BELL TEST...');
      if (current >= totalLines) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationPhase('');

        if (chosen.securityStatus === 'SECURE') {
          showToast('✓ Handshake verified: Zero eavesdropping detected. QDS signature ACCEPT.');
          sentinelService.pushAttackIncident(key, chosen.name, chosen.qber, chosen.chsh, chosen.securityStatus, chosen.arbitratorLogs);
        } else {
          showToast(`⚠ Threat Detected: ${chosen.name} flagged. Handshake REJECTED.`);
          sentinelService.pushAttackIncident(key, chosen.name, chosen.qber, chosen.chsh, chosen.securityStatus, chosen.arbitratorLogs);
        }
      }
    }, 120);
  };

  const handleInitiateHandshake = () => {
    setVisibleLinesCount(0);
    setIsSimulating(true);
    setSimulationPhase('DISTRIBUTING PHOTONS (N=' + photonBatchSize + ')...');

    // Trigger live FastAPI backend REST API attack injection endpoints (/api/v1/attacks/*)
    apiClient.injectAttack(selectedScenarioKey).catch(() => null);
    apiClient.runWorkflow({
      attack_type: selectedScenarioKey,
      is_eve_active: scenario.securityStatus !== 'SECURE',
      document_name: `${selectedScenarioKey}_attack_probe.sig`,
      file_size_kb: 64.0
    }).catch(() => null);

    const totalLines = scenario.arbitratorLogs.length;
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setVisibleLinesCount(current);
      if (current === 3) setSimulationPhase('RECONCILING MEASUREMENT BASES...');
      if (current === 6) setSimulationPhase('CALCULATING CHSH BELL INEQUALITY...');
      if (current >= totalLines) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationPhase('');

        if (scenario.securityStatus === 'SECURE') {
          showToast('✓ Handshake verified: Zero eavesdropping detected. QDS signature ACCEPT.');
          sentinelService.pushAttackIncident(selectedScenarioKey, scenario.name, scenario.qber, scenario.chsh, scenario.securityStatus, scenario.arbitratorLogs);
        } else {
          showToast(`⚠ Security Breach: ${scenario.name} detected. Handshake REJECTED.`);
          sentinelService.pushAttackIncident(selectedScenarioKey, scenario.name, scenario.qber, scenario.chsh, scenario.securityStatus, scenario.arbitratorLogs);
        }
      }
    }, 140);
  };

  const handleCopyTerminalLogs = (title: string, logs: string[]) => {
    navigator.clipboard.writeText(logs.join('\n'));
    showToast(`Copied ${title} logs to clipboard.`);
  };

  useEffect(() => {
    setVisibleLinesCount(scenario.arbitratorLogs.length);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#FBF8FA] overflow-hidden select-none font-sans relative">
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#091426] text-white px-4 py-2 rounded-[2px] shadow-2xl font-mono text-[11px] flex items-center gap-2 border border-[#334155] animate-fade-in">
          <Check className="w-3.5 h-3.5 text-[#34D399]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. TOP BRAND NAVIGATION BAR ─── */}
      <header className="bg-[#FFFFFF] border-b border-[#E2E8F0] h-14 w-full flex items-center justify-between px-6 shrink-0 z-40 relative">
        {/* Left: Brand Logo & Title */}
        <div
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              window.open('/home', '_blank');
            } else if (onNavigateHome) {
              onNavigateHome();
            } else {
              window.location.href = '/home';
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity z-10"
          title="Return to Central Gateway Hub (Ctrl+Click to open in new tab)"
        >
          <div className="relative flex items-center justify-center text-[#091426]">
            <Shield className="w-5 h-5" strokeWidth={2.2} />
            <span className="absolute w-1.5 h-1.5 bg-[#091426] rounded-full top-[8.5px]" />
          </div>
          <span className="font-bold text-[#091426] tracking-tight text-[16px] font-sans">
            QDS SENTINEL
          </span>
        </div>

        {/* Center: Active Blue Tab */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="h-full flex items-center border-b-2 border-[#0058BE] text-[#0058BE] px-6 font-medium text-[15px] pointer-events-auto cursor-pointer"
          >
            ATTACK SANDBOX
          </div>
        </div>

        {/* Right: Settings, Notification Bell & User Avatar */}
        <div className="flex items-center gap-3 z-10 relative">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 flex items-center justify-center text-[#45474C] hover:text-[#091426] transition-colors relative cursor-pointer rounded hover:bg-[#F6F3F5]"
            title="Attack Sandbox Settings & Physical Bounds Configuration"
          >
            <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>

          <div className="relative">
            <button 
              onClick={() => { setShowNotificationsPopover(!showNotificationsPopover); setShowUserProfilePopover(false); }}
              className="w-8 h-8 flex items-center justify-center text-[#45474C] hover:text-[#091426] transition-colors relative cursor-pointer rounded hover:bg-[#F6F3F5]"
              title="Threat Notifications & Adversarial Intercepts"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {scenario.securityStatus === 'COMPROMISED' && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#BA1A1A] animate-ping" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotificationsPopover && (
              <div className="absolute right-0 top-10 w-72 bg-white border border-[#E2E8F0] shadow-xl rounded-[2px] z-50 p-3.5 font-mono text-[11px] animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                  <span className="font-bold text-[#091426]">ATTACK ALERT FEED</span>
                  <button onClick={() => setShowNotificationsPopover(false)} className="text-[#75777D] hover:text-black">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="py-2 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#BA1A1A]" />
                    <span className="text-[#BA1A1A] font-bold">{scenario.name}</span>
                  </div>
                  <div className="text-[#475467] text-[10.5px]">Status: <strong>{scenario.securityStatus}</strong></div>
                  <div className="text-[#475467] text-[10.5px]">QBER: {(scenario.qber * 100).toFixed(1)}% | CHSH: {scenario.chsh}</div>
                  <button
                    onClick={() => {
                      setShowNotificationsPopover(false);
                      if (onNavigateMonitoring) onNavigateMonitoring();
                      else window.location.href = '/monitoring';
                    }}
                    className="w-full mt-2 py-1.5 bg-[#091426] text-white text-[10px] font-bold uppercase rounded-[2px] transition-colors"
                  >
                    View in SOC Incident Center
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => { setShowUserProfilePopover(!showUserProfilePopover); setShowNotificationsPopover(false); }}
              className="w-8 h-8 rounded-full bg-[#F6F3F5] border border-[#E2E8F0] flex items-center justify-center text-[#45474C] hover:text-[#091426] transition-colors cursor-pointer"
              title="Operator Identity & Node Clearance"
            >
              <User className="w-[16px] h-[16px]" strokeWidth={1.8} />
            </button>

            {/* User Profile Popover */}
            {showUserProfilePopover && (
              <div className="absolute right-0 top-10 w-64 bg-white border border-[#E2E8F0] shadow-xl rounded-[2px] z-50 p-3.5 font-mono text-[11px] animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                  <span className="font-bold text-[#091426]">RED TEAM OPERATOR</span>
                  <button onClick={() => setShowUserProfilePopover(false)} className="text-[#75777D] hover:text-black">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="py-2.5 space-y-1.5 text-[#475467] text-[10.5px]">
                  <div>Node: <strong>EVE-SANDBOX-01</strong></div>
                  <div>Protocol: <strong>BB84 + Decoy State</strong></div>
                  <div>Batch: <strong>{photonBatchSize} Photons</strong></div>
                  <div>Clearance: <strong className="text-[#0058BE]">DEFENSE-LEVEL-4</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── 2. MAIN 3-COLUMN LAYOUT (MATCHES REFERENCE IMAGE EXACTLY) ─── */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* ─── COLUMN 1: ATTACK SCENARIOS (LEFT PANEL ~230px) ─── */}
        <aside className="w-[230px] shrink-0 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="font-mono text-[10.5px] font-bold text-[#75777D] uppercase tracking-widest block">
              ATTACK SCENARIOS
            </span>

            {/* Scenario Radio List */}
            <div className="space-y-2">
              {[
                { key: 'clean', label: 'Clean Signature' },
                { key: 'mitm', label: 'MitM Attack' },
                { key: 'forgery', label: 'Forgery Attack' },
                { key: 'replay', label: 'Replay Attack' },
                { key: 'noise', label: 'Channel Noise' },
                { key: 'pns', label: 'PNS Attack' },
              ].map((item) => {
                const isSelected = selectedScenarioKey === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => handleSelectScenario(item.key)}
                    className={`px-3.5 py-2.5 bg-[#FFFFFF] border rounded-[2px] flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#0058BE] shadow-sm ring-1 ring-[#0058BE]/20'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {/* Radio Indicator */}
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#0058BE]' : 'border-[#CBD5E1]'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-[#0058BE]" />
                      )}
                    </div>

                    <span className={`font-mono text-[12px] ${
                      isSelected ? 'font-bold text-[#091426]' : 'text-[#45474C]'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Full-Width Action Button */}
          <div className="space-y-2">
            {simulationPhase && (
              <div className="text-[9.5px] font-mono text-[#0058BE] text-center font-bold tracking-wider animate-pulse truncate">
                {simulationPhase}
              </div>
            )}
            <button
              onClick={handleInitiateHandshake}
              disabled={isSimulating}
              className="w-full py-3 bg-[#091426] hover:bg-[#1E293B] active:bg-[#000000] text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer disabled:opacity-60 shadow-sm flex items-center justify-center gap-2"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <span>INITIATE HANDSHAKE</span>
              )}
            </button>
          </div>
        </aside>

        {/* ─── COLUMN 2: 2x2 TERMINAL CONSOLE GRID (CENTER) ─── */}
        <section className="flex-1 grid grid-cols-2 grid-rows-2 gap-5 min-w-0">
          {/* Terminal 1: Top-Left (ARBITRATOR.SYS) */}
          <div className="bg-[#0C1322] border border-[#E2E8F0] rounded-[2px] flex flex-col overflow-hidden shadow-sm font-mono group relative">
            {/* Terminal Header */}
            <div className="bg-[#E5E7EB] border-b border-[#D1D5DB] px-3.5 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0058BE]" />
                <span className="text-[11px] font-bold text-[#091426] uppercase tracking-wider">
                  ARBITRATOR.SYS
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleCopyTerminalLogs('ARBITRATOR.SYS', scenario.arbitratorLogs)}
                  className="text-[#475467] hover:text-[#091426] cursor-pointer"
                  title="Copy Arbitrator Logs"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setSelectedTerminalModal({ title: 'ARBITRATOR.SYS (CENTRAL ARBITRATOR LOGS)', node: 'Arbitrator Hub', logs: scenario.arbitratorLogs })}
                  className="text-[#475467] hover:text-[#091426] cursor-pointer"
                  title="Expand Full Terminal Stream"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            {/* Terminal Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-1 text-[11px] leading-relaxed text-[#94A3B8]">
              {scenario.arbitratorLogs.slice(0, visibleLinesCount).map((line, idx) => {
                if (line.includes('ACK:')) return <div key={idx} className="text-[#10B981]">{line}</div>;
                if (line.includes('ERR:') || line.includes('ABORT:') || line.includes('REJECT:')) return <div key={idx} className="text-[#EF4444] font-bold">{line}</div>;
                if (line.includes('WARN:')) return <div key={idx} className="text-[#F59E0B]">{line}</div>;
                if (line.includes('PASS') || line.includes('ACCEPT')) return <div key={idx} className="text-[#10B981] font-bold">{line}</div>;
                return <div key={idx}>{line}</div>;
              })}
              <div className="text-[#38BDF8] animate-pulse">&gt; _</div>
            </div>
          </div>

          {/* Terminal 2: Top-Right (ALICE NODE) */}
          <div className="bg-[#0C1322] border border-[#E2E8F0] rounded-[2px] flex flex-col overflow-hidden shadow-sm font-mono group relative">
            {/* Terminal Header */}
            <div className="bg-[#E5E7EB] border-b border-[#D1D5DB] px-3.5 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[11px] font-bold text-[#091426] uppercase tracking-wider">
                  ALICE NODE
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleCopyTerminalLogs('ALICE NODE', scenario.aliceLogs)}
                  className="text-[#475467] hover:text-[#091426] cursor-pointer"
                  title="Copy Alice Logs"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setSelectedTerminalModal({ title: 'ALICE NODE (TRANSMITTER COPROCESSOR)', node: 'Alice TX-99', logs: scenario.aliceLogs })}
                  className="text-[#475467] hover:text-[#091426] cursor-pointer"
                  title="Expand Full Terminal Stream"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            {/* Terminal Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-1 text-[11px] leading-relaxed text-[#94A3B8]">
              {scenario.aliceLogs.slice(0, visibleLinesCount).map((line, idx) => {
                if (line.includes('stream_tx: complete') || line.includes('match:')) return <div key={idx} className="text-[#10B981]">{line}</div>;
                if (line.includes('stream_tx:')) return <div key={idx} className="text-[#64748B]">{line}</div>;
                if (line.includes('ERR:') || line.includes('aborting')) return <div key={idx} className="text-[#EF4444]">{line}</div>;
                return <div key={idx}>{line}</div>;
              })}
              <div className="text-[#38BDF8] animate-pulse">&gt; _</div>
            </div>
          </div>

          {/* Terminal 3: Bottom-Left (BOB NODE) */}
          <div className="bg-[#0C1322] border border-[#E2E8F0] rounded-[2px] flex flex-col overflow-hidden shadow-sm font-mono group relative">
            {/* Terminal Header */}
            <div className="bg-[#E5E7EB] border-b border-[#D1D5DB] px-3.5 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[11px] font-bold text-[#091426] uppercase tracking-wider">
                  BOB NODE
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleCopyTerminalLogs('BOB NODE', scenario.bobLogs)}
                  className="text-[#475467] hover:text-[#091426] cursor-pointer"
                  title="Copy Bob Logs"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setSelectedTerminalModal({ title: 'BOB NODE (RECEIVER & SIFTER)', node: 'Bob RX-01', logs: scenario.bobLogs })}
                  className="text-[#475467] hover:text-[#091426] cursor-pointer"
                  title="Expand Full Terminal Stream"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            {/* Terminal Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-1 text-[11px] leading-relaxed text-[#94A3B8]">
              {scenario.bobLogs.slice(0, visibleLinesCount).map((line, idx) => {
                if (line.includes('photons received') || line.includes('ready:')) return <div key={idx} className="text-[#10B981]">{line}</div>;
                if (line.includes('capture:')) return <div key={idx} className="text-[#64748B]">{line}</div>;
                if (line.includes('ERR:')) return <div key={idx} className="text-[#EF4444]">{line}</div>;
                return <div key={idx}>{line}</div>;
              })}
              <div className="text-[#38BDF8] animate-pulse">&gt; _</div>
            </div>
          </div>

          {/* Terminal 4: Bottom-Right (EVE INTERCEPT) */}
          <div className="bg-[#0C1322] border border-[#E2E8F0] rounded-[2px] flex flex-col overflow-hidden shadow-sm font-mono relative group">
            {/* Terminal Header */}
            <div className="bg-[#E5E7EB] border-b border-[#D1D5DB] px-3.5 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="text-[11px] font-bold text-[#091426] uppercase tracking-wider">
                  EVE INTERCEPT
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleCopyTerminalLogs('EVE INTERCEPT', scenario.eveLogs)}
                  className="text-[#475467] hover:text-[#091426] cursor-pointer"
                  title="Copy Eve Logs"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setSelectedTerminalModal({ title: 'EVE INTERCEPT (ADVERSARIAL PROBE)', node: 'Eve Probe Link', logs: scenario.eveLogs })}
                  className="text-[#475467] hover:text-[#091426] cursor-pointer"
                  title="Expand Full Terminal Stream"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            {/* Terminal Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-1 text-[11px] leading-relaxed text-[#94A3B8]">
              {scenario.eveLogs.slice(0, visibleLinesCount).map((line, idx) => {
                if (line.includes('WARN:')) return <div key={idx} className="text-[#F59E0B]">{line}</div>;
                if (line.includes('ERR:')) return <div key={idx} className="text-[#EF4444] font-bold">{line}</div>;
                return <div key={idx}>{line}</div>;
              })}
              <div className="text-[#38BDF8] animate-pulse">&gt; _</div>
            </div>

            {/* Bottom-Right Badge inside Terminal */}
            {scenario.interventionActive && (
              <div className="absolute bottom-3 right-3 bg-[#991B1B] text-white px-2.5 py-1 rounded-[1px] font-mono text-[9px] font-bold uppercase tracking-widest shadow-md">
                {scenario.interventionText}
              </div>
            )}
          </div>
        </section>

        {/* ─── COLUMN 3: TELEMETRY & SPARK CHARTS (RIGHT PANEL ~270px) ─── */}
        <aside className="w-[270px] shrink-0 space-y-4 font-mono">
          <span className="text-[10.5px] font-bold text-[#75777D] uppercase tracking-widest block">
            TELEMETRY
          </span>

          {/* Chart Card 1: QBER VS HOEFFDING */}
          <div 
            onClick={() => setShowHoeffdingModal(true)}
            className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#0058BE] rounded-[2px] overflow-hidden shadow-sm cursor-pointer transition-colors"
            title="Click to view Hoeffding Statistical Bound derivation"
          >
            <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-3 h-8 flex items-center justify-between shrink-0">
              <span className="text-[10.5px] font-bold text-[#091426] uppercase tracking-wider truncate">
                QBER VS HOEFFDING
              </span>
              <Info className="w-3 h-3 text-[#75777D]" />
            </div>

            {/* Chart Area */}
            <div className="p-3 bg-[#FAFAFA] relative h-32 flex flex-col justify-between select-none">
              {/* Top Axis Labels */}
              <div className="flex justify-between items-center text-[9.5px] text-[#94A3B8] z-10 leading-none">
                <span>1.0</span>
                <span className="text-[#DC2626] font-bold">0.11 (Threshold)</span>
              </div>

              {/* SVG Sparkline Graphic */}
              <svg className="absolute inset-0 w-full h-full p-3 pointer-events-none" viewBox="0 0 240 100" preserveAspectRatio="none">
                {/* Background Grid Lines */}
                <line x1="0" y1="20" x2="240" y2="20" stroke="#E2E8F0" strokeWidth="1" />
                <line x1="0" y1="45" x2="240" y2="45" stroke="#E2E8F0" strokeWidth="1" />
                <line x1="0" y1="70" x2="240" y2="70" stroke="#E2E8F0" strokeWidth="1" />

                {/* Threshold Line (Dashed Red at y = 45) */}
                <line x1="0" y1="45" x2="240" y2="45" stroke="#DC2626" strokeWidth="1.2" strokeDasharray="3 3" />

                {/* Dynamic QBER Curve */}
                {selectedScenarioKey === 'clean' ? (
                  <path
                    d="M 5 86 Q 60 84, 120 88 T 235 85"
                    fill="none"
                    stroke="#0058BE"
                    strokeWidth="2"
                  />
                ) : (
                  <path
                    d="M 5 84 Q 60 80, 110 82 T 180 44 L 235 32"
                    fill="none"
                    stroke="#0058BE"
                    strokeWidth="2"
                  />
                )}
              </svg>

              {/* Bottom Axis Labels */}
              <div className="flex justify-between items-end text-[9.5px] z-10 leading-none">
                <span className="text-[#94A3B8]">0.0</span>
                <span className={`font-bold ${scenario.qber > 0.11 ? 'text-[#0058BE]' : 'text-[#065F46]'}`}>
                  {scenario.qberLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Chart Card 2: CHSH BELL VIOLATION */}
          <div 
            onClick={() => setShowChshModal(true)}
            className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#0058BE] rounded-[2px] overflow-hidden shadow-sm cursor-pointer transition-colors"
            title="Click to view CHSH Bell Inequality derivation"
          >
            <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-3 h-8 flex items-center justify-between shrink-0">
              <span className="text-[10.5px] font-bold text-[#091426] uppercase tracking-wider truncate">
                CHSH BELL VIOLATION
              </span>
              <span className="text-[9px] text-[#75777D] font-mono shrink-0">
                Quantum &ge; 2.0
              </span>
            </div>

            {/* Chart Area */}
            <div className="p-3 bg-[#FAFAFA] relative h-32 flex flex-col justify-between select-none">
              {/* Top Axis Labels */}
              <div className="flex justify-between items-center text-[9.5px] text-[#94A3B8] z-10 leading-none">
                <span>S=2.82</span>
              </div>

              {/* SVG Sparkline Graphic */}
              <svg className="absolute inset-0 w-full h-full p-3 pointer-events-none" viewBox="0 0 240 100" preserveAspectRatio="none">
                {/* Background Grid Lines */}
                <line x1="0" y1="20" x2="240" y2="20" stroke="#E2E8F0" strokeWidth="1" />
                <line x1="0" y1="45" x2="240" y2="45" stroke="#E2E8F0" strokeWidth="1" />
                <line x1="0" y1="70" x2="240" y2="70" stroke="#E2E8F0" strokeWidth="1" />

                {/* Classical Limit Line (Dashed Gray at y = 65) */}
                <line x1="0" y1="65" x2="240" y2="65" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="3 3" />

                {/* Bell Correlation Curve */}
                {selectedScenarioKey === 'clean' ? (
                  <path
                    d="M 5 28 Q 60 25, 120 30 T 235 27"
                    fill="none"
                    stroke="#065F46"
                    strokeWidth="2"
                  />
                ) : (
                  <path
                    d="M 5 62 Q 60 42, 120 38 T 235 64"
                    fill="none"
                    stroke="#C2540A"
                    strokeWidth="2"
                  />
                )}
              </svg>

              {/* Bottom Axis Labels */}
              <div className="flex justify-between items-end text-[9.5px] z-10 leading-none">
                <span className="text-[#64748B]">Classical limit (S=2.0)</span>
                <span className={`font-bold ${scenario.chsh < 2.0 ? 'text-[#BA1A1A]' : 'text-[#065F46]'}`}>
                  {scenario.chshLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Metric Summary Box */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-3.5 space-y-2 text-[11px] shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[#75777D]">KEY RATE:</span>
              <span className="font-bold text-[#091426]">{scenario.keyRate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#75777D]">SIFTING EFF:</span>
              <span className="font-bold text-[#091426]">{scenario.siftingEff}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[#E2E8F0]">
              <span className="text-[#75777D]">SECURITY STATUS:</span>
              <span className={`font-bold ${
                scenario.securityStatus === 'SECURE' ? 'text-[#065F46]' : 'text-[#BA1A1A]'
              }`}>
                {scenario.securityStatus}
              </span>
            </div>
          </div>
        </aside>
      </main>

      {/* ─── 1. FULL TERMINAL EXPAND MODAL ─── */}
      {selectedTerminalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedTerminalModal(null)}>
          <div className="bg-[#0C1322] border border-[#334155] rounded-[2px] shadow-2xl w-full max-w-2xl overflow-hidden font-mono" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-[#1E293B] flex items-center justify-between bg-[#0B1120]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#0058BE]" />
                <span className="text-[12px] font-bold text-white uppercase tracking-wider">
                  {selectedTerminalModal.title}
                </span>
              </div>
              <button onClick={() => setSelectedTerminalModal(null)} className="text-[#94A3B8] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-[#060A14] border border-[#1E293B] p-4 rounded-[2px] max-h-72 overflow-y-auto space-y-1 text-[11.5px] leading-relaxed text-[#94A3B8]">
                {selectedTerminalModal.logs.map((ln, idx) => (
                  <div key={idx} className={ln.includes('ACK:') || ln.includes('PASS') ? 'text-[#10B981]' : ln.includes('ERR:') ? 'text-[#EF4444] font-bold' : ln.includes('WARN:') ? 'text-[#F59E0B]' : 'text-[#E2E8F0]'}>
                    {ln}
                  </div>
                ))}
              </div>

              {/* Raw Qubit State Table */}
              <div className="border border-[#1E293B] rounded-[2px] overflow-hidden">
                <div className="bg-[#0B1120] px-3 py-1.5 text-[10.5px] text-[#94A3B8] font-bold border-b border-[#1E293B]">
                  INTERCEPTED PHOTON CARRIER TRACE (TOP 6 TEST SAMPLES)
                </div>
                <table className="w-full text-left text-[10px] text-[#CBD5E1]">
                  <thead className="bg-[#0B1120] border-b border-[#1E293B] text-[#94A3B8]">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">ALICE BASIS</th>
                      <th className="p-2">BIT</th>
                      <th className="p-2">BOB BASIS</th>
                      <th className="p-2">POLARIZATION</th>
                      <th className="p-2">JITTER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {(scenario.rawPacketDumps || []).slice(0, 6).map(pkt => (
                      <tr key={pkt.qubitIndex} className="hover:bg-[#1E293B]/40">
                        <td className="p-2 font-bold text-white">#{pkt.qubitIndex}</td>
                        <td className="p-2 text-[#38BDF8]">{pkt.aliceBasis}</td>
                        <td className="p-2 font-bold">{pkt.aliceBit}</td>
                        <td className="p-2 text-[#38BDF8]">{pkt.bobBasis}</td>
                        <td className="p-2">{pkt.polarizationAngle}</td>
                        <td className="p-2 text-[#A7F3D0]">{pkt.phaseDriftPs} ps</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedTerminalModal(null)}
                  className="px-4 py-1.5 bg-[#0058BE] hover:bg-[#00479E] text-white text-[11px] font-bold uppercase rounded-[2px] cursor-pointer"
                >
                  Close Console
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. HOEFFDING BOUND INSPECTOR MODAL ─── */}
      {showHoeffdingModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowHoeffdingModal(false)}>
          <div className="bg-white border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-lg overflow-hidden font-sans" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0058BE]" />
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-widest text-[#091426]">
                  HOEFFDING STATISTICAL BOUND DERIVATION
                </span>
              </div>
              <button onClick={() => setShowHoeffdingModal(false)} className="text-[#75777D] hover:text-[#091426] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 font-mono text-[11px] text-[#475467] leading-relaxed">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[2px]">
                <div className="text-[12px] font-bold text-[#091426] mb-1">Inequality Formulation:</div>
                <div className="text-[#0058BE] font-bold">P(QBER - E[QBER] &ge; ε) &le; exp(-2 · N · ε²) &le; α</div>
              </div>
              <div className="space-y-1.5 divide-y divide-[#E2E8F0] pt-1 text-[11px]">
                <div className="pt-1.5 flex justify-between"><span>Sample Size N:</span><strong className="text-[#091426]">{photonBatchSize} bits</strong></div>
                <div className="pt-1.5 flex justify-between"><span>Confidence Bound α:</span><strong className="text-[#091426]">{hoeffdingAlpha} (99.9% certainty)</strong></div>
                <div className="pt-1.5 flex justify-between"><span>Allowable QBER Threshold:</span><strong className="text-[#0058BE]">11.0% (BB84 Decoy Limit)</strong></div>
                <div className="pt-1.5 flex justify-between"><span>Observed QBER ({scenario.name}):</span><strong className={scenario.qber > 0.11 ? 'text-[#BA1A1A]' : 'text-[#065F46]'}>{(scenario.qber * 100).toFixed(2)}%</strong></div>
              </div>
              <p className="text-[10.5px] text-[#75777D] pt-2">
                If the measured bit-error rate deviates above 11.0%, quantum entanglement fidelity is guaranteed to be compromised by an eavesdropper with &ge; 99.9% statistical certainty.
              </p>
              <button
                onClick={() => setShowHoeffdingModal(false)}
                className="w-full mt-2 py-2 bg-[#091426] text-white font-bold uppercase rounded-[2px] cursor-pointer text-[10.5px]"
              >
                Close Formulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. CHSH BELL TEST INSPECTOR MODAL ─── */}
      {showChshModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowChshModal(false)}>
          <div className="bg-white border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-lg overflow-hidden font-sans" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0058BE]" />
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-widest text-[#091426]">
                  CHSH BELL INEQUALITY CORRELATION
                </span>
              </div>
              <button onClick={() => setShowChshModal(false)} className="text-[#75777D] hover:text-[#091426] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 font-mono text-[11px] text-[#475467] leading-relaxed">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[2px]">
                <div className="text-[12px] font-bold text-[#091426] mb-1">Bell Parameter S Definition:</div>
                <div className="text-[#C2540A] font-bold">S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')|</div>
              </div>
              <div className="space-y-1.5 divide-y divide-[#E2E8F0] pt-1 text-[11px]">
                <div className="pt-1.5 flex justify-between"><span>Local Realism Limit (Classical):</span><strong className="text-[#64748B]">S &le; 2.000</strong></div>
                <div className="pt-1.5 flex justify-between"><span>Tsirelson Bound (Max Quantum):</span><strong className="text-[#0058BE]">S = 2√2 &asymp; 2.828</strong></div>
                <div className="pt-1.5 flex justify-between"><span>Observed Score ({scenario.name}):</span><strong className={scenario.chsh < 2.0 ? 'text-[#BA1A1A]' : 'text-[#065F46]'}>S = {scenario.chsh}</strong></div>
              </div>
              <p className="text-[10.5px] text-[#75777D] pt-2">
                Any intercept-and-resend attack introduces classical realism, collapsing S below 2.000 and exposing Eve to the arbitrator immediately.
              </p>
              <button
                onClick={() => setShowChshModal(false)}
                className="w-full mt-2 py-2 bg-[#091426] text-white font-bold uppercase rounded-[2px] cursor-pointer text-[10.5px]"
              >
                Close Bell Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. SETTINGS & PHYSICAL BOUNDS MODAL ─── */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-white border border-[#E2E8F0] rounded-[2px] shadow-2xl w-full max-w-md overflow-hidden font-sans" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F3F5]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0058BE]" />
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-widest text-[#091426]">
                  SANDBOX SECURITY BOUNDS SETTINGS
                </span>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-[#75777D] hover:text-[#091426] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 font-mono text-[11px] text-[#45474C]">
              {/* Setting 1: Batch Size */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Photon Batch Size (N):</span>
                  <strong className="text-[#0058BE]">{photonBatchSize} Qubits</strong>
                </div>
                <div className="flex gap-2 pt-1">
                  {[512, 1024, 2048, 4096].map(sz => (
                    <button
                      key={sz}
                      onClick={() => { setPhotonBatchSize(sz); showToast(`Batch size updated to ${sz} qubits.`); }}
                      className={`flex-1 py-1 text-[10px] font-bold border rounded-[2px] cursor-pointer ${
                        photonBatchSize === sz ? 'bg-[#0058BE] text-white border-[#0058BE]' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#091426]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting 2: Confidence Alpha */}
              <div className="space-y-1 pt-2 border-t border-[#E2E8F0]">
                <div className="flex justify-between">
                  <span>Confidence Level (α):</span>
                  <strong className="text-[#0058BE]">{hoeffdingAlpha}</strong>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.05"
                  step="0.001"
                  value={hoeffdingAlpha}
                  onChange={(e) => setHoeffdingAlpha(parseFloat(e.target.value))}
                  className="w-full accent-[#0058BE] cursor-pointer"
                />
              </div>

              {/* Setting 3: Dark Fiber Attenuation */}
              <div className="space-y-1 pt-2 border-t border-[#E2E8F0]">
                <div className="flex justify-between">
                  <span>Fiber Loss Model:</span>
                  <strong className="text-[#0058BE]">{fiberNoiseDb} dB/km</strong>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.60"
                  step="0.02"
                  value={fiberNoiseDb}
                  onChange={(e) => setFiberNoiseDb(parseFloat(e.target.value))}
                  className="w-full accent-[#0058BE] cursor-pointer"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  onClick={() => {
                    setPhotonBatchSize(1024);
                    setHoeffdingAlpha(0.001);
                    setFiberNoiseDb(0.18);
                    showToast('Sandbox parameters reset to default.');
                  }}
                  className="px-3 py-2 bg-[#F6F3F5] hover:bg-[#E2E8F0] text-[#091426] font-bold uppercase rounded-[2px] cursor-pointer text-[10px]"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-2 bg-[#091426] hover:bg-[#1E293B] text-white font-bold uppercase tracking-wider rounded-[2px] cursor-pointer text-[10.5px]"
                >
                  Apply &amp; Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
