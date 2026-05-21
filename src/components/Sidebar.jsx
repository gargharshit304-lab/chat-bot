import { Plus, ChevronLeft } from 'lucide-react';
import BrandMark from './BrandMark';

export default function Sidebar({ open, onClose, onNewChat, quickActions }) {
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

      <div className="mb-5 rounded-3xl border border-white/5 bg-white/[0.03] p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/45">Workspace</p>
        <p className="text-sm leading-6 text-white/75">
          A minimal, premium chat surface with fixed layout, independent message scrolling, and markdown support.
        </p>
      </div>

      <div className="space-y-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-left text-sm text-white/70 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </button>
          );
        })}
      </div>

      <div className="mt-auto rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 text-xs text-white/45">
        <p className="mb-1 font-medium text-white/70">ACE</p>
        <p>Local AI Workspace for focused, private conversations.</p>
      </div>
    </aside>
  );
}
