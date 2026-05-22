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

          <div ref={bottomRef} />
        </div>
      </div>
    </section>
  );
}
