import React from 'react';
import type { TelemetryEvent, TelemetryStatus } from '../types';


interface Props {
  events: TelemetryEvent[];
}

const STATUS_STYLE: Record<TelemetryStatus, { color: string; label: string }> = {
  COMPLETED: { color: '#6366F1', label: 'DONE' },
  RUNNING: { color: '#22D3EE', label: 'RUN' },
  PENDING: { color: '#737373', label: 'PEND' },
  FAILED: { color: '#D65A5A', label: 'FAIL' },
};

const MODULE_COLOR: Record<string, string> = {
  QUANTUM: '#22D3EE',
  ALICE: '#8B8CF8',
  BOB: '#A3A8F8',
  SECURITY: '#D4A72C',
  SESSION: '#B8B8B8',
  SYSTEM: '#737373',
};

const TelemetryLog: React.FC<Props> = ({ events }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="qds-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Module</th>
            <th>Component</th>
            <th>Event</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => {
            const s = STATUS_STYLE[ev.state];
            const modColor = MODULE_COLOR[ev.module] ?? '#737373';
            return (
              <tr key={ev.id}>
                <td>
                  <span
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '11px',
                      color: '#737373',
                    }}
                  >
                    {ev.timestamp}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: modColor,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {ev.module}
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: '#B8B8B8' }}>
                    {ev.component}
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: '#FFFFFF' }}>
                    {ev.event}
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: '#737373' }}>
                    {ev.duration_ms != null ? `${ev.duration_ms}ms` : '—'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '2px',
                        height: '12px',
                        borderRadius: '1px',
                        background: s.color,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: s.color,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TelemetryLog;
