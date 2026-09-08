import React, { useState, useEffect } from 'react';

export default function PinnedProofsDrawer({
  isOpen,
  onClose,
  currentUser,
  activeContact,
  pinnedMessages = [],
  starredMessages = [],
  onJumpToMessage,
  onUnpin,
  onUnstar,
  onOpenSecurity,
}) {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PINNED' | 'STARRED'
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  // Combine and deduplicate items
  const allItemsMap = new Map();
  pinnedMessages.forEach((m) => allItemsMap.set(m.id, { ...m, is_pinned: true }));
  starredMessages.forEach((m) => {
    const existing = allItemsMap.get(m.id) || m;
    allItemsMap.set(m.id, { ...existing, is_starred: true });
  });

  const allItems = Array.from(allItemsMap.values());

  const displayedItems =
    activeTab === 'PINNED'
      ? pinnedMessages
      : activeTab === 'STARRED'
      ? starredMessages
      : allItems;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end select-none ${
        isClosing ? 'shadcn-dialog-overlay-closing' : 'shadcn-dialog-overlay'
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md h-full bg-[#FCFBF8] border-l border-[#DDD4C5] shadow-2xl flex flex-col font-sans ${
          isClosing ? 'shadcn-drawer-content-closing' : 'shadcn-drawer-content'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#EAE3DA] bg-[#F7F3EC] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#181B20] text-cream-100 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#181B20]">Saved Proofs & Pinned Messages</h3>
              <p className="font-mono text-[10px] text-[#7F776B]">
                {activeContact ? `Channel: ${activeContact.display_name}` : 'Global Node Archive'}
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

        {/* Tab Filters */}
        <div className="px-4 py-2.5 bg-[#F4EFEA] border-b border-[#EAE3DA] flex gap-2">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition ${
              activeTab === 'ALL'
                ? 'bg-[#181B20] text-cream-100 shadow-xs'
                : 'text-[#6E665A] hover:bg-[#EAE3DA]'
            }`}
          >
            All ({allItems.length})
          </button>
          <button
            onClick={() => setActiveTab('PINNED')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition ${
              activeTab === 'PINNED'
                ? 'bg-[#181B20] text-cream-100 shadow-xs'
                : 'text-[#6E665A] hover:bg-[#EAE3DA]'
            }`}
          >
            Pinned ({pinnedMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('STARRED')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition ${
              activeTab === 'STARRED'
                ? 'bg-[#181B20] text-cream-100 shadow-xs'
                : 'text-[#6E665A] hover:bg-[#EAE3DA]'
            }`}
          >
            Starred Proofs ({starredMessages.length})
          </button>
        </div>

        {/* List of Saved Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#797167]">
              <div className="w-12 h-12 rounded-full bg-[#EAE3DA] flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-[#554F46]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-[#181B20]">No saved proofs or pinned messages</p>
              <p className="text-[11px] text-[#867E73] mt-1 max-w-xs">
                Hover any message in the chat stream to pin instructions or star quantum security proofs.
              </p>
            </div>
          ) : (
            displayedItems.map((item) => {
              const isItemOutgoing = item.sender?.toLowerCase() === currentUser?.username?.toLowerCase();
              const passed = item.is_pass ?? (item.qds_status === 'VERIFIED');

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[#F4EFEA] border border-[#E5DEC7] hover:border-[#DDD5C8] transition shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-[#181B20]">
                        {item.sender === currentUser?.username ? 'You' : item.sender}
                      </span>
                      <span className="text-[10px] font-mono text-[#797167]">→ {item.recipient}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.is_pinned && (
                        <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded">
                          PINNED
                        </span>
                      )}
                      {item.is_starred && (
                        <span className="text-[9px] font-mono font-bold bg-forest-100 text-forest-900 border border-forest-300 px-1.5 py-0.5 rounded">
                          PROOF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="text-xs text-[#2D2A26] line-clamp-3 font-sans">
                    {item.text || item.file_name || '(Audio/File attachment)'}
                  </div>

                  {/* Quantum Verification Metrics */}
                  <div className="pt-2 border-t border-[#E0D7CC] flex items-center justify-between text-[10px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded font-semibold border ${
                        passed ? 'bg-forest-50 text-forest-800 border-forest-200' : 'bg-terracotta-50 text-terracotta-800 border-terracotta-200'
                      }`}>
                        {item.qds_status || (passed ? 'VERIFIED' : 'VIOLATION')}
                      </span>
                      <span className="text-[#6E665A]">QBER: {item.qber_percentage ? item.qber_percentage.toFixed(1) : '0.0'}%</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {onOpenSecurity && (
                        <button
                          onClick={() => onOpenSecurity(item)}
                          className="shadcn-btn px-2 py-0.5 rounded bg-[#EAE3DA] hover:bg-[#DDD5C8] text-[#181B20] text-[10px] font-mono font-medium"
                          title="Inspect Telemetry Proofs"
                        >
                          Inspect
                        </button>
                      )}

                      {onJumpToMessage && (
                        <button
                          onClick={() => {
                            onJumpToMessage(item.id);
                            onClose();
                          }}
                          className="shadcn-btn px-2 py-0.5 rounded bg-[#181B20] hover:bg-black text-white text-[10px] font-mono font-medium shadow-xs"
                          title="Jump to message in conversation"
                        >
                          Jump
                        </button>
                      )}

                      {item.is_pinned && onUnpin && (
                        <button
                          onClick={() => onUnpin(item.id)}
                          className="p-1 rounded hover:bg-[#EAE3DA] text-[#797167] hover:text-terracotta-700"
                          title="Unpin"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
