import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Search, Send, Sparkles } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Skeleton,
} from '../../components/ui';
import { getAllConversations, getApplication, getMessagesForApplication } from './services/mockData';
import { formatMessageTime } from './utils/messageFormatting';

export default function MessagesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedAppId = searchParams.get('applicationId');
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState('');
  const [loadingThread, setLoadingThread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let isActive = true;

    async function loadConversations() {
      setLoadingList(true);

      try {
        const convos = await getAllConversations();
        if (!isActive) return;

        setConversations(convos);
        if (!searchParams.get('applicationId') && convos.length > 0) {
          setSearchParams({ applicationId: convos[0].applicationId }, { replace: true });
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        if (isActive) setLoadingList(false);
      }
    }

    loadConversations();

    return () => {
      isActive = false;
    };
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!selectedAppId) {
      setSelectedApplication(null);
      setMessages([]);
      return undefined;
    }

    let isActive = true;

    async function loadThread() {
      setLoadingThread(true);

      try {
        const [app, msgs] = await Promise.all([
          getApplication(selectedAppId),
          getMessagesForApplication(selectedAppId),
        ]);

        if (!isActive) return;

        setConversations((current) =>
          current.map((conversation) =>
            conversation.applicationId === selectedAppId
              ? { ...conversation, unread: false }
              : conversation
          )
        );
        setSelectedApplication(app);
        setMessages(msgs || []);
        setDraftMessage('');
      } catch (error) {
        console.error('Failed to load thread:', error);
      } finally {
        if (isActive) setLoadingThread(false);
      }
    }

    loadThread();

    return () => {
      isActive = false;
    };
  }, [selectedAppId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectConversation = (applicationId) => {
    setSearchParams({ applicationId });
  };

  const handleDraftChange = (event) => setDraftMessage(event.target.value);

  const handleSendMessage = (event) => {
    event.preventDefault();

    const trimmed = draftMessage.trim();
    if (!trimmed) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'Current Recruiter',
      body: trimmed,
      sentAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, newMessage]);
    setDraftMessage('');
    setConversations((current) =>
      current
        .map((conversation) =>
          conversation.applicationId === selectedAppId
            ? {
                ...conversation,
                body: newMessage.body,
                sentAt: newMessage.sentAt,
                unread: false,
              }
            : conversation
        )
        .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    );
  };

  const filteredConversations = searchQuery
    ? conversations.filter(
        (c) =>
          c.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  return (
    <div className="relative z-10 mx-auto flex h-[calc(100vh-12rem)] max-w-7xl flex-col animate-slide-up">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="ai" size="sm" icon={<Sparkles size={12} strokeWidth={1.75} />}>
            Communication hub
          </Badge>
          <h1 className="mt-3 text-h1 text-secondary-900 dark:text-white">Messages</h1>
          <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-300">
            Manage candidate communications across all jobs.
          </p>
        </div>
      </div>

      {/* Main Two-Pane */}
      <div className="glass-card-heavy flex min-h-0 flex-1 overflow-hidden rounded-2xl border-none p-0">
        {/* Left Pane — Conversation List */}
        <div className="flex w-1/3 min-w-72 flex-col border-r border-white/60 bg-white/30 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="shrink-0 border-b border-secondary-100 p-4 dark:border-white/10">
            <CardTitle className="mb-3 text-h4">Conversations</CardTitle>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
              />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-secondary-200 bg-white/70 py-2.5 pl-10 pr-4 text-body-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-secondary-500"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="space-y-3 p-4">
                <Skeleton height="5rem" />
                <Skeleton height="5rem" />
                <Skeleton height="5rem" />
              </div>
            ) : filteredConversations.length > 0 ? (
              <div>
                {filteredConversations.map((conversation) => {
                  const isSelected = conversation.applicationId === selectedAppId;

                  return (
                    <button
                      key={conversation.applicationId}
                      type="button"
                      onClick={() => handleSelectConversation(conversation.applicationId)}
                      className={[
                        'group flex w-full items-start gap-3 border-b px-4 py-4 text-left transition-all duration-base',
                        isSelected
                          ? 'border-primary-100 bg-primary-50/80 dark:border-primary-500/20 dark:bg-primary-500/10'
                          : 'border-secondary-100 hover:bg-white/70 dark:border-white/5 dark:hover:bg-white/5',
                      ].join(' ')}
                    >
                      <div className="relative shrink-0">
                        <Avatar name={conversation.candidateName} size="md" />
                        {conversation.unread && (
                          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500 dark:border-secondary-900" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-baseline justify-between gap-2">
                          <span
                            className={[
                              'truncate text-body-sm font-semibold',
                              conversation.unread
                                ? 'text-primary-700 dark:text-primary-300'
                                : 'text-secondary-900 dark:text-white',
                            ].join(' ')}
                          >
                            {conversation.candidateName}
                          </span>
                          <span className="shrink-0 text-caption text-secondary-400">
                            {formatMessageTime(conversation.sentAt)}
                          </span>
                        </div>
                        <p className="mb-1.5 truncate text-caption text-secondary-500 dark:text-secondary-400">
                          {conversation.jobTitle}
                        </p>
                        <p
                          className={[
                            'truncate text-body-sm',
                            conversation.unread
                              ? 'font-semibold text-secondary-800 dark:text-secondary-200'
                              : 'text-secondary-500 dark:text-secondary-400',
                          ].join(' ')}
                        >
                          {conversation.body}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="No conversations found"
                description={
                  searchQuery
                    ? 'Try a different search term.'
                    : 'Candidate conversations will appear here once outreach starts.'
                }
                className="py-10"
              />
            )}
          </div>
        </div>

        {/* Right Pane — Thread */}
        <div className="flex w-2/3 flex-col bg-white/40 dark:bg-white/[0.01]">
          {loadingThread ? (
            <div className="flex-1 space-y-4 p-6">
              <Skeleton height="5rem" />
              <Skeleton height="18rem" />
            </div>
          ) : selectedApplication ? (
            <>
              {/* Thread Header */}
              <div className="flex shrink-0 items-center gap-4 border-b border-secondary-100 bg-white/60 px-6 py-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
                <Avatar name={selectedApplication.candidateName} size="md" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-body-lg font-semibold text-secondary-900 dark:text-white">
                    {selectedApplication.candidateName}
                  </h2>
                  <p className="truncate text-body-sm text-secondary-500 dark:text-secondary-400">
                    {selectedApplication.jobTitle}
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  {messages.length} messages
                </Badge>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-2xl space-y-4">
                  {messages.map((message) => {
                    const isRecruiter = message.sender !== selectedApplication.candidateName;

                    return (
                      <div
                        key={message.id}
                        className={[
                          'flex gap-3',
                          isRecruiter ? 'flex-row-reverse' : 'flex-row',
                        ].join(' ')}
                      >
                        <Avatar
                          name={message.sender}
                          size="sm"
                          className="shrink-0"
                        />
                        <div
                          className={[
                            'max-w-[75%] rounded-2xl px-4 py-3 shadow-sm transition-all',
                            isRecruiter
                              ? 'rounded-tr-md bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-primary-500/20'
                              : 'rounded-tl-md border border-secondary-100 bg-white text-secondary-800 dark:border-white/10 dark:bg-white/5 dark:text-white',
                          ].join(' ')}
                        >
                          <p className="text-body-sm leading-relaxed">{message.body}</p>
                          <p
                            className={[
                              'mt-2 text-right text-caption',
                              isRecruiter ? 'text-primary-100' : 'text-secondary-400',
                            ].join(' ')}
                          >
                            {formatMessageTime(message.sentAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Compose Area */}
              <form
                className="flex shrink-0 items-end gap-3 border-t border-secondary-100 bg-white/60 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]"
                onSubmit={handleSendMessage}
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={draftMessage}
                    onChange={handleDraftChange}
                    placeholder={`Message ${selectedApplication.candidateName}...`}
                    className="w-full rounded-xl border border-secondary-200 bg-white/70 px-4 py-3 text-body-sm text-secondary-900 placeholder:text-secondary-400 transition-all focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-secondary-500"
                  />
                </div>
                <Button
                  type="submit"
                  variant="glass"
                  size="md"
                  leftIcon={<Send size={16} strokeWidth={1.75} />}
                  disabled={!draftMessage.trim()}
                  className="shrink-0"
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-100 to-ai-100 dark:from-primary-500/20 dark:to-ai-500/20">
                <MessageSquare size={36} className="text-primary-600 dark:text-primary-300" />
              </div>
              <div className="text-center">
                <h3 className="text-h3 text-secondary-900 dark:text-white">Select a conversation</h3>
                <p className="mt-2 text-body-sm text-secondary-500 dark:text-secondary-400">
                  Choose a candidate thread from the list to review the conversation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
