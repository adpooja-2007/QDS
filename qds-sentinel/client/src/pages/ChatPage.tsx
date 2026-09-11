import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ShieldAlert, Bell } from 'lucide-react';
import { useSentinel } from '@/lib/SentinelContext';
import AuthPage from '@/components/chat/AuthPage';
import Sidebar from '@/components/chat/Sidebar';
import ChatArea from '@/components/chat/ChatArea';
import SecurityModal from '@/components/chat/SecurityModal';
import AuditLedgerModal from '@/components/chat/AuditLedgerModal';
import CommandPaletteModal from '@/components/chat/CommandPaletteModal';
import ExportTranscriptModal from '@/components/chat/ExportTranscriptModal';
import PinnedProofsDrawer from '@/components/chat/PinnedProofsDrawer';
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
} from '@/components/chat/api';

const AuthPageComp = AuthPage as any;
const SidebarComp = Sidebar as any;
const ChatAreaComp = ChatArea as any;
const SecurityModalComp = SecurityModal as any;
const AuditLedgerModalComp = AuditLedgerModal as any;
const CommandPaletteModalComp = CommandPaletteModal as any;
const ExportTranscriptModalComp = ExportTranscriptModal as any;
const PinnedProofsDrawerComp = PinnedProofsDrawer as any;

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

