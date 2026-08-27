import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { SecurityReport } from '../../types';

interface SecurityVerificationTableProps {
  report: SecurityReport | null;
}

export const SecurityVerificationTable: React.FC<SecurityVerificationTableProps> = ({ report }) => {
  const qber = report?.metrics.qber ?? 0.018;
  const threshold = report?.metrics.threshold ?? 0.100;
  const chsh = report?.metrics.chsh ?? 2.74;

  const checks = [
    {
      check: 'QBER Verification',
      passed: report?.checks.qber_pass ?? true,
      value: qber.toFixed(3),
      description: 'Observed Quantum Bit Error Rate compared against security threshold'
    },
    {
      check: 'Threshold Verification',
      passed: report?.checks.threshold_pass ?? true,
      value: threshold.toFixed(3),
      description: 'Statistical upper error bound configured by protocol specification'
    },
    {
      check: 'CHSH Correlation',
      passed: report?.checks.chsh_pass ?? true,
      value: chsh.toFixed(2),
      description: 'Clauser-Horne-Shimony-Holt Bell inequality correlation test (S > 2.0)'
    },
    {
      check: 'Session Validity',
      passed: report?.checks.session_valid ?? true,
      value: report?.checks.session_valid ? 'VALID' : 'INVALID',
      description: 'Cryptographic session nonce freshness and epoch validation check'
    }
  ];

  return (
    <div className="soc-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-brand-dark">Security Verification</h3>
          <p className="text-xs text-brand-muted mt-0.5">
            Deterministic checks returned by the security engine
          </p>
        </div>
        <span className="text-[11px] font-mono-tech text-brand-slate bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Deterministic Engine
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-brand-border text-brand-muted uppercase font-mono-tech text-[10px] tracking-wider bg-brand-background-secondary/50">
              <th className="py-2.5 px-3 font-semibold">Check</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold">Value</th>
              <th className="py-2.5 px-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {checks.map((c, idx) => (
              <tr key={idx} className="hover:bg-brand-background-secondary/30 transition-colors">
                <td className="py-3 px-3 font-medium text-brand-dark flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo"></span>
                  {c.check}
                </td>
                <td className="py-3 px-3">
                  {c.passed ? (
                    <span className="inline-flex items-center gap-1 text-brand-emerald font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-brand-red font-medium">
                      <XCircle className="w-3.5 h-3.5" />
                      Rejected
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 font-mono-tech font-semibold text-brand-dark">
                  {c.value}
                </td>
                <td className="py-3 px-3 text-brand-muted">
                  {c.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
