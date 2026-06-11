import React, { useEffect, useRef } from 'react';
import { Sparkles, User } from 'lucide-react';

export default function ChatArea({ messages, isThinking }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex-1 overflow-y-auto claude-scroll">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        
        {messages.length === 0 ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#EDE7DD] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[#D97706]" />
            </div>
            <h2 className="text-xl font-semibold text-[#2D2A24]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              How can I help you today?
            </h2>
            <p className="text-sm text-[#9C8E7C] text-center max-w-md">
              Upload a document in the sidebar, then ask me anything about its contents.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* AI Avatar */}
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#D97706] flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              
              {/* Message */}
              <div className={`max-w-[75%] ${
                msg.role === 'user' 
                  ? 'bg-[#EDE7DD] text-[#2D2A24] rounded-2xl rounded-br-md px-5 py-3' 
                  : 'text-[#3D3929]'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.text}</p>
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#8B7E6A] flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#D97706] flex items-center justify-center shrink-0 mt-1">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="pt-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#C4B8A5] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#C4B8A5] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#C4B8A5] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}
