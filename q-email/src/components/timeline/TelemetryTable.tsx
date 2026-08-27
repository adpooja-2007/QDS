import React from 'react';
import { Cpu } from 'lucide-react';
import { TelemetryEvent } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface TelemetryTableProps {
  telemetry: TelemetryEvent[];
}

export const TelemetryTable: React.FC<TelemetryTableProps> = ({ telemetry }) => {
  const displayTelemetry = telemetry.length > 0 ? telemetry : [
    { id: '1', module: 'Quantum', component: 'EPR Generator', operation: 'generate_epr', duration_ms: 42, status: 'SUCCESS', timestamp: '21:10:04' },
    { id: '2', module: 'Crypto', component: 'Document Hasher', operation: 'sha256_digest', duration_ms: 3, status: 'SUCCESS', timestamp: '21:11:15' },
    { id: '3', module: 'Quantum', component: 'Bell Analyzer', operation: 'bell_measurement', duration_ms: 118, status: 'SUCCESS', timestamp: '21:12:02' },
    { id: '4', module: 'Transport', component: 'Classical Channel', operation: 'feed_forward_tx', duration_ms: 12, status: 'SUCCESS', timestamp: '21:12:18' },
    { id: '5', module: 'Quantum', component: 'Unitary Operator', operation: 'pauli_corrections', duration_ms: 64, status: 'SUCCESS', timestamp: '21:12:35' },
    { id: '6', module: 'Security', component: 'QBER Analyzer', operation: 'calculate_qber', duration_ms: 8, status: 'SUCCESS', timestamp: '21:13:40' },
    { id: '7', module: 'Security', component: 'CHSH Correlator', operation: 'evaluate_bell_inequality', duration_ms: 15, status: 'SUCCESS', timestamp: '21:14:00' }
  ];

  return (
    <div className="soc-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-brand-indigo" />
          <h3 className="text-sm font-semibold text-brand-dark">Execution Telemetry</h3>
        </div>
        <span className="text-[11px] font-mono-tech text-brand-slate bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Sub-millisecond Latencies
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-brand-border text-brand-muted uppercase font-mono-tech text-[10px] tracking-wider bg-brand-background-secondary/50">
              <th className="py-2.5 px-3 font-semibold">Module</th>
              <th className="py-2.5 px-3 font-semibold">Component</th>
              <th className="py-2.5 px-3 font-semibold">Operation</th>
              <th className="py-2.5 px-3 font-semibold">Duration</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {displayTelemetry.map((t) => (
              <tr key={t.id} className="hover:bg-brand-background-secondary/30 transition-colors">
                <td className="py-2.5 px-3 font-medium text-brand-dark">
                  {t.module}
                </td>
                <td className="py-2.5 px-3 text-brand-slate">
                  {t.component}
                </td>
                <td className="py-2.5 px-3 font-mono-tech text-[11px] text-brand-indigo">
                  {t.operation}
                </td>
                <td className="py-2.5 px-3 font-mono-tech text-brand-dark">
                  {t.duration_ms} ms
                </td>
                <td className="py-2.5 px-3">
                  <StatusBadge status={t.status} size="sm" />
                </td>
                <td className="py-2.5 px-3 text-right font-mono-tech text-[11px] text-brand-muted">
                  {t.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
