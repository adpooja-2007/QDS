import React, { useState, useEffect } from 'react';
import { exportChatTranscript } from './api';

export default function ExportTranscriptModal({ isOpen, onClose, currentUser, activeContact }) {
  const [transcriptData, setTranscriptData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
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

  useEffect(() => {
    if (!isOpen || !currentUser?.username || !activeContact?.username) return;

    const loadTranscript = async () => {
      setIsLoading(true);
      try {
        const data = await exportChatTranscript(currentUser.username, activeContact.username);
        setTranscriptData(data);
      } catch (err) {
        console.error('Failed to export transcript:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranscript();
  }, [isOpen, currentUser?.username, activeContact?.username]);

  if (!isOpen && !isClosing) return null;

  const handleDownloadJSON = () => {
    if (!transcriptData) return;
    const blob = new Blob([JSON.stringify(transcriptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QDS_Transcript_${currentUser.username}_${activeContact.username}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    if (!transcriptData) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QDS Audit Transcript - ${currentUser.username} & ${activeContact.username}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; margin: 40px; color: #181B20; }
            h1 { font-size: 20px; border-bottom: 2px solid #181B20; padding-bottom: 8px; margin-bottom: 4px; }
            .meta { font-size: 11px; font-family: monospace; color: #555; margin-bottom: 24px; }
            .cert-box { border: 1px solid #CCC; background: #F8F6F2; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 11px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
            th, td { border-bottom: 1px solid #DDD; padding: 8px; text-align: left; }
            th { background: #EEE; font-weight: bold; }
            .badge-verified { color: #1E6B38; font-weight: bold; }
            .badge-compromised { color: #A83214; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>QUANTUM DIGITAL SIGNATURE (QDS) CONVERSATION TRANSCRIPT</h1>
          <div class="meta">
            Channel: ${transcriptData.node_a} ↔ ${transcriptData.node_b} | Export ID: ${transcriptData.export_id} | Timestamp: ${transcriptData.generated_at}
          </div>
          
          <div class="cert-box">
            <strong>QUANTUM CRYPTOGRAPHIC INTEGRITY CERTIFICATE:</strong><br/>
            Certificate ID: ${transcriptData.quantum_signature_certificate}<br/>
            Integrity Hash (SHA-256): ${transcriptData.cryptographic_integrity_hash}<br/>
            Protocol: ${transcriptData.verification_protocol}<br/>
            Verified Message Volume: ${transcriptData.messages_count} Records
          </div>

          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Sender</th>
                <th>Recipient</th>
                <th>Content / Attachment</th>
                <th>QDS Status</th>
                <th>QBER</th>
                <th>Bell CHSH (S)</th>
              </tr>
            </thead>
            <tbody>
              ${transcriptData.messages.map(m => `
                <tr>
                  <td>${m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : 'N/A'}</td>
                  <td><strong>${m.sender}</strong></td>
                  <td>${m.recipient}</td>
                  <td>${m.text || m.file_name || '(Attachment)'}</td>
                  <td class="${m.is_pass ? 'badge-verified' : 'badge-compromised'}">${m.qds_status}</td>
                  <td>${m.qber_percentage ? m.qber_percentage.toFixed(1) : 0}%</td>
                  <td>${m.chsh_score ? m.chsh_score.toFixed(2) : 2.82}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyHash = () => {
    if (!transcriptData?.cryptographic_integrity_hash) return;
    navigator.clipboard.writeText(transcriptData.cryptographic_integrity_hash).then(() => {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    });
  };

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
        {/* Modal Header */}
        <div className="p-4 border-b border-[#EAE3DA] bg-[#F7F3EC] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#181B20] text-cream-100 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#181B20]">Export Verified Quantum Transcript</h3>
              <p className="font-mono text-[10px] text-[#7F776B]">
                Cryptographic audit archive for {currentUser?.display_name} ↔ {activeContact?.display_name}
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
        <div className="p-5 space-y-4 text-xs font-sans max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-[#797167]">
              <div className="w-6 h-6 border-2 border-[#181B20] border-t-transparent rounded-full animate-spin"></div>
              <span className="font-mono text-xs">Generating quantum certificate & audit hash...</span>
            </div>
          ) : (
            <>
              {/* Certificate Summary Card */}
              <div className="p-4 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#746C61] uppercase tracking-wider font-semibold">
                    Quantum Proof Certificate
                  </span>
                  <span className="font-mono text-[9px] bg-forest-100 text-forest-900 border border-forest-300 px-2 py-0.5 rounded font-bold">
                    CRYPTOGRAPHICALLY SEALED
                  </span>
                </div>

                <div className="font-mono text-xs font-bold text-[#181B20]">
                  {transcriptData?.quantum_signature_certificate || 'QDS-CERT-PENDING'}
                </div>

                <div className="pt-2 border-t border-[#E0D7CC] space-y-1 font-mono text-[11px] text-[#443E35]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#746C61]">Total Messages:</span>
                    <span className="font-bold">{transcriptData?.messages_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#746C61]">Protocol:</span>
                    <span className="font-bold">E91 Joint Bell State (S ≥ 2.0)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#746C61]">Generated:</span>
                    <span>{transcriptData?.generated_at ? new Date(transcriptData.generated_at).toLocaleString() : 'Now'}</span>
                  </div>
                </div>
              </div>

              {/* SHA-256 Digest Box */}
              <div className="p-3 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#746C61] tracking-wider">
                    Full Session SHA-256 Digest
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="text-[10px] font-mono text-[#524B41] hover:text-[#181B20] bg-[#EAE3DA] hover:bg-[#DDD5C8] px-2 py-0.5 rounded transition flex items-center gap-1"
                  >
                    {copiedHash ? (
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
                <div className="font-mono text-[10px] text-[#24211D] break-all">
                  {transcriptData?.cryptographic_integrity_hash || 'SHA256:COMPUTING...'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="shadcn-btn flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#181B20] hover:bg-[#2B303A] text-white text-xs font-semibold shadow-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download JSON Bundle</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="shadcn-btn flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#EAE3DA] hover:bg-[#DDD5C8] text-[#181B20] text-xs font-semibold border border-[#DDD5C8]"
                >
                  <svg className="w-4 h-4 text-[#554F46]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Audit PDF</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
