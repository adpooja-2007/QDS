import React from 'react';
import { Activity, ShieldAlert, Cpu, Hash, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

export default function KpiGrid({ auditResult, session }) {
  const metrics = auditResult?.metrics || {
    qber: session?.security?.qber ?? 0.0,
    threshold: session?.security?.threshold ?? 0.0241,
    chsh: session?.security?.chsh ?? 2.76,
    sifted_bits: session?.sifting?.sifted_length ?? 0,
    error_count: session?.security?.error_count ?? 0,
    hoeffding_delta: session?.security?.hoeffding_delta ?? 0.0041,
    baseline_noise: session?.parameters?.baseline_noise ?? 0.02,
  };

  const qberPct = (metrics.qber * 100).toFixed(2);
  const thresholdPct = (metrics.threshold * 100).toFixed(2);
  const isQberSafe = metrics.qber <= metrics.threshold;
  const isChshValid = metrics.chsh >= 2.0;

  return (
    <div className="kpi-grid">
      {/* Card 1: Observed QBER */}
      <div className={`soc-card ${isQberSafe ? '' : 'threat-glow'}`} style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Observed QBER
          </span>
          <Activity size={16} color={isQberSafe ? '#00ff9d' : '#ff0055'} />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: isQberSafe ? '#00ff9d' : '#ff0055' }}>
            {qberPct}%
          </span>
          <span style={{ fontSize: '0.8rem', color: isQberSafe ? '#64748b' : '#ff0055' }}>
            {isQberSafe ? 'Within Limit' : 'Exceeds Bound!'}
          </span>
        </div>

        <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
          <span>Errors: <strong className="mono" style={{ color: '#f8fafc' }}>{metrics.error_count}</strong></span>
          <span>Sifted: <strong className="mono" style={{ color: '#f8fafc' }}>{metrics.sifted_bits}</strong></span>
        </div>

        <div style={{ marginTop: '6px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, (metrics.qber / (metrics.threshold || 0.05)) * 50)}%`,
              background: isQberSafe ? 'var(--neon-emerald)' : 'var(--neon-crimson)',
              boxShadow: isQberSafe ? '0 0 8px var(--neon-emerald)' : '0 0 8px var(--neon-crimson)',
            }}
          />
        </div>
      </div>

      {/* Card 2: Hoeffding Statistical Threshold */}
      <div className="soc-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Hoeffding Threshold (T)
          </span>
          <ShieldAlert size={16} color="#00f0ff" />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: '#00f0ff' }}>
            {thresholdPct}%
          </span>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            (e₀ + Δ)
          </span>
        </div>

        <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
          <span>e₀: <strong className="mono" style={{ color: '#cbd5e1' }}>{((metrics.baseline_noise || 0.02) * 100).toFixed(1)}%</strong></span>
          <span>Δ Margin: <strong className="mono" style={{ color: '#00f0ff' }}>+{(metrics.hoeffding_delta * 100).toFixed(3)}%</strong></span>
        </div>

        <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
          Bound: Δ = √(ln(2/α) / 2N)
        </div>
      </div>

      {/* Card 3: CHSH Bell Inequality (S) */}
      <div className={`soc-card ${isChshValid ? '' : 'threat-glow'}`} style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            CHSH Bell Violation (S)
          </span>
          <Cpu size={16} color={isChshValid ? '#a855f7' : '#ff0055'} />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: isChshValid ? '#a855f7' : '#ff0055' }}>
            {metrics.chsh.toFixed(2)}
          </span>
          <span style={{ fontSize: '0.8rem', color: isChshValid ? '#00ff9d' : '#ff0055' }}>
            {metrics.chsh >= 2.4 ? 'Strong Entanglement' : metrics.chsh >= 2.0 ? 'Degraded' : 'Bell Violation Failed'}
          </span>
        </div>

        <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
          <span>Classical Bound: <strong className="mono" style={{ color: '#cbd5e1' }}>S ≤ 2.0</strong></span>
          <span>Quantum Ideal: <strong className="mono" style={{ color: '#a855f7' }}>2.828</strong></span>
        </div>

        <div style={{ marginTop: '6px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, (metrics.chsh / 2.828) * 100)}%`,
              background: isChshValid ? 'var(--neon-violet)' : 'var(--neon-crimson)',
              boxShadow: isChshValid ? '0 0 8px var(--neon-violet)' : '0 0 8px var(--neon-crimson)',
            }}
          />
        </div>
      </div>

      {/* Card 4: Sifted Basis Reconciliation */}
      <div className="soc-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Sifted Pairs Retained
          </span>
          <Layers size={16} color="#fbbf24" />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>
            {metrics.sifted_bits}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            pairs (Z=Z, X=X)
          </span>
        </div>

        <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
          <span>Total Generated: <strong className="mono" style={{ color: '#cbd5e1' }}>{session?.parameters?.num_pairs || 1000}</strong></span>
          <span>Efficiency: <strong className="mono" style={{ color: '#fbbf24' }}>{((metrics.sifted_bits / (session?.parameters?.num_pairs || 1000)) * 100).toFixed(1)}%</strong></span>
        </div>

        <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#64748b' }}>
          Orthogonal bases discarded deterministically
        </div>
      </div>
    </div>
  );
}
