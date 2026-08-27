import React from 'react';
import { GitFork, CheckCircle2 } from 'lucide-react';
import { SessionState, SecurityDecision } from '../../types';

interface WebGLFallback2DProps {
  sessionState?: SessionState;
  decision?: SecurityDecision | string;
}

export const WebGLFallback2D: React.FC<WebGLFallback2DProps> = ({
  sessionState = 'AUDITED',
  decision = 'ACCEPT'
}) => {
  return (
    <div className="w-full h-full min-h-[300px] flex flex-col justify-between p-6 bg-slate-900 rounded-xl text-white">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-indigo-400" />
          <span>2D Protocol Topology Fallback</span>
        </div>
        <span className="font-mono-tech uppercase">{sessionState}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 my-auto items-center text-center">
        {/* Arbitrator */}
        <div className="col-span-3 flex justify-center mb-2">
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 w-44">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">ARBITRATOR</span>
            <span className="text-xs text-slate-200">EPR Distribution</span>
          </div>
        </div>

        {/* Alice */}
        <div className="flex justify-end">
          <div className="p-3 bg-slate-800 rounded-lg border border-indigo-500/50 w-40 text-left">
            <span className="text-[10px] text-indigo-400 block uppercase tracking-wider font-semibold">ALICE</span>
            <span className="text-xs text-slate-200">Signature Prep</span>
          </div>
        </div>

        {/* Channel */}
        <div className="flex flex-col items-center justify-center text-indigo-400 text-xs font-mono-tech">
          <span>|Phi+&gt; EPR</span>
          <div className="w-full h-0.5 bg-indigo-500/40 my-1 relative">
            <div className="absolute inset-0 bg-indigo-400 w-4 h-full animate-ping mx-auto"></div>
          </div>
          <span>Classical Feed-Forward</span>
        </div>

        {/* Bob */}
        <div className="flex justify-start">
          <div className="p-3 bg-slate-800 rounded-lg border border-indigo-500/50 w-40 text-left">
            <span className="text-[10px] text-indigo-400 block uppercase tracking-wider font-semibold">BOB</span>
            <span className="text-xs text-slate-200">State Verification</span>
          </div>
        </div>

        {/* Security Engine */}
        <div className="col-span-3 flex justify-center mt-2">
          <div className="p-3 bg-slate-800 rounded-lg border border-emerald-500/50 w-52">
            <span className="text-[10px] text-emerald-400 block uppercase tracking-wider font-semibold">SECURITY ENGINE</span>
            <span className="text-xs text-slate-200">Decision: <strong className="text-emerald-400">{typeof decision === 'string' ? decision : decision?.decision || 'ACCEPT'}</strong></span>
          </div>
        </div>

      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
        <span>Deterministic Channel Topology Verified</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Quantum Channel Intact
        </span>
      </div>
    </div>
  );
};
