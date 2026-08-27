import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string;
  requestId?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load security data',
  message = 'The security service did not return a valid response.',
  code = 'SECURITY_AUDIT_FAILED',
  requestId = 'REQ-000002',
  onRetry
}) => {
  return (
    <div className="soc-card p-6 border-brand-red-border bg-brand-red-light/30">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-brand-red-light border border-brand-red-border text-brand-red">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-brand-red">{title}</h4>
          <p className="text-sm text-brand-dark mt-1">{message}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono-tech text-brand-muted">
            <span>Code: <strong className="text-brand-dark">{code}</strong></span>
            <span>Request ID: <strong className="text-brand-dark">{requestId}</strong></span>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button onClick={onRetry} className="btn-secondary text-xs py-1 px-3">
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
