import React from 'react';
import { Layers } from 'lucide-react';
import { QuantumSession } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface QuantumSessionInfoProps {
  session: QuantumSession | null;
  onOpenCreate?: () => void;
}

export const QuantumSessionInfo: React.FC<QuantumSessionInfoProps> = ({ session, onOpenCreate }) => {
  const items = [
    { label: 'EPR Pair Count', value: session?.epr_pair_count ?? 1000 },
    { label: 'State Type', value: session?.state_type ?? 'PHI_PLUS' },
    { label: 'Quantum Generator', value: session?.generator ?? 'Qiskit' },
    { label: 'Backend Simulator', value: session?.simulator ?? 'Aer' },
    { label: 'Key Length (Bits)', value: `${session?.key_length ?? 256} bits` },
    { label: 'Alpha (Tolerance)', value: session?.alpha ?? '0.000001' },
    { label: 'Protocol Version', value: `v${session?.protocol_version ?? '1.0'}` },
  ];

  return (
    <div className="soc-card p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-indigo" />
            <h3 className="text-sm font-semibold text-brand-dark">Quantum Session</h3>
          </div>
          <div className="flex items-center gap-2">
            {onOpenCreate && (
              <button
                onClick={onOpenCreate}
                className="text-[11px] font-medium text-brand-indigo hover:text-brand-indigo-hover underline cursor-pointer"
                title="Create a new quantum session"
              >
                + New Session
              </button>
            )}
            <StatusBadge status={session?.status ?? 'EPR_READY'} size="sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
          {items.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded bg-brand-background-secondary border border-brand-border">
              <span className="text-[10px] uppercase font-sans text-brand-muted block font-medium">
                {item.label}
              </span>
              <span className="font-mono-tech font-semibold text-brand-dark mt-0.5 block">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-[11px] text-brand-muted">
        <span>Session ID: <strong className="font-mono-tech text-brand-dark">{session?.session_id || 'QSEC-2026-000001'}</strong></span>
        <span>Aer Statevector Engine</span>
      </div>
    </div>
  );
};
