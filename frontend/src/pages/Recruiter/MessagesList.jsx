import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
} from '../../components/ui';
import { MessagingThread } from './components/MessagingThread';
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

  return (
    <div className="mx-auto flex h-[calc(100vh-12rem)] max-w-7xl flex-col animate-slide-up">
      <div className="mb-6">
        <h1 className="text-h2 text-secondary-900">Messages</h1>
        <p className="mt-1 text-body-sm text-secondary-500">
          Manage candidate communications across all jobs.
        </p>
      </div>

      <Card className="flex min-h-0 flex-1 overflow-hidden p-0">
        <div className="flex w-1/3 min-w-72 flex-col border-r border-secondary-100 bg-secondary-50/70">
          <CardHeader className="mb-0 border-b border-secondary-100 p-4">
            <CardTitle className="text-h4">Conversations</CardTitle>
          </CardHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="space-y-3 p-4">
                <Skeleton height="4.5rem" />
                <Skeleton height="4.5rem" />
                <Skeleton height="4.5rem" />
              </div>
            ) : conversations.length > 0 ? (
              <div className="divide-y divide-secondary-100">
                {conversations.map((conversation) => {
                  const isSelected = conversation.applicationId === selectedAppId;

                  return (
                    <Button
                      key={conversation.applicationId}
                      type="button"
                      variant="ghost"
                      onClick={() => handleSelectConversation(conversation.applicationId)}
                      className={[
                        'h-auto w-full justify-start rounded-none px-4 py-4 text-left transition-colors',
                        isSelected ? 'bg-primary-50 text-primary-700' : 'text-secondary-700',
                      ].join(' ')}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-baseline justify-between gap-2">
                          <span
                            className={[
                              'truncate text-body-sm font-semibold',
                              conversation.unread ? 'text-primary-700' : 'text-secondary-900',
                            ].join(' ')}
                          >
                            {conversation.candidateName}
                          </span>
                          <span className="shrink-0 text-caption text-secondary-500">
                            {formatMessageTime(conversation.sentAt)}
                          </span>
                        </div>
                        <div className="mb-2 truncate text-caption text-secondary-500">
                          {conversation.jobTitle}
                        </div>
                        <div
                          className={[
                            'truncate text-body-sm',
                            conversation.unread
                              ? 'font-semibold text-secondary-800'
                              : 'text-secondary-500',
                          ].join(' ')}
                        >
                          {conversation.body}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="No conversations yet"
                description="Candidate conversations will appear here once outreach starts."
                className="py-10"
              />
            )}
          </div>
        </div>

        <CardContent className="flex min-h-0 w-2/3 flex-col bg-white p-0">
          {loadingThread ? (
            <div className="flex-1 space-y-4 p-6">
              <Skeleton height="5rem" />
              <Skeleton height="18rem" />
            </div>
          ) : selectedApplication ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <MessagingThread
                application={selectedApplication}
                messages={messages}
                draftMessage={draftMessage}
                onDraftChange={handleDraftChange}
                onSendMessage={handleSendMessage}
              />
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a candidate thread from the list to review the conversation."
              className="h-full"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
