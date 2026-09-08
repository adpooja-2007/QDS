import React, { useState, useEffect, useRef } from 'react';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  contacts = [],
  onSelectContact,
  onToggleTheme,
  currentTheme,
  onToggleDensity,
  currentDensity,
  onToggleMitM,
  isMitMActive,
  onOpenSearch,
  onOpenExport,
  onOpenPinnedDrawer,
  onOpenAuditLedger,
  onClearHistory,
  isAdmin = false,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build command list
  const commands = [
    // Contacts
    ...contacts.map((c) => ({
      category: 'Contacts',
      id: `contact-${c.username}`,
      title: `Chat with ${c.display_name}`,
      subtitle: `@${c.username} · ${c.role || 'Quantum Node'}`,
      action: () => onSelectContact(c),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    })),

    // Themes
    {
      category: 'Preferences',
      id: 'theme-light',
      title: 'Theme: Cream Sentinel (Light)',
      subtitle: currentTheme === 'light' ? 'Currently active' : 'Switch to warm cream palette',
      action: () => onToggleTheme('light'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      category: 'Preferences',
      id: 'theme-dark',
      title: 'Theme: Obsidian Quantum (Dark)',
      subtitle: currentTheme === 'dark' ? 'Currently active' : 'Switch to deep dark obsidian mode',
      action: () => onToggleTheme('dark'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      category: 'Preferences',
      id: 'theme-terminal',
      title: 'Theme: High-Contrast Phosphor Terminal',
      subtitle: currentTheme === 'terminal' ? 'Currently active' : 'Switch to quantum matrix green on pure black',
      action: () => onToggleTheme('terminal'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      category: 'Preferences',
      id: 'toggle-density',
      title: `Toggle Message Density: ${currentDensity === 'compact' ? 'Switch to Comfortable' : 'Switch to Compact Monospace'}`,
      subtitle: `Current mode: ${currentDensity}`,
      action: onToggleDensity,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },

    // Quantum Security & Tools
    {
      category: 'Quantum Tools',
      id: 'toggle-mitm',
      title: isMitMActive ? 'Disable Man-in-the-Middle Probe (Normal Channel)' : 'Engage Man-in-the-Middle Probe (Eve Intercept)',
      subtitle: 'Simulate photon beam-splitting attack on current channel',
      action: onToggleMitM,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      category: 'Quantum Tools',
      id: 'open-search',
      title: 'Search In-Chat Conversation Messages',
      subtitle: 'Jump to message query search bar (Ctrl+F)',
      action: onOpenSearch,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      category: 'Quantum Tools',
      id: 'open-pinned',
      title: 'View Saved Proofs & Pinned Messages',
      subtitle: 'Open drawer of pinned instructions & starred quantum proofs',
      action: onOpenPinnedDrawer,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
    },
    {
      category: 'Quantum Tools',
      id: 'export-transcript',
      title: 'Export Verified Conversation Transcript',
      subtitle: 'Download SHA-256 sealed JSON audit bundle & printable certificate',
      action: onOpenExport,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    ...(isAdmin ? [{
      category: 'Admin',
      id: 'admin-ledger',
      title: 'Open Global Quantum Audit Ledger',
      subtitle: 'Inspect all cross-node photon distribution logs (Admin only)',
      action: onOpenAuditLedger,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    }] : []),
    {
      category: 'Actions',
      id: 'clear-chat',
      title: 'Clear Current Conversation History',
      subtitle: 'Purge local and server quantum message records for active contact',
      action: onClearHistory,
      icon: (
        <svg className="w-4 h-4 text-terracotta-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
  ];

  // Filter commands
  const filtered = commands.filter((c) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = (callback) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      if (typeof callback === 'function') callback();
    }, 180);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filtered[selectedIndex];
      if (selected && selected.action) {
        handleClose(selected.action);
      }
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4 select-none ${
        isClosing ? 'shadcn-dialog-overlay-closing' : 'shadcn-dialog-overlay'
      }`}
      onClick={() => handleClose()}
    >
      <div
        className={`bg-[#FCFBF8] border border-[#DDD4C5] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col font-sans ${
          isClosing ? 'shadcn-dialog-content-closing' : 'shadcn-dialog-content'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="p-3.5 border-b border-[#EAE3DA] bg-[#F7F3EC] flex items-center gap-3">
          <svg className="w-5 h-5 text-[#797167]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search contacts... (Arrow keys to navigate, Esc to close)"
            className="flex-1 bg-transparent border-none text-sm text-[#181B20] placeholder-[#8B8477] focus:outline-none focus:ring-0 font-sans"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-[#EAE3DA] text-[#6E665A] rounded border border-[#DDD5C8]">
            ESC
          </kbd>
        </div>

        {/* Command Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#797167]">
              No commands or contacts found for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onClose();
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? 'bg-[#181B20] text-cream-100 shadow-xs'
                      : 'hover:bg-[#F4EFEA] text-[#181B20]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/10 text-white' : 'bg-[#EAE3DA] text-[#554F46]'
                    }`}
                  >
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate">{item.title}</div>
                    <div
                      className={`text-[10px] font-mono truncate ${
                        isSelected ? 'text-cream-100/70' : 'text-[#797167]'
                      }`}
                    >
                      {item.subtitle}
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-white/10 text-cream-100'
                        : 'bg-[#EAE3DA] text-[#6E665A]'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 border-t border-[#EAE3DA] bg-[#F7F3EC] flex items-center justify-between text-[10px] font-mono text-[#797167]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span className="hidden sm:inline">QDS Command Palette</span>
        </div>
      </div>
    </div>
  );
}
