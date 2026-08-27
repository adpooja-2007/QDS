import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, XCircle } from 'lucide-react';

export default function DecisionBanner({ auditResult, session }) {
  if (!auditResult && (!session?.security || !session.security.decision)) {
    return (
      <div
        className="soc-card"
        style={{
          padding: '16px 24px',
          marginBottom: '20px',
          borderLeft: '4px solid #64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ShieldCheck size={28} color="#64748b" />
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0' }}>
              SECURITY AUDIT GATE: STANDBY
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
              Execute or load a quantum signature verification pipeline to evaluate deterministic statistical bounds.
            </div>
          </div>
        </div>
        <span className="status-pill idle">IDLE</span>
      </div>
    );
  }

  const decision = auditResult?.decision?.overall || session?.security?.decision;
  const isAccept = decision === 'ACCEPT';
  const threatInfo = auditResult?.threat || {
    detected: session?.security?.threat_detected,
    type: session?.security?.threat_type,
  };

  const metrics = auditResult?.metrics || {
    qber: session?.security?.qber,
    threshold: session?.security?.threshold,
    chsh: session?.security?.chsh,
  };

  return (
    <div
      className={`soc-card ${isAccept ? 'secure-glow' : 'threat-glow'}`}
      style={{
        padding: '20px 28px',
        marginBottom: '20px',
        borderLeft: isAccept ? '6px solid var(--neon-emerald)' : '6px solid var(--neon-crimson)',
        background: isAccept
          ? 'linear-gradient(135deg, rgba(14, 21, 38, 0.95), rgba(6, 44, 28, 0.45))'
          : 'linear-gradient(135deg, rgba(14, 21, 38, 0.95), rgba(60, 7, 24, 0.55))',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {isAccept ? (
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(0, 255, 157, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 255, 157, 0.4)'
            }}>
              <CheckCircle2 size={30} color="#00ff9d" />
            </div>
          ) : (
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 0, 85, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 0, 85, 0.5)',
              animation: 'alert-blink 1s infinite'
            }}>
              <AlertOctagon size={30} color="#ff0055" />
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: isAccept ? '#00ff9d' : '#ff0055',
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}>
                {isAccept ? 'AUTHENTIC — SIGNATURE VERIFIED' : 'CRITICAL THREAT — SIGNATURE REJECTED'}
              </h2>
              <span className={`status-pill ${isAccept ? 'secure' : 'threat'}`}>
                {isAccept ? 'PASS' : 'TAMPERING DETECTED'}
              </span>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#cbd5e1', marginTop: '4px', maxWidth: '900px' }}>
              {isAccept
                ? `Observed QBER (${((metrics.qber || 0) * 100).toFixed(2)}%) is strictly within the statistical Hoeffding bound (${((metrics.threshold || 0) * 100).toFixed(2)}%). Quantum CHSH correlation S = ${(metrics.chsh || 0).toFixed(2)} satisfies the Bell inequality threshold.`
                : threatInfo.description ||
                  `Security criteria violated: QBER (${((metrics.qber || 0) * 100).toFixed(2)}%) exceeded permissible threshold (${((metrics.threshold || 0) * 100).toFixed(2)}%) or Bell correlation compromised (S = ${(metrics.chsh || 0).toFixed(2)}). Possible vector: ${threatInfo.type || 'INTERCEPT_RESEND'}.`}
            </p>
          </div>
        </div>

        {/* Forensic Summary Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.85rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>QBER vs LIMIT</div>
            <div className="mono" style={{ fontWeight: 700, color: (metrics.qber || 0) <= (metrics.threshold || 0) ? '#00ff9d' : '#ff0055' }}>
              {((metrics.qber || 0) * 100).toFixed(2)}% / {((metrics.threshold || 0) * 100).toFixed(2)}%
            </div>
          </div>
          <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>CHSH SCORE</div>
            <div className="mono" style={{ fontWeight: 700, color: (metrics.chsh || 0) >= 2.0 ? '#00f0ff' : '#ff0055' }}>
              S = {(metrics.chsh || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
