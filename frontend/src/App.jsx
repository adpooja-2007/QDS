import React, { useState, useEffect, useCallback } from 'react';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SecurityModal from './components/SecurityModal';
import AuditLedgerModal from './components/AuditLedgerModal';
import {
  initNetwork,
  fetchUsers,
  registerUser,
  fetchChatMessages,
  sendQuantumChatMessage,
  clearChatMessages
} from './api';

export default function App() {
  const [usersList, setUsersList] = useState([]);
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
  const [isSending, setIsSending] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAuditLedgerOpen, setIsAuditLedgerOpen] = useState(false);
  const [selectedSecurityData, setSelectedSecurityData] = useState(null);

  const isAdmin = Boolean(
    currentUser?.is_admin ||
    currentUser?.username === 'admin' ||
    currentUser?.role?.toLowerCase().includes('admin')
  );


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

        if (!activeContact || activeContact.username === currentUser.username) {
          const defaultRecipient = users.find(u => u.username !== currentUser.username);
          if (defaultRecipient) {
            setActiveContact(defaultRecipient);
          }
        }
      }
    }
  }, [currentUser?.username, activeContact]);

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
  const loadConversation = useCallback(async () => {
    if (!currentUser?.username || !activeContact?.username) return;
    const msgs = await fetchChatMessages(currentUser.username, activeContact.username);
    setMessages(msgs);

    if (msgs.length > 0) {
      const last = msgs[msgs.length - 1];
      setLatestMessages(prev => ({ ...prev, [activeContact.username]: last }));
    }
  }, [currentUser?.username, activeContact?.username]);

  // 3. Load latest messages for all contacts
  const loadAllLatestPreviews = useCallback(async () => {
    if (!currentUser?.username || usersList.length === 0) return;
    for (const u of usersList) {
      if (u.username === currentUser.username) continue;
      const msgs = await fetchChatMessages(currentUser.username, u.username, 1);
      if (msgs && msgs.length > 0) {
        setLatestMessages(prev => ({ ...prev, [u.username]: msgs[msgs.length - 1] }));
      }
    }
  }, [currentUser?.username, usersList]);

  // Initial load when activeContact or currentUser changes
  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Periodic polling for real-time sync across windows/tabs
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      loadConversation();
      loadAllLatestPreviews();
    }, 2000);
    return () => clearInterval(interval);
  }, [currentUser, loadConversation, loadAllLatestPreviews]);

  // 4. Handle Login & Logout
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    const other = usersList.find(u => u.username !== user.username);
    if (other) {
      setActiveContact(other);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveContact(null);
    setMessages([]);
  };

  // 5. Handle registration of new user node
  const handleRegisterUser = async (data) => {
    const res = await registerUser(data);
    await loadUsers();
    if (res.user) {
      setActiveContact(res.user);
    }
  };

  // 6. Handle sending message via 6-stage quantum pipeline
  const handleSendMessage = async ({ text, file_name, file_type, file_size, file_data, inject_attack }) => {
    if (!currentUser?.username || !activeContact?.username) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      sender: currentUser.username,
      recipient: activeContact.username,
      text,
      file_name,
      file_type,
      file_size,
      file_data,
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
        file_name,
        file_type,
        file_size,
        file_data,
        inject_attack
      });

      setMessages(prev => prev.map(m => m.id === tempId ? savedMsg : m));
      setLatestMessages(prev => ({ ...prev, [activeContact.username]: savedMsg }));
      setSelectedSecurityData(savedMsg);
    } catch (err) {
      console.error('Send failed:', err);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, is_pending: false, is_failed: true, is_pass: false } : m));
      alert(err.message || 'Quantum transmission error');
    } finally {
      setIsSending(false);
    }
  };


  // 7. Clear chat history
  const handleClearHistory = async () => {
    if (!currentUser?.username || !activeContact?.username) return;
    if (!window.confirm(`Clear all quantum chat records between ${currentUser.display_name} and ${activeContact.display_name}?`)) return;

    try {
      await clearChatMessages(currentUser.username, activeContact.username);
      setMessages([]);
      setLatestMessages(prev => {
        const next = { ...prev };
        delete next[activeContact.username];
        return next;
      });
    } catch (err) {
      console.error('Clear failed:', err);
    }
  };

  // Render Auth Page if not authenticated
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex-1 flex overflow-hidden relative h-screen w-screen font-sans bg-[#FBF9F5] text-[#181B20]">
      {/* Sidebar with active identity and live contact list */}
      <Sidebar
        currentUser={currentUser}
        onLogout={handleLogout}
        usersList={usersList}
        activeContact={activeContact}
        onSelectContact={setActiveContact}
        latestMessages={latestMessages}
        onRegisterUser={handleRegisterUser}
        onOpenAuditLedger={() => setIsAuditLedgerOpen(true)}
        isAdmin={isAdmin}
      />

      {/* Main Quantum Chat Area */}
      <ChatArea
        currentUser={currentUser}
        activeContact={activeContact}
        messages={messages}
        onSendMessage={handleSendMessage}
        onClearHistory={handleClearHistory}
        onOpenSecurity={(data) => {
          setSelectedSecurityData(data || messages[messages.length - 1]);
          setIsSecurityModalOpen(true);
        }}
        isSending={isSending}
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
    </div>
  );
}
