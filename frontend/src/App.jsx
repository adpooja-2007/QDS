import React, { useState, useEffect, useCallback } from 'react';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SecurityModal from './components/SecurityModal';
import AuditLedgerModal from './components/AuditLedgerModal';
import CommandPaletteModal from './components/CommandPaletteModal';
import ExportTranscriptModal from './components/ExportTranscriptModal';
import PinnedProofsDrawer from './components/PinnedProofsDrawer';
import {
  initNetwork,
  fetchUsers,
  registerUser,
  fetchChatMessages,
  fetchUnreadCounts,
  markChatMessagesRead,
  sendQuantumChatMessage,
  clearChatMessages,
  fetchPinnedStarredMessages,
  pinChatMessage,
  starChatMessage
} from './api';

const DEFAULT_DEMO_USERS = [
  {
    username: 'alice',
    display_name: 'Alice Kovacs',
    role: 'Signer Node Alpha',
    node_id: '#9042',
    avatar_text: 'AK',
    avatar_bg: 'bg-[#181B20]',
    is_admin: false,
  },
  {
    username: 'bob',
    display_name: 'Bob (Receiver Node Beta)',
    role: 'Receiver Node Beta',
    node_id: '#260827',
    avatar_text: 'B',
    avatar_bg: 'bg-[#181B20]',
    is_admin: false,
  },
  {
    username: 'admin',
    display_name: 'Security Administrator',
    role: 'Chief Quantum Security Officer',
    node_id: '#000001',
    avatar_text: 'AD',
    avatar_bg: 'bg-[#181B20]',
    is_admin: true,
  },
  {
    username: 'charlie',
    display_name: 'Charlie (Relay Q2)',
    role: 'Quantum Router Q2',
    node_id: '#881029',
    avatar_text: 'C',
    avatar_bg: 'bg-[#2D3748]',
    is_admin: false,
  },
  {
    username: 'eve',
    display_name: 'Eve (MitM Simulator)',
    role: 'Intercept-Resend Attacker',
    node_id: '#666999',
    avatar_text: 'EV',
    avatar_bg: 'bg-terracotta-700',
    is_admin: false,
  },
];

