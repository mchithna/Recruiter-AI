import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllConversations, getApplication, getMessagesForApplication } from './services/mockData';
import { MessagingThread, formatMessageTime } from './components/MessagingThread';

export default function MessagesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedAppId = searchParams.get('applicationId');

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState('');
  const [loadingThread, setLoadingThread] = useState(false);

  useEffect(() => {
    async function loadConversations() {
      setLoadingList(true);
      try {
        const convos = await getAllConversations();
        setConversations(convos);
        
        // If no application is selected and we have conversations, select the first one automatically
        if (!searchParams.get('applicationId') && convos.length > 0) {
          setSearchParams({ applicationId: convos[0].applicationId }, { replace: true });
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoadingList(false);
      }
    }
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Watch for selectedAppId changes to load thread
  useEffect(() => {
    if (!selectedAppId) {
      setSelectedApplication(null);
      setMessages([]);
      return;
    }

    async function loadThread() {
      setLoadingThread(true);
      try {
        const [app, msgs] = await Promise.all([
          getApplication(selectedAppId),
          getMessagesForApplication(selectedAppId)
        ]);
        
        // Mark as read in our local state if it matches the selected app
        setConversations(current => 
          current.map(c => c.applicationId === selectedAppId ? { ...c, unread: false } : c)
        );

        setSelectedApplication(app);
        setMessages(msgs || []);
        setDraftMessage('');
      } catch (error) {
        console.error('Failed to load thread:', error);
      } finally {
        setLoadingThread(false);
      }
    }
    
    loadThread();
  }, [selectedAppId]);

  const handleSelectConversation = (applicationId) => {
    setSearchParams({ applicationId });
  };

  const handleDraftChange = (e) => setDraftMessage(e.target.value);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmed = draftMessage.trim();
    if (!trimmed) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'Current Recruiter',
      body: trimmed,
      sentAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    setDraftMessage('');
    
    // Update the conversation list with the new message preview
    setConversations(current => {
      const updated = current.map(c => {
        if (c.applicationId === selectedAppId) {
          return {
            ...c,
            body: newMsg.body,
            sentAt: newMsg.sentAt,
            unread: false
          };
        }
        return c;
      });
      // Move updated to top
      updated.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
      return updated;
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage candidate communications across all jobs.</p>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex shadow-sm min-h-0">
        {/* Left Pane - List */}
        <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50/50 dark:bg-slate-800/20">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white">
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {loadingList ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : conversations.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {conversations.map(c => {
                  const isSelected = c.applicationId === selectedAppId;
                  return (
                    <button
                      key={c.applicationId}
                      onClick={() => handleSelectConversation(c.applicationId)}
                      className={`w-full text-left p-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isSelected ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                    >
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={`font-semibold ${c.unread ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                          {c.candidateName}
                        </span>
                        <span className="text-xs text-slate-500">{formatMessageTime(c.sentAt)}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
                        {c.jobTitle}
                      </div>
                      <div className={`text-sm truncate ${c.unread ? 'font-medium text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {c.body}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No conversations found.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Thread */}
        <div className="w-2/3 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900/50">
          {loadingThread ? (
            <div className="flex-1 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : selectedApplication ? (
            <div className="flex-1 p-6 overflow-y-auto min-h-0">
              <MessagingThread 
                application={selectedApplication}
                messages={messages}
                draftMessage={draftMessage}
                onDraftChange={handleDraftChange}
                onSendMessage={handleSendMessage}
              />
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center text-slate-500">
              Select a conversation to view the thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
