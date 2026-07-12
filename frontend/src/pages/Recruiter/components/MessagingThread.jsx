import { MessageSquare, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '../../../components/ui';
import { formatMessageTime } from '../utils/messageFormatting';

export function MessagingThread({ application, messages, draftMessage, onDraftChange, onSendMessage }) {
  return (
    <Card className="border border-secondary-100 bg-secondary-50/60 flex flex-col h-full">
      <CardHeader className="mb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-h4">
            <MessageSquare size={18} strokeWidth={1.75} />
            Messaging
          </CardTitle>
          <CardDescription>Phase R5 workspace</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 space-y-4 min-h-0">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((message) => {
            const isRecruiter = message.sender !== application.candidateName;

            return (
              <article
                key={message.id}
                className={[
                  'rounded-card border p-3',
                  isRecruiter
                    ? 'border-primary-100 bg-white'
                    : 'border-secondary-100 bg-secondary-100/70',
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
                <p className="mt-2 text-body-sm leading-relaxed text-secondary-700">
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

        <form className="flex flex-col gap-3 border-t border-secondary-100 pt-4 mt-auto" onSubmit={onSendMessage}>
          <Input
            label="New Message"
            value={draftMessage}
            onChange={onDraftChange}
            placeholder={`Message ${application.candidateName}`}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            leftIcon={<Send size={14} strokeWidth={1.75} />}
            disabled={!draftMessage.trim()}
          >
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
