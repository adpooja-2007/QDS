import React from 'react';
import type { ScenarioFixture } from '../data/fixtures';
import ProtocolFlow from '../components/ProtocolFlow';

import CommDiagram from '../components/CommDiagram';

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

const ProtocolPage: React.FC<Props> = ({ fixture }) => {
  const { protocol, comm } = fixture;
  const completed = protocol.filter(s => s.status === 'COMPLETED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Progress */}
      <div className="qds-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '13px', letterSpacing: '0.04em', color: '#FFFFFF' }}>
                Protocol Execution Progress
              </div>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: '#6366F1' }}>
                {completed} / {protocol.length} steps
              </span>
            </div>
            <div style={{ height: '3px', background: '#1D1D1D', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(completed / protocol.length) * 100}%`,
                background: '#6366F1',
                borderRadius: '2px',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        </div>

        {/* Step pills */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {protocol.map(step => (
            <div
              key={step.id}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                background: step.status === 'COMPLETED'
                  ? 'rgba(99,102,241,0.1)'
                  : step.status === 'IN_PROGRESS'
                  ? 'rgba(34,211,238,0.08)'
                  : 'rgba(255,255,255,0.02)',
                color: step.status === 'COMPLETED'
                  ? '#6366F1'
                  : step.status === 'IN_PROGRESS'
                  ? '#22D3EE'
                  : '#404040',
                border: `1px solid ${step.status === 'COMPLETED'
                  ? 'rgba(99,102,241,0.3)'
                  : step.status === 'IN_PROGRESS'
                  ? 'rgba(34,211,238,0.25)'
                  : '#1D1D1D'}`,
              }}
            >
              {step.code}
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Protocol timeline */}
        <Panel title="BB84-EPR Protocol" subtitle="step-by-step">
          <ProtocolFlow steps={protocol} />
        </Panel>

        {/* Channel comm */}
        <Panel title="Quantum Channel State">
          <CommDiagram comm={comm} />
        </Panel>
      </div>

      {/* Protocol legend */}
      <Panel title="Step Reference" subtitle="BB84-EPR-QDS protocol stages">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {protocol.map(step => (
            <div
              key={step.id}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '10px',
                background: '#0A0A0A',
                borderRadius: '6px',
                border: '1px solid #1D1D1D',
              }}
            >
              <div style={{
                width: '24px', height: '24px', borderRadius: '4px',
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'IBM Plex Mono, monospace', fontSize: '8px',
                fontWeight: 700, color: '#6366F1', letterSpacing: '0.04em',
                flexShrink: 0,
              }}>
                {step.code}
              </div>
              <div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '12px', color: '#FFFFFF', marginBottom: '2px' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: '11px', color: '#737373', lineHeight: 1.4 }}>
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

export default ProtocolPage;
