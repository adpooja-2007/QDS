import React, { useState, useEffect, useRef } from 'react';
import { QuantumSession, SystemPerformance, SecurityIncident, TelemetryLog } from '../../types/sentinel';
import { sentinelService } from '../../services/sentinelService';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { Progress } from '../../components/ui/progress';
import { ButtonGroup, ButtonGroupSeparator } from '../../components/ui/button-group';

interface DemonstrationPageProps {
  activeSession?: QuantumSession;
  sessions?: QuantumSession[];
  incidents?: SecurityIncident[];
  telemetryLogs?: TelemetryLog[];
  performance?: SystemPerformance;
  onNavigateHome: () => void;
  onNavigateMonitoring: () => void;
  onGenerateSignature?: (docName: string, sizeKb: number, isEveActive?: boolean, attackType?: string) => Promise<any>;
}

interface NodeDetailsModalInfo {
  title: string;
  subtitle: string;
  role: string;
  metrics: { label: string; value: string }[];
  description: string;
}

interface Point {
  x: number;
  y: number;
}

export const DemonstrationPage: React.FC<DemonstrationPageProps> = ({
  activeSession,
  sessions = [],
  incidents = [],
  telemetryLogs = [],
  performance,
  onNavigateHome,
  onNavigateMonitoring,
  onGenerateSignature,
}) => {
  // Simulation State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isEavesdropperActive, setIsEavesdropperActive] = useState<boolean>(false);
  const [timeCounter, setTimeCounter] = useState<number>(0.045);
  const [executingLive, setExecutingLive] = useState<boolean>(false);
  const [photonProgress, setPhotonProgress] = useState<number>(0);
  const [activePulseIndex, setActivePulseIndex] = useState<number>(2); // 0 to 7

  // Helper to compute balanced, organized node positions matching the home geometry
  const getOrganizedPositions = (width: number, height: number): { [key: string]: Point } => {
    const centerY = Math.max(50, Math.floor((height - 130) / 2));
    const safeWidth = Math.max(600, width);
    return {
      alice: { x: Math.floor(safeWidth * 0.12), y: centerY },
      arbitrator: { x: Math.floor(safeWidth * 0.50 - 48), y: centerY },
      bob: { x: Math.floor(safeWidth * 0.88 - 88), y: centerY },
      eve: { x: Math.floor(safeWidth * 0.50 - 28), y: Math.max(25, centerY - 105) },
    };
  };

  // Draggable Node Positions initialized to organized layout
  const [nodes, setNodes] = useState<{ [key: string]: Point }>({
    alice: { x: 120, y: 90 },
    arbitrator: { x: 460, y: 90 },
    eve: { x: 480, y: 20 },
    bob: { x: 800, y: 90 },
  });

  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const userHasCustomLayoutRef = useRef<boolean>(false);

  // Guarantee organized layout on mount and window resize (only if user hasn't customized positions)
  useEffect(() => {
    const applyOrganizedLayout = () => {
      if (userHasCustomLayoutRef.current) return;
      if (canvasRef.current) {
        const { clientWidth, clientHeight } = canvasRef.current;
        if (clientWidth > 100 && clientHeight > 100) {
          setNodes(getOrganizedPositions(clientWidth, clientHeight));
        }
      }
    };

    const t = setTimeout(applyOrganizedLayout, 50);
    window.addEventListener('resize', applyOrganizedLayout);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', applyOrganizedLayout);
    };
  }, []);

  // Modals & Popovers
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserProfile, setShowUserProfile] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [activeNodeModal, setActiveNodeModal] = useState<NodeDetailsModalInfo | null>(null);
  const [selectedPulseModal, setSelectedPulseModal] = useState<any | null>(null);
  const [activePhaseInfoModal, setActivePhaseInfoModal] = useState<number | null>(null);
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  const [copiedKeyToast, setCopiedKeyToast] = useState<boolean>(false);
  const [liveSuccessToast, setLiveSuccessToast] = useState<boolean>(false);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState<boolean>(false);
  const [sessionForm, setSessionForm] = useState({
    documentName: 'defense_telemetry_manifest_09.sig',
    sizeKb: '128.0',
    scenario: 'CLEAN',
    numPairs: '50'
  });
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);
  const [sessionCreatedToast, setSessionCreatedToast] = useState<string | null>(null);

  // Settings
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [bellStatePurity, setBellStatePurity] = useState<string>('99.4%');
  const [chosenBasisPair, setChosenBasisPair] = useState<string>('{+, x}');

  const notifRef = useRef<HTMLDivElement>(null);
  const userProfileRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click or Escape key press
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
        setShowSettingsModal(false);
        setActiveNodeModal(null);
        setSelectedPulseModal(null);
        setActivePhaseInfoModal(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto-play timer & phase sequencer (Emits authentic telemetry exclusively when running)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(500, 2400 / simSpeed);
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev >= 6 ? 1 : prev + 1;
        sentinelService.pushDemonstrationEvent(next, isEavesdropperActive);
        return next;
      });
      setActivePulseIndex((prev) => (prev >= 7 ? 0 : prev + 1));
      setTimeCounter((t) => Number((t + 0.015 * simSpeed).toFixed(3)));
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, isEavesdropperActive]);

  // Smooth linear photon transmission loop
  useEffect(() => {
    let animationFrameId: number;
    const animatePhoton = () => {
      setPhotonProgress((prev) => {
        const next = prev + 0.008 * simSpeed;
        return next >= 1 ? 0 : next;
      });
      animationFrameId = requestAnimationFrame(animatePhoton);
    };

    animationFrameId = requestAnimationFrame(animatePhoton);
    return () => cancelAnimationFrame(animationFrameId);
  }, [simSpeed]);

  // Handle Dragging with Click Suppression (instant zero lag)
  const [hasMoved, setHasMoved] = useState<boolean>(false);
  const dragStartRef = useRef<Point>({ x: 0, y: 0 });

  const handleMouseDownNode = (e: React.MouseEvent, nodeKey: string) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentPos = nodes[nodeKey];
    setDraggingNode(nodeKey);
    setHasMoved(false);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setDragOffset({
      x: e.clientX - rect.left - currentPos.x,
      y: e.clientY - rect.top - currentPos.y,
    });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!draggingNode || !canvasRef.current) return;
    const dist = Math.hypot(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y);
    if (dist > 5) {
      setHasMoved(true);
      userHasCustomLayoutRef.current = true;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(rect.width - 160, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(20, Math.min(rect.height - 150, e.clientY - rect.top - dragOffset.y));

    setNodes((prev) => ({
      ...prev,
      [draggingNode]: { x: newX, y: newY },
    }));
  };

  const handleMouseUpCanvas = () => {
    setDraggingNode(null);
    setTimeout(() => setHasMoved(false), 100);
  };

  const handleRunLive = async () => {
    if (!onGenerateSignature) return;
    setExecutingLive(true);
    sentinelService.pushDemonstrationEvent(1, isEavesdropperActive, undefined, 'Live signature manifest compilation initiated.');
    try {
      await onGenerateSignature('qds_visualizer_manifest.sig', 128.0, isEavesdropperActive);
      setCurrentStep(6);
      setActivePulseIndex(7);
      sentinelService.pushDemonstrationEvent(6, isEavesdropperActive, undefined, 'Live signature verification completed on FastAPI core.');
      setLiveSuccessToast(true);
      setTimeout(() => setLiveSuccessToast(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setExecutingLive(false);
    }
  };

  const handleCreateNewSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingSession(true);
    try {
      const doc = sessionForm.documentName.trim() || 'qds_quantum_manifest.sig';
      const size = parseFloat(sessionForm.sizeKb) || 128.0;
      const isEve = sessionForm.scenario === 'EVE' || sessionForm.scenario === 'MITM';
      setIsEavesdropperActive(isEve);

      if (onGenerateSignature) {
        await onGenerateSignature(doc, size, isEve);
      } else {
        await sentinelService.createSessionAsync(doc, size, isEve);
      }

      // Sync into Monitoring Sessions channels so it reflects across /monitoring
      try {
        const cleanDoc = doc.replace(/\.[^/.]+$/, '').toUpperCase();
        const chanStatus = isEve ? 'DEGRADED' : 'STABLE';
        const fidelityType = isEve ? 'wave_dot' : 'sine_tick';
        const keyRateVal = isEve ? 112.4 : 320.5;
        const endpointName = `QNode-${cleanDoc.slice(0, 10)}`;

        apiClient.createSessionChannel({
          endpoint: endpointName,
          status: chanStatus,
          fidelity_type: fidelityType,
          key_rate: keyRateVal
        }).catch(() => null);

        const currentChansRaw = localStorage.getItem('qds_session_channels');
        let currentChans: any[] = [];
        if (currentChansRaw) {
          try { currentChans = JSON.parse(currentChansRaw); } catch {}
        }
        if (!Array.isArray(currentChans) || currentChans.length === 0) {
          currentChans = [
            { id: '01', endpoint: 'QNode-A-09', status: 'STABLE', statusColor: '#065F46', fidelity_type: 'sine_tick', keyRate: '245.8', duration: '04:12:33' },
            { id: '02', endpoint: 'QNode-F-22', status: 'DEGRADED', statusColor: '#C2540A', fidelity_type: 'wave_dot', keyRate: '112.4', duration: '01:45:10' },
            { id: '03', endpoint: 'Sat-Link-Alpha', status: 'STABLE', statusColor: '#065F46', fidelity_type: 'step_dip', keyRate: '450.1', duration: '12:05:44' },
          ];
        }
        const nextId = `${(currentChans.length + 1).toString().padStart(2, '0')}`;
        currentChans.push({
          id: nextId,
          endpoint: endpointName,
          status: chanStatus,
          statusColor: isEve ? '#C2540A' : '#065F46',
          fidelity_type: fidelityType,
          keyRate: keyRateVal.toFixed(1),
          duration: '00:00:01'
        });
        localStorage.setItem('qds_session_channels', JSON.stringify(currentChans));
        
        // Dispatch real-time live events to update Monitoring seamlessly without reload
        try {
          window.dispatchEvent(new CustomEvent('qds_session_created', { detail: currentChans }));
          window.dispatchEvent(new Event('storage'));
        } catch {}
      } catch (errSync) {
        console.warn('Could not sync session channel to monitoring store:', errSync);
      }

      setCurrentStep(1);
      setActivePulseIndex(0);
      setTimeCounter(0.000);
      setIsPlaying(true);
      sentinelService.pushDemonstrationEvent(1, isEve, undefined, `New Quantum Session initialized for [${doc}].`);
      
      setSessionCreatedToast(`Quantum Session created & active for ${doc}`);
      setTimeout(() => setSessionCreatedToast(null), 3500);
      setShowCreateSessionModal(false);
    } catch (err) {
      console.error('Failed to create session:', err);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleCopyPublicKey = () => {
    navigator.clipboard.writeText('0x8F92A1BC40E7D294B105F838E7902BA49C12879F3A4B29E8473D1A908E');
    setCopiedKeyToast(true);
    setTimeout(() => setCopiedKeyToast(false), 2000);
  };

  // Aggregate rejected / attack alerts
  const rejectedSessions = sessions.filter(
    (s) => (s.verdict?.verdict === 'REJECT' || s.verdict?.threat_detected || (s.attacks && s.attacks.length > 0)) && !clearedIds.includes(s.session_id)
  );
  const activeIncidents = incidents.filter((inc) => !clearedIds.includes(inc.id));
  const totalAlertsCount = rejectedSessions.length + activeIncidents.length;

  const handleClearAll = () => {
    const allIds = [...sessions.map((s) => s.session_id), ...incidents.map((i) => i.id)];
    setClearedIds(allIds);
  };

  // 6 Protocol Phases
  const phases = [
    { 
      id: 1, 
      name: 'EPR PREP', 
      title: 'Phase 1: Spontaneous Parametric Down-Conversion (SPDC)',
      statusLabel: 'Pumping BBO Crystal (λ=775nm)',
      description: 'The Arbitrator optical core pumps a non-linear BBO crystal with a 775nm laser to generate polarization-entangled photon pairs |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 at λ=1550nm telecom window.' 
    },
    { 
      id: 2, 
      name: 'DISTRIBUTION', 
      title: 'Phase 2: Entangled State Fiber Distribution',
      statusLabel: 'Fiber Photons In-Flight to Nodes',
      description: 'Photon A is routed via dark fiber Link 1 to Alice, while Photon B travels via dark fiber Link 2 to Bob. The continuous link integrity is monitored for channel noise and eavesdropping taps.' 
    },
    { 
      id: 3, 
      name: 'MEASUREMENT', 
      title: 'Phase 3: Joint Bell State Measurement & Bob Basis Choice',
      statusLabel: 'Alice Joint BSM & Bob SNSPD Basis Read',
      description: 'Alice performs a 4-outcome Joint Bell State Measurement (BSM) on her message qubit and entangled photon. Bob independently measures his incoming photon in randomly chosen bases {+, x}.' 
    },
    { 
      id: 4, 
      name: 'SIFTING', 
      title: 'Phase 4: Public Basis Reconciliation',
      statusLabel: 'Exchanging Classical Basis Over TLS 1.3',
      description: 'Alice and Bob exchange classical basis choices over public channels. Mismatched bases are discarded from key derivation while maintaining information-theoretic secrecy.' 
    },
    { 
      id: 5, 
      name: 'ERROR EST.', 
      title: 'Phase 5: Hoeffding Bound & CHSH Bell Test Forensics',
      statusLabel: isEavesdropperActive ? 'QBER 14.2% > 5.5% (EVE DETECTED)' : 'QBER 2.1% < 5.5% (CHSH S=2.76 PASS)',
      description: 'QBER is evaluated against the Hoeffding statistical bound (Q_max = 5.5%). Clauser-Horne-Shimony-Holt score S ≥ 2.0 confirms quantum entanglement and rules out MitM/PNS attacks.' 
    },
    { 
      id: 6, 
      name: 'KEY GEN', 
      title: 'Phase 6: Privacy Amplification & Signature Derivation',
      statusLabel: isEavesdropperActive 
        ? 'ABORTED: QBER Breached Threshold (Eve Attack Detected)' 
        : 'Unforgeable Quantum Signature Derived & Verified',
      description: isEavesdropperActive
        ? 'Protocol Aborted: Quantum Bit Error Rate (14.2%) breached the Hoeffding security limit (5.5%). Privacy amplification cannot distill a secure key under active eavesdropping.'
        : 'Universal 2 hashing and privacy amplification distill authenticated quantum digital signature tokens to sign digital documents with unconditional unforgeability.' 
    },
  ];

  // Quantum Bitstream Matrix Data
  const matrixData = [
    { pls: '01', aBasis: 'x', aBit: '0', bBasis: 'x', bBit: isEavesdropperActive ? '1' : '0', bell: 'Φ-', eve: isEavesdropperActive, status: isEavesdropperActive ? 'QBER Error' : 'Kept', angleA: '45°', angleB: '45°' },
    { pls: '02', aBasis: '+', aBit: '1', bBasis: '+', bBit: isEavesdropperActive ? '0' : '1', bell: 'Φ+', eve: isEavesdropperActive, status: isEavesdropperActive ? 'QBER Error' : 'Kept', angleA: '0°', angleB: '0°' },
    { pls: '03', aBasis: '+', aBit: '1', bBasis: '+', bBit: '1', bell: 'Ψ+', eve: false, status: 'Kept', angleA: '0°', angleB: '0°' },
    { pls: '04', aBasis: 'x', aBit: '1', bBasis: '+', bBit: '1', bell: 'Φ+', eve: isEavesdropperActive, status: 'Discarded', angleA: '45°', angleB: '0°' },
    { pls: '05', aBasis: 'x', aBit: '0', bBasis: '+', bBit: '0', bell: 'Φ-', eve: false, status: 'Discarded', angleA: '45°', angleB: '0°' },
    { pls: '06', aBasis: '+', aBit: '0', bBasis: '+', bBit: '0', bell: 'Ψ-', eve: false, status: 'Kept', angleA: '0°', angleB: '0°' },
    { pls: '07', aBasis: 'x', aBit: '1', bBasis: 'x', bBit: isEavesdropperActive ? '0' : '1', bell: 'Φ+', eve: isEavesdropperActive, status: isEavesdropperActive ? 'QBER Error' : 'Kept', angleA: '45°', angleB: '45°' },
    { pls: '08', aBasis: '+', aBit: '1', bBasis: 'x', bBit: '1', bell: 'Ψ+', eve: false, status: 'Discarded', angleA: '0°', angleB: '45°' },
  ];

  const handleExportCsv = () => {
    const headers = ['PLS', 'ALICE BASIS', 'ALICE BIT', 'BOB BASIS', 'BOB BIT', 'BELL STATE', 'EVE INT', 'SIFT STATUS'];
    const rows = matrixData.map((r) => [r.pls, r.aBasis, r.aBit, r.bBasis, r.bBit, r.bell, r.eve ? 'YES' : 'NO', r.status]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantum_matrix_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute Node Centers for Optical Links
  const aliceCenter = { x: nodes.alice.x + 48, y: nodes.alice.y + 48 };
  const arbitratorCenter = { x: nodes.arbitrator.x + 48, y: nodes.arbitrator.y + 48 };
  const bobCenter = { x: nodes.bob.x + 48, y: nodes.bob.y + 48 };
  const eveCenter = { x: nodes.eve.x + 28, y: nodes.eve.y + 28 };

  // Calculate clean linear photon positions along the fiber
  const photonAlicePos = {
    x: arbitratorCenter.x + (aliceCenter.x - arbitratorCenter.x) * photonProgress,
    y: arbitratorCenter.y + (aliceCenter.y - arbitratorCenter.y) * photonProgress,
  };

  const photonBobPos = isEavesdropperActive
    ? photonProgress < 0.5
      ? {
          x: arbitratorCenter.x + (eveCenter.x - arbitratorCenter.x) * (photonProgress * 2),
          y: arbitratorCenter.y + (eveCenter.y - arbitratorCenter.y) * (photonProgress * 2),
        }
      : {
          x: eveCenter.x + (bobCenter.x - eveCenter.x) * ((photonProgress - 0.5) * 2),
          y: eveCenter.y + (bobCenter.y - eveCenter.y) * ((photonProgress - 0.5) * 2),
        }
    : {
        x: arbitratorCenter.x + (bobCenter.x - arbitratorCenter.x) * photonProgress,
        y: arbitratorCenter.y + (bobCenter.y - arbitratorCenter.y) * photonProgress,
      };

  return (
    <div className="h-full w-full flex flex-col bg-[#FBF8FA] text-[#1B1B1D] font-sans antialiased overflow-y-auto select-none relative">
      {/* ─── 1. TOP BRAND NAVIGATION BAR (EXACT HOMEPAGE STYLE) ─── */}
      <nav className="relative bg-[#FFFFFF] border-b border-[#E2E8F0] h-14 w-full flex items-center justify-between px-6 shrink-0 z-40">
        {/* Left: Brand Logo & Title */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer z-10 hover:opacity-80 transition-opacity"
          title="QDS Sentinel Home"
        >
          <svg className="w-5 h-5 text-[#091426]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <circle cx="12" cy="11" r="3"/>
          </svg>
          <span className="font-bold text-[#091426] tracking-tight text-[16px] font-sans">
            QDS SENTINEL
          </span>
        </div>

        {/* Center: Title Tab (Exact Blue Heading with Flush Underline matching Home Hub) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-full flex items-center border-b-2 border-[#0058BE] text-[#0058BE] px-6 font-medium text-[15px] pointer-events-auto cursor-pointer">
            Demonstration
          </div>
        </div>

        {/* Right: New Session Button, Settings, Notifications, Profile Avatar */}
        <div className="flex items-center gap-3 z-10 relative">
          <button
            onClick={() => setShowCreateSessionModal(true)}
            className="px-3 py-1 bg-[#091426] hover:bg-[#1E293B] text-white rounded-[2px] font-mono text-[10.5px] uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-none"
            title="Create and provision a new quantum signature session"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>NEW SESSION</span>
          </button>

          {/* Settings Icon Button */}
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 flex items-center justify-center text-[#45474C] hover:text-[#091426] transition-colors p-1.5 cursor-pointer rounded hover:bg-[#F6F3F5]"
            title="Simulation Parameters & Speed Settings"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>

          {/* Notifications Bell */}
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

            {showNotifications && (
              <div className="absolute right-0 top-10 w-96 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in font-sans">
                <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#091426]">
                      SECURITY ALERTS &amp; ATTACKS
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
                      className="text-[#75777D] hover:text-[#1B1B1D] p-1 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0] bg-white">
                  {totalAlertsCount === 0 ? (
                    <div className="p-6 text-center text-[#75777D] text-[12px] font-mono flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#F6F3F5] border border-[#E2E8F0] text-[#065F46] flex items-center justify-center font-bold">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <span>No active security threats detected. All quantum sessions nominal.</span>
                    </div>
                  ) : (
                    rejectedSessions.map((s) => (
                      <div 
                        key={s.session_id} 
                        onClick={() => { setShowNotifications(false); onNavigateMonitoring(); }}
                        className="p-3.5 hover:bg-[#F6F3F5] transition-colors cursor-pointer flex items-start gap-3 group border-b border-[#E2E8F0] last:border-b-0"
                      >
                        <div className="w-6 h-6 rounded bg-[#F6F3F5] border border-[#E2E8F0] text-[#BA1A1A] flex items-center justify-center shrink-0 mt-0.5 font-mono text-[11px] font-bold">
                          !
                        </div>
                        <div className="flex-1 min-w-0 font-mono text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#BA1A1A] truncate">{s.session_id}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F6F3F5] border border-[#E2E8F0] text-[#BA1A1A] uppercase">{s.verdict?.verdict || 'REJECT'}</span>
                          </div>
                          <p className="text-[#1B1B1D] text-[11px] mt-1 line-clamp-2">{s.verdict?.reason || 'Attack detected: QBER breached Hoeffding threshold (> 5.5%).'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-[#F6F3F5] border-t border-[#E2E8F0] text-center">
                  <button 
                    onClick={() => { setShowNotifications(false); onNavigateMonitoring(); }}
                    className="w-full py-1.5 bg-[#091426] hover:bg-[#1E293B] text-white rounded-[2px] font-mono text-[10.5px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                  >
                    VIEW ALL THREATS IN MONITORING CENTER
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar Popover */}
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

            {showUserProfile && (
              <div className="absolute right-0 top-10 w-84 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in font-sans">
                <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EBF3FF] border border-[#BFDBFE] text-[#0058BE] flex items-center justify-center font-mono font-bold text-[12px]">AS</div>
                    <div>
                      <h3 className="font-bold text-[14px] text-[#091426]">Dr. Anisha S.</h3>
                      <p className="font-mono text-[10px] text-[#75777D]">Lead Cryptographer &amp; SOC Lead</p>
                    </div>
                  </div>
                  <button onClick={() => setShowUserProfile(false)} className="text-[#75777D] hover:text-[#1B1B1D] p-1 cursor-pointer">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                <div className="p-4 space-y-3 font-mono text-[11px] text-[#1B1B1D] bg-[#FFFFFF]">
                  <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
                    <span className="text-[#75777D]">Security Clearance:</span>
                    <span className="font-bold text-[#065F46] bg-[#F6F3F5] border border-[#E2E8F0] px-2 py-0.5 rounded-[2px] text-[10px]">LEVEL 5 (Q-TOP-SECRET)</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
                    <span className="text-[#75777D]">Problem Statement:</span>
                    <span className="font-bold text-[#0058BE]">SIH 2026 / PS 26141</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[#75777D] text-[10px]">
                      <span>Quantum Public Key Hash:</span>
                      <button onClick={handleCopyPublicKey} className="text-[#0058BE] hover:underline font-bold cursor-pointer flex items-center gap-1">
                        {copiedKeyToast ? (
                          <>
                            <svg className="w-3 h-3 text-[#065F46]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            <span>Copied</span>
                          </>
                        ) : (
                          'Copy Key'
                        )}
                      </button>
                    </div>
                    <div className="p-2 bg-[#F6F3F5] rounded-[2px] text-[10px] text-[#1B1B1D] truncate select-all border border-[#E2E8F0] font-mono">
                      0x8F92A1BC40E7D294B105F838E7902BA49C12879F
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#F6F3F5] border-t border-[#E2E8F0] flex gap-2">
                  <button onClick={() => { setShowUserProfile(false); onNavigateMonitoring(); }} className="flex-1 py-1.5 bg-[#091426] hover:bg-[#1E293B] text-white rounded-[2px] font-mono text-[10.5px] uppercase tracking-wider font-semibold transition-colors cursor-pointer">
                    SOC Console
                  </button>
                  <button onClick={() => setShowUserProfile(false)} className="px-4 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#1B1B1D] rounded-[2px] font-mono text-[10.5px] uppercase transition-colors cursor-pointer font-medium">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── 2. TOP CONTROLS & PROTOCOL PHASE BAR (WITH CONNECTED PROGRESS LINE) ─── */}
      <div className="bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 shrink-0 z-30">
        {/* Left: Simulator Control */}
        <div className="flex flex-col gap-2 shrink-0 md:pr-8 md:border-r border-[#E2E8F0]">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[10.5px] uppercase tracking-widest text-[#091426] font-medium">
              SIMULATOR CONTROL
            </span>
            <button 
              onClick={() => setTimeCounter(0.000)}
              className="font-mono text-[11px] text-[#1B1B1D] bg-[#FFFFFF] hover:bg-[#F6F3F5] border border-[#E2E8F0] px-2.5 py-0.5 rounded-[2px] font-medium cursor-pointer transition-colors"
              title="Click to reset timer"
            >
              T+{timeCounter.toFixed(3)}s
            </button>
          </div>

          {/* Player Buttons Row with ButtonGroup */}
          <div className="flex items-center gap-4">
            <ButtonGroup>
              <Button 
                variant={isPlaying ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="gap-1.5 px-2.5 h-7 font-semibold"
                title={isPlaying ? 'Pause Simulation' : 'Start Simulation'}
              >
                {isPlaying ? (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16"/>
                      <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    <span>PLAY</span>
                  </>
                )}
              </Button>

              <ButtonGroupSeparator />

              <Button 
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsPlaying(false)}
                title="Pause Runner"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              </Button>

              <Button 
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setCurrentStep((prev) => {
                    const next = prev >= 6 ? 1 : prev + 1;
                    sentinelService.pushDemonstrationEvent(next, isEavesdropperActive);
                    return next;
                  });
                  setActivePulseIndex((prev) => (prev >= 7 ? 0 : prev + 1));
                }}
                title="Step Forward to Next Phase"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="5 4 15 12 5 20 5 4"/>
                  <line x1="19" y1="5" x2="19" y2="19"/>
                </svg>
              </Button>

              <Button 
                variant="ghost"
                size="icon-sm"
                onClick={() => { setCurrentStep(1); setActivePulseIndex(0); setIsPlaying(false); setTimeCounter(0.000); sentinelService.pushDemonstrationEvent(1, isEavesdropperActive); }}
                title="Reset Simulation State"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              </Button>
            </ButtonGroup>
          </div>

          {/* Live Run & Create Session Triggers */}
          <div className="flex flex-col gap-1 mt-0.5">
            <button 
              onClick={handleRunLive}
              disabled={executingLive}
              className="flex items-center gap-1.5 text-[#BA1A1A] hover:text-[#991B1B] font-mono text-[10.5px] font-semibold tracking-wider uppercase transition-colors cursor-pointer text-left"
              title="Execute live quantum signature generation on FastAPI core"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span>{executingLive ? 'EXECUTING LIVE...' : 'EXECUTE LIVE RUN'}</span>
            </button>

            <button 
              onClick={() => setShowCreateSessionModal(true)}
              className="flex items-center gap-1.5 text-[#0058BE] hover:text-[#00479E] font-mono text-[10.5px] font-semibold tracking-wider uppercase transition-colors cursor-pointer text-left"
              title="Create custom quantum session with custom parameters"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>CONFIGURE NEW SESSION</span>
            </button>
          </div>
        </div>

        {/* Right: Protocol Phase Icons with CONNECTED PROGRESS LINE */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10.5px] uppercase tracking-widest text-[#091426] font-medium">
              PROTOCOL PHASE
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0058BE] animate-ping" />
              <span className="font-mono text-[10px] text-[#0058BE] font-medium uppercase tracking-wider">
                Phase {currentStep} of 6: {phases[currentStep - 1].name}
              </span>
            </div>
          </div>

          {/* Progress Line Container */}
          <div className="relative flex items-center justify-between gap-2 overflow-x-auto pt-1 pb-1 px-4">
            {/* Progress Track anchored precisely between center of first and last phase icons */}
            <div className="absolute top-[22px] left-[52px] right-[52px] h-[2px] bg-[#E2E8F0] z-0 pointer-events-none">
              <div 
                className="h-full bg-[#0058BE] transition-all duration-500 ease-in-out"
                style={{ width: `${Math.min(100, Math.max(0, ((currentStep - 1) / 5) * 100))}%` }}
              />
            </div>

            {phases.map((ph) => {
              const isActive = currentStep === ph.id;
              const isPast = currentStep > ph.id;

              return (
                <div 
                  key={ph.id}
                  onClick={() => {
                    setCurrentStep(ph.id);
                    setActivePhaseInfoModal(ph.id);
                    sentinelService.pushDemonstrationEvent(ph.id, isEavesdropperActive);
                  }}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0 min-w-[72px] z-10"
                  title={`Click to switch to ${ph.name} and view phase details`}
                >
                  <div className={`w-9 h-9 rounded-[2px] flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#0058BE] text-white shadow-none ring-2 ring-[#0058BE]/20'
                      : isPast
                      ? 'bg-[#F6F3F5] border border-[#E2E8F0] text-[#0058BE]'
                      : 'bg-[#FFFFFF] border border-[#E2E8F0] text-[#75777D] hover:border-[#0058BE] hover:text-[#0058BE]'
                  }`}>
                    {ph.id === 1 && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                      </svg>
                    )}
                    {ph.id === 2 && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m16 3 4 4-4 4"/>
                        <path d="M20 7H4"/>
                        <path d="m8 21-4-4 4-4"/>
                        <path d="M4 17h16"/>
                      </svg>
                    )}
                    {ph.id === 3 && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                    {ph.id === 4 && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m21 15-6-6 6-6"/>
                        <path d="M15 9H3"/>
                        <path d="M3 15h6"/>
                      </svg>
                    )}
                    {ph.id === 5 && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="8" height="14" x="8" y="6" rx="4"/>
                        <path d="m19 7-3 2"/>
                        <path d="m5 7 3 2"/>
                        <path d="m19 19-3-2"/>
                        <path d="m5 19 3-2"/>
                        <path d="M20 13h-4"/>
                        <path d="M4 13h4"/>
                      </svg>
                    )}
                    {ph.id === 6 && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="7.5" cy="15.5" r="5.5"/>
                        <path d="m21 2-9.6 9.6"/>
                        <path d="m15.5 7.5 3 3L22 7l-3-3"/>
                      </svg>
                    )}
                  </div>

                  <span className={`font-mono text-[10px] uppercase tracking-wider text-center ${
                    isActive ? 'font-bold text-[#0058BE]' : 'text-[#75777D]'
                  }`}>
                    {ph.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 3. SUB-HEADER STRIP: OPTICAL TOPOLOGY & EVE TOGGLE ─── */}
      <div className="bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 py-2.5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10.5px] uppercase tracking-widest text-[#091426] font-medium">
            OPTICAL CHANNEL TOPOLOGY
          </span>
          <span className="font-mono text-[10px] text-[#75777D] bg-[#F6F3F5] px-2 py-0.5 rounded-[2px] border border-[#E2E8F0]">
            DRAGGABLE NODES
          </span>
          <button
            onClick={() => {
              if (canvasRef.current) {
                const { clientWidth, clientHeight } = canvasRef.current;
                setNodes(getOrganizedPositions(clientWidth, clientHeight));
              }
            }}
            className="font-mono text-[10.5px] text-[#0058BE] hover:underline cursor-pointer font-medium flex items-center gap-1"
            title="Reset nodes to default organized horizontal alignment"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            <span>Reset Layout</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10.5px] uppercase tracking-widest text-[#091426] font-medium">
            EVE INTERCEPTION
          </span>

          <div className="flex items-center gap-2">
            <Switch
              checked={isEavesdropperActive}
              onCheckedChange={(checked) => {
                setIsEavesdropperActive(checked);
                sentinelService.pushDemonstrationEvent(currentStep, checked);
              }}
            />
            <span className={`font-mono text-[10.5px] font-bold ${
              isEavesdropperActive ? 'text-[#BA1A1A]' : 'text-[#75777D]'
            }`}>
              {isEavesdropperActive ? '35% MitM (ACTIVE)' : '35% MitM (OFF)'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── LIVE RUNNER TELEMETRY & PHASE ACTION STRIP ─── */}
      <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-6 py-2.5 flex items-center justify-between text-[11px] font-mono z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#065F46] animate-pulse' : 'bg-[#75777D]'}`} />
            <span className="font-bold text-[#091426] uppercase">
              {isPlaying ? 'ACTIVE RUNNING' : 'SIMULATION PAUSED'}
            </span>
          </div>
          <span className="text-[#CBD5E1]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#75777D]">PHASE {currentStep}/6:</span>
            <span className="font-bold text-[#0058BE]">{phases[currentStep - 1].name}</span>
            <span className="text-[#45474C] font-sans text-[11.5px] ml-1">({phases[currentStep - 1].statusLabel})</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[#75777D]">STREAM PULSE:</span>
            <span className="font-bold text-[#091426]">#{matrixData[activePulseIndex].pls} / 08</span>
          </div>
          <span className="text-[#CBD5E1]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#75777D]">MEASURED QBER:</span>
            <span className={`font-bold ${isEavesdropperActive ? 'text-[#BA1A1A]' : 'text-[#065F46]'}`}>
              {isEavesdropperActive ? '14.2% (ALERT)' : '2.1% (NOMINAL)'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 4. CENTRAL OPTICAL CANVAS ─── */}
      <div 
        ref={canvasRef}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onMouseLeave={handleMouseUpCanvas}
        className="w-full bg-[#FBF8FA] relative min-h-[320px] h-[350px] overflow-hidden select-none shrink-0 border-b border-[#E2E8F0]"
      >
        {/* Subtle Background Dots matching Homepage */}
        <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none"></div>

        {/* Dynamic SVG Connection Lines & Photons */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Fiber: Arbitrator -> Alice */}
          <line
            x1={arbitratorCenter.x}
            y1={arbitratorCenter.y}
            x2={aliceCenter.x}
            y2={aliceCenter.y}
            stroke={currentStep === 2 ? '#0058BE' : '#CBD5E1'}
            strokeWidth={currentStep === 2 ? '2.5' : '1.5'}
            strokeDasharray={currentStep === 2 ? 'none' : '4 3'}
            className={currentStep === 2 ? 'filter drop-shadow-[0_0_6px_rgba(0,88,190,0.5)]' : ''}
          />

          {/* Classical Sifting Link in Phase 4 */}
          {currentStep === 4 && (
            <line
              x1={aliceCenter.x}
              y1={aliceCenter.y - 35}
              x2={bobCenter.x}
              y2={bobCenter.y - 35}
              stroke="#0058BE"
              strokeWidth="2"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          )}

          {/* Fiber: Arbitrator -> Bob (or via Eve) */}
          {isEavesdropperActive ? (
            <>
              <line
                x1={arbitratorCenter.x}
                y1={arbitratorCenter.y}
                x2={eveCenter.x}
                y2={eveCenter.y}
                stroke={currentStep === 2 ? '#EF4444' : '#FCA5A5'}
                strokeWidth={currentStep === 2 ? '2' : '1.5'}
                strokeDasharray="4 3"
              />
              <line
                x1={eveCenter.x}
                y1={eveCenter.y}
                x2={bobCenter.x}
                y2={bobCenter.y}
                stroke={currentStep === 2 ? '#EF4444' : '#FCA5A5'}
                strokeWidth={currentStep === 2 ? '2' : '1.5'}
                strokeDasharray="4 3"
              />
            </>
          ) : (
            <line
              x1={arbitratorCenter.x}
              y1={arbitratorCenter.y}
              x2={bobCenter.x}
              y2={bobCenter.y}
              stroke={currentStep === 2 ? '#0058BE' : '#CBD5E1'}
              strokeWidth={currentStep === 2 ? '2.5' : '1.5'}
              strokeDasharray={currentStep === 2 ? 'none' : '4 3'}
              className={currentStep === 2 ? 'filter drop-shadow-[0_0_6px_rgba(0,88,190,0.5)]' : ''}
            />
          )}

          {/* Minimalist Photon 1: Gliding towards Alice */}
          <circle
            cx={photonAlicePos.x}
            cy={photonAlicePos.y}
            r="4.5"
            fill="#0058BE"
            className="filter drop-shadow-[0_0_6px_rgba(0,88,190,0.8)]"
          />

          {/* Minimalist Photon 2: Gliding towards Bob */}
          <circle
            cx={photonBobPos.x}
            cy={photonBobPos.y}
            r="4.5"
            fill={isEavesdropperActive ? '#DC2626' : '#0058BE'}
            className={isEavesdropperActive ? 'filter drop-shadow-[0_0_6px_rgba(220,38,38,0.8)]' : 'filter drop-shadow-[0_0_6px_rgba(0,88,190,0.8)]'}
          />
        </svg>

        {/* ─── DRAGGABLE ALICE NODE ─── */}
        <div 
          style={{ left: `${nodes.alice.x}px`, top: `${nodes.alice.y}px` }}
          onMouseDown={(e) => handleMouseDownNode(e, 'alice')}
          onClick={() => {
            if (hasMoved) return;
            setActiveNodeModal({
              title: 'Alice Node (Signer TX MOD 99)',
              subtitle: 'Transmitter & Document Signer Subsystem',
              role: 'Generates document hash state |ψ_doc⟩, performs Joint Bell State Measurement (BSM) with incoming EPR photon, and broadcasts classical feed-forward bits (b₁, b₂).',
              metrics: [
                { label: 'Transmitter Output Power', value: '-3.2 dBm' },
                { label: 'Modulator Switching Speed', value: '10 GHz' },
                { label: 'Active Basis Pool', value: '{+, x} Conjugate' },
                { label: 'Dark Count Rate', value: '4.2 × 10⁻⁷' },
                { label: 'Classical Link Port', value: 'TCP 8081 / TLS 1.3' }
              ],
              description: 'Alice prepares unforgeable quantum digital signatures by entangling message state with the Arbitrator EPR stream.'
            });
          }}
          className={`absolute flex flex-col items-center z-10 w-44 cursor-grab active:cursor-grabbing group ${
            draggingNode === 'alice' ? 'scale-105 z-20' : ''
          }`}
          title="Drag to reposition Alice Node • Click for diagnostics"
        >
          <div className={`w-24 h-24 rounded-2xl bg-[#FFFFFF] border shadow-xs flex items-center justify-center relative mb-2 transition-all ${
            currentStep === 6 && isEavesdropperActive
              ? 'border-[#BA1A1A] ring-4 ring-[#BA1A1A]/20'
              : currentStep === 6
              ? 'border-[#065F46] ring-4 ring-[#065F46]/20'
              : currentStep === 3 || currentStep === 4
              ? 'border-[#0058BE] ring-4 ring-[#0058BE]/20'
              : 'border-[#CBD5E1] group-hover:border-[#0058BE]'
          }`}>
            <svg className="w-11 h-11 text-[#091426] group-hover:text-[#0058BE] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="12" x="3" y="4" rx="2"/>
              <line x1="2" x2="22" y1="20" y2="20"/>
            </svg>

            <div className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full text-white flex items-center justify-center font-mono text-[11px] font-bold shadow-sm ${
              currentStep === 6 && isEavesdropperActive ? 'bg-[#BA1A1A]' : 'bg-[#0058BE]'
            }`}>
              A
            </div>
          </div>

          <span className="font-bold text-[13px] text-[#091426] font-sans group-hover:text-[#0058BE] transition-colors">
            ALICE NODE
          </span>
          <span className="font-mono text-[10.5px] text-[#45474C]">
            TX MOD 99
          </span>

          {/* Dynamic real-time action status per phase */}
          <span className={`font-mono text-[9.5px] px-2 py-0.5 mt-1 rounded-[2px] text-center font-medium border ${
            currentStep === 3
              ? 'bg-[#EBF3FF] border-[#0058BE] text-[#0058BE] font-bold'
              : currentStep === 4
              ? 'bg-[#EBF3FF] border-[#0058BE] text-[#0058BE]'
              : currentStep === 6 && isEavesdropperActive
              ? 'bg-[#FEE2E2] border-[#EF4444] text-[#BA1A1A] font-bold'
              : currentStep === 6
              ? 'bg-[#E6F4EA] border-[#065F46] text-[#065F46] font-bold'
              : 'bg-[#F6F3F5] border-[#E2E8F0] text-[#75777D]'
          }`}>
            {currentStep === 1 && 'Awaiting Photon A'}
            {currentStep === 2 && 'Photon In-Flight'}
            {currentStep === 3 && 'BSM Outcome |Φ⁺⟩'}
            {currentStep === 4 && 'Basis Tx Over TLS'}
            {currentStep === 5 && (isEavesdropperActive ? 'QBER Spike Detected' : 'Hoeffding Bound OK')}
            {currentStep === 6 && (isEavesdropperActive ? 'Signature Aborted' : 'Signature Token Ready')}
          </span>
        </div>

        {/* ─── DRAGGABLE EVE NODE (MITM) ─── */}
        <div 
          style={{ left: `${nodes.eve.x}px`, top: `${nodes.eve.y}px` }}
          onMouseDown={(e) => handleMouseDownNode(e, 'eve')}
          onClick={() => {
            if (hasMoved) return;
            setActiveNodeModal({
              title: 'Eve Node (Monitored Intercept Probe)',
              subtitle: 'Active Quantum Man-in-the-Middle Probe (35% Intercept Ratio)',
              role: 'Eve intercepts quantum optical pulses on the Arbitrator-Bob link, performs projective measurement in random basis, and resends reconstructed state.',
              metrics: [
                { label: 'Attack Strategy', value: 'Intercept-Resend (35% Ratio)' },
                { label: 'Induced QBER', value: '14.2% (Breaches 5.5% Threshold)' },
                { label: 'CHSH Entanglement Score', value: '1.88 (State Collapse)' },
                { label: 'Hoeffding Bound Verdict', value: 'QUARANTINE_FLAGGED' },
                { label: 'Detection Certainty', value: '99.98% Confidence' }
              ],
              description: 'Eve’s measurement immediately collapses quantum superposition, creating detectable parity errors in the Pauli alignment matrix.'
            });
          }}
          className={`absolute flex flex-col items-center z-10 cursor-grab active:cursor-grabbing group ${
            isEavesdropperActive ? 'opacity-100' : 'opacity-30'
          } ${draggingNode === 'eve' ? 'scale-105 z-20' : ''}`}
          title="Drag to reposition Eve Node • Click for telemetry"
        >
          <div className={`w-14 h-14 rounded-2xl bg-[#FEE2E2] border flex items-center justify-center shadow-xs ${
            isEavesdropperActive ? 'border-[#DC2626] text-[#DC2626] ring-2 ring-[#DC2626]/20' : 'border-[#CBD5E1] text-[#75777D]'
          }`}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="8" height="14" x="8" y="6" rx="4"/>
              <path d="m19 7-3 2"/>
              <path d="m5 7 3 2"/>
              <path d="m19 19-3-2"/>
              <path d="m5 19 3-2"/>
              <path d="M20 13h-4"/>
              <path d="M4 13h4"/>
            </svg>
          </div>
          <span className="font-mono text-[10px] text-[#DC2626] font-bold uppercase tracking-wider mt-1 border border-[#FCA5A5] bg-[#FFFFFF] px-1.5 rounded-[2px]">
            {isEavesdropperActive ? 'EVE 35% MITM' : 'EVE BYPASSED'}
          </span>
        </div>

        {/* ─── DRAGGABLE ARBITRATOR NODE ─── */}
        <div 
          style={{ left: `${nodes.arbitrator.x}px`, top: `${nodes.arbitrator.y}px` }}
          onMouseDown={(e) => handleMouseDownNode(e, 'arbitrator')}
          onClick={() => {
            if (hasMoved) return;
            setActiveNodeModal({
              title: 'Arbitrator Node (Master Optical Source)',
              subtitle: 'Spontaneous Parametric Down-Conversion (SPDC) Source',
              role: 'Generates continuous streams of maximally entangled photon pairs |Φ⁺⟩ and routes them symmetrically over low-loss dark fiber links to Alice and Bob.',
              metrics: [
                { label: 'Laser Wavelength', value: 'λ = 1550 nm (Telecom C-Band)' },
                { label: 'Pair Generation Rate', value: '1.2 × 10⁶ pairs/sec' },
                { label: 'Bell State Purity', value: bellStatePurity },
                { label: 'Crystal Temperature', value: '24.8 °C (Active Peltier Locked)' },
                { label: 'Synchronization Jitter', value: '< 2.4 ps' }
              ],
              description: 'The Arbitrator guarantees non-local correlation baseline required for mathematical non-repudiation.'
            });
          }}
          className={`absolute flex flex-col items-center z-10 w-44 cursor-grab active:cursor-grabbing group ${
            draggingNode === 'arbitrator' ? 'scale-105 z-20' : ''
          }`}
          title="Drag to reposition Arbitrator Source • Click for diagnostics"
        >
          <div className={`w-24 h-24 rounded-2xl bg-[#FFFFFF] border shadow-xs flex items-center justify-center relative mb-2 transition-all ${
            currentStep === 1 || currentStep === 2
              ? 'border-[#0058BE] ring-4 ring-[#0058BE]/20'
              : 'border-[#CBD5E1] group-hover:border-[#0058BE]'
          }`}>
            <svg className="w-11 h-11 text-[#091426] group-hover:text-[#0058BE] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4"/>
              <path d="M12 18v4"/>
              <path d="M4.93 4.93l2.83 2.83"/>
              <path d="M16.24 16.24l2.83 2.83"/>
              <path d="M2 12h4"/>
              <path d="M18 12h4"/>
              <path d="M4.93 19.07l2.83-2.83"/>
              <path d="M16.24 7.76l2.83-2.83"/>
            </svg>

            <div className="absolute -bottom-1.5 -right-1.5 px-1.5 h-6 rounded-full bg-[#0058BE] text-white flex items-center justify-center font-mono text-[10px] font-bold shadow-sm">
              EPR
            </div>
          </div>

          <span className="font-bold text-[13px] text-[#091426] font-sans group-hover:text-[#0058BE] transition-colors">
            ARBITRATOR
          </span>
          <span className="font-mono text-[10.5px] text-[#45474C]">
            EPR Source
          </span>

          {/* Dynamic real-time action status per phase */}
          <span className={`font-mono text-[9.5px] px-2 py-0.5 mt-1 rounded-[2px] text-center font-medium border ${
            currentStep === 1
              ? 'bg-[#EBF3FF] border-[#0058BE] text-[#0058BE] font-bold'
              : currentStep === 2
              ? 'bg-[#EBF3FF] border-[#0058BE] text-[#0058BE]'
              : 'bg-[#F6F3F5] border-[#E2E8F0] text-[#75777D]'
          }`}>
            {currentStep === 1 && 'Pumping BBO 775nm'}
            {currentStep === 2 && 'Streaming |Φ⁺⟩ Pairs'}
            {currentStep >= 3 && 'SPDC Lock Stable'}
          </span>
        </div>

        {/* ─── DRAGGABLE BOB NODE ─── */}
        <div 
          style={{ left: `${nodes.bob.x}px`, top: `${nodes.bob.y}px` }}
          onMouseDown={(e) => handleMouseDownNode(e, 'bob')}
          onClick={() => {
            if (hasMoved) return;
            setActiveNodeModal({
              title: 'Bob Node (Verifier RX DET 01)',
              subtitle: 'Receiver & Signature Verifier Subsystem',
              role: 'Receives entangled photon half from Arbitrator, receives 2-bit classical feed-forward from Alice, applies matching Pauli rotation σ_I, σ_X, σ_Z, σ_XZ, and validates signature.',
              metrics: [
                { label: 'Detector Type', value: 'Superconducting Nanowire (SNSPD)' },
                { label: 'Quantum Efficiency (QE)', value: '92.6%' },
                { label: 'Timing Resolution', value: '18 ps FWHM' },
                { label: 'Pauli Frame Correction', value: 'Zero Latency FPGA' },
                { label: 'Verdict Logic', value: 'Hoeffding + CHSH Fusion' }
              ],
              description: 'Bob independently reconstructs and verifies the authentic quantum signature with zero trusted third party.'
            });
          }}
          className={`absolute flex flex-col items-center z-10 w-44 cursor-grab active:cursor-grabbing group ${
            draggingNode === 'bob' ? 'scale-105 z-20' : ''
          }`}
          title="Drag to reposition Bob Node • Click for diagnostics"
        >
          <div className={`w-24 h-24 rounded-2xl bg-[#FFFFFF] border shadow-xs flex items-center justify-center relative mb-2 transition-all ${
            currentStep === 6 && isEavesdropperActive
              ? 'border-[#BA1A1A] ring-4 ring-[#BA1A1A]/20'
              : currentStep === 6
              ? 'border-[#065F46] ring-4 ring-[#065F46]/20'
              : currentStep === 3 || currentStep === 4
              ? 'border-[#0058BE] ring-4 ring-[#0058BE]/20'
              : 'border-[#CBD5E1] group-hover:border-[#0058BE]'
          }`}>
            <svg className="w-11 h-11 text-[#091426] group-hover:text-[#0058BE] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="8" x="2" y="2" rx="2"/>
              <rect width="20" height="8" x="2" y="14" rx="2"/>
              <line x1="6" x2="6.01" y1="6"/>
              <line x1="6" x2="6.01" y1="18"/>
            </svg>

            <div className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full text-white flex items-center justify-center font-mono text-[11px] font-bold shadow-sm ${
              currentStep === 6 && isEavesdropperActive ? 'bg-[#BA1A1A]' : 'bg-[#0058BE]'
            }`}>
              B
            </div>
          </div>

          <span className="font-bold text-[13px] text-[#091426] font-sans group-hover:text-[#0058BE] transition-colors">
            BOB NODE
          </span>
          <span className="font-mono text-[10.5px] text-[#45474C]">
            RX DET 01
          </span>

          {/* Dynamic real-time action status per phase */}
          <span className={`font-mono text-[9.5px] px-2 py-0.5 mt-1 rounded-[2px] text-center font-medium border ${
            currentStep === 3
              ? 'bg-[#EBF3FF] border-[#0058BE] text-[#0058BE] font-bold'
              : currentStep === 4
              ? 'bg-[#EBF3FF] border-[#0058BE] text-[#0058BE]'
              : currentStep === 6 && isEavesdropperActive
              ? 'bg-[#FEE2E2] border-[#EF4444] text-[#BA1A1A] font-bold'
              : currentStep === 6
              ? 'bg-[#E6F4EA] border-[#065F46] text-[#065F46] font-bold'
              : 'bg-[#F6F3F5] border-[#E2E8F0] text-[#75777D]'
          }`}>
            {currentStep === 1 && 'Awaiting Photon B'}
            {currentStep === 2 && 'Photon In-Flight'}
            {currentStep === 3 && 'SNSPD Read {+, x}'}
            {currentStep === 4 && 'Basis Reconciled'}
            {currentStep === 5 && (isEavesdropperActive ? 'CHSH S=1.88 Fail' : 'CHSH S=2.76 Pass')}
            {currentStep === 6 && (isEavesdropperActive ? 'Signature Rejected' : 'Signature Verified')}
          </span>
        </div>
      </div>

      {/* ─── 5. BOTTOM: QUANTUM BITSTREAM & PAULI ALIGNMENT MATRIX ─── */}
      <div className="bg-[#FFFFFF] border-t border-[#E2E8F0] h-64 shrink-0 flex flex-col overflow-hidden z-20">
        <div className="h-8 bg-[#F6F3F5] border-b border-[#E2E8F0] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-widest text-[#091426] font-medium">
              QUANTUM BITSTREAM &amp; PAULI ALIGNMENT MATRIX
            </span>
            <span className="font-mono text-[10px] text-[#0058BE] font-semibold">
              (Pulse #{matrixData[activePulseIndex].pls})
            </span>
          </div>
          <button 
            onClick={handleExportCsv}
            className="text-[#45474C] hover:text-[#091426] transition-colors p-1 cursor-pointer flex items-center gap-1.5 font-mono text-[10.5px]"
            title="Download CSV export of Quantum Bitstream Matrix"
          >
            <span>Export CSV</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-center border-collapse">
            <thead className="sticky top-0 bg-[#FFFFFF] z-10 border-b border-[#E2E8F0] text-[11px] font-mono text-[#75777D] uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3 font-medium border-r border-[#E2E8F0] w-14">PLS</th>
                <th className="py-2 px-3 font-medium border-r border-[#E2E8F0]">ALICE BASIS</th>
                <th className="py-2 px-3 font-medium border-r border-[#E2E8F0]">ALICE BIT</th>
                <th className="py-2 px-3 font-medium border-r border-[#E2E8F0]">BOB BASIS</th>
                <th className="py-2 px-3 font-medium border-r border-[#E2E8F0]">BOB BIT</th>
                <th className="py-2 px-3 font-medium border-r border-[#E2E8F0]">BELL STATE</th>
                <th className="py-2 px-3 font-medium border-r border-[#E2E8F0] w-24">EVE INT</th>
                <th className="py-2 px-4 font-medium text-right w-36">SIFT STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] font-mono text-[12px] text-[#1B1B1D]">
              {matrixData.map((row, idx) => {
                const isRowLive = idx === activePulseIndex;

                return (
                  <tr 
                    key={row.pls} 
                    onClick={() => setSelectedPulseModal(row)}
                    className={`transition-colors cursor-pointer ${
                      isRowLive
                        ? 'bg-[#F6F3F5] font-semibold text-[#091426]'
                        : 'hover:bg-[#F6F3F5]'
                    }`}
                    title={`Click to inspect Pulse ${row.pls} quantum state vector`}
                  >
                    <td className={`py-2 px-3 border-r border-[#E2E8F0] ${isRowLive ? 'text-[#0058BE] font-bold' : 'text-[#75777D]'}`}>
                      {row.pls}
                    </td>
                    <td className="py-2 px-3 border-r border-[#E2E8F0] text-[#1B1B1D]">
                      {row.aBasis}
                    </td>
                    <td className="py-2 px-3 border-r border-[#E2E8F0] text-[#091426] font-semibold">
                      {row.aBit}
                    </td>
                    <td className="py-2 px-3 border-r border-[#E2E8F0] text-[#1B1B1D]">
                      {row.bBasis}
                    </td>
                    <td className="py-2 px-3 border-r border-[#E2E8F0] text-[#091426] font-semibold">
                      {row.bBit}
                    </td>
                    <td className="py-2 px-3 border-r border-[#E2E8F0] text-[#45474C]">
                      {row.bell}
                    </td>
                    <td className="py-2 px-3 border-r border-[#E2E8F0] text-center">
                      {row.eve ? (
                        <span className="text-[#BA1A1A] font-bold inline-flex items-center justify-center">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                        </span>
                      ) : (
                        <span className="text-[#75777D]">-</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-right">
                      {row.status === 'QBER Error' && (
                        <span className="px-2 py-0.5 bg-[#FEE2E2] text-[#BA1A1A] rounded font-bold text-[11px]">
                          QBER Error
                        </span>
                      )}
                      {row.status === 'Kept' && (
                        <span className="text-[#065F46] font-bold text-[11.5px]">
                          Kept
                        </span>
                      )}
                      {row.status === 'Discarded' && (
                        <span className="text-[#75777D] text-[11.5px]">
                          Discarded
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 6. NODE DIAGNOSTICS MODAL ─── */}
      {activeNodeModal && (
        <div 
          onClick={() => setActiveNodeModal(null)}
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] max-w-lg w-full shadow-2xl overflow-hidden font-sans cursor-default"
          >
            <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-5 py-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0058BE] font-bold block mb-0.5">
                  NODE TELEMETRY INSPECTOR
                </span>
                <h3 className="font-bold text-[#091426] text-[15px] font-sans">
                  {activeNodeModal.title}
                </h3>
              </div>
              <button 
                onClick={() => setActiveNodeModal(null)}
                className="text-[#75777D] hover:text-[#1B1B1D] p-1 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-3 font-sans bg-[#FFFFFF]">
              <p className="text-[#1B1B1D] text-[12.5px] leading-relaxed">
                {activeNodeModal.role}
              </p>

              <div className="p-3 bg-[#F6F3F5] rounded-[2px] border border-[#E2E8F0] space-y-1.5 font-mono text-[11px]">
                {activeNodeModal.metrics.map((m) => (
                  <div key={m.label} className="flex justify-between border-b border-[#E2E8F0] pb-1 last:border-b-0">
                    <span className="text-[#75777D]">{m.label}:</span>
                    <span className="font-bold text-[#091426]">{m.value}</span>
                  </div>
                ))}
              </div>

              <p className="text-[#75777D] text-[11.5px]">
                {activeNodeModal.description}
              </p>
            </div>

            <div className="p-3 bg-[#F6F3F5] border-t border-[#E2E8F0] flex justify-end">
              <button 
                onClick={() => setActiveNodeModal(null)}
                className="px-4 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#1B1B1D] rounded-[2px] font-mono text-[10.5px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. PULSE BITSTREAM MODAL ─── */}
      {selectedPulseModal && (
        <div 
          onClick={() => setSelectedPulseModal(null)}
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] max-w-md w-full shadow-2xl overflow-hidden font-sans cursor-default"
          >
            <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-5 py-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0058BE] font-bold block mb-0.5">
                  PULSE VECTOR FORENSICS
                </span>
                <h3 className="font-bold text-[#091426] text-[15px]">
                  EPR Pulse #{selectedPulseModal.pls}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedPulseModal(null)}
                className="text-[#75777D] hover:text-[#1B1B1D] p-1 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-2.5 font-mono text-[11.5px] bg-[#FFFFFF]">
              <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                <span className="text-[#75777D]">Alice Basis &amp; Bit:</span>
                <span className="font-bold text-[#091426]">Basis: {selectedPulseModal.aBasis} | Bit: {selectedPulseModal.aBit} ({selectedPulseModal.angleA})</span>
              </div>
              <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                <span className="text-[#75777D]">Bob Basis &amp; Bit:</span>
                <span className="font-bold text-[#091426]">Basis: {selectedPulseModal.bBasis} | Bit: {selectedPulseModal.bBit} ({selectedPulseModal.angleB})</span>
              </div>
              <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                <span className="text-[#75777D]">Bell State Correlation:</span>
                <span className="font-bold text-[#0058BE]">{selectedPulseModal.bell}</span>
              </div>
              <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                <span className="text-[#75777D]">Eve Interception:</span>
                <span className={`font-bold ${selectedPulseModal.eve ? 'text-[#BA1A1A]' : 'text-[#065F46]'}`}>
                  {selectedPulseModal.eve ? 'ATTACK DETECTED' : 'NOMINAL (CLEAN)'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-1.5">
                <span className="text-[#75777D]">Sift Verdict:</span>
                <span className={`font-bold px-2 py-0.5 rounded-[2px] text-[10px] ${
                  selectedPulseModal.status === 'QBER Error'
                    ? 'bg-[#F6F3F5] border border-[#E2E8F0] text-[#BA1A1A]'
                    : selectedPulseModal.status === 'Kept'
                    ? 'bg-[#E6F4EA] text-[#065F46]'
                    : 'bg-[#F6F3F5] text-[#75777D]'
                }`}>
                  {selectedPulseModal.status}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#F6F3F5] border-t border-[#E2E8F0] flex justify-end">
              <button 
                onClick={() => setSelectedPulseModal(null)}
                className="px-4 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#1B1B1D] rounded-[2px] font-mono text-[10.5px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 8. PROTOCOL PHASE EXPLANATION MODAL ─── */}
      {activePhaseInfoModal && (
        <div 
          onClick={() => setActivePhaseInfoModal(null)}
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] max-w-lg w-full shadow-2xl overflow-hidden font-sans cursor-default"
          >
            <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-5 py-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0058BE] font-bold block mb-0.5">
                  PROTOCOL PHASE EXPLANATION
                </span>
                <h3 className="font-bold text-[#091426] text-[15px]">
                  {phases[activePhaseInfoModal - 1].title}
                </h3>
              </div>
              <button 
                onClick={() => setActivePhaseInfoModal(null)}
                className="text-[#75777D] hover:text-[#1B1B1D] p-1 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-3 font-sans bg-[#FFFFFF]">
              <p className="text-[#1B1B1D] text-[13px] leading-relaxed">
                {phases[activePhaseInfoModal - 1].description}
              </p>
            </div>

            <div className="p-3 bg-[#F6F3F5] border-t border-[#E2E8F0] flex justify-end">
              <button 
                onClick={() => setActivePhaseInfoModal(null)}
                className="px-4 py-1.5 bg-[#091426] hover:bg-[#1E293B] text-white rounded-[2px] font-mono text-[10.5px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
              >
                Continue Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 9. SIMULATION TUNING & SETTINGS MODAL ─── */}
      {showSettingsModal && (
        <div 
          onClick={() => setShowSettingsModal(false)}
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] max-w-md w-full shadow-2xl overflow-hidden font-sans cursor-default"
          >
            <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-5 py-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0058BE] font-bold block mb-0.5">
                  VISUALIZER CONFIGURATION
                </span>
                <h3 className="font-bold text-[#091426] text-[15px]">
                  Simulation Parameters
                </h3>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-[#75777D] hover:text-[#1B1B1D] p-1 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4 font-mono text-[11.5px] bg-[#FFFFFF]">
              <div className="space-y-1.5">
                <label className="text-[#75777D] block">Simulation Execution Speed:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSimSpeed(spd)}
                      className={`py-1.5 rounded-[2px] font-bold border cursor-pointer transition-colors ${
                        simSpeed === spd
                          ? 'bg-[#091426] text-white border-[#091426]'
                          : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1B1B1D] hover:bg-[#F6F3F5]'
                      }`}
                    >
                      {spd}x Speed
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                <label className="text-[#75777D] block">Conjugate Measurement Basis:</label>
                <div className="grid grid-cols-2 gap-2">
                  {['{+, x}', '{Z, X}'].map((basis) => (
                    <button
                      key={basis}
                      onClick={() => setChosenBasisPair(basis)}
                      className={`py-1.5 rounded-[2px] font-bold border cursor-pointer transition-colors ${
                        chosenBasisPair === basis
                          ? 'bg-[#0058BE] text-white border-[#0058BE]'
                          : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1B1B1D] hover:bg-[#F6F3F5]'
                      }`}
                    >
                      {basis} Standard
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                <label className="text-[#75777D] block">Arbitrator Bell State Purity:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['99.4%', '95.0%', '88.0%'].map((purity) => (
                    <button
                      key={purity}
                      onClick={() => setBellStatePurity(purity)}
                      className={`py-1.5 rounded-[2px] font-bold border cursor-pointer transition-colors ${
                        bellStatePurity === purity
                          ? 'bg-[#091426] text-white border-[#091426]'
                          : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1B1B1D] hover:bg-[#F6F3F5]'
                      }`}
                    >
                      {purity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F6F3F5] border-t border-[#E2E8F0] flex justify-end">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-1.5 bg-[#091426] hover:bg-[#1E293B] text-white rounded-[2px] font-mono text-[10.5px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
              >
                Apply Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 10. CREATE & PROVISION QUANTUM SESSION MODAL ─── */}
      {showCreateSessionModal && (
        <div 
          onClick={() => setShowCreateSessionModal(false)}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] max-w-lg w-full shadow-2xl overflow-hidden font-sans cursor-default"
          >
            <div className="bg-[#F6F3F5] border-b border-[#E2E8F0] px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-[2px] bg-[#EBF3FF] border border-[#BFDBFE] flex items-center justify-center text-[#0058BE]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#0058BE] font-bold block">
                    QUANTUM WORKFLOW GENERATOR
                  </span>
                  <h3 className="font-bold text-[#091426] text-[15px]">
                    Create New Quantum Session
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateSessionModal(false)}
                className="text-[#75777D] hover:text-[#1B1B1D] p-1 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateNewSession} className="p-5 space-y-4 font-mono text-[12px] bg-[#FFFFFF]">
              <div>
                <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                  Document / Payload Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. defense_telemetry_manifest_09.sig"
                  value={sessionForm.documentName}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, documentName: e.target.value }))}
                  className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                    Payload Size (KB)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="128.0"
                    value={sessionForm.sizeKb}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, sizeKb: e.target.value }))}
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                    EPR Pairs Count
                  </label>
                  <select
                    value={sessionForm.numPairs}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, numPairs: e.target.value }))}
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                  >
                    <option value="50">50 Pairs (Fast Simulation)</option>
                    <option value="100">100 Pairs (Standard Assurance)</option>
                    <option value="500">500 Pairs (Defense Grade)</option>
                    <option value="1000">1,000 Pairs (Ultra-Secure)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#091426] font-bold text-[10.5px] uppercase tracking-wider mb-1">
                  Target Simulation Scenario
                </label>
                <select
                  value={sessionForm.scenario}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, scenario: e.target.value }))}
                  className="w-full bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-[#091426] rounded-[2px] focus:outline-none focus:border-[#0058BE] text-[11px]"
                >
                  <option value="CLEAN">CLEAN (Nominal QKD · QBER ~2.1% · Accept)</option>
                  <option value="EVE">EVE ATTACK (Active Intercept &amp; Resend · QBER ~14.2% · Reject)</option>
                  <option value="MITM">MAN-IN-THE-MIDDLE (Eavesdropping Tap · QBER &gt; 20% · Reject)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateSessionModal(false)}
                  className="flex-1 py-2 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F6F3F5] text-[#091426] font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer text-[10.5px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSession}
                  className="flex-1 py-2 bg-[#0058BE] hover:bg-[#00479E] text-white font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer text-[10.5px] flex items-center justify-center gap-1.5"
                >
                  {isCreatingSession ? 'INITIALIZING...' : 'INITIATE SESSION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── LIVE SIGNATURE GENERATION SUCCESS / ABORT TOAST ─── */}
      {liveSuccessToast && (
        <div className={`fixed bottom-6 right-6 text-white px-4 py-2.5 rounded-[2px] font-mono text-[11px] shadow-2xl flex items-center gap-2 z-50 animate-fade-in border ${
          isEavesdropperActive ? 'bg-[#7F1D1D] border-[#DC2626]' : 'bg-[#091426] border-[#1E293B]'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isEavesdropperActive ? 'bg-[#EF4444] animate-ping' : 'bg-[#065F46] animate-pulse'}`}></span>
          <span>
            {isEavesdropperActive
              ? 'Signature Verification REJECTED: Quantum Channel Tampered by Eve (35% MitM)!'
              : 'Live signature manifest generated & verified by Bob!'}
          </span>
        </div>
      )}

      {/* ─── SESSION CREATED TOAST ─── */}
      {sessionCreatedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#091426] text-white px-4 py-2.5 rounded-[2px] font-mono text-[11px] shadow-2xl flex items-center gap-2.5 z-50 animate-fade-in border border-[#334155]">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
          <span>{sessionCreatedToast}</span>
        </div>
      )}
    </div>
  );
};
