import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { SecurityDecision } from '../../types';

interface SecurityDecisionBannerProps {
  decision: SecurityDecision | string;
  reason?: string;
  timestamp?: string;
  requestId?: string;
}

export const SecurityDecisionBanner: React.FC<SecurityDecisionBannerProps> = ({
  decision,
  reason = 'All configured security checks passed.',
  timestamp = '21:14:12',
  requestId = 'REQ-000001'
}) => {
  const getBannerConfig = () => {
    switch (decision) {
      case 'ACCEPT':
        return {
          bg: 'bg-brand-emerald-light/60',
          border: 'border-brand-emerald-border',
          text: 'text-brand-emerald',
          badgeBg: 'bg-brand-emerald text-white',
          icon: <ShieldCheck className="w-6 h-6 text-brand-emerald" />,
          title: 'ACCEPT',
          subtitle: 'All configured deterministic security checks passed successfully.'
        };
      case 'REJECT':
        return {
          bg: 'bg-brand-red-light/60',
          border: 'border-brand-red-border',
          text: 'text-brand-red',
          badgeBg: 'bg-brand-red text-white',
          icon: <ShieldAlert className="w-6 h-6 text-brand-red" />,
          title: 'REJECT',
          subtitle: 'Security verification failed: Channel anomaly or signature discrepancy detected.'
        };
      case 'FLAG':
        return {
          bg: 'bg-brand-amber-light/60',
          border: 'border-brand-amber-border',
          text: 'text-brand-amber',
          badgeBg: 'bg-brand-amber text-white',
          icon: <AlertTriangle className="w-6 h-6 text-brand-amber" />,
          title: 'FLAG',
          subtitle: 'Statistical deviation detected: Additional channel investigation recommended.'
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-brand-border',
          text: 'text-brand-dark',
          badgeBg: 'bg-slate-700 text-white',
          icon: <ShieldCheck className="w-6 h-6 text-brand-slate" />,
          title: 'PENDING',
          subtitle: 'Awaiting completion of security verification audit.'
        };
    }
  };

  const config = getBannerConfig();

  return (
    <div className={`rounded-xl border p-4 sm:p-5 transition-all ${config.bg} ${config.border}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side Decision State */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-surface border border-brand-border shadow-subtle shrink-0">
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                SECURITY DECISION
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono-tech font-bold uppercase tracking-wider ${config.badgeBg}`}>
                {config.title}
              </span>
            </div>
            <p className="text-sm font-medium text-brand-dark mt-1">
              {reason || config.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side Audit Reference */}
        <div className="flex items-center gap-4 text-xs font-mono-tech text-brand-slate pt-2 md:pt-0 border-t md:border-t-0 border-brand-border/60">
          <div>
            <span className="text-[10px] uppercase font-sans text-brand-muted block">Request ID</span>
            <span className="font-semibold text-brand-dark">{requestId}</span>
          </div>
          <div className="border-l border-brand-border pl-3">
            <span className="text-[10px] uppercase font-sans text-brand-muted block">Evaluated At</span>
            <span>{timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
