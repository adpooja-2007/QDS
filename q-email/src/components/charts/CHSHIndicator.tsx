import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { SecurityReport } from '../../types';

interface CHSHIndicatorProps {
  report: SecurityReport | null;
}

export const CHSHIndicator: React.FC<CHSHIndicatorProps> = ({ report }) => {
  const chsh = report?.metrics.chsh ?? 2.74;
  const isViolation = chsh > 2.0;
  const isStrongViolation = chsh >= 2.4;

  // Scale: 0 to 3.0 -> percentage 0% to 100%
  const clamped = Math.max(0, Math.min(3.0, chsh));
  const pointerPercent = (clamped / 3.0) * 100;

  return (
    <div className="soc-card p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brand-dark">CHSH Correlation</h3>
          <span className="text-[11px] font-mono-tech text-brand-muted uppercase">
            Bell Inequality (S)
          </span>
        </div>
        <p className="text-xs text-brand-muted mt-0.5">
          Clauser-Horne-Shimony-Holt non-locality verification
        </p>

        {/* Large Score Display */}
        <div className="my-5 flex items-baseline justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-semibold font-mono-tech tracking-tight text-brand-dark">
              {chsh.toFixed(2)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              {isViolation ? (
                <span className="text-brand-emerald font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Bell inequality violation observed (S &gt; 2.0)
                </span>
              ) : (
                <span className="text-brand-red font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  No Bell violation observed (S &le; 2.0)
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-sans text-brand-muted block">Tsirelson's Bound</span>
            <span className="font-mono-tech text-xs text-brand-slate">2√2 ≈ 2.828</span>
          </div>
        </div>

        {/* Horizontal Scientific Scale */}
        <div className="my-6">
          <div className="relative h-2.5 bg-slate-200 rounded-full overflow-visible">
            {/* Classical Limit (0 to 2.0) */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-slate-400/40 rounded-l-full"
              style={{ width: `${(2.0 / 3.0) * 100}%` }}
            />
            {/* Quantum Regime (2.0 to 3.0) */}
            <div
              className="absolute top-0 bottom-0 bg-brand-indigo/30 rounded-r-full"
              style={{ left: `${(2.0 / 3.0) * 100}%`, width: `${(1.0 / 3.0) * 100}%` }}
            />

            {/* Classical Threshold Line at 2.0 */}
            <div
              className="absolute -top-1 bottom-0 w-0.5 bg-slate-700 h-4"
              style={{ left: `${(2.0 / 3.0) * 100}%` }}
            />

            {/* Strong Violation Marker at 2.4 */}
            <div
              className="absolute -top-1 bottom-0 w-0.5 bg-brand-emerald h-4"
              style={{ left: `${(2.4 / 3.0) * 100}%` }}
            />

            {/* Current Value Pointer */}
            <div
              className="absolute -top-2.5 -ml-2 flex flex-col items-center transition-all duration-300"
              style={{ left: `${pointerPercent}%` }}
            >
              <div className="w-4 h-4 rounded-full bg-brand-indigo ring-2 ring-white shadow-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
            </div>
          </div>

          {/* Scale Labels */}
          <div className="relative flex justify-between text-[10px] font-mono-tech text-brand-muted mt-2">
            <span>0.0</span>
            <span style={{ position: 'absolute', left: `${(2.0 / 3.0) * 100}%`, transform: 'translateX(-50%)' }}>
              2.0 (Classical Limit)
            </span>
            <span style={{ position: 'absolute', left: `${(2.4 / 3.0) * 100}%`, transform: 'translateX(-50%)' }}>
              2.4
            </span>
            <span>3.0</span>
          </div>
        </div>
      </div>

      {/* Scientific Interpretation Table */}
      <div className="mt-4 pt-3 border-t border-brand-border grid grid-cols-3 gap-2 text-center text-xs">
        <div className={`p-2 rounded border ${isStrongViolation ? 'bg-brand-emerald-light/40 border-brand-emerald-border text-brand-emerald' : 'bg-slate-50 border-brand-border text-brand-slate'}`}>
          <span className="font-mono-tech font-semibold block">&gt; 2.4</span>
          <span className="text-[10px] font-sans">Strong observed Bell violation</span>
        </div>
        <div className={`p-2 rounded border ${isViolation && !isStrongViolation ? 'bg-brand-amber-light/40 border-brand-amber-border text-brand-amber' : 'bg-slate-50 border-brand-border text-brand-slate'}`}>
          <span className="font-mono-tech font-semibold block">2.0 – 2.4</span>
          <span className="text-[10px] font-sans">Weaker observed correlation</span>
        </div>
        <div className={`p-2 rounded border ${!isViolation ? 'bg-brand-red-light/40 border-brand-red-border text-brand-red' : 'bg-slate-50 border-brand-border text-brand-slate'}`}>
          <span className="font-mono-tech font-semibold block">&lt; 2.0</span>
          <span className="text-[10px] font-sans">No Bell violation observed</span>
        </div>
      </div>
    </div>
  );
};
