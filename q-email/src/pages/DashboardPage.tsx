import React from 'react';
import type { ScenarioFixture } from '../data/fixtures';
import DecisionBanner from '../components/DecisionBanner';

import MetricsPanel from '../components/MetricsPanel';
import QBERChart from '../components/QBERChart';
import CommDiagram from '../components/CommDiagram';
import SessionInfo from '../components/SessionInfo';

interface Props {
  fixture: ScenarioFixture;
}

interface PanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Panel: React.FC<PanelProps> = ({ title, subtitle, children, style }) => (
  <div className="qds-panel" style={{ ...style }}>
    <div
      style={{
        padding: '14px 20px',
        borderBottom: '1px solid #1D1D1D',
        display: 'flex',
        alignItems: 'baseline',
        gap: '10px',
      }}
    >
      <h2
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 600,
          fontSize: '13px',
          letterSpacing: '0.06em',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <span style={{ fontSize: '11px', color: '#404040', fontFamily: 'IBM Plex Mono, monospace' }}>
          {subtitle}
        </span>
      )}
    </div>
    <div style={{ padding: '20px' }}>{children}</div>
  </div>
);

const MetricBlock: React.FC<{
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}> = ({ label, value, sub, accent }) => (
  <div className="qds-metric">
    <div className="qds-label" style={{ marginBottom: '8px' }}>{label}</div>
    <div
      style={{
        fontFamily: 'Rajdhani, sans-serif',
        fontWeight: 700,
        fontSize: '26px',
        color: accent ?? '#FFFFFF',
        letterSpacing: '0.02em',
        lineHeight: 1,
        marginBottom: '4px',
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: '11px', color: '#737373', fontFamily: 'IBM Plex Mono, monospace' }}>
        {sub}
      </div>
    )}
  </div>
);

const DashboardPage: React.FC<Props> = ({ fixture }) => {
  const { session, decision, analytics, comm } = fixture;
  const isAttack = decision.attack_detected;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Decision Banner — full width */}
      <DecisionBanner
        decision={decision.decision as any}
        reason={decision.reason}
        attackType={decision.attack_type}
      />

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <MetricBlock
          label="QBER (Observed)"
          value={`${((decision.metrics?.qber || 0) * 100).toFixed(2)}%`}
          sub={`baseline ${((decision.metrics?.baseline_qber || 0) * 100).toFixed(2)}%`}
          accent={decision.checks?.qber_pass ? '#FFFFFF' : '#D65A5A'}
        />
        <MetricBlock
          label="CHSH Parameter"
          value={(decision.metrics?.chsh || 2.74).toFixed(3)}
          sub={decision.checks?.chsh_pass ? 'Bell: ENTANGLED' : 'Bell: VIOLATED'}
          accent={decision.checks?.chsh_pass ? '#22D3EE' : '#D65A5A'}
        />
        <MetricBlock
          label="Sifted Key Bits"
          value={(decision.metrics?.sifted_count || 3840).toLocaleString()}
          sub={`from ${(session?.epr_pair_count || 8192).toLocaleString()} EPR pairs`}
        />
        <MetricBlock
          label="Attack Detected"
          value={isAttack ? 'YES' : 'NO'}
          sub={decision.attack_type?.replace(/_/g, ' ') ?? 'No threat detected'}
          accent={isAttack ? '#D65A5A' : '#6366F1'}
        />
      </div>

      {/* Main grid: 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Security Metrics */}
        <Panel title="Security Metrics" subtitle="QBER + Bell Analysis">
          <MetricsPanel metrics={decision.metrics as any} checks={decision.checks as any} />
        </Panel>


        {/* QBER Chart */}
        <Panel title="QBER Trend" subtitle="per run">
          <QBERChart data={analytics} />
        </Panel>
      </div>

      {/* Lower grid: 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 4fr', gap: '16px' }}>
        {/* Alice ↔ Bob */}
        <Panel title="Quantum Channel" subtitle="Alice ↔ Bob">
          <CommDiagram comm={comm} />
        </Panel>

        {/* Session Info */}
        <Panel title="Session Information">
          <SessionInfo session={session} />
        </Panel>
      </div>
    </div>
  );
};

export default DashboardPage;
