import React from 'react';
import type { CommunicationState } from '../types';


interface Props {
  comm: CommunicationState;
}

const CommDiagram: React.FC<Props> = ({ comm }) => {
  const efficiency = comm.packets_sent > 0
    ? ((comm.packets_verified / comm.packets_sent) * 100).toFixed(1)
    : '0.0';

  return (
    <div>
      {/* Status bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          padding: '8px 12px',
          background: '#0A0A0A',
          borderRadius: '6px',
          border: '1px solid #1D1D1D',
        }}
      >
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22D3EE' }} />
        <span
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            color: '#22D3EE',
            letterSpacing: '0.08em',
            fontWeight: 600,
          }}
        >
          {comm.status.replace(/_/g, ' ')}
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: '#737373' }}>
          Channel QBER: {(comm.channel_qber * 100).toFixed(2)}%
        </span>
      </div>

      {/* Alice ↔ Bob visual */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        {/* Alice */}
        <div
          style={{
            background: '#0A0A0A',
            border: '1px solid #292929',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.08)',
              border: '1.5px solid rgba(99,102,241,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              color: '#6366F1',
            }}
          >
            A
          </div>
          <div
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              color: '#FFFFFF',
              letterSpacing: '0.05em',
              marginBottom: '6px',
            }}
          >
            ALICE
          </div>
          <div className="qds-label" style={{ marginBottom: '4px' }}>State</div>
          <div
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '10px',
              color: '#B8B8B8',
              marginBottom: '4px',
            }}
          >
            {comm.alice.state}
          </div>
          <div className="qds-label" style={{ marginBottom: '2px' }}>Basis</div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', color: '#737373' }}>
            {comm.alice.basis}
          </div>
        </div>

        {/* Channel */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {/* Arrow */}
          <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
            <line x1="0" y1="12" x2="36" y2="12" stroke="#292929" strokeWidth="1" />
            <polygon points="36,8 44,12 36,16" fill="#292929" />
          </svg>
          <div
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '9px',
              color: '#404040',
              letterSpacing: '0.06em',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            QUANTUM<br />CHANNEL
          </div>
          <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
            <line x1="48" y1="12" x2="12" y2="12" stroke="#292929" strokeWidth="1" />
            <polygon points="12,8 4,12 12,16" fill="#292929" />
          </svg>
        </div>

        {/* Bob */}
        <div
          style={{
            background: '#0A0A0A',
            border: '1px solid #292929',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(34,211,238,0.06)',
              border: '1.5px solid rgba(34,211,238,0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              color: '#22D3EE',
            }}
          >
            B
          </div>
          <div
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              color: '#FFFFFF',
              letterSpacing: '0.05em',
              marginBottom: '6px',
            }}
          >
            BOB
          </div>
          <div className="qds-label" style={{ marginBottom: '4px' }}>State</div>
          <div
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '10px',
              color: '#B8B8B8',
              marginBottom: '4px',
            }}
          >
            {comm.bob.state}
          </div>
          <div className="qds-label" style={{ marginBottom: '2px' }}>Basis</div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', color: '#737373' }}>
            {comm.bob.basis}
          </div>
        </div>
      </div>

      {/* Packet stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        {[
          { label: 'Packets Sent', value: comm.packets_sent.toLocaleString() },
          { label: 'Verified', value: comm.packets_verified.toLocaleString() },
          { label: 'Sift Efficiency', value: `${efficiency}%` },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: '#0A0A0A',
              border: '1px solid #1D1D1D',
              borderRadius: '6px',
              padding: '10px',
              textAlign: 'center',
            }}
          >
            <div className="qds-label" style={{ marginBottom: '4px' }}>{label}</div>
            <div
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: '18px',
                color: '#FFFFFF',
                letterSpacing: '0.02em',
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommDiagram;
