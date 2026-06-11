import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function MessageInput({ onSendMessage, disabled }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-[#E8E0D4] bg-[#FFFCF8] px-6 py-4 shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end bg-white border border-[#DDD5C8] rounded-2xl shadow-sm focus-within:border-[#C4B8A5] focus-within:shadow-md transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? "Thinking..." : "Message ChatRAG..."}
            rows={1}
            className="flex-1 bg-transparent text-[#2D2A24] placeholder-[#B8AE9E] resize-none px-5 py-4 outline-none text-[15px] leading-relaxed max-h-40"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="m-2 p-2 bg-[#2D2A24] hover:bg-[#1A1815] disabled:bg-[#DDD5C8] text-white disabled:text-[#A89B86] rounded-xl transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-[#B8AE9E] text-center mt-2">
          ChatRAG can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
