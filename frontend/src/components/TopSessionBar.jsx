import React, { useState } from 'react';
import { Key, FileText, Play, CheckCircle2, RotateCcw, Cpu, Lock } from 'lucide-react';

export default function TopSessionBar({
  session,
  isProcessing,
  onCreateSession,
  onSign,
  onVerify,
  onSift,
  onAudit,
  onReset,
}) {
  const [numPairs, setNumPairs] = useState(1000);
  const [baselineNoise, setBaselineNoise] = useState(0.02);
  const [docType, setDocType] = useState('contract.pdf');
  const [customHash, setCustomHash] = useState('a8f91c5364817293a74ef1928374829103847291aef019283749281726354819');

  const presetHashes = {
    'contract.pdf': 'a8f91c5364817293a74ef1928374829103847291aef019283749281726354819',
    'bank_transfer_instruction.pdf': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'medical_record_consent.pdf': '7d4a28f192038475619283746591029384756102938475610293847561029384',
    'custom': customHash,
  };

  const handleDocTypeChange = (e) => {
    const val = e.target.value;
    setDocType(val);
    if (val !== 'custom') {
      setCustomHash(presetHashes[val]);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'AUDITED':
        return session?.security?.threat_detected ? 'threat' : 'secure';
      case 'MEASURED':
      case 'SIFTED':
      case 'SIGNED':
      case 'EPR_READY':
        return 'active';
      default:
        return 'idle';
    }
  };

  return (
    <div className="soc-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        {/* Left: Active Session Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active Session
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#00f0ff' }}>
                {session?.session_id || 'NO ACTIVE SESSION'}
              </span>
              <span className={`status-pill ${getStatusClass(session?.status)}`}>
                {session?.status || 'UNINITIALIZED'}
              </span>
            </div>
          </div>

          {session?.nonce && (
            <div style={{ paddingLeft: '14px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Session Nonce</div>
              <div className="mono" style={{ fontSize: '0.85rem', color: '#a855f7' }}>
                {session.nonce.substring(0, 10)}...
              </div>
            </div>
          )}
        </div>

        {/* Center: Document Hash Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={16} color="#00f0ff" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                className="cyber-select"
                value={docType}
                onChange={handleDocTypeChange}
                disabled={isProcessing}
                style={{ fontSize: '0.8rem', padding: '4px 8px' }}
              >
                <option value="contract.pdf">contract.pdf</option>
                <option value="bank_transfer_instruction.pdf">bank_transfer_instruction.pdf</option>
                <option value="medical_record_consent.pdf">medical_record_consent.pdf</option>
                <option value="custom">Custom SHA-256...</option>
              </select>
              <span className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                SHA-256: {customHash.substring(0, 16)}...
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quantum Pipeline Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="cyber-btn cyber-btn-cyan"
            onClick={() => onCreateSession(numPairs, baselineNoise)}
            disabled={isProcessing}
            title="Step 1: Arbitrator generates and distributes EPR pairs"
          >
            <Cpu size={14} />
            <span>1. Init EPR ({numPairs})</span>
          </button>

          <button
            className="cyber-btn cyber-btn-purple"
            onClick={() => onSign(customHash)}
            disabled={isProcessing || !session || session.status !== 'EPR_READY'}
            title="Step 2: Alice encodes SHA-256 hash & performs Joint Bell Measurement"
          >
            <Key size={14} />
            <span>2. Alice Sign</span>
          </button>

          <button
            className="cyber-btn cyber-btn-emerald"
            onClick={onVerify}
            disabled={isProcessing || !session || session.status !== 'SIGNED'}
            title="Step 3: Bob receives feed-forward bits, applies Pauli corrections & measures"
          >
            <Play size={14} />
            <span>3. Bob Verify</span>
          </button>

          <button
            className="cyber-btn cyber-btn-cyan"
            onClick={onSift}
            disabled={isProcessing || !session || session.status !== 'MEASURED'}
            title="Step 4: Reconcile Alice and Bob measurement bases"
          >
            <CheckCircle2 size={14} />
            <span>4. Sift Bases</span>
          </button>

          <button
            className="cyber-btn cyber-btn-cyan"
            style={{ borderColor: '#00ff9d', color: '#00ff9d' }}
            onClick={onAudit}
            disabled={isProcessing || !session || (session.status !== 'SIFTED' && session.status !== 'AUDITED')}
            title="Step 5: Run deterministic threat detection (QBER, Hoeffding, CHSH)"
          >
            <Lock size={14} />
            <span>5. Threat Audit</span>
          </button>

          <button
            className="cyber-btn cyber-btn-dim"
            onClick={onReset}
            disabled={isProcessing || !session}
            title="Reset active session"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
