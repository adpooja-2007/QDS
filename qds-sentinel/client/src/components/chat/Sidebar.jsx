import React, { useState, useEffect } from 'react';
import { searchChatMessages } from './api';
import ContactInfoModal from './ContactInfoModal';

export default function Sidebar({
  currentUser,
  onLogout,
  usersList = [],
  activeContact,
  onSelectContact,
  latestMessages = {},
  unreadCounts = {},
  onRegisterUser,
  onOpenAuditLedger,
  onOpenCommandPalette,
  onOpenPinnedDrawer,
  theme = 'light',
  onToggleTheme,
  density = 'comfortable',
  onToggleDensity,
  isAdmin = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'UNREAD' | 'VERIFIED' | 'CONTACTS' | 'MESSAGES'
  const [foundMessages, setFoundMessages] = useState([]);
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isClosingNewChatModal, setIsClosingNewChatModal] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState('Receiver Node Beta');
  const [modalError, setModalError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleCloseNewChatModal = () => {
    if (isClosingNewChatModal) return;
    setIsClosingNewChatModal(true);
    setTimeout(() => {
      setIsClosingNewChatModal(false);
      setShowNewChatModal(false);
      setModalError('');
    }, 180);
  };

  // Format relative timestamp
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Live search across message history when searchQuery changes
  useEffect(() => {
    if (!currentUser?.username || !searchQuery.trim()) {
      setFoundMessages([]);
      setIsSearchingMessages(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingMessages(true);
      try {
        const msgs = await searchChatMessages(currentUser.username, searchQuery.trim(), 40);
        setFoundMessages(msgs);
      } catch (err) {
        console.error('Message search failed:', err);
      } finally {
        setIsSearchingMessages(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [currentUser?.username, searchQuery]);

  // Highlight matching text helper
  const highlightMatch = (text, query) => {
    if (!query || !query.trim() || !text) return text;
    const trimmed = query.trim();
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) => {
      if (part.toLowerCase() === trimmed.toLowerCase()) {
        return (
          <mark
            key={i}
            className="bg-amber-300 text-amber-950 font-bold px-0.5 rounded-xs"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Filter & Sort contacts
  const filteredAndSortedContacts = usersList
    .filter((u) => u.username !== currentUser?.username)
    .filter((u) => {
      const isCurActive = activeContact?.username === u.username;
      const unread = isCurActive ? 0 : (unreadCounts[u.username] || 0);
      const lastMsg = latestMessages[u.username];

      if (!searchQuery.trim()) {
        if (filterTab === 'UNREAD' && unread === 0) return false;
        if (filterTab === 'VERIFIED' && (!lastMsg || !lastMsg.is_pass)) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = (u.display_name || '').toLowerCase().includes(q);
      const matchUser = (u.username || '').toLowerCase().includes(q);
      const matchRole = (u.role || '').toLowerCase().includes(q);
      const matchLastMsg = (lastMsg?.text || '').toLowerCase().includes(q);
      return matchName || matchUser || matchRole || matchLastMsg;
    })
    .sort((a, b) => {
      const timeA = latestMessages[a.username]?.timestamp
        ? new Date(latestMessages[a.username].timestamp).getTime()
        : 0;
      const timeB = latestMessages[b.username]?.timestamp
        ? new Date(latestMessages[b.username].timestamp).getTime()
        : 0;
      return timeB - timeA;
    });

  const totalUnreadAll = Object.entries(unreadCounts).reduce(
    (acc, [usr, count]) => (usr === activeContact?.username ? acc : acc + (count || 0)),
    0
  );

  const USERNAME_REGEX = /^[a-zA-Z0-9_-]{2,30}$/;

  const handleRegister = async (e) => {
    e.preventDefault();
    setModalError('');
    const u = newUsername.trim().toLowerCase();
    const d = newDisplayName.trim();

    if (!u) {
      setModalError('Username / Node ID is required.');
      return;
    }
    if (!USERNAME_REGEX.test(u)) {
      setModalError('Username must be 2-30 characters (letters, numbers, underscore, hyphen).');
      return;
    }
    if (d && d.length > 50) {
      setModalError('Display name must not exceed 50 characters.');
      return;
    }

    setIsRegistering(true);
    try {
      await onRegisterUser({
        username: u,
        password: u,
        display_name: d || u.charAt(0).toUpperCase() + u.slice(1),
        role: newRole.trim() || 'Quantum Node',
      });
      setNewUsername('');
      setNewDisplayName('');
      setModalError('');
      handleCloseNewChatModal();
    } catch (err) {
      setModalError(err.message || 'Failed to register node. Node may already exist.');
    } finally {
      setIsRegistering(false);
    }
  };

  const isSearching = Boolean(searchQuery.trim());

  // Handle clicking a message search result
  const handleSelectMessageResult = (msg) => {
    const partnerUsername = msg.sender?.toLowerCase() === currentUser?.username?.toLowerCase()
      ? msg.recipient?.toLowerCase()
      : msg.sender?.toLowerCase();

    const partnerContact = usersList.find((u) => u.username.toLowerCase() === partnerUsername);
    if (partnerContact) {
      onSelectContact(partnerContact);
    }
  };

  return (
    <aside className="w-[320px] md:w-[380px] border-r border-[#EAE3DA] bg-[#F7F4EF] flex flex-col shrink-0 select-none text-[#181B20]">
      {/* ── Sentinel Sidebar Header ── */}
      <div className="h-16 px-4 bg-[#FCFBF8] border-b border-[#EAE3DA] flex items-center justify-between shrink-0">
        <div
          onClick={() => setIsProfileOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsProfileOpen(true); }}
          className="flex items-center gap-3 min-w-0 flex-1 mr-2 cursor-pointer group p-1 rounded-xl hover:bg-[#F4EFEA] border border-transparent hover:border-[#E5DEC7] transition duration-150"
          title={`Click to view profile & node details for ${currentUser?.display_name}`}
        >
          <div className="relative shrink-0">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs text-cream-100 border border-[#2D3139] shadow-xs group-hover:scale-105 transition-transform duration-150 ${
                currentUser?.username === 'eve' ? 'bg-terracotta-700' : 'bg-[#181B20]'
              }`}
            >
              {currentUser?.avatar_text || currentUser?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="text-xs font-semibold text-[#181B20] group-hover:text-terracotta-600 transition-colors truncate">
                {currentUser?.display_name || 'Quantum Node'}
              </h2>
              {isAdmin && (
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  ADMIN
                </span>
              )}
            </div>
            <p className="font-mono text-[10px] text-[#797167] truncate">
              {currentUser?.node_id || '#000000'} · @{currentUser?.username}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Command Palette Button */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="shadcn-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#554F46] hover:text-[#181B20] bg-[#EAE3DA]/60 hover:bg-[#DDD5C8] border border-[#DDD5C8] hover:border-[#C5BCAD]"
              title="Command Palette (Ctrl+K / Cmd+K)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          )}

          {/* Theme Switcher Button */}
          {onToggleTheme && (
            <button
              onClick={() => {
                const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'terminal' : 'light';
                onToggleTheme(next);
              }}
              className="shadcn-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#554F46] hover:text-[#181B20] bg-[#EAE3DA]/60 hover:bg-[#DDD5C8] border border-[#DDD5C8] hover:border-[#C5BCAD]"
              title={`Theme: ${theme.toUpperCase()} (Click to toggle Light/Dark/Terminal)`}
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <span className="font-mono text-[10px] font-bold text-emerald-600">&gt;_</span>
              )}
            </button>
          )}

          {/* Admin Audit Ledger Button */}
          {isAdmin && (
            <button
              onClick={onOpenAuditLedger}
              className="shadcn-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#554F46] hover:text-[#181B20] bg-[#EAE3DA]/60 hover:bg-[#DDD5C8] border border-[#DDD5C8] hover:border-[#C5BCAD] shadow-2xs hover:shadow-xs"
              title="Quantum Audit Ledger (All Nodes Telemetry)"
            >
              <svg className="w-4 h-4 text-[#181B20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}

          {/* New Chat Button */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="shadcn-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#554F46] hover:text-[#181B20] bg-[#EAE3DA]/60 hover:bg-[#DDD5C8] border border-[#DDD5C8] hover:border-[#C5BCAD] shadow-2xs hover:shadow-xs"
            title="New Quantum Chat / Register Node"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>

          {/* Logout / Switch User Button */}
          <button
            onClick={onLogout}
            className="shadcn-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#554F46] hover:text-red-700 bg-[#EAE3DA]/60 hover:bg-red-100 border border-[#DDD5C8] hover:border-red-300 shadow-2xs hover:shadow-xs"
            title="Sign Out / Switch Identity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Tabs ── */}
      <div className="p-3 bg-[#F7F4EF] border-b border-[#EAE3DA] space-y-2">
        <div className="relative flex items-center bg-[#FCFBF8] border border-[#DDD5C8] hover:border-[#B5AA9A] rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-black focus-within:border-black transition-all duration-150">
          <svg className="w-3.5 h-3.5 text-[#9C9488] shrink-0 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            maxLength={100}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-[#181B20] focus:outline-none placeholder-[#9C9488]"
            placeholder="Search or start new quantum conversation..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#9C9488] hover:text-[#181B20] text-xs font-bold px-1"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-mono overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`shadcn-btn px-2.5 py-0.5 rounded-full border transition shrink-0 ${
              filterTab === 'ALL'
                ? 'bg-[#181B20] text-cream-100 border-[#181B20] font-semibold shadow-2xs'
                : 'bg-[#EAE3DA] text-[#554F46] border-transparent hover:bg-[#DDD5C8] hover:text-[#181B20] hover:border-[#C5BCAD]'
            }`}
          >
            {isSearching ? `All (${filteredAndSortedContacts.length + foundMessages.length})` : 'All'}
          </button>

          {isSearching && (
            <>
              <button
                onClick={() => setFilterTab('CONTACTS')}
                className={`shadcn-btn px-2.5 py-0.5 rounded-full border transition shrink-0 ${
                  filterTab === 'CONTACTS'
                    ? 'bg-[#181B20] text-cream-100 border-[#181B20] font-semibold shadow-2xs'
                    : 'bg-[#EAE3DA] text-[#554F46] border-transparent hover:bg-[#DDD5C8] hover:text-[#181B20] hover:border-[#C5BCAD]'
                }`}
              >
                Contacts ({filteredAndSortedContacts.length})
              </button>
              <button
                onClick={() => setFilterTab('MESSAGES')}
                className={`shadcn-btn px-2.5 py-0.5 rounded-full flex items-center gap-1 border transition shrink-0 ${
                  filterTab === 'MESSAGES'
                    ? 'bg-terracotta-600 text-white border-terracotta-700 font-semibold shadow-2xs'
                    : 'bg-[#EAE3DA] text-[#554F46] border-transparent hover:bg-[#DDD5C8] hover:text-[#181B20] hover:border-[#C5BCAD]'
                }`}
              >
                <span>Messages ({foundMessages.length})</span>
                {isSearchingMessages && (
                  <svg className="w-2.5 h-2.5 animate-spin inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth="2" stroke="currentColor"></circle>
                  </svg>
                )}
              </button>
            </>
          )}

          {!isSearching && (
            <>
              <button
                onClick={() => setFilterTab('UNREAD')}
                className={`shadcn-btn px-2.5 py-0.5 rounded-full flex items-center gap-1 border transition shrink-0 ${
                  filterTab === 'UNREAD'
                    ? 'bg-terracotta-600 text-white border-terracotta-700 font-semibold shadow-2xs'
                    : 'bg-[#EAE3DA] text-[#554F46] border-transparent hover:bg-[#DDD5C8] hover:text-[#181B20] hover:border-[#C5BCAD]'
                }`}
              >
                <span>Unread</span>
                {totalUnreadAll > 0 && (
                  <span className="w-4 h-4 rounded-full bg-terracotta-700 text-white text-[9px] flex items-center justify-center font-bold shadcn-pop-in">
                    {totalUnreadAll}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterTab('VERIFIED')}
                className={`shadcn-btn px-2.5 py-0.5 rounded-full border transition shrink-0 ${
                  filterTab === 'VERIFIED'
                    ? 'bg-forest-800 text-white border-forest-900 font-semibold shadow-2xs'
                    : 'bg-[#EAE3DA] text-[#554F46] border-transparent hover:bg-[#DDD5C8] hover:text-[#181B20] hover:border-[#C5BCAD]'
                }`}
              >
                QDS Verified
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Contacts & Search Stream ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#EAE3DA]">
        {/* Empty State */}
        {filteredAndSortedContacts.length === 0 && foundMessages.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#8C8479] shadcn-dialog-content">
            {isSearching
              ? `No quantum messages or nodes match "${searchQuery}".`
              : 'No quantum conversations found. Click "+" to start a new chat.'}
          </div>
        ) : (
          <>
            {/* 1. Matching Contacts Section */}
            {(filterTab === 'ALL' || filterTab === 'CONTACTS') && filteredAndSortedContacts.length > 0 && (
              <div>
                {isSearching && (
                  <div className="px-3.5 py-1.5 bg-[#F2ECE4] text-[10px] font-mono font-bold text-[#797167] tracking-wider uppercase border-b border-[#EAE3DA]">
                    Matching Nodes ({filteredAndSortedContacts.length})
                  </div>
                )}
                {filteredAndSortedContacts.map((contact) => {
                  const isActive = activeContact?.username === contact.username;
                  const lastMsg = latestMessages[contact.username];
                  const unread = isActive ? 0 : (unreadCounts[contact.username] || 0);
                  const isEve = contact.username === 'eve';
                  const isFromMe = lastMsg?.sender?.toLowerCase() === currentUser?.username?.toLowerCase();

                  return (
                    <div
                      key={contact.username}
                      onClick={() => onSelectContact(contact)}
                      className={`p-3.5 cursor-pointer relative flex items-center gap-3 group transition-all duration-150 ease-out select-none ${
                        isActive
                          ? 'bg-[#EAE3DA] border-l-4 border-l-terracotta-600 shadow-2xs'
                          : unread > 0
                          ? 'bg-[#F9F6F0] hover:bg-[#EFEAE2] border-l-4 border-l-forest-600 hover:shadow-xs'
                          : 'hover:bg-[#EFEAE2] bg-transparent hover:shadow-2xs'
                      }`}
                    >
                      {/* Node Avatar */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-xs text-cream-100 shadow-xs group-hover:scale-105 group-hover:shadow-sm transition-all duration-150 ${
                            isEve ? 'bg-terracotta-700' : 'bg-[#181B20]'
                          }`}
                        >
                          {contact.avatar_text || contact.username[0].toUpperCase()}
                        </div>
                      </div>

                      {/* Info & Last Message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className={`text-xs truncate transition-colors duration-150 ${
                              unread > 0
                                ? 'font-bold text-[#111317] group-hover:text-terracotta-600'
                                : 'font-semibold text-[#181B20] group-hover:text-terracotta-600'
                            }`}
                          >
                            {isSearching ? highlightMatch(contact.display_name, searchQuery) : contact.display_name}
                          </span>
                          <span
                            className={`font-mono text-[9px] shrink-0 ml-2 ${
                              unread > 0 ? 'text-forest-700 font-bold' : 'text-[#8C8479]'
                            }`}
                          >
                            {formatTime(lastMsg?.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs truncate">
                            {/* Delivery / Verification icon if message was sent by me */}
                            {isFromMe && lastMsg && (
                              <span className="shrink-0 text-xs font-bold">
                                {lastMsg.is_pending ? (
                                  <svg className="w-3 h-3 text-[#8C8479] inline animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="9" strokeWidth="2" stroke="currentColor" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v5l3 3" />
                                  </svg>
                                ) : lastMsg.is_read ? (
                                  <span className="text-forest-700 dark:text-forest-400" title="Read by peer">✓✓</span>
                                ) : (
                                  <span className="text-[#8C8479]" title="Delivered">✓</span>
                                )}
                              </span>
                            )}

                            <p
                              className={`truncate font-sans max-w-[155px] ${
                                unread > 0 ? 'font-semibold text-[#181B20]' : 'text-[#554F46] group-hover:text-[#2D2A26]'
                              }`}
                            >
                              {isFromMe ? 'You: ' : ''}
                              {lastMsg?.text
                                ? (isSearching ? highlightMatch(lastMsg.text, searchQuery) : lastMsg.text)
                                : (lastMsg?.file_name
                                  ? `[File] ${lastMsg.file_name}`
                                  : (isSearching ? highlightMatch(contact.role, searchQuery) : contact.role || 'Ready for EPR handshake'))}
                            </p>
                          </div>

                          {/* Right badge: Unread Counter or QDS Badge */}
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {unread > 0 ? (
                              <span className="shadcn-pop-in min-w-5 h-5 px-1.5 rounded-full bg-forest-600 group-hover:bg-forest-700 text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-xs transition-colors">
                                {unread}
                              </span>
                            ) : (
                              lastMsg && (
                                <span
                                  className={`text-[8px] font-mono px-1 rounded transition-all duration-150 ${
                                    lastMsg.is_pass
                                      ? 'bg-forest-50 text-forest-800 border border-forest-200 group-hover:border-forest-300'
                                      : 'bg-terracotta-50 text-terracotta-800 border border-terracotta-200 group-hover:border-terracotta-300'
                                  }`}
                                >
                                  {lastMsg.is_pass ? 'QDS' : 'VIOLATION'}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Found Messages Stream Section */}
            {isSearching && (filterTab === 'ALL' || filterTab === 'MESSAGES') && foundMessages.length > 0 && (
              <div>
                <div className="px-3.5 py-1.5 bg-[#F2ECE4] text-[10px] font-mono font-bold text-[#797167] tracking-wider uppercase border-b border-[#EAE3DA] flex items-center justify-between">
                  <span>Messages Found ({foundMessages.length})</span>
                  <span className="text-[9px] font-normal text-[#8C8479]">Click to open</span>
                </div>

                {foundMessages.map((msg, idx) => {
                  const isFromMe = msg.sender?.toLowerCase() === currentUser?.username?.toLowerCase();
                  const partnerUsername = isFromMe ? msg.recipient : msg.sender;
                  const partnerContact = usersList.find((u) => u.username.toLowerCase() === partnerUsername?.toLowerCase());
                  const isEve = partnerUsername === 'eve';

                  return (
                    <div
                      key={msg.id || idx}
                      onClick={() => handleSelectMessageResult(msg)}
                      className="p-3 cursor-pointer bg-[#FCFBF8] hover:bg-[#F4EFEA] border-b border-[#EAE3DA]/80 transition-all duration-150 group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[9px] text-cream-100 shadow-2xs ${
                              isEve ? 'bg-terracotta-700' : 'bg-[#181B20]'
                            }`}
                          >
                            {partnerContact?.avatar_text || partnerUsername?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-[#181B20] group-hover:text-terracotta-600 transition-colors truncate">
                            {partnerContact?.display_name || partnerUsername}
                          </span>
                          <span className="font-mono text-[9px] text-[#8C8479]">
                            {isFromMe ? '(sent)' : '(received)'}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-[#8C8479] shrink-0">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      {/* Message Content Snippet with Highlight */}
                      <div className="pl-6.5 text-xs text-[#554F46] group-hover:text-[#181B20] font-sans line-clamp-2 leading-relaxed">
                        {msg.file_name ? (
                          <span className="font-mono text-[11px] text-terracotta-700 block">
                            [File: {highlightMatch(msg.file_name, searchQuery)}]
                          </span>
                        ) : null}
                        {msg.text && (
                          <p className="break-words">
                            {highlightMatch(msg.text, searchQuery)}
                          </p>
                        )}
                      </div>

                      {/* Footer Info: QDS Verification Status & Session */}
                      <div className="pl-6.5 mt-1.5 flex items-center justify-between font-mono text-[9px]">
                        <span className="text-[#8C8479] truncate">
                          {msg.session_id || 'QKD-EPR'}
                        </span>
                        <span
                          className={`px-1 rounded ${
                            msg.is_pass
                              ? 'bg-forest-50 text-forest-800 border border-forest-200'
                              : 'bg-terracotta-50 text-terracotta-800 border border-terracotta-200'
                          }`}
                        >
                          {msg.is_pass ? 'VERIFIED' : 'VIOLATION'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>


      {/* ── Add Node Modal ── */}
      {(showNewChatModal || isClosingNewChatModal) && (
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none ${
            isClosingNewChatModal ? 'shadcn-dialog-overlay-closing' : 'shadcn-dialog-overlay'
          }`}
          onClick={handleCloseNewChatModal}
        >
          <div
            className={`bg-[#FCFBF8] border border-[#DDD4C5] rounded-2xl max-w-sm w-full shadow-2xl p-5 space-y-4 font-sans ${
              isClosingNewChatModal ? 'shadcn-dialog-content-closing' : 'shadcn-dialog-content'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#EAE3DA] pb-2">
              <h3 className="font-semibold text-sm text-[#181B20]">Register Quantum Node</h3>
              <button onClick={handleCloseNewChatModal} className="shadcn-btn text-[#746D62] hover:text-black">
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-terracotta-50 border border-terracotta-200 text-terracotta-800 text-[11px] font-mono flex items-start gap-2 shadcn-pop-in">
                <span className="font-bold text-terracotta-700 mt-0.5">!</span>
                <span className="flex-1">{modalError}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-[10px] text-[#554F46] mb-1">Username / Node ID (2-30 characters)</label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={newUsername}
                  onChange={(e) => {
                    setNewUsername(e.target.value);
                    if (modalError) setModalError('');
                  }}
                  placeholder="e.g. charlie, node_gamma"
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-lg p-2 font-mono text-xs focus:ring-1 focus:ring-black transition-all duration-150"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#554F46] mb-1">Display Name (Optional, max 50 chars)</label>
                <input
                  type="text"
                  maxLength={50}
                  value={newDisplayName}
                  onChange={(e) => {
                    setNewDisplayName(e.target.value);
                    if (modalError) setModalError('');
                  }}
                  placeholder="e.g. Charlie Kovacs"
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-lg p-2 text-xs focus:ring-1 focus:ring-black transition-all duration-150"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#554F46] mb-1">Role / Function</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-lg p-2 text-xs focus:ring-1 focus:ring-black font-mono transition-all duration-150"
                >
                  <option value="Signer Node Alpha">Signer Node (Alice Alpha)</option>
                  <option value="Receiver Node Beta">Receiver Node (Bob Beta)</option>
                  <option value="Quantum Router / Relay">Quantum Router / Relay (QuARC)</option>
                  <option value="Security Administrator">Security Administrator (Admin)</option>
                  <option value="Adversary Probe">Adversary Simulator (Eve)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseNewChatModal}
                  className="shadcn-btn px-3 py-1.5 rounded-lg border border-[#DDD5C8] font-mono text-xs hover:bg-[#EAE3DA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="shadcn-btn px-4 py-1.5 bg-[#181B20] text-white rounded-lg font-mono text-xs hover:bg-black font-semibold shadow-xs"
                >
                  {isRegistering ? 'Registering...' : 'Add Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Current User Profile Details Modal */}
      <ContactInfoModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        contact={currentUser}
        currentUser={currentUser}
      />
    </aside>
  );
}
