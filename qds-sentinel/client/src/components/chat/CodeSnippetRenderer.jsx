import React, { useState } from 'react';

export default function CodeSnippetRenderer({ text = '', isOutgoing = false }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!text) return null;

  // Regex to split text by markdown code fences: ```lang\ncode\n```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let blockCounter = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    parts.push({
      type: 'code',
      lang: match[1] || 'plaintext',
      code: match[2].trimEnd(),
      id: blockCounter++,
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  // If no code blocks found, return standard text
  if (parts.length === 1 && parts[0].type === 'text') {
    return <div className="whitespace-pre-wrap break-words">{text}</div>;
  }

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedIdx(id);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  return (
    <div className="space-y-2 max-w-full overflow-hidden">
      {parts.map((part, idx) => {
        if (part.type === 'text') {
          return (
            <div key={idx} className="whitespace-pre-wrap break-words">
              {part.content}
            </div>
          );
        }

        const lines = part.code.split('\n');

        return (
          <div
            key={idx}
            className={`rounded-xl border overflow-hidden my-1.5 font-mono text-xs shadow-xs ${
              isOutgoing
                ? 'bg-[#0B0D11] border-white/20 text-[#E2E8F0]'
                : 'bg-[#181B20] border-[#2D3139] text-[#F0F6FC]'
            }`}
          >
            {/* Code Block Header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-white/10 text-[10px] text-[#8B949E]">
              <span className="uppercase tracking-wider font-semibold text-terracotta-400">
                {part.lang || 'code'}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(part.code, part.id)}
                className="shadcn-btn flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition"
              >
                {copiedIdx === part.id ? (
                  <span className="text-forest-400 font-semibold">Copied!</span>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body with Line Numbers */}
            <div className="p-3 overflow-x-auto select-text leading-relaxed">
              <table className="border-collapse w-full">
                <tbody>
                  {lines.map((line, lIdx) => (
                    <tr key={lIdx} className="hover:bg-white/5 transition-colors">
                      <td className="pr-3 text-right text-[#555E6C] select-none text-[10px] w-6 align-top">
                        {lIdx + 1}
                      </td>
                      <td className="whitespace-pre break-all pl-1 text-[#E2E8F0] font-mono text-[11px]">
                        {line || ' '}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
