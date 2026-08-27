import React from 'react';
import type { ScenarioFixture } from '../data/fixtures';
import QBERChart from '../components/QBERChart';

import CHSHChart from '../components/CHSHChart';

interface Props {
  fixture: ScenarioFixture;
}

const Panel: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="qds-panel">
    <div style={{ padding: '14px 20px', borderBottom: '1px solid #1D1D1D', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
      <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '13px', letterSpacing: '0.06em', color: '#FFFFFF', textTransform: 'uppercase', margin: 0 }}>
        {title}
      </h2>
      {subtitle && <span style={{ fontSize: '11px', color: '#404040', fontFamily: 'IBM Plex Mono, monospace' }}>{subtitle}</span>}
    </div>
    <div style={{ padding: '20px' }}>{children}</div>
  </div>
);

const StatCell: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div style={{
    background: '#0A0A0A', border: '1px solid #1D1D1D', borderRadius: '6px', padding: '14px 16px',
  }}>
    <div className="qds-label" style={{ marginBottom: '6px' }}>{label}</div>
    <div style={{
      fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '22px',
      color: color ?? '#FFFFFF', letterSpacing: '0.02em',
    }}>
      {value}
    </div>
  </div>
);

const AnalyticsPage: React.FC<Props> = ({ fixture }) => {
  const { analytics, decision } = fixture;
  const qberVals = analytics.map(p => p.qber_observed);
  const chshVals = analytics.map(p => p.chsh);
  const qberMax = Math.max(...qberVals);
  const qberMin = Math.min(...qberVals);
  const qberAvg = qberVals.reduce((a, b) => a + b, 0) / qberVals.length;
  const chshAvg = chshVals.reduce((a, b) => a + b, 0) / chshVals.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <StatCell label="QBER Min" value={`${(qberMin * 100).toFixed(2)}%`} color="#6366F1" />
        <StatCell label="QBER Max" value={`${(qberMax * 100).toFixed(2)}%`} color={qberMax > 0.11 ? '#D65A5A' : '#FFFFFF'} />
        <StatCell label="QBER Avg" value={`${(qberAvg * 100).toFixed(2)}%`} />
        <StatCell label="CHSH Avg" value={chshAvg.toFixed(3)} color={chshAvg >= 2.0 ? '#22D3EE' : '#D65A5A'} />
      </div>

      {/* QBER Chart */}
      <Panel title="QBER Trend Analysis" subtitle={`${analytics.length} measurement runs`}>
        <QBERChart data={analytics} />

        {/* Annotations */}
        <div style={{
          marginTop: '16px', padding: '12px 16px', background: '#0A0A0A',
          borderRadius: '6px', border: '1px solid #1D1D1D',
        }}>
          <div style={{ fontSize: '12px', color: '#737373', lineHeight: 1.6 }}>
            <strong style={{ color: '#B8B8B8', fontFamily: 'IBM Plex Mono, monospace' }}>Analysis: </strong>
            {decision.decision === 'ACCEPT'
              ? `QBER consistently below threshold (≤ 11.0%). Channel exhibits expected baseline noise profile. No evidence of eavesdropping.`
              : decision.decision === 'REJECT'
              ? `QBER violation detected. Observed QBER ${(qberMax * 100).toFixed(2)}% exceeds security threshold. Session invalidated.`
              : `QBER near threshold with anomalous pattern. Photon statistics suggest potential side-channel activity. Manual investigation advised.`
            }
          </div>
        </div>
      </Panel>

      {/* CHSH Chart */}
      <Panel title="CHSH Parameter Analysis" subtitle="Bell inequality test · threshold ≥ 2.000">
        <CHSHChart data={analytics} />

        <div style={{
          marginTop: '16px', padding: '12px 16px', background: '#0A0A0A',
          borderRadius: '6px', border: '1px solid #1D1D1D',
        }}>
          <div style={{ fontSize: '12px', color: '#737373', lineHeight: 1.6 }}>
            <strong style={{ color: '#B8B8B8', fontFamily: 'IBM Plex Mono, monospace' }}>Bell Analysis: </strong>
            {decision.checks.chsh_pass
              ? `CHSH parameter (${decision.metrics.chsh.toFixed(3)}) confirms quantum entanglement. Classical hidden-variable theories cannot explain observed correlations. No MITM detected via Bell test.`
              : `CHSH parameter (${decision.metrics.chsh.toFixed(3)}) violates Bell inequality bound. Quantum entanglement compromised. High probability of intercept-resend attack.`
            }
          </div>
        </div>
      </Panel>

      {/* Data table */}
      <Panel title="Raw Analytics Data">
        <div style={{ overflowX: 'auto' }}>
          <table className="qds-table">
            <thead>
              <tr>
                <th>Run</th>
                <th>QBER Observed</th>
                <th>QBER Baseline</th>
                <th>Threshold</th>
                <th>CHSH</th>
                <th>QBER Pass</th>
                <th>CHSH Pass</th>
              </tr>
            </thead>
            <tbody>
              {analytics.map(row => (
                <tr key={row.run}>
                  <td><span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>Run {row.run}</span></td>
                  <td>
                    <span style={{
                      fontFamily: 'IBM Plex Mono, monospace', color: row.qber_observed > row.threshold ? '#D65A5A' : '#B8B8B8'
                    }}>
                      {(row.qber_observed * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td><span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#737373' }}>{(row.qber_baseline * 100).toFixed(2)}%</span></td>
                  <td><span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#737373' }}>{(row.threshold * 100).toFixed(2)}%</span></td>
                  <td>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: row.chsh >= 2.0 ? '#22D3EE' : '#D65A5A' }}>
                      {row.chsh.toFixed(3)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', fontWeight: 600, color: row.qber_observed <= row.threshold ? '#6366F1' : '#D65A5A' }}>
                      {row.qber_observed <= row.threshold ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', fontWeight: 600, color: row.chsh >= 2.0 ? '#22D3EE' : '#D65A5A' }}>
                      {row.chsh >= 2.0 ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

export default AnalyticsPage;
