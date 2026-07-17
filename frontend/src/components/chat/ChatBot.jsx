import React, { useState, useEffect, useRef } from 'react';
import { X, Send, History, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  "What are the requirements?",
  "Check my application status",
  "How do I apply?"
];

// Mock generic responses
const MOCK_REPLIES = [
  "That's a great question! Based on your profile, you seem like a strong fit. I recommend uploading your latest resume to make sure the requirements match.",
  "Your application is currently in the 'Applied' stage. You'll receive an email notification as soon as the recruiter reviews it.",
  "You can apply by visiting the Job Details page and clicking the 'Apply' button, provided you have a primary resume uploaded.",
  "I am Hirely, your AI assistant! Right now I am in mock mode for candidate testing, so I can only give these canned responses. Have a great day!"
];

const ChatBot = () => {
  const [uiState, setUiState] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'button' : 'greeting'
  ); // 'greeting' | 'button' | 'chat'
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 'mock-1', startedAt: new Date(Date.now() - 86400000).toISOString(), sessionContext: 'Application follow up' }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Keep greeting on screen in a continuous loop until clicked
  useEffect(() => {
    // No auto-dismiss logic, remains on screen
  }, [uiState]);

  // Handle responsive state switches dynamically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && uiState === 'greeting') {
        setUiState('button');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [uiState]);

  useEffect(() => {
    if (uiState === 'chat') scrollToBottom();
  }, [messages, uiState]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const loadSession = async (sessionId) => {
    setIsLoading(true);
    // Mock loading delay
    await new Promise(r => setTimeout(r, 600));
    setCurrentSessionId(sessionId);
    setMessages([
      { role: 'User', content: 'Can I check my previous application?', sentAt: new Date(Date.now() - 86400000).toISOString() },
      { role: 'AI', content: 'Certainly! You can navigate to the **Applications** tab to see the full timeline of your previous applications.', sentAt: new Date(Date.now() - 86390000).toISOString() }
    ]);
    setShowHistory(false);
    setIsLoading(false);
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setShowHistory(false);
  };

  const handleSendMessage = async (msgText) => {
    if (!msgText.trim()) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'User', content: msgText, sentAt: new Date().toISOString() }]);
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1200));

    if (!currentSessionId) {
      setCurrentSessionId('mock-new');
      setSessions(prev => [{ id: 'mock-new', startedAt: new Date().toISOString(), sessionContext: msgText }, ...prev]);
    }

    const randomReply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];

    setMessages(prev => [...prev, { role: 'AI', content: randomReply, sentAt: new Date().toISOString() }]);
    setIsLoading(false);
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const fmt = (iso) => {
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };
  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' }); } catch { return ''; }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end justify-end" style={{ overflow: 'visible' }}>
      <AnimatePresence mode="wait">

        {/* ── GREETING STATE (GIF Pop-out) ───────────────────────── */}
        {uiState === 'greeting' && (
          <motion.div
            key="greeting"
            initial={{ opacity: 0, scale: 0.1, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 180, damping: 18 }}
            style={{ transformOrigin: 'bottom right' }}
            className="cursor-pointer relative flex flex-col items-end"
            onClick={() => setUiState('chat')}
          >
            {/* The animated GIF standing on the UI */}
            <div className="w-[180px] h-[300px] mb-2 relative flex justify-center items-end">
              <video 
                src="/assets/chatbot-media/Gif_clean.webm" 
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                className="max-w-full max-h-full object-contain pointer-events-none"
              />
            </div>
            
            {/* Ask Hirely Pill next to feet */}
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-6 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 dark:border-slate-700/50 flex items-center gap-3 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300">
              <span className="font-semibold text-indigo-900 dark:text-indigo-100 text-sm tracking-wide">Ask Hirely</span>
            </div>
          </motion.div>
        )}

        {/* ── BUTTON STATE (Idle FAB) ────────────────────────────── */}
        {uiState === 'button' && (
          <motion.div
            key="button"
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ transformOrigin: 'bottom right' }}
            onClick={() => setUiState('chat')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Pill Label (Slides out on hover, or stays visible) */}
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 dark:border-slate-700/50 opacity-90 group-hover:opacity-100 transition-opacity">
              <span className="font-semibold text-indigo-900 dark:text-indigo-100 text-sm tracking-wide">Ask Hirely</span>
            </div>

            {/* Circular Avatar Button with Animated Gradient Border */}
            <div className="relative w-[76px] h-[76px] rounded-full shadow-xl flex items-center justify-center focus:outline-none overflow-hidden">
              {/* Spinning Loading Spectrum */}
              <div className="absolute w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_30%,#818cf8_60%,#4f46e5_85%,#312e81_100%)] animate-[spin_2s_linear_infinite]" />
              
              {/* Inner White Border and Image */}
              <div className="relative w-[68px] h-[68px] rounded-full border-[3px] border-white bg-indigo-50 overflow-hidden z-10">
                <img 
                  src="/assets/chatbot-media/Avatar02.jpeg" 
                  alt="Hirely"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CHAT STATE (Expanded Window) ───────────────────────── */}
        {uiState === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ transformOrigin: 'bottom right' }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col w-[90vw] sm:w-[420px] h-[650px] max-h-[85vh] border border-white/50 dark:border-slate-700/50 overflow-visible relative mt-8 ring-1 ring-black/5 dark:ring-white/10"
          >
            {/* Overlapping Avatar Profile in the center */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 group">
              <div className="w-24 h-24 rounded-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md p-1.5 shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-white/50 dark:border-slate-600/50">
                <div className="w-full h-full rounded-full overflow-hidden bg-indigo-50 relative">
                   <img 
                      src="/assets/chatbot-media/Avatar02.jpeg" 
                      alt="Hirely Profile"
                      className="w-full h-full object-cover object-center"
                   />
                </div>
              </div>
            </div>

            {/* Header Area */}
            <div className="bg-gradient-to-br from-indigo-500/80 to-purple-600/80 dark:from-indigo-600/80 dark:to-purple-800/80 backdrop-blur-md rounded-t-[32px] pt-12 pb-5 px-4 flex flex-col items-center relative z-20 border-b border-white/20 shadow-sm">
              <div className="absolute top-4 right-4 flex gap-1">
                <button onClick={() => setShowHistory(!showHistory)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title="Chat History">
                  <History size={16} />
                </button>
                <button onClick={() => setUiState('button')} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <h3 className="font-semibold text-lg text-white tracking-wide">Hirely</h3>
              <p className="text-indigo-100 text-xs">AI Recruitment Assistant</p>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex relative overflow-hidden bg-white/40 dark:bg-slate-900/40 rounded-b-[32px]">
              
              {/* History Sidebar overlay */}
              <div className={`absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl z-40 transform transition-transform duration-300 ease-in-out ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-5 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-indigo-50">
                    <h4 className="font-semibold text-indigo-900">Chat History</h4>
                    <button onClick={startNewChat} className="text-sm text-white font-medium px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-sm transition-colors">
                      New Chat
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {sessions.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center mt-8">No previous conversations.</p>
                    ) : (
                      sessions.map(s => (
                        <div key={s.id} onClick={() => loadSession(s.id)} className={`p-3.5 rounded-2xl cursor-pointer border transition-colors ${currentSessionId === s.id ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                          <div className="text-xs text-gray-400 mb-1">{fmtDate(s.startedAt)} · {fmt(s.startedAt)}</div>
                          <div className="text-sm text-indigo-950 truncate font-medium">{s.sessionContext || 'General Support'}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 flex flex-col h-full w-full">
                
                <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                  
                  {/* Empty State / Welcome Screen */}
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-xl font-bold text-indigo-900">
                          <Sparkles className="text-indigo-500" size={24} />
                          Hi, I'm Hirely!
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-[250px] mx-auto">
                          Your personal AI assistant for this platform. Ask me anything about your application!
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 w-full max-w-[280px]">
                        {SUGGESTIONS.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(sug)}
                            className="px-5 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/60 rounded-2xl text-sm font-medium text-indigo-800 dark:text-indigo-200 shadow-sm hover:shadow-md hover:bg-white/70 dark:hover:bg-slate-700/70 hover:-translate-y-0.5 transition-all duration-300 text-left"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message List */}
                  {messages.map((msg, i) => {
                    const isUser = msg.role.toLowerCase() === 'user';
                    return (
                      <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] px-5 py-3.5 shadow-sm text-[14.5px] leading-relaxed ${
                            isUser 
                              ? 'bg-gradient-to-br from-indigo-500/90 to-purple-600/90 backdrop-blur-md text-white border border-white/20 shadow-md rounded-[24px] rounded-br-sm' 
                              : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-gray-800 dark:text-slate-200 rounded-[24px] rounded-bl-sm border border-white/60 dark:border-slate-700/60 shadow-sm'
                          }`}
                        >
                          {isUser ? (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          ) : (
                            <div className="prose prose-sm max-w-none prose-indigo markdown-content">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 mt-1.5 px-2">{fmt(msg.sentAt)}</span>
                      </div>
                    );
                  })}
                  
                  {isLoading && (
                    <div className="flex items-start">
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/60 dark:border-slate-700/60 rounded-[24px] rounded-bl-sm px-5 py-4 shadow-sm">
                        <Loader2 size={18} className="animate-spin text-indigo-600" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-2" />
                </div>

                {/* Input Area */}
                <div className="p-5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-t border-white/40 dark:border-slate-700/50 z-10">
                  <form onSubmit={onSubmitForm} className="relative flex items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Ask Hirely anything..."
                      disabled={isLoading}
                      className="w-full pl-5 pr-14 py-3.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/50 dark:border-slate-600/50 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white/80 dark:focus:bg-slate-800/80 transition-all text-[14.5px] shadow-inner text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-1.5 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none transition-all duration-300"
                    >
                      {/* The Send icon naturally points top-right, making it look off-center. We slightly nudge it down and left to balance the visual weight. */}
                      <Send size={18} className="-ml-0.5 mt-0.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBot;
