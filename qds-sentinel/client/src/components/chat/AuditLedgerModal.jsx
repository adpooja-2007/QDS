import React, { useState, useEffect } from 'react';
import { fetchAllChatMessages } from './api';

export default function AuditLedgerModal({ isOpen, onClose, onSelectInspectMessage, currentUser }) {
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterUser, setFilterUser] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 180);
  };

  const loadMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const msgs = await fetchAllChatMessages(currentUser?.username || 'admin', 500);
      setAllMessages(msgs);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Access restricted to Security Administrators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      setExpandedId(null);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  // Extract unique users
  const uniqueUsers = Array.from(
    new Set(allMessages.flatMap((m) => [m.sender, m.recipient]))
  ).filter(Boolean);

  // Filter messages
  const filteredMessages = allMessages.filter((msg) => {
    if (filterUser !== 'ALL' && msg.sender !== filterUser && msg.recipient !== filterUser) {
      return false;
    }
    if (filterStatus === 'VERIFIED' && !msg.is_pass) return false;
    if (filterStatus === 'COMPROMISED' && msg.is_pass) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (msg.text || '').toLowerCase().includes(q);
      const matchSession = (msg.session_id || '').toLowerCase().includes(q);
      const matchSender = (msg.sender || '').toLowerCase().includes(q);
      const matchRecipient = (msg.recipient || '').toLowerCase().includes(q);
      const matchFile = (msg.file_name || '').toLowerCase().includes(q);
      if (!matchText && !matchSession && !matchSender && !matchRecipient && !matchFile) {
        return false;
      }
    }
    return true;
  });

  const formatTime = (ts) => {
    if (!ts) return 'Unknown';
    try {
      return new Date(ts).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  const verifiedCount = allMessages.filter((m) => m.is_pass).length;
  const compromisedCount = allMessages.filter((m) => !m.is_pass).length;

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 select-none ${
        isClosing ? 'shadcn-dialog-overlay-closing' : 'shadcn-dialog-overlay'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#FCFBF8] border border-[#DDD5C8] rounded-2xl w-full max-w-5xl h-[86vh] flex flex-col shadow-2xl overflow-hidden font-sans ${
          isClosing ? 'shadcn-dialog-content-closing' : 'shadcn-dialog-content'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ── Minimal Header ── */}
        <div className="px-5 py-3.5 bg-[#F4EFEA] border-b border-[#DDD5C8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#181B20] text-cream-100 flex items-center justify-center font-mono font-bold text-xs shadow-xs shadcn-pop-in">
              <svg className="w-4 h-4 text-cream-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#181B20]">Quantum Audit Ledger</h2>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
                  AUDIT TRAIL
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#797167]">
                Click any row to inspect telemetry, routes, and Bell-state proofs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadMessages}
              disabled={loading}
              className="px-2.5 py-1 bg-[#EAE3DA] hover:bg-[#DDD5C8] text-[#181B20] rounded-lg font-mono text-xs font-medium transition flex items-center gap-1.5 shadcn-btn"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>Refresh</span>
            </button>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-[#EAE3DA] text-[#797167] hover:text-[#181B20] shadcn-btn"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Sub-header: Minimalist Metrics & Filters ── */}
        <div className="px-5 py-2.5 bg-[#F9F7F3] border-b border-[#EAE3DA] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#554F46]">
              <strong className="text-[#181B20]">{allMessages.length}</strong> transmissions
            </span>
            <span className="text-[#DDD5C8]">|</span>
            <span className="inline-flex items-center gap-1 text-forest-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-forest-600"></span>
              {verifiedCount} Verified
            </span>
            {compromisedCount > 0 && (
              <>
                <span className="text-[#DDD5C8]">|</span>
                <span className="inline-flex items-center gap-1 text-terracotta-800 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-terracotta-600"></span>
                  {compromisedCount} Compromised
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="bg-[#FCFBF8] border border-[#DDD5C8] hover:border-[#B5AA9A] rounded-lg text-xs font-mono px-2 py-1 focus:ring-1 focus:ring-black cursor-pointer transition"
            >
              <option value="ALL">All Nodes ({uniqueUsers.length})</option>
              {uniqueUsers.map((u) => (
                <option key={u} value={u}>
                  @{u}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#FCFBF8] border border-[#DDD5C8] hover:border-[#B5AA9A] rounded-lg text-xs font-mono px-2 py-1 focus:ring-1 focus:ring-black cursor-pointer transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="COMPROMISED">Compromised Only</option>
            </select>

            <input
              type="text"
              maxLength={100}
              placeholder="Filter payload or hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FCFBF8] border border-[#DDD5C8] hover:border-[#B5AA9A] rounded-lg text-xs py-1 px-2.5 w-44 md:w-52 focus:ring-1 focus:ring-black placeholder-[#9C9488] transition"
            />
          </div>
        </div>

        {/* ── Table Header ── */}
        <div className="px-5 py-2 bg-[#F2ECE4] border-b border-[#EAE3DA] grid grid-cols-12 gap-3 text-[10px] font-mono text-[#797167] font-semibold shrink-0">
          <div className="col-span-2">STATUS</div>
          <div className="col-span-3">TRANSMITTER ⟶ RECEIVER</div>
          <div className="col-span-4">PAYLOAD PREVIEW</div>
          <div className="col-span-3 text-right">TIMESTAMP & DETAILS</div>
        </div>

        {/* ── Minimalist Ledger Stream ── */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#EAE3DA]/80 bg-[#FCFBF8]">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-10 h-10 rounded-full bg-[#EAE3DA] flex items-center justify-center text-xs font-mono font-bold mb-2 text-[#554F46]">
                Ø
              </div>
              <h3 className="font-semibold text-xs text-[#181B20]">No Transmissions Recorded</h3>
              <p className="text-[11px] text-[#797167] font-mono mt-0.5">
                No quantum transactions match the current filter criteria.
              </p>
            </div>
          ) : (
            filtered.map((msg, idx) => {
              const isPass = msg.is_pass;
              const isExpanded = expandedId === (msg.id || idx);
              const timeStr = formatDateTime(msg.timestamp);

              return (
                <div
                  key={msg.id || idx}
                  className={`group transition-all duration-150 ${
                    isExpanded ? 'bg-[#F7F4EF]' : 'hover:bg-[#F4EFEA] bg-transparent'
                  }`}
                >
                  {/* ── Compact Single-Line Row ── */}
                  <div
                    onClick={() => toggleExpand(msg.id || idx)}
                    className="px-5 py-2.5 grid grid-cols-12 gap-3 items-center cursor-pointer text-xs select-none"
                  >
                    {/* Status Pill */}
                    <div className="col-span-2 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isPass ? 'bg-forest-600' : 'bg-terracotta-600'
                        }`}
                      ></span>
                      <span
                        className={`font-mono text-[10px] font-bold ${
                          isPass ? 'text-forest-800' : 'text-terracotta-800'
                        }`}
                      >
                        {isPass ? 'VERIFIED' : 'ATTACKED'}
                      </span>
                    </div>

                    {/* Nodes */}
                    <div className="col-span-3 flex items-center gap-1.5 font-mono text-[11px] truncate">
                      <span className="font-bold text-[#181B20] group-hover:text-terracotta-600 transition-colors">@{msg.sender}</span>
                      <span className="text-[#9C9488]">⟶</span>
                      <span className="font-bold text-[#181B20] group-hover:text-terracotta-600 transition-colors">@{msg.recipient}</span>
                    </div>

                    {/* Payload Preview */}
                    <div className="col-span-4 truncate text-[#554F46] group-hover:text-[#181B20] font-sans text-xs transition-colors">
                      {msg.file_name ? (
                        <span className="font-mono text-[11px] text-terracotta-700 font-medium">
                          [File: {msg.file_name}]
                        </span>
                      ) : (
                        msg.text || <span className="italic text-[#9C9488]">Empty payload</span>
                      )}
                    </div>

                    {/* Time & Expand Indicator */}
                    <div className="col-span-3 flex items-center justify-end gap-2 font-mono text-[10px] text-[#797167]">
                      <span>{timeStr}</span>
                      <span className="w-5 h-5 rounded flex items-center justify-center text-[#554F46] bg-[#EAE3DA]/60 group-hover:bg-[#DDD5C8] group-hover:scale-110 transition-all">
                        <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* ── Expanded Detail Drawer (Revealed only on click) ── */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 bg-[#F4EFEA] border-t border-[#EAE3DA] shadcn-accordion">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2 font-mono text-[11px]">
                        
                        {/* Tile 1: QBER & Threshold */}
                        <div className="p-2.5 bg-[#FCFBF8] border border-[#DDD5C8] rounded-xl transition hover:border-[#C5BCAD]">
                          <span className="text-[9px] text-[#797167] block mb-0.5 uppercase tracking-wider">
                            QBER & Cutoff
                          </span>
                          <div className="flex items-baseline justify-between">
                            <span
                              className={`text-sm font-bold ${
                                msg.qber_percentage > 11 ? 'text-terracotta-600' : 'text-forest-700'
                              }`}
                            >
                              {(msg.qber_percentage || 0).toFixed(2)}%
                            </span>
                            <span className="text-[10px] text-[#8C8479]">
                              Cutoff: ≤ {(msg.threshold_percentage || 14.0).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Tile 2: CHSH Bell Test */}
                        <div className="p-2.5 bg-[#FCFBF8] border border-[#DDD5C8] rounded-xl transition hover:border-[#C5BCAD]">
                          <span className="text-[9px] text-[#797167] block mb-0.5 uppercase tracking-wider">
                            CHSH Bell Metric
                          </span>
                          <div className="flex items-baseline justify-between">
                            <span
                              className={`text-sm font-bold ${
                                msg.chsh_score < 2.0 ? 'text-terracotta-600' : 'text-[#181B20]'
                              }`}
                            >
                              S = {(msg.chsh_score || 0).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-forest-700 font-semibold">
                              {msg.chsh_score >= 2.0 ? 'Quantum Bound' : 'Classical Limit'}
                            </span>
                          </div>
                        </div>

                        {/* Tile 3: Session & Routing Path */}
                        <div className="p-2.5 bg-[#FCFBF8] border border-[#DDD5C8] rounded-xl transition hover:border-[#C5BCAD]">
                          <span className="text-[9px] text-[#797167] block mb-0.5 uppercase tracking-wider">
                            Session & QuARC Route
                          </span>
                          <div className="truncate font-semibold text-[#181B20] text-xs">
                            {msg.session_id || 'QKD-EPR'}
                          </div>
                          <div className="text-[9px] text-[#797167] truncate mt-0.5">
                            {(msg.route_path || [msg.sender, msg.recipient]).join(' ⟶ ')}
                          </div>
                        </div>
                      </div>

                      {/* Full Payload & Deep Audit Action */}
                      <div className="mt-2 p-3 bg-[#FCFBF8] border border-[#DDD5C8] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-mono text-[#797167] block uppercase">
                            Authenticated Message Content
                          </span>
                          {msg.text && (
                            <p className="text-xs text-[#181B20] font-sans mt-0.5 break-words">
                              {msg.text}
                            </p>
                          )}
                          {msg.file_name && (
                            <div className="mt-1 flex items-center gap-2 text-xs font-mono text-terracotta-700">
                              <span>File: {msg.file_name}</span>
                              <span className="text-[#797167]">
                                ({msg.file_size ? `${(msg.file_size / 1024).toFixed(1)} KB` : 'file'})
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            onSelectInspectMessage(msg);
                            onClose();
                          }}
                          className="px-3.5 py-2 bg-[#181B20] hover:bg-black text-white rounded-lg font-mono text-[11px] font-semibold transition shrink-0 flex items-center gap-1.5 shadow-xs shadcn-btn"
                          title="Inspect raw Hoeffding thresholds, Pauli alignment, and photon metrics"
                        >
                          <span>Inspect Full Proof</span>
                          <span>↗</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-5 py-2.5 bg-[#F4EFEA] border-t border-[#DDD5C8] flex items-center justify-between text-xs font-mono text-[#797167] shrink-0">
          <div>
            Showing <span className="font-bold text-[#181B20]">{filtered.length}</span> of{' '}
            <span className="font-bold text-[#181B20]">{allMessages.length}</span> transmissions
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1 bg-[#181B20] text-white rounded-lg font-sans font-medium text-xs hover:bg-black transition shadcn-btn"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
