import React from 'react';
import type { ScenarioFixture } from '../data/fixtures';
import NodeTable from '../components/NodeTable';


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

const NodesPage: React.FC<Props> = ({ fixture }) => {
  const { nodes } = fixture;

  const stateCount = nodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.state] = (acc[n.state] ?? 0) + 1;
    return acc;
  }, {});

  const STATE_COLOR: Record<string, string> = {
    ACTIVE: '#22D3EE',
    READY: '#6366F1',
    PROCESSING: '#D4A72C',
    IDLE: '#737373',
    ERROR: '#D65A5A',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total Nodes', value: nodes.length.toString() },
          { label: 'Active', value: (stateCount['ACTIVE'] ?? 0).toString(), color: '#22D3EE' },
          { label: 'Processing', value: (stateCount['PROCESSING'] ?? 0).toString(), color: '#D4A72C' },
          { label: 'Errors', value: (stateCount['ERROR'] ?? 0).toString(), color: stateCount['ERROR'] ? '#D65A5A' : '#737373' },
        ].map(({ label, value, color }) => (
          <div key={label} className="qds-metric">
            <div className="qds-label" style={{ marginBottom: '6px' }}>{label}</div>
            <div style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '28px',
              color: color ?? '#FFFFFF', letterSpacing: '0.02em',
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Node map */}
      <Panel title="Quantum Network Topology">
        {/* Simple topology SVG */}
        <div style={{
          background: '#0A0A0A', borderRadius: '6px', padding: '24px',
          marginBottom: '20px', border: '1px solid #1D1D1D',
        }}>
          <svg viewBox="0 0 520 200" width="100%" style={{ display: 'block' }}>
            {/* Connections */}
            <line x1="100" y1="100" x2="260" y2="60" stroke="#1D1D1D" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="100" y1="100" x2="260" y2="140" stroke="#1D1D1D" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="260" y1="60" x2="420" y2="100" stroke="#1D1D1D" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="260" y1="140" x2="420" y2="100" stroke="#1D1D1D" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="260" y1="60" x2="260" y2="140" stroke="#292929" strokeWidth="1" />

            {/* EPR source (center-top)*/}
            <circle cx="260" cy="60" r="18" fill="rgba(99,102,241,0.06)" stroke="#6366F1" strokeWidth="1.5" />
            <text x="260" y="55" textAnchor="middle" fill="#6366F1" fontSize="8" fontFamily="Rajdhani, sans-serif" fontWeight="700">EPR</text>
            <text x="260" y="64" textAnchor="middle" fill="#6366F1" fontSize="7" fontFamily="IBM Plex Mono, monospace">SRC</text>
            <text x="260" y="86" textAnchor="middle" fill="#737373" fontSize="9" fontFamily="Rajdhani, sans-serif">EPR Source</text>

            {/* Alice (left) */}
            <circle cx="100" cy="100" r="20" fill="rgba(99,102,241,0.06)" stroke="#6366F1" strokeWidth="1.5" />
            <text x="100" y="96" textAnchor="middle" fill="#6366F1" fontSize="9" fontFamily="Rajdhani, sans-serif" fontWeight="700">ALICE</text>
            <text x="100" y="107" textAnchor="middle" fill="#6366F1" fontSize="7" fontFamily="IBM Plex Mono, monospace">TX</text>
            <text x="100" y="128" textAnchor="middle" fill="#737373" fontSize="9" fontFamily="Rajdhani, sans-serif">Sender</text>

            {/* Bob (right) */}
            <circle cx="420" cy="100" r="20" fill="rgba(34,211,238,0.06)" stroke="#22D3EE" strokeWidth="1.5" />
            <text x="420" y="96" textAnchor="middle" fill="#22D3EE" fontSize="9" fontFamily="Rajdhani, sans-serif" fontWeight="700">BOB</text>
            <text x="420" y="107" textAnchor="middle" fill="#22D3EE" fontSize="7" fontFamily="IBM Plex Mono, monospace">RX</text>
            <text x="420" y="128" textAnchor="middle" fill="#737373" fontSize="9" fontFamily="Rajdhani, sans-serif">Receiver</text>

            {/* Security engine (center-bottom) */}
            <rect x="237" y="122" width="46" height="36" rx="4" fill="rgba(212,167,44,0.06)" stroke="#D4A72C" strokeWidth="1.5" />
            <text x="260" y="138" textAnchor="middle" fill="#D4A72C" fontSize="7" fontFamily="Rajdhani, sans-serif" fontWeight="700">SEC</text>
            <text x="260" y="150" textAnchor="middle" fill="#D4A72C" fontSize="7" fontFamily="IBM Plex Mono, monospace">ENGINE</text>
            <text x="260" y="168" textAnchor="middle" fill="#737373" fontSize="9" fontFamily="Rajdhani, sans-serif">Verification</text>

            {/* State dots */}
            {nodes.map((node, i) => {
              const positions = [
                { cx: 82, cy: 82 }, { cx: 438, cy: 82 }, { cx: 244, cy: 44 }, { cx: 244, cy: 122 }
              ];
              const pos = positions[i];
              if (!pos) return null;
              const color = STATE_COLOR[node.state] ?? '#737373';
              return (
                <circle key={node.id} cx={pos.cx} cy={pos.cy} r="4" fill={color} />
              );
            })}
          </svg>
        </div>
      </Panel>

      {/* Node table */}
      <Panel title="Node Registry" subtitle={`${nodes.length} nodes`}>
        <NodeTable nodes={nodes} />
      </Panel>
    </div>
  );
};

export default NodesPage;
