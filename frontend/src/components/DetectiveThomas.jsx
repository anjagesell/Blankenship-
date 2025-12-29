import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Shield, Loader2, Minimize2, Maximize2 } from 'lucide-react';

const DetectiveThomas = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `🕵️ **Hello Truth Seeker!**

I'm **Detective Thomas**, and I'm here to help you navigate the Blankenship Archives and answer any questions you might have.

So go right ahead — ask me anything and I'll assist as I can. We can have a conversation about the case, the evidence, the timeline, or any specific documents you're looking for.

The true evidence in these physical documents shows that **Zachary is very much innocent**. Let's uncover the truth together.

*For Zachary, for Jacob, for Justice.* ⚖️💙`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/detective-thomas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          session_id: sessionId
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setSessionId(data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error('Detective Thomas error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🔍 I apologize, but I encountered an issue accessing the case files. Please try again in a moment.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '•')
      .replace(/\n/g, '<br/>');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] p-4 rounded-full shadow-2xl transition-all hover:scale-110"
        style={{
          background: 'linear-gradient(145deg, #1a3a52 0%, #0d1f2d 100%)',
          border: '3px solid #d4af37',
          boxShadow: '0 0 30px rgba(212,175,55,0.4)',
          animation: 'pulse 2s infinite',
        }}
        title="Ask Detective Thomas"
      >
        <div className="relative">
          <Shield className="w-8 h-8" style={{ color: '#d4af37' }} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
        </div>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-[9999] transition-all duration-300 ${
        isMinimized 
          ? 'bottom-6 right-6 w-72' 
          : 'bottom-6 right-6 w-96 sm:w-[450px]'
      }`}
      style={{
        maxHeight: isMinimized ? 'auto' : 'calc(100vh - 100px)',
      }}
    >
      <div
        className="rounded-xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          border: '2px solid #d4af37',
          boxShadow: '0 0 40px rgba(212,175,55,0.3)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between cursor-pointer"
          style={{
            background: 'linear-gradient(145deg, #2c2c4a 0%, #1a1a2e 100%)',
            borderBottom: '1px solid rgba(212,175,55,0.3)',
          }}
          onClick={() => isMinimized && setIsMinimized(false)}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'rgba(212,175,55,0.2)' }}
            >
              <Shield className="w-5 h-5" style={{ color: '#d4af37' }} />
            </div>
            <div>
              <h3
                className="font-bold text-lg"
                style={{ color: '#d4af37', fontFamily: 'Georgia, serif' }}
              >
                Detective Thomas
              </h3>
              {!isMinimized && (
                <p className="text-xs text-gray-400">Legal AI Investigator</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="p-1.5 rounded-lg transition-all hover:bg-white/10"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-gray-400" />
              ) : (
                <Minimize2 className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="p-1.5 rounded-lg transition-all hover:bg-white/10"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <>
            {/* Messages */}
            <div
              className="p-4 overflow-y-auto space-y-4"
              style={{ height: '400px' }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === 'user'
                        ? 'bg-blue-600'
                        : ''
                    }`}
                    style={msg.role === 'assistant' ? {
                      background: 'linear-gradient(145deg, #d4af37 0%, #b8962e 100%)'
                    } : {}}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Shield className="w-4 h-4 text-black" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-gray-200'
                    }`}
                    style={{
                      fontFamily: msg.role === 'assistant' ? 'Georgia, serif' : 'inherit',
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                      className="text-sm leading-relaxed"
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, #d4af37 0%, #b8962e 100%)'
                    }}
                  >
                    <Shield className="w-4 h-4 text-black" />
                  </div>
                  <div className="bg-white/10 px-4 py-3 rounded-xl">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="p-4"
              style={{ borderTop: '1px solid rgba(212,175,55,0.2)' }}
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about the case files..."
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-yellow-600/50 transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(145deg, #d4af37 0%, #b8962e 100%)',
                  }}
                >
                  <Send className="w-5 h-5 text-black" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                ⚖️ For Zachary, for Jacob, for Justice
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DetectiveThomas;
