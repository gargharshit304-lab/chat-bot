import MessageBubble from './MessageBubble';
import EmptyState from './EmptyState';

export default function ChatArea({ messages, isTyping, messagesRef, bottomRef, onNewChat }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-black">
      <div ref={messagesRef} className="messages-scroll flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 pb-4">
          {messages.length === 0 ? <EmptyState onNewChat={onNewChat} /> : null}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isTyping ? (
            <div className="flex w-full gap-3 animate-fadeUp">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-glow">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-pulseDots rounded-full bg-white/60" />
                  <span className="h-1.5 w-1.5 animate-pulseDots rounded-full bg-white/60 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulseDots rounded-full bg-white/60 [animation-delay:300ms]" />
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white/55 shadow-glow">
                ACE is thinking...
              </div>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>
      </div>
    </section>
  );
}
