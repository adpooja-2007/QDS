import React from 'react';
import { History, Clock } from 'lucide-react';
import { ProtocolEvent } from '../../types';

interface ProtocolTimelineProps {
  events: ProtocolEvent[];
}

export const ProtocolTimeline: React.FC<ProtocolTimelineProps> = ({ events }) => {
  const displayEvents = events.length > 0 ? events : [
    { id: '1', timestamp: '21:10:00', event_type: 'SESSION_CREATED', description: 'Quantum security session initialized with 1000 EPR pairs.', node: 'Arbitrator', severity: 'info' },
    { id: '2', timestamp: '21:10:12', event_type: 'EPR_GENERATION_COMPLETED', description: '1000 EPR pairs distributed to Alice and Bob.', node: 'Arbitrator', severity: 'success' },
    { id: '3', timestamp: '21:11:15', event_type: 'SIGNATURE_CREATED', description: 'Document SHA-256 hash signed with quantum key.', node: 'Alice', severity: 'info' },
    { id: '4', timestamp: '21:12:02', event_type: 'BELL_MEASUREMENT_COMPLETED', description: 'Bell measurements completed across 500 test pairs.', node: 'Alice', severity: 'success' },
    { id: '5', timestamp: '21:13:20', event_type: 'SIFTING_COMPLETED', description: 'Basis reconciliation completed. 500 sifted bits obtained.', node: 'Arbitrator', severity: 'info' },
    { id: '6', timestamp: '21:14:12', event_type: 'DECISION_GENERATED', description: 'Security decision ACCEPT emitted.', node: 'Security Engine', severity: 'success' }
  ];

  return (
    <div className="soc-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-indigo" />
          <h3 className="text-sm font-semibold text-brand-dark">Protocol Timeline</h3>
        </div>
        <span className="text-[11px] font-mono-tech text-brand-muted">
          Chronological Audit Stream
        </span>
      </div>

      <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border">
        {displayEvents.map((evt) => {
          const isError = evt.severity === 'error';
          const isWarning = evt.severity === 'warning';
          const isSuccess = evt.severity === 'success';

          return (
            <div key={evt.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-[1.65rem] top-1.5 w-2 h-2 rounded-full ring-2 ring-surface ${
                  isError
                    ? 'bg-brand-red'
                    : isWarning
                    ? 'bg-brand-amber'
                    : isSuccess
                    ? 'bg-brand-emerald'
                    : 'bg-brand-indigo'
                }`}
              />

              <div className="p-2.5 rounded-lg bg-brand-background-secondary border border-brand-border/60 hover:border-brand-border transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tech font-bold text-brand-dark text-[11px]">
                      {evt.event_type}
                    </span>
                    {evt.node && (
                      <span className="text-[10px] font-mono-tech text-brand-muted px-1.5 py-0.2 bg-white rounded border border-slate-200">
                        {evt.node}
                      </span>
                    )}
                  </div>
                  <span className="font-mono-tech text-[10px] text-brand-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {evt.timestamp}
                  </span>
                </div>
                <p className="text-xs text-brand-slate mt-1 leading-relaxed">
                  {evt.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
