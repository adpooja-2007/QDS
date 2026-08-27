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

export interface SentinelContextType {
  eveActive: boolean;
  activeSessionId: string;
  qber: number;
  chsh: number;
  pqcMode: boolean;
  remediationReport: string | null;
  payloads: TransmissionRecord[];
  activeAttack: string;
  toggleEve: () => Promise<void>;
  triggerAttack: (attackType: string, customQber?: number, customChsh?: number) => Promise<void>;
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

    if (nextEve) {
      toast.error("Global Threat Injected: Eve interception active across all quantum channels! QBER = 14.2%. PQC Fallback Engaged!");
    } else {
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
