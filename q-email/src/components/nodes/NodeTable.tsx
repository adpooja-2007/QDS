import React from 'react';
import { Server } from 'lucide-react';
import { SystemNode } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface NodeTableProps {
  nodes: SystemNode[];
}

export const NodeTable: React.FC<NodeTableProps> = ({ nodes }) => {
  const displayNodes = nodes.length > 0 ? nodes : [
    { id: '1', name: 'Alice', role: 'Signature preparation', last_event: 'Bell measurement completed', status: 'Ready', endpoint: 'node-alice.local' },
    { id: '2', name: 'Bob', role: 'Verification', last_event: 'Measurement completed', status: 'Ready', endpoint: 'node-bob.local' },
    { id: '3', name: 'Arbitrator', role: 'EPR distribution', last_event: 'EPR distributed', status: 'Ready', endpoint: 'node-arbitrator.local' },
    { id: '4', name: 'Eve', role: 'Adversary monitoring', last_event: 'No channel intrusion detected', status: 'Ready', endpoint: 'node-eve.tap' },
    { id: '5', name: 'Security Engine', role: 'Threat analysis', last_event: 'Decision generated', status: 'Ready', endpoint: 'soc-engine.core' },
    { id: '6', name: 'Quantum Engine', role: 'Simulation', last_event: 'Simulation completed', status: 'Ready', endpoint: 'qiskit-aer.core' }
  ];

  return (
    <div className="soc-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-brand-indigo" />
          <h3 className="text-sm font-semibold text-brand-dark">System Nodes</h3>
        </div>
        <span className="text-[11px] font-mono-tech text-brand-slate bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          6 Cluster Nodes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-brand-border text-brand-muted uppercase font-mono-tech text-[10px] tracking-wider bg-brand-background-secondary/50">
              <th className="py-2.5 px-3 font-semibold">Node</th>
              <th className="py-2.5 px-3 font-semibold">Role</th>
              <th className="py-2.5 px-3 font-semibold">Last Event</th>
              <th className="py-2.5 px-3 font-semibold">Endpoint</th>
              <th className="py-2.5 px-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {displayNodes.map((n) => (
              <tr key={n.id} className="hover:bg-brand-background-secondary/30 transition-colors">
                <td className="py-3 px-3 font-semibold text-brand-dark">
                  {n.name}
                </td>
                <td className="py-3 px-3 text-brand-slate">
                  {n.role}
                </td>
                <td className="py-3 px-3 text-brand-muted font-mono-tech text-[11px]">
                  {n.last_event}
                </td>
                <td className="py-3 px-3 font-mono-tech text-brand-muted text-[11px]">
                  {n.endpoint || 'local.cluster'}
                </td>
                <td className="py-3 px-3 text-right">
                  <StatusBadge status={n.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
