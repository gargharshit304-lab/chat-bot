import { useMemo, useState } from 'react';
import { ChevronLeft, Clock3, History, MoreHorizontal, PencilLine, Plus, Search, Settings, Trash2 } from 'lucide-react';
import BrandMark from './BrandMark';

function formatChatTime(timestamp) {
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return 'now';
  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))}m ago`;
  if (diff < day) return `${Math.max(1, Math.round(diff / hour))}h ago`;
  if (diff < 7 * day) return `${Math.max(1, Math.round(diff / day))}d ago`;

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getSectionLabel(updatedAt) {
  const now = new Date();
  const date = new Date(updatedAt);

  const sameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const diff = now.getTime() - date.getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  if (sameDay) return 'Recent';
  if (isYesterday) return 'Yesterday';
  if (diff < sevenDays) return 'Last 7 Days';
  return 'Earlier';
}

function getPreview(chat) {
  const lastUser = [...(chat.messages || [])].reverse().find((message) => message.role === 'user');
  const lastAssistant = [...(chat.messages || [])].reverse().find((message) => message.role === 'assistant');
  const preview = lastAssistant?.content || lastUser?.content || 'Start a new conversation';
  return preview.replace(/\s+/g, ' ').trim();
}

function groupChats(chats) {
  const sorted = [...chats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const groups = sorted.reduce((accumulator, chat) => {
    const label = getSectionLabel(chat.updatedAt || chat.createdAt);
    if (!accumulator[label]) {
      accumulator[label] = [];
    }
    accumulator[label].push(chat);
    return accumulator;
  }, {});

  return [
    ['Recent', groups.Recent || []],
    ['Yesterday', groups.Yesterday || []],
    ['Last 7 Days', groups['Last 7 Days'] || []],
    ['Earlier', groups.Earlier || []]
  ].filter(([, items]) => items.length > 0);
}

export default function Sidebar({ open, onClose, onNewChat, chats = [], activeChatId, onSelectChat, onRenameChat, onDeleteChat }) {
  const [searchValue, setSearchValue] = useState('');
  const filteredChats = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return chats;
    }

    return chats.filter((chat) => {
      const title = (chat.title || '').toLowerCase();
      const preview = getPreview(chat).toLowerCase();
      return title.includes(query) || preview.includes(query);
    });
  }, [chats, searchValue]);

  const groupedChats = useMemo(() => groupChats(filteredChats), [filteredChats]);

  const handleRename = (chat) => {
    const nextTitle = window.prompt('Rename chat', chat.title || 'New Chat');
    if (nextTitle === null) {
      return;
    }

    onRenameChat(chat.id, nextTitle);
  };

  const handleDelete = (chat) => {
    const confirmed = window.confirm(`Delete "${chat.title || 'New Chat'}"?`);
    if (!confirmed) {
      return;
    }

    onDeleteChat(chat.id);
  };

  const emptyState = searchValue.trim() ? 'No chats match your search.' : 'No chats yet. Start a new conversation.';

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-30 flex w-[310px] flex-col border-r border-white/5 bg-black px-4 py-5 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ].join(' ')}
    >
      <div className="mb-4 flex items-center justify-between">
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
        className="mb-4 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
      >
        <Plus className="h-4 w-4" />
        New chat
      </button>

      <label className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 focus-within:border-white/20">
        <Search className="h-4 w-4 shrink-0 text-white/35" />
        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search chats..."
          className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
      </label>

      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/35">
        <History className="h-3.5 w-3.5" />
        Recent conversations
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="space-y-5">
          {groupedChats.map(([sectionLabel, sectionChats]) => (
            <div key={sectionLabel}>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/35">
                {sectionLabel}
              </div>

              <div className="space-y-1.5">
                {sectionChats.map((chat) => {
                  const isActive = chat.id === activeChatId;
                  const preview = getPreview(chat);

                  return (
                    <div
                      key={chat.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectChat(chat.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onSelectChat(chat.id);
                        }
                      }}
                      className={[
                        'group flex cursor-pointer items-start gap-3 rounded-xl px-3 py-3 transition duration-200',
                        isActive ? 'bg-white/[0.07] text-white' : 'text-white/75 hover:bg-white/[0.04] hover:text-white'
                      ].join(' ')}
                    >
                      <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg border border-white/10 bg-black/35" />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium leading-5">{chat.title || 'New Chat'}</div>
                            <div className="mt-1 line-clamp-1 text-sm leading-5 text-white/45 group-hover:text-white/60">
                              {preview}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRename(chat);
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/55 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                              aria-label={`Rename ${chat.title || 'chat'}`}
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDelete(chat);
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/55 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-200"
                              aria-label={`Delete ${chat.title || 'chat'}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-white/35">
                          <span>{formatChatTime(chat.updatedAt || chat.createdAt)}</span>
                          <span className={['inline-flex h-2 w-2 rounded-full', isActive ? 'bg-emerald-400' : 'bg-white/20'].join(' ')} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {groupedChats.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/45">
              {emptyState}
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        className="mt-4 inline-flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-left text-sm text-white/70 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
      >
        <Settings className="h-4 w-4" />
        Settings
      </button>

      <div className="mt-auto rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-4 text-xs text-white/45">
        <p className="mb-1 font-medium text-white/70">ACE</p>
        <p>Frontend interface for local text and image AI backends.</p>
      </div>
    </aside>
  );
}
