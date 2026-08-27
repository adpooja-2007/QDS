import React, { useState } from 'react';
import { Zap, KeyRound, Copy, Radio, Crosshair, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

export default function RedTeamConsole({ session, isProcessing, onInjectAttack }) {
  const [activeTab, setActiveTab] = useState('MITM');
  const [attackFraction, setAttackFraction] = useState(0.25);
  const [basisStrategy, setBasisStrategy] = useState('RANDOM');
  const [noiseModel, setNoiseModel] = useState('DEPOLARIZING');
  const [noiseProb, setNoiseProb] = useState(0.03);
  const [pnsIntensity, setPnsIntensity] = useState(0.20);
  const [replaySourceId, setReplaySourceId] = useState('QKD-PREV-001');

  const handleExecute = () => {
    if (!session?.session_id) return;

    switch (activeTab) {
      case 'MITM':
        onInjectAttack('MITM', {
          attackFraction,
          basisStrategy,
        });
        break;
      case 'FORGERY':
        onInjectAttack('FORGERY', {
          attackFraction,
        });
        break;
      case 'REPLAY':
        onInjectAttack('REPLAY', {
          replaySessionId: replaySourceId,
        });
        break;
      case 'NOISE':
        onInjectAttack('NOISE', {
          noiseModel,
          probability: noiseProb,
        });
        break;
      case 'PNS':
        onInjectAttack('PNS', {
          intensity: pnsIntensity,
        });
        break;
      default:
        break;
    }
  };

  const isReadyForAttack = session?.status === 'MEASURED' || session?.status === 'SIFTED' || session?.status === 'SIGNED' || session?.status === 'AUDITED';

  return (
    <div className="soc-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crosshair size={18} color="#ff0055" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
            RED-TEAM ADVERSARY SANDBOX (MODULE 4)
          </h3>
        </div>
        <span className="status-pill threat" style={{ fontSize: '0.72rem' }}>
          EVE ACTIVE
        </span>
      </div>

      {/* Attack Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          className={`cyber-btn ${activeTab === 'MITM' ? 'cyber-btn-red' : 'cyber-btn-dim'}`}
          onClick={() => setActiveTab('MITM')}
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          <Zap size={14} />
          <span>Intercept-Resend</span>
        </button>

        <button
          className={`cyber-btn ${activeTab === 'FORGERY' ? 'cyber-btn-red' : 'cyber-btn-dim'}`}
          onClick={() => setActiveTab('FORGERY')}
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          <KeyRound size={14} />
          <span>Signature Forgery</span>
        </button>

        <button
          className={`cyber-btn ${activeTab === 'REPLAY' ? 'cyber-btn-purple' : 'cyber-btn-dim'}`}
          onClick={() => setActiveTab('REPLAY')}
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          <Copy size={14} />
          <span>Session Replay</span>
        </button>

        <button
          className={`cyber-btn ${activeTab === 'NOISE' ? 'cyber-btn-cyan' : 'cyber-btn-dim'}`}
          onClick={() => setActiveTab('NOISE')}
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          <Radio size={14} />
          <span>Physical Noise</span>
        </button>

        <button
          className={`cyber-btn ${activeTab === 'PNS' ? 'cyber-btn-cyan' : 'cyber-btn-dim'}`}
          onClick={() => setActiveTab('PNS')}
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          <Cpu size={14} />
          <span>PNS Optical</span>
        </button>
      </div>

      {/* Tab Specific Controls */}
      <div style={{ background: 'rgba(5, 8, 17, 0.75)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '16px', marginBottom: '18px' }}>
        {activeTab === 'MITM' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
                Attack Fraction (Qubits Intercepted: {Math.round(attackFraction * 100)}%)
              </span>
              <span className="mono" style={{ fontSize: '0.82rem', color: '#ff0055', fontWeight: 700 }}>
                f = {attackFraction.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={attackFraction}
              onChange={(e) => setAttackFraction(parseFloat(e.target.value))}
              className="cyber-slider red"
              style={{ marginBottom: '14px' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Eve Basis Measurement Strategy:</span>
              <select
                className="cyber-select"
                value={basisStrategy}
                onChange={(e) => setBasisStrategy(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              >
                <option value="RANDOM">Random (50% Z / 50% X)</option>
                <option value="Z_ONLY">Fixed Z-Basis Only</option>
                <option value="X_ONLY">Fixed X-Basis Only</option>
              </select>
            </div>

            <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '10px' }}>
              ℹ️ Eve intercepts qubit in transit, measures in her basis (collapsing quantum superposition), and resends the eigenstate to Bob. Matching bases incur 25% error on attacked subset.
            </p>
          </div>
        )}

        {activeTab === 'FORGERY' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
                Feed-Forward Bits Tampered: {Math.round(attackFraction * 100)}%
              </span>
              <span className="mono" style={{ fontSize: '0.82rem', color: '#ff0055', fontWeight: 700 }}>
                f = {attackFraction.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={attackFraction}
              onChange={(e) => setAttackFraction(parseFloat(e.target.value))}
              className="cyber-slider red"
              style={{ marginBottom: '14px' }}
            />
            <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '6px' }}>
              ℹ️ Classical channel attack: Eve intercepts classical Bell bits (b1,b2) and flips them (e.g. 00 → 11). Bob applies the wrong Pauli correction (I vs X/Z), yielding high QBER.
            </p>
          </div>
        )}

        {activeTab === 'REPLAY' && (
          <div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Replay Source Session ID:
              </label>
              <input
                type="text"
                className="cyber-input"
                value={replaySourceId}
                onChange={(e) => setReplaySourceId(e.target.value)}
                style={{ width: '100%' }}
                placeholder="e.g. QKD-2026-0001"
              />
            </div>
            <p style={{ fontSize: '0.76rem', color: '#64748b' }}>
              ℹ️ Cryptographic Replay: Eve stores valid feed-forward bits from an old session and attempts to inject them into the active session. Blocked via cryptographic session binding & nonces.
            </p>
          </div>
        )}

        {activeTab === 'NOISE' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
                Noise Probability (p = {(noiseProb * 100).toFixed(1)}%)
              </span>
              <span className="mono" style={{ fontSize: '0.82rem', color: '#00f0ff', fontWeight: 700 }}>
                p = {noiseProb.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.15"
              step="0.005"
              value={noiseProb}
              onChange={(e) => setNoiseProb(parseFloat(e.target.value))}
              className="cyber-slider"
              style={{ marginBottom: '14px' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Qiskit Channel Noise Model:</span>
              <select
                className="cyber-select"
                value={noiseModel}
                onChange={(e) => setNoiseModel(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              >
                <option value="DEPOLARIZING">Depolarizing Channel</option>
                <option value="BIT_FLIP">Bit-Flip Channel (X)</option>
                <option value="PHASE_FLIP">Phase-Flip Channel (Z)</option>
                <option value="AMPLITUDE_DAMPING">Amplitude Damping (T1 Decay)</option>
              </select>
            </div>

            <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '10px' }}>
              ℹ️ Natural decoherence: When p &lt; Hoeffding bound threshold, the detector accepts the signature without false alarms.
            </p>
          </div>
        )}

        {activeTab === 'PNS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
                Optical Multi-Photon Pulse Intensity: {(pnsIntensity * 100).toFixed(0)}%
              </span>
              <span className="mono" style={{ fontSize: '0.82rem', color: '#00f0ff', fontWeight: 700 }}>
                μ = {pnsIntensity.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.05"
              value={pnsIntensity}
              onChange={(e) => setPnsIntensity(parseFloat(e.target.value))}
              className="cyber-slider"
              style={{ marginBottom: '14px' }}
            />
            <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '6px' }}>
              ℹ️ Photon-Number-Splitting: Eve siphons off excess photons from multi-photon laser pulses and measures in reconciled bases. Detected via decoy-state statistical analysis.
            </p>
          </div>
        )}
      </div>

      {/* Attack Trigger Button */}
      <button
        className="cyber-btn cyber-btn-red"
        onClick={handleExecute}
        disabled={isProcessing || !session || !isReadyForAttack}
        style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
      >
        <Zap size={16} />
        <span>INJECT {activeTab} ATTACK INTO QUANTUM PIPELINE</span>
      </button>
    </div>
  );
}
