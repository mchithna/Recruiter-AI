import React, { useEffect, useRef, useState } from 'react';
import { X, Send, History, Loader2, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { chatApi } from '../../lib/chatApi';

const DEFAULT_CONTEXT = {
  contextKey: 'home',
  assistantName: 'Hirely',
  welcomeMessage: 'Hi, I can help with general website questions, registration, login, navigation, and support.',
  scopeDescription: 'General website assistance only.',
  outOfScopeResponse: 'I can help with general website questions here. For private dashboard information, please log in and open the relevant dashboard.',
  missingDataResponse: "I couldn't find enough current information to answer that question. Please check the dashboard data or contact support.",
  exampleQuestions: ['What is this website?', 'How do I register?', 'Which dashboard should I use?'],
  requiresAuthentication: false
};

const ChatBot = ({ variant = 'default' }) => {
  const location = useLocation();
  const isHomeVariant = variant === 'home';
  const isDashboardVariant = variant === 'dashboard';
  const [uiState, setUiState] = useState(
    isDashboardVariant || (typeof window !== 'undefined' && window.innerWidth < 768) ? 'button' : 'greeting'
  );
  const [showHistory, setShowHistory] = useState(false);
  const [contextMeta, setContextMeta] = useState(DEFAULT_CONTEXT);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastFailedMessage, setLastFailedMessage] = useState('');

  const messagesEndRef = useRef(null);
  const activePath = location.pathname || '/';

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
    let alive = true;

    const loadContext = async () => {
      setIsContextLoading(true);
      setError('');
      setShowHistory(false);
      setCurrentSessionId(null);
      setMessages([]);

      try {
        const metadata = await chatApi.getContext(activePath);
        if (!alive) return;
        setContextMeta(metadata);
        await loadSessions(metadata.contextKey, alive);
      } catch (err) {
        if (!alive) return;
        const message = err?.response?.data?.message || 'The assistant is unavailable for this page right now.';
        setContextMeta({ ...DEFAULT_CONTEXT, welcomeMessage: message, scopeDescription: message });
        setSessions([]);
        setError(message);
      } finally {
        if (alive) setIsContextLoading(false);
      }
    };

    loadContext();
    return () => {
      alive = false;
    };
  }, [activePath]);

  useEffect(() => {
    if (uiState === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, uiState, isLoading]);

  const loadSessions = async (contextKey, alive = true) => {
    try {
      const data = await chatApi.getSessions(contextKey);
      if (alive) setSessions(Array.isArray(data) ? data : []);
    } catch {
      if (alive) setSessions([]);
    }
  };

  const loadSession = async (sessionId) => {
    setIsLoading(true);
    setError('');
    try {
      const session = await chatApi.getSession(sessionId, contextMeta.contextKey);
      setCurrentSessionId(session.id);
      setMessages(session.messages || []);
      setShowHistory(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load that chat session.');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setShowHistory(false);
    setError('');
    setLastFailedMessage('');
  };

  const handleSendMessage = async (msgText, { fromRetry = false } = {}) => {
    const trimmed = msgText.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setError('');
    setLastFailedMessage('');
    if (!fromRetry) {
      setMessages(prev => [...prev, { role: 'User', content: trimmed, sentAt: new Date().toISOString() }]);
    }
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(trimmed, currentSessionId, activePath);
      if (response.sessionId && response.sessionId > 0) {
        setCurrentSessionId(response.sessionId);
        if (!currentSessionId) {
          loadSessions(contextMeta.contextKey);
        }
      }

      setMessages(prev => [...prev, response]);
    } catch (err) {
      const message = err?.response?.data?.message || 'The assistant could not respond. Please try again.';
      setError(message);
      setLastFailedMessage(trimmed);
      setMessages(prev => [...prev, {
        role: 'AI',
        content: message,
        sentAt: new Date().toISOString(),
        responseType: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const retryLastMessage = () => {
    if (!lastFailedMessage) return;
    setMessages(prev => prev.filter((msg, index) => !(index === prev.length - 1 && msg.responseType === 'error')));
    handleSendMessage(lastFailedMessage, { fromRetry: true });
  };

  const fmt = (iso) => {
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' }); } catch { return ''; }
  };

  const suggestions = contextMeta.exampleQuestions?.length ? contextMeta.exampleQuestions : DEFAULT_CONTEXT.exampleQuestions;
  const canSend = input.trim() && !isLoading && !isContextLoading;

  const chatPanelSize = isHomeVariant
    ? 'w-[calc(100vw-1.5rem)] sm:w-[460px] h-[min(640px,calc(100dvh-5rem))]'
    : 'w-[calc(100vw-1.5rem)] sm:w-[420px] h-[min(590px,calc(100dvh-5rem))]';
  const greetingSize = isHomeVariant
    ? 'w-[125px] h-[210px] sm:w-[150px] sm:h-[250px]'
    : 'w-[110px] h-[185px] sm:w-[130px] sm:h-[220px]';
  const launcherOuterSize = isDashboardVariant
    ? 'w-[58px] h-[58px] sm:w-[66px] sm:h-[66px]'
    : 'w-[38px] h-[38px] sm:w-[44px] sm:h-[44px]';
  const launcherInnerSize = isDashboardVariant
    ? 'w-[52px] h-[52px] sm:w-[60px] sm:h-[60px]'
    : 'w-[34px] h-[34px] sm:w-[40px] sm:h-[40px]';
  const showLauncherLabel = !isDashboardVariant;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 flex max-w-[calc(100vw-1.5rem)] flex-col items-end justify-end" style={{ overflow: 'visible' }}>
      <AnimatePresence mode="wait">
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
            role="button"
            tabIndex={0}
            aria-label="Open Hirely assistant"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setUiState('chat'); }}
          >
            <div className={`${greetingSize} mb-1.5 relative flex justify-center items-end`}>
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
            {showLauncherLabel && (
              <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 dark:border-slate-700/50 flex items-center gap-2 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300">
                <span className="font-semibold text-indigo-900 dark:text-indigo-100 text-xs sm:text-sm tracking-wide">Ask Hirely</span>
              </div>
            )}
          </motion.div>
        )}

        {uiState === 'button' && (
          <motion.button
            key="button"
            type="button"
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ transformOrigin: 'bottom right' }}
            onClick={() => setUiState('chat')}
            className="flex items-center gap-1.5 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full"
            aria-label="Open Hirely assistant"
          >
            {showLauncherLabel && (
              <span className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 dark:border-slate-700/50 opacity-90 group-hover:opacity-100 transition-opacity">
                <span className="font-semibold text-indigo-900 dark:text-indigo-100 text-[11px] tracking-wide">Ask Hirely</span>
              </span>
            )}
            <span className={`relative ${launcherOuterSize} rounded-full shadow-md flex items-center justify-center overflow-hidden`}>
              <span className="absolute w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_30%,#818cf8_60%,#4f46e5_85%,#312e81_100%)] animate-[spin_2s_linear_infinite]" />
              <span className={`relative ${launcherInnerSize} rounded-full border-[2px] border-white bg-indigo-50 overflow-hidden z-10`}>
                <img src="/assets/chatbot-media/Avatar02.jpeg" alt="" className="w-full h-full object-cover object-center" />
              </span>
            </span>
          </motion.button>
        )}

        {uiState === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ transformOrigin: 'bottom right' }}
            className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[24px] sm:rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col ${chatPanelSize} border border-white/50 dark:border-slate-700/50 overflow-hidden relative ring-1 ring-black/5 dark:ring-white/10`}
            role="dialog"
            aria-label="Hirely assistant"
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 group">
              <div className="w-16 h-16 rounded-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md p-1 shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-white/50 dark:border-slate-600/50">
                <div className="w-full h-full rounded-full overflow-hidden bg-indigo-50 relative">
                  <img src="/assets/chatbot-media/Avatar02.jpeg" alt="Hirely" className="w-full h-full object-cover object-center" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/90 to-purple-600/90 dark:from-indigo-600/90 dark:to-purple-800/90 backdrop-blur-md rounded-t-[24px] sm:rounded-t-[28px] pt-20 pb-4 px-4 flex flex-col items-center relative z-20 border-b border-white/20 shadow-sm">
              <div className="absolute top-4 right-4 flex gap-1">
                {contextMeta.contextKey !== 'home' && (
                  <button type="button" onClick={() => setShowHistory(!showHistory)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60" aria-label="Chat history">
                    <History size={16} />
                  </button>
                )}
                <button type="button" onClick={() => setUiState('button')} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60" aria-label="Close assistant">
                  <X size={16} />
                </button>
              </div>
              <h3 className="font-extrabold text-xl text-white tracking-wide flex items-center gap-1.5">
                <Sparkles size={18} className="text-amber-300 fill-amber-300" />
                Hi, I'm Hirely
              </h3>
              <p className="text-indigo-100 text-xs text-center max-w-[310px] mt-0.5 font-medium">{contextMeta.scopeDescription}</p>
            </div>

            <div className="flex-1 flex min-h-0 relative overflow-hidden bg-white/40 dark:bg-slate-900/40 rounded-b-[24px] sm:rounded-b-[28px]">
              {contextMeta.contextKey !== 'home' && (
                <div className={`absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl z-40 transform transition-transform duration-300 ease-in-out ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
                  <div className="p-5 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-indigo-50 dark:border-slate-700">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">Chat History</h4>
                      <button type="button" onClick={startNewChat} className="text-sm text-white font-medium px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-sm transition-colors">
                        New Chat
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2">
                      {sessions.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-slate-400 text-center mt-8">No previous conversations for this page.</p>
                      ) : (
                        sessions.map(s => (
                          <button key={s.id} type="button" onClick={() => loadSession(s.id)} className={`w-full text-left p-3.5 rounded-2xl cursor-pointer border transition-colors ${currentSessionId === s.id ? 'bg-indigo-50 border-indigo-100 shadow-sm dark:bg-indigo-500/10 dark:border-indigo-400/20' : 'bg-white border-gray-100 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700'}`}>
                            <div className="text-xs text-gray-400 mb-1">{fmtDate(s.startedAt)} · {fmt(s.startedAt)}</div>
                            <div className="text-sm text-indigo-950 dark:text-indigo-100 truncate font-medium">{s.sessionContext || contextMeta.contextKey}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 flex min-h-0 flex-col h-full w-full">
                <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4 space-y-6 my-auto">
                      <div className="space-y-2.5">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-[310px] mx-auto">
                          {isContextLoading ? 'Loading the AI assistant for this page...' : contextMeta.welcomeMessage}
                        </p>
                      </div>

                      {!isContextLoading && (
                        <div className="flex flex-col gap-2 w-full max-w-[320px]">
                          {suggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => handleSendMessage(sug)}
                              disabled={isLoading}
                              className="px-5 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/80 dark:border-slate-700/80 rounded-2xl text-sm font-semibold text-indigo-900 dark:text-indigo-100 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-300 text-left disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {messages.map((msg, i) => {
                    const isUser = msg.role?.toLowerCase() === 'user';
                    const isError = msg.responseType === 'error';
                    return (
                      <div key={`${msg.sentAt}-${i}`} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] px-5 py-3.5 shadow-sm text-[14.5px] leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-br from-indigo-500/90 to-purple-600/90 backdrop-blur-md text-white border border-white/20 shadow-md rounded-[24px] rounded-br-sm'
                            : isError
                              ? 'bg-red-50/80 dark:bg-red-950/30 text-red-800 dark:text-red-100 rounded-[24px] rounded-bl-sm border border-red-200/80 dark:border-red-800/60 shadow-sm'
                              : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-gray-800 dark:text-slate-200 rounded-[24px] rounded-bl-sm border border-white/60 dark:border-slate-700/60 shadow-sm'
                        }`}>
                          {isUser ? (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          ) : (
                            <div className="prose prose-sm max-w-none prose-indigo markdown-content dark:prose-invert">
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
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/60 dark:border-slate-700/60 rounded-[24px] rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-200">
                        <Loader2 size={18} className="animate-spin text-indigo-600" />
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-2" />
                </div>

                {error && (
                  <div className="px-5 pt-3 bg-white/30 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200/80 dark:border-red-800/60 bg-red-50/80 dark:bg-red-950/30 px-3 py-2 text-sm text-red-800 dark:text-red-100">
                      <span className="flex items-center gap-2 min-w-0">
                        <AlertCircle size={16} className="shrink-0" />
                        <span className="truncate">{error}</span>
                      </span>
                      {lastFailedMessage && (
                        <button type="button" onClick={retryLastMessage} disabled={isLoading} className="inline-flex items-center gap-1 text-xs font-semibold hover:underline disabled:opacity-50">
                          <RefreshCw size={13} />
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-t border-white/40 dark:border-slate-700/50 z-10">
                  <form onSubmit={onSubmitForm} className="relative flex items-center">
                    <label htmlFor="hirely-chat-input" className="sr-only">Ask Hirely a question</label>
                    <input
                      id="hirely-chat-input"
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder={isContextLoading ? 'Loading assistant...' : 'Ask about this page...'}
                      disabled={isLoading || isContextLoading}
                      maxLength={2000}
                      className="w-full pl-5 pr-14 py-3.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/50 dark:border-slate-600/50 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white/80 dark:focus:bg-slate-800/80 transition-all text-[14.5px] shadow-inner text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={!canSend}
                      className="absolute right-1.5 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                      aria-label="Send message"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-ml-0.5 mt-0.5" />}
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
