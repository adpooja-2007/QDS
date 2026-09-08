import React, { useState, useEffect } from 'react';

export default function SecurityModal({ isOpen, onClose, securityData, currentSender, activeRecipient }) {
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 180);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const passed = securityData?.is_pass ?? (securityData?.decision === 'ACCEPT' || securityData?.qds_status === 'VERIFIED');
  const qberVal = securityData?.qber_percentage ?? securityData?.qber ?? 0;
  const threshVal = securityData?.threshold_percentage ?? securityData?.threshold ?? 14.0;
  const chshVal = securityData?.chsh_score ?? securityData?.chsh ?? 2.82;
  const chshStatus = securityData?.chshStatus || (chshVal >= 2.0 ? 'ENTANGLEMENT_PRESENT (Quantum)' : 'COLLAPSED (Classical / Disturbed)');
  const route = securityData?.route_path ?? securityData?.route ?? [currentSender || 'alice', 'Q1-Router', activeRecipient || 'bob'];
  const routeStr = Array.isArray(route) ? route.join(' → ') : String(route);
  const sessionId = securityData?.session_id || 'QKD-ACTIVE-LATEST';

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none ${
        isClosing ? 'shadcn-dialog-overlay-closing' : 'shadcn-dialog-overlay'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#FCFBF8] border border-[#DDD4C5] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col font-sans ${
          isClosing ? 'shadcn-dialog-content-closing' : 'shadcn-dialog-content'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#EAE3DA] bg-[#F7F3EC] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#181B20] text-cream-100 flex items-center justify-center shadcn-pop-in">
              <svg className="w-4 h-4 text-cream-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#181B20]">Quantum Digital Signature Verification</h3>
              <p className="font-mono text-[10px] text-[#7F776B]">
                Channel: {currentSender || 'Alice'} ↔ {activeRecipient || 'Bob'} · Session {sessionId}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-[#E8E1D5] text-[#746D62] shadcn-btn" title="Close (Esc)">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs font-sans max-h-[80vh] overflow-y-auto">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7] transition duration-150 hover:border-[#DDD5C8]">
              <div>
                <span className="font-medium text-[#332E27] block">Hoeffding Gate Verdict</span>
                <span className="text-[10px] text-[#746C61] font-mono">Statistical bound test & Bell correlation</span>
              </div>
              {passed ? (
                <span className="font-mono text-xs text-forest-800 font-bold bg-forest-100/90 px-2.5 py-1 rounded-lg border border-forest-300 shadcn-pop-in">
                  VERIFIED (ACCEPT)
                </span>
              ) : (
                <span className="font-mono text-xs text-terracotta-800 font-bold bg-terracotta-100 px-2.5 py-1 rounded-lg border border-terracotta-300 shadcn-pop-in">
                  COMPROMISED (REJECT)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7] transition duration-150 hover:border-[#DDD5C8]">
                <span className="text-[10px] text-[#746C61] uppercase tracking-wider block font-mono">Observed QBER</span>
                <span className={`font-mono text-sm font-bold mt-0.5 block ${passed ? 'text-forest-700' : 'text-terracotta-600'}`}>
                  {qberVal.toFixed(2)}%
                </span>
                <span className="text-[9px] text-[#8C8479] font-mono">Cutoff: ≤ {threshVal.toFixed(2)}%</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7] transition duration-150 hover:border-[#DDD5C8]">
                <span className="text-[10px] text-[#746C61] uppercase tracking-wider block font-mono">CHSH Bell Score (S)</span>
                <span className={`font-mono text-sm font-bold mt-0.5 block ${chshVal >= 2.0 ? 'text-forest-700' : 'text-terracotta-600'}`}>
                  S = {chshVal.toFixed(2)}
                </span>
                <span className="text-[9px] text-[#8C8479] font-mono">{chshVal >= 2.0 ? 'Quantum (S ≥ 2.0)' : 'Classical (S < 2.0)'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7] space-y-1 transition duration-150 hover:border-[#DDD5C8]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#746C61] uppercase tracking-wider font-mono">QuARC Adaptive Route</span>
                <span className="text-[9px] font-mono text-forest-800 bg-forest-50 px-1.5 py-0.5 rounded border border-forest-200 font-semibold">OPTIMAL</span>
              </div>
              <span className="font-mono text-xs font-semibold text-[#181B20] block">
                {routeStr}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7] space-y-1 transition duration-150 hover:border-[#DDD5C8]">
              <span className="text-[10px] text-[#746C61] uppercase tracking-wider font-mono block">Quantum Cryptographic Profile</span>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-[#443E35]">
                <div>• Signature: <span className="font-bold">Joint Bell State</span></div>
                <div>• Privacy: <span className="font-bold">Toeplitz Hashing</span></div>
                <div>• Emission: <span className="font-bold">1550nm Telecom</span></div>
                <div>• PQC Fallback: <span className="font-bold">Dilithium3</span></div>
              </div>
            </div>
          </div>

          {/* Expandable Technical Details with smooth accordion */}
          <div className="border border-[#EAE3DA] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowTechDetails(!showTechDetails)}
              className="w-full p-3 bg-[#F4EFEA] hover:bg-[#EAE3DA] text-left font-mono text-[11px] font-semibold text-[#332E27] flex justify-between items-center shadcn-btn select-none"
            >
              <span>View Raw Telemetry Proofs</span>
              <span className={`transition-transform duration-200 ${showTechDetails ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showTechDetails && (
              <div className="p-3.5 bg-white font-mono text-[10px] text-[#443E35] space-y-1.5 border-t border-[#EAE3DA] shadcn-accordion">
                <div><strong className="text-gray-900">Bell Pairs Pumped:</strong> 1,000 EPR pairs |Φ⁺⟩</div>
                <div><strong className="text-gray-900">Confidence Parameter α:</strong> 1.0e-06 (99.9999% security)</div>
                <div><strong className="text-gray-900">CHSH Classification:</strong> {chshStatus}</div>
                <div><strong className="text-gray-900">Session ID:</strong> {sessionId}</div>
                <div><strong className="text-gray-900">Pauli Alignment:</strong> feed-forward bits σXᵇ¹ · σZᵇ² applied</div>
              </div>
            )}
          </div>
        </div>

        <div className="p-3.5 border-t border-[#EAE3DA] bg-[#F7F3EC] flex justify-between items-center">
          <span className="font-mono text-[10px] text-[#867E73]">Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[9px]">Esc</kbd> to close</span>
          <button onClick={onClose} className="bg-[#181B20] hover:bg-black text-cream-100 px-4 py-1.5 rounded-lg text-xs font-mono shadcn-btn shadow-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
