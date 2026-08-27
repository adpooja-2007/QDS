import React from 'react';
import type { SystemNode, NodeState } from '../types';


interface Props {
  nodes: SystemNode[];
}

const STATE_STYLE: Record<string, { color: string; label: string }> = {
  READY: { color: '#6366F1', label: 'READY' },
  ACTIVE: { color: '#22D3EE', label: 'ACTIVE' },
  PROCESSING: { color: '#D4A72C', label: 'PROC' },
  IDLE: { color: '#737373', label: 'IDLE' },
  ERROR: { color: '#D65A5A', label: 'ERROR' },
  ONLINE: { color: '#10B981', label: 'ONLINE' },
  STANDBY: { color: '#64748B', label: 'STANDBY' },
};


const ROLE_LABEL: Record<string, string> = {
  SENDER: 'Sender',
  RECEIVER: 'Receiver',
  ENTANGLEMENT: 'Entanglement Src',
  VERIFICATION: 'Verification',
};

const NodeTable: React.FC<Props> = ({ nodes }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="qds-table">
        <thead>
          <tr>
            <th>Node ID</th>
            <th>Role</th>
            <th>Endpoint</th>
            <th>Last Event</th>
            <th>Uptime</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => {
            const s = STATE_STYLE[node.state];
            return (
              <tr key={node.id}>
                <td>
                  <span
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '12px',
                      color: '#FFFFFF',
                    }}
                  >
                    {node.name}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#737373',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {ROLE_LABEL[node.role] ?? node.role}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '11px',
                      color: '#737373',
                    }}
                  >
                    {node.endpoint ?? '—'}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '11px',
                      color: '#B8B8B8',
                    }}
                  >
                    {node.last_event}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '11px',
                      color: '#737373',
                    }}
                  >
                    {node.uptime ?? '—'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '2px',
                        height: '14px',
                        borderRadius: '1px',
                        background: s.color,
                        flexShrink: 0,
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

export default NodeTable;
