import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Search, Send, Sparkles } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  CardTitle,
  EmptyState,
  Input,
  Skeleton,
} from '../../components/ui';
import { recruiterApi } from './services/recruiterApi';
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

  useEffect(() => {
    let isActive = true;

    async function loadConversations() {
      setLoadingList(true);

      try {
        const convos = await recruiterApi.getConversations();
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
        const app = await recruiterApi.getApplication(selectedAppId);

        if (!isActive) return;

        setConversations((current) =>
          current.map((conversation) =>
            conversation.applicationId === selectedAppId
              ? { ...conversation, unread: false }
              : conversation
          )
        );
        setSelectedApplication(app);
        setMessages(app.messages || []);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (event) => {
    event.preventDefault();

    const trimmed = draftMessage.trim();
    if (!trimmed) return;
    if (!window.confirm('Confirm that you reviewed and want to send this message?')) return;

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
        (conversation) =>
          conversation.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conversation.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  return (
    <div className="relative z-10 mx-auto flex h-[calc(100vh-11rem)] max-w-7xl flex-col animate-slide-up">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-ai-200 bg-ai-50 px-3.5 py-1.5 text-caption font-semibold leading-none text-ai-700 shadow-sm dark:border-ai-400/20 dark:bg-ai-400/10 dark:text-ai-200">
            <Sparkles size={12} strokeWidth={1.75} className="shrink-0" />
            Communication hub
          </span>
          <h1 className="mt-4 text-h1 text-secondary-900 dark:text-white">Messages</h1>
          <p className="mt-1 text-body-sm text-secondary-500 dark:text-secondary-300">
            Manage candidate communications across all jobs.
          </p>
        </div>
      </div>

      <div className="glass-card-heavy flex min-h-0 flex-1 overflow-hidden rounded-2xl border-none p-0">
        <div className="flex w-[22rem] min-w-[22rem] flex-col border-r border-white/60 bg-white/30 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="shrink-0 border-b border-secondary-100 p-4 dark:border-white/10">
            <CardTitle className="mb-3 text-h4">Conversations</CardTitle>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search candidates..."
              leftIcon={<Search size={16} strokeWidth={1.75} />}
              className="recruiter-compact-input"
            />
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
                    <Button
                      key={conversation.applicationId}
                      type="button"
                      variant="ghost"
                      onClick={() => setSearchParams({ applicationId: conversation.applicationId })}
                      className={[
                        'group h-auto w-full justify-start rounded-none border-b px-4 py-3 text-left transition-all duration-base',
                        isSelected
                          ? 'border-primary-100 bg-primary-50/80 dark:border-primary-500/20 dark:bg-primary-500/10'
                          : 'border-secondary-100 hover:bg-white/70 dark:border-white/5 dark:hover:bg-white/5',
                      ].join(' ')}
                    >
                      <span className="flex min-w-0 items-start gap-3">
                        <span className="relative shrink-0">
                          <Avatar name={conversation.candidateName} size="md" />
                          {conversation.unread && (
                            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500 dark:border-secondary-900" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="mb-1 flex items-baseline justify-between gap-2">
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
                          </span>
                          <span className="mb-1 block line-clamp-1 text-caption text-secondary-500 dark:text-secondary-400">
                            {conversation.jobTitle}
                          </span>
                          <span
                            className={[
                              'block line-clamp-2 text-body-sm leading-relaxed',
                              conversation.unread
                                ? 'font-semibold text-secondary-800 dark:text-secondary-200'
                                : 'text-secondary-500 dark:text-secondary-400',
                            ].join(' ')}
                          >
                            {conversation.body}
                          </span>
                        </span>
                      </span>
                    </Button>
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

        <div className="flex min-w-0 flex-1 flex-col bg-white/40 dark:bg-white/[0.01]">
          {loadingThread ? (
            <div className="flex-1 space-y-4 p-5">
              <Skeleton height="5rem" />
              <Skeleton height="14rem" />
            </div>
          ) : selectedApplication ? (
            <>
              <div className="flex shrink-0 items-center gap-4 border-b border-secondary-100 bg-white/60 px-5 py-3.5 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
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

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="mx-auto max-w-2xl space-y-3.5">
                  {messages.map((message) => {
                    const isRecruiter = message.sender !== selectedApplication.candidateName;

                    return (
                      <div
                        key={message.id}
                        className={['flex gap-3', isRecruiter ? 'flex-row-reverse' : 'flex-row'].join(' ')}
                      >
                        <Avatar name={message.sender} size="sm" className="shrink-0" />
                        <div
                          className={[
                          'max-w-[68%] rounded-2xl px-3.5 py-2.5 shadow-sm transition-all',
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

              <form
                className="flex shrink-0 items-end gap-3 border-t border-secondary-100 bg-white/60 px-5 py-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]"
                onSubmit={handleSendMessage}
              >
                <Input
                  value={draftMessage}
                  onChange={(event) => setDraftMessage(event.target.value)}
                  placeholder={`Message ${selectedApplication.candidateName}...`}
                  className="recruiter-compose-input flex-1"
                />
                <Button
                  type="submit"
                  variant={draftMessage.trim() ? 'glass' : 'outline'}
                  size="md"
                  leftIcon={<Send size={16} strokeWidth={1.75} />}
                  disabled={!draftMessage.trim()}
                  className="min-w-24 shrink-0 rounded-xl px-5"
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
