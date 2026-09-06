import React, { useState } from 'react';

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
  isAdmin = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'UNREAD' | 'VERIFIED'
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState('Receiver Node Beta');
  const [isRegistering, setIsRegistering] = useState(false);

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

  // Filter & Sort contacts by most recent message timestamp
  const filteredAndSortedContacts = usersList
    .filter((u) => u.username !== currentUser?.username)
    .filter((u) => {
      const unread = unreadCounts[u.username] || 0;
      const lastMsg = latestMessages[u.username];

      if (filterTab === 'UNREAD' && unread === 0) return false;
      if (filterTab === 'VERIFIED' && (!lastMsg || !lastMsg.is_pass)) return false;

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

  const totalUnreadAll = Object.values(unreadCounts).reduce((acc, count) => acc + (count || 0), 0);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setIsRegistering(true);
    try {
      await onRegisterUser({
        username: newUsername.trim().toLowerCase(),
        password: newUsername.trim().toLowerCase(),
        display_name: newDisplayName.trim() || newUsername.trim().capitalize(),
        role: newRole.trim() || 'Quantum Node',
      });
      setNewUsername('');
      setNewDisplayName('');
      setShowNewChatModal(false);
    } catch (err) {
      alert(err.message || 'Failed to register node');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <aside className="w-[320px] md:w-[380px] border-r border-[#EAE3DA] bg-[#F7F4EF] flex flex-col shrink-0 select-none text-[#181B20]">
      {/* ── Sentinel Sidebar Header ── */}
      <div className="p-3.5 bg-[#FCFBF8] border-b border-[#EAE3DA] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative" title={`Logged in as ${currentUser?.display_name}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs text-cream-100 border border-[#2D3139] shadow-xs ${
                currentUser?.username === 'eve' ? 'bg-terracotta-700' : 'bg-[#181B20]'
              }`}
            >
              {currentUser?.avatar_text || currentUser?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                currentUser?.username === 'eve' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            ></span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-semibold text-[#181B20] truncate max-w-[140px]">
                {currentUser?.display_name || 'Quantum Node'}
              </h2>
              {isAdmin && (
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300">
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
        <div className="flex items-center space-x-1">
          {/* Admin Audit Ledger Button (Only visible if user has Admin privileges) */}
          {isAdmin && (
            <button
              onClick={onOpenAuditLedger}
              className="px-2.5 py-1.5 bg-[#EAE3DA] hover:bg-[#DDD5C8] text-[#181B20] border border-[#DDD5C8] rounded-lg transition font-mono text-[10px] font-bold flex items-center gap-1"
              title="Admin Quantum Audit Ledger (All Users' Messages)"
            >
              <span>⚛</span>
              <span className="hidden sm:inline">Ledger</span>
            </button>
          )}

          {/* New Chat Button */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 text-[#797167] hover:text-[#181B20] rounded-full hover:bg-[#EAE3DA] transition"
            title="New Quantum Chat / Register Node"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>

          {/* Logout / Switch User Button */}
          <button
            onClick={onLogout}
            className="p-2 text-[#797167] hover:text-red-700 rounded-full hover:bg-red-50 transition"
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
        <div className="relative flex items-center bg-[#FCFBF8] border border-[#DDD5C8] rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-black">
          <svg className="w-3.5 h-3.5 text-[#9C9488] shrink-0 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-[#181B20] focus:outline-none placeholder-[#9C9488]"
            placeholder="Search or start new quantum conversation..."
          />
        </div>

        {/* WhatsApp-style Quick Filter Pills */}
        <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-mono">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-2.5 py-0.5 rounded-full transition ${
              filterTab === 'ALL'
                ? 'bg-[#181B20] text-cream-100 font-semibold'
                : 'bg-[#EAE3DA] text-[#554F46] hover:bg-[#DDD5C8]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterTab('UNREAD')}
            className={`px-2.5 py-0.5 rounded-full transition flex items-center gap-1 ${
              filterTab === 'UNREAD'
                ? 'bg-terracotta-600 text-white font-semibold'
                : 'bg-[#EAE3DA] text-[#554F46] hover:bg-[#DDD5C8]'
            }`}
          >
            <span>Unread</span>
            {totalUnreadAll > 0 && (
              <span className="w-4 h-4 rounded-full bg-terracotta-700 text-white text-[9px] flex items-center justify-center font-bold">
                {totalUnreadAll}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab('VERIFIED')}
            className={`px-2.5 py-0.5 rounded-full transition ${
              filterTab === 'VERIFIED'
                ? 'bg-emerald-800 text-white font-semibold'
                : 'bg-[#EAE3DA] text-[#554F46] hover:bg-[#DDD5C8]'
            }`}
          >
            ✓ QDS Verified
          </button>
        </div>
      </div>

      {/* ── Contacts & Chats List (WhatsApp layout in Sentinel theme) ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#EAE3DA]">
        {filteredAndSortedContacts.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#8C8479]">
            No quantum conversations found. Click "+" to start a new chat.
          </div>
        ) : (
          filteredAndSortedContacts.map((contact) => {
            const isActive = activeContact?.username === contact.username;
            const lastMsg = latestMessages[contact.username];
            const unread = unreadCounts[contact.username] || 0;
            const isEve = contact.username === 'eve';
            const isFromMe = lastMsg?.sender?.toLowerCase() === currentUser?.username?.toLowerCase();

            return (
              <div
                key={contact.username}
                onClick={() => onSelectContact(contact)}
                className={`p-3.5 cursor-pointer transition-colors relative flex items-center gap-3 ${
                  isActive
                    ? 'bg-[#EAE3DA]/70 border-l-4 border-l-terracotta-600'
                    : unread > 0
                    ? 'bg-[#FCFBF8] hover:bg-[#EAE3DA]/50'
                    : 'hover:bg-[#EAE3DA]/40 bg-transparent'
                }`}
              >
                {/* Node Avatar */}
                <div className="relative shrink-0">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-xs text-cream-100 ${
                      isEve ? 'bg-terracotta-700' : 'bg-[#181B20]'
                    }`}
                  >
                    {contact.avatar_text || contact.username[0].toUpperCase()}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      isEve ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  ></span>
                </div>

                {/* Info & Last Message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className={`text-xs truncate ${
                        unread > 0 ? 'font-bold text-[#111317]' : 'font-semibold text-[#181B20]'
                      }`}
                    >
                      {contact.display_name}
                    </span>
                    <span
                      className={`font-mono text-[9px] shrink-0 ml-2 ${
                        unread > 0 ? 'text-terracotta-600 font-bold' : 'text-[#8C8479]'
                      }`}
                    >
                      {formatTime(lastMsg?.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs truncate">
                      {/* WhatsApp Delivery / Verification icon if message was sent by me */}
                      {isFromMe && lastMsg && (
                        <span
                          className={`text-xs ${
                            lastMsg.is_pending
                              ? 'text-[#8C8479]'
                              : lastMsg.is_pass
                              ? 'text-emerald-700 font-bold'
                              : 'text-red-600 font-bold'
                          }`}
                          title={lastMsg.is_pass ? 'Delivered & Quantum Verified' : 'Compromised'}
                        >
                          {lastMsg.is_pending ? '🕒' : lastMsg.is_pass ? '✓✓' : '⚠'}
                        </span>
                      )}

                      <p
                        className={`truncate font-sans max-w-[160px] ${
                          unread > 0 ? 'font-semibold text-[#181B20]' : 'text-[#554F46]'
                        }`}
                      >
                        {isFromMe ? 'You: ' : ''}
                        {lastMsg?.text || (lastMsg?.file_name ? `📎 ${lastMsg.file_name}` : contact.role || 'Ready for EPR handshake')}
                      </p>
                    </div>

                    {/* Right badge: Unread Counter or QDS Badge */}
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {unread > 0 ? (
                        <span className="min-w-4 h-4 px-1.5 rounded-full bg-emerald-600 text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
                          {unread}
                        </span>
                      ) : (
                        lastMsg && (
                          <span
                            className={`text-[8px] font-mono px-1 rounded ${
                              lastMsg.is_pass
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-red-50 text-red-800'
                            }`}
                          >
                            {lastMsg.is_pass ? '✓ QDS' : '❌ VIOLATION'}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Add Node Modal ── */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FCFBF8] border border-[#DDD4C5] rounded-2xl max-w-sm w-full shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#EAE3DA] pb-2">
              <h3 className="font-semibold text-sm text-[#181B20]">Register Quantum Node</h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-[#746D62] hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-[10px] text-[#554F46] mb-1">Username / Node ID</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. charlie, node_gamma"
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-lg p-2 font-mono text-xs focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#554F46] mb-1">Display Name</label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. Charlie Kovacs"
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-lg p-2 text-xs focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#554F46] mb-1">Role / Function</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-lg p-2 text-xs focus:ring-1 focus:ring-black font-mono"
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
                  onClick={() => setShowNewChatModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#DDD5C8] font-mono text-xs hover:bg-[#EAE3DA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="px-4 py-1.5 bg-[#181B20] text-white rounded-lg font-mono text-xs hover:bg-black font-semibold"
                >
                  {isRegistering ? 'Registering...' : 'Add Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
