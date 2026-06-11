import React, { useState, useEffect, useCallback } from 'react';
import UploadSection from './components/UploadSection';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import { Sparkles, FileText, Trash2 } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [deletingDoc, setDeletingDoc] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/documents/list');
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  }, []);

  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(2, 15));
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSendMessage = async (text) => {
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: text
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to get response');
      }

      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleDeleteDocument = async (filename) => {
    setDeletingDoc(filename);
    try {
      const res = await fetch(`http://localhost:8000/api/documents/delete/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    } finally {
      setDeletingDoc(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Top Nav */}
      <header className="border-b border-[#DDD5C8] bg-[#FAF6F1] px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#D97706] p-1.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-[#2D2A24] tracking-tight">ChatRAG</span>
        </div>
        <span className="text-xs text-[#9C8E7C] font-medium bg-[#EDE7DD] px-3 py-1.5 rounded-full">
          Session {sessionId.substring(0, 6)}
        </span>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-72 border-r border-[#DDD5C8] bg-[#FAF6F1] p-4 hidden md:flex flex-col shrink-0 gap-5">
          <UploadSection onUploadComplete={fetchDocuments} />
          
          {/* Document List */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-[#9C8E7C] uppercase tracking-wider">
              Indexed Documents
            </h3>
            {documents.length === 0 ? (
              <p className="text-xs text-[#B8AE9E] italic">No documents uploaded yet.</p>
            ) : (
              <ul className="space-y-1">
                {documents.map((doc, idx) => (
                  <li 
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EDE7DD]/50 text-[#3D3929] text-sm group"
                  >
                    <FileText className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span className="truncate flex-1">{doc}</span>
                    <button
                      onClick={() => handleDeleteDocument(doc)}
                      disabled={deletingDoc === doc}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-[#B8AE9E] hover:text-red-500 transition-all disabled:opacity-50"
                      title={`Delete ${doc}`}
                    >
                      {deletingDoc === doc 
                        ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Chat Column */}
        <div className="flex-1 flex flex-col bg-[#FFFCF8]">
          <ChatArea messages={messages} isThinking={isThinking} />
          <MessageInput onSendMessage={handleSendMessage} disabled={isThinking} />
        </div>

      </div>
    </div>
  );
}
