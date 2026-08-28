import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from './apiClient';
import { toast } from 'sonner';

export interface TransmissionRecord {
  id: string;
  time: string;
  verification: string;
  title: string;
  body: string;
  signature: string;
  qber: string;
  chsh: string;
  pauli: string;
  tone: 'good' | 'pqc' | 'copper';
  metricTone: string;
}

export interface TelemetryItem {
  id: string;
  time: string;
  source: string;
  text: string;
  ms: string;
  code: string;
  qber: string;
  chsh: string;
  payloadContent?: string;
  isThreat?: boolean;
}

export interface IncidentItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED' | 'ESCALATED';
  assigned: string;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  qber: string;
  chsh: string;
  timestamp: string;
  analyst: string;
  detail: string;
  events: [string, string, string][];
  helstrom: string;
  traceDistance: string;
  targetNode: string;
}

export interface ThreatAnomalyItem {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  origin: string;
  badge?: string;
  type: string;
  time: string;
  baseline: string;
  current: string;
  detail: string;
  qber: number;
  chsh: number;
}

export interface SessionStreamItem {
  id: string;
  endpoint: string;
  state: 'STABLE' | 'DEGRADED' | 'PAUSED' | 'QUARANTINED';
  rate: string;
  duration: string;
  trace: 'wave' | 'rise' | 'step' | 'wave-low';
  tone: 'good' | 'copper' | 'blue';
}

export interface SentinelContextType {
  eveActive: boolean;
  activeSessionId: string;
  qber: number;
  chsh: number;
  pqcMode: boolean;
  remediationReport: string | null;
  payloads: TransmissionRecord[];
  telemetryLogs: TelemetryItem[];
  incidents: IncidentItem[];
  threats: ThreatAnomalyItem[];
  sessions: SessionStreamItem[];
  activeAttack: string;
  toggleEve: () => Promise<void>;
  triggerAttack: (attackTitle: string, customQber?: number, customChsh?: number) => Promise<void>;
  executeProtocolRun: (documentName?: string, isEveActive?: boolean) => Promise<any>;
  pushTelemetryLogs: (items: TelemetryItem[]) => void;
  sendTransmission: (payload: { mode: 'message' | 'document'; message?: string; file?: File | null; digest?: string | null }) => Promise<void>;
  resetChannel: () => void;
  resolveIncident: (id: string) => void;
  quarantineNode: (nodeId: string) => void;
}

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

