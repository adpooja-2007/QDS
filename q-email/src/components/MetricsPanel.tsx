import React from 'react';
import type { SecurityMetrics, SecurityChecks } from '../types';


interface Props {
  metrics: SecurityMetrics;
  checks: SecurityChecks;
}

interface MetricRowProps {
  label: string;
  value: string | number;
  pass?: boolean;
  unit?: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, pass, unit }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #1D1D1D',
    }}
  >
    <span style={{ fontSize: '12px', color: '#737373', fontFamily: 'Inter, sans-serif' }}>
      {label}
    </span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '13px',
          fontWeight: 500,
          color: pass === false ? '#D65A5A' : pass === true ? '#B8B8B8' : '#B8B8B8',
        }}
      >
        {value}
        {unit && <span style={{ color: '#737373', fontSize: '11px', marginLeft: '2px' }}>{unit}</span>}
      </span>
      {pass !== undefined && (
        <div
          style={{
            width: '2px',
            height: '14px',
            borderRadius: '1px',
            background: pass ? '#6366F1' : '#D65A5A',
          }}
        />
      )}
    </div>
  </div>
);

const MetricsPanel: React.FC<Props> = ({ metrics, checks }) => {
  const qberPercent = (metrics.qber * 100).toFixed(2);
  const baselinePercent = (metrics.baseline_qber * 100).toFixed(2);
  const thresholdPercent = (metrics.threshold * 100).toFixed(2);
  const qberRatio = Math.min(metrics.qber / metrics.threshold, 1);

  return (
    <div>
      {/* QBER Gauge */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <div>
            <div className="qds-label" style={{ marginBottom: '4px' }}>Quantum Bit Error Rate</div>
            <div
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: '28px',
                color: checks.qber_pass ? '#FFFFFF' : '#D65A5A',
                letterSpacing: '0.02em',
              }}
            >
              {qberPercent}%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="qds-label" style={{ marginBottom: '2px' }}>Threshold</div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: '#737373' }}>
              ≤ {thresholdPercent}%
            </div>
          </div>
        </div>

        {/* QBER progress bar */}
        <div
          style={{
            height: '4px',
            background: '#292929',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(qberRatio * 100, 100)}%`,
              background: checks.qber_pass ? '#6366F1' : '#D65A5A',
              borderRadius: '2px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontSize: '10px', color: '#404040', fontFamily: 'IBM Plex Mono, monospace' }}>0%</span>
          <span style={{ fontSize: '10px', color: '#737373', fontFamily: 'IBM Plex Mono, monospace' }}>
            baseline {baselinePercent}%
          </span>
          <span style={{ fontSize: '10px', color: '#737373', fontFamily: 'IBM Plex Mono, monospace' }}>
            {thresholdPercent}%
          </span>
        </div>
      </div>

      {/* Metrics Table */}
      <div>
        <MetricRow
          label="QBER (Observed)"
          value={`${qberPercent}%`}
          pass={checks.qber_pass}
        />
        <MetricRow
          label="QBER (Baseline)"
          value={`${baselinePercent}%`}
        />
        <MetricRow
          label="CHSH Parameter"
          value={metrics.chsh.toFixed(3)}
          pass={checks.chsh_pass}
        />
        <MetricRow
          label="Sifted Key Bits"
          value={metrics.sifted_count.toLocaleString()}
          unit="bits"
        />
        <MetricRow
          label="Error Count"
          value={metrics.error_count.toLocaleString()}
          unit="bits"
        />
        <div style={{ padding: '8px 0' }}>
          <MetricRow
            label="Threshold (α)"
            value={`${thresholdPercent}%`}
          />
        </div>
      </div>

      {/* Security Checks */}
      <div
        style={{
          marginTop: '12px',
          padding: '12px',
          background: '#0A0A0A',
          borderRadius: '6px',
          border: '1px solid #1D1D1D',
        }}
      >
        <div className="qds-label" style={{ marginBottom: '10px' }}>Security Checks</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { key: 'qber_pass', label: 'QBER', pass: checks.qber_pass },
            { key: 'chsh_pass', label: 'CHSH', pass: checks.chsh_pass },
            { key: 'session_valid', label: 'Session', pass: checks.session_valid },
            { key: 'threshold_pass', label: 'Threshold', pass: checks.threshold_pass },
          ].map(({ key, label, pass }) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: pass ? '#B8B8B8' : '#D65A5A',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: pass ? '#6366F1' : '#D65A5A',
                  flexShrink: 0,
                }}
              />
              <span>{label}</span>
              <span style={{ color: pass ? '#6366F1' : '#D65A5A', fontWeight: 600 }}>
                {pass ? 'PASS' : 'FAIL'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;
