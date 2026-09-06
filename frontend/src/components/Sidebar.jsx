import React, { useState } from 'react';

export default function Sidebar({
  currentUser,
  onSwitchUser,
  usersList = [],
  activeContact,
  onSelectContact,
  latestMessages = {},
  onRegisterUser
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState('Quantum Node');
  const [isRegistering, setIsRegistering] = useState(false);

  // Filter contacts by search query
  const contacts = usersList
    .filter(u => u.username !== currentUser?.username)
    .filter(u => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.display_name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      );
    });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setIsRegistering(true);
    try {
      await onRegisterUser({
        username: newUsername.trim().toLowerCase(),
        password: newUsername.trim().toLowerCase(),
        display_name: newDisplayName.trim() || newUsername.trim().capitalize(),
        role: newRole.trim() || 'Quantum Node'
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
    <aside className="w-[320px] md:w-[360px] border-r border-[#EAE3DA] bg-[#F7F4EF] flex flex-col shrink-0 select-none">
      {/* ── Sidebar Header: Active User & Switcher ── */}
      <div className="p-3.5 border-b border-[#EAE3DA] bg-[#FCFBF8] relative flex items-center justify-between">
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setShowUserMenu(!showUserMenu)}
          title="Click to switch active user account"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#181B20] text-cream-100 flex items-center justify-center font-mono font-bold text-xs tracking-wider border border-[#2D3139] group-hover:scale-105 transition shadow-sm">
              {currentUser?.avatar_text || 'U'}
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${currentUser?.username === 'eve' ? 'bg-amber-500' : 'bg-emerald-600'}`}></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-semibold text-[#181B20] group-hover:text-terracotta-600 transition truncate max-w-[140px]">
                {currentUser?.display_name || 'Anonymous Node'}
              </h2>
              <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-medium border ${
                currentUser?.username === 'eve'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {currentUser?.username === 'eve' ? 'ADVERSARY' : 'ONLINE'}
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#797167]">
              {currentUser?.node_id || '#0000'} · @{currentUser?.username} ▾
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            className="p-2 text-[#797167] hover:text-[#181B20] rounded-full hover:bg-[#EAE3DA] transition"
            title="New Quantum Chat / Add Node"
            onClick={() => setShowNewChatModal(true)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </button>
        </div>

        {/* ── User Switcher Dropdown Menu ── */}
        {showUserMenu && (
          <div className="absolute top-16 left-3.5 right-3.5 z-40 bg-[#FCFBF8] border border-[#DDD5C8] rounded-xl shadow-2xl p-2 font-sans animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 border-b border-[#EAE3DA] mb-1.5">
              <span className="text-[10px] font-mono uppercase text-[#797167] font-semibold">Switch Active Identity</span>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {usersList.map((user) => {
                const isCurrent = user.username === currentUser?.username;
                return (
                  <button
                    key={user.username}
                    onClick={() => {
                      onSwitchUser(user);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition text-xs ${
                      isCurrent
                        ? 'bg-terracotta-600 text-white font-semibold'
                        : 'hover:bg-[#EAE3DA] text-[#181B20]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-6 h-6 rounded-full bg-black/20 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                        {user.avatar_text || user.username[0].toUpperCase()}
                      </span>
                      <div className="truncate">
                        <div className="truncate">{user.display_name}</div>
                        <div className={`text-[9px] font-mono ${isCurrent ? 'text-white/80' : 'text-[#797167]'}`}>
                          @{user.username} · {user.role}
                        </div>
                      </div>
                    </div>
                    {isCurrent && <span className="text-[10px]">✓ Active</span>}
                  </button>
                );
              })}
            </div>
            <div className="pt-2 mt-1 border-t border-[#EAE3DA]">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  setShowNewChatModal(true);
                }}
                className="w-full text-center py-1.5 text-[11px] font-mono font-semibold text-terracotta-600 hover:bg-terracotta-50 rounded-lg transition"
              >
                + Register New Quantum Node
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Search Bar ── */}
      <div className="p-3 border-b border-[#EAE3DA] bg-[#F7F4EF]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FCFBF8] border border-[#DDD5C8] rounded-lg text-xs py-2 pl-8 pr-3 focus:ring-1 focus:ring-black focus:border-black font-sans placeholder-[#9C9488]"
            placeholder="Search secure node chats..."
          />
          <svg className="w-3.5 h-3.5 text-[#9C9488] absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      {/* ── Conversations List ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#EAE3DA]">
        {contacts.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-[#8C8479]">
            No other nodes found. Click "+" to register or search another user.
          </div>
        ) : (
          contacts.map((contact) => {
            const isActive = activeContact?.username === contact.username;
            const lastMsg = latestMessages[contact.username];
            const isEve = contact.username === 'eve';

            return (
              <div
                key={contact.username}
                onClick={() => onSelectContact(contact)}
                className={`p-3.5 cursor-pointer transition-colors relative ${
                  isActive
                    ? 'bg-[#EAE3DA]/70 border-l-4 border-l-terracotta-600'
                    : 'hover:bg-[#EAE3DA]/40 bg-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full text-cream-100 flex items-center justify-center font-mono text-xs font-semibold ${
                        isEve ? 'bg-terracotta-700' : 'bg-[#181B20]'
                      }`}>
                        {contact.avatar_text || contact.username[0].toUpperCase()}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        isEve ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}></span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-[#181B20] truncate">
                          {contact.display_name}
                        </span>
                        <span className={`text-[8px] font-mono px-1 rounded shrink-0 ${
                          isEve ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {isEve ? 'PROBE' : 'QDS'}
                        </span>
                      </div>
                      <p className="text-xs text-[#554F46] truncate font-sans mt-0.5 max-w-[190px]">
                        {lastMsg?.text || lastMsg?.file_name || contact.role || 'Ready for EPR handshake'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1 shrink-0 ml-2">
                    <span className="font-mono text-[9px] text-[#8C8479]">
                      {lastMsg?.timestamp ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                    </span>
                    {lastMsg && (
                      <span className={`text-[8px] font-mono px-1 rounded ${lastMsg.is_pass ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                        {lastMsg.is_pass ? '✓ QDS' : '❌ VIOLATION'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── New Chat / Add Node Modal ── */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FCFBF8] border border-[#DDD4C5] rounded-2xl max-w-sm w-full shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#EAE3DA] pb-2">
              <h3 className="font-semibold text-sm text-[#181B20]">Register Quantum Node</h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-[#746D62] hover:text-black">✕</button>
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
                  placeholder="e.g. Charlie (Relay Node)"
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-lg p-2 text-xs focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#554F46] mb-1">Role / Function</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-lg p-2 text-xs focus:ring-1 focus:ring-black"
                >
                  <option value="Signer Node">Signer Node (Alice Alpha)</option>
                  <option value="Verifier Node">Verifier Node (Bob Beta)</option>
                  <option value="Quantum Router">Quantum Router / Relay (QuARC)</option>
                  <option value="Arbitrator Hub">Arbitrator Authority</option>
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
                  {isRegistering ? 'Registering...' : 'Create & Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
