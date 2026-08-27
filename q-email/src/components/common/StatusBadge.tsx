import React from 'react';
import { SessionState } from '../../types';

interface StatusBadgeProps {
  status: SessionState | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = (st: string) => {
    switch (st) {
      case 'ACCEPTED':
      case 'AUDITED':
      case 'VERIFIED':
      case 'SIGNED':
      case 'EPR_READY':
      case 'Ready':
      case 'Completed':
      case 'SUCCESS':
        return 'bg-brand-emerald-light text-brand-emerald border-brand-emerald-border';
      case 'REJECTED':
      case 'FAILURE':
      case 'Alert':
        return 'bg-brand-red-light text-brand-red border-brand-red-border';
      case 'FLAG':
      case 'SIFTED':
      case 'Active':
      case 'Processing':
        return 'bg-brand-amber-light text-brand-amber border-brand-amber-border';
      case 'CREATED':
      case 'CLOSED':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-mono-tech uppercase tracking-wider ${sizeStyle} ${getBadgeStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {status}
    </span>
  );
};
