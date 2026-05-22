import { Sparkles } from 'lucide-react';
import BrandMark from './BrandMark';

export default function EmptyState({ onNewChat }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-6 py-10">
      <div className="max-w-2xl text-center animate-fadeUp">
        <div className="mx-auto mb-6 flex justify-center">
          <BrandMark centered />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">ACE is ready for local models</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
          Connect Ollama, pick a model from the sidebar, and start a private chat that streams responses as they generate.
        </p>
        <button
          type="button"
          onClick={onNewChat}
          className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
        >
          New chat
        </button>
      </div>
    </div>
  );
}
