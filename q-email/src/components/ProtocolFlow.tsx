import React from 'react';
import type { ProtocolStep } from '../types';


interface Props {
  steps: ProtocolStep[];
}

const STATUS_CONFIG = {
  COMPLETED: { color: '#6366F1', bg: 'rgba(99,102,241,0.08)', label: 'DONE' },
  IN_PROGRESS: { color: '#22D3EE', bg: 'rgba(34,211,238,0.06)', label: 'RUN' },
  PENDING: { color: '#404040', bg: 'rgba(255,255,255,0.02)', label: 'PEND' },
};

const ProtocolFlow: React.FC<Props> = ({ steps }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {steps.map((step, idx) => {
        const cfg = STATUS_CONFIG[step.status];
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            {/* Timeline line + dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', flexShrink: 0 }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: cfg.bg,
                  border: `1.5px solid ${cfg.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: cfg.color,
                  flexShrink: 0,
                }}
              >
                {step.code}
              </div>
              {!isLast && (
                <div
                  style={{
                    width: '1px',
                    flex: 1,
                    minHeight: '16px',
                    background: step.status === 'PENDING' ? '#1D1D1D' : '#292929',
                    marginTop: '2px',
                    marginBottom: '2px',
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                paddingBottom: isLast ? 0 : '12px',
                paddingTop: '4px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '2px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: step.status === 'PENDING' ? '#404040' : '#FFFFFF',
                    letterSpacing: '0.01em',
                  }}
                >
                  {step.label}
                </span>
                {step.duration_ms && (
                  <span
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '10px',
                      color: '#737373',
                    }}
                  >
                    {step.duration_ms}ms
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#737373',
                  lineHeight: 1.4,
                }}
              >
                {step.description}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: '#404040',
                  marginTop: '2px',
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
              >
                {step.node}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProtocolFlow;
