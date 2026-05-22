import { Menu, Sparkles } from 'lucide-react';
import BrandMark from './BrandMark';

export default function Header({ status, hasMessages, selectedModel, ollamaConnected, onToggleSidebar }) {
  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-black/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:border-white/20 hover:bg-white/10 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <BrandMark showSubtitle={false} />
        </div>

        <div className="sm:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Local AI Workspace</p>
          <h1 className="text-lg font-semibold text-white sm:text-xl">ACE</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-white/60">
        <div className="flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.03] px-4 py-2">
          <Sparkles className="h-4 w-4 text-white/50" />
          <span>{hasMessages ? 'Active chat' : 'ACE ready'}</span>
          <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:inline-block" />
          <span className="hidden sm:inline">{status}</span>
        </div>

        <div className={['rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.22em]', ollamaConnected ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-white/5 bg-white/[0.03] text-white/45'].join(' ')}>
          {selectedModel || 'No model selected'}
        </div>
      </div>
    </header>
  );
}
