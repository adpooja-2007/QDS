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
  isThreat?: boolean;
}

export interface IncidentItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  qber: string;
  chsh: string;
  timestamp: string;
  analyst: string;
  detail: string;
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
  activeAttack: string;
  toggleEve: () => Promise<void>;
  triggerAttack: (attackTitle: string, customQber?: number, customChsh?: number) => Promise<void>;
  sendTransmission: (payload: { mode: 'message' | 'document'; message?: string; file?: File | null; digest?: string | null }) => Promise<void>;
  resetChannel: () => void;
}

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

export const SentinelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [eveActive, setEveActive] = useState(false);
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
  ]);

  const [incidents, setIncidents] = useState<IncidentItem[]>([
    { id: 'INC-2026-0801', title: 'Photon Number Splitting Tap', severity: 'CRITICAL', status: 'INVESTIGATING', qber: '14.2%', chsh: '1.76', timestamp: '11:48:09', analyst: 'A. Kovacs', detail: 'QBER 14.2% crossed Hoeffding bound; CHSH collapsed to 1.76.' },
    { id: 'INC-2026-0802', title: 'Replay State Injection', severity: 'HIGH', status: 'MITIGATED', qber: '8.6%', chsh: '1.91', timestamp: '11:31:08', analyst: 'J. Doe', detail: 'Captured nonce retransmit attempt blocked by Toeplitz hash.' },
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

  const toggleEve = async () => {
    const nextEve = !eveActive;
    setEveActive(nextEve);
    const newQber = nextEve ? 0.142 : 0.019;
    const newChsh = nextEve ? 1.76 : 2.76;
    setQber(newQber);
    setChsh(newChsh);

    try {
      if (nextEve) {
        await apiClient.injectAttack('forgery');
      }
      const res = await apiClient.auditAndRemediate({ qber_override: newQber, chsh_score: newChsh });
      setPqcMode(res.status === 'PQC_FALLBACK_ACTIVE');
      setRemediationReport(res.ai_cognitive_report || null);
    } catch {
      setPqcMode(nextEve);
    }

    const nowStr = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(100 + Math.random() * 899);

    if (nextEve) {
      const newEvt: TelemetryItem = {
        id: `evt-${Date.now()}`,
        time: nowStr,
        source: 'EVE-PROBE',
        text: 'Intercept-resend attack tap detected on optical link',
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
        qber: '14.2%',
        chsh: '1.76',
        timestamp: nowStr.slice(0, 8),
        analyst: 'A. Kovacs',
        detail: 'QBER 14.2% crossed Hoeffding threshold cutoff (5.5%). Bell correlation collapsed (S=1.76 < 2.0).'
      };
      setIncidents((prev) => [newInc, ...prev]);

      toast.error("Global Threat Injected: Eve interception active across all quantum channels! QBER = 14.2%. SOC Dashboard updated!");
    } else {
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
      setRemediationReport(res.ai_cognitive_report || null);
    } catch {
      setPqcMode(isThreat);
    }

    if (isThreat) {
      const newEvt: TelemetryItem = {
        id: `evt-${Date.now()}`,
        time: nowStr,
        source: 'ATTACK-SANDBOX',
        text: `[ATTACK INJECTED] ${attackTitle} staged on quantum optical channel.`,
        ms: '85ms',
        code: '403 FORBIDDEN',
        qber: `${(targetQber * 100).toFixed(1)}%`,
        chsh: targetChsh.toFixed(2),
        isThreat: true
      };
      setTelemetryLogs((prev) => [newEvt, ...prev]);

      const newInc: IncidentItem = {
        id: `INC-2026-${Math.floor(1000 + Math.random() * 8999)}`,
        title: `Simulated Attack: ${attackTitle}`,
        severity: attackTitle.includes("Noise") ? 'MEDIUM' : 'CRITICAL',
        status: 'INVESTIGATING',
        qber: `${(targetQber * 100).toFixed(1)}%`,
        chsh: targetChsh.toFixed(2),
        timestamp: nowStr.slice(0, 8),
        analyst: 'A. Kovacs',
        detail: `QBER ${(targetQber * 100).toFixed(1)}% reached Hoeffding bound. CHSH S=${targetChsh.toFixed(2)}.`
      };
      setIncidents((prev) => [newInc, ...prev]);

      toast.error(`[SOC DASHBOARD UPDATED] ${attackTitle} injected into live SOC telemetry stream!`);
    } else {
      const newEvt: TelemetryItem = {
        id: `evt-${Date.now()}`,
        time: nowStr,
        source: 'ATTACK-SANDBOX',
        text: '[CLEAN SIGNATURE] Pristine Bell-pair exchange restored.',
        ms: '12ms',
        code: '200 OK',
        qber: '1.9%',
        chsh: '2.76',
        isThreat: false
      };
      setTelemetryLogs((prev) => [newEvt, ...prev]);

      toast.success("[SOC DASHBOARD UPDATED] Clean channel restored.");
    }
  };

  const sendTransmission = async (payload: { mode: 'message' | 'document'; message?: string; file?: File | null; digest?: string | null }) => {
    const txId = "TX-" + Math.floor(1000 + Math.random() * 8999);
    const nowTime = new Date().toTimeString().split(' ')[0] + "." + Math.floor(100 + Math.random() * 899).toString();
    const isDoc = payload.mode === "document" && Boolean(payload.file);

    let res: any = null;
    try {
      res = await apiClient.auditAndRemediate({
        document_hash: payload.digest || undefined,
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

    if (fallbackActive) {
      toast.warning(`Payload ${txId} transmitted under attack! PQC Dilithium3 Fallback signature generated successfully.`);
    } else {
      toast.success(`Payload ${txId} verified and delivered via physical QDS channel.`);
    }
  };

  const resetChannel = () => {
    setEveActive(false);
    setQber(0.019);
    setChsh(2.76);
    setPqcMode(false);
    setRemediationReport(null);
    setActiveAttack('Clean signature');
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
      activeAttack,
      toggleEve,
      triggerAttack,
      sendTransmission,
      resetChannel
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
