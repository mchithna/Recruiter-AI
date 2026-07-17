import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner, StatusBadge, Input } from '../../components/ui';
import { getApplication, getStatusHistory, getMessages, sendMessage } from './services/mockData';
import { Send, Clock } from 'lucide-react';

export default function CandidateApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, [applicationId]);

  const loadData = async () => {
    setLoading(true);
    const [appData, historyData, messagesData] = await Promise.all([
      getApplication(applicationId),
      getStatusHistory(applicationId),
      getMessages(applicationId)
    ]);
    setApplication(appData);
    setHistory(historyData.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt)));
    setMessages(messagesData);
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setSending(true);
    const sentMsg = await sendMessage(applicationId, newMessage);
    setMessages(prev => [...prev, sentMsg]);
    setNewMessage('');
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-h2 text-secondary-900 dark:text-white">Application Not Found</h2>
        <Button variant="ghost" onClick={() => navigate('/candidate/applications')} className="mt-4">Back to Applications</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <Button variant="ghost" onClick={() => navigate('/candidate/applications')} className="mb-4">
        &larr; Back
      </Button>

      {/* Header */}
      <div className="rounded-3xl border border-white/60 bg-white/75 p-8 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-h2 text-secondary-900 dark:text-white">{application.jobTitle}</h1>
            <p className="text-body-sm text-secondary-500 dark:text-secondary-400 mt-1">
              Applied on {new Date(application.appliedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-caption text-secondary-500 dark:text-secondary-400">Current Status</span>
            <StatusBadge status={application.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Timeline */}
        <section className="space-y-6">
          <h3 className="text-h3 text-secondary-900 dark:text-white">Status History</h3>
          <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
            <div className="relative border-l-2 border-secondary-200 dark:border-secondary-800 ml-4 space-y-8 pb-4">
              {history.map((entry, idx) => (
                <div key={entry.id} className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-100 ring-4 ring-white dark:bg-primary-900 dark:ring-secondary-950">
                    <span className="h-2 w-2 rounded-full bg-primary-500" />
                  </span>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-secondary-900 dark:text-white">{entry.newStatus}</span>
                      <span className="text-xs text-secondary-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(entry.changedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-body-sm text-secondary-600 dark:text-secondary-400 mt-1">
                        {entry.notes}
                      </p>
                    )}
                    <p className="text-caption text-secondary-400 dark:text-secondary-500 mt-1">
                      Updated by {entry.changedByName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Messaging Thread */}
        <section className="space-y-6">
          <h3 className="text-h3 text-secondary-900 dark:text-white">Messages</h3>
          <div className="flex h-[500px] flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/75 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center text-secondary-400">
                  <p>No messages yet. Send a message to the hiring team!</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-caption font-medium text-secondary-600 dark:text-secondary-400">
                        {msg.isMine ? 'You' : msg.senderName}
                      </span>
                      <span className="text-caption text-secondary-400 text-[10px]">
                        {new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-body-sm ${
                      msg.isMine 
                        ? 'bg-primary-600 text-white shadow-glow-primary dark:bg-primary-600' 
                        : 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-200'
                    }`}>
                      {msg.body}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="border-t border-secondary-100 bg-white/50 p-4 dark:border-secondary-800 dark:bg-secondary-950/50 flex gap-3 items-center">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white dark:bg-secondary-900"
              />
              <Button type="submit" disabled={!newMessage.trim() || sending} size="icon" className="shrink-0 rounded-full h-10 w-10">
                {sending ? <Spinner size="sm" /> : <Send size={16} />}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
