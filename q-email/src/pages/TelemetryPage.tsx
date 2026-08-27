import React, { useState } from 'react';
import type { ScenarioFixture } from '../data/fixtures';
import TelemetryLog from '../components/TelemetryLog';
import type { TelemetryModule } from '../types';


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

const MODULE_COLOR: Record<string, string> = {
  QUANTUM: '#22D3EE',
  ALICE: '#8B8CF8',
  BOB: '#A3A8F8',
  SECURITY: '#D4A72C',
  SESSION: '#B8B8B8',
  SYSTEM: '#737373',
};

const TelemetryPage: React.FC<Props> = ({ fixture }) => {
  const { events } = fixture;
  const [filterModule, setFilterModule] = useState<TelemetryModule | 'ALL'>('ALL');

  const modules: Array<TelemetryModule | 'ALL'> = [
    'ALL', 'SESSION', 'QUANTUM', 'ALICE', 'BOB', 'SECURITY', 'SYSTEM',
  ];

  const filtered = filterModule === 'ALL'
    ? events
    : events.filter(e => e.module === filterModule);

  const stats = {
    total: events.length,
    completed: events.filter(e => e.state === 'COMPLETED').length,
    failed: events.filter(e => e.state === 'FAILED').length,
    avgDuration: events.reduce((s, e) => s + (e.duration_ms ?? 0), 0) / events.filter(e => e.duration_ms).length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total Events', value: stats.total.toString() },
          { label: 'Completed', value: stats.completed.toString(), color: '#6366F1' },
          { label: 'Failed', value: stats.failed.toString(), color: stats.failed > 0 ? '#D65A5A' : '#737373' },
          { label: 'Avg Duration', value: `${stats.avgDuration.toFixed(0)}ms` },
        ].map(({ label, value, color }) => (
          <div key={label} className="qds-metric">
            <div className="qds-label" style={{ marginBottom: '6px' }}>{label}</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '28px', color: color ?? '#FFFFFF', letterSpacing: '0.02em' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Log panel */}
      <Panel title="Event Log" subtitle={`${filtered.length} events`}>
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {modules.map(mod => {
            const isActive = filterModule === mod;
            const color = mod === 'ALL' ? '#FFFFFF' : MODULE_COLOR[mod] ?? '#737373';
            return (
              <button
                key={mod}
                onClick={() => setFilterModule(mod)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: `1px solid ${isActive ? color + '60' : '#292929'}`,
                  background: isActive ? color + '10' : 'transparent',
                  color: isActive ? color : '#737373',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                {mod}
              </button>
            );
          })}
        </div>

        <TelemetryLog events={filtered} />
      </Panel>

      {/* Module legend */}
      <Panel title="Module Reference">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { mod: 'SESSION', desc: 'Session lifecycle management and state transitions' },
            { mod: 'QUANTUM', desc: 'EPR pair generation and quantum state operations' },
            { mod: 'ALICE', desc: 'Sender node: state preparation and basis selection' },
            { mod: 'BOB', desc: 'Receiver node: quantum measurements and basis reconciliation' },
            { mod: 'SECURITY', desc: 'QBER computation, CHSH evaluation, anomaly detection' },
            { mod: 'SYSTEM', desc: 'Platform infrastructure and operational events' },
          ].map(({ mod, desc }) => (
            <div key={mod} style={{
              padding: '10px 12px', background: '#0A0A0A',
              borderRadius: '6px', border: '1px solid #1D1D1D',
            }}>
              <div style={{
                fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.08em', color: MODULE_COLOR[mod] ?? '#737373', marginBottom: '4px',
              }}>
                {mod}
              </div>
              <div style={{ fontSize: '11px', color: '#737373', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

export default TelemetryPage;
