import React, { useState } from 'react';
import { QuantumSession, PipelineStep } from '../../types/sentinel';
import {
  FileText,
  Upload,
  KeyRound,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface QuantumSignatureProps {
  activeSession: QuantumSession;
  pipelineSteps: PipelineStep[];
  onGenerateSignature: (docName: string, sizeKb: number) => Promise<QuantumSession>;
  isLoading: boolean;
}

export const QuantumSignaturePage: React.FC<QuantumSignatureProps> = ({
  activeSession,
  pipelineSteps,
  onGenerateSignature,
  isLoading,
}) => {
  const [docName, setDocName] = useState('defense_telemetry_dispatch_manifest_09.sig');
  const [fileSize, setFileSize] = useState(64.2);
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [lastSignedId, setLastSignedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await onGenerateSignature(docName, fileSize);
    if (created?.session_id) {
      setLastSignedId(created.session_id);
    }
  };

  const currentStep = pipelineSteps.find(s => s.id === activeStepId) || pipelineSteps[0];

  return (
    <div className="space-y-5 pb-8 max-w-[1600px] mx-auto">
      {/* ─── Success Notification Banner ─── */}
      {lastSignedId && (
        <div className="bg-[#EDFCF2] border border-[#73E2A3] rounded-lg p-3.5 flex items-center justify-between text-[12px] text-[#087443] shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#12B76A]" />
            <span className="font-semibold">Quantum Digital Signature generated & verified:</span>
            <span className="font-mono font-bold bg-[#D1FADF] px-2 py-0.5 rounded">{lastSignedId}</span>
          </div>
          <span className="text-[11px] text-[#027A48] font-mono">100% Entanglement Verified</span>
        </div>
      )}

      {/* ─── Top Document Upload & Metadata Card ─── */}

      <div className="sentinel-card p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EEF3FF] border border-[#D0DCFC] flex items-center justify-center text-[#4169D8]">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#182033]">
                {activeSession.document_name}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#667085] font-mono mt-0.5">
                <span>Size: {activeSession.file_size_kb} KB</span>
                <span>•</span>
                <span>Session: {activeSession.session_id}</span>
                <span>•</span>
                <span className="text-[#4169D8] font-semibold">{activeSession.status}</span>
              </div>
            </div>
          </div>

          {/* Quick Sign Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full lg:w-auto">
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Enter document filename..."
              className="sentinel-input w-full lg:w-72 text-[11px] font-mono"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="sentinel-btn sentinel-btn-primary gap-1.5 shrink-0"
            >
              {isLoading ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <KeyRound size={13} />
              )}
              <span>Sign Document</span>
            </button>
          </form>
        </div>

        {/* SHA-256 Digest Strip */}
        <div className="mt-3 pt-3 border-t border-[#EEF0F5] flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-[#667085]">
            <span className="font-semibold text-[#182033]">SHA-256:</span>
            <span className="text-[#475467] select-all bg-[#F9FAFB] px-2 py-0.5 rounded border border-[#EAECF0]">
              {activeSession.document_hash}
            </span>
          </div>
          <div className="text-[#4169D8] font-medium flex items-center gap-1">
            <Lock size={12} />
            <span>Quantum-Secured via BB84-EPR Protocol</span>
          </div>
        </div>
      </div>

      {/* ─── Horizontal 8-Step Protocol Pipeline ─── */}
      <div className="sentinel-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="sentinel-card-title">Quantum Protocol Workflow Pipeline</div>
            <div className="sentinel-card-subtitle">
              8-Stage Quantum Digital Signature & Entanglement Verification
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#4169D8] font-semibold bg-[#EEF3FF] px-2.5 py-1 rounded">
            ALL 8 PHASES VERIFIED
          </span>
        </div>

        {/* Pipeline Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {pipelineSteps.map((step) => {
            const isSelected = step.id === activeStepId;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                className={`p-2.5 rounded-md border text-left transition-all ${
                  isSelected
                    ? 'bg-[#EEF3FF] border-[#4169D8] shadow-sm ring-1 ring-[#4169D8]'
                    : 'bg-[#F9FAFC] border-[#E4E7EC] hover:bg-white hover:border-[#D0D5DD]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-[#4169D8]' : 'text-[#667085]'}`}>
                    {step.short_code}
                  </span>
                  <CheckCircle2 size={12} className={isSelected ? 'text-[#4169D8]' : 'text-[#98A2B3]'} />
                </div>
                <div className="text-[11px] font-semibold text-[#182033] line-clamp-1 leading-snug">
                  {step.name}
                </div>
                <div className="text-[9px] text-[#667085] font-mono mt-1">
                  {step.latency_ms} ms
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Info Box */}
        <div className="mt-3 p-3 bg-[#FAFBFD] border border-[#EEF0F5] rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px]">
          <div>
            <span className="font-mono font-bold text-[#4169D8] mr-2">
              Phase {currentStep.short_code}: {currentStep.name}
            </span>
            <span className="text-[#667085]">{currentStep.description}</span>
          </div>
          <div className="font-mono text-[#344054] text-[10px] bg-white px-2.5 py-1 rounded border border-[#E4E7EC] shrink-0">
            Node: <strong>{currentStep.node}</strong>
          </div>
        </div>
      </div>

      {/* ─── Quantum Information: Alice, Channel, Bob ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Alice Transmitter */}
        <div className="sentinel-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="sentinel-card-title text-[#4169D8]">
              ALICE (TRANSMITTER)
            </div>
            <span className="text-[10px] font-mono bg-[#EEF3FF] text-[#4169D8] px-2 py-0.5 rounded font-semibold">
              NODE ALC-01
            </span>
          </div>

          <div className="space-y-2.5 text-[11px] font-mono">
            <div className="bg-[#F9FAFC] p-2 rounded border border-[#EAECF0]">
              <div className="text-[#667085] text-[10px]">State Preparation</div>
              <div className="text-[#182033] font-semibold mt-0.5">
                |ψ_A⟩ = α|0⟩ + β|1⟩ (Random Basis)
              </div>
            </div>
            <div className="bg-[#F9FAFC] p-2 rounded border border-[#EAECF0]">
              <div className="text-[#667085] text-[10px]">Bell Measurement</div>
              <div className="text-[#182033] font-semibold mt-0.5">
                Outcome: |Ψ⁻⟩ (Proj. Prob: 0.994)
              </div>
            </div>
            <div className="bg-[#F9FAFC] p-2 rounded border border-[#EAECF0]">
              <div className="text-[#667085] text-[10px]">Basis Entropy</div>
              <div className="text-[#4169D8] font-semibold mt-0.5">
                0.998 bits/qubit (Maximized)
              </div>
            </div>
          </div>
        </div>

        {/* Quantum Channel */}
        <div className="sentinel-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="sentinel-card-title text-[#6C63D9]">
              QUANTUM CHANNEL
            </div>
            <span className="text-[10px] font-mono bg-[#F4F3FC] text-[#6C63D9] px-2 py-0.5 rounded font-semibold">
              EPR DISTRIBUTION
            </span>
          </div>

          <div className="space-y-2.5 text-[11px] font-mono">
            <div className="bg-[#F9FAFC] p-2 rounded border border-[#EAECF0]">
              <div className="text-[#667085] text-[10px]">Entangled State</div>
              <div className="text-[#182033] font-semibold mt-0.5">
                |Φ⁺⟩ = (|00⟩ + |11⟩) / √2
              </div>
            </div>
            <div className="bg-[#F9FAFC] p-2 rounded border border-[#EAECF0]">
              <div className="text-[#667085] text-[10px]">EPR Pairs Generated</div>
              <div className="text-[#182033] font-semibold mt-0.5">
                8,192 Pairs @ 80 MHz SPDC
              </div>
            </div>
            <div className="bg-[#F9FAFC] p-2 rounded border border-[#EAECF0]">
              <div className="text-[#667085] text-[10px]">Channel Fidelity</div>
              <div className="text-[#6C63D9] font-semibold mt-0.5">
                99.4% (Attenuation: 0.18 dB/km)
              </div>
            </div>
          </div>
        </div>

        {/* Bob Receiver */}
        <div className="sentinel-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="sentinel-card-title text-[#4169D8]">
              BOB (RECEIVER)
            </div>
            <span className="text-[10px] font-mono bg-[#EEF3FF] text-[#4169D8] px-2 py-0.5 rounded font-semibold">
              NODE BOB-01
            </span>
          </div>

          <div className="space-y-2.5 text-[11px] font-mono">
            <div className="bg-[#F9FAFC] p-2 rounded border border-[#EAECF0]">
              <div className="text-[#667085] text-[10px]">Received Qubits</div>
              <div className="text-[#182033] font-semibold mt-0.5">
                3,912 Sifted Bits Reconciled
              </div>
            </div>
            <div className="bg-[#F9FAFC] p-2 rounded border border-[#EAECF0]">
              <div className="text-[#667085] text-[10px]">Pauli Correction</div>
              <div className="text-[#182033] font-semibold mt-0.5">
                Applied σ_z based on Arbitrator Feed-Forward
              </div>
            </div>
            <div className="bg-[#F9FAFC] p-2 rounded border border-[#EAECF0]">
              <div className="text-[#667085] text-[10px]">Gate Fidelity</div>
              <div className="text-[#4169D8] font-semibold mt-0.5">
                99.8% (Single Qubit Rotation)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