export default function ChatPage() {
  const { toggleNotificationCenter, unreadNotificationCount, eveActive } = useSentinel();
  const [usersList, setUsersList] = useState<any[]>(DEFAULT_DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('qds_chat_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null; // Start on AuthPage if not logged in
  });

  const [activeContact, setActiveContact] = useState<any>(null);
  const activeContactRef = React.useRef<string | null>(null);
  useEffect(() => {
    activeContactRef.current = activeContact?.username || null;
  }, [activeContact]);

  const [messages, setMessages] = useState<any[]>([]);
  const [latestMessages, setLatestMessages] = useState<Record<string, any>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isSending, setIsSending] = useState(false);
  const isPollingRef = React.useRef(false);

  // Modals & Drawers
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAuditLedgerOpen, setIsAuditLedgerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPinnedDrawerOpen, setIsPinnedDrawerOpen] = useState(false);
  const [selectedSecurityData, setSelectedSecurityData] = useState<any>(null);
  const [pinnedData, setPinnedData] = useState<{ pinned: any[]; starred: any[]; total: number }>({ pinned: [], starred: [], total: 0 });
  const [jumpTarget, setJumpTarget] = useState<any>(null);

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

  useEffect(() => {
    document.title = "QDS Sentinel — Quantum Chat";
  }, []);

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
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
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
        const existingCurrent = users.find((u: any) => u.username === currentUser.username);
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

  // 2. Fetch active conversation messages (with pending message preservation)
  const loadConversation = useCallback(async () => {
    const activeUser = activeContactRef.current;
    if (!currentUser?.username || !activeUser) return;
    try {
      const msgs = await fetchChatMessages(currentUser.username, activeUser, 100, true);
      setMessages(prev => {
        const pending = prev.filter(m => m.is_pending && !msgs.some((dbMsg: any) => dbMsg.id === m.id));
        if (pending.length === 0) {
          if (
            prev.length === msgs.length &&
            prev.length > 0 &&
            prev[prev.length - 1]?.id === msgs[msgs.length - 1]?.id &&
            prev[0]?.id === msgs[0]?.id &&
            prev.every((m: any, idx: number) => m.id === msgs[idx]?.id && m.is_pending === msgs[idx]?.is_pending && m.is_read === msgs[idx]?.is_read)
          ) {
            return prev;
          }
          return msgs;
        }
        return [...msgs, ...pending];
      });

      if (msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        setLatestMessages(prev => ({ ...prev, [activeUser]: last }));
      }

      // Guarantee unread count for current active contact is 0
      setUnreadCounts(prev => ({ ...prev, [activeUser]: 0 }));
    } catch (e) {
      console.error('loadConversation error:', e);
    }
  }, [currentUser?.username]);

  // 3. Load latest messages and unread counts for all contacts atomically
  const loadAllLatestPreviews = useCallback(async () => {
    if (!currentUser?.username || usersList.length === 0) return;

    try {
      const otherUsers = usersList.filter((u: any) => u.username !== currentUser.username);
      const [unreadMap, ...previewResults] = await Promise.all([
        fetchUnreadCounts(currentUser.username),
        ...otherUsers.map((u: any) => fetchChatMessages(currentUser.username, u.username, 1, false))
      ]);

      const currentActive = activeContactRef.current;
      if (currentActive && unreadMap) {
        unreadMap[currentActive] = 0;
      }

      if (unreadMap) {
        setUnreadCounts(unreadMap);
      }

      const latestBatch: Record<string, any> = {};
      otherUsers.forEach((u: any, idx: number) => {
        const contactMsgs = previewResults[idx];
        if (contactMsgs && contactMsgs.length > 0) {
          latestBatch[u.username] = contactMsgs[contactMsgs.length - 1];
        }
      });

      setLatestMessages(prev => ({ ...prev, ...latestBatch }));
    } catch (e) {
      console.error('loadAllLatestPreviews error:', e);
    }
  }, [currentUser?.username, usersList]);

  // Load pinned & starred proofs
  const loadPinnedStarred = useCallback(async () => {
    if (!currentUser?.username) return;
    const data = await fetchPinnedStarredMessages(currentUser.username, activeContactRef.current || null);
    setPinnedData(data);
  }, [currentUser?.username]);

  // Unified Polling Cycle (Avoids overlapping async races)
  const pollChat = useCallback(async () => {
    if (!currentUser?.username || isPollingRef.current) return;
    isPollingRef.current = true;
    try {
      await loadConversation();
      await loadAllLatestPreviews();
    } finally {
      isPollingRef.current = false;
    }
  }, [currentUser?.username, loadConversation, loadAllLatestPreviews]);

  useEffect(() => {
    loadConversation();
    loadAllLatestPreviews();
    loadPinnedStarred();
  }, [loadConversation, loadAllLatestPreviews, loadPinnedStarred]);

  // High-frequency polling (1.2s interval) with concurrency lock
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      pollChat();
    }, 1200);
    return () => clearInterval(interval);
  }, [currentUser, pollChat]);

  // 4. Handle Login & Logout
  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    activeContactRef.current = null;
    setActiveContact(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    activeContactRef.current = null;
    setActiveContact(null);
    setMessages([]);
    setUnreadCounts({});
  };

  const handleSelectContact = async (contact: any) => {
    if (!contact?.username) return;
    activeContactRef.current = contact.username;
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

  const handleRegisterUser = async (data: any) => {
    const res = await registerUser(data);
    await loadUsers();
    if (res.user) {
      handleSelectContact(res.user);
    }
  };

  // Telemetry bridge to SOC Dashboard
  const broadcastChatToSocTelemetry = (savedMsg: any, injectAttack: boolean) => {
    try {
      const isThreat = Boolean(injectAttack || (savedMsg.is_pass === false) || savedMsg.is_forged);
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + Math.floor(100 + Math.random() * 899);
      const sender = (savedMsg.sender || currentUser?.username || 'ALICE').toUpperCase();
      const recipient = (savedMsg.recipient || activeContact?.username || 'BOB').toUpperCase();
      const payloadPreview = savedMsg.text || savedMsg.file_name || (savedMsg.is_audio ? 'Audio Voice Note' : 'Quantum encrypted payload');
      const qberStr = isThreat ? '14.2%' : '1.9%';
      const chshStr = isThreat ? '1.76' : '2.76';

      const newEvt = {
        id: `evt-chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        time: timeStr,
        source: isThreat ? 'EVE-PROBE' : `QN-${sender}`,
        text: isThreat
          ? `[MITM CHAT ATTACK DETECTED] Intercept-resend disturbance on message from ${sender} to ${recipient}`
          : `Quantum chat signature verified: ${sender} ➔ ${recipient} · "${payloadPreview.slice(0, 45)}"`,
        ms: isThreat ? '82ms' : '18ms',
        code: isThreat ? '0xFA BREACH' : '200 OK',
        qber: qberStr,
        chsh: chshStr,
        payloadContent: payloadPreview,
        isThreat: isThreat
      };

      let newThreat: any = undefined;
      let newInc: any = undefined;

      if (isThreat) {
        newThreat = {
          id: `THR-CHAT-${Date.now().toString().slice(-4)}`,
          severity: 'CRITICAL',
          origin: `CHAT / ${sender}`,
          badge: 'ACTIVE MITM',
          type: `Chat Packet Interception (${sender} ➔ ${recipient})`,
          time: timeStr.slice(0, 8),
          baseline: '1.9%',
          current: '14.2%',
          detail: `Adversary Eve intercepted live chat payload "${payloadPreview.slice(0, 30)}". Quantum state collapsed (QBER 14.2%, CHSH S=1.76).`,
          qber: 0.142,
          chsh: 1.76
        };

        newInc = {
          id: `INC-CHAT-${Date.now().toString().slice(-4)}`,
          title: `Chat Intercept-Resend Attack (${sender} ➔ ${recipient})`,
          severity: 'CRITICAL',
          status: 'INVESTIGATING',
          assigned: 'Anisha S (L2)',
          impact: 'CRITICAL',
          qber: '14.20%',
          chsh: '1.76',
          timestamp: timeStr.slice(0, 8),
          analyst: 'Anisha S',
          detail: `Adversarial tap injected on live quantum messaging channel between ${sender} and ${recipient}. QBER 14.2% breached Hoeffding bound.`,
          events: [
            [`${timeStr.slice(0, 8)} UTC`, 'Adversarial Tap', `Adversary Eve intercepted message payload "${payloadPreview.slice(0, 20)}".`],
            [`${timeStr.slice(0, 8)} UTC`, 'Superposition Collapse', 'QBER reached 14.20% (threshold 5.50%). Bell non-locality collapsed.'],
            [`${timeStr.slice(0, 8)} UTC`, 'SOC Escalation', 'Channel flagged for L2 analyst triage and forensic inspection.']
          ],
          helstrom: 'P_e ≥ 0.0820',
          traceDistance: 'D = 0.8360',
          targetNode: `QN-${recipient}`
        };
      }

      const payload = {
        attackTitle: isThreat ? 'MitM attack' : 'Clean signature',
        qber: isThreat ? 0.142 : 0.019,
        chsh: isThreat ? 1.76 : 2.76,
        newEvents: [newEvt],
        newThreat,
        newInc,
        isThreat
      };

      try {
        const bc = new BroadcastChannel('qds_quantum_telemetry');
        bc.postMessage({
          type: isThreat ? 'ATTACK_TRIGGERED' : 'NEW_TELEMETRY_ITEM',
          payload
        });
        bc.close();
      } catch {}

      try {
        const existingLogs = JSON.parse(localStorage.getItem('qds_telemetry_logs') || '[]');
        localStorage.setItem('qds_telemetry_logs', JSON.stringify([newEvt, ...existingLogs].slice(0, 100)));
        if (isThreat) {
          localStorage.setItem('qds_eve_active', 'true');
          localStorage.setItem('qds_active_attack', 'MitM attack');
          localStorage.setItem('qds_qber', '0.142');
          localStorage.setItem('qds_chsh', '1.76');
          if (newThreat) {
            const threats = JSON.parse(localStorage.getItem('qds_threats') || '[]');
            localStorage.setItem('qds_threats', JSON.stringify([newThreat, ...threats]));
          }
          if (newInc) {
            const incs = JSON.parse(localStorage.getItem('qds_incidents') || '[]');
            localStorage.setItem('qds_incidents', JSON.stringify([newInc, ...incs]));
          }
        }
      } catch {}

      window.dispatchEvent(new CustomEvent('qds_quantum_telemetry', { detail: payload }));
    } catch (err) {
      console.error('Error broadcasting chat telemetry:', err);
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
  }: any) => {
    if (!currentUser?.username || !activeContact?.username) return;

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
      broadcastChatToSocTelemetry(savedMsg, injectAttack);

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
          broadcastChatToSocTelemetry(extraSaved, injectAttack);
        }
      }

      // Fast synchronous sync from DB
      await loadConversation();
      await loadAllLatestPreviews();
    } catch (err: any) {
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
    return (
      <div className="relative h-screen w-screen bg-[#FBF9F5] dark:bg-[#0A0D12]">
        <div className="absolute top-4 left-4 z-50">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded border border-[#E0D7CC] dark:border-[#2A3442] bg-white/80 dark:bg-[#151A22]/80 backdrop-blur text-[#554F46] dark:text-[#8B949E] hover:text-[#181B20] dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Sentinel Home
          </Link>
        </div>
        <AuthPageComp onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  const contactsList = usersList.filter(u => u.username !== currentUser.username);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-sans bg-[var(--bg-primary)] text-[var(--text-main)]">
      {/* Sentinel Top Utility Bar */}
      <header className="h-9 px-4 flex items-center justify-between border-b border-[#E0D7CC] dark:border-[#232C38] bg-[#F7F4EF] dark:bg-[#0E1218] select-none shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#746D62] dark:text-[#8B949E] hover:text-[#181B20] dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            <span>SENTINEL HOME</span>
          </Link>
          <span className="text-[#CCC2B2] dark:text-[#333D4B] font-mono text-xs">/</span>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#554F46] dark:text-[#C9D1D9]">
            <span className="font-semibold">QDS QUANTUM CHAT</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EAE3DA] dark:bg-[#1E2633] text-[#746D62] dark:text-[#8B949E]">
              P2P E2EE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#DDD5C8] dark:border-[#2A3442] bg-white/50 dark:bg-[#151A22]/50 text-[#746D62] dark:text-[#8B949E] hover:border-[#B5AA9A] dark:hover:border-[#3D4A5C] text-[11px] transition-colors"
          >
            <span>Command Palette</span>
            <kbd className="text-[10px] px-1 bg-[#EAE3DA] dark:bg-[#202733] rounded">Ctrl+K</kbd>
          </button>
          <button
            onClick={toggleNotificationCenter}
            className="relative p-1 text-[#746D62] dark:text-[#8B949E] hover:text-[#181B20] dark:hover:text-white rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={unreadNotificationCount > 0 ? `${unreadNotificationCount} unread signal notifications` : "Notification Center"}
            aria-label="Notifications"
          >
            <Bell size={15} className={eveActive ? "text-[#b94a2f] animate-bounce" : ""} />
            {unreadNotificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  minWidth: '14px',
                  height: '14px',
                  padding: '0 3px',
                  borderRadius: '999px',
                  background: eveActive ? '#b94a2f' : '#2f6f85',
                  color: '#fff',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[#8B8477] dark:text-[#6E7681]">OPERATOR:</span>
            <span className="font-semibold text-[#181B20] dark:text-[#E6EDF3]">
              {currentUser?.display_name || currentUser?.username}
            </span>
            {isAdmin && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-[#2A2211] text-amber-900 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-800/50">
                ADMIN
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace: Sidebar + Chat Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <SidebarComp
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
        <ChatAreaComp
          currentUser={currentUser}
          activeContact={activeContact}
          messages={messages}
          onSendMessage={handleSendMessage}
          onClearHistory={handleOpenClearModal}
          onOpenSecurity={(data: any) => {
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
      </div>

      {/* Security Telemetry & Proof Details Modal */}
      <SecurityModalComp
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        data={selectedSecurityData}
        currentUser={currentUser}
        activeContact={activeContact}
      />

      {/* Audit Ledger Modal */}
      <AuditLedgerModalComp
        isOpen={isAuditLedgerOpen}
        onClose={() => setIsAuditLedgerOpen(false)}
        currentUser={currentUser}
        activeContact={activeContact}
      />

      {/* Command Palette Modal (Ctrl+K / Cmd+K) */}
      <CommandPaletteModalComp
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        contacts={contactsList}
        onSelectContact={handleSelectContact}
        onToggleTheme={setTheme}
        currentTheme={theme}
        onToggleDensity={() => setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')}
        currentDensity={density}
        onToggleMitM={() => {
          const mitmBtn = document.querySelector('button[title*="Man-in-the-Middle"]') as HTMLButtonElement | null;
          if (mitmBtn) mitmBtn.click();
        }}
        isMitMActive={false}
        onOpenSearch={() => {
          const searchBtn = document.querySelector('button[title*="Search conversation"]') as HTMLButtonElement | null;
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
      <ExportTranscriptModalComp
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentUser={currentUser}
        activeContact={activeContact}
      />

      {/* Pinned Proofs & Saved Messages Drawer */}
      <PinnedProofsDrawerComp
        isOpen={isPinnedDrawerOpen}
        onClose={() => setIsPinnedDrawerOpen(false)}
        currentUser={currentUser}
        activeContact={activeContact}
        pinnedMessages={pinnedData.pinned}
        starredMessages={pinnedData.starred}
        onJumpToMessage={(msgId: any) => {
          setIsPinnedDrawerOpen(false);
          setJumpTarget({ id: msgId, timestamp: Date.now() });
        }}
        onUnpin={async (msgId: any) => {
          await pinChatMessage(msgId, false);
          loadPinnedStarred();
        }}
        onUnstar={async (msgId: any) => {
          await starChatMessage(msgId, false);
          loadPinnedStarred();
        }}
        onOpenSecurity={(msg: any) => {
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