export const SentinelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [eveActive, setEveActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('qds_eve_active') === 'true';
    } catch {
      return false;
    }
  });
  const [activeSessionId, setActiveSessionId] = useState('QKD-260827-91F4');
  const [qber, setQber] = useState(0.019);
  const [chsh, setChsh] = useState(2.76);
  const [pqcMode, setPqcMode] = useState(false);
  const [remediationReport, setRemediationReport] = useState<string | null>(null);
  const [activeAttack, setActiveAttack] = useState('Clean signature');

  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryItem[]>([
    { id: 'evt-0', time: '11:48:09.102', source: 'ARB-CORE', text: 'SPDC photon pair routed to Alice & Bob via Dark Fiber Link 1', ms: '12ms', code: '200 OK', qber: '1.9%', chsh: '2.78' },
    { id: 'evt-1', time: '11:47:52.884', source: 'QN-ALICE', text: 'Joint Bell State Measurement completed for session QKD-260827-91F4', ms: '18ms', code: '200 OK', qber: '1.9%', chsh: '2.76' },
    { id: 'evt-2', time: '11:46:12.441', source: 'EVE-PROBE', text: 'Hoeffding statistical bound audit passed · QBER <= 5.50%', ms: '20ms', code: '200 OK', qber: '1.9%', chsh: '2.78' },
    { id: 'evt-3', time: '11:45:03.912', source: 'PRIVACY_AMP', text: 'Toeplitz hash distillation: 1024 raw bits -> 256 secure entropy bits', ms: '9ms', code: '200 OK', qber: '1.9%', chsh: '2.76' },
  ]);

  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('qds_quantum_telemetry');
      bc.onmessage = (event) => {
        const msg = event.data;
        if (msg?.type === 'ATTACK_TRIGGERED') {
          if (msg.payload?.attackTitle) {
            setActiveAttack(msg.payload.attackTitle);
            const isAtk = msg.payload.attackTitle !== 'Clean signature';
            setEveActive(isAtk);
            try { localStorage.setItem('qds_eve_active', String(isAtk)); } catch {}
          }
          if (msg.payload?.qber) setQber(msg.payload.qber);
          if (msg.payload?.chsh) setChsh(msg.payload.chsh);
          if (msg.payload?.newEvents) {
            setTelemetryLogs(prev => [...msg.payload.newEvents, ...prev]);
          }
          if (msg.payload?.newThreat) {
            setThreats(prev => [msg.payload.newThreat, ...prev.filter(t => t.id !== msg.payload.newThreat.id)]);
          }
          if (msg.payload?.newInc) {
            setIncidents(prev => [msg.payload.newInc, ...prev.filter(i => i.id !== msg.payload.newInc.id)]);
          }
        } else if (msg?.type === 'NEW_TELEMETRY_ITEM') {
          if (msg.payload?.newEvents) {
            setTelemetryLogs(prev => [...msg.payload.newEvents, ...prev]);
          }
          if (msg.payload?.newThreat) {
            setThreats(prev => [msg.payload.newThreat, ...prev.filter(t => t.id !== msg.payload.newThreat.id)]);
          }
          if (msg.payload?.newInc) {
            setIncidents(prev => [msg.payload.newInc, ...prev.filter(i => i.id !== msg.payload.newInc.id)]);
          }
        } else if (msg?.type === 'CHANNEL_RESTORED') {
          setActiveAttack('Clean signature');
          setEveActive(false);
          try { localStorage.setItem('qds_eve_active', 'false'); } catch {}
          setQber(0.019);
          setChsh(2.76);
          if (msg.payload?.newEvents) {
            setTelemetryLogs(prev => [...msg.payload.newEvents, ...prev]);
          }
        }
      };
    } catch {}

    return () => {
      try { bc?.close(); } catch {}
    };
  }, []);

  const [incidents, setIncidents] = useState<IncidentItem[]>([
    {
      id: 'INC-9482-A',
      title: 'Quantum correlation breach',
      severity: 'HIGH',
      status: 'INVESTIGATING',
      assigned: 'A. Kovacs (L2)',
      impact: 'HIGH',
      qber: '7.42%',
      chsh: '2.12',
      timestamp: '10:58:02',
      analyst: 'A. Kovacs',
      detail: 'A QBER divergence on the authenticated channel is under active forensic review.',
      events: [
        ['10:58:02 UTC', 'Threat detected', 'QBER moved above the nominal confidence envelope (7.42% > 5.50%).'],
        ['10:58:10 UTC', 'Threshold exceeded', 'Photon-pair records sealed after the Hoeffding confidence boundary was crossed.'],
        ['10:59:01 UTC', 'Operator assignment', 'Incident assigned to the optical assurance queue.']
      ],
      helstrom: 'P_e ≥ 0.1140',
      traceDistance: 'D = 0.4140',
      targetNode: 'QN-ALICE (signer)'
    },
    {
      id: 'INC-9481-B',
      title: 'Quantum channel intercept-resend',
      severity: 'CRITICAL',
      status: 'INVESTIGATING',
      assigned: 'M. Ito (L3)',
      impact: 'CRITICAL',
      qber: '14.20%',
      chsh: '1.76',
      timestamp: '10:48:16',
      analyst: 'M. Ito',
      detail: '[CLASSIFIED: INTERCEPT_RESEND] Eavesdropper Eve intercepted and measured photons on the quantum channel, collapsing quantum superposition.',
      events: [
        ['10:48:16 UTC', 'Threat detected', 'CRITICAL: Intercept-resend attack detected. QBER (14.2%) breached Hoeffding cutoff (5.5%). Bell correlation collapsed (S=1.76 < 2.00).'],
        ['10:48:24 UTC', 'Threshold exceeded', 'QBER 14.20% breached security cutoff (5.0%). Non-locality collapsed (S=1.76).'],
        ['10:48:32 UTC', 'Escalation', 'Channel held for signature acceptance review and L3 forensic handoff.']
      ],
      helstrom: 'P_e ≥ 0.0820',
      traceDistance: 'D = 0.8360',
      targetNode: 'QN-BOB (receiver)'
    },
    {
      id: 'INC-9479-X',
      title: 'Channel lockout mitigation',
      severity: 'LOW',
      status: 'RESOLVED',
      assigned: 'SYSTEM AUTO',
      impact: 'LOW',
      qber: '4.88%',
      chsh: '2.68',
      timestamp: '10:42:01',
      analyst: 'SYSTEM AUTO',
      detail: 'An automated channel lock was applied after repeated authentication failures on the secure transport boundary.',
      events: [
        ['10:42:01 UTC', 'Threat detected', 'Anomaly detected in the authenticated command sequence from 192.168.1.55.'],
        ['10:42:15 UTC', 'Threshold exceeded', 'Five failed authentication attempts occurred inside the ten-second observation window.'],
        ['10:42:16 UTC', 'Auto-resolution', 'A temporary perimeter quarantine was applied and the node was removed from active routing.']
      ],
      helstrom: 'P_e ≥ 0.1464',
      traceDistance: 'D = 0.1720',
      targetNode: 'ARBITRATOR core'
    }
  ]);

  const [threats, setThreats] = useState<ThreatAnomalyItem[]>([
    { id: 'THR-104', severity: 'CRITICAL', origin: 'THREAT ENGINE', badge: 'QUARANTINED', type: 'Signature aborted (intercept-resend eavesdropping)', time: '23:41:16', baseline: '1.2%', current: '14.2%', detail: 'Intercept-resend disturbance triggered the confidence boundary and halted the signature stream.', qber: 0.142, chsh: 1.76 },
    { id: 'THR-103', severity: 'CRITICAL', origin: 'NODE-EVE-01', badge: '', type: 'Quantum channel intercept-resend', time: '23:40:57', baseline: '1.5%', current: '12.7%', detail: 'Unauthorized basis observation was inferred from the observed QBER uplift.', qber: 0.127, chsh: 1.82 },
    { id: 'THR-102', severity: 'CRITICAL', origin: 'NONCE-CACHE-01', badge: '', type: 'Stale nonce and payload replay', time: '23:40:50', baseline: '0.8%', current: '9.1%', detail: 'Replay candidate reappeared outside the permitted one-time-pad window.', qber: 0.091, chsh: 1.91 },
    { id: 'THR-101', severity: 'CRITICAL', origin: 'ARB-CORE-01', badge: '', type: 'One-time pad signature forgery', time: '23:40:43', baseline: '1.0%', current: '8.4%', detail: 'Signature mismatch appeared after the classical correction frame closed.', qber: 0.084, chsh: 1.95 },
    { id: 'THR-100', severity: 'HIGH', origin: '192.168.1.104', badge: '', type: 'Sift mismatch breach', time: '23:39:08', baseline: '1.9%', current: '7.7%', detail: 'Sifting disagreement exceeded the nominal data-reconciliation threshold.', qber: 0.077, chsh: 2.05 },
    { id: 'THR-099', severity: 'HIGH', origin: 'QKD-NODE-07', badge: '', type: 'Pauli frame mismatch', time: '23:35:56', baseline: '2.1%', current: '5.7%', detail: 'A correction frame checksum failed verification.', qber: 0.057, chsh: 2.22 },
    { id: 'THR-098', severity: 'MEDIUM', origin: 'FIBER-22', badge: '', type: 'Optical noise envelope', time: '22:20:56', baseline: '1.4%', current: '3.9%', detail: 'Attenuation drift is observable but remains below the intervention threshold.', qber: 0.039, chsh: 2.45 }
  ]);

  const [sessions, setSessions] = useState<SessionStreamItem[]>([
    { id: '01', endpoint: 'QNode-A-09', state: 'STABLE', rate: '245.8', duration: '04:12:33', trace: 'wave', tone: 'good' },
    { id: '02', endpoint: 'QNode-F-22', state: 'DEGRADED', rate: '112.4', duration: '01:45:10', trace: 'rise', tone: 'copper' },
    { id: '03', endpoint: 'Sat-Link-Alpha', state: 'STABLE', rate: '450.1', duration: '12:05:44', trace: 'step', tone: 'good' },
    { id: '04', endpoint: 'QNode-B-17', state: 'STABLE', rate: '193.7', duration: '00:54:12', trace: 'wave-low', tone: 'blue' }
  ]);

  const [payloads, setPayloads] = useState<TransmissionRecord[]>([
    {
      id: "TX-3635",
      time: "02:51:30.587",
      verification: "Verified / PQC Dilithium3 fallback",
      title: "Classified defense telemetry",
      body: "CLASSIFIED DEFENSE TELEMETRY: Quantum one-time-pad key handshake verified for orbital satellite relay Alpha-09.",
      signature: "PQC LATTICE SIGNATURE (CRYSTALS-DILITHIUM3 / ML-DSA-65):\n3a7d9f2e4b6c8d0ef1a3b5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e...",
      qber: "8.77%",
      chsh: "1.77",
      pauli: "PQC ML-DSA-65",
      tone: "pqc",
      metricTone: "text-copper"
    },
    {
      id: "TX-2853",
      time: "20:42:10.301",
      verification: "Verified / physical QDS",
      title: "Authenticated routing manifest",
      body: "QDS transport layer confirmed a physical signature match for the protected relay schedule.",
      signature: "PHYSICAL QDS ATTESTATION:\nBell-state witness sealed · optical entropy verified · channel path authenticated",
      qber: "1.90%",
      chsh: "2.78",
      pauli: "I · σZ",
      tone: "good",
      metricTone: "status-text-good"
    }
  ]);

  const getAttackDiagnostics = (title: string, qberVal: number, chshVal: number) => {
    if (title.includes('MitM')) {
      return `THREAT DIAGNOSIS [MITM INTERCEPT-RESEND]
1. Adversarial Tap: Eve intercepted photon pulses on fiber link quantum-link-01, performing unauthorized basis measurements.
2. Quantum Decoherence: QBER surged to ${(qberVal * 100).toFixed(1)}% (breaching the 5.50% Hoeffding bound). Bell CHSH collapsed to S=${chshVal.toFixed(2)} (< 2.00 classical limit).

AUTOMATED REMEDIATION PLAN EXECUTED
1. Zeroized physical sifted key registers from volatile hardware RAM.
2. Dynamic PQC Handover: Hot-swapped quantum channel to NIST CRYSTALS-Dilithium3 (ML-DSA-65) post-quantum signature.
3. Isolated probe tap EVE-PROBE-07 and alerted L3 SOC Operations.`;
    }
    if (title.includes('Forgery')) {
      return `THREAT DIAGNOSIS [FEED-FORWARD BIT FORGERY]
1. Integrity Breach: Tampering identified in classical reconciliation feed-forward bits during Pauli frame alignment.
2. Anomaly Metric: QBER reached ${(qberVal * 100).toFixed(1)}%, Bell CHSH S=${chshVal.toFixed(2)}. Signature attestation aborted.

AUTOMATED REMEDIATION PLAN EXECUTED
1. Flushed reconciliation buffer and revoked tainted session token.
2. PQC Fallback Activated: Encapsulated payload with ML-DSA-65 lattice signature.
3. Node Alice re-authenticated with fresh Toeplitz hash witness.`;
    }
    if (title.includes('Replay')) {
      return `THREAT DIAGNOSIS [STALE NONCE REPLAY ATTACK]
1. Replay Vector: Captured transmission nonce retransmitted outside the authorized 10-second OTP window.
2. Security Breach: QBER elevated to ${(qberVal * 100).toFixed(1)}%, CHSH S=${chshVal.toFixed(2)}. Timestamp hash mismatch detected.

AUTOMATED REMEDIATION PLAN EXECUTED
1. Expired nonce cache purged and blacklisted globally across all arbitrating nodes.
2. Engaged NIST Kyber768 / Dilithium3 Post-Quantum Key Encapsulation.
3. Channel locked for forensic integrity snapshot.`;
    }
    if (title.includes('PNS')) {
      return `THREAT DIAGNOSIS [PHOTON-NUMBER SPLITTING (PNS) TAP]
1. Multiphoton Eavesdropping: Probe isolated multi-photon pulses from SPDC source, siphoning key bits without full state collapse.
2. Metric Breach: QBER measured at ${(qberVal * 100).toFixed(1)}% with CHSH S=${chshVal.toFixed(2)}.

AUTOMATED REMEDIATION PLAN EXECUTED
1. Switched source to decoy-state protocol with randomized photon intensities.
2. Re-routed active traffic to CRYSTALS-Dilithium3 post-quantum lattice channel.`;
    }
    if (title.includes('Noise')) {
      return `THREAT DIAGNOSIS [THERMAL FIBER NOISE DRIFT]
1. Optical Jitter: Thermal drift and polarization mode dispersion on dark fiber link 01.
2. Margin Metric: QBER elevated to ${(qberVal * 100).toFixed(1)}% (below 5.5% cutoff), CHSH S=${chshVal.toFixed(2)} (quantum boundary maintained).

AUTOMATED REMEDIATION PLAN EXECUTED
1. Dynamic polarization controller recalibrated optical phase.
2. Quantum channel maintained under high-vigilance monitoring.`;
    }
    return `STATUS NOMINAL [QUANTUM SECURE]
1. Physical QDS teleportation keys verified with zero eavesdropping.
2. QBER is ${(qberVal * 100).toFixed(2)}% (within 5.5% bound). Bell non-locality CHSH S=${chshVal.toFixed(2)} > 2.0 (quantum secure).`;
  };

  const toggleEve = async () => {
    const nextEve = !eveActive;
    setEveActive(nextEve);
    const newQber = nextEve ? 0.142 : 0.019;
    const newChsh = nextEve ? 1.76 : 2.76;
    setQber(newQber);
    setChsh(newChsh);

    const nowStr = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(100 + Math.random() * 899);

    try {
      if (nextEve) {
        await apiClient.injectAttack('forgery');
      }
      const res = await apiClient.auditAndRemediate({ qber_override: newQber, chsh_score: newChsh });
      setPqcMode(res.status === 'PQC_FALLBACK_ACTIVE');
      setRemediationReport(res.ai_cognitive_report || getAttackDiagnostics('MitM attack', newQber, newChsh));
    } catch {
      setPqcMode(nextEve);
      setRemediationReport(getAttackDiagnostics(nextEve ? 'MitM attack' : 'Clean signature', newQber, newChsh));
    }

    if (nextEve) {
      setActiveAttack('MitM attack');
      const newEvt: TelemetryItem = {
        id: `evt-${Date.now()}`,
        time: nowStr,
        source: 'EVE-PROBE',
        text: 'Intercept-resend attack tap detected on optical link (QBER 14.2%)',
        ms: '85ms',
        code: '403 FORBIDDEN',
        qber: '14.2%',
        chsh: '1.76',
        isThreat: true
      };
      setTelemetryLogs((prev) => [newEvt, ...prev]);

      const newInc: IncidentItem = {
        id: `INC-2026-${Math.floor(1000 + Math.random() * 8999)}`,
        title: 'Man-in-the-Middle Interception Tap',
        severity: 'CRITICAL',
        status: 'INVESTIGATING',
        assigned: 'A. Kovacs (L2)',
        impact: 'CRITICAL',
        qber: '14.20%',
        chsh: '1.76',
        timestamp: nowStr.slice(0, 8),
        analyst: 'A. Kovacs',
        detail: 'QBER 14.2% crossed Hoeffding threshold cutoff (5.5%). Bell correlation collapsed (S=1.76 < 2.0).',
        events: [
          [`${nowStr.slice(0, 8)} UTC`, 'Eavesdropping Intercept', 'Eve tapped fiber channel 01; state collapse identified.'],
          [`${nowStr.slice(0, 8)} UTC`, 'Hoeffding Breach', 'QBER breached 5.50% statistical confidence bound.'],
          [`${nowStr.slice(0, 8)} UTC`, 'PQC Fallback', 'CRYSTALS-Dilithium3 post-quantum handover engaged.']
        ],
        helstrom: 'P_e ≥ 0.0820',
        traceDistance: 'D = 0.8360',
        targetNode: 'QN-BOB (receiver)'
      };
      setIncidents((prev) => [newInc, ...prev]);

      setSessions((prev) => prev.map((s, i) => i === 0 ? { ...s, state: 'DEGRADED', tone: 'copper', rate: '84.2', trace: 'rise' } : s));

      toast.error("Global Threat Injected: Eve interception active across all quantum channels! QBER = 14.2%. SOC Dashboard updated!");
    } else {
      setActiveAttack('Clean signature');
      const newEvt: TelemetryItem = {
        id: `evt-${Date.now()}`,
        time: nowStr,
        source: 'ARB-CORE',
        text: 'Channel restored · Eve bypassed · QBER returned to nominal 1.9%',
        ms: '12ms',
        code: '200 OK',
        qber: '1.9%',
        chsh: '2.76',
        isThreat: false
      };
      setTelemetryLogs((prev) => [newEvt, ...prev]);

      setSessions((prev) => prev.map((s, i) => i === 0 ? { ...s, state: 'STABLE', tone: 'good', rate: '245.8', trace: 'wave' } : s));

      toast.success("Global Channel Restored: Eve bypassed. Quantum channel operating at nominal QBER = 1.9%.");
    }
  };

  const triggerAttack = async (attackTitle: string, customQber?: number, customChsh?: number) => {
    setActiveAttack(attackTitle);
    const isThreat = attackTitle !== "Clean signature";
    setEveActive(isThreat);
    const targetQber = customQber ?? (isThreat ? 0.142 : 0.019);
    const targetChsh = customChsh ?? (isThreat ? 1.76 : 2.76);
    setQber(targetQber);
    setChsh(targetChsh);

    const nowStr = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(100 + Math.random() * 899);
    const diagReport = getAttackDiagnostics(attackTitle, targetQber, targetChsh);

    try {
      let attackType: 'forgery' | 'replay' | 'noise' | 'pns' = 'forgery';
      if (attackTitle.includes("Replay")) attackType = 'replay';
      else if (attackTitle.includes("Noise")) attackType = 'noise';
      else if (attackTitle.includes("PNS")) attackType = 'pns';

      if (isThreat) {
        await apiClient.injectAttack(attackType);
      }

      const res = await apiClient.auditAndRemediate({ qber_override: targetQber, chsh_score: targetChsh });
      setPqcMode(res.status === 'PQC_FALLBACK_ACTIVE');
      setRemediationReport(res.ai_cognitive_report || diagReport);
    } catch {
      setPqcMode(isThreat);
      setRemediationReport(diagReport);
    }

    if (isThreat) {
      const qberFormatted = `${(targetQber * 100).toFixed(1)}%`;
      const chshFormatted = targetChsh.toFixed(2);
      const isNoise = attackTitle.includes("Noise");
      setPqcMode(true);
      const newEvents: TelemetryItem[] = [
        {
          id: `evt-${Date.now()}-1`,
          time: nowStr,
          source: 'EVE-PROBE',
          text: `[ATTACK ACTIVE: ${attackTitle.toUpperCase()}] Adversarial optical disturbance injected · QBER elevated (${qberFormatted})`,
          ms: '14ms',
          code: '403 FORBIDDEN',
          qber: qberFormatted,
          chsh: chshFormatted,
          payloadContent: 'board-resolution.pdf',
          isThreat: true
        },
        {
          id: `evt-${Date.now()}-2`,
          time: nowStr,
          source: 'HOEFFDING-AUDIT',
          text: `Hoeffding bound breached: QBER ${qberFormatted} > 5.50% cutoff limit`,
          ms: '8ms',
          code: '0xFA BREACH',
          qber: qberFormatted,
          chsh: chshFormatted,
          payloadContent: 'board-resolution.pdf',
          isThreat: true
        },
        {
          id: `evt-${Date.now()}-3`,
          time: nowStr,
          source: 'BELL-WITNESS',
          text: `CHSH Bell test failed: S=${chshFormatted} collapsed to classical limit (S < 2.00)`,
          ms: '19ms',
          code: 'REJECT',
          qber: qberFormatted,
          chsh: chshFormatted,
          payloadContent: 'board-resolution.pdf',
          isThreat: true
        },
        {
          id: `evt-${Date.now()}-4`,
          time: nowStr,
          source: 'PQC-GATEWAY',
          text: `[PQC FALLBACK SUCCESS] Channel hot-swapped to CRYSTALS-Dilithium3 (ML-DSA-65) + ML-KEM-768 · Communication 100% secured`,
          ms: '4ms',
          code: '200 OK',
          qber: qberFormatted,
          chsh: chshFormatted,
          payloadContent: 'board-resolution.pdf',
          isThreat: false
        }
      ];
      setTelemetryLogs((prev) => [...newEvents, ...prev]);

      const uniqueSuffix = Date.now().toString().slice(-4) + '-' + Math.floor(Math.random() * 900 + 100);
      const newThreat: ThreatAnomalyItem = {
        id: `THR-LIVE-${uniqueSuffix}`,
        severity: isNoise ? 'MEDIUM' : 'CRITICAL',
        origin: 'ATTACK SANDBOX / EVE',
        badge: 'ACTIVE ATTACK',
        type: `Live Injection: ${attackTitle}`,
        time: nowStr.slice(0, 8),
        baseline: '1.9%',
        current: qberFormatted,
        detail: `Adversarial scenario "${attackTitle}" injected from sandbox. QBER=${qberFormatted}, CHSH S=${chshFormatted}. PQC fallback ready.`,
        qber: targetQber,
        chsh: targetChsh
      };
      setThreats((prev) => [newThreat, ...prev]);

      const newInc: IncidentItem = {
        id: `INC-LIVE-${uniqueSuffix}`,
        title: `Simulated Breach: ${attackTitle}`,
        severity: isNoise ? 'MEDIUM' : 'CRITICAL',
        status: 'INVESTIGATING',
        assigned: 'A. Kovacs (L2)',
        impact: isNoise ? 'MEDIUM' : 'CRITICAL',
        qber: qberFormatted,
        chsh: chshFormatted,
        timestamp: nowStr.slice(0, 8),
        analyst: 'A. Kovacs',
        detail: `QBER ${qberFormatted} reached Hoeffding threshold cutoff (5.5%). CHSH Bell violation collapsed (S=${chshFormatted} < 2.0). Attack vector: ${attackTitle}.`,
        events: [
          [`${nowStr.slice(0, 8)} UTC`, `Attack Staged: ${attackTitle}`, `Adversarial injection initiated via Red-Team Sandbox.`],
          [`${nowStr.slice(0, 8)} UTC`, 'Hoeffding Bound Breach', `Statistical error rate reached ${qberFormatted} (limit 5.50%).`],
          [`${nowStr.slice(0, 8)} UTC`, 'Automated PQC Handover', 'Engaged CRYSTALS-Dilithium3 / ML-DSA-65 post-quantum lattice signature.']
        ],
        helstrom: targetQber > 0.1 ? 'P_e ≥ 0.0820' : 'P_e ≥ 0.1240',
        traceDistance: targetQber > 0.1 ? 'D = 0.8360' : 'D = 0.4420',
        targetNode: attackTitle.includes('Forgery') ? 'QN-ALICE (signer)' : 'QN-BOB (receiver)'
      };
      setIncidents((prev) => [newInc, ...prev]);

      setSessions((prev) => prev.map((s, i) => i === 0 ? {
        ...s,
        state: 'DEGRADED',
        tone: 'copper',
        rate: isNoise ? '184.2' : '82.5',
        trace: 'rise'
      } : s));

      // Broadcast and persist for multi-tab synchronization
      try {
        const bc = new BroadcastChannel('qds_quantum_telemetry');
        bc.postMessage({ type: 'ATTACK_TRIGGERED', payload: { attackTitle, qber: targetQber, chsh: targetChsh, newEvents, newThreat, newInc } });
        bc.close();
      } catch {}

      try {
        localStorage.setItem('qds_active_attack', attackTitle);
        localStorage.setItem('qds_qber', targetQber.toString());
        localStorage.setItem('qds_chsh', targetChsh.toString());
      } catch {}

      toast.error(`[SOC DASHBOARD UPDATED] ${attackTitle} active! Metrics, Incidents, Threats & Live Telemetry synced.`);
    } else {
      const cleanEvents: TelemetryItem[] = [
        {
          id: `evt-${Date.now()}-1`,
          time: nowStr,
          source: 'ARBITRATOR',
          text: '[CLEAN SIGNATURE] Authenticated Bell-pair exchange restored · QBER 1.9% · CHSH S=2.76',
          ms: '12ms',
          code: '200 OK',
          qber: '1.9%',
          chsh: '2.76',
          payloadContent: 'board-resolution.pdf',
          isThreat: false
        },
        {
          id: `evt-${Date.now()}-2`,
          time: nowStr,
          source: 'QN-ALICE',
          text: 'BSM projection completed on "board-resolution.pdf" · zero eavesdropping detected',
          ms: '16ms',
          code: '200 OK',
          qber: '1.9%',
          chsh: '2.76',
          payloadContent: 'board-resolution.pdf',
          isThreat: false
        },
        {
          id: `evt-${Date.now()}-3`,
          time: nowStr,
          source: 'PRIVACY_AMP',
          text: 'Toeplitz matrix distilled unforgeable 256-bit quantum OTP token',
          ms: '8ms',
          code: '200 OK',
          qber: '1.9%',
          chsh: '2.76',
          payloadContent: 'board-resolution.pdf',
          isThreat: false
        }
      ];
      setTelemetryLogs((prev) => [...cleanEvents, ...prev]);

      setThreats((prev) => prev.filter(t => !t.id.startsWith('THR-LIVE')));
      setIncidents((prev) => prev.filter(i => i.id !== 'INC-2026-LIVE'));

      setSessions((prev) => prev.map((s, i) => i === 0 ? {
        ...s,
        state: 'STABLE',
        tone: 'good',
        rate: '245.8',
        trace: 'wave'
      } : s));

      try {
        const bc = new BroadcastChannel('qds_quantum_telemetry');
        bc.postMessage({ type: 'CHANNEL_RESTORED', payload: { attackTitle: 'Clean signature', qber: 0.019, chsh: 2.76, newEvents: cleanEvents } });
        bc.close();
      } catch {}

      try {
        localStorage.setItem('qds_active_attack', 'Clean signature');
        localStorage.setItem('qds_qber', '0.019');
        localStorage.setItem('qds_chsh', '2.76');
      } catch {}

      toast.success("[SOC DASHBOARD UPDATED] Clean channel & nominal telemetry restored.");
    }
  };

  const pushTelemetryLogs = (items: TelemetryItem[]) => {
    setTelemetryLogs((prev) => [...items, ...prev]);

    const threatItems = items.filter(i => i.isThreat || i.code.includes('403') || i.code.includes('0xFA') || i.code.includes('REJECT') || i.code.includes('503') || i.source.includes('EVE'));

    let newThreat: ThreatAnomalyItem | undefined;
    let newInc: IncidentItem | undefined;

    if (threatItems.length > 0) {
      const top = threatItems[0];
      const nowTime = top.time.split('.')[0] || new Date().toTimeString().split(' ')[0];
      const qberNum = parseFloat(top.qber?.replace('%', '') || '14.2') / 100;
      const chshNum = parseFloat(top.chsh || '1.76');

      newThreat = {
        id: `THR-LIVE-${Date.now().toString().slice(-4)}`,
        severity: qberNum > 0.10 ? 'CRITICAL' : 'HIGH',
        origin: top.source,
        badge: top.code,
        type: top.source.includes('EVE') ? 'Adversarial Intercept (Eve Tap)' : top.source.includes('HOEFFDING') ? 'Hoeffding Statistical Breach' : 'Quantum Disturbance',
        time: nowTime,
        baseline: '1.9%',
        current: top.qber || '14.2%',
        detail: top.text,
        qber: qberNum,
        chsh: chshNum
      };

      newInc = {
        id: `INC-LIVE-${Date.now().toString().slice(-4)}`,
        title: top.source.includes('EVE') ? 'Optical Intercept & State Collapse' : 'Quantum Statistical Boundary Breach',
        severity: qberNum > 0.10 ? 'CRITICAL' : 'HIGH',
        status: 'INVESTIGATING',
        assigned: 'SOC Operator / QDS AI',
        impact: qberNum > 0.10 ? 'CRITICAL' : 'HIGH',
        qber: top.qber || '14.20%',
        chsh: top.chsh || '1.76',
        timestamp: nowTime,
        analyst: 'Automated SOC Probe',
        detail: `[FORENSIC EVIDENCE CAPTURED] ${top.text} · Source: ${top.source} · Code: ${top.code}`,
        events: [
          [`${nowTime} UTC`, 'Anomaly raised in live stream', top.text],
          [`${nowTime} UTC`, 'Hoeffding limit breach', `Observed QBER ${top.qber} breached security threshold. Bell score S=${top.chsh}.`],
          [`${nowTime} UTC`, 'Containment protocol active', 'L3 Forensic evidence isolated. Dilithium3 PQC fallback armed.']
        ],
        helstrom: 'P_e ≥ 0.0820',
        traceDistance: 'D = 0.8360',
        targetNode: top.source
      };

      setThreats((prev) => [newThreat!, ...prev.filter(t => t.id !== newThreat!.id)]);
      setIncidents((prev) => [newInc!, ...prev.filter(i => i.id !== newInc!.id)]);
    }

    try {
      const bc = new BroadcastChannel('qds_quantum_telemetry');
      bc.postMessage({
        type: 'NEW_TELEMETRY_ITEM',
        payload: {
          newEvents: items,
          newThreat,
          newInc
        }
      });
      bc.close();
    } catch {}
  };

  const sendTransmission = async (payload: { mode: 'message' | 'document'; message?: string; file?: File | null; digest?: string | null }) => {
    const txId = "TX-" + Math.floor(1000 + Math.random() * 8999);
    const nowTime = new Date().toTimeString().split(' ')[0] + "." + Math.floor(100 + Math.random() * 899).toString();
    const isDoc = payload.mode === "document" && Boolean(payload.file);
    const payloadTitle = isDoc && payload.file ? payload.file.name : (payload.message?.slice(0, 32) || "quantum signed message");
    const payloadHash = payload.digest || "0x6692d35f98fc1c149afbf4c8996fb92427ae4fe4649b934ca495991b7852b8";

    let res: any = null;
    try {
      res = await apiClient.auditAndRemediate({
        document_hash: payloadHash,
        qber_override: qber,
        chsh_score: chsh
      });
    } catch {
      // fallback
    }

    const fallbackActive = res ? res.status === 'PQC_FALLBACK_ACTIVE' : (eveActive || qber > 0.055);
    const sig = fallbackActive
      ? (res?.fallback_signature ? `PQC LATTICE SIGNATURE (CRYSTALS-DILITHIUM3 / ML-DSA-65):\n${res.fallback_signature}` : "PQC LATTICE SIGNATURE (CRYSTALS-DILITHIUM3 / ML-DSA-65):\n3a7d9f2e4b6c8d0ef1a3b5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e...")
      : "PHYSICAL QDS ATTESTATION:\nBell-state witness sealed · optical entropy verified · channel path authenticated";

    const record: TransmissionRecord = {
      id: txId,
      time: nowTime,
      verification: fallbackActive ? "Verified / PQC Dilithium3 fallback engaged" : "Verified / physical QDS",
      title: isDoc && payload.file ? payload.file.name : "quantum signed payload",
      body: isDoc && payload.file
        ? `DOCUMENT PAYLOAD: ${payload.file.name} · sealed for authenticated delivery across channel ${activeSessionId}.`
        : payload.message || "Empty payload",
      signature: sig,
      qber: `${(qber * 100).toFixed(2)}%`,
      chsh: chsh.toFixed(2),
      pauli: fallbackActive ? "PQC ML-DSA-65" : "I · σZ",
      tone: fallbackActive ? "pqc" : "good",
      metricTone: fallbackActive ? "text-copper" : "status-text-good"
    };

    setPayloads((prev) => [record, ...prev]);

    const displayPayload = isDoc && payload.file
      ? payload.file.name
      : (payload.message ? payload.message.slice(0, 10) : "EMPTY");

    // Push 3 live telemetry events for this transfer execution
    const txEvents: TelemetryItem[] = [
      {
        id: `evt-tx-${Date.now()}-1`,
        time: nowTime,
        source: 'QN-ALICE',
        text: `[TRANSFER DISPATCH] "${payloadTitle}" hashed (SHA-256: ${payloadHash.slice(0, 16)}...) · sealed for dispatch [${txId}]`,
        ms: '8ms',
        code: '200 OK',
        qber: `${(qber * 100).toFixed(1)}%`,
        chsh: chsh.toFixed(2),
        payloadContent: displayPayload,
        isThreat: false
      },
      {
        id: `evt-tx-${Date.now()}-2`,
        time: nowTime,
        source: fallbackActive ? 'EVE-PROBE' : 'ARB-CORE',
        text: fallbackActive
          ? `[TRANSFER INTERCEPT] Eavesdropping disturbance detected on optical fiber relay · QBER elevated (${(qber * 100).toFixed(1)}%)`
          : `[TRANSFER] Arbitrator verified optical entropy witness · Bell non-locality confirmed (S=${chsh.toFixed(2)})`,
        ms: fallbackActive ? '82ms' : '15ms',
        code: fallbackActive ? '403 FORBIDDEN' : '200 OK',
        qber: `${(qber * 100).toFixed(1)}%`,
        chsh: chsh.toFixed(2),
        payloadContent: displayPayload,
        isThreat: fallbackActive
      },
      {
        id: `evt-tx-${Date.now()}-3`,
        time: nowTime,
        source: 'QN-BOB',
        text: fallbackActive
          ? `[TRANSFER COMPLETE] NIST Dilithium3 Post-Quantum Fallback signature verified & accepted at Node Beta`
          : `[TRANSFER COMPLETE] Physical QDS teleportation signature verified unconditionally at Node Beta`,
        ms: '11ms',
        code: fallbackActive ? 'PQC_VERIFIED' : '200 OK',
        qber: `${(qber * 100).toFixed(1)}%`,
        chsh: chsh.toFixed(2),
        payloadContent: displayPayload,
        isThreat: fallbackActive
      }
    ];

    pushTelemetryLogs(txEvents);

    if (fallbackActive) {
      toast.warning(`Payload ${txId} transmitted under attack! PQC Dilithium3 Fallback signature generated successfully.`);
    } else {
      toast.success(`Payload ${txId} verified and delivered via physical QDS channel.`);
    }
  };

  const executeProtocolRun = async (documentName: string = 'board-resolution.pdf', isEveActive?: boolean) => {
    const isThreat = isEveActive ?? eveActive;
    const nowStr = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(100 + Math.random() * 899);

    let res: any = null;
    try {
      res = await apiClient.runWorkflow({
        document_name: documentName,
        num_pairs: 100,
        is_eve_active: isThreat,
        attack_type: isThreat ? 'mitm' : 'clean'
      });
    } catch {
      // Fallback
      res = {
        session_id: `QKD-${Date.now().toString().slice(-4)}`,
        status: isThreat ? 'REJECTED' : 'VERIFIED',
        metrics: {
          qber: isThreat ? 0.142 : 0.016,
          chsh_score: isThreat ? 1.76 : 2.81,
          hoeffding_threshold: 0.055
        },
        verdict: {
          verdict: isThreat ? 'REJECT' : 'ACCEPT',
          threat_detected: isThreat
        }
      };
    }

    const runQber = isThreat ? (res?.metrics?.qber ?? 0.142) : (res?.metrics?.qber && res.metrics.qber <= 0.055 ? res.metrics.qber : 0.019);
    const runChsh = isThreat ? (res?.metrics?.chsh_score ?? 1.76) : (res?.metrics?.chsh_score && res.metrics.chsh_score >= 2.0 ? res.metrics.chsh_score : 2.76);
    const isRejected = isThreat;
    const qberStr = `${(runQber * 100).toFixed(1)}%`;
    const chshStr = runChsh.toFixed(2);

    setQber(runQber);
    setChsh(runChsh);
    setPqcMode(isRejected);

    const newProtocolEvents: TelemetryItem[] = [
      {
        id: `evt-${Date.now()}-1`,
        time: nowStr,
        source: 'ARB-CORE',
        text: `[PROTOCOL DEMO] SPDC Photon pair distribution (1550nm) initialized for session ${res?.session_id || 'QKD-260827-91F4'}`,
        ms: '12ms',
        code: '200 OK',
        qber: qberStr,
        chsh: chshStr,
        payloadContent: documentName,
        isThreat: false
      },
      {
        id: `evt-${Date.now()}-2`,
        time: nowStr,
        source: 'QN-ALICE',
        text: `Alice Bell-state measurement (BSM) executed on "${documentName}" · feed-forward bits generated`,
        ms: '18ms',
        code: '200 OK',
        qber: qberStr,
        chsh: chshStr,
        payloadContent: documentName,
        isThreat: false
      },
      {
        id: `evt-${Date.now()}-3`,
        time: nowStr,
        source: isThreat ? 'EVE-PROBE' : 'QN-BOB',
        text: isThreat
          ? `[EVE INTERCEPT DETECTED] Optical tap collapsed superposition state on fiber link 01`
          : `Bob Pauli alignment completed: σX/σZ applied · quantum state fidelity verified`,
        ms: isThreat ? '85ms' : '19ms',
        code: isThreat ? '403 FORBIDDEN' : '200 OK',
        qber: qberStr,
        chsh: chshStr,
        payloadContent: documentName,
        isThreat: isThreat
      },
      {
        id: `evt-${Date.now()}-4`,
        time: nowStr,
        source: 'HOEFFDING-GATE',
        text: `Hoeffding bound evaluation: QBER ${qberStr} ${isRejected ? '> 5.50% (BREACH)' : '<= 5.50% (PASS)'} · CHSH S=${chshStr}`,
        ms: '14ms',
        code: isRejected ? '0xFA BREACH' : '200 OK',
        qber: qberStr,
        chsh: chshStr,
        payloadContent: documentName,
        isThreat: isRejected
      },
      {
        id: `evt-${Date.now()}-5`,
        time: nowStr,
        source: 'ARBITRATOR-VERDICT',
        text: isRejected
          ? `[DECISION: REJECT] Security threat confirmed · dynamic CRYSTALS-Dilithium3 PQC handover engaged`
          : `[DECISION: ACCEPT] Quantum digital signature sealed and verified unforgeable`,
        ms: '6ms',
        code: isRejected ? 'REJECT_PQC' : 'ACCEPT_200',
        qber: qberStr,
        chsh: chshStr,
        payloadContent: documentName,
        isThreat: isRejected
      }
    ];

    pushTelemetryLogs(newProtocolEvents);

    if (isThreat) {
      const uniqueSuffix = Date.now().toString().slice(-4) + '-' + Math.floor(Math.random() * 900 + 100);
      const newThreat: ThreatAnomalyItem = {
        id: `THR-LIVE-${uniqueSuffix}`,
        severity: 'CRITICAL',
        origin: 'DEMONSTRATION PROTOCOL / EVE',
        badge: 'ACTIVE ATTACK',
        type: 'Live Protocol Intercept',
        time: nowStr.slice(0, 8),
        baseline: '1.9%',
        current: qberStr,
        detail: `Adversarial intercept on document "${documentName}". QBER=${qberStr}, CHSH S=${chshStr}.`,
        qber: runQber,
        chsh: runChsh
      };
      setThreats((prev) => [newThreat, ...prev]);

      const newInc: IncidentItem = {
        id: `INC-LIVE-${uniqueSuffix}`,
        title: `Protocol Anomaly: Intercept on "${documentName}"`,
        severity: 'CRITICAL',
        status: 'INVESTIGATING',
        assigned: 'A. Kovacs (L2)',
        impact: 'CRITICAL',
        qber: qberStr,
        chsh: chshStr,
        timestamp: nowStr.slice(0, 8),
        analyst: 'A. Kovacs',
        detail: `QBER ${qberStr} breached Hoeffding threshold during protocol demonstration run on "${documentName}".`,
        events: [
          [`${nowStr.slice(0, 8)} UTC`, `Protocol Demonstration Run: ${documentName}`, `Adversarial probe active on transmission.`],
          [`${nowStr.slice(0, 8)} UTC`, 'Hoeffding Bound Breach', `Statistical error rate reached ${qberStr}.`],
          [`${nowStr.slice(0, 8)} UTC`, 'Automated PQC Handover', 'Engaged CRYSTALS-Dilithium3 / ML-DSA-65 post-quantum lattice signature.']
        ],
        helstrom: 'P_e ≥ 0.0820',
        traceDistance: 'D = 0.8360',
        targetNode: 'QN-BOB (receiver)'
      };
      setIncidents((prev) => [newInc, ...prev]);
    }

    return res;
  };

  const resolveIncident = (id: string) => {
    setIncidents((prev) => prev.map(inc => inc.id === id ? { ...inc, status: 'RESOLVED' } : inc));
    toast.success(`Incident ${id} marked as RESOLVED.`);
  };

  const quarantineNode = (nodeId: string) => {
    toast.error(`Containment protocol executed: ${nodeId} quarantined from optical routing.`);
  };

  const resetChannel = () => {
    setEveActive(false);
    setQber(0.019);
    setChsh(2.76);
    setPqcMode(false);
    setRemediationReport(null);
    setActiveAttack('Clean signature');
    setThreats((prev) => prev.filter(t => !t.id.startsWith('THR-LIVE')));
    setIncidents((prev) => prev.filter(i => i.id !== 'INC-2026-LIVE'));
    setSessions((prev) => prev.map((s, i) => i === 0 ? { ...s, state: 'STABLE', tone: 'good', rate: '245.8', trace: 'wave' } : s));
    toast.success("Global Quantum Channel reset to pristine nominal state.");
  };

  return (
    <SentinelContext.Provider value={{
      eveActive,
      activeSessionId,
      qber,
      chsh,
      pqcMode,
      remediationReport,
      payloads,
      telemetryLogs,
      incidents,
      threats,
      sessions,
      activeAttack,
      toggleEve,
      triggerAttack,
      executeProtocolRun,
      pushTelemetryLogs,
      sendTransmission,
      resetChannel,
      resolveIncident,
      quarantineNode
    }}>
      {children}
    </SentinelContext.Provider>
  );
};

export const useSentinel = () => {
  const context = useContext(SentinelContext);
  if (!context) {
    throw new Error('useSentinel must be used within a SentinelProvider');
  }
  return context;
};

