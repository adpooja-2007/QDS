import React from 'react';
import { AlertOctagon, X, ShieldAlert, Zap, AlertTriangle, ArrowRight } from 'lucide-react';

export default function SecurityAlarmModal({ isOpen, onClose, auditResult, session }) {
  if (!isOpen) return null;

  const threat = auditResult?.threat || {
    type: session?.security?.threat_type || 'QUANTUM_TAMPERING',
    severity: 'CRITICAL',
    description: 'Statistical threshold exceeded during quantum signature verification.',
  };

  const metrics = auditResult?.metrics || {
    qber: session?.security?.qber || 0.24,
    threshold: session?.security?.threshold || 0.024,
    chsh: session?.security?.chsh || 1.84,
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(255, 0, 85, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ff0055'
            }}>
              <AlertOctagon size={26} color="#ff0055" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ff0055', letterSpacing: '0.02em' }}>
                CRITICAL SECURITY ALERT
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                Quantum Digital Signature Tampering Detected
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Forensic Detail Box */}
        <div style={{ background: 'rgba(10, 15, 29, 0.95)', border: '1px solid rgba(255, 0, 85, 0.3)', borderRadius: '10px', padding: '16px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Attack Vector:</span>
            <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ff0055' }}>
              {threat.type || 'INTERCEPT_RESEND'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Observed QBER:</span>
            <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ff0055' }}>
              {((metrics.qber || 0) * 100).toFixed(2)}%
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Hoeffding Threshold (T):</span>
            <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00f0ff' }}>
              {((metrics.threshold || 0) * 100).toFixed(2)}%
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>CHSH Entanglement Score:</span>
            <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: (metrics.chsh || 0) < 2.0 ? '#ff0055' : '#fbbf24' }}>
              S = {(metrics.chsh || 0).toFixed(2)} {(metrics.chsh || 0) < 2.0 ? '(Bell Bound Breached)' : ''}
            </span>
          </div>
        </div>

        {/* Verdict Explanation */}
        <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '20px' }}>
          Deterministic Non-AI Decision Gate has rejected this transaction. The measured quantum bit error rate significantly exceeds the statistical Hoeffding confidence limit, indicating active adversarial disturbance in the transmission pipeline.
        </p>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="cyber-btn cyber-btn-red" onClick={onClose} style={{ width: '100%' }}>
            <span>ACKNOWLEDGE & QUARANTINE SESSION</span>
          </button>
        </div>
      </div>
    </div>
  );
}
