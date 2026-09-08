import React, { useState, useEffect } from 'react';

export default function ContactInfoModal({
  isOpen,
  onClose,
  contact,
  currentUser,
  messagesCount = 0,
  latestMessage = null,
  onOpenSearch = null,
  onOpenSecurity = null,
  onClearHistory = null,
}) {
  const [copiedField, setCopiedField] = useState(null);
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

  if ((!isOpen && !isClosing) || !contact) return null;

  const isEve = contact.username === 'eve';
  const isAdmin = contact.username === 'admin';

  // Derived quantum telemetry metadata
  const nodeAddress = `QNODE-${contact.username.toUpperCase()}-77F2-${Math.abs(
    (contact.username.charCodeAt(0) * 31 + (contact.username.charCodeAt(1) || 99)) % 9999
  ).toString().padStart(4, '0')}`;

  const fingerprintHash = `SHA256:qds:${(contact.username + '_quantum_bell_signature_v2').split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0) | 0, 0).toString(16).padStart(16, '0').toUpperCase()}`;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const isSecure = !isEve;

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
        {/* Modal Top Header */}
        <div className="p-4 border-b border-[#EAE3DA] bg-[#F7F3EC] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadcn-pop-in ${
              isEve ? 'bg-terracotta-700 text-cream-100' : 'bg-[#181B20] text-cream-100'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#181B20]">Quantum Node Contact Details</h3>
              <p className="font-mono text-[10px] text-[#7F776B]">
                Peer Identity & Photonic Channel Specifications
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1.5 rounded-full hover:bg-[#E8E1D5] text-[#746D62] hover:text-[#181B20] transition shadcn-btn"
            title="Close (Esc)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs font-sans max-h-[82vh] overflow-y-auto">
          {/* Identity Card Banner */}
          <div className="p-4 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7] flex items-start gap-4">
            <div className="relative shrink-0">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-lg text-cream-100 shadow-sm ${
                isEve ? 'bg-terracotta-700' : 'bg-[#181B20]'
              }`}>
                {contact.avatar_text || contact.username?.[0]?.toUpperCase() || 'B'}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[#181B20] truncate">
                  {contact.display_name}
                </h2>
                <span className="text-xs font-mono text-[#797167] bg-[#EAE3DA] px-2 py-0.5 rounded-md">
                  @{contact.username}
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-mono text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-1.5 py-0.5 rounded font-semibold">
                    ADMIN
                  </span>
                )}
              </div>

              <p className="text-xs text-[#524B41] font-medium mt-1">
                {contact.role || '1550nm Quantum Optical Link'}
              </p>

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E5DEC7]/80">
                <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                  isSecure 
                    ? 'bg-forest-50 text-forest-800 border-forest-200' 
                    : 'bg-terracotta-50 text-terracotta-800 border-terracotta-200'
                }`}>
                  {isSecure ? 'QUANTUM CHANNEL SECURE' : 'ADVERSARY PROBE DETECTED'}
                </span>
                <span className="text-[10px] font-mono text-[#797167]">
                  Level 4 Q-Clearance
                </span>
              </div>
            </div>
          </div>

          {/* Hardware Node & Fingerprint Identifiers */}
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-[#746C61] tracking-wider">
                  Hardware Quantum Node Address
                </span>
                <button
                  onClick={() => handleCopy(nodeAddress, 'nodeAddress')}
                  className="text-[10px] font-mono text-[#524B41] hover:text-[#181B20] bg-[#EAE3DA] hover:bg-[#DDD5C8] px-2 py-0.5 rounded transition flex items-center gap-1"
                >
                  {copiedField === 'nodeAddress' ? (
                    <span className="text-forest-700 font-semibold">Copied!</span>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-xs font-semibold text-[#181B20] break-all">
                {nodeAddress}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-[#746C61] tracking-wider">
                  Public QDS Signature Fingerprint
                </span>
                <button
                  onClick={() => handleCopy(fingerprintHash, 'fingerprint')}
                  className="text-[10px] font-mono text-[#524B41] hover:text-[#181B20] bg-[#EAE3DA] hover:bg-[#DDD5C8] px-2 py-0.5 rounded transition flex items-center gap-1"
                >
                  {copiedField === 'fingerprint' ? (
                    <span className="text-forest-700 font-semibold">Copied!</span>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-[11px] text-[#443E35] break-all">
                {fingerprintHash}
              </div>
            </div>
          </div>

          {/* Quantum Physical Parameters */}
          <div className="p-3 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7] space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#746C61] tracking-wider block">
              Photonic Transmission Parameters
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-[#443E35]">
              <div className="p-2 bg-[#FCFBF8] rounded-lg border border-[#EAE3DA]">
                <span className="text-[9px] text-[#797167] block uppercase">Optical Carrier</span>
                <span className="font-semibold text-[#181B20]">1550 nm Telecom</span>
              </div>
              <div className="p-2 bg-[#FCFBF8] rounded-lg border border-[#EAE3DA]">
                <span className="text-[9px] text-[#797167] block uppercase">Entanglement State</span>
                <span className="font-semibold text-[#181B20]">|Ψ⁺⟩ Bell Pairs</span>
              </div>
              <div className="p-2 bg-[#FCFBF8] rounded-lg border border-[#EAE3DA]">
                <span className="text-[9px] text-[#797167] block uppercase">Privacy Amplification</span>
                <span className="font-semibold text-[#181B20]">Toeplitz Universal Hash</span>
              </div>
              <div className="p-2 bg-[#FCFBF8] rounded-lg border border-[#EAE3DA]">
                <span className="text-[9px] text-[#797167] block uppercase">PQC Post-Quantum Key</span>
                <span className="font-semibold text-[#181B20]">Dilithium3 / Kyber-768</span>
              </div>
            </div>
          </div>

          {/* Conversation Statistics */}
          <div className="p-3 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#746C61] tracking-wider block">
                Session Volume
              </span>
              <span className="text-sm font-semibold text-[#181B20]">
                {messagesCount} {messagesCount === 1 ? 'Message' : 'Messages'} Exchanged
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-[#746C61] tracking-wider block">
                Direct Node Path
              </span>
              <span className="font-mono text-xs text-[#524B41]">
                {currentUser?.username || 'node1'} ↔ {contact.username}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-1 grid grid-cols-2 gap-2">
            {onOpenSearch && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSearch();
                }}
                className="shadcn-btn flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#EAE3DA] hover:bg-[#DDD5C8] text-[#181B20] text-xs font-medium border border-[#DDD5C8] transition"
              >
                <svg className="w-3.5 h-3.5 text-[#554F46]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search Messages</span>
              </button>
            )}

            {onOpenSecurity && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSecurity(latestMessage);
                }}
                className="shadcn-btn flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#181B20] hover:bg-[#2C313A] text-cream-100 text-xs font-medium transition shadow-xs"
              >
                <svg className="w-3.5 h-3.5 text-cream-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Quantum Telemetry</span>
              </button>
            )}
          </div>

          {onClearHistory && (
            <div className="pt-1">
              <button
                onClick={() => {
                  onClose();
                  onClearHistory();
                }}
                className="w-full shadcn-btn py-2 px-3 rounded-xl text-xs font-medium text-terracotta-700 hover:text-terracotta-900 bg-terracotta-50 hover:bg-terracotta-100 border border-terracotta-200 transition flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-terracotta-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear Chat History with {contact.display_name}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
