import { useState } from 'react';
import { SendHorizontal } from 'lucide-react';

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (disabled) {
      return;
    }
    const nextValue = value.trim();
    if (!nextValue) return;
    onSend(nextValue);
    setValue('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit(event);
    }
  };

  return (
    <form onSubmit={submit} className="sticky bottom-0 z-20 border-t border-white/5 bg-gradient-to-t from-black via-black to-transparent px-4 pb-4 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl items-end gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3 shadow-glow backdrop-blur-xl">
        <textarea
          rows={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message the assistant..."
          disabled={disabled}
          className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-6 text-white placeholder:text-white/35 focus:outline-none sm:text-[15px]"
        />

        <button
          type="submit"
          disabled={disabled}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black transition hover:scale-[1.02] hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
