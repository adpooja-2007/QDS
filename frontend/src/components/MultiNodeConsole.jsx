import React, { useState } from 'react';
import { Terminal, Copy, Trash2, Filter } from 'lucide-react';

export default function MultiNodeConsole({ logs = [], onClearLogs }) {
  const [selectedNode, setSelectedNode] = useState('ALL');

  const filteredLogs = selectedNode === 'ALL'
    ? logs
    : logs.filter((log) => log.node?.toUpperCase() === selectedNode);

  const copyLogs = () => {
    const text = filteredLogs.map(l => `[${l.time}] [${l.node}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="soc-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="#00f0ff" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            DISTRIBUTED QUANTUM NODE TERMINALS
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="cyber-btn cyber-btn-dim" onClick={copyLogs} style={{ padding: '4px 8px', fontSize: '0.75rem' }} title="Copy logs">
            <Copy size={12} />
            <span>Copy</span>
          </button>
          <button className="cyber-btn cyber-btn-dim" onClick={onClearLogs} style={{ padding: '4px 8px', fontSize: '0.75rem' }} title="Clear console">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Node Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {['ALL', 'ARBITRATOR', 'ALICE', 'BOB', 'EVE'].map((node) => (
          <button
            key={node}
            className={`cyber-btn ${selectedNode === node ? 'cyber-btn-cyan' : 'cyber-btn-dim'}`}
            onClick={() => setSelectedNode(node)}
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            {node}
          </button>
        ))}
      </div>

      {/* Terminal Log Stream */}
      <div className="terminal-window">
        {filteredLogs.length === 0 ? (
          <div style={{ color: '#64748b', fontStyle: 'italic', padding: '10px 0' }}>
            No telemetry recorded yet. Start a session or run a scenario to observe distributed quantum events.
          </div>
        ) : (
          filteredLogs.map((item, index) => {
            const nodeClass = (item.node || 'system').toLowerCase();
            return (
              <div key={index} className={`terminal-line ${nodeClass}`}>
                <span className="timestamp">[{item.time}]</span>
                <span style={{ fontWeight: 700, marginRight: '6px' }}>[{item.node?.toUpperCase()}]:</span>
                <span>{item.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
