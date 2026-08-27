import React, { useState } from 'react';
import { X, Copy, Check, Lock, Cpu, ShieldCheck, ShieldAlert, KeyRound, Radio, Layers, Code, Hash } from 'lucide-react';

export const SessionDetailModal = ({ sessionData, onClose }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [copied, setCopied] = useState(false);

  if (!sessionData) return null;
  const record = sessionData.record || sessionData;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const aliceBits = record.alice?.bits || [];
  const aliceBases = record.alice?.bases || [];
  const bellBits = record.alice?.bell_measurements || [];

  const bobBases = record.bob?.bases || [];
  const bobMeas = record.bob?.measurements || [];
  const bobCorr = record.bob?.corrections || [];

  const siftingIndices = record.sifting?.matched_indices || [];
  const siftedAlice = record.sifting?.alice_bits || [];
  const siftedBob = record.sifting?.bob_bits || [];

  const security = record.security || {};
  const metrics = security.metrics || {};
  const decision = security.decision || {};
  const attacks = record.attacks || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="db-card w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-[#334155]">
        {/* Header */}
        <div className="p-4 border-b border-[#1F293D] flex items-center justify-between bg-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
              <Lock size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-white font-mono">{record.session_id}</span>
                <span className="db-badge db-badge-info text-[10px]">{record.status}</span>
              </div>
              <div className="text-[11px] font-mono text-[#64748B] mt-0.5">
                Nonce: {record.nonce || 'N/A'} • Created: {new Date(record.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="db-btn db-btn-secondary text-[11px] py-1.5 px-2.5"
              title="Copy entire database record JSON"
            >
              {copied ? <Check size={12} className="text-[#00E599]" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#334155]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-[#0B0F17] border-b border-[#1F293D] overflow-x-auto text-[11px] font-mono">
          {[
            { id: 'summary', label: 'Overview' },
            { id: 'alice', label: `Alice (${aliceBits.length} bits)` },
            { id: 'bob', label: `Bob (${bobMeas.length} bits)` },
            { id: 'sifting', label: `Sifting (${siftingIndices.length} matched)` },
            { id: 'security', label: 'Security & Proofs' },
            { id: 'attacks', label: `Attacks (${attacks.length})` },
            { id: 'json', label: 'Raw JSONB' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-[#1E293B] text-[#00E599] font-bold border border-[#334155]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#0E1524] space-y-4 font-mono text-[12px]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#162032] rounded-lg border border-[#27354A]">
                  <span className="text-[#64748B] text-[10px] block">DOCUMENT SHA-256</span>
                  <span className="text-white text-[11px] select-all break-all block mt-1">
                    {record.alice?.document_hash || 'No document bound'}
                  </span>
                </div>
                <div className="p-3 bg-[#162032] rounded-lg border border-[#27354A]">
                  <span className="text-[#64748B] text-[10px] block">QBER / THRESHOLD</span>
                  <span className="text-[#00E599] text-[14px] font-bold block mt-1">
                    {metrics.qber !== undefined ? `${(metrics.qber * 100).toFixed(2)}%` : '--'}
                    <span className="text-[#64748B] text-[11px] font-normal ml-2">
                      (Limit: {metrics.hoeffding_threshold ? `${(metrics.hoeffding_threshold * 100).toFixed(2)}%` : '5.50%'})
                    </span>
                  </span>
                </div>
                <div className="p-3 bg-[#162032] rounded-lg border border-[#27354A]">
                  <span className="text-[#64748B] text-[10px] block">BELL CHSH SCORE</span>
                  <span className="text-[#38BDF8] text-[14px] font-bold block mt-1">
                    {metrics.chsh_score !== undefined ? metrics.chsh_score.toFixed(3) : '--'}
                    <span className="text-[#64748B] text-[11px] font-normal ml-2">
                      (Quantum &gt; 2.0)
                    </span>
                  </span>
                </div>
              </div>

              {/* Protocol Parameters */}
              <div className="p-4 bg-[#111827] rounded-lg border border-[#1F293D]">
                <div className="text-[11px] font-bold text-white uppercase mb-2 text-[#94A3B8]">
                  Protocol Execution Parameters
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-[#64748B] block">Num EPR Pairs:</span>
                    <span className="text-white font-semibold">{record.parameters?.num_pairs || aliceBits.length}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Baseline Noise:</span>
                    <span className="text-white font-semibold">{(record.parameters?.baseline_noise * 100 || 2).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Alpha Significance:</span>
                    <span className="text-white font-semibold">{record.parameters?.alpha || 1e-6}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Signature Valid:</span>
                    <span className={decision.overall === 'ACCEPT' ? 'text-[#00E599] font-bold' : 'text-[#FB7185] font-bold'}>
                      {decision.overall || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALICE DATA */}
          {activeTab === 'alice' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#111827] rounded border border-[#1F293D]">
                <span className="text-[#64748B] text-[11px] block">Alice Raw Classical Bits (First 50):</span>
                <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                  {aliceBits.slice(0, 50).map((b, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-[#1E293B] rounded text-[#00E599] border border-[#334155]">
                      {b}
                    </span>
                  ))}
                  {aliceBits.length > 50 && <span className="text-[#64748B] self-center">...+{aliceBits.length - 50} more</span>}
                </div>
              </div>

              <div className="p-3 bg-[#111827] rounded border border-[#1F293D]">
                <span className="text-[#64748B] text-[11px] block">Alice Measurement Bases (|0⟩/|1⟩ vs |+⟩/|-⟩):</span>
                <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                  {aliceBases.slice(0, 50).map((b, i) => (
                    <span key={i} className={`px-1.5 py-0.5 rounded border ${b === 'Z' ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30' : 'bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/30'}`}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#111827] rounded border border-[#1F293D]">
                <span className="text-[#64748B] text-[11px] block">Alice Bell State Measurement (BSM) Outcomes:</span>
                <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                  {bellBits.slice(0, 50).map((b, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-[#162032] rounded text-[#E2E8F0] border border-[#27354A]">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BOB DATA */}
          {activeTab === 'bob' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#111827] rounded border border-[#1F293D]">
                <span className="text-[#64748B] text-[11px] block">Bob Pauli Frame Corrections (I, X, Z, XZ):</span>
                <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                  {bobCorr.slice(0, 50).map((c, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-[#1E293B] rounded text-[#FBBF24] border border-[#334155]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#111827] rounded border border-[#1F293D]">
                <span className="text-[#64748B] text-[11px] block">Bob Corrected Measurement Bits (First 50):</span>
                <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                  {bobMeas.slice(0, 50).map((m, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-[#1E293B] rounded text-[#38BDF8] border border-[#334155]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SIFTING */}
          {activeTab === 'sifting' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#111827] rounded border border-[#1F293D] flex items-center justify-between">
                <div>
                  <span className="text-[#64748B] text-[10px] block">SIFTED KEY RETENTION</span>
                  <span className="text-[14px] font-bold text-white">
                    {siftingIndices.length} / {aliceBits.length} bits kept
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#64748B] text-[10px] block">DISCARD RATE</span>
                  <span className="text-[14px] font-bold text-[#FB7185]">
                    {aliceBits.length ? `${((1 - siftingIndices.length / aliceBits.length) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#111827] rounded border border-[#1F293D]">
                <span className="text-[#64748B] text-[11px] block">Matched Basis Indices:</span>
                <div className="mt-1 text-[11px] text-[#94A3B8] max-h-32 overflow-y-auto">
                  {siftingIndices.join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & PROOFS */}
          {activeTab === 'security' && (
            <div className="space-y-3">
              <div className="p-4 bg-[#111827] rounded border border-[#1F293D]">
                <div className="text-[12px] font-bold text-white mb-2">Threat Engine Audit Verdict</div>
                <div className="p-3 bg-[#162032] rounded border border-[#27354A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Overall Verdict:</span>
                    <span className={decision.overall === 'ACCEPT' ? 'text-[#00E599] font-bold' : 'text-[#FB7185] font-bold'}>
                      {decision.overall || 'PENDING'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Hoeffding Test:</span>
                    <span className={decision.hoeffding_pass ? 'text-[#00E599]' : 'text-[#FB7185]'}>
                      {decision.hoeffding_pass ? 'PASS (QBER <= Threshold)' : 'FAIL (Anomalous Error)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">CHSH Bell Inequality:</span>
                    <span className={decision.chsh_pass ? 'text-[#00E599]' : 'text-[#FB7185]'}>
                      {decision.chsh_pass ? 'PASS (Entanglement Verified)' : 'FAIL (Classical State)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Signature Digest Cross-Check:</span>
                    <span className={decision.signature_pass ? 'text-[#00E599]' : 'text-[#FB7185]'}>
                      {decision.signature_pass ? 'MATCH (Valid Document)' : 'MISMATCH (Forgery Detected)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ATTACKS */}
          {activeTab === 'attacks' && (
            <div className="space-y-3">
              {attacks.length === 0 ? (
                <div className="p-8 text-center text-[#64748B] bg-[#111827] rounded border border-[#1F293D]">
                  No Red Team attacks injected into this session. Session is authentic.
                </div>
              ) : (
                attacks.map((a, i) => (
                  <div key={i} className="p-3 bg-[#162032] rounded border border-[#FB7185]/30 flex items-start justify-between">
                    <div>
                      <div className="text-[#FB7185] font-bold text-[12px]">{a.attack_type}</div>
                      <div className="text-[11px] text-[#94A3B8] mt-1">
                        Affected: {a.affected_count} qubits ({((a.attack_fraction || 0) * 100).toFixed(0)}%)
                      </div>
                    </div>
                    <span className="text-[10px] text-[#64748B]">
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 7: RAW JSON */}
          {activeTab === 'json' && (
            <div className="relative">
              <pre className="p-4 bg-[#080C14] rounded-lg border border-[#1F293D] text-[11px] text-[#00E599] overflow-x-auto max-h-[450px]">
                {JSON.stringify(record, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
