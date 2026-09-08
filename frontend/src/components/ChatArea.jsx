import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ContactInfoModal from './ContactInfoModal';
import VoiceNoteRecorder from './VoiceNoteRecorder';
import VoiceNotePlayer from './VoiceNotePlayer';
import CodeSnippetRenderer from './CodeSnippetRenderer';
import { pinChatMessage, starChatMessage, deleteSingleChatMessage } from '../api';

export default function ChatArea({
  currentUser,
  activeContact,
  messages = [],
  onSendMessage,
  onClearHistory,
  onOpenSecurity,
  onOpenExport,
  onOpenPinnedDrawer,
  isSending = false,
  density = 'comfortable', // 'comfortable' | 'compact'
  jumpTarget = null,
}) {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]); // array of { name, type, size, data }
  const [fileError, setFileError] = useState('');
  const [injectAttack, setInjectAttack] = useState(false);

  // Advanced features states
  const [replyingTo, setReplyingTo] = useState(null); // { id, sender, text, file_name }
  const [ephemeralTTL, setEphemeralTTL] = useState(null); // null | 10 | 30 | 60 | 300 | 3600
  const [showTTLMenu, setShowTTLMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  // In-chat text search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);

  // Contact Info modal state
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);

  // In-UI Delete For All Nodes Modal state
  const [msgToDelete, setMsgToDelete] = useState(null);
  const [isClosingDeleteModal, setIsClosingDeleteModal] = useState(false);
  const [isDeletingMsg, setIsDeletingMsg] = useState(false);

  const handleOpenDeleteModal = (msg) => {
    setMsgToDelete(msg);
  };

  const handleCloseDeleteModal = useCallback(() => {
    if (isClosingDeleteModal) return;
    setIsClosingDeleteModal(true);
    setTimeout(() => {
      setIsClosingDeleteModal(false);
      setMsgToDelete(null);
      setIsDeletingMsg(false);
    }, 180);
  }, [isClosingDeleteModal]);

  const handleConfirmDelete = async () => {
    if (!msgToDelete || isDeletingMsg) return;
    setIsDeletingMsg(true);
    try {
      const targetId = typeof msgToDelete === 'object' ? msgToDelete.id : msgToDelete;
      await deleteSingleChatMessage(targetId);
      handleCloseDeleteModal();
    } catch (err) {
      console.error('Failed to delete message:', err);
      setIsDeletingMsg(false);
    }
  };

  // Ephemeral countdown state tracking for active messages
  const [ephemeralCountdowns, setEphemeralCountdowns] = useState({});

  // Scroll position & Jump tracking states
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);
  const messageRefs = useRef({});
  const isAtBottomRef = useRef(true);
  const isUserJumpingRef = useRef(false);
  const jumpTimerRef = useRef(null);
  const lastHandledJumpTargetRef = useRef(null);
  const highlightTimerRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const prevMessagesLenRef = useRef(messages.length);
  const activeContactRef = useRef(activeContact?.username);

  const MAX_MESSAGE_LENGTH = 2000;
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  // ── File Size and Download Helpers ──────────────────────────────────────────
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const downloadFile = (fileData, fileName, fileType) => {
    if (!fileData) return;
    try {
      const name = fileName || 'quantum_file';
      
      if (typeof fileData === 'string' && fileData.startsWith('data:')) {
        const parts = fileData.split(',');
        const header = parts[0];
        const base64Data = parts[1];
        const mimeMatch = header.match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : (fileType || 'application/octet-stream');
        
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } else if (typeof fileData === 'string' && (fileData.startsWith('http://') || fileData.startsWith('https://') || fileData.startsWith('/'))) {
        const link = document.createElement('a');
        link.href = fileData;
        link.download = name;
        link.target = '_blank';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const blob = new Blob([fileData], { type: fileType || 'text/plain' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }
    } catch (err) {
      console.error('File download failed, trying fallback:', err);
      try {
        const link = document.createElement('a');
        link.href = fileData;
        link.download = fileName || 'quantum_file';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackErr) {
        console.error('Fallback download failed:', fallbackErr);
      }
    }
  };

  // ── Jump to Message Functionality (Exactly 2.0s Lock & Highlight) ───────────
  const jumpToMessageById = useCallback((msgId) => {
    if (!msgId) return;
    const currentMsgs = messagesRef.current;
    const targetIdx = currentMsgs.findIndex((m) => String(m.id) === String(msgId));
    const targetEl = messageRefs.current[msgId] || (targetIdx >= 0 ? messageRefs.current[targetIdx] : null);
    if (targetEl) {
      isAtBottomRef.current = false;
      setShowScrollBottom(true);
      isUserJumpingRef.current = true;

      if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
      jumpTimerRef.current = setTimeout(() => {
        isUserJumpingRef.current = false;
      }, 2000); // Exactly 2 seconds

      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(msgId);

      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedMsgId((prev) => (prev === msgId ? null : prev));
      }, 2000); // Exactly 2 seconds
    }
  }, []);

  // Handle external jump target (Runs strictly ONCE per jump action)
  useEffect(() => {
    if (!jumpTarget?.id || !jumpTarget?.timestamp) return;
    if (lastHandledJumpTargetRef.current === jumpTarget.timestamp) return;
    lastHandledJumpTargetRef.current = jumpTarget.timestamp;

    const timer = setTimeout(() => {
      jumpToMessageById(jumpTarget.id);
    }, 60);
    return () => clearTimeout(timer);
  }, [jumpTarget, jumpToMessageById]);

  // ── Scroll Event & Bottom Detection ────────────────────────────────────────
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 60;
    isAtBottomRef.current = isNearBottom;
    setShowScrollBottom(!isNearBottom);
  };

  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      isAtBottomRef.current = true;
      setShowScrollBottom(false);
      isUserJumpingRef.current = false;
      if (smooth) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  };

  // ── Draft Persistence per Contact ──────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.username || !activeContact?.username) return;
    const draftKey = `qds_draft_${currentUser.username}_${activeContact.username}`;
    const savedDraft = localStorage.getItem(draftKey) || '';
    setInput(savedDraft);
  }, [currentUser?.username, activeContact?.username]);

  const handleInputChange = (val) => {
    setInput(val);
    if (currentUser?.username && activeContact?.username) {
      const draftKey = `qds_draft_${currentUser.username}_${activeContact.username}`;
      if (val) localStorage.setItem(draftKey, val);
      else localStorage.removeItem(draftKey);
    }
  };

  // ── Ephemeral Message Auto-Purge Timers ─────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updated = {};

      messages.forEach((msg) => {
        if (msg.expires_at) {
          const expiryTime = new Date(msg.expires_at).getTime();
          const remainingSec = Math.max(0, Math.ceil((expiryTime - now) / 1000));
          updated[msg.id] = remainingSec;

          // If expired just now, trigger background deletion
          if (remainingSec === 0 && !ephemeralCountdowns[`purged_${msg.id}`]) {
            ephemeralCountdowns[`purged_${msg.id}`] = true;
            deleteSingleChatMessage(msg.id).catch(() => {});
          }
        }
      });

      setEphemeralCountdowns((prev) => ({ ...prev, ...updated }));
    }, 1000);

    return () => clearInterval(timer);
  }, [messages]);

  // ── Search Match Computation ───────────────────────────────────────────────
  const matchingIndices = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results = [];
    messages.forEach((msg, idx) => {
      const textMatch = (msg.text || '').toLowerCase().includes(q);
      const fileMatch = (msg.file_name || '').toLowerCase().includes(q);
      if (textMatch || fileMatch) {
        results.push(idx);
      }
    });
    return results;
  }, [messages, searchQuery]);

  useEffect(() => {
    setCurrentMatchIdx(0);
  }, [searchQuery, activeContact?.username]);

  useEffect(() => {
    if (fileError) {
      const timer = setTimeout(() => setFileError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [fileError]);

  // Global Ctrl+F and Escape key listener
  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen((prev) => {
          const next = !prev;
          if (next) setTimeout(() => searchInputRef.current?.focus(), 60);
          return next;
        });
      } else if (e.key === 'Escape' || e.key === 'Esc') {
        if (msgToDelete) {
          e.preventDefault();
          handleCloseDeleteModal();
        } else if (showTTLMenu) {
          setShowTTLMenu(false);
        } else if (replyingTo) {
          setReplyingTo(null);
        } else if (isSearchOpen) {
          setIsSearchOpen(false);
          setSearchQuery('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [isSearchOpen, replyingTo, msgToDelete, showTTLMenu]);

  // Dedicated capture-phase Escape listener for Delete Modal
  useEffect(() => {
    if (!msgToDelete) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        handleCloseDeleteModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [msgToDelete]);

  // Scroll to bottom on initial contact switch
  useEffect(() => {
    if (activeContact?.username && activeContact.username !== activeContactRef.current) {
      activeContactRef.current = activeContact.username;
      isAtBottomRef.current = true;
      setShowScrollBottom(false);
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [activeContact?.username]);

  // Smart Auto-Scroll on Message updates (Strictly respects scroll-up and jump states)
  useEffect(() => {
    const prevLen = prevMessagesLenRef.current;
    const newLen = messages.length;
    prevMessagesLenRef.current = newLen;

    // If search is active, focus current search result
    if (isSearchOpen && matchingIndices.length > 0) {
      const activeMsgIdx = matchingIndices[currentMatchIdx];
      const targetEl = messageRefs.current[activeMsgIdx] || (messages[activeMsgIdx] ? messageRefs.current[messages[activeMsgIdx].id] : null);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (isSearchOpen) return;

    // If user is currently jumping or scrolled up reading past history, NEVER auto-scroll down
    if (isUserJumpingRef.current || !isAtBottomRef.current) {
      return;
    }

    // Auto-scroll ONLY if a new message was actually appended AND user was already at the bottom
    if (newLen > prevLen && isAtBottomRef.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages, isSearchOpen, matchingIndices, currentMatchIdx]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [activeContact?.username]);

  // ── Drag and Drop File Handlers ────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const processUploadedFiles = (files) => {
    const BLOCKED_EXTS = [
      '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.msi',
      '.com', '.scr', '.pif', '.hta', '.jar', '.reg', '.dll', '.wsf', '.cpl'
    ];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`File "${file.name}" exceeds 5MB limit.`);
        return;
      }

      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (BLOCKED_EXTS.includes(ext)) {
        setFileError(`File "${file.name}" blocked: Executable scripts forbidden.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            data: event.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files);
      e.target.value = '';
    }
  };

  // ── Message Submission ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && attachedFiles.length === 0) || isSending || trimmed.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    const payload = {
      text: trimmed,
      attachedFiles: [...attachedFiles],
      injectAttack,
      replyToId: replyingTo?.id || null,
      replyPreview: replyingTo ? `${replyingTo.sender}: ${replyingTo.text || replyingTo.file_name || 'attachment'}`.slice(0, 100) : null,
      ephemeralTTL: ephemeralTTL || null,
    };

    // Clear draft in localStorage
    if (currentUser?.username && activeContact?.username) {
      localStorage.removeItem(`qds_draft_${currentUser.username}_${activeContact.username}`);
    }

    setInput('');
    setAttachedFiles([]);
    setReplyingTo(null);

    // Simulate typing feedback on recipient node
    setIsPeerTyping(true);
    setTimeout(() => setIsPeerTyping(false), 2500);

    isAtBottomRef.current = true;
    setShowScrollBottom(false);
    isUserJumpingRef.current = false;
    setTimeout(() => scrollToBottom(true), 40);

    await onSendMessage(payload);
  };

  const handleSendVoiceNote = async (voiceData) => {
    isAtBottomRef.current = true;
    setShowScrollBottom(false);
    isUserJumpingRef.current = false;
    setTimeout(() => scrollToBottom(true), 40);

    await onSendMessage({
      text: '',
      attachedFiles: [
        {
          name: voiceData.fileName,
          type: voiceData.mimeType,
          size: voiceData.size,
          data: voiceData.audioData,
        },
      ],
      isAudio: true,
      injectAttack,
      replyToId: replyingTo?.id || null,
      ephemeralTTL: ephemeralTTL || null,
    });
    setIsRecordingVoice(false);
    setReplyingTo(null);
  };

  // ── Action Handlers ────────────────────────────────────────────────────────
  const handleTogglePin = async (msg) => {
    try {
      await pinChatMessage(msg.id, !msg.is_pinned);
      msg.is_pinned = !msg.is_pinned;
      // Trigger re-render
      setEphemeralCountdowns((prev) => ({ ...prev }));
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleToggleStar = async (msg) => {
    try {
      await starChatMessage(msg.id, !msg.is_starred);
      msg.is_starred = !msg.is_starred;
      setEphemeralCountdowns((prev) => ({ ...prev }));
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  const isSecureChannel = !injectAttack && activeContact?.username !== 'eve';
  const isEveContact = activeContact?.username === 'eve';

  const pinnedMessages = messages.filter((m) => m.is_pinned);

  if (!activeContact) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-[#FBF9F5] p-8 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-[#EAE3DA] flex items-center justify-center text-[#181B20] font-mono font-bold text-xl shadow-xs mb-4">
          QDS
        </div>
        <h2 className="text-base font-semibold text-[#181B20]">No Active Quantum Link Selected</h2>
        <p className="text-xs text-[#797167] max-w-sm mt-1.5 font-mono leading-relaxed">
          Select a verified quantum node from the sidebar to establish a photonic channel with Joint Bell State measurement signatures.
        </p>
      </main>
    );
  }

  return (
    <main
      className="flex-1 flex flex-col bg-[#FBF9F5] overflow-hidden select-none relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ── Drag and Drop Backdrop Overlay ── */}
      {isDragOver && (
        <div className="absolute inset-0 bg-[#181B20]/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center text-white border-2 border-dashed border-terracotta-400 m-3 rounded-2xl pointer-events-none shadcn-pop-in">
          <div className="w-16 h-16 rounded-2xl bg-terracotta-600/30 flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-terracotta-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-base font-bold font-mono">Drop Files to Quantum Sign & Encrypt</h3>
          <p className="text-xs font-mono text-[#DDD5C8] mt-1">Multi-file upload (max 5MB each)</p>
        </div>
      )}

      {/* ── Chat Header ── */}
      <div className="h-16 px-4 md:px-5 border-b border-[#EAE3DA] bg-[#FCFBF8] flex items-center justify-between shrink-0 shadow-xs">
        <div
          onClick={() => setIsContactInfoOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsContactInfoOpen(true); }}
          className="flex items-center space-x-3 cursor-pointer group p-1.5 -ml-1.5 rounded-xl hover:bg-[#F4EFEA] border border-transparent hover:border-[#E5DEC7] transition duration-150 min-w-0"
          title={`Click to view ${activeContact?.display_name || 'contact'} info & quantum channel details`}
        >
          <div className="relative shrink-0">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full text-cream-100 flex items-center justify-center font-mono font-bold text-sm group-hover:scale-105 group-hover:shadow-xs transition-all duration-150 ${
              isEveContact ? 'bg-terracotta-700' : 'bg-[#181B20]'
            }`}>
              {activeContact?.avatar_text || activeContact?.username?.[0]?.toUpperCase() || 'B'}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <h1 className="text-xs md:text-sm font-semibold text-[#111317] group-hover:text-terracotta-600 transition-colors truncate">
                {activeContact?.display_name || 'Select Contact'}
              </h1>
              <span className="text-[10px] font-mono text-[#6E665A] hidden sm:inline">@{activeContact?.username}</span>
            </div>
            <div className="flex items-center space-x-1.5 font-mono text-[10px] text-[#6E665A]">
              <span className="truncate">{activeContact?.role || '1550nm Quantum Optical Link'}</span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-1.5 md:space-x-2">
          {/* Saved Proofs & Pinned Button */}
          {onOpenPinnedDrawer && (
            <button
              onClick={onOpenPinnedDrawer}
              className="shadcn-btn p-2 rounded-full border border-transparent hover:bg-[#EAE3DA] hover:border-[#DDD5C8] text-[#797167] hover:text-[#181B20] transition relative"
              title="View Saved Proofs & Pinned Messages"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {pinnedMessages.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          )}

          {/* Export Transcript Button */}
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="shadcn-btn p-2 rounded-full border border-transparent hover:bg-[#EAE3DA] hover:border-[#DDD5C8] text-[#797167] hover:text-[#181B20] transition hidden sm:flex"
              title="Export Verifiable Transcript"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}

          {/* Text Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`shadcn-btn p-2 rounded-full border transition ${
              isSearchOpen
                ? 'bg-[#181B20] text-cream-100 border-[#181B20] shadow-xs'
                : 'text-[#797167] hover:text-[#181B20] hover:bg-[#EAE3DA] hover:border-[#DDD5C8] border-transparent'
            }`}
            title="Search conversation messages (Ctrl+F)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* MitM Attack Toggle */}
          <button
            onClick={() => setInjectAttack(!injectAttack)}
            className={`shadcn-btn flex items-center gap-1.5 px-2.5 md:px-3 py-1 rounded-full text-xs font-mono border transition ${
              injectAttack
                ? 'bg-terracotta-100 text-terracotta-800 border-terracotta-300 hover:bg-terracotta-200 font-semibold shadow-xs animate-pulse'
                : 'bg-[#F4EFEA] hover:bg-[#EAE3DA] text-[#554F46] hover:text-[#181B20] border-[#DDD5C8]'
            }`}
            title="Toggle Man-in-the-Middle intercept simulation"
          >
            <span className={`w-2 h-2 rounded-full ${injectAttack ? 'bg-terracotta-600' : 'bg-forest-600'}`}></span>
            <span className="hidden sm:inline">{injectAttack ? 'MitM Probe Active' : 'Normal Channel'}</span>
          </button>
        </div>
      </div>

      {/* ── Pinned Messages Top Banner ── */}
      {pinnedMessages.length > 0 && (
        <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-200/80 flex items-center justify-between text-xs font-sans text-amber-950">
          <div className="flex items-center gap-2 truncate">
            <svg className="w-3.5 h-3.5 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="font-semibold text-amber-900 shrink-0">Pinned ({pinnedMessages.length}):</span>
            <span className="truncate font-mono text-[11px] text-amber-900/80">
              {pinnedMessages[pinnedMessages.length - 1].text || pinnedMessages[pinnedMessages.length - 1].file_name}
            </span>
          </div>
          {onOpenPinnedDrawer && (
            <button
              onClick={onOpenPinnedDrawer}
              className="text-[10px] font-mono font-bold text-amber-800 hover:text-amber-950 underline shrink-0 ml-2"
            >
              View all
            </button>
          )}
        </div>
      )}

      {/* ── Messages Stream ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto chat-stream chat-wallpaper ${
          density === 'compact' ? 'p-3 md:p-4 space-y-3' : 'p-4 md:p-6 space-y-5'
        }`}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAE3DA] flex items-center justify-center text-[#181B20] font-mono font-bold shadow-xs">
              QDS
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#181B20]">Quantum Optical Channel Ready</h3>
              <p className="text-xs text-[#797167] max-w-sm mt-1">
                Messages sent between <strong>{currentUser?.display_name}</strong> and <strong>{activeContact?.display_name}</strong> are authenticated with Joint Bell State Measurements.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOutgoing = msg.sender?.toLowerCase() === currentUser?.username?.toLowerCase();
            const timeStr = msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Now';

            const passed = msg.is_pass ?? (msg.qds_status === 'VERIFIED');
            const remainingSec = ephemeralCountdowns[msg.id];
            const isHighlighted = highlightedMsgId === msg.id;

            return (
              <div
                key={msg.id || `${msg.sender}-${msg.timestamp}-${idx}`}
                ref={(el) => {
                  if (el) {
                    messageRefs.current[msg.id] = el;
                    messageRefs.current[idx] = el;
                  }
                }}
                className={`message-bubble group relative flex items-end gap-3 max-w-[88%] md:max-w-[72%] transition-all duration-300 ${
                  isOutgoing ? 'ml-auto flex-row-reverse' : 'mr-auto'
                } ${
                  isHighlighted ? 'ring-2 ring-terracotta-500 bg-terracotta-500/10 rounded-2xl p-1 scale-[1.01] shadow-md' : ''
                }`}
              >
                {/* Node Avatar */}
                <div
                  className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-mono text-[11px] font-semibold shrink-0 mb-1 shadow-xs select-none hover:scale-110 transition-transform ${
                    isOutgoing ? 'bg-terracotta-600' : 'bg-[#181B20]'
                  }`}
                  title={msg.sender}
                >
                  {msg.sender?.[0]?.toUpperCase() || 'U'}
                </div>

                {/* Bubble Container */}
                <div className={`flex flex-col min-w-0 max-w-full ${isOutgoing ? 'items-end' : 'items-start'}`}>
                  {/* Quoted Parent Message (if reply) */}
                  {msg.reply_preview && (
                    <div
                      onClick={() => msg.reply_to_id && jumpToMessageById(msg.reply_to_id)}
                      className={`text-[10px] font-mono px-3 py-1 mb-1 rounded-t-lg border-l-2 max-w-full truncate ${
                        msg.reply_to_id ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                      } ${
                        isOutgoing
                          ? 'bg-white/10 text-[#DDD5C8] border-terracotta-400'
                          : 'bg-[#EAE3DA] text-[#554F46] border-[#181B20]'
                      }`}
                      title={msg.reply_to_id ? "Click to jump to quoted message" : undefined}
                    >
                      <span className="font-bold mr-1">↳ Replying to:</span>
                      <span>{msg.reply_preview}</span>
                    </div>
                  )}

                  {/* Main Bubble Wrapper with perfectly anchored hover action bar */}
                  <div className="relative group/bubble w-fit max-w-full">
                    {/* Main Bubble */}
                    <div
                      className={`w-fit max-w-full px-4 py-2.5 rounded-2xl shadow-xs text-[13.5px] md:text-sm leading-relaxed tracking-[0.01em] break-words transition-all duration-200 relative ${
                        isOutgoing
                          ? 'bg-[#181B20] text-[#FBF9F5] rounded-br-sm hover:shadow-md'
                          : 'bg-[#FCFBF8] text-[#1F2228] border border-[#E0D7CC] hover:border-[#CCC2B2] rounded-bl-sm hover:shadow-md'
                      }`}
                    >
                      {/* Ephemeral Countdown Banner */}
                      {remainingSec !== undefined && remainingSec > 0 && (
                        <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-current/15 text-[10px] font-mono text-terracotta-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 animate-pulse" />
                          <span>Self-destructing in {remainingSec}s</span>
                        </div>
                      )}

                      {/* Audio Voice Note Player */}
                      {msg.is_audio && msg.file_data && (
                        <VoiceNotePlayer audioSrc={msg.file_data} isOutgoing={isOutgoing} />
                      )}

                      {/* Image Attachment Preview with Download */}
                      {msg.file_data && msg.file_type?.startsWith('image/') && !msg.is_audio && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-black/10 relative group/img bg-black/5">
                          <img
                            src={msg.file_data}
                            alt={msg.file_name || 'Quantum image'}
                            className="max-h-64 object-contain rounded-xl w-full"
                            loading="lazy"
                          />
                          <div className="p-2 bg-[#F7F4EF] dark:bg-[#181B20] border-t border-black/10 flex items-center justify-between text-xs font-mono">
                            <span className="truncate max-w-[160px] text-[#554F46]">{msg.file_name || 'Image'}</span>
                            <button
                              type="button"
                              onClick={() => downloadFile(msg.file_data, msg.file_name || 'quantum_image.png', msg.file_type || 'image/png')}
                              className="px-2.5 py-1 rounded bg-terracotta-600 hover:bg-terracotta-700 active:bg-terracotta-800 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs transition"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Document / File Attachment Card */}
                      {msg.file_data && !msg.file_type?.startsWith('image/') && !msg.is_audio && (
                        <div className={`p-3 rounded-xl border mb-2 flex items-center justify-between gap-3 text-xs font-mono shadow-xs transition-all ${
                          isOutgoing ? 'bg-white/10 border-white/20 text-white' : 'bg-[#F4EFEA] border-[#E0D7CC] text-[#181B20]'
                        }`}>
                          <div className="flex items-center gap-2.5 truncate">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isOutgoing ? 'bg-white/20 text-white' : 'bg-[#181B20] text-cream-100'
                            }`}>
                              {(msg.file_name || 'FILE').split('.').pop().toUpperCase().slice(0, 4)}
                            </div>
                            <div className="truncate">
                              <div className="truncate font-semibold text-[13px]">{msg.file_name || 'Document'}</div>
                              <div className={`text-[10px] ${isOutgoing ? 'text-white/70' : 'text-[#797167]'}`}>
                                {formatFileSize(msg.file_size) || (msg.file_type || 'Attachment')}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => downloadFile(msg.file_data, msg.file_name || 'quantum_file', msg.file_type)}
                            className="px-3 py-1.5 bg-terracotta-600 hover:bg-terracotta-700 active:bg-terracotta-800 text-white rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 shadow-xs transition transform hover:scale-105"
                            title="Download File"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download</span>
                          </button>
                        </div>
                      )}

                      {/* Rich Code Snippets & Text */}
                      {msg.text && (
                        <CodeSnippetRenderer text={msg.text} isOutgoing={isOutgoing} />
                      )}
                    </div>

                    {/* Hover Action Menu - Anchored snugly to the bubble */}
                    <div
                      className={`opacity-0 group-hover:opacity-100 group-hover/bubble:opacity-100 transition-all duration-150 flex items-center gap-0.5 bg-[#FCFBF8] border border-[#DDD5C8] rounded-lg p-0.5 shadow-sm absolute z-20 pointer-events-none group-hover:pointer-events-auto select-none ${
                        isOutgoing
                          ? 'right-full mr-1.5 top-1/2 -translate-y-1/2'
                          : 'left-full ml-1.5 top-1/2 -translate-y-1/2'
                      }`}
                    >
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="p-1 hover:bg-[#EAE3DA] rounded text-[#554F46] hover:text-[#181B20] transition-colors"
                        title="Reply"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleTogglePin(msg)}
                        className={`p-1 hover:bg-[#EAE3DA] rounded transition-colors ${msg.is_pinned ? 'text-amber-600' : 'text-[#554F46]'}`}
                        title={msg.is_pinned ? 'Unpin message' : 'Pin message'}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleStar(msg)}
                        className={`p-1 hover:bg-[#EAE3DA] rounded transition-colors ${msg.is_starred ? 'text-forest-600' : 'text-[#554F46]'}`}
                        title={msg.is_starred ? 'Unstar proof' : 'Star proof'}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                      {msg.text && (
                        <button
                          onClick={() => handleCopyText(msg.text)}
                          className="p-1 hover:bg-[#EAE3DA] rounded text-[#554F46] transition-colors"
                          title="Copy text"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                      {msg.file_data && (
                        <button
                          onClick={() => downloadFile(msg.file_data, msg.file_name, msg.file_type)}
                          className="p-1 hover:bg-[#EAE3DA] rounded text-[#554F46] hover:text-[#181B20] transition-colors"
                          title="Download attached file"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenDeleteModal(msg)}
                        className="p-1 hover:bg-terracotta-100 rounded text-terracotta-700 transition-colors"
                        title="Delete message for all nodes"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className={`mt-1.5 flex items-center gap-2 font-mono text-[10px] text-[#867E73] ${isOutgoing ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
                    <span>{timeStr}</span>
                    <button
                      onClick={() => onOpenSecurity && onOpenSecurity(msg)}
                      className={`cursor-pointer border px-1.5 py-0.5 rounded font-medium ${
                        passed
                          ? 'text-forest-800 bg-forest-50 border-forest-200 hover:bg-forest-100'
                          : 'text-terracotta-800 bg-terracotta-50 border-terracotta-200 hover:bg-terracotta-100'
                      }`}
                      title="Inspect quantum proofs"
                    >
                      {passed ? 'QDS VERIFIED' : 'VIOLATION'}
                    </button>
                    {msg.is_pinned && <span className="text-amber-700 font-bold">PINNED</span>}
                    {msg.is_starred && <span className="text-forest-700 font-bold">STARRED</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Dynamic Typing Indicator */}
        {isPeerTyping && (
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#797167] py-1 shadcn-slide-in">
            <span className="w-2 h-2 rounded-full bg-forest-600 animate-ping" />
            <span>Quantum node <strong>@{activeContact.username}</strong> is transmitting photon stream...</span>
          </div>
        )}
      </div>

      {/* Floating Jump to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-20 right-6 z-30 flex items-center gap-1.5 px-3.5 py-2 bg-[#181B20] text-[#FBF9F5] hover:bg-[#2D2A26] rounded-full shadow-lg border border-white/10 text-xs font-mono transition-all duration-200 hover:scale-105 group cursor-pointer shadcn-pop-in"
          title="Jump to latest message"
        >
          <svg className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span className="font-medium">Jump to latest</span>
        </button>
      )}

      {/* ── Active Reply Context Banner ── */}
      {replyingTo && (
        <div className="px-4 py-2 bg-[#F4EFEA] border-t border-[#EAE3DA] flex items-center justify-between text-xs font-mono text-[#554F46] shadcn-slide-in">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-[#181B20]">Replying to @{replyingTo.sender}:</span>
            <span className="truncate text-[#797167]">
              {replyingTo.text || replyingTo.file_name || '(Attachment)'}
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 hover:bg-[#EAE3DA] rounded text-[#797167] hover:text-[#181B20]"
            title="Cancel reply"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Input Bar ── */}
      <div className="p-3.5 border-t border-[#EAE3DA] bg-[#FCFBF8] relative">
        {fileError && (
          <div className="mb-2 p-2 bg-terracotta-50 border border-terracotta-200 rounded-xl text-xs font-mono text-terracotta-800 flex justify-between items-center">
            <span>{fileError}</span>
            <button onClick={() => setFileError('')} className="font-bold px-1">✕</button>
          </div>
        )}

        {/* Attached Files Previews */}
        {attachedFiles.length > 0 && (
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            {attachedFiles.map((file, fIdx) => (
              <div key={fIdx} className="p-1.5 px-2.5 rounded-lg bg-[#EAE3DA] text-[#181B20] text-xs font-mono flex items-center gap-2 border border-[#DDD5C8]">
                <span className="truncate max-w-[140px] font-medium">{file.name}</span>
                <span className="text-[10px] text-[#797167]">({(file.size / 1024).toFixed(1)}KB)</span>
                <button
                  type="button"
                  onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== fIdx))}
                  className="text-[#797167] hover:text-terracotta-700 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Voice Note Recorder Mode or Standard Text Input */}
        {isRecordingVoice ? (
          <VoiceNoteRecorder
            onFinish={handleSendVoiceNote}
            onCancel={() => setIsRecordingVoice(false)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            {/* Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-[#797167] hover:text-[#181B20] hover:bg-[#F4EFEA] border border-[#DDD5C8] transition shrink-0"
              title="Attach File(s) (Drag & Drop also supported)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            {/* Ephemeral Timer Selector Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTTLMenu(!showTTLMenu)}
                className={`p-2.5 rounded-xl border transition shrink-0 flex items-center gap-1 ${
                  ephemeralTTL
                    ? 'bg-terracotta-50 text-terracotta-800 border-terracotta-300 font-bold'
                    : 'text-[#797167] hover:text-[#181B20] hover:bg-[#F4EFEA] border-[#DDD5C8]'
                }`}
                title="Ephemeral Self-Destruct Timer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {ephemeralTTL && <span className="text-[10px] font-mono">{ephemeralTTL}s</span>}
              </button>

              {/* TTL Menu Dropdown */}
              {showTTLMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-44 bg-[#FCFBF8] border border-[#DDD5C8] rounded-xl shadow-xl p-1.5 z-40 text-xs font-mono space-y-1 shadcn-dialog-content">
                  <div className="px-2 py-1 text-[10px] font-bold text-[#797167] uppercase border-b border-[#EAE3DA]">
                    Self-Destruct Timer
                  </div>
                  {[
                    { label: 'Off (Standard)', value: null },
                    { label: '10 Seconds', value: 10 },
                    { label: '30 Seconds', value: 30 },
                    { label: '1 Minute', value: 60 },
                    { label: '5 Minutes', value: 300 },
                    { label: '1 Hour', value: 3600 },
                  ].map((opt) => (
                    <div
                      key={String(opt.value)}
                      onClick={() => {
                        setEphemeralTTL(opt.value);
                        setShowTTLMenu(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg cursor-pointer flex items-center justify-between ${
                        ephemeralTTL === opt.value
                          ? 'bg-[#181B20] text-cream-100 font-bold'
                          : 'hover:bg-[#F4EFEA] text-[#181B20]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {ephemeralTTL === opt.value && <span>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Note Button */}
            <button
              type="button"
              onClick={() => setIsRecordingVoice(true)}
              className="p-2.5 rounded-xl text-[#797167] hover:text-[#181B20] hover:bg-[#F4EFEA] border border-[#DDD5C8] transition shrink-0"
              title="Record Quantum Encrypted Voice Note"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </button>

            {/* Text Input */}
            <div className="flex-1 relative min-w-0">
              <input
                ref={inputRef}
                type="text"
                maxLength={MAX_MESSAGE_LENGTH}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={`Quantum message to ${activeContact?.display_name}... (Ctrl+K for commands)`}
                className="w-full bg-[#F4EFEA] border border-[#DDD5C8] hover:border-[#B5AA9A] rounded-xl px-4 py-2.5 text-xs font-sans focus:ring-1 focus:ring-black focus:border-black placeholder-[#9C9488] transition-all"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!input.trim() && attachedFiles.length === 0) || isSending}
              className="p-2.5 bg-terracotta-600 hover:bg-terracotta-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition hover:scale-105 active:scale-95 shrink-0"
              title="Send Quantum Signed Message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        )}
      </div>

      {/* Contact Info Modal */}
      <ContactInfoModal
        isOpen={isContactInfoOpen}
        onClose={() => setIsContactInfoOpen(false)}
        contact={activeContact}
        currentUser={currentUser}
        messagesCount={messages.length}
        latestMessage={messages[messages.length - 1]}
        onOpenSearch={() => {
          if (!isSearchOpen) {
            setIsSearchOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }
        }}
        onOpenSecurity={onOpenSecurity}
        onClearHistory={onClearHistory}
      />

      {/* ── In-UI Delete For All Nodes Modal ── */}
      {(msgToDelete || isClosingDeleteModal) && (
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none ${
            isClosingDeleteModal ? 'shadcn-dialog-overlay-closing' : 'shadcn-dialog-overlay'
          }`}
          onClick={handleCloseDeleteModal}
        >
          <div
            className={`bg-[#FCFBF8] border border-[#DDD4C5] rounded-2xl max-w-sm w-full shadow-2xl p-5 space-y-4 font-sans ${
              isClosingDeleteModal ? 'shadcn-dialog-content-closing' : 'shadcn-dialog-content'
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
                  <h3 className="font-semibold text-sm text-[#181B20]">Delete for all nodes?</h3>
                  <p className="text-[10px] font-mono text-[#746D62]">Permanent cryptographic purge</p>
                </div>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                className="shadcn-btn text-[#746D62] hover:text-black p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#554F46]">
              <p className="leading-relaxed">
                This message and its Bell-state measurement proof will be permanently deleted across all peer nodes in the quantum network.
              </p>
              {msgToDelete?.text && (
                <div className="p-2.5 rounded-lg bg-[#F4EFEA] border border-[#DDD5C8] font-mono text-[11px] text-[#332F2A] truncate italic max-h-16 overflow-hidden">
                  "{msgToDelete.text}"
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#EAE3DA]">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={isDeletingMsg}
                className="shadcn-btn px-3.5 py-1.5 rounded-lg border border-[#DDD5C8] font-mono text-xs hover:bg-[#EAE3DA] text-[#554F46]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingMsg}
                className="shadcn-btn px-4 py-1.5 bg-terracotta-700 hover:bg-terracotta-800 text-white rounded-lg font-mono text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                {isDeletingMsg ? 'Purging...' : 'Delete for All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
