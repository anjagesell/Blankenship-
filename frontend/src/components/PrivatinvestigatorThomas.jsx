import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Trash2, Loader2, UserRound } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PrivatinvestigatorThomas = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => {
    const stored = sessionStorage.getItem('thomas_session_id');
    if (stored) return stored;
    const newId = `thomas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('thomas_session_id', newId);
    return newId;
  });
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  // Scroll to bottom within the messages container only (not the whole page)
  useEffect(() => {
    if (messagesContainerRef.current) {
      // Scroll within the container, not the page
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const loadHistory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/thomas/history/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.history && data.history.length > 0) {
          setMessages(data.history);
        } else {
          // Add welcome message - judicial style
          setMessages([{
            role: 'assistant',
            content: "I'm here to assist you in answering your questions regarding this case file.\n\nNeed help navigating? Just ask.\n\nNeed help locating something specific — a name, a time, a circumstance, or even a phrase? Be my guest.\n\nGive it a try: I'm here to be of help to you.\n\n— Privatinvestigator Thomas"
          }]);
        }
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      setMessages([{
        role: 'assistant',
        content: "I'm here to assist you in answering your questions regarding this case file.\n\nNeed help navigating? Just ask.\n\nGive it a try: I'm here to be of help to you.\n\n— Privatinvestigator Thomas"
      }]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/thomas/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, session_id: sessionId })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." 
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/thomas/history/${sessionId}`, { method: 'DELETE' });
      setMessages([{
        role: 'assistant',
        content: "Conversation cleared. How may I assist you with the archives?"
      }]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Chat Toggle Button - Stationary, Above Files */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105 flex items-center gap-3 mb-4"
        style={{
          background: 'linear-gradient(145deg, #2c3e50 0%, #1a252f 100%)',
          border: '3px solid #d4af37',
          boxShadow: isOpen 
            ? '0 4px 20px rgba(212, 175, 55, 0.6)' 
            : '0 4px 25px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3)',
          animation: isOpen ? 'none' : 'pulse-gold 2s infinite',
        }}
        title="Chat with Privatinvestigator Thomas"
      >
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)',
            border: '2px solid #8b6914',
          }}
        >
          <span className="text-2xl">🕵️‍♂️</span>
        </div>
        <span 
          className="font-bold text-sm hidden sm:block"
          style={{ color: '#d4af37', fontFamily: 'Georgia, serif' }}
        >
          Privatinvestigator Thomas
        </span>
        {isOpen ? (
          <X className="w-5 h-5" style={{ color: '#d4af37' }} />
        ) : (
          <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(212,175,55,0.2)', color: '#d4af37' }}>
            Ask Me
          </span>
        )}
      </button>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 4px 25px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3); }
          50% { box-shadow: 0 4px 30px rgba(212, 175, 55, 0.8), 0 0 50px rgba(212, 175, 55, 0.5); }
        }
      `}</style>

      {/* Chat Window - Stationary, Below Button */}
      {isOpen && (
        <div 
          className="w-80 sm:w-96 rounded-lg shadow-2xl overflow-hidden mb-4"
          style={{
            background: 'linear-gradient(145deg, #0a0a12 0%, #1a1a2e 100%)',
            border: '3px solid #d4af37',
            maxHeight: '60vh',
          }}
        >
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between"
            style={{
              background: 'linear-gradient(180deg, #1a0f0a 0%, #2c3e50 100%)',
              borderBottom: '2px solid #d4af37',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)',
                  border: '2px solid #8b6914',
                }}
              >
                <span className="text-xl">🕵️‍♂️</span>
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ color: '#d4af37', fontFamily: 'Georgia, serif' }}>
                  Privatinvestigator Thomas
                </h3>
                <p className="text-xs" style={{ color: '#888' }}>Case File Assistant</p>
              </div>
            </div>
            <button 
              onClick={clearHistory}
              className="p-2 rounded hover:bg-white/10 transition-colors"
              style={{ color: '#888' }}
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="p-4 space-y-4 overflow-y-auto"
            style={{ maxHeight: '45vh', minHeight: '200px' }}
          >
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-3 rounded-lg text-sm ${
                    msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                  style={{
                    background: msg.role === 'user' 
                      ? 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)' 
                      : 'rgba(255,255,255,0.1)',
                    color: msg.role === 'user' ? '#1a0f0a' : '#e0e0e0',
                    border: msg.role === 'user' ? 'none' : '1px solid #333',
                  }}
                >
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div 
                  className="p-3 rounded-lg rounded-bl-none"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #333' }}
                >
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#d4af37' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form 
            onSubmit={sendMessage}
            className="p-3 flex gap-2"
            style={{ borderTop: '2px solid #333', background: 'rgba(0,0,0,0.3)' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the case..."
              className="flex-1 px-4 py-2 rounded text-sm"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid #555',
                color: '#fff',
                outline: 'none',
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: 'linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%)',
                color: '#1a0f0a',
              }}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PrivatinvestigatorThomas;
