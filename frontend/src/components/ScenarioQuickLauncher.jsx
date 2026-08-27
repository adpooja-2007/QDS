import React from 'react';
import { ShieldCheck, Zap, Radio, KeyRound, Copy, Activity } from 'lucide-react';

export default function ScenarioQuickLauncher({ onRunScenario, isProcessing, activeScenario }) {
  return (
    <div className="scenarios-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
        <Activity size={16} color="#00f0ff" />
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.04em' }}>
          SIH EVALUATION SCENARIOS:
        </span>
      </div>

      {/* Scenario 1: Clean Authentic Run */}
      <button
        className="cyber-btn cyber-btn-emerald"
        onClick={() => onRunScenario('CLEAN')}
        disabled={isProcessing}
        title="Execute standard end-to-end quantum signature with zero attacks"
      >
        <ShieldCheck size={14} />
        <span>1. Clean Signature (Pass)</span>
      </button>

      {/* Scenario 2: Physical Channel Noise */}
      <button
        className="cyber-btn cyber-btn-cyan"
        onClick={() => onRunScenario('NOISE')}
        disabled={isProcessing}
        title="Inject natural environmental noise (1.8%) — Demonstrates non-AI tolerance below Hoeffding bound"
      >
        <Radio size={14} />
        <span>2. Physical Noise 1.8% (Pass)</span>
      </button>

      {/* Scenario 3: MitM Intercept-Resend */}
      <button
        className="cyber-btn cyber-btn-red"
        onClick={() => onRunScenario('MITM')}
        disabled={isProcessing}
        title="Inject Quantum Intercept-Resend attack (40%) — Eve collapses states, driving QBER > Threshold"
      >
        <Zap size={14} />
        <span>3. Intercept-Resend MitM (Reject)</span>
      </button>

      {/* Scenario 4: Classical Signature Forgery */}
      <button
        className="cyber-btn cyber-btn-red"
        onClick={() => onRunScenario('FORGERY')}
        disabled={isProcessing}
        title="Inject Classical Forgery (20%) — Eve mutates feed-forward Bell bits (b1,b2)"
      >
        <KeyRound size={14} />
        <span>4. Classical Forgery (Reject)</span>
      </button>

      {/* Scenario 5: Replay Attack */}
      <button
        className="cyber-btn cyber-btn-purple"
        onClick={() => onRunScenario('REPLAY')}
        disabled={isProcessing}
        title="Simulate session replay — Nonce binding detects and blocks unauthorized transmission"
      >
        <Copy size={14} />
        <span>5. Replay Attack (Blocked)</span>
      </button>
    </div>
  );
}
