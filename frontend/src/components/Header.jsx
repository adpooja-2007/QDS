import React from 'react';
import { Shield, Activity, Radio, Cpu, RefreshCw } from 'lucide-react';

export default function Header({ systemHealth, activeSession, onRefresh, isProcessing }) {
  return (
    <header className="soc-header">
      <div className="soc-title-badge">
        <div className="quantum-orb"></div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              QDS CYBER-SOC
            </h1>
            <span className="status-pill secure" style={{ fontSize: '0.7rem' }}>
              PROTOTYPE V1.0
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
            Quantum Digital Signature Security & Adversary Threat Intelligence Operations Center
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`pulse-dot ${systemHealth?.status === 'healthy' ? 'green' : 'red'}`}></span>
            <span>Gateway: <strong style={{ color: '#00f0ff' }}>{systemHealth?.status || 'ONLINE'}</strong></span>
          </div>
          <span style={{ color: '#475569' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={14} color="#a855f7" />
            <span>Qiskit Aer: <strong style={{ color: '#a855f7' }}>Sim Ready</strong></span>
          </div>
          <span style={{ color: '#475569' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} color="#00ff9d" />
            <span>Hoeffding: <strong style={{ color: '#00ff9d' }}>Active</strong></span>
          </div>
        </div>

        <button
          className="cyber-btn cyber-btn-dim"
          onClick={onRefresh}
          disabled={isProcessing}
          title="Refresh State & Telemetry"
        >
          <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
          <span>Sync</span>
        </button>
      </div>
    </header>
  );
}
