import React, { useState, useEffect } from 'react';
import { fetchAllChatMessages } from '../api';

export default function AuditLedgerModal({ isOpen, onClose, onSelectInspectMessage }) {
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterUser, setFilterUser] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadMessages = async () => {
    setLoading(true);
    try {
      const msgs = await fetchAllChatMessages(500);
      setAllMessages(msgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract unique users
  const uniqueUsers = Array.from(
    new Set(allMessages.flatMap((m) => [m.sender, m.recipient]))
  ).filter(Boolean);

  // Filter messages
  const filtered = allMessages.filter((m) => {
    if (filterUser !== 'ALL') {
      if (m.sender !== filterUser && m.recipient !== filterUser) return false;
    }
    if (filterStatus === 'VERIFIED' && !m.is_pass) return false;
    if (filterStatus === 'COMPROMISED' && m.is_pass) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (m.text || '').toLowerCase().includes(q);
      const matchSession = (m.session_id || '').toLowerCase().includes(q);
      const matchFile = (m.file_name || '').toLowerCase().includes(q);
      const matchSender = (m.sender || '').toLowerCase().includes(q);
      const matchRecipient = (m.recipient || '').toLowerCase().includes(q);
      if (!matchText && !matchSession && !matchFile && !matchSender && !matchRecipient) {
        return false;
      }
    }
    return true;
  });

  const verifiedCount = allMessages.filter((m) => m.is_pass).length;
  const compromisedCount = allMessages.filter((m) => !m.is_pass).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FCFBF8] border border-[#DDD5C8] rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* ── Modal Header ── */}
        <div className="p-4 md:px-6 md:py-4 bg-[#F4EFEA] border-b border-[#DDD5C8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#181B20] text-cream-100 flex items-center justify-center font-mono font-bold text-sm shadow">
              ⚛
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#181B20]">
                  Global Quantum Audit Ledger
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
                  ALL USER AUDIT TRAIL
                </span>
              </div>
              <p className="font-mono text-xs text-[#797167]">
                Live immutable record of all text payloads and Hoeffding/CHSH mathematical proofs across all nodes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadMessages}
              disabled={loading}
              className="px-3 py-1.5 bg-[#EAE3DA] hover:bg-[#DDD5C8] text-[#181B20] rounded-lg font-mono text-xs font-medium transition flex items-center gap-1.5"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#EAE3DA] text-[#797167] hover:text-[#181B20] transition"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Metric Summary Bar ── */}
        <div className="px-6 py-2.5 bg-[#F9F7F3] border-b border-[#EAE3DA] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[#797167]">Total Transmissions: </span>
              <span className="font-bold text-[#181B20]">{allMessages.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[#797167]">Verified QDS: </span>
              <span className="font-bold text-emerald-700">{verifiedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-[#797167]">MitM Compromised: </span>
              <span className="font-bold text-red-700">{compromisedCount}</span>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="bg-[#FCFBF8] border border-[#DDD5C8] rounded-lg text-xs font-mono px-2 py-1 focus:ring-1 focus:ring-black"
            >
              <option value="ALL">All Nodes ({uniqueUsers.length})</option>
              {uniqueUsers.map((u) => (
                <option key={u} value={u}>
                  Node: @{u}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#FCFBF8] border border-[#DDD5C8] rounded-lg text-xs font-mono px-2 py-1 focus:ring-1 focus:ring-black"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="COMPROMISED">Compromised Only</option>
            </select>

            <input
              type="text"
              placeholder="Search text, hashes, files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FCFBF8] border border-[#DDD5C8] rounded-lg text-xs py-1 px-2.5 w-44 md:w-56 focus:ring-1 focus:ring-black placeholder-[#9C9488]"
            />
          </div>
        </div>

        {/* ── Message Ledger Table / Cards ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 divide-y divide-[#EAE3DA]">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 rounded-full bg-[#EAE3DA] flex items-center justify-center text-xl mb-3">
                🔍
              </div>
              <h3 className="font-semibold text-sm text-[#181B20]">No Matching Transmissions Found</h3>
              <p className="text-xs text-[#797167] font-mono mt-1">
                Try adjusting your search criteria or switch filter parameters.
              </p>
            </div>
          ) : (
            filtered.map((msg, idx) => {
              const isPass = msg.is_pass;
              const timestamp = msg.timestamp
                ? new Date(msg.timestamp).toLocaleString()
                : 'Recent';

              return (
                <div
                  key={msg.id || idx}
                  className="py-3.5 hover:bg-[#F4EFEA]/50 transition rounded-xl px-3 group flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  {/* Left: Sender -> Recipient & Text */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#181B20] text-cream-100">
                        @{msg.sender}
                      </span>
                      <span className="text-[#8C8479] text-xs font-mono">⟶</span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#EAE3DA] text-[#181B20]">
                        @{msg.recipient}
                      </span>

                      <span
                        className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          isPass
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-red-50 text-red-800 border-red-300'
                        }`}
                      >
                        {isPass ? '✓ QDS VERIFIED' : '⚠ COMPROMISED / ATTACK'}
                      </span>

                      <span className="text-[10px] font-mono text-[#8C8479] ml-auto md:ml-2">
                        {timestamp}
                      </span>
                    </div>

                    {/* Text Payload */}
                    {msg.text && (
                      <p className="text-xs font-sans text-[#181B20] bg-[#FCFBF8] border border-[#EAE3DA] p-2 rounded-lg break-words">
                        {msg.text}
                      </p>
                    )}

                    {/* File attachment preview if present */}
                    {msg.file_name && (
                      <div className="flex items-center gap-2 p-2 bg-[#F2ECE4] border border-[#DDD5C8] rounded-lg text-xs font-mono">
                        <span className="text-sm">📎</span>
                        <span className="font-semibold text-[#181B20] truncate">{msg.file_name}</span>
                        <span className="text-[10px] text-[#797167]">
                          ({msg.file_size ? `${(msg.file_size / 1024).toFixed(1)} KB` : 'file'})
                        </span>
                        {msg.file_data && msg.file_type?.startsWith('image/') && (
                          <img
                            src={msg.file_data}
                            alt={msg.file_name}
                            className="w-8 h-8 object-cover rounded ml-auto border border-[#DDD5C8]"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Quantum Telemetry Specs & Inspect Button */}
                  <div className="shrink-0 flex items-center gap-3 bg-[#F7F4EF] border border-[#EAE3DA] p-2.5 rounded-xl font-mono text-[11px]">
                    <div className="space-y-0.5 text-right">
                      <div className="text-[#797167] text-[10px]">
                        Session: <span className="font-bold text-[#181B20]">{msg.session_id || 'QKD-EPR'}</span>
                      </div>
                      <div>
                        QBER:{' '}
                        <span
                          className={`font-bold ${
                            msg.qber_percentage > 11 ? 'text-red-600' : 'text-emerald-700'
                          }`}
                        >
                          {(msg.qber_percentage || 0).toFixed(2)}%
                        </span>{' '}
                        · CHSH:{' '}
                        <span
                          className={`font-bold ${
                            msg.chsh_score < 2.0 ? 'text-red-600' : 'text-[#181B20]'
                          }`}
                        >
                          {(msg.chsh_score || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[9px] text-[#8C8479]">
                        Route: {(msg.route_path || [msg.sender, msg.recipient]).join(' → ')}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectInspectMessage(msg);
                        onClose();
                      }}
                      className="px-2.5 py-2 bg-[#181B20] hover:bg-black text-white rounded-lg font-mono text-[10px] font-semibold transition shrink-0"
                      title="Inspect complete Hoeffding and Bell test proofs"
                    >
                      Audit Proof ↗
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-3 bg-[#F4EFEA] border-t border-[#DDD5C8] flex items-center justify-between text-xs font-mono text-[#797167] shrink-0">
          <div>
            Showing <span className="font-bold text-[#181B20]">{filtered.length}</span> of{' '}
            <span className="font-bold text-[#181B20]">{allMessages.length}</span> recorded quantum messages
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#181B20] text-white rounded-lg font-sans font-medium text-xs hover:bg-black transition"
          >
            Close Ledger (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
