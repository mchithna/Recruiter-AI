import { MessageSquare, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '../../../components/ui';
import { formatMessageTime } from '../utils/messageFormatting';

export function MessagingThread({ application, messages, draftMessage, onDraftChange, onSendMessage }) {
  return (
    <Card className="flex h-full flex-col border border-secondary-100 bg-white/70 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <CardHeader className="mb-2.5">
        <div>
          <CardTitle className="flex items-center gap-2 text-h4">
            <MessageSquare size={18} strokeWidth={1.75} />
            Messaging
          </CardTitle>
          <CardDescription>Phase R5 workspace</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 min-h-0 flex-col space-y-3.5">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((message) => {
            const isRecruiter = typeof message.isMine === 'boolean'
              ? message.isMine
              : message.sender !== application.candidateName;

            return (
              <article
                key={message.id}
                className={[
                  'rounded-2xl border px-3.5 py-2.5 shadow-sm transition-colors',
                  isRecruiter
                    ? 'border-primary-100 bg-white text-secondary-800 dark:border-primary-400/20 dark:bg-primary-500/10 dark:text-white'
                    : 'border-secondary-100 bg-secondary-50/90 text-secondary-800 dark:border-white/10 dark:bg-white/10 dark:text-white',
                ].join(' ')}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-body-sm font-semibold text-secondary-900">
                    {message.sender}
                  </span>
                  <span className="text-caption font-semibold text-secondary-500">
                    {formatMessageTime(message.sentAt)}
                  </span>
                </div>
                <p className="mt-2 text-body-sm leading-relaxed text-inherit">
                  {message.body}
                </p>
              </article>
            );
          })}
          {messages.length === 0 && (
             <div className="text-center text-secondary-500 py-8">
               No messages yet.
             </div>
          )}
        </div>

        <form className="mt-auto flex items-end gap-3 border-t border-secondary-100 pt-3.5 dark:border-white/10" onSubmit={onSendMessage}>
          <Input
            value={draftMessage}
            onChange={onDraftChange}
            placeholder={`Message ${application.candidateName}`}
            className="flex-1 recruiter-compose-input"
          />
          <Button
            type="submit"
            variant={draftMessage.trim() ? 'primary' : 'outline'}
            size="md"
            leftIcon={<Send size={14} strokeWidth={1.75} />}
            disabled={!draftMessage.trim()}
            className="min-w-24 rounded-xl px-5"
          >
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
