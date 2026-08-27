import React from 'react';
import { ShieldAlert, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No active security session',
  description = 'Create a new quantum security session to begin signature verification and channel integrity auditing.',
  actionText = 'Create Session',
  onAction
}) => {
  return (
    <div className="soc-card p-8 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 border border-brand-border flex items-center justify-center text-brand-slate mb-3">
        <ShieldAlert className="w-6 h-6 text-brand-indigo" />
      </div>
      <h3 className="text-base font-semibold text-brand-dark">{title}</h3>
      <p className="text-sm text-brand-muted max-w-md mt-1 mb-4">{description}</p>
      {onAction && (
        <button onClick={onAction} className="btn-primary text-xs py-2 px-4">
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};