export default function App() {
  const [usersList, setUsersList] = useState(DEFAULT_DEMO_USERS);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('qds_chat_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null; // Start on AuthPage if not logged in
  });

  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [latestMessages, setLatestMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isSending, setIsSending] = useState(false);

  // Modals & Drawers
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAuditLedgerOpen, setIsAuditLedgerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPinnedDrawerOpen, setIsPinnedDrawerOpen] = useState(false);
  const [selectedSecurityData, setSelectedSecurityData] = useState(null);
  const [pinnedData, setPinnedData] = useState({ pinned: [], starred: [], total: 0 });
  const [jumpTarget, setJumpTarget] = useState(null);

  // Theme & Density Preferences
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('qds_theme') || 'light';
  });

  const [density, setDensity] = useState(() => {
    return localStorage.getItem('qds_density') || 'comfortable';
  });

  const isAdmin = Boolean(
    currentUser?.is_admin ||
    currentUser?.username === 'admin' ||
    currentUser?.role?.toLowerCase().includes('admin')
  );

  // Sync theme & density with HTML root element and body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('qds_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    document.body.setAttribute('data-density', density);
    localStorage.setItem('qds_density', density);
  }, [density]);

  // Global Ctrl+K / Cmd+K listener for Command Palette
  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, []);

  // 1. Initialize network and load user list
  const loadUsers = useCallback(async () => {
    const users = await fetchUsers();
    if (users && users.length > 0) {
      setUsersList(users);

      if (currentUser?.username) {
        const existingCurrent = users.find(u => u.username === currentUser.username);
        if (existingCurrent) {
          setCurrentUser(existingCurrent);
        }
      }
    }
  }, [currentUser?.username]);

  useEffect(() => {
    initNetwork();
    loadUsers();
  }, [loadUsers]);

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('qds_chat_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('qds_chat_current_user');
    }
  }, [currentUser]);

  // 2. Fetch active conversation messages
  // 2. Fetch active conversation messages (with pending message preservation)
  const loadConversation = useCallback(async () => {
    if (!currentUser?.username || !activeContact?.username) return;
    try {
      const msgs = await fetchChatMessages(currentUser.username, activeContact.username, 100, true);
      setMessages(prev => {
        const pending = prev.filter(m => m.is_pending && !msgs.some(dbMsg => dbMsg.id === m.id));
        if (pending.length === 0) {
          if (
            prev.length === msgs.length &&
            prev.length > 0 &&
            prev[prev.length - 1]?.id === msgs[msgs.length - 1]?.id &&
            prev[0]?.id === msgs[0]?.id &&
            prev.every((m, idx) => m.id === msgs[idx]?.id && m.is_pending === msgs[idx]?.is_pending)
          ) {
            return prev;
          }
          return msgs;
        }
        return [...msgs, ...pending];
      });

      if (msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        setLatestMessages(prev => ({ ...prev, [activeContact.username]: last }));
      }

      // Clear unread count for current active contact
      setUnreadCounts(prev => ({ ...prev, [activeContact.username]: 0 }));
    } catch (e) {
      console.error('loadConversation error:', e);
    }
  }, [currentUser?.username, activeContact?.username]);

  // 3. Load latest messages and unread counts for all contacts
  const loadAllLatestPreviews = useCallback(async () => {
    if (!currentUser?.username || usersList.length === 0) return;

    try {
      const unreadMap = await fetchUnreadCounts(currentUser.username);
      if (activeContact?.username) {
        unreadMap[activeContact.username] = 0;
      }
      setUnreadCounts(unreadMap);
    } catch (e) {
      console.error(e);
    }

    for (const u of usersList) {
      if (u.username === currentUser.username) continue;
      const msgs = await fetchChatMessages(currentUser.username, u.username, 1, false);
      if (msgs && msgs.length > 0) {
        setLatestMessages(prev => ({ ...prev, [u.username]: msgs[msgs.length - 1] }));
      }
    }
  }, [currentUser?.username, usersList, activeContact?.username]);

  // Load pinned & starred proofs
  const loadPinnedStarred = useCallback(async () => {
    if (!currentUser?.username) return;
    const data = await fetchPinnedStarredMessages(currentUser.username, activeContact?.username);
    setPinnedData(data);
  }, [currentUser?.username, activeContact?.username]);

  useEffect(() => {
    loadConversation();
    loadAllLatestPreviews();
    loadPinnedStarred();
  }, [loadConversation, loadAllLatestPreviews, loadPinnedStarred]);

  // High-frequency 1-second polling for real-time responsiveness
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      loadConversation();
      loadAllLatestPreviews();
    }, 1000);
    return () => clearInterval(interval);
  }, [currentUser, loadConversation, loadAllLatestPreviews]);

  // 4. Handle Login & Logout
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveContact(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveContact(null);
    setMessages([]);
    setUnreadCounts({});
  };

  const handleSelectContact = async (contact) => {
    setActiveContact(contact);
    setUnreadCounts(prev => ({ ...prev, [contact.username]: 0 }));
    if (currentUser?.username) {
      await markChatMessagesRead(currentUser.username, contact.username);
      const msgs = await fetchChatMessages(currentUser.username, contact.username, 100, true);
      setMessages(msgs);
      if (msgs.length > 0) {
        setLatestMessages(prev => ({ ...prev, [contact.username]: msgs[msgs.length - 1] }));
      }
    }
  };

  const handleRegisterUser = async (data) => {
    const res = await registerUser(data);
    await loadUsers();
    if (res.user) {
      handleSelectContact(res.user);
    }
  };

  // 5. Handle sending message (supporting multi-files, replies, voice notes, and ephemeral TTL)
  const handleSendMessage = async ({
    text = '',
    attachedFiles = [],
    isAudio = false,
    injectAttack = false,
    replyToId = null,
    replyPreview = null,
    ephemeralTTL = null,
  }) => {
    if (!currentUser?.username || !activeContact?.username) return;

    // Send single text or first file
    const primaryFile = attachedFiles[0] || null;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      sender: currentUser.username,
      recipient: activeContact.username,
      text,
      file_name: primaryFile?.name || null,
      file_type: primaryFile?.type || null,
      file_size: primaryFile?.size || null,
      file_data: primaryFile?.data || null,
      is_audio: isAudio,
      reply_to_id: replyToId,
      reply_preview: replyPreview,
      ephemeral_ttl: ephemeralTTL,
      expires_at: ephemeralTTL ? new Date(Date.now() + ephemeralTTL * 1000).toISOString() : null,
      timestamp: new Date().toISOString(),
      is_pending: true,
      is_pass: true,
      qds_status: 'PENDING'
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setIsSending(true);

    try {
      const savedMsg = await sendQuantumChatMessage({
        sender: currentUser.username,
        recipient: activeContact.username,
        text,
        file_name: primaryFile?.name || null,
        file_type: primaryFile?.type || null,
        file_size: primaryFile?.size || null,
        file_data: primaryFile?.data || null,
        is_audio: isAudio,
        reply_to_id: replyToId,
        reply_preview: replyPreview,
        ephemeral_ttl: ephemeralTTL,
        inject_attack: injectAttack
      });

      // Update state immediately: replace optimistic or append
      setMessages(prev => {
        const hasTemp = prev.some(m => m.id === tempId);
        if (hasTemp) {
          return prev.map(m => (m.id === tempId ? savedMsg : m));
        }
        const hasSaved = prev.some(m => m.id === savedMsg.id);
        if (hasSaved) {
          return prev.map(m => (m.id === savedMsg.id ? savedMsg : m));
        }
        return [...prev, savedMsg];
      });

      setLatestMessages(prev => ({ ...prev, [activeContact.username]: savedMsg }));
      setSelectedSecurityData(savedMsg);

      // If additional files were attached, send them sequentially
      if (attachedFiles.length > 1) {
        for (let i = 1; i < attachedFiles.length; i++) {
          const extraFile = attachedFiles[i];
          const extraSaved = await sendQuantumChatMessage({
            sender: currentUser.username,
            recipient: activeContact.username,
            text: '',
            file_name: extraFile.name,
            file_type: extraFile.type,
            file_size: extraFile.size,
            file_data: extraFile.data,
            inject_attack: injectAttack,
          });
          setMessages(prev => [...prev.filter(m => m.id !== extraSaved.id), extraSaved]);
        }
      }

      // Fast synchronous sync from DB
      await loadConversation();
      await loadAllLatestPreviews();
    } catch (err) {
      console.error('Send failed:', err);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, is_pending: false, is_failed: true, is_pass: false } : m));
      alert(err.message || 'Quantum transmission error');
    } finally {
      setIsSending(false);
    }
  };

  // 6. Clear chat history modal state
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [isClosingClearModal, setIsClosingClearModal] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  const handleOpenClearModal = () => {
    if (!currentUser?.username || !activeContact?.username) return;
    setShowClearConfirmModal(true);
  };

  const handleCloseClearModal = () => {
    if (isClosingClearModal) return;
    setIsClosingClearModal(true);
    setTimeout(() => {
      setIsClosingClearModal(false);
      setShowClearConfirmModal(false);
      setIsClearingHistory(false);
    }, 180);
  };

  const handleConfirmClearHistory = async () => {
    if (!currentUser?.username || !activeContact?.username || isClearingHistory) return;
    setIsClearingHistory(true);

    try {
      await clearChatMessages(currentUser.username, activeContact.username);
      setMessages([]);
      setLatestMessages(prev => {
        const next = { ...prev };
        delete next[activeContact.username];
        return next;
      });
      handleCloseClearModal();
    } catch (err) {
      console.error('Clear failed:', err);
      setIsClearingHistory(false);
    }
  };

  // Render Auth Page if not authenticated
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const contactsList = usersList.filter(u => u.username !== currentUser.username);

  return (
    <div className="flex-1 flex overflow-hidden relative h-screen w-screen font-sans bg-[var(--bg-primary)] text-[var(--text-main)]">
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        onLogout={handleLogout}
        usersList={usersList}
        activeContact={activeContact}
        onSelectContact={handleSelectContact}
        latestMessages={latestMessages}
        unreadCounts={unreadCounts}
        onRegisterUser={handleRegisterUser}
        onOpenAuditLedger={() => setIsAuditLedgerOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenPinnedDrawer={() => {
          loadPinnedStarred();
          setIsPinnedDrawerOpen(true);
        }}
        theme={theme}
        onToggleTheme={setTheme}
        density={density}
        onToggleDensity={() => setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')}
        isAdmin={isAdmin}
      />

      {/* Main Quantum Chat Area */}
      <ChatArea
        currentUser={currentUser}
        activeContact={activeContact}
        messages={messages}
        onSendMessage={handleSendMessage}
        onClearHistory={handleOpenClearModal}
        onOpenSecurity={(data) => {
          setSelectedSecurityData(data || messages[messages.length - 1]);
          setIsSecurityModalOpen(true);
        }}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenPinnedDrawer={() => {
          loadPinnedStarred();
          setIsPinnedDrawerOpen(true);
        }}
        isSending={isSending}
        density={density}
        jumpTarget={jumpTarget}
      />

      {/* Quantum Evidence & Telemetry Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        securityData={selectedSecurityData}
        currentSender={currentUser?.display_name || currentUser?.username}
        activeRecipient={activeContact?.display_name || activeContact?.username}
      />

      {/* Global Quantum Audit Ledger Modal (Admin Only) */}
      <AuditLedgerModal
        isOpen={isAuditLedgerOpen}
        onClose={() => setIsAuditLedgerOpen(false)}
        currentUser={currentUser}
        onSelectInspectMessage={(msg) => {
          setSelectedSecurityData(msg);
          setIsSecurityModalOpen(true);
        }}
      />

      {/* Command Palette Modal (Ctrl+K / Cmd+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        contacts={contactsList}
        onSelectContact={handleSelectContact}
        onToggleTheme={setTheme}
        currentTheme={theme}
        onToggleDensity={() => setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')}
        currentDensity={density}
        onToggleMitM={() => {
          const mitmBtn = document.querySelector('button[title*="Man-in-the-Middle"]');
          if (mitmBtn) mitmBtn.click();
        }}
        isMitMActive={false}
        onOpenSearch={() => {
          const searchBtn = document.querySelector('button[title*="Search conversation"]');
          if (searchBtn) searchBtn.click();
        }}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenPinnedDrawer={() => {
          loadPinnedStarred();
          setIsPinnedDrawerOpen(true);
        }}
        onOpenAuditLedger={() => setIsAuditLedgerOpen(true)}
        onClearHistory={handleOpenClearModal}
        isAdmin={isAdmin}
      />

      {/* Export Transcript Modal */}
      <ExportTranscriptModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentUser={currentUser}
        activeContact={activeContact}
      />

      {/* Pinned Proofs & Saved Messages Drawer */}
      <PinnedProofsDrawer
        isOpen={isPinnedDrawerOpen}
        onClose={() => setIsPinnedDrawerOpen(false)}
        currentUser={currentUser}
        activeContact={activeContact}
        pinnedMessages={pinnedData.pinned}
        starredMessages={pinnedData.starred}
        onJumpToMessage={(msgId) => {
          setIsPinnedDrawerOpen(false);
          setJumpTarget({ id: msgId, timestamp: Date.now() });
        }}
        onUnpin={async (msgId) => {
          await pinChatMessage(msgId, false);
          loadPinnedStarred();
        }}
        onUnstar={async (msgId) => {
          await starChatMessage(msgId, false);
          loadPinnedStarred();
        }}
        onOpenSecurity={(msg) => {
          setSelectedSecurityData(msg);
          setIsSecurityModalOpen(true);
        }}
      />

      {/* ── In-UI Clear History Confirmation Modal ── */}
      {(showClearConfirmModal || isClosingClearModal) && (
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none ${
            isClosingClearModal ? 'shadcn-dialog-overlay-closing' : 'shadcn-dialog-overlay'
          }`}
          onClick={handleCloseClearModal}
        >
          <div
            className={`bg-[#FCFBF8] border border-[#DDD4C5] rounded-2xl max-w-sm w-full shadow-2xl p-5 space-y-4 font-sans ${
              isClosingClearModal ? 'shadcn-dialog-content-closing' : 'shadcn-dialog-content'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#EAE3DA] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-terracotta-100 border border-terracotta-200 flex items-center justify-center text-terracotta-700 shrink-0 font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#181B20]">Clear Quantum Chat History?</h3>
                  <p className="text-[10px] font-mono text-[#746D62]">Purge all peer transmission logs</p>
                </div>
              </div>
              <button
                onClick={handleCloseClearModal}
                className="shadcn-btn text-[#746D62] hover:text-black p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#554F46] leading-relaxed">
              Clear all quantum chat records between <strong>{currentUser?.display_name || currentUser?.username}</strong> and <strong>{activeContact?.display_name || activeContact?.username}</strong>? This action will permanently erase cryptographic transcripts across both nodes.
            </p>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#EAE3DA]">
              <button
                type="button"
                onClick={handleCloseClearModal}
                disabled={isClearingHistory}
                className="shadcn-btn px-3.5 py-1.5 rounded-lg border border-[#DDD5C8] font-mono text-xs hover:bg-[#EAE3DA] text-[#554F46]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearHistory}
                disabled={isClearingHistory}
                className="shadcn-btn px-4 py-1.5 bg-terracotta-700 hover:bg-terracotta-800 text-white rounded-lg font-mono text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                {isClearingHistory ? 'Purging...' : 'Clear All History'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
