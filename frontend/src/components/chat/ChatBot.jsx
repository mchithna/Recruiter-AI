import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, History, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatApi } from '../../lib/chatApi';
import { supabase } from '../../supabaseClient';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'AI', content: 'Hello! I am your AI Recruitment Assistant. How can I help you today?', sentAt: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuth(!!session);
      if (session) {
        fetchSessions();
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuth(!!session);
      if (session) {
        fetchSessions();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      const data = await chatApi.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      setIsLoading(true);
      const sessionData = await chatApi.getSession(sessionId);
      setCurrentSessionId(sessionId);
      
      if (sessionData.messages && sessionData.messages.length > 0) {
        setMessages(sessionData.messages);
      } else {
        setMessages([{ role: 'AI', content: 'Session loaded. How can I help you?', sentAt: new Date().toISOString() }]);
      }
      
      setShowHistory(false);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([
      { role: 'AI', content: 'Hello! I am your AI Recruitment Assistant. How can I help you today?', sentAt: new Date().toISOString() }
    ]);
    setShowHistory(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !isAuth) return;

    const userMsg = input.trim();
    setInput('');
    
    // Optimistic UI update
    const newMessages = [
      ...messages,
      { role: 'User', content: userMsg, sentAt: new Date().toISOString() }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(userMsg, currentSessionId);
      
      // Update session ID if it was a new session
      if (!currentSessionId && response.sessionId) {
        setCurrentSessionId(response.sessionId);
        fetchSessions(); // Refresh history list
      }

      setMessages(prev => [
        ...prev,
        {
          role: response.role,
          content: response.content,
          sentAt: response.sentAt
        }
      ]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'AI', content: 'Sorry, I encountered an error. Please try again.', sentAt: new Date().toISOString() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  if (!isAuth) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full sm:w-[400px] h-[600px] max-h-[85vh] border border-gray-100 overflow-hidden transform transition-all">
          {/* Header */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <h3 className="font-semibold tracking-wide">Recruit AI</h3>
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="p-1.5 rounded-md hover:bg-indigo-500 transition-colors"
                title="Chat History"
              >
                <History size={18} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-indigo-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex relative overflow-hidden bg-gray-50">
            
            {/* History Sidebar overlay */}
            <div className={`absolute inset-0 bg-white z-20 transform transition-transform duration-300 ease-in-out ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="p-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h4 className="font-medium text-gray-800">Chat History</h4>
                  <button onClick={startNewChat} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 bg-indigo-50 rounded">
                    + New Chat
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center mt-4">No previous conversations.</p>
                  ) : (
                    sessions.map(session => (
                      <div 
                        key={session.id}
                        onClick={() => loadSession(session.id)}
                        className={`p-3 rounded-lg cursor-pointer border transition-colors ${currentSessionId === session.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                      >
                        <div className="text-xs text-gray-500 mb-1">{formatDate(session.startedAt)} • {formatTime(session.startedAt)}</div>
                        <div className="text-sm text-gray-700 truncate font-medium">
                          {session.sessionContext || "General Support"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col h-full w-full">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                  const isUser = msg.role.toLowerCase() === 'user';
                  return (
                    <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div 
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                          isUser 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                        }`}
                      >
                        {isUser ? (
                          <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                        ) : (
                          <div className="text-[15px] leading-relaxed prose prose-sm max-w-none prose-indigo markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 mt-1 px-1">
                        {formatTime(msg.sentAt)}
                      </span>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex items-start">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                      <Loader2 size={16} className="animate-spin text-indigo-600" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask something..."
                    disabled={isLoading}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-1.5 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                  >
                    <Send size={16} className="ml-0.5" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
