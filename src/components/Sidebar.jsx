import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, Plus, Search, CircleOff, Radar, CircleCheckBig } from 'lucide-react';
import BrandMark from './BrandMark';

function formatSizeLabel(model) {
  return model.sizeLabel || 'Unknown size';
}

export default function Sidebar({ open, onClose, onNewChat, quickActions, models, selectedModel, onSelectModel, ollamaConnected, ollamaMessage }) {
  const [searchValue, setSearchValue] = useState('');
  const [selectorOpen, setSelectorOpen] = useState(true);
  const filteredModels = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return models;
    }

    return models.filter((model) => model.name.toLowerCase().includes(query));
  }, [models, searchValue]);

  const selected = models.find((model) => model.name === selectedModel);

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

      <div className="mb-4 rounded-3xl border border-white/5 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">Local models</p>
            <p className="mt-1 text-sm text-white/70">{ollamaMessage}</p>
          </div>

          <span className={['inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.22em]', ollamaConnected ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5 text-white/45'].join(' ')}>
            {ollamaConnected ? <CircleCheckBig className="h-3.5 w-3.5" /> : <CircleOff className="h-3.5 w-3.5" />}
            {ollamaConnected ? 'Connected' : 'Offline'}
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
          <button
            type="button"
            onClick={() => setSelectorOpen((value) => !value)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/5"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-white">{selected?.name || 'Select a model'}</div>
              <div className="text-xs text-white/45">{selected ? `${formatSizeLabel(selected)}${selected.running ? ' · Running' : ''}` : 'Choose a local Ollama model'}</div>
            </div>
            <ChevronDown className={['h-4 w-4 shrink-0 text-white/45 transition-transform', selectorOpen ? 'rotate-180' : ''].join(' ')} />
          </button>

          <div className={selectorOpen ? 'mt-3 space-y-2' : 'mt-3 hidden'}>
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 focus-within:border-white/20">
              <Search className="h-4 w-4 shrink-0 text-white/35" />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search models"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
            </label>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {filteredModels.length > 0 ? filteredModels.map((model) => {
                const isSelected = model.name === selectedModel;
                return (
                  <button
                    key={model.name}
                    type="button"
                    onClick={() => onSelectModel(model.name)}
                    className={['flex w-full items-start justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition', isSelected ? 'border-cyan-400/30 bg-cyan-400/10 text-white' : 'border-white/5 bg-white/[0.02] text-white/75 hover:border-white/15 hover:bg-white/[0.04]'].join(' ')}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{model.name}</div>
                      <div className="mt-1 text-xs text-white/45">{formatSizeLabel(model)}</div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1 text-[11px] uppercase tracking-[0.22em] text-white/45">
                      <span className={model.running ? 'text-emerald-200' : 'text-white/35'}>{model.running ? 'Running' : 'Available'}</span>
                      {isSelected ? <span className="text-cyan-200">Selected</span> : null}
                    </div>
                  </button>
                );
              }) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/45">
                  No local models match your search.
                </div>
              )}
            </div>
          </div>
        </div>
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
        <p>Frontend interface for local text and image AI backends.</p>
      </div>
    </aside>
  );
}
