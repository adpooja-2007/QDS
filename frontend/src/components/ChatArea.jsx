import React, { useState, useRef, useEffect } from 'react';

export default function ChatArea({
  currentUser,
  activeContact,
  messages = [],
  onSendMessage,
  onClearHistory,
  onOpenSecurity,
  isSending = false
}) {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null); // { name, type, size, data }
  const [injectAttack, setInjectAttack] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit for quantum transmission.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data: event.target?.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedFile) || isSending) return;

    const textToSend = input.trim();
    const fileToSend = attachedFile;

    setInput('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    await onSendMessage({
      text: textToSend,
      file_name: fileToSend?.name,
      file_type: fileToSend?.type,
      file_size: fileToSend?.size,
      file_data: fileToSend?.data,
      inject_attack: injectAttack
    });
  };

  const isEveContact = activeContact?.username === 'eve';
  const latestMessage = messages[messages.length - 1];
  const isSecureChannel = latestMessage ? latestMessage.is_pass : !isEveContact && !injectAttack;

  return (
    <main className="flex-1 flex flex-col bg-[#FBF9F5] overflow-hidden select-none">
      {/* ── Chat Header ── */}
      <div className="h-16 px-5 border-b border-[#EAE3DA] bg-[#FCFBF8] flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center space-x-3.5 cursor-pointer">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full text-cream-100 flex items-center justify-center font-mono font-bold text-sm ${
              isEveContact ? 'bg-terracotta-700' : 'bg-[#181B20]'
            }`}>
              {activeContact?.avatar_text || activeContact?.username?.[0]?.toUpperCase() || 'B'}
            </div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
              isEveContact ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-semibold text-[#111317]">{activeContact?.display_name || 'Select Contact'}</h1>
              <span className="text-[10px] font-mono text-[#6E665A]">@{activeContact?.username}</span>
            </div>
            <div className="flex items-center space-x-1.5 font-mono text-[10px] text-[#6E665A]">
              <span className={`w-1.5 h-1.5 rounded-full ${isSecureChannel ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
              <span>{activeContact?.role || '1550nm Quantum Optical Link'}</span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2.5">
          {/* MitM Attack Toggle */}
          <button
            onClick={() => setInjectAttack(!injectAttack)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition border ${
              injectAttack
                ? 'bg-red-100 text-red-800 border-red-300 font-semibold shadow-xs animate-pulse'
                : 'bg-[#F4EFEA] hover:bg-[#EAE3DA] text-[#554F46] border-[#DDD5C8]'
            }`}
            title="Toggle Man-in-the-Middle intercept simulation"
          >
            <span>{injectAttack ? '⚔️ MitM Attack Active' : '🛡️ Normal Channel'}</span>
          </button>

          {/* Security Status Badge */}
          <button
            onClick={() => onOpenSecurity(latestMessage)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition shadow-xs border ${
              isSecureChannel
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-red-50 hover:bg-red-100 text-red-800 border-red-200'
            }`}
            title="Click to inspect QDS Hoeffding & CHSH proofs"
          >
            <span className={`w-2 h-2 rounded-full ${isSecureChannel ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            <span className="font-semibold">{isSecureChannel ? 'Secure E2EE (QDS)' : 'COMPROMISED'}</span>
          </button>

          {/* Clear History */}
          <button
            onClick={onClearHistory}
            className="p-2 text-[#797167] hover:text-red-700 rounded-full hover:bg-red-50 transition"
            title="Clear conversation history"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>

      {/* ── MitM Alert Banner if attack is active ── */}
      {injectAttack && (
        <div className="bg-red-500 text-white px-4 py-2 text-xs font-mono flex items-center justify-between shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span><strong>ADVERSARY SIMULATION ENGAGED:</strong> Beam-splitter probe is intercepting photons on channel ({currentUser?.username} ↔ {activeContact?.username}). QBER will exceed 5.5% cutoff.</span>
          </div>
          <button onClick={() => setInjectAttack(false)} className="underline hover:no-underline font-bold">Disable</button>
        </div>
      )}

      {/* ── Messages Stream ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-[#FBF9F5] to-[#F7F4EF]"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#EAE3DA] flex items-center justify-center text-2xl font-mono">
              ⚛
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#181B20]">Quantum Optical Channel Ready</h3>
              <p className="text-xs text-[#797167] max-w-sm mt-1">
                Messages sent between <strong>{currentUser?.display_name}</strong> and <strong>{activeContact?.display_name}</strong> are authenticated with Joint Bell State Measurements and protected against forgery.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-mono">
              ✓ Hoeffding Audit Gate Active · CHSH S ≥ 2.0
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOutgoing = msg.sender?.toLowerCase() === currentUser?.username?.toLowerCase();
            const timeStr = msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Now';

            const passed = msg.is_pass ?? (msg.qds_status === 'VERIFIED');

            return (
              <div
                key={msg.id || `${msg.sender}-${msg.timestamp}`}
                className={`flex items-end space-x-2 max-w-xl ${isOutgoing ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-mono text-xs font-semibold shrink-0 mb-1 ${
                  isOutgoing ? 'bg-terracotta-600' : 'bg-[#181B20]'
                }`}>
                  {msg.sender?.[0]?.toUpperCase() || 'U'}
                </div>

                {/* Bubble Container */}
                <div className={`space-y-1 ${isOutgoing ? 'text-right' : 'text-left'}`}>
                  <div className={`p-3.5 rounded-2xl shadow-xs text-sm leading-relaxed ${
                    isOutgoing
                      ? 'bg-[#181B20] text-[#FBF9F5] rounded-br-none'
                      : 'bg-[#FCFBF8] text-[#1F2228] border border-[#E0D7CC] rounded-bl-none'
                  }`}>
                    {/* Image Attachment Preview */}
                    {msg.file_data && msg.file_type?.startsWith('image/') && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-black/10">
                        <img
                          src={msg.file_data}
                          alt={msg.file_name || 'Quantum signed image'}
                          className="max-h-64 object-contain rounded-lg w-full bg-black/5"
                        />
                      </div>
                    )}

                    {/* File Attachment Card */}
                    {msg.file_data && !msg.file_type?.startsWith('image/') && (
                      <div className={`p-2.5 rounded-lg border mb-2 flex items-center justify-between gap-3 text-xs font-mono ${
                        isOutgoing ? 'bg-white/10 border-white/20 text-white' : 'bg-[#F4EFEA] border-[#E5DEC7] text-[#181B20]'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base">📄</span>
                          <div className="truncate">
                            <div className="font-semibold truncate">{msg.file_name || 'Document'}</div>
                            <div className="text-[9px] opacity-75">{msg.file_size ? `${(msg.file_size / 1024).toFixed(1)} KB` : 'Attached file'}</div>
                          </div>
                        </div>
                        <a
                          href={msg.file_data}
                          download={msg.file_name || 'quantum_document'}
                          className="px-2 py-1 bg-terracotta-600 text-white rounded text-[10px] font-semibold hover:bg-terracotta-700 shrink-0"
                        >
                          Download
                        </a>
                      </div>
                    )}

                    {/* Text Message */}
                    {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}
                  </div>

                  {/* Message Metadata & Quantum Audit Tag */}
                  <div className={`flex items-center gap-2 font-mono text-[10px] text-[#867E73] ${isOutgoing ? 'justify-end pr-1' : 'pl-1'}`}>
                    <span>{timeStr}</span>
                    <button
                      onClick={() => onOpenSecurity(msg)}
                      className={`cursor-pointer border px-1.5 py-0.5 rounded transition ${
                        passed
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          : 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
                      }`}
                      title="Click to view quantum audit proofs"
                    >
                      {passed ? '✓ QDS Verified' : '❌ Violation'}
                    </button>
                    {msg.qber_percentage !== undefined && (
                      <span className="text-[9px] opacity-75">QBER: {msg.qber_percentage.toFixed(1)}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Sending State Spinner */}
        {isSending && (
          <div className="flex items-end space-x-2 max-w-xl ml-auto flex-row-reverse space-x-reverse">
            <div className="w-7 h-7 rounded-full bg-terracotta-600 text-white flex items-center justify-center font-mono text-xs font-semibold shrink-0 mb-1">
              {currentUser?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="space-y-1 text-right">
              <div className="bg-[#181B20] text-[#FBF9F5] p-3 rounded-2xl rounded-br-none shadow-xs text-xs font-mono animate-pulse flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
                <span>Pumping Bell pairs & executing 6-stage QDS verification...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Input Bar ── */}
      <div className="p-3.5 border-t border-[#EAE3DA] bg-[#FCFBF8]">
        {/* Pending File Attachment Preview */}
        {attachedFile && (
          <div className="mb-2 p-2 bg-[#F4EFEA] border border-[#DDD5C8] rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 truncate">
              <span>📎</span>
              <span className="font-semibold truncate">{attachedFile.name}</span>
              <span className="text-[10px] text-[#797167]">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              onClick={() => {
                setAttachedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1 hover:bg-red-50 text-red-600 rounded-full font-bold"
              title="Remove attachment"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center space-x-2">
          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf,text/plain,.json"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-[#797167] hover:text-[#181B20] rounded-xl hover:bg-[#EAE3DA] transition border border-transparent hover:border-[#DDD5C8]"
            title="Attach File or Image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${activeContact?.display_name || 'node'} (authenticated via QDS)...`}
            className="flex-1 bg-[#F4EFEA] border border-[#DDD5C8] rounded-xl px-4 py-2.5 text-xs font-sans focus:ring-1 focus:ring-black focus:border-black placeholder-[#9C9488]"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!input.trim() && !attachedFile) || isSending}
            className="p-2.5 bg-terracotta-600 hover:bg-terracotta-700 disabled:opacity-50 disabled:hover:bg-terracotta-600 text-white rounded-xl transition shadow-xs flex items-center justify-center shrink-0"
            title="Send Quantum Message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </form>
      </div>
    </main>
  );
}
