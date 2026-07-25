import { MessageSquare, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '../../../components/ui';
import { formatMessageTime } from '../utils/messageFormatting';

export function MessagingThread({ application, messages, draftMessage, onDraftChange, onSendMessage }) {
  const hasUnread = messages.some((m) => m.unread || (m.sender === application?.candidateName && !m.read));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (draftMessage.trim()) {
        onSendMessage(e);
      }
    }
  };

  return (
    <Card className="flex h-full flex-col border border-secondary-100 bg-white/75 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55">
      <CardHeader className="mb-2.5 flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-h4 text-secondary-900 dark:text-white">
            <MessageSquare size={18} strokeWidth={1.75} />
            Messaging
          </CardTitle>
          <CardDescription>Direct candidate chat thread</CardDescription>
        </div>
        {hasUnread && (
          <span className="flex items-center gap-1.5 rounded-full bg-primary-500/10 px-2.5 py-1 text-caption font-semibold text-primary-600 dark:bg-primary-500/20 dark:text-primary-300">
            <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            Unread
          </span>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 min-h-0 flex-col space-y-3.5">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((message) => {
            const isRecruiter = typeof message.isMine === 'boolean'
              ? message.isMine
              : message.sender !== application.candidateName;

            return (
              <div
                key={message.id}
                className={['flex flex-col', isRecruiter ? 'items-end' : 'items-start'].join(' ')}
              >
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-caption font-semibold text-secondary-600 dark:text-secondary-400">
                    {isRecruiter ? 'You (Recruiter)' : message.sender}
                  </span>
                  <span className="text-[10px] text-secondary-400">
                    {formatMessageTime(message.sentAt)}
                  </span>
                </div>
                <div
                  className={[
                    'max-w-[85%] rounded-2xl px-4 py-3 text-body-sm shadow-sm transition-all',
                    isRecruiter
                      ? 'rounded-tr-md bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-primary-500/20'
                      : 'rounded-tl-md border border-secondary-100 bg-secondary-100 text-secondary-900 dark:border-white/10 dark:bg-secondary-800 dark:text-secondary-100',
                  ].join(' ')}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div className="py-10 text-center text-body-sm text-secondary-400">
              No messages yet. Send a message to start candidate outreach!
            </div>
          )}
        </div>

        <form className="mt-auto flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5 border-t border-secondary-100 pt-3.5 dark:border-white/10" onSubmit={onSendMessage}>
          <textarea
            value={draftMessage}
            onChange={onDraftChange}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder={`Type a message to ${application.candidateName}...`}
            className="flex-1 min-h-[64px] max-h-[140px] resize-none rounded-xl border border-secondary-200 bg-white p-3 text-body-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-white/10 dark:bg-secondary-900 dark:text-white dark:placeholder:text-secondary-500"
          />
          <Button
            type="submit"
            variant={draftMessage.trim() ? 'primary' : 'outline'}
            size="md"
            leftIcon={<Send size={15} strokeWidth={1.75} />}
            disabled={!draftMessage.trim()}
            className="w-full sm:w-auto sm:min-w-24 shrink-0 rounded-xl px-5 h-11 sm:h-12"
          >
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
