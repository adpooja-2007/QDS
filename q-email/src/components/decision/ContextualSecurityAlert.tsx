import React from 'react';
import { AlertOctagon, Info } from 'lucide-react';
import { SecurityReport } from '../../types';

interface ContextualSecurityAlertProps {
  report: SecurityReport | null;
}

export const ContextualSecurityAlert: React.FC<ContextualSecurityAlertProps> = ({ report }) => {
  if (!report || (!report.security.attack_detected && report.security.decision === 'ACCEPT')) {
    return null;
  }

  const isReject = report.security.decision === 'REJECT';
  const isFlag = report.security.decision === 'FLAG';

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 ${
        isReject
          ? 'bg-brand-red-light/40 border-brand-red-border'
          : isFlag
          ? 'bg-brand-amber-light/40 border-brand-amber-border'
          : 'bg-slate-50 border-brand-border'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`p-2 rounded-lg shrink-0 ${
            isReject
              ? 'bg-brand-red-light text-brand-red border border-brand-red-border'
              : 'bg-brand-amber-light text-brand-amber border border-brand-amber-border'
          }`}
        >
          {isReject ? <AlertOctagon className="w-5 h-5" /> : <Info className="w-5 h-5" />}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4
              className={`text-sm font-semibold ${
                isReject ? 'text-brand-red' : 'text-brand-amber'
              }`}
            >
              Security Alert: Verification Requires Investigation
            </h4>
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono-tech font-bold uppercase ${
                isReject
                  ? 'bg-brand-red text-white'
                  : 'bg-brand-amber text-white'
              }`}
            >
              {report.security.attack_type || 'ANOMALY'}
            </span>
          </div>

          <p className="text-xs text-brand-dark mt-1 leading-relaxed">
            {report.reason}
          </p>

          {/* Contextual Metric Badges */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-tech">
            <div className="p-2 rounded bg-surface border border-brand-border">
              <span className="text-[10px] uppercase font-sans text-brand-muted block">Attack Type</span>
              <span className="font-semibold text-brand-dark">{report.security.attack_type}</span>
            </div>
            <div className="p-2 rounded bg-surface border border-brand-border">
              <span className="text-[10px] uppercase font-sans text-brand-muted block">Observed QBER</span>
              <span className={`font-semibold ${report.checks.qber_pass ? 'text-brand-dark' : 'text-brand-red'}`}>
                {report.metrics.qber.toFixed(3)}
              </span>
            </div>
            <div className="p-2 rounded bg-surface border border-brand-border">
              <span className="text-[10px] uppercase font-sans text-brand-muted block">Threshold</span>
              <span className="font-semibold text-brand-slate">{report.metrics.threshold.toFixed(3)}</span>
            </div>
            <div className="p-2 rounded bg-surface border border-brand-border">
              <span className="text-[10px] uppercase font-sans text-brand-muted block">CHSH Score</span>
              <span className={`font-semibold ${report.checks.chsh_pass ? 'text-brand-emerald' : 'text-brand-red'}`}>
                {report.metrics.chsh.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
