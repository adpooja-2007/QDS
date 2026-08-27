import React from 'react';
import { Plus, Play, ShieldCheck, RotateCcw, XCircle, Loader2 } from 'lucide-react';
import { SessionState } from '../../types';

interface SessionControlsProps {
  sessionState?: SessionState;
  onOpenCreate: () => void;
  onRunVerification: () => Promise<void>;
  onRunAudit: () => Promise<void>;
  onReset: () => void;
  onCloseSession: () => Promise<void>;
  loading?: boolean;
  auditRunning?: boolean;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  sessionState = 'AUDITED',
  onOpenCreate,
  onRunVerification,
  onRunAudit,
  onReset,
  onCloseSession,
  loading = false,
  auditRunning = false
}) => {
  return (
    <div className="soc-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-brand-dark">Session Operations</h3>
          <p className="text-xs text-brand-muted mt-0.5">
            Orchestrate verification pipeline and trigger deterministic security audits
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Create Session */}
          <button
            onClick={onOpenCreate}
            disabled={loading || auditRunning}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <Plus className="w-3.5 h-3.5 text-brand-indigo" />
            Create Session
          </button>

          {/* Run Verification */}
          <button
            onClick={onRunVerification}
            disabled={loading || auditRunning}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <Play className="w-3.5 h-3.5 text-brand-blue" />
            Run Verification
          </button>

          {/* Run Security Audit (Primary Button) */}
          <button
            onClick={onRunAudit}
            disabled={loading || auditRunning}
            className="btn-primary text-xs py-2 px-4 shadow-sm"
          >
            {auditRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Auditing...
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Run Security Audit
              </>
            )}
          </button>

          {/* Reset Session */}
          <button
            onClick={onReset}
            disabled={loading || auditRunning}
            className="btn-secondary text-xs py-2 px-3"
            title="Reset Session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          {/* Close Session */}
          <button
            onClick={onCloseSession}
            disabled={loading || auditRunning || sessionState === 'CLOSED'}
            className="btn-danger text-xs py-2 px-3"
            title="Close Session"
          >
            <XCircle className="w-3.5 h-3.5" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
