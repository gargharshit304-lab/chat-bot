import { ChevronLeft, History, Plus, Settings } from 'lucide-react';
import BrandMark from './BrandMark';

export default function Sidebar({ open, onClose, onNewChat }) {
  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-30 flex w-[290px] flex-col border-r border-white/5 bg-black/95 px-4 py-5 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ].join(' ')}
    >
      <div className="mb-5 flex items-center justify-between">
        <BrandMark />

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 p-2 text-white/70 transition hover:border-white/20 hover:bg-white/5 lg:hidden"
          aria-label="Close sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onNewChat}
        className="mb-4 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
      >
        <Plus className="h-4 w-4" />
        New chat
      </button>

      <div className="space-y-2">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-left text-sm text-white/70 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
        >
          <History className="h-4 w-4" />
          Chat history
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-left text-sm text-white/70 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

      <div className="mt-auto rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 text-xs text-white/45">
        <p className="mb-1 font-medium text-white/70">ACE</p>
        <p>Frontend interface for local text and image AI backends.</p>
      </div>
    </aside>
  );
}
