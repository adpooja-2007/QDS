import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SecurityModal from './components/SecurityModal';
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
    return {
      username: 'alice',
      display_name: 'Alice Kovacs',
      role: 'Signer Node Alpha',
      node_id: '#9042',
      avatar_text: 'AK',
      avatar_bg: 'bg-[#181B20]'
    };
  });

  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [latestMessages, setLatestMessages] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [selectedSecurityData, setSelectedSecurityData] = useState(null);

  // 1. Initialize network and load user list
  const loadUsers = useCallback(async () => {
    const users = await fetchUsers();
    if (users && users.length > 0) {
      setUsersList(users);

      // Verify current user still valid
      const existingCurrent = users.find(u => u.username === currentUser?.username);
      if (existingCurrent) {
        setCurrentUser(existingCurrent);
      }

      // If activeContact is null or same as current user, select default recipient
      if (!activeContact || activeContact.username === currentUser?.username) {
        const defaultRecipient = users.find(u => u.username !== currentUser?.username);
        if (defaultRecipient) {
          setActiveContact(defaultRecipient);
        }
      }
    }
  }, [currentUser?.username, activeContact]);

  useEffect(() => {
    initNetwork();
    loadUsers();
  }, []);

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('qds_chat_current_user', JSON.stringify(currentUser));
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
    const interval = setInterval(() => {
      loadConversation();
      loadAllLatestPreviews();
    }, 2000);
    return () => clearInterval(interval);
  }, [loadConversation, loadAllLatestPreviews]);

  // 4. Handle switching user identity
  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    // Find first other contact
    const other = usersList.find(u => u.username !== user.username);
    if (other) {
      setActiveContact(other);
    }
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

      setMessages(prev => [...prev, savedMsg]);
      setLatestMessages(prev => ({ ...prev, [activeContact.username]: savedMsg }));
      setSelectedSecurityData(savedMsg);
    } catch (err) {
      console.error('Send failed:', err);
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

  return (
    <div className="flex-1 flex overflow-hidden relative h-screen w-screen font-sans bg-[#FBF9F5] text-[#181B20]">
      {/* Sidebar with active identity and live contact list */}
      <Sidebar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        usersList={usersList}
        activeContact={activeContact}
        onSelectContact={setActiveContact}
        latestMessages={latestMessages}
        onRegisterUser={handleRegisterUser}
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
    </div>
  );
}
