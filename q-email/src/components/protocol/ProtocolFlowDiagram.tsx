import React from 'react';
import {
  Layers,
  FileSignature,
  Activity,
  RefreshCw,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { SessionState } from '../../types';

interface ProtocolFlowDiagramProps {
  sessionState?: SessionState;
}

interface StepItem {
  id: string;
  name: string;
  node: string;
  desc: string;
  icon: React.ReactNode;
  activeStates: SessionState[];
}

export const ProtocolFlowDiagram: React.FC<ProtocolFlowDiagramProps> = ({
  sessionState = 'AUDITED'
}) => {
  const steps: StepItem[] = [
    {
      id: 'step-1',
      name: 'EPR Distribution',
      node: 'Arbitrator',
      desc: 'Generates entangled |Phi+> pairs and routes to Alice and Bob.',
      icon: <Layers className="w-4 h-4" />,
      activeStates: ['EPR_READY', 'SIGNED', 'VERIFIED', 'SIFTED', 'AUDITED', 'ACCEPTED', 'REJECTED']
    },
    {
      id: 'step-2',
      name: 'Signature Prep',
      node: 'Alice',
      desc: 'Computes document SHA-256 and prepares quantum states.',
      icon: <FileSignature className="w-4 h-4" />,
      activeStates: ['SIGNED', 'VERIFIED', 'SIFTED', 'AUDITED', 'ACCEPTED', 'REJECTED']
    },
    {
      id: 'step-3',
      name: 'Bell Measurement',
      node: 'Alice',
      desc: 'Executes joint Bell-state measurements across signature pairs.',
      icon: <Activity className="w-4 h-4" />,
      activeStates: ['VERIFIED', 'SIFTED', 'AUDITED', 'ACCEPTED', 'REJECTED']
    },
    {
      id: 'step-4',
      name: 'Feed-Forward & Pauli',
      node: 'Bob',
      desc: 'Receives classical correction bits and applies unitary Pauli X/Z.',
      icon: <RefreshCw className="w-4 h-4" />,
      activeStates: ['VERIFIED', 'SIFTED', 'AUDITED', 'ACCEPTED', 'REJECTED']
    },
    {
      id: 'step-5',
      name: 'Basis Sifting',
      node: 'Arbitrator',
      desc: 'Reconciles measurement bases; sifts matching correlation bits.',
      icon: <Filter className="w-4 h-4" />,
      activeStates: ['SIFTED', 'AUDITED', 'ACCEPTED', 'REJECTED']
    },
    {
      id: 'step-6',
      name: 'Security Audit & Decision',
      node: 'Security Engine',
      desc: 'Calculates QBER, verifies CHSH & outputs deterministic verdict.',
      icon: <CheckCircle2 className="w-4 h-4" />,
      activeStates: ['AUDITED', 'ACCEPTED', 'REJECTED']
    }
  ];

  return (
    <div className="soc-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-brand-dark">Protocol Flow</h3>
          <p className="text-xs text-brand-muted mt-0.5">
            End-to-end quantum digital signature verification pipeline
          </p>
        </div>
        <span className="text-[11px] font-mono-tech text-brand-indigo bg-brand-indigo-light px-2 py-0.5 rounded border border-brand-indigo/20">
          6 Stages Active
        </span>
      </div>

      {/* Engineering Step Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((step, idx) => {
          const isComplete = step.activeStates.includes(sessionState);

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-lg border transition-all relative ${
                isComplete
                  ? 'bg-surface border-brand-indigo/30 shadow-subtle'
                  : 'bg-slate-50/50 border-brand-border opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded ${
                      isComplete
                        ? 'bg-brand-indigo text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-xs font-semibold text-brand-dark">
                    {idx + 1}. {step.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono-tech text-brand-muted px-1.5 py-0.5 bg-slate-100 rounded">
                  {step.node}
                </span>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed">
                {step.desc}
              </p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono-tech pt-2 border-t border-slate-100">
                <span className={isComplete ? 'text-brand-emerald font-medium' : 'text-slate-400'}>
                  {isComplete ? '✓ Executed' : 'Pending'}
                </span>
                <span className="text-slate-400">Stage {idx + 1}/6</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
