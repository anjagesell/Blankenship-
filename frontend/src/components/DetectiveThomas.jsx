import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Shield, Loader2, Minimize2, Maximize2 } from 'lucide-react';

const DetectiveThomas = ({ onClose }) => {
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
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          border: '2px solid #00ff88',
          boxShadow: '0 0 60px rgba(0,255,136,0.3)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-4 border-b"
          style={{
            background: 'linear-gradient(145deg, #2c2c4a 0%, #1a1a2e 100%)',
            borderColor: 'rgba(0,255,136,0.3)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(0,255,136,0.2)' }}
              >
                <Shield className="w-6 h-6" style={{ color: '#00ff88' }} />
              </div>
              <div>
                <h3
                  className="font-bold text-xl"
                  style={{ color: '#00ff88', fontFamily: 'Georgia, serif' }}
                >
                  🕵️ PI Thomas
                </h3>
                <p className="text-xs text-gray-400">AI Legal Investigator — Ask me anything</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-all hover:scale-110"
              style={{ background: 'rgba(0,255,136,0.2)' }}
            >
              <X className="w-6 h-6" style={{ color: '#00ff88' }} />
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
