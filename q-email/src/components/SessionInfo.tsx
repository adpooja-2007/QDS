import React from 'react';
import type { Session } from '../types';


interface Props {
  session: Session;
}

const SessionInfo: React.FC<Props> = ({ session }) => {
  const STATE_COLOR: Record<string, string> = {
    ACCEPTED: '#6366F1',
    REJECTED: '#D65A5A',
    AUDITED: '#22D3EE',
    VERIFIED: '#D4A72C',
    CREATED: '#737373',
    SIGNED: '#8B8CF8',
    SIFTED: '#B8B8B8',
    EPR_READY: '#8B8CF8',
    CLOSED: '#404040',
  };

  const stateColor = STATE_COLOR[session.state] ?? '#737373';

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    {
      label: 'Session ID',
      value: (
        <span
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            color: '#FFFFFF',
            letterSpacing: '0.04em',
          }}
        >
          {session.session_id}
        </span>
      ),
    },
    {
      label: 'Protocol',
      value: (
        <span
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            color: '#B8B8B8',
          }}
        >
          {session.protocol_version}
        </span>
      ),
    },
    {
      label: 'State',
      value: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '2px',
              height: '12px',
              borderRadius: '1px',
              background: stateColor,
            }}
          />
          <span
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '11px',
              fontWeight: 600,
              color: stateColor,
              letterSpacing: '0.08em',
            }}
          >
            {session.state}
          </span>
        </div>
      ),
    },
    {
      label: 'EPR Pairs',
      value: (
        <span
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            color: '#B8B8B8',
          }}
        >
          {session.epr_pair_count.toLocaleString()}
        </span>
      ),
    },
    {
      label: 'Threshold α',
      value: (
        <span
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            color: '#B8B8B8',
          }}
        >
          {(session.threshold * 100).toFixed(1)}%
        </span>
      ),
    },
    {
      label: 'Created',
      value: (
        <span
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            color: '#737373',
          }}
        >
          {new Date(session.created_at).toLocaleTimeString()}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {rows.map(({ label, value }, idx) => (
        <div
          key={label}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: idx < rows.length - 1 ? '1px solid #1D1D1D' : 'none',
          }}
        >
          <span style={{ fontSize: '11px', color: '#737373' }}>{label}</span>
          <div>{value}</div>
        </div>
      ))}
    </div>
  );
};

export default SessionInfo;
