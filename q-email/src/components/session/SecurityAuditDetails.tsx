import React from 'react';
import { FileCheck } from 'lucide-react';
import { SecurityReport } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface SecurityAuditDetailsProps {
  report: SecurityReport | null;
}

export const SecurityAuditDetails: React.FC<SecurityAuditDetailsProps> = ({ report }) => {
  const m = report?.metrics || {
    sifted_count: 500,
    error_count: 8,
    qber: 0.016,
    baseline_qber: 0.020,
    threshold: 0.100,
    chsh: 2.71
  };

  const isSessionValid = report?.checks.session_valid ?? true;
  const attackDetected = report?.security.attack_detected ?? false;
  const decision = report?.security.decision ?? 'ACCEPT';

  const auditRows = [
    { label: 'Sifted Samples', value: m.sifted_count },
    { label: 'Error Count', value: m.error_count },
    { label: 'Observed QBER', value: m.qber.toFixed(3) },
    { label: 'Baseline QBER', value: (m.baseline_qber ?? 0.02).toFixed(3) },
    { label: 'Security Threshold', value: m.threshold.toFixed(3) },
    { label: 'CHSH Bell Score', value: m.chsh.toFixed(2) },
    { label: 'Session Valid', value: isSessionValid ? 'Yes' : 'No' },
    { label: 'Attack Detected', value: attackDetected ? 'Yes' : 'No' },
  ];

  return (
    <div className="soc-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-brand-indigo" />
          <h3 className="text-sm font-semibold text-brand-dark">Security Audit Summary</h3>
        </div>
        <StatusBadge status={decision} size="sm" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {auditRows.map((row, idx) => (
          <div key={idx} className="p-2.5 rounded bg-brand-background-secondary border border-brand-border">
            <span className="text-[10px] uppercase font-sans text-brand-muted block font-medium">
              {row.label}
            </span>
            <span className="font-mono-tech font-semibold text-brand-dark mt-0.5 block">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